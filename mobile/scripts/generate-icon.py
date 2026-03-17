"""
Picook App Icon Generator v3
1024x1024 PNG — Clean, modern flat design
"""

from PIL import Image, ImageDraw, ImageFilter
import math
import os

SIZE = 1024
CENTER = SIZE // 2

def lerp_color(c1, c2, t):
    return tuple(int(c1[i] + (c2[i] - c1[i]) * t) for i in range(3))

def create_gradient_background(img):
    draw = ImageDraw.Draw(img)
    top_color = (255, 100, 45)
    bottom_color = (255, 145, 90)

    for y in range(SIZE):
        t = y / SIZE
        color = lerp_color(top_color, bottom_color, t)
        draw.line([(0, y), (SIZE, y)], fill=color)

def draw_frying_pan(draw, cx, cy, scale=1.0):
    """Clean flat frying pan"""

    # --- Handle (behind pan) ---
    angle = math.radians(40)
    cos_a = math.cos(angle)
    sin_a = math.sin(angle)

    handle_w = int(30 * scale)
    handle_len = int(200 * scale)
    hx = cx + int(220 * scale)
    hy = cy
    hw = handle_w // 2

    points = [
        (hx + hw * sin_a, hy - hw * cos_a),
        (hx + handle_len * cos_a + hw * sin_a, hy + handle_len * sin_a - hw * cos_a),
        (hx + handle_len * cos_a - hw * sin_a, hy + handle_len * sin_a + hw * cos_a),
        (hx - hw * sin_a, hy + hw * cos_a),
    ]

    # Handle shadow
    shadow_pts = [(p[0]+4, p[1]+6) for p in points]
    draw.polygon(shadow_pts, fill=(140, 45, 10, 25))

    # Handle body
    draw.polygon(points, fill=(75, 75, 80, 255))

    # Handle highlight
    hl_pts = [
        (hx + (hw-4) * sin_a, hy - (hw-4) * cos_a),
        (hx + handle_len * 0.8 * cos_a + (hw-4) * sin_a,
         hy + handle_len * 0.8 * sin_a - (hw-4) * cos_a),
        (hx + handle_len * 0.8 * cos_a + (hw-10) * sin_a,
         hy + handle_len * 0.8 * sin_a - (hw-10) * cos_a),
        (hx + (hw-10) * sin_a, hy - (hw-10) * cos_a),
    ]
    draw.polygon(hl_pts, fill=(90, 90, 95, 255))

    # End cap
    end_cx = hx + handle_len * cos_a
    end_cy = hy + handle_len * sin_a
    cap_r = int(18 * scale)
    draw.ellipse([end_cx-cap_r, end_cy-cap_r, end_cx+cap_r, end_cy+cap_r],
                 fill=(85, 85, 90, 255))

    # --- Pan body ---
    pan_r = int(240 * scale)

    # Drop shadow
    for i in range(5):
        sr = pan_r + 5 - i
        alpha = 8 + i * 2
        draw.ellipse([cx-sr+8, cy-sr+10, cx+sr+8, cy+sr+10],
                     fill=(120, 40, 10, alpha))

    # Pan outer rim
    draw.ellipse([cx-pan_r, cy-pan_r, cx+pan_r, cy+pan_r],
                 fill=(65, 65, 70, 255))

    # Inner pan wall
    inner_r = int(220 * scale)
    draw.ellipse([cx-inner_r, cy-inner_r, cx+inner_r, cy+inner_r],
                 fill=(50, 50, 55, 255))

    # Cooking surface
    surface_r = int(205 * scale)
    draw.ellipse([cx-surface_r, cy-surface_r, cx+surface_r, cy+surface_r],
                 fill=(40, 40, 46, 255))

def draw_egg(draw, cx, cy, scale=1.0):
    """Clean fried egg — no outlines"""

    # Egg white base shape (overlapping smooth ellipses)
    white_color = (255, 255, 248, 250)

    # Main white blob
    shapes = [
        (0, 0, 82, 68),
        (-18, -12, 50, 48),
        (22, -8, 48, 52),
        (-8, 18, 52, 42),
        (14, 16, 42, 38),
        (-22, 4, 38, 42),
    ]
    for ox, oy, rx, ry in shapes:
        erx = int(rx * scale)
        ery = int(ry * scale)
        ecx = cx + int(ox * scale)
        ecy = cy + int(oy * scale)
        draw.ellipse([ecx-erx, ecy-ery, ecx+erx, ecy+ery], fill=white_color)

    # Yolk
    yolk_r = int(30 * scale)
    yolk_cy = cy - int(4 * scale)

    # Yolk base
    draw.ellipse([cx-yolk_r, yolk_cy-yolk_r, cx+yolk_r, yolk_cy+yolk_r],
                 fill=(255, 190, 35, 255))

    # Yolk bright center
    yolk_inner = int(20 * scale)
    draw.ellipse([cx-yolk_inner, yolk_cy-yolk_inner-int(2*scale),
                  cx+yolk_inner, yolk_cy+yolk_inner-int(2*scale)],
                 fill=(255, 210, 55, 255))

    # Yolk highlight
    hl_r = int(11 * scale)
    hl_x = cx - int(9 * scale)
    hl_y = yolk_cy - int(9 * scale)
    draw.ellipse([hl_x-hl_r, hl_y-hl_r, hl_x+hl_r, hl_y+hl_r],
                 fill=(255, 235, 140, 190))

    # Small highlight
    hl2_r = int(5 * scale)
    hl2_x = cx + int(7 * scale)
    hl2_y = yolk_cy - int(4 * scale)
    draw.ellipse([hl2_x-hl2_r, hl2_y-hl2_r, hl2_x+hl2_r, hl2_y+hl2_r],
                 fill=(255, 240, 175, 140))

def draw_leaf(draw, cx, cy, scale=1.0, angle=0):
    """Clean herb leaf"""
    cos_a = math.cos(math.radians(angle))
    sin_a = math.sin(math.radians(angle))

    leaf_len = int(42 * scale)
    leaf_w = int(18 * scale)

    top_pts = []
    bot_pts = []
    steps = 20
    for i in range(steps + 1):
        t = i / steps
        x = t * leaf_len
        w = leaf_w * math.sin(t * math.pi) * (1 - 0.2 * t)

        top_pts.append((
            cx + x * cos_a - w * sin_a,
            cy + x * sin_a + w * cos_a
        ))
        bot_pts.append((
            cx + x * cos_a + w * sin_a,
            cy + x * sin_a - w * cos_a
        ))

    leaf_pts = top_pts + list(reversed(bot_pts))

    # Shadow
    shadow = [(p[0]+2, p[1]+3) for p in leaf_pts]
    draw.polygon(shadow, fill=(25, 70, 15, 35))

    # Leaf body
    draw.polygon(leaf_pts, fill=(85, 170, 65, 240))

    # Vein
    vein_ex = cx + leaf_len * 0.85 * cos_a
    vein_ey = cy + leaf_len * 0.85 * sin_a
    draw.line([(cx, cy), (vein_ex, vein_ey)],
             fill=(55, 135, 40, 160), width=max(1, int(2*scale)))

def draw_steam(draw, cx, cy, scale=1.0):
    """Elegant steam wisps"""
    wisps = [(-40, 13, 0), (8, 16, 0.8), (48, 11, 1.6)]

    for ox, amp, phase in wisps:
        height = int(95 * scale)
        prev = None
        for y_step in range(0, height, 2):
            t = y_step / height
            x = cx + int(ox * scale) + int(amp * scale * math.sin(t * 3.0 + phase))
            y = cy - y_step
            if prev:
                alpha = int(50 * (1 - t) ** 1.8)
                w = max(2, int(4 * scale * (1 - t * 0.5)))
                if alpha > 3:
                    draw.line([prev, (x, y)], fill=(255, 255, 255, alpha), width=w)
            prev = (x, y)

def draw_spice_dots(draw, cx, cy, surface_r, scale=1.0):
    """Small pepper flakes scattered on pan"""
    import random
    random.seed(42)

    for _ in range(12):
        angle = random.uniform(0, 2 * math.pi)
        dist = random.uniform(0.25, 0.75) * surface_r
        x = cx + int(dist * math.cos(angle))
        y = cy + int(dist * math.sin(angle))

        # Don't overlap egg area
        egg_dist = math.sqrt((x - (cx - 25*scale))**2 + (y - cy)**2)
        if egg_dist < 90 * scale:
            continue

        r = random.uniform(2.5, 4) * scale
        alpha = random.randint(130, 190)
        draw.ellipse([x-r, y-r, x+r, y+r], fill=(195, 55, 30, alpha))

def main():
    img = Image.new('RGBA', (SIZE, SIZE), (0, 0, 0, 0))

    # Background gradient
    bg = Image.new('RGB', (SIZE, SIZE))
    create_gradient_background(bg)
    img.paste(bg)

    # Draw on overlay
    overlay = Image.new('RGBA', (SIZE, SIZE), (0, 0, 0, 0))
    draw = ImageDraw.Draw(overlay, 'RGBA')

    # Pan (centered)
    pan_cx = CENTER - 25
    pan_cy = CENTER + 15
    sc = 1.3

    draw_frying_pan(draw, pan_cx, pan_cy, scale=sc)

    # Egg (slightly left of center on pan)
    draw_egg(draw, pan_cx - int(20*sc), pan_cy - int(5*sc), scale=sc * 1.05)

    # Herb leaves (upper right area of pan)
    draw_leaf(draw, pan_cx + int(80*sc), pan_cy - int(70*sc), scale=sc*0.95, angle=-30)
    draw_leaf(draw, pan_cx + int(60*sc), pan_cy - int(95*sc), scale=sc*0.75, angle=-55)
    draw_leaf(draw, pan_cx + int(95*sc), pan_cy - int(48*sc), scale=sc*0.6, angle=-10)

    # Pepper flakes
    draw_spice_dots(draw, pan_cx, pan_cy, int(205*sc), scale=sc)

    # Steam
    draw_steam(draw, pan_cx - int(15*sc), pan_cy - int(255*sc), scale=sc * 1.0)

    # Composite
    img = Image.alpha_composite(img.convert('RGBA'), overlay)

    # Convert to RGB
    final = Image.new('RGB', (SIZE, SIZE), (255, 100, 45))
    final.paste(img, mask=img.split()[3])

    # Save all
    assets_dir = os.path.join(os.path.dirname(__file__), '..', 'assets')

    final.save(os.path.join(assets_dir, 'icon.png'), 'PNG', quality=100)
    print("icon.png")

    final.save(os.path.join(assets_dir, 'splash-icon.png'), 'PNG', quality=100)
    print("splash-icon.png")

    favicon = final.resize((48, 48), Image.Resampling.LANCZOS)
    favicon.save(os.path.join(assets_dir, 'favicon.png'), 'PNG')
    print("favicon.png")

    final.save(os.path.join(assets_dir, 'android-icon-foreground.png'), 'PNG', quality=100)
    print("android-icon-foreground.png")

    android_bg = Image.new('RGB', (SIZE, SIZE), (255, 107, 53))
    android_bg.save(os.path.join(assets_dir, 'android-icon-background.png'), 'PNG')
    print("android-icon-background.png")

    mono = Image.new('RGB', (SIZE, SIZE), (255, 255, 255))
    mono.save(os.path.join(assets_dir, 'android-icon-monochrome.png'), 'PNG')
    print("android-icon-monochrome.png")

    print("\nDone!")

if __name__ == '__main__':
    main()
