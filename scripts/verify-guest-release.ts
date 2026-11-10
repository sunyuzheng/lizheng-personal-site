import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { guestCatalog } from "../shared/guest-catalog-snapshot";
import { verifyGuestRelease, verifyGuestReleaseCounts } from "./sync-guests";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const pin = JSON.parse(fs.readFileSync(path.join(root, "shared/guest-catalog-pin.json"), "utf8"));
verifyGuestRelease(fs.readFileSync(path.join(root, "shared/guest-catalog-snapshot.ts"), "utf8"), pin);
// The pages print the pin's counts, so they must be the snapshot's own.
verifyGuestReleaseCounts(pin, guestCatalog);
console.log(`Guest snapshot and pinned release match: ${pin.counts.guests} guests, ${pin.counts.videos} videos.`);
