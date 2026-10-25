"""Generate every EasyWay icon from one design: web/PWA icons, Android launcher
and splash images, and the Play Store icon and feature graphic.

Run from the repo root: python3 scripts/make-icons.py
"""
import glob
import os

from PIL import Image, ImageDraw, ImageFont

BLUE = '#1d4ed8'
RED = '#ef4444'
BOLD = '/usr/share/fonts/truetype/liberation/LiberationSans-Bold.ttf'
RES = 'android/app/src/main/res'


def mark(img, cx, cy, size):
    """Draw the EasyWay mark (white E with a red location dot) centred at cx, cy."""
    d = ImageDraw.Draw(img)
    d.text((cx, cy), 'E', font=ImageFont.truetype(BOLD, int(size * 0.62)), fill='white', anchor='mm')
    r = size * 0.075
    x, y = cx + size * 0.24, cy + size * 0.24
    d.ellipse([x - r, y - r, x + r, y + r], fill=RED)


def square(size, bg=BLUE):
    img = Image.new('RGBA', (size, size), bg)
    mark(img, size / 2, size / 2, size)
    return img


def round_icon(size):
    img = square(size)
    mask = Image.new('L', (size, size), 0)
    ImageDraw.Draw(mask).ellipse([0, 0, size - 1, size - 1], fill=255)
    img.putalpha(mask)
    return img


def foreground(size):
    # Adaptive icons crop to the centre 66%, so the mark sits in that zone.
    img = Image.new('RGBA', (size, size), (0, 0, 0, 0))
    mark(img, size / 2, size / 2, size * 0.6)
    return img


# Web / PWA
for s in (192, 512):
    square(s).convert('RGB').save(f'public/icon-{s}.png')

# Android launcher icons (legacy, round and adaptive foreground)
DENSITY = {'mdpi': 1, 'hdpi': 1.5, 'xhdpi': 2, 'xxhdpi': 3, 'xxxhdpi': 4}
for name, k in DENSITY.items():
    d = f'{RES}/mipmap-{name}'
    square(int(48 * k)).save(f'{d}/ic_launcher.png')
    round_icon(int(48 * k)).save(f'{d}/ic_launcher_round.png')
    foreground(int(108 * k)).save(f'{d}/ic_launcher_foreground.png')

with open(f'{RES}/values/ic_launcher_background.xml', 'w') as f:
    f.write('<?xml version="1.0" encoding="utf-8"?>\n<resources>\n'
            f'    <color name="ic_launcher_background">{BLUE.upper()}</color>\n</resources>\n')

# Splash screens: keep each file's size, replace the artwork
for path in glob.glob(f'{RES}/drawable*/splash.png'):
    w, h = Image.open(path).size
    img = Image.new('RGB', (w, h), BLUE)
    mark(img, w / 2, h / 2, min(w, h) * 0.35)
    img.save(path)

# Play Store listing graphics
os.makedirs('store', exist_ok=True)
square(512).convert('RGB').save('store/play-icon-512.png')
fg = Image.new('RGB', (1024, 500), BLUE)
mark(fg, 230, 250, 340)
d = ImageDraw.Draw(fg)
d.text((440, 200), 'EasyWay', font=ImageFont.truetype(BOLD, 110), fill='white', anchor='lm')
d.text((444, 300), 'Beat traffic. Skip tolls. Get help fast.', font=ImageFont.truetype(BOLD, 28),
       fill='#bfdbfe', anchor='lm')
fg.save('store/feature-graphic-1024x500.png')
print('icons written')
