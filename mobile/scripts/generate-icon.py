"""
Picook App Icon Generator v8
Simmering Pot symbol — matches src/components/brand/PotSymbol.tsx (login screen)
Cream background (#FFF8F1) + orange-gradient pot + 3 steam wisps
1024x1024
"""

from PIL import Image, ImageDraw
import os

SIZE = 1024
SCALE = SIZE / 100  # SVG viewBox is 100x100 → 10.24px per SVG unit

# Colors
BG = (255, 248, 241)              # #FFF8F1 (theme background)
POT_TOP = (255, 122, 90)          # #FF7A5A
POT_BOTTOM = (196, 74, 28)        # #C44A1C
DARK = (31, 22, 18)               # #1F1612
STEAM = (255, 107, 74)            # #FF6B4A
HIGHLIGHT = (255, 202, 182)       # #FFCAB6


def s(v):
    return int(round(v * SCALE))


def quad(p0, p1, p2, n=40):
    """Sample quadratic Bezier; returns list of (x, y) in SVG coords."""
    out = []
    for i in range(n + 1):
        t = i / n
        x = (1 - t) ** 2 * p0[0] + 2 * (1 - t) * t * p1[0] + t * t * p2[0]
        y = (1 - t) ** 2 * p0[1] + 2 * (1 - t) * t * p1[1] + t * t * p2[1]
        out.append((x, y))
    return out


def chain(beziers, n=30):
    """Chain multiple quad beziers into one continuous polyline."""
    pts = []
    for i, (p0, p1, p2) in enumerate(beziers):
        seg = quad(p0, p1, p2, n)
        if i == 0:
            pts.extend(seg)
        else:
            pts.extend(seg[1:])
    return pts


def stroke_path(canvas, pts_svg, color, opacity, width_svg):
    """Draw a stroked polyline on RGBA canvas."""
    overlay = Image.new("RGBA", canvas.size, (0, 0, 0, 0))
    od = ImageDraw.Draw(overlay)
    a = int(255 * opacity)
    pts = [(s(x), s(y)) for (x, y) in pts_svg]
    w = max(1, s(width_svg))
    # Round joins via drawing circles at each vertex (anti-jagged)
    for i in range(len(pts) - 1):
        od.line([pts[i], pts[i + 1]], fill=(*color, a), width=w)
    # End-caps + joints as filled circles (visually rounded)
    for p in pts:
        od.ellipse([p[0] - w // 2, p[1] - w // 2, p[0] + w // 2, p[1] + w // 2],
                   fill=(*color, a))
    canvas.alpha_composite(overlay)


def make_pot_polygon():
    """Pot body outline in pixel coords."""
    pts = []
    pts.extend(quad((18, 52), (18, 86), (32, 90), 40))
    pts.append((68, 90))
    pts.extend(quad((68, 90), (82, 86), (82, 52), 40))
    return [(s(x), s(y)) for (x, y) in pts]


def vertical_gradient(size, top_rgb, bottom_rgb):
    """Return RGBA image with vertical gradient."""
    w, h = size
    img = Image.new("RGBA", (w, h))
    px = img.load()
    for y in range(h):
        t = y / max(1, h - 1)
        r = int(top_rgb[0] * (1 - t) + bottom_rgb[0] * t)
        g = int(top_rgb[1] * (1 - t) + bottom_rgb[1] * t)
        b = int(top_rgb[2] * (1 - t) + bottom_rgb[2] * t)
        for x in range(w):
            px[x, y] = (r, g, b, 255)
    return img


def render_pot(size_px, with_bg=True):
    """Render the simmering pot at given square size. Returns RGB image (RGBA if with_bg=False)."""
    # We always render at the master SIZE then resize down.
    # Compose on RGBA canvas first.
    canvas = Image.new("RGBA", (SIZE, SIZE), (*BG, 255) if with_bg else (0, 0, 0, 0))

    # 1) Steam (back)
    stroke_path(canvas, chain([
        ((32, 26), (28, 16), (36, 10)),
        ((36, 10), (40, 16), (36, 22)),
        ((36, 22), (32, 28), (36, 34)),
    ]), STEAM, 0.55, 3)
    stroke_path(canvas, chain([
        ((50, 22), (46, 12), (54, 6)),
        ((54, 6), (58, 12), (54, 18)),
        ((54, 18), (50, 24), (54, 30)),
    ]), STEAM, 0.7, 3)
    stroke_path(canvas, chain([
        ((68, 26), (64, 16), (72, 10)),
        ((72, 10), (76, 16), (72, 22)),
        ((72, 22), (68, 28), (72, 34)),
    ]), STEAM, 0.55, 3)

    d = ImageDraw.Draw(canvas)

    # 2) Pot lid (dark ellipse) — drawn before body so body overlays its bottom edge
    cx, cy, rx, ry = 50, 48, 36, 6
    d.ellipse([s(cx - rx), s(cy - ry), s(cx + rx), s(cy + ry)], fill=(*DARK, 255))
    # 3) Lid handle
    d.rounded_rectangle([s(46), s(40), s(54), s(46)], radius=s(2), fill=(*DARK, 255))

    # 4) Pot body: gradient masked by pot polygon
    pot_mask = Image.new("L", (SIZE, SIZE), 0)
    pmd = ImageDraw.Draw(pot_mask)
    pmd.polygon(make_pot_polygon(), fill=255)
    grad = vertical_gradient((SIZE, SIZE), POT_TOP, POT_BOTTOM)
    canvas.paste(grad, (0, 0), pot_mask)

    # 5) Pot body highlight (curve on left side)
    stroke_path(canvas, quad((26, 58), (26, 78), (34, 84), 30), HIGHLIGHT, 0.6, 2.5)

    # 6) Side handles (dark) — overlap onto body sides
    d2 = ImageDraw.Draw(canvas)
    d2.rounded_rectangle([s(8), s(62), s(20), s(70)], radius=s(3), fill=(*DARK, 255))
    d2.rounded_rectangle([s(80), s(62), s(92), s(70)], radius=s(3), fill=(*DARK, 255))

    if with_bg:
        return canvas.convert("RGB").resize((size_px, size_px), Image.Resampling.LANCZOS)
    return canvas.resize((size_px, size_px), Image.Resampling.LANCZOS)


def main():
    out_dir = os.path.join(os.path.dirname(__file__), "..", "assets")

    icon = render_pot(SIZE, with_bg=True)
    icon.save(os.path.join(out_dir, "icon.png"), "PNG", quality=100)
    icon.save(os.path.join(out_dir, "splash-icon.png"), "PNG", quality=100)
    icon.resize((48, 48), Image.Resampling.LANCZOS).save(
        os.path.join(out_dir, "favicon.png"), "PNG"
    )

    # Android adaptive: foreground (transparent bg, pot only)
    fg = render_pot(SIZE, with_bg=False)
    fg.save(os.path.join(out_dir, "android-icon-foreground.png"), "PNG")

    # Android adaptive background
    Image.new("RGB", (SIZE, SIZE), BG).save(
        os.path.join(out_dir, "android-icon-background.png"), "PNG"
    )
    # Monochrome — solid white silhouette of the pot (Android themed icon)
    mono = Image.new("RGB", (SIZE, SIZE), (255, 255, 255))
    mono_draw = ImageDraw.Draw(mono)
    mono_draw.polygon(make_pot_polygon(), fill=(0, 0, 0))
    cx, cy, rx, ry = 50, 48, 36, 6
    mono_draw.ellipse([s(cx - rx), s(cy - ry), s(cx + rx), s(cy + ry)], fill=(0, 0, 0))
    mono.save(os.path.join(out_dir, "android-icon-monochrome.png"), "PNG")

    print("Pot symbol icons generated → assets/")


if __name__ == "__main__":
    main()
