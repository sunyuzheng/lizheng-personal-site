"""Make the homepage hero portrait from the cut-out source.

    python3 scripts/hero-portrait.py client/public/home/portrait.webp client/public/home/portrait-hero.webp

The source is an 815x900 cut-out with a soft, ten-pixel edge. For the hero it is enlarged 1.5x in
premultiplied space (so the edge does not take on the old background), the edge's half-transparent
band is narrowed, and the colour is lightly sharpened, so his hair stays crisp where it crosses the
cream seal on high-density screens. Needs numpy and Pillow; run locally, the build does not.
"""
import sys

import numpy as np
from PIL import Image, ImageFilter

src_path, out_path = sys.argv[1], sys.argv[2]
src = Image.open(src_path).convert("RGBA")
arr = np.asarray(src).astype(np.float32) / 255.0
rgb, alpha = arr[..., :3], arr[..., 3]
premultiplied = rgb * alpha[..., None]
width, height = round(src.width * 1.5), round(src.height * 1.5)


def resize(channel):
    return np.asarray(Image.fromarray(channel.astype(np.float32), mode="F").resize((width, height), Image.LANCZOS))


# The cut-out kept a sliver of the chair's orange outline under his right sleeve (bottom left of the
# picture), outside the arm. Clear it before scaling, with a short ramp so no hard edge is left.
ys, xs = np.mgrid[0 : src.height, 0 : src.width]
stray = np.clip((61.5 - xs) / 3.0, 0, 1) * np.clip((ys - 856) / 4.0, 0, 1)
# What is left of it hugs the arm's edge: orange where skin is not (little blue, much red).
orange = (xs < 72) & (ys > 850) & (rgb[..., 0] - rgb[..., 2] > 0.40)
alpha = alpha * (1 - np.maximum(stray, orange.astype(np.float32)))
premultiplied = rgb * alpha[..., None]

colour = np.stack([resize(premultiplied[..., i]) for i in range(3)], -1)
alpha = np.clip(resize(alpha), 0, 1)
colour = np.clip(colour / np.where(alpha > 1e-4, alpha, 1.0)[..., None], 0, 1)
# Narrow the edge: alpha below 0.16 goes, above 0.86 is solid, with a smooth step between.
edge = np.clip((alpha - 0.16) / 0.70, 0, 1)
edge = edge * edge * (3 - 2 * edge)
image = Image.fromarray((np.dstack([colour, edge]) * 255 + 0.5).astype(np.uint8), "RGBA")
r, g, b, a = image.split()
sharp = Image.merge("RGB", (r, g, b)).filter(ImageFilter.UnsharpMask(radius=1.4, percent=55, threshold=2))
Image.merge("RGBA", (*sharp.split(), a)).save(out_path, "WEBP", quality=90, method=6)
print(out_path, (width, height))
