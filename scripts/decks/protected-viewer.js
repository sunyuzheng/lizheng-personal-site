/* Passwords and decryption keys live only in this page's memory. No analytics or third-party requests. */
(async () => {
  const byId = id => document.getElementById(id);
  const scriptUrl = document.currentScript?.src || document.querySelector('script[src$="viewer.js"]').src;
  const base = new URL(".", scriptUrl);
  const gate = byId("gate"), viewer = byId("viewer"), error = byId("error"), status = byId("status");
  let config, key, manifest, index = -1, serial = 0;
  const objectUrls = new Map();
  const pending = new Map();
  const bytes = value => Uint8Array.from(atob(value), ch => ch.charCodeAt(0));
  async function get(file) {
    const result = await fetch(new URL(file, base), { cache: "no-store", credentials: "omit" });
    if (!result.ok) throw new Error("network");
    return result.arrayBuffer();
  }
  async function decrypt(file, activeKey = key) {
    const data = new Uint8Array(await get(file));
    if (data.length < 28) throw new Error("truncated");
    return crypto.subtle.decrypt({ name: "AES-GCM", iv: data.subarray(0, 12) }, activeKey, data.subarray(12));
  }
  async function imageUrl(n) {
    if (objectUrls.has(n)) return objectUrls.get(n);
    if (!pending.has(n)) {
      pending.set(n, (async () => {
        const data = await decrypt(manifest.slides[n].file);
        const url = URL.createObjectURL(new Blob([data], { type: manifest.slides[n].type }));
        objectUrls.set(n, url);
        return url;
      })().finally(() => pending.delete(n)));
    }
    return pending.get(n);
  }
  async function show(n) {
    const current = ++serial;
    index = Math.max(0, Math.min(manifest.slides.length - 1, n));
    byId("previous").disabled = index === 0;
    byId("next").disabled = index === manifest.slides.length - 1;
    byId("count").textContent = `${index + 1} / ${manifest.slides.length}`;
    byId("stage").classList.add("loading");
    byId("retry").hidden = true;
    status.textContent = "正在载入…";
    try {
      const url = await imageUrl(index);
      if (current !== serial) return;
      byId("slide").src = url;
      byId("slide").hidden = false;
      byId("slide").alt = `第${index + 1}页，共${manifest.slides.length}页`;
      history.replaceState(null, "", `#${index + 1}`);
      status.textContent = "";
      if (index + 1 < manifest.slides.length) imageUrl(index + 1).catch(() => {});
    } catch {
      if (current === serial) {
        byId("slide").hidden = true;
        byId("retry").hidden = false;
        status.textContent = "这一页未能载入，请检查网络后重试。";
      }
    } finally {
      if (current === serial) byId("stage").classList.remove("loading");
    }
  }
  function validManifest(data) {
    return data.version === 1 && Array.isArray(data.slides) && data.slides.length > 0 && data.slides.length <= 99
      && data.slides.every((slide, i) => slide.file === `slide-${String(i + 1).padStart(2, "0")}.enc` && slide.type === "image/png")
      && data.pdf?.file === "handout.enc" && data.pdf.type === "application/pdf";
  }
  if (!crypto.subtle) {
    error.textContent = "请使用支持加密功能的浏览器，通过HTTPS打开本页。";
    byId("open").disabled = true;
    return;
  }
  try {
    config = JSON.parse(new TextDecoder().decode(await get("config.json")));
    if (config.version !== 1 || config.iterations !== 600000 || bytes(config.salt).length !== 16) throw new Error("config");
  } catch {
    error.textContent = "课件未能载入，请刷新重试。";
    byId("open").disabled = true;
    return;
  }
  byId("open").disabled = false;
  byId("unlock").addEventListener("submit", async event => {
    event.preventDefault();
    byId("open").disabled = true;
    error.textContent = "正在解锁…";
    try {
      const material = await crypto.subtle.importKey("raw", new TextEncoder().encode(byId("password").value), "PBKDF2", false, ["deriveKey"]);
      const candidate = await crypto.subtle.deriveKey({ name: "PBKDF2", salt: bytes(config.salt), iterations: config.iterations, hash: "SHA-256" }, material, { name: "AES-GCM", length: 256 }, false, ["decrypt"]);
      const data = JSON.parse(new TextDecoder().decode(await decrypt("manifest.enc", candidate)));
      if (!validManifest(data)) throw new Error("manifest");
      key = candidate;
      manifest = data;
      byId("password").value = "";
      error.textContent = "";
      gate.hidden = true;
      viewer.hidden = false;
      const requested = Number(location.hash.slice(1));
      await show(Number.isInteger(requested) && requested > 0 ? requested - 1 : 0);
      byId("lock").focus();
    } catch (issue) {
      error.textContent = issue.name === "OperationError" ? "密码不正确，请重试。" : "解锁失败，请检查网络后重试。";
      byId("password").select();
    } finally {
      byId("open").disabled = false;
    }
  });
  byId("previous").addEventListener("click", () => show(index - 1));
  byId("retry").addEventListener("click", () => show(index));
  byId("next").addEventListener("click", () => show(index + 1));
  byId("lock").addEventListener("click", () => location.reload());
  byId("fullscreen").addEventListener("click", async () => {
    try {
      if (document.fullscreenElement) await document.exitFullscreen();
      else await viewer.requestFullscreen();
    } catch { status.textContent = "当前浏览器不支持全屏。"; }
  });
  document.addEventListener("keydown", event => {
    if (viewer.hidden || event.altKey || event.ctrlKey || event.metaKey || event.target.tagName === "INPUT" || (event.target.tagName === "BUTTON" && event.key === " ")) return;
    const targets = { ArrowRight: index + 1, " ": index + 1, PageDown: index + 1, ArrowLeft: index - 1, PageUp: index - 1, Home: 0, End: manifest.slides.length - 1 };
    if (Object.hasOwn(targets, event.key)) { event.preventDefault(); show(targets[event.key]); }
  });
  let touchX = null;
  byId("stage").addEventListener("touchstart", event => { touchX = event.touches[0].clientX; }, { passive: true });
  byId("stage").addEventListener("touchend", event => {
    if (touchX !== null && Math.abs(event.changedTouches[0].clientX - touchX) > 50) show(index + (event.changedTouches[0].clientX < touchX ? 1 : -1));
    touchX = null;
  }, { passive: true });
  byId("download").addEventListener("click", async () => {
    byId("download").disabled = true;
    try {
      const data = await decrypt(manifest.pdf.file);
      const url = URL.createObjectURL(new Blob([data], { type: manifest.pdf.type }));
      const anchor = document.createElement("a");
      anchor.href = url;
      anchor.download = manifest.pdf.name;
      anchor.click();
      setTimeout(() => URL.revokeObjectURL(url), 60_000);
    } catch { status.textContent = "PDF下载失败，请检查网络后重试。"; }
    finally { byId("download").disabled = false; }
  });
  // A page restored from the back/forward cache must lock again.
  window.addEventListener("pageshow", event => { if (event.persisted) location.reload(); });
})();
