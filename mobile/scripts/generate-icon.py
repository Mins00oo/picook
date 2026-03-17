"""
Picook App Icon Generator v7
Green #1D9E75 + white P logo
줄기 두께 = 볼 두께 → 이음매 없는 매끄러운 P
볼 안에 당근, 잎, 토마토
1024x1024 — Minimal flat
"""

from PIL import Image, ImageDraw
import math
import os

SIZE = 1024
CENTER = SIZE // 2
BG = (29, 158, 117)
W = (255, 255, 255, 255)
BG_A = BG + (255,)


def draw_carrot(draw, cx, cy, s=1.0):
    bw = int(14 * s)
    bh = int(38 * s)
    draw.ellipse([cx - bw, cy - int(6*s), cx + bw, cy + int(18*s)], fill=W)
    draw.polygon([(cx - int(8*s), cy + int(10*s)),
                  (cx, cy + bh),
                  (cx + int(8*s), cy + int(10*s))], fill=W)
    lw, lh = int(6*s), int(16*s)
    draw.ellipse([cx - lw - int(4*s), cy - int(6*s) - lh, cx - int(1*s), cy - int(2*s)], fill=W)
    draw.ellipse([cx + int(1*s), cy - int(8*s) - lh, cx + lw + int(4*s), cy], fill=W)
    draw.ellipse([cx - int(3*s), cy - int(10*s) - lh, cx + int(3*s), cy - int(4*s)], fill=W)


def draw_leaf(draw, cx, cy, s=1.0):
    rad = math.radians(-35)
    cos_a, sin_a = math.cos(rad), math.sin(rad)
    ln = int(30 * s)
    wd = int(14 * s)
    pts = []
    n = 28
    for i in range(n + 1):
        t = i / n
        xl = t * ln - ln / 2
        w = wd * math.sin(t * math.pi) * (1 - 0.15 * t)
        pts.append((cx + xl*cos_a - w*sin_a, cy + xl*sin_a + w*cos_a))
    for i in range(n, -1, -1):
        t = i / n
        xl = t * ln - ln / 2
        w = wd * math.sin(t * math.pi) * (1 - 0.15 * t)
        pts.append((cx + xl*cos_a + w*sin_a, cy + xl*sin_a - w*cos_a))
    draw.polygon(pts, fill=W)
    sl = int(10 * s)
    sx, sy = cx - ln/2*cos_a, cy - ln/2*sin_a
    draw.line([(sx, sy), (sx - sl*cos_a, sy - sl*sin_a)], fill=W, width=max(2, int(3*s)))


def draw_tomato(draw, cx, cy, s=1.0):
    r = int(17 * s)
    draw.ellipse([cx - r, cy - int(r*0.85), cx + r, cy + int(r*0.85)], fill=W)
    sw, sh = int(2.5*s), int(7*s)
    draw.rectangle([cx - sw, cy - int(r*0.85) - sh, cx + sw, cy - int(r*0.7)], fill=W)
    lw, lh = int(9*s), int(5*s)
    ly = cy - int(r * 0.85)
    draw.ellipse([cx - lw, ly - lh, cx + int(2*s), ly + lh - int(1*s)], fill=W)
    draw.ellipse([cx - int(2*s), ly - lh, cx + lw, ly + lh - int(1*s)], fill=W)


def main():
    img = Image.new('RGBA', (SIZE, SIZE), BG_A)
    draw = ImageDraw.Draw(img, 'RGBA')

    # ─── P 파라미터 ───
    thickness = 52          # 줄기 = 볼 = 동일 두께
    bowl_outer_r = 195      # 볼 외부 반지름
    bowl_inner_r = bowl_outer_r - thickness

    # 중심 배치
    total_w = thickness + bowl_outer_r * 2 - thickness  # = bowl_outer_r * 2
    offset_x = CENTER - total_w // 2 - 10  # 살짝 좌측

    stem_left = offset_x
    stem_right = stem_left + thickness
    bowl_cx = stem_right + bowl_outer_r - thickness
    bowl_cy = CENTER - 35

    stem_top = bowl_cy - bowl_outer_r
    stem_bottom = bowl_cy + bowl_outer_r + 150

    # ─── 1. P 외부 실루엣 ───
    # 줄기: 직사각형
    draw.rectangle([stem_left, stem_top, stem_right, stem_bottom], fill=W)
    # 줄기 하단 반원
    sr = thickness // 2
    draw.ellipse([stem_left, stem_bottom - sr,
                  stem_right, stem_bottom + sr], fill=W)

    # 볼: 외부 원
    draw.ellipse([bowl_cx - bowl_outer_r, bowl_cy - bowl_outer_r,
                  bowl_cx + bowl_outer_r, bowl_cy + bowl_outer_r], fill=W)

    # ─── 2. P 내부 빼기 (배경색) ───
    # 볼 내부 원
    draw.ellipse([bowl_cx - bowl_inner_r, bowl_cy - bowl_inner_r,
                  bowl_cx + bowl_inner_r, bowl_cy + bowl_inner_r], fill=BG_A)

    # 줄기 우측에서 볼 내부까지 연결된 부분에서
    # 볼 내부 좌측 아크와 줄기 사이의 공간을 배경색으로 채움
    # → 줄기가 볼의 왼쪽 벽과 하나로 합쳐지므로 자연스러운 P 형태

    # ─── 3. 손잡이 구멍 ───
    hole_r = int(thickness * 0.2)
    hole_cx = stem_left + thickness // 2
    hole_cy = stem_bottom - int(thickness * 0.5)
    draw.ellipse([hole_cx - hole_r, hole_cy - hole_r,
                  hole_cx + hole_r, hole_cy + hole_r], fill=BG_A)

    # ─── 4. 음식 아이콘 ───
    fr = bowl_inner_r - 20
    draw_carrot(draw, bowl_cx - int(fr * 0.35), bowl_cy - int(fr * 0.08), s=2.3)
    draw_leaf(draw, bowl_cx + int(fr * 0.3), bowl_cy - int(fr * 0.25), s=2.6)
    draw_tomato(draw, bowl_cx + int(fr * 0.15), bowl_cy + int(fr * 0.4), s=2.3)

    # ─── 저장 ───
    final = img.convert('RGB')
    d = os.path.join(os.path.dirname(__file__), '..', 'assets')

    final.save(os.path.join(d, 'icon.png'), 'PNG', quality=100)
    final.save(os.path.join(d, 'splash-icon.png'), 'PNG', quality=100)
    final.resize((48, 48), Image.Resampling.LANCZOS).save(os.path.join(d, 'favicon.png'), 'PNG')
    final.save(os.path.join(d, 'android-icon-foreground.png'), 'PNG', quality=100)
    Image.new('RGB', (SIZE, SIZE), BG).save(os.path.join(d, 'android-icon-background.png'), 'PNG')
    Image.new('RGB', (SIZE, SIZE), (255,255,255)).save(os.path.join(d, 'android-icon-monochrome.png'), 'PNG')

    print("All icons generated!")


if __name__ == '__main__':
    main()
