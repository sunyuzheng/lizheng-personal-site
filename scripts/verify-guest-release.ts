import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { verifyGuestRelease } from "./sync-guests";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
verifyGuestRelease(fs.readFileSync(path.join(root, "shared/guest-catalog-snapshot.ts"), "utf8"),
  JSON.parse(fs.readFileSync(path.join(root, "shared/guest-catalog-pin.json"), "utf8")));
console.log("Guest snapshot and pinned release match.");
