"""Crop and resize ContextMint mark PNGs for favicon / apple-touch."""
from __future__ import annotations

from pathlib import Path

from PIL import Image

DEST = Path(__file__).resolve().parents[1] / "src" / "assets" / "img" / "logos"


def square_crop(img: Image.Image) -> Image.Image:
    w, h = img.size
    side = min(w, h)
    left = (w - side) // 2
    top = (h - side) // 2
    return img.crop((left, top, left + side, top + side))


def main() -> None:
    src = Image.open(DEST / "mark-dark.png").convert("RGBA")
    sq = square_crop(src)
    sizes = {
        "apple-touch-icon.png": 180,
        "favicon-32.png": 32,
        "favicon-192.png": 192,
    }
    for name, size in sizes.items():
        out = sq.resize((size, size), Image.Resampling.LANCZOS)
        out.save(DEST / name, optimize=True)
        print(f"wrote {name} {out.size}")


if __name__ == "__main__":
    main()
