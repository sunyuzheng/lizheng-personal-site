import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
const config=JSON.parse(readFileSync(new URL("../vercel.json",import.meta.url),"utf8"));
const find=(src:string)=>config.routes.find((route:{src?:string})=>route.src===src);
describe("guest intake clean URL routing",()=>{
 it("leaves the public physical document to the filesystem and applies only its headers",()=>{const route=find("^/guest-intake/?$");expect(config.cleanUrls).toBe(true);expect(route.continue).toBe(true);expect(route.dest).toBeUndefined();expect(route.has).toEqual([{type:"host",value:"www.lizheng.ai"}]);});
 it("rewrites the private workbench to an extensionless existing entry",()=>{const route=find("^/ops/guest-intake/?$");expect(route.dest).toBe("/guest-intake");expect(route.dest).not.toMatch(/\.html$/);expect(route.headers["Cache-Control"]).toBe("no-store");expect(route.headers["X-Robots-Tag"]).toContain("noindex");});
});
