import assert from "node:assert/strict";
import crypto from "node:crypto";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import test from "node:test";
import { buildProtected } from "../scripts/decks/build-protected.mjs";

test("protected exports encrypt every image and the PDF, authenticate ciphertext, and keep secrets out of output", () => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), "protected-deck-"));
  try {
    const source = path.join(root, "source"), output = path.join(root, "dist");
    fs.mkdirSync(path.join(source, "assets"), { recursive: true });
    const png = Buffer.concat([Buffer.from("89504e470d0a1a0a", "hex"), Buffer.from("private-slide-content")]);
    const pdf = Buffer.from("%PDF-1.7\nprivate-handout-content");
    fs.writeFileSync(path.join(source, "assets/slide-01.png"), png);
    fs.writeFileSync(path.join(source, "deck.pdf"), pdf);
    fs.writeFileSync(path.join(source, "deck.pptx"), "excluded source");
    const password = crypto.randomBytes(24).toString("base64url");
    const options = { source, output, password, slug: "sample", title: "Sample <private>" };
    assert.equal(buildProtected(options).slides, 1);
    const config = JSON.parse(fs.readFileSync(path.join(output, "config.json"), "utf8"));
    const derive = value => crypto.pbkdf2Sync(value, Buffer.from(config.salt, "base64"), config.iterations, 32, "sha256");
    const key = derive(password);
    const open = (data, useKey = key) => {
      const decipher = crypto.createDecipheriv("aes-256-gcm", useKey, data.subarray(0, 12));
      decipher.setAuthTag(data.subarray(-16));
      return Buffer.concat([decipher.update(data.subarray(12, -16)), decipher.final()]);
    };
    const encryptedManifest = fs.readFileSync(path.join(output, "manifest.enc"));
    const manifest = JSON.parse(open(encryptedManifest));
    assert.equal(manifest.slides.length, 1);
    assert.deepEqual(open(fs.readFileSync(path.join(output, "slide-01.enc"))), png);
    assert.deepEqual(open(fs.readFileSync(path.join(output, "handout.enc"))), pdf);
    assert.throws(() => open(encryptedManifest, derive("wrong password")));
    const tampered = Buffer.from(encryptedManifest);
    tampered[20] ^= 1;
    assert.throws(() => open(tampered));
    for (const file of fs.readdirSync(output)) {
      const data = fs.readFileSync(path.join(output, file));
      for (const forbidden of [password, source, "private-slide-content", "private-handout-content", "excluded source"]) {
        assert.equal(data.includes(Buffer.from(forbidden)), false, `${file} contains private data`);
      }
      assert.equal(/\.(png|pdf|pptx)$/.test(file), false);
    }
    assert.match(fs.readFileSync(path.join(output, "index.html"), "utf8"), /Sample &lt;private&gt;/);
    const firstSalt = config.salt;
    buildProtected(options);
    const secondConfig = JSON.parse(fs.readFileSync(path.join(output, "config.json"), "utf8"));
    assert.notEqual(firstSalt, secondConfig.salt);
    assert.notDeepEqual(encryptedManifest, fs.readFileSync(path.join(output, "manifest.enc")));
    const unrelated = path.join(root, "unrelated");
    fs.mkdirSync(unrelated);
    fs.writeFileSync(path.join(unrelated, "keep"), "keep");
    assert.throws(() => buildProtected({ ...options, output: unrelated }), /Refusing/);
    assert.throws(() => buildProtected({ ...options, output: source }), /Output/);
    assert.throws(() => buildProtected({ ...options, password: "weak" }), /password/);
    assert.equal(fs.readFileSync(path.join(unrelated, "keep"), "utf8"), "keep");
  } finally { fs.rmSync(root, { recursive: true, force: true }); }
});
