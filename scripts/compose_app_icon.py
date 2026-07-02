"""Compose public favicon from glyph on MedScope primary blue."""

from __future__ import annotations

import sys
from pathlib import Path

from PIL import Image, ImageDraw
import numpy as np

PRIMARY_RGBA = (0, 88, 188, 255)
WHITE_THRESHOLD = 220
# Matches MedScopeAppIcon `rounded-[22%]` in the React brand mark.
CORNER_RADIUS_RATIO = 0.22


def ensure_glyph(source: Path, glyph: Path) -> None:
    image = Image.open(source).convert("RGBA")
    pixels = np.array(image)
    rgb = pixels[:, :, :3]
    is_white = np.all(rgb >= WHITE_THRESHOLD, axis=2)

    output = np.zeros_like(pixels)
    output[is_white] = (255, 255, 255, 255)
    output[~is_white, 3] = 0

    glyph.parent.mkdir(parents=True, exist_ok=True)
    Image.fromarray(output, mode="RGBA").save(glyph, format="PNG")


def crop_center_square(image: Image.Image) -> Image.Image:
    width, height = image.size
    side = min(width, height)
    left = (width - side) // 2
    top = (height - side) // 2
    return image.crop((left, top, left + side, top + side))


def apply_rounded_corners(
    image: Image.Image,
    radius_ratio: float = CORNER_RADIUS_RATIO,
) -> Image.Image:
    rgba = image.convert("RGBA")
    side = min(rgba.size)
    radius = max(1, int(side * radius_ratio))
    mask = Image.new("L", rgba.size, 0)
    draw = ImageDraw.Draw(mask)
    draw.rounded_rectangle((0, 0, rgba.size[0] - 1, rgba.size[1] - 1), radius=radius, fill=255)
    output = Image.new("RGBA", rgba.size, (0, 0, 0, 0))
    output.paste(rgba, (0, 0), mask)
    return output


def compose_favicon(source: Path, glyph: Path, target: Path) -> None:
    ensure_glyph(source, glyph)
    base = Image.open(source).convert("RGBA")
    glyph_image = Image.open(glyph).convert("RGBA")
    background = Image.new("RGBA", base.size, PRIMARY_RGBA)
    background.paste(glyph_image, (0, 0), glyph_image)
    composed = crop_center_square(background)
    rounded = apply_rounded_corners(composed)
    target.parent.mkdir(parents=True, exist_ok=True)
    try:
        rounded.save(target, format="PNG")
    except PermissionError:
        fallback = target.with_suffix(".synced.png")
        rounded.save(fallback, format="PNG")
        print(f"Target locked; wrote {fallback}", file=sys.stderr)
        return
    print(f"Composed {target}")


def main() -> int:
    root = Path(__file__).resolve().parents[1]
    source = root / "frontend" / "src" / "assets" / "app-icon.png"
    glyph = root / "frontend" / "src" / "assets" / "app-icon-glyph.png"
    target = root / "frontend" / "public" / "app-icon.png"

    if not source.exists():
        print(f"Missing: {source}", file=sys.stderr)
        return 1

    compose_favicon(source, glyph, target)
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
