/**
 * Profile pictures for the connection map, packed into one image (an atlas):
 * the page draws faces from it once you zoom in, and the person panel uses the
 * same image, so the page never fetches pictures one by one from Circle.
 * Pictures are cached by URL between runs, so a monthly build only downloads
 * the new ones.
 */
import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import sharp from "sharp";

export interface AtlasMember {
  /** Index in the page's member list (join order). */
  index: number;
  avatar: string;
}

export interface Atlas {
  file: string;
  columns: number;
  rows: number;
  cell: number;
  /** [index gap, cell, …], indices ascending. */
  cells: number[];
}

const sha1 = (value: string) =>
  crypto.createHash("sha1").update(value).digest("hex");

async function thumbnail(url: string, cell: number, cacheDir: string) {
  const file = path.join(cacheDir, `${sha1(url)}-${cell}.png`);
  if (fs.existsSync(file)) return fs.readFileSync(file);
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 15000);
  try {
    const response = await fetch(url, {
      headers: { "User-Agent": "Mozilla/5.0" },
      signal: controller.signal,
      redirect: "follow",
    });
    if (!response.ok) return null;
    const input = Buffer.from(await response.arrayBuffer());
    const output = await sharp(input)
      .rotate()
      .resize(cell, cell, { fit: "cover", position: "attention" })
      .flatten({ background: "#0b2f1b" })
      .png()
      .toBuffer();
    fs.writeFileSync(file, output);
    return output;
  } catch {
    return null;
  } finally {
    clearTimeout(timer);
  }
}

/**
 * Downloads (or reuses) a square picture for each member, most important
 * first, and writes the atlas as WebP into outDir. Returns null if no picture
 * could be fetched.
 */
export async function buildAtlas(
  members: AtlasMember[],
  options: { cell: number; max: number; cacheDir: string; outDir: string }
): Promise<Atlas | null> {
  const { cell, max } = options;
  const cacheDir = path.join(options.cacheDir, "avatars");
  fs.mkdirSync(cacheDir, { recursive: true });
  const picked = members.slice(0, max);
  const pictures: { index: number; image: Buffer }[] = [];
  let next = 0;
  const worker = async () => {
    while (next < picked.length) {
      const member = picked[next++];
      const image = await thumbnail(member.avatar, cell, cacheDir);
      if (image) pictures.push({ index: member.index, image });
    }
  };
  await Promise.all(Array.from({ length: 8 }, worker));
  if (!pictures.length) return null;
  pictures.sort((a, b) => a.index - b.index);

  const columns = Math.ceil(Math.sqrt(pictures.length));
  const rows = Math.ceil(pictures.length / columns);
  const atlas = await sharp({
    create: {
      width: columns * cell,
      height: rows * cell,
      channels: 3,
      background: "#0b2f1b",
    },
  })
    .composite(
      pictures.map(({ image }, k) => ({
        input: image,
        left: (k % columns) * cell,
        top: Math.floor(k / columns) * cell,
      }))
    )
    .webp({ quality: 70, effort: 5 })
    .toBuffer();
  const file = `avatars-${sha1(atlas.toString("base64")).slice(0, 10)}.webp`;
  fs.mkdirSync(options.outDir, { recursive: true });
  // Older atlases are replaced, not kept alongside.
  for (const name of fs.readdirSync(options.outDir)) {
    if (/^avatars-[0-9a-f]{10}\.webp$/.test(name) && name !== file)
      fs.unlinkSync(path.join(options.outDir, name));
  }
  fs.writeFileSync(path.join(options.outDir, file), atlas);
  console.log(
    `Avatars: ${pictures.length} of ${picked.length} pictures → ${file} (${columns}×${rows}, ${(atlas.length / 1024).toFixed(0)} KB)`
  );

  const cells: number[] = [];
  let previous = -1;
  pictures.forEach(({ index }, k) => {
    cells.push(index - previous, k);
    previous = index;
  });
  return { file, columns, rows, cell, cells };
}
