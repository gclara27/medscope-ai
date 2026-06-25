"""Recolor app icon background to MedScope primary blue (#0058bc)."""

from __future__ import annotations

import sys
from pathlib import Path

from PIL import Image
import numpy as np

PRIMARY_RGB = (0, 88, 188)
WHITE_THRESHOLD = 220


def recolor_icon(path: Path) -> None:
    image = Image.open(path).convert("RGBA")
    pixels = np.array(image)
    rgb = pixels[:, :, :3]
    alpha = pixels[:, :, 3]

    is_white = np.all(rgb >= WHITE_THRESHOLD, axis=2)
    is_background = (~is_white) & (alpha > 0)

    pixels[is_background, 0] = PRIMARY_RGB[0]
    pixels[is_background, 1] = PRIMARY_RGB[1]
    pixels[is_background, 2] = PRIMARY_RGB[2]

    Image.fromarray(pixels, mode="RGBA").save(path, format="PNG")
    print(f"Recolored {path}")


def recolor_icon_to(path: Path, output: Path) -> None:
    image = Image.open(path).convert("RGBA")
    pixels = np.array(image)
    rgb = pixels[:, :, :3]
    alpha = pixels[:, :, 3]

    is_white = np.all(rgb >= WHITE_THRESHOLD, axis=2)
    is_background = (~is_white) & (alpha > 0)

    pixels[is_background, 0] = PRIMARY_RGB[0]
    pixels[is_background, 1] = PRIMARY_RGB[1]
    pixels[is_background, 2] = PRIMARY_RGB[2]

    output.parent.mkdir(parents=True, exist_ok=True)
    Image.fromarray(pixels, mode="RGBA").save(output, format="PNG")
    print(f"Recolored {path} -> {output}")


def main() -> int:
    root = Path(__file__).resolve().parents[1]
    targets = [
        root / "frontend" / "src" / "assets" / "app-icon.png",
        root / "docs" / "Design" / "screens" / "splash" / "microscope.png",
    ]
    for target in targets:
        if not target.exists():
            print(f"Missing: {target}", file=sys.stderr)
            return 1
        try:
            recolor_icon(target)
        except PermissionError:
            temp = target.with_suffix(".recolored.png")
            recolor_icon_to(target, temp)
            temp.replace(target)
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
