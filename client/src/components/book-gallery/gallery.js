import * as T from "three";
import { makeVolume, W, H, clamp, smooth } from "./volume.js";
import { getGalleryBooks } from "./catalog.js";
import assets from "./assets.json";

export function mountGallery(root, lang) {
  const english = lang === "en";
  const label = (zh, en) => (english ? en : zh);
  const defs = getGalleryBooks(lang);
  const host = root.host;
  const listeners = new AbortController();
  const { signal } = listeners;
  const $ = q => root.querySelector(q);
  const stage = $(".stage"),
    canvas = $(".scene"),
    backs = [...root.querySelectorAll(".backdrop")];
  const reduced = matchMedia("(prefers-reduced-motion: reduce)");
  const bookIds = ["flp", "growth", "zbs", "white-lyu"];
  const entry = new URLSearchParams(location.search);
  const languageLink = $(".language");
  const small = () => matchMedia("(max-width:680px)").matches;
  const mix = T.MathUtils.lerp;
  let selected = 0,
    old = -1,
    layer = 0,
    selection = 1,
    desiredOpen = false,
    ready = false,
    night = false;
  let open = 0,
    spread = 0,
    face = 1,
    page = 1,
    spreadGoal = 0,
    faceGoal = 1,
    grab = -0.35,
    drag = null;
  let shelfMode = false,
    shelf = 0,
    shelfGoal = 0;
  const faceWeights = [1, 0, 0, 0];
  let detailsOpen = false;
  let lightMix = 0,
    raf = 0,
    lastTime = 0,
    renderer,
    camera,
    scene,
    key,
    fill,
    models,
    worldWidth,
    worldHeight,
    lastRect,
    backWall;
  const contact = [];
  const textures = {};
  let failed = false,
    pendingOpen = false;
  const btns = defs.map((d, i) => {
    const b = document.createElement("button");
    b.type = "button";
    b.textContent = d.short;
    b.onclick = () => select(i);
    $(".index").append(b);
    return b;
  });
  function background(div, d) {
    div.dataset.art = d.art;
    div.querySelector("img").src = assets[d.art + (small() ? "-m" : "-w")];
  }
  function updateInfo() {
    const d = defs[selected];
    $(".intro").textContent = d.title;
    $(".intro").lang = selected === 2 && !english ? "zh" : "en";
    $("#credit").textContent = d.credit;
    $("#open").textContent = failed
      ? d.linkLabel + "　↗︎"
      : d.action + (selected === 0 ? "　＋" : "　↗︎");
    $("#detail").textContent = detailsOpen
      ? label("收起介绍　−", "Hide details　−")
      : selected === 3
        ? label("出版故事　＋", "Publishing story　＋")
        : label("书的来历　＋", "About the book　＋");
    stage.dataset.art = d.art;
    host.toggleAttribute("data-dim", night);
    $(".caption small").textContent = d.sceneCredit || d.date;
    $(".artwork-source").hidden = !d.sceneCredit;
    $(".artwork-source a").textContent = label(
      "背景画作 · 美国国家美术馆 ↗︎",
      "Background painting · National Gallery of Art ↗︎"
    );
    $(".caption p").textContent = d.caption;
    if (detailsOpen) $(".readingtext figure img").src = assets[d.art];
    $(".readingtext figure img").alt = d.date;
    $(".readingtext figcaption").textContent = d.date;
    $(".info-meta").textContent = d.credit;
    $(".readingtext h2").textContent = d.head;
    $(".readingtext p").textContent = d.desc;
    $(".book-link").href = d.link;
    $(".book-link").textContent = d.linkLabel + " ↗︎";
    btns.forEach((b, i) =>
      b.setAttribute("aria-pressed", String(i === selected))
    );
    $(".poster").src = assets[d.cover];
    $(".poster").alt = d.title;
    host.style.setProperty("--ground", night ? "#222721" : d.ground);
    host.style.setProperty("--ink", night ? "#e5e1cc" : d.ink);
  }
  function select(i) {
    if (i === selected || desiredOpen || open > 0.002) return;
    pendingOpen = false;
    old = selected;
    selected = i;
    selection = 0;
    layer = 1 - layer;
    background(backs[layer], defs[i]);
    backs[layer].style.opacity = 1;
    backs[1 - layer].style.opacity = 0;
    updateInfo();
    updateAddress();
    wake();
  }
  function updateAddress() {
    const next = new URL(location.href);
    next.searchParams.set("book", bookIds[selected]);
    if (desiredOpen) next.searchParams.set("page", String(page));
    else next.searchParams.delete("page");
    next.hash = "";
    history.replaceState(history.state, "", next);
    languageLink.search = next.search;
  }
  function readerControls() {
    const isSmall = small();
    const spreadIndex = Math.floor(page / 2);
    $(".reader-controls").hidden = !desiredOpen;
    for (const id of ["#credit", "#open", "#detail"])
      $(id).hidden = desiredOpen;
    $("#prev").disabled = spreadIndex === 0;
    $("#next").disabled = isSmall ? page >= 5 : spreadIndex >= 2;
    $(".folio").textContent = isSmall
      ? "The Prize　·　" + page + " / 5"
      : "The Prize　·　" +
        (spreadIndex ? spreadIndex * 2 + "–" + (spreadIndex * 2 + 1) : "1");
  }
  function setPage(n) {
    page = n;
    spreadGoal = Math.floor(n / 2);
    faceGoal = n % 2 ? 1 : -1;
    updateAddress();
    readerControls();
    wake();
  }
  function adjacent(direction) {
    return small()
      ? Math.max(1, Math.min(5, page + direction))
      : 1 + 2 * Math.max(0, Math.min(2, Math.floor(page / 2) + direction));
  }
  function read(on) {
    if (on && (failed || selected !== 0)) {
      location.href = defs[selected].link;
      return;
    }
    if (on && !ready) {
      pendingOpen = true;
      return;
    }
    if (on && detailsOpen) showDetails(false);
    desiredOpen = on;
    drag = null;
    shelfGoal = on ? 1 : shelfMode ? 1 : 0;
    $("#shelf").hidden = on;
    if (on) {
      page = 1;
      spreadGoal = 0;
      faceGoal = 1;
    }
    readerControls();
    updateAddress();
    stage.classList.toggle("reading", on);
    host.classList.toggle("read", on);
    if (on)
      requestAnimationFrame(() => {
        if (!signal.aborted && small())
          window.scrollTo({ top: 0, behavior: "instant" });
      });
    wake();
  }
  $("#shelf").onclick = () => {
    if (desiredOpen) return;
    shelfMode = !shelfMode;
    shelfGoal = shelfMode ? 1 : 0;
    $("#shelf").setAttribute("aria-pressed", String(shelfMode));
    $("#shelf").textContent = shelfMode
      ? label("回到封面", "View cover")
      : label("看书架", "Bookshelf");
    wake();
  };
  $("#open").onclick = () => read(true);
  $("#close").onclick = () => read(false);
  $("#prev").onclick = () => setPage(adjacent(-1));
  $("#next").onclick = () => setPage(adjacent(1));
  function showDetails(on) {
    detailsOpen = on;
    $(".exhibit").classList.toggle("detail", on);
    $("#details").hidden = !on;
    $("#detail").setAttribute("aria-expanded", String(on));
    updateInfo();
    wake();
    if (on) {
      $("#details").focus({ preventScroll: true });
      if (small())
        $("#details").scrollIntoView({
          behavior: reduced.matches ? "instant" : "smooth",
        });
    } else if (small()) window.scrollTo({ top: 0, behavior: "instant" });
  }
  $("#detail").setAttribute("aria-controls", "details");
  $("#detail").setAttribute("aria-expanded", "false");
  $("#detail").onclick = () => showDetails(!detailsOpen);
  $(".skip").onclick = e => {
    e.preventDefault();
    if (desiredOpen) read(false);
    showDetails(true);
  };
  $("#light").onclick = () => {
    night = !night;
    $("#light").setAttribute("aria-pressed", String(night));
    $("#lightLabel").textContent = night
      ? label("调亮灯光", "Brighten")
      : label("调暗灯光", "Dim lights");
    updateInfo();
    wake();
  };
  document.addEventListener(
    "keydown",
    e => {
      if (e.target !== host && e.target !== document.body) return;
      const bounds = host.getBoundingClientRect();
      if (bounds.bottom < innerHeight * 0.45 || bounds.top > innerHeight * 0.55)
        return;
      if (e.metaKey || e.altKey || e.ctrlKey || e.shiftKey) return;
      if (e.key === "Escape" && detailsOpen) {
        showDetails(false);
        $("#detail").focus({ preventScroll: true });
      }
      if (e.key === "Escape" && desiredOpen) {
        read(false);
        $("#open").focus({ preventScroll: true });
      }
      if (!["ArrowLeft", "ArrowRight"].includes(e.key)) return;
      e.preventDefault();
      const dir = e.key === "ArrowLeft" ? -1 : 1;
      if (desiredOpen) setPage(adjacent(dir));
      else select((selected + dir + defs.length) % defs.length);
    },
    { signal }
  );
  function wake() {
    if (signal.aborted || !ready || raf) return;
    lastTime = performance.now();
    raf = requestAnimationFrame(frame);
  }
  function approach(a, b, rate, dt) {
    if (reduced.matches || Math.abs(a - b) < 0.00055) return b;
    return mix(a, b, 1 - Math.exp(-rate * dt));
  }
  function frame(now) {
    raf = 0;
    const dt = Math.min(0.08, Math.max(0.001, (now - lastTime) / 1000));
    lastTime = now;
    const step = reduced.matches ? 1 : dt / (desiredOpen ? 1.58 : 1.34);
    open = Math.min(1, Math.max(0, open + (desiredOpen ? step : -step)));
    if (!desiredOpen && open < 0.78) {
      spreadGoal = 0;
      faceGoal = 1;
    }
    if (!drag) {
      spread = approach(spread, spreadGoal, 8.6, dt);
      face = approach(face, faceGoal, 8, dt);
    }
    selection = Math.min(1, selection + (reduced.matches ? 1 : dt / 0.92));
    shelf = approach(shelf, shelfGoal, 5.0, dt);
    for (let i = 0; i < 4; i++)
      faceWeights[i] = approach(
        faceWeights[i],
        i === selected ? 1 : 0,
        6.4,
        dt
      );
    lightMix = approach(lightMix, night ? 1 : 0, 5, dt);
    draw();
    if (
      open !== (desiredOpen ? 1 : 0) ||
      shelf !== shelfGoal ||
      faceWeights.some((w, i) => w !== (i === selected ? 1 : 0)) ||
      selection < 1 ||
      lightMix !== (night ? 1 : 0) ||
      (!drag && (spread !== spreadGoal || face !== faceGoal))
    )
      raf = requestAnimationFrame(frame);
  }
  function draw() {
    const r = stage.getBoundingClientRect();
    if (!r.width || !r.height) return;
    const aspect = r.width / r.height;
    if (!lastRect || lastRect[0] !== r.width || lastRect[1] !== r.height) {
      renderer.setSize(r.width, r.height, false);
      lastRect = [r.width, r.height];
    }
    const m = small(),
      o = smooth(open);
    const display = Math.max(
      H / (m ? 0.65 : 0.87),
      W / (aspect * (m ? 0.54 : 0.49))
    );
    const readWidth = m ? W * 0.85 : W * 2.15;
    const readHeight = Math.max(H / (m ? 1.07 : 0.91), readWidth / aspect);
    worldHeight = mix(display, readHeight, o);
    worldWidth = worldHeight * aspect;
    camera.aspect = aspect;
    camera.position.z =
      worldHeight / (2 * Math.tan(T.MathUtils.degToRad(camera.fov / 2))) + 0.12;
    camera.updateProjectionMatrix();
    const paperFocus = m ? -W * 0.5 * face * smooth((open - 0.62) / 0.38) : 0;
    const targetX = mix(
      worldWidth * (m ? 0.18 : 0.175) - W * 0.46,
      paperFocus,
      o
    );
    const e = smooth(selection),
      dir = selected > old ? 1 : -1;
    const widths = defs.map((d, i) => {
      const theta = mix(i === 0 || i === 3 ? 1.25 : 1.12, 0.07, faceWeights[i]);
      return (
        Math.cos(theta) * (d.width || W) + Math.sin(theta) * (d.depth || 0.15)
      );
    });
    const shelfScale = m
      ? Math.min(1, worldWidth / (widths.reduce((a, b) => a + b, 0) + 0.22))
      : 0.97;
    let spineX = (-(widths.reduce((a, b) => a + b, 0) + 0.12) * shelfScale) / 2;
    for (let i = 0; i < models.length; i++) {
      const { root, shape } = models[i],
        weight = faceWeights[i];
      root.visible =
        i === selected || (i === old && selection < 1) || shelf > 0.001;
      const shelfX = spineX;
      spineX += (widths[i] + 0.04) * shelfScale;
      if (!root.visible) continue;
      const delta =
        i === selected ? 1 - e : i === old ? -e : i < selected ? -1 : 1;
      const displayX = targetX + delta * dir * worldWidth * 1.18;
      const retreat =
        i === selected ? 0 : (i < selected ? -1 : 1) * worldWidth * o * 0.93;
      const inShelf = shelf * (1 - (i === selected ? o : 0));
      root.position.set(
        mix(displayX, shelfX + retreat, inShelf),
        mix(
          m && (i === 0 || i === 3)
            ? -worldHeight * 0.05 * (1 - shelf)
            : -0.025,
          -0.016,
          o
        ),
        mix(
          mix(0.22, 0.015, o) + Math.sin(PI * open) * 0.24,
          -0.11 + 0.24 * weight,
          inShelf
        )
      );
      root.scale.setScalar(mix(1, shelfScale, inShelf));
      root.rotation.set(
        mix(0.08, -0.025, o) * (1 - inShelf),
        mix(
          mix(0.36, -0.018, o) - delta * dir * 0.83,
          mix(i === 0 || i === 3 ? 1.25 : 1.12, 0.07, weight),
          inShelf
        ),
        mix(-0.049, 0.003, o) * (1 - inShelf),
        "ZYX"
      );
      // Keep the binding visible even at the ends of a short shelf, where perspective
      // would otherwise align the far cover with the camera's sight line.
      root.rotation.y -= Math.atan(shelfX / camera.position.z) * inShelf;
      root.position.y -=
        (H - (defs[i].height || H)) * 0.5 * inShelf * shelfScale;
      if (i === 0) shape(open, spread, grab);
    }
    for (
      let i = 0,
        center = (-(widths.reduce((a, b) => a + b, 0) + 0.12) * shelfScale) / 2;
      i < 4;
      i++
    ) {
      const patch = contact[i];
      patch.material.opacity = 0.23 * shelf * (1 - o);
      patch.position.set(
        center + (widths[i] * shelfScale) / 2,
        (-H * shelfScale) / 2 - 0.025,
        -0.16
      );
      patch.scale.set((widths[i] + 0.35) * shelfScale, 0.2 * shelfScale, 1);
      center += (widths[i] + 0.04) * shelfScale;
    }
    backWall.material.opacity = 0.14 * (1 - shelf * (1 - o));
    key.position.set(
      mix(-2.6, -1.1, lightMix),
      mix(3.4, 1.85, lightMix),
      mix(5.5, 3.1, lightMix)
    );
    key.color.set(night ? "#ffe1ac" : "#fff8eb");
    key.intensity = mix(1.78, 1.18, lightMix);
    fill.intensity = mix(1.78, 1.04, lightMix);
    $(".veil").style.backgroundColor = night ? "#575248" : "#c9c7bb";
    $(".veil").style.opacity = String(Math.max(o * 0.995, shelf * 0.985));
    for (const back of backs)
      back.style.filter = "brightness(" + mix(1, 0.52, lightMix) + ")";
    $(".caption").style.opacity = String(
      (1 - smooth(open / 0.27)) * (1 - shelf)
    );
    canvas.style.cursor = desiredOpen ? "grab" : "pointer";
    renderer.render(scene, camera);
  }
  const PI = Math.PI;
  function pointerDown(e) {
    if (e.button !== 0 || !ready) return;
    const r = stage.getBoundingClientRect();
    if (!desiredOpen) {
      const ray = new T.Raycaster();
      ray.setFromCamera(
        {
          x: ((e.clientX - r.left) / r.width) * 2 - 1,
          y: 1 - (2 * (e.clientY - r.top)) / r.height,
        },
        camera
      );
      const candidates =
        shelf > 0.5
          ? models
              .map((vol, i) => ({
                i,
                d: ray.intersectObject(vol.root, true)[0]?.distance ?? Infinity,
              }))
              .sort((a, b) => a.d - b.d)
          : [
              {
                i: selected,
                d:
                  ray.intersectObject(models[selected].root, true)[0]
                    ?.distance ?? Infinity,
              },
            ];
      if (Number.isFinite(candidates[0].d)) {
        drag = {
          cover: true,
          book: candidates[0].i,
          x: e.clientX,
          y: e.clientY,
        };
        canvas.setPointerCapture(e.pointerId);
      }
      return;
    }
    if (open < 0.97) return;
    drag = {
      x: e.clientX,
      y: e.clientY,
      fromPage: page,
      start: spreadGoal,
      startFace: faceGoal,
      lastX: e.clientX,
      lastT: e.timeStamp,
      v: 0,
      intent: 0,
      fraction: 0,
    };
    grab = clamp(1 - (e.clientY - r.top) / r.height) - 0.5;
    canvas.setPointerCapture(e.pointerId);
    canvas.style.cursor = "grabbing";
  }
  function pointerMove(e) {
    if (!drag || drag.cover) return;
    const dx = drag.x - e.clientX,
      dy = Math.abs(e.clientY - drag.y);
    if (!drag.intent && Math.abs(dx) > 5 && Math.abs(dx) > dy * 0.65)
      drag.intent = Math.sign(dx);
    if (!drag.intent) return;
    const dest = adjacent(drag.intent);
    if (dest === page) return;
    const pixels = (stage.clientWidth / worldWidth) * W;
    const f = clamp((dx * drag.intent) / (pixels * 0.88));
    drag.fraction = f;
    drag.v = (drag.lastX - e.clientX) / Math.max(1, e.timeStamp - drag.lastT);
    drag.lastT = e.timeStamp;
    drag.lastX = e.clientX;
    spread = mix(drag.start, Math.floor(dest / 2), f);
    face = mix(drag.startFace, dest % 2 ? 1 : -1, smooth(f));
    draw();
  }
  function pointerUp(e, cancel = false) {
    if (!drag) return;
    const d = drag;
    drag = null;
    if (d.cover) {
      if (!cancel && Math.hypot(e.clientX - d.x, e.clientY - d.y) < 9) {
        if (d.book === selected) read(true);
        else select(d.book);
      }
      return;
    }
    if (
      !cancel &&
      d.intent &&
      (d.fraction > 0.32 ||
        (d.fraction > 0.1 &&
          d.v * d.intent > 0.56 &&
          e.timeStamp - d.lastT < 100))
    )
      setPage(adjacent(d.intent));
    else if (
      !cancel &&
      !d.intent &&
      Math.hypot(e.clientX - d.x, e.clientY - d.y) < 8
    ) {
      const r = stage.getBoundingClientRect();
      setPage(adjacent(e.clientX - r.left > r.width * 0.45 ? 1 : -1));
    }
    wake();
  }
  canvas.addEventListener("pointerdown", pointerDown);
  canvas.addEventListener("pointermove", pointerMove);
  canvas.addEventListener("pointerup", e => pointerUp(e));
  canvas.addEventListener("pointercancel", e => pointerUp(e, true));
  background(backs[0], defs[0]);
  updateInfo();
  readerControls();
  const observer = new ResizeObserver(wake);
  observer.observe(stage);
  window.addEventListener(
    "resize",
    () => {
      background(backs[layer], defs[selected]);
      readerControls();
      wake();
    },
    { signal }
  );
  async function init() {
    renderer = new T.WebGLRenderer({
      canvas,
      alpha: true,
      antialias: true,
      powerPreference: "high-performance",
    });
    renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
    renderer.setClearColor(0, 0);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = T.VSMShadowMap;
    scene = new T.Scene();
    camera = new T.PerspectiveCamera(30, 1, 0.1, 40);
    camera.position.z = 8;
    fill = new T.HemisphereLight("#fffbef", "#c6ccc7", 1.9);
    scene.add(fill);
    key = new T.DirectionalLight("#fff3df", 2);
    key.castShadow = true;
    key.shadow.mapSize.set(1024, 1024);
    key.shadow.radius = 4;
    key.shadow.blurSamples = 8;
    Object.assign(key.shadow.camera, {
      left: -5,
      right: 5,
      top: 4,
      bottom: -4,
      near: 0.5,
      far: 15,
    });
    key.shadow.normalBias = 0.002;
    key.shadow.bias = -0.00017;
    scene.add(key, key.target);
    const surface = new T.Mesh(
      new T.PlaneGeometry(30, 20),
      new T.ShadowMaterial({ opacity: 0.16 })
    );
    surface.position.z = -0.18;
    surface.receiveShadow = true;
    surface.material.depthWrite = false;
    scene.add(surface);
    backWall = surface;
    const contactMap = document.createElement("canvas");
    contactMap.width = 160;
    contactMap.height = 64;
    const ctx = contactMap.getContext("2d");
    ctx.scale(80, 32);
    const grad = ctx.createRadialGradient(1, 1, 0.05, 1, 1, 1);
    grad.addColorStop(0, "rgba(38,32,27,.86)");
    grad.addColorStop(0.52, "rgba(38,32,27,.42)");
    grad.addColorStop(1, "rgba(38,32,27,0)");
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 2, 2);
    const map = new T.CanvasTexture(contactMap);
    for (let i = 0; i < 4; i++) {
      const patch = new T.Mesh(
        new T.PlaneGeometry(1, 1),
        new T.MeshBasicMaterial({
          map,
          transparent: true,
          depthWrite: false,
          opacity: 0,
        })
      );
      contact.push(patch);
      scene.add(patch);
    }
    const loader = new T.TextureLoader();
    const names = [
      "cover",
      "flp-back",
      "flp-spine",
      "growth",
      "real",
      "white",
      "white-spine",
      ...Array.from({ length: 12 }, (_, i) => "p" + (i + 2)),
    ];
    await Promise.all(
      names.map(async name => {
        const texture = await loader.loadAsync(assets[name]);
        if (signal.aborted || failed) {
          texture.dispose();
          return;
        }
        texture.colorSpace = T.SRGBColorSpace;
        texture.anisotropy = Math.min(
          8,
          renderer.capabilities.getMaxAnisotropy()
        );
        textures[name] = texture;
      })
    );
    if (signal.aborted) return;
    models = defs.map((d, i) => {
      const model = makeVolume(d, textures, i === 0);
      scene.add(model.root);
      return model;
    });
    ready = true;
    $(".poster").hidden = true;
    $("#shelf").hidden = false;
    $("#light").hidden = false;
    draw();
    host.dataset.mode = "interactive";
    const saved = Number(entry.get("page"));
    if (selected === 0 && Number.isInteger(saved) && saved >= 1 && saved <= 5) {
      read(true);
      setPage(saved);
    } else if (pendingOpen) read(true);
  }

  const chosen = bookIds.indexOf(entry.get("book"));
  if (chosen > 0) select(chosen);
  languageLink.search = location.search;
  function disposeScene() {
    const geometries = new Set(),
      materials = new Set(),
      maps = new Set(Object.values(textures));
    scene?.traverse(object => {
      if (object.geometry) geometries.add(object.geometry);
      for (const material of [object.material].flat().filter(Boolean)) {
        materials.add(material);
        if (material.map) maps.add(material.map);
      }
    });
    geometries.forEach(x => x.dispose());
    materials.forEach(x => x.dispose());
    maps.forEach(x => x.dispose());
    key?.shadow.dispose();
    renderer?.dispose();
  }
  function showStatic() {
    if (signal.aborted) return;
    failed = true;
    ready = false;
    cancelAnimationFrame(raf);
    raf = 0;
    if (desiredOpen) read(false);
    canvas.hidden = true;
    $(".poster").hidden = false;
    $("#shelf").hidden = true;
    $("#light").hidden = true;
    host.dataset.mode = "static";
    updateInfo();
    disposeScene();
    if (pendingOpen) location.href = defs[selected].link;
  }
  canvas.addEventListener("webglcontextlost", showStatic, {
    once: true,
    signal,
  });
  init().catch(showStatic);
  return () => {
    listeners.abort();
    observer.disconnect();
    cancelAnimationFrame(raf);
    if (!failed) disposeScene();
    host.classList.remove("read");
    delete host.dataset.mode;
  };
}
