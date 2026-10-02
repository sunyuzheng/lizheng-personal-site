/** Node-only HTTP adapter: keep provider error bodies out of SDK console logging. */
import { AccessError } from "./ask-access.js";
const ORIGIN = "https://auth.superlinear.academy";
const DISCOVERY = "/oidc/.well-known/openid-configuration";
export function sanitizedLogtoRequester(appId: string, appSecret: string) {
  return async <T>(input: RequestInfo | URL, init?: RequestInit): Promise<T> => {
    const url = new URL(input instanceof Request ? input.url : String(input));
    if (url.origin !== ORIGIN || ![DISCOVERY, "/oidc/token"].includes(url.pathname) || url.search || url.hash)
      throw new AccessError("login_unavailable", 503, "blocked_url");
    const step = url.pathname === DISCOVERY ? "discovery" : "token";
    const headers = new Headers(init?.headers);
    if (url.pathname === "/oidc/token") headers.set("Authorization", `Basic ${Buffer.from(`${appId}:${appSecret}`).toString("base64")}`);
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 5_000);
    let reader: ReadableStreamDefaultReader<Uint8Array> | undefined;
    try {
      const response = await fetch(url, { ...init, headers, signal: controller.signal, cache: "no-store", redirect: "manual" });
      if (!response.ok || !response.body) {
        void response.body?.cancel().catch(() => {});
        throw new AccessError("login_unavailable", 503, `${step}_http_${response.status}`);
      }
      reader = response.body.getReader();
      let size = 0;
      const chunks: Uint8Array[] = [];
      const abort = () => { void reader?.cancel().catch(() => {}); };
      controller.signal.addEventListener("abort", abort, { once: true });
      try {
        while (true) {
          const { done, value } = await reader.read();
          if (controller.signal.aborted) throw new AccessError("login_unavailable", 503, `${step}_timeout`);
          if (done) break;
          size += value.byteLength;
          if (size > 65_536) throw new AccessError("login_unavailable", 503, `${step}_too_large`);
          chunks.push(value);
        }
      } finally { controller.signal.removeEventListener("abort", abort); }
      const body = new Uint8Array(size);
      let offset = 0;
      for (const chunk of chunks) { body.set(chunk, offset); offset += chunk.byteLength; }
      const value = JSON.parse(new TextDecoder().decode(body));
      if (url.pathname === DISCOVERY && (value.issuer !== `${ORIGIN}/oidc` ||
          value.authorization_endpoint !== `${ORIGIN}/oidc/auth` ||
          value.token_endpoint !== `${ORIGIN}/oidc/token` || value.jwks_uri !== `${ORIGIN}/oidc/jwks`))
        throw new AccessError("login_unavailable", 503, "discovery_mismatch");
      return value as T;
    } catch (error) {
      throw error instanceof AccessError ? error : new AccessError("login_unavailable", 503, `${step}_failed`);
    }
    finally { clearTimeout(timer); if (reader) { void reader.cancel().catch(() => {}); reader.releaseLock(); } }
  };
}
