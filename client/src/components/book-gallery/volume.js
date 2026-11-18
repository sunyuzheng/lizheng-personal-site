import * as T from "three";
export const W = 1.72,
  H = (W * 8.5) / 5.5,
  D = (W * 0.45) / 5.5;
export const clamp = x => Math.min(1, Math.max(0, x));
export const smooth = x => {
  const t = clamp(x);
  return t * t * (3 - 2 * t);
};
const lerp = T.MathUtils.lerp;
const paper = "#f3e8d4",
  PI = Math.PI;
function stock(side, map, color = paper) {
  return new T.MeshStandardMaterial({
    color,
    map,
    side,
    roughness: 0.92,
    metalness: 0,
  });
}
function textureFace(texture, reverse) {
  if (!texture || !reverse) return texture || null;
  const copy = texture.clone();
  copy.repeat.x = -1;
  copy.offset.x = 1;
  copy.needsUpdate = true;
  return copy;
}
// Thickness lines are parallel to the printed leaves on all three cut edges.
function edgeTexture(vertical) {
  const c = document.createElement("canvas");
  c.width = vertical ? 192 : 32;
  c.height = vertical ? 32 : 192;
  const ctx = c.getContext("2d");
  ctx.fillStyle = "#ebdec6";
  ctx.fillRect(0, 0, c.width, c.height);
  for (let i = 0; i < 180; i++) {
    ctx.fillStyle =
      "rgba(87,65,43," + (0.07 + 0.12 * (0.5 + 0.5 * Math.sin(i * 3.83))) + ")";
    if (vertical) ctx.fillRect((i * 192) / 180, 0, 0.6, c.height);
    else ctx.fillRect(0, (i * 192) / 180, c.width, 0.6);
  }
  const t = new T.CanvasTexture(c);
  t.colorSpace = T.SRGBColorSpace;
  return t;
}
const edgeX = edgeTexture(true),
  edgeY = edgeTexture(false);
function box(group, size, position, materials) {
  const mesh = new T.Mesh(new T.BoxGeometry(...size), materials);
  mesh.position.set(...position);
  mesh.castShadow = true;
  mesh.receiveShadow = true;
  group.add(mesh);
  return mesh;
}
export function makeVolume(def, textures, opens) {
  const root = new T.Group();
  const width = def.width || W;
  const depth = def.depth || D;
  const height = def.height || H;
  const end = stock(T.FrontSide, null, "#e2d2b5");
  const spineMap = opens
    ? textures["flp-spine"]
    : def.cover === "white"
      ? textures["white-spine"]
      : null;
  const spine = stock(T.FrontSide, spineMap, spineMap ? "#ffffff" : def.spine);
  const cutX = stock(T.FrontSide, edgeX, "#f8f2e6"),
    cutY = stock(T.FrontSide, edgeY, "#f8f2e6");
  const cover = stock(T.FrontSide, textures[def.cover], "#ffffff");
  const back = stock(
    T.FrontSide,
    opens ? textures["flp-back"] : null,
    opens ? "#ffffff" : def.spine
  );
  const coverEdge = stock(T.FrontSide, null, def.spine);
  box(
    root,
    [width, 0.999 * height, 0.009],
    [width / 2, 0, 0],
    [coverEdge, coverEdge, coverEdge, coverEdge, end, back]
  );
  box(
    root,
    [0.012, height, depth],
    [0, 0, depth / 2],
    [end, spine, coverEdge, coverEdge, coverEdge, coverEdge]
  );
  const block = box(
    root,
    [width - 0.018, height - 0.018, depth - 0.012],
    [width / 2, 0, depth / 2],
    [cutX, end, cutY, cutY, end, end]
  );
  if (!opens) {
    box(
      root,
      [width, height, 0.009],
      [width / 2, 0, depth],
      [coverEdge, coverEdge, coverEdge, coverEdge, cover, end]
    );
    return { root, shape: () => {} };
  }
  const cols = 44,
    rows = 9;
  function leaf(front, back, isCover) {
    const geo = new T.PlaneGeometry(1, 1, cols, rows);
    geo.attributes.position.setUsage(T.DynamicDrawUsage);
    const faces = [
      stock(T.FrontSide, textures[front] || null, front ? "#fff" : paper),
      stock(
        T.BackSide,
        textureFace(textures[back], true),
        back ? "#fff" : paper
      ),
    ];
    // Each side follows the same surface; the verso artwork reads from the opposite fore-edge.
    for (const m of faces) {
      if (isCover && m.side === T.FrontSide) m.roughness = 0.71;
      m.shadowSide = m.side;
    }
    const group = new T.Group();
    root.add(group);
    for (const m of faces) {
      const mesh = new T.Mesh(geo, m);
      mesh.castShadow = m.side === T.FrontSide;
      mesh.receiveShadow = true;
      mesh.frustumCulled = false;
      group.add(mesh);
    }
    return { geo, group, isCover, last: "" };
  }
  const leaves = [
    leaf("cover", null, true),
    leaf("p2", "p3"),
    leaf("p4", "p5"),
    leaf("p6", "p7"),
    leaf("p8", "p9"),
    leaf("p10", "p11"),
    leaf("p12", "p13"),
  ];
  function shape(open, spread, grab = -0.35) {
    const turns = leaves.map((_, i) =>
      i === 0
        ? smooth((open - 0.055) / 0.7)
        : i < 4
          ? smooth((open - 0.15 - i * 0.085) / 0.53)
          : clamp(spread - (i - 4))
    );
    const right = turns.findIndex(t => t < 0.99999);
    const left = turns.findLastIndex(t => t > 0.00001);
    block.scale.z = 1 - turns.reduce((a, b) => a + b, 0) * 0.0018;
    block.position.z = (depth / 2) * block.scale.z;
    leaves.forEach(({ group, geo, isCover }, i) => {
      const p = turns[i],
        moving = p > 0.00001 && p < 0.99999;
      group.visible =
        moving ||
        i === 0 ||
        i === right ||
        i === left ||
        (i > 0 && (turns[i - 1] ?? 1) > 0 && (turns[i - 1] ?? 1) < 1) ||
        (i < 6 && turns[i + 1] > 0 && turns[i + 1] < 1);
      if (!group.visible) return;
      const curl = Math.sin(PI * p),
        spring = 1 - Math.abs(2 * p - 1);
      const key = [
        p.toFixed(5),
        open.toFixed(4),
        moving ? grab.toFixed(3) : "",
      ].join("/");
      if (leaves[i].last === key) return;
      leaves[i].last = key;
      const pos = geo.attributes.position;
      const length = width - (isCover ? 0 : 0.012),
        tall = height - (isCover ? 0 : 0.014);
      const base = lerp(depth + 0.013 - i * 0.00115, 0.009 + i * 0.00165, p);
      for (let j = 0; j <= rows; j++) {
        const y = 0.5 - j / rows;
        let x = 0,
          z = base;
        for (let k = 0; k <= cols; k++) {
          const u = k / cols;
          pos.setXYZ(j * (cols + 1) + k, x, y * tall, z);
          const along = (k + 0.5) / cols;
          const closeToFinger = 1 - Math.min(1, Math.abs(y - grab));
          const twist = (closeToFinger - 0.45) * along * spring * 0.98;
          const bow = isCover
            ? curl * (0.09 + 0.33 * along)
            : curl * (-1.04 + 1.96 * along + twist);
          const gutter = isCover
            ? 0
            : open *
              (1 - curl) *
              0.39 *
              Math.exp(-along * 10) *
              Math.cos(PI * p);
          const angle = PI * p + bow + gutter;
          x += (length / cols) * Math.cos(angle);
          z += (length / cols) * Math.sin(angle);
        }
      }
      pos.needsUpdate = true;
      geo.computeVertexNormals();
    });
  }
  shape(0, 0);
  return { root, shape };
}
