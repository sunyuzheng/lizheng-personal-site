import { afterEach, describe, expect, it, vi } from "vitest";
import { sanitizedLogtoRequester } from "../shared/ask-logto-requester";
afterEach(() => { vi.unstubAllGlobals(); vi.restoreAllMocks(); });
const requester = () => sanitizedLogtoRequester("test-app", "test-only-secret");
describe("sanitized Logto transport", () => {
  it("never logs or parses a provider failure body", async () => {
    const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});
    const response = Response.json({ private_detail: "synthetic-private-data" }, { status: 400 });
    const read = vi.spyOn(response, "json");
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(response));
    await expect(requester()("https://auth.superlinear.academy/oidc/token")).rejects.toMatchObject({ code: "login_unavailable" });
    expect(consoleSpy).not.toHaveBeenCalled(); expect(read).not.toHaveBeenCalled();
  });
  it("sends app authentication only to the exact token endpoint and rejects redirects", async () => {
    const fetchMock = vi.fn().mockResolvedValue(Response.json({ id_token: "test-token" }));
    vi.stubGlobal("fetch", fetchMock);
    await requester()("https://auth.superlinear.academy/oidc/token", { method: "POST", body: "code=test" });
    expect(fetchMock.mock.calls[0][1].headers.get("authorization")).toBe(`Basic ${Buffer.from("test-app:test-only-secret").toString("base64")}`);
    expect(fetchMock.mock.calls[0][1].redirect).toBe("manual");
    fetchMock.mockResolvedValueOnce(new Response(null, { status: 302, headers: { Location: "https://attacker.example" } }));
    await expect(requester()("https://auth.superlinear.academy/oidc/token")).rejects.toThrow();
    await expect(requester()("https://attacker.example/oidc/token")).rejects.toThrow();
    expect(fetchMock).toHaveBeenCalledTimes(2);
  });
  it("bounds returned data and pins OIDC endpoints before the SDK uses them", async () => {
    const fetchMock = vi.fn().mockResolvedValue(Response.json({ issuer: "https://attacker.example" }));
    vi.stubGlobal("fetch", fetchMock);
    await expect(requester()("https://auth.superlinear.academy/oidc/.well-known/openid-configuration")).rejects.toThrow();
    fetchMock.mockResolvedValueOnce(Response.json({ issuer: "https://auth.superlinear.academy/oidc", authorization_endpoint: "https://auth.superlinear.academy/oidc/auth", token_endpoint: "https://auth.superlinear.academy/oidc/token", jwks_uri: "https://auth.superlinear.academy/oidc/jwks" }));
    await expect(requester()("https://auth.superlinear.academy/oidc/.well-known/openid-configuration")).resolves.toHaveProperty("issuer");
    expect(fetchMock.mock.calls[1][1].headers.get("authorization")).toBeNull();
    fetchMock.mockResolvedValueOnce(new Response("x".repeat(65_537)));
    await expect(requester()("https://auth.superlinear.academy/oidc/token")).rejects.toThrow();
  });
});
