"""Original 30 s soundtrack for the Trioz Steel reel, synthesised from scratch (royalty-free).

    python3 music.py            -> assets/music.m4a (mastered to -14 LUFS, AAC 192k)

120 BPM in A minor, so the scene cuts at 3.0 / 5.5 / 10.0 / 14.5 / 19.0 / 21.5 / 24.5 s
land on the beat. Sound design follows the picture (see index.html):
steel-shutter whooshes on every wipe, a door-latch clunk on each main-door swing,
weld crackle under the process steps, a bass drop for Petra, a build into the logo hit.
Needs numpy and ffmpeg.
"""
import os
import subprocess
import tempfile
import wave

import numpy as np

SR = 48000
DUR = 30.0
N = int(SR * DUR)
HERE = os.path.dirname(os.path.abspath(__file__))
OUT = os.path.join(HERE, 'assets', 'music.m4a')
rng = np.random.default_rng(7)

# two buses (dry L/R) plus a reverb send
L, R = np.zeros(N), np.zeros(N)
SL, SR_ = np.zeros(N), np.zeros(N)


def tt(d):
    return np.arange(int(d * SR)) / SR


def filt(x, lo=None, hi=None, order=2):
    """Zero-phase Butterworth-magnitude band filter via FFT."""
    n = len(x)
    f = np.fft.rfftfreq(n, 1 / SR)
    h = np.ones_like(f)
    if lo:
        h *= 1 / np.sqrt(1 + (lo / np.maximum(f, 1e-3)) ** (2 * order))
    if hi:
        h *= 1 / np.sqrt(1 + (f / hi) ** (2 * order))
    return np.fft.irfft(np.fft.rfft(x) * h, n)


def noise(d):
    return rng.standard_normal(int(d * SR))


def place(sig, t, gain=1.0, pan=0.0, send=0.0):
    """Mix a mono (n,) or stereo (n, 2) signal in at t seconds."""
    i = int(round(t * SR))
    if i >= N or t < 0:
        return
    s = sig[: N - i] * gain
    if s.ndim == 1:
        a = (pan + 1) * np.pi / 4
        l, r = s * np.cos(a), s * np.sin(a)
    else:
        l, r = s[:, 0], s[:, 1]
    L[i:i + len(l)] += l
    R[i:i + len(r)] += r
    if send:
        SL[i:i + len(l)] += l * send
        SR_[i:i + len(r)] += r * send


def sweep(f0, f1, d, curve=0.03):
    t = tt(d)
    f = f1 + (f0 - f1) * np.exp(-t / curve)
    return 2 * np.pi * np.cumsum(f) / SR


# ---------- instruments ----------
def kick():
    t = tt(0.45)
    ph = sweep(150, 45, 0.45, 0.03)
    s = np.sin(ph) * np.exp(-t / 0.16) + 0.25 * np.sin(2 * ph) * np.exp(-t / 0.02)
    click = filt(noise(0.45), lo=2000) * np.exp(-t / 0.004) * 0.3
    return np.tanh((s + click) * 1.6)


def clap():
    t = tt(0.3)
    n = filt(noise(0.3), lo=900, hi=5000)
    env = np.zeros(len(t))
    for k, o in enumerate([0, 0.011, 0.022]):
        i = int(o * SR)
        env[i:] += np.exp(-t[: len(t) - i] / (0.008 if k < 2 else 0.12))
    return n * env * 0.5


def hat(open_=False):
    d = 0.25 if open_ else 0.06
    t = tt(d)
    return filt(noise(d), lo=7000) * np.exp(-t / (0.09 if open_ else 0.018)) * 0.35


def saw(freq, d, cut=1200, harm=40):
    t = tt(d)
    s = np.zeros(len(t))
    for k in range(1, harm + 1):
        fk = freq * k
        if fk > 12000:
            break
        s += np.sin(2 * np.pi * fk * t) / k / np.sqrt(1 + (fk / cut) ** 4)
    return s


def bass(freq, d=0.24):
    t = tt(d)
    env = np.minimum(1, t / 0.004) * np.exp(-t / 0.11)
    return (0.6 * saw(freq, d, cut=380) + 0.7 * np.sin(2 * np.pi * freq * t)) * env


def pad(freqs, d, cut=1500, att=0.35, rel=0.5):
    t = tt(d)
    env = np.minimum(1, t / att) * np.minimum(1, np.maximum(0, (d - t) / rel))
    l = sum(saw(f * 2 ** (-7 / 1200), d, cut, 10) for f in freqs)
    r = sum(saw(f * 2 ** (7 / 1200), d, cut, 10) for f in freqs)
    return np.stack([l * env, r * env], 1) / len(freqs)


def pluck(freq, d=0.2):
    t = tt(d)
    return (np.sin(2 * np.pi * freq * t) + 0.3 * np.sin(4 * np.pi * freq * t)) * np.exp(-t / 0.07)


def clunk():
    """Steel door latch: thump + inharmonic metal partials + click."""
    t = tt(0.6)
    parts = [(180, .08, 1.0), (431, .12, .6), (967, .09, .4), (1612, .06, .3), (2730, .04, .2)]
    metal = sum(a * np.sin(2 * np.pi * f * t) * np.exp(-t / d) for f, d, a in parts)
    thump = np.sin(sweep(140, 55, 0.6, 0.02)) * np.exp(-t / 0.08)
    click = filt(noise(0.6), lo=1500) * np.exp(-t / 0.006)
    return (0.5 * metal + thump + 0.4 * click) * 0.7


def tick(freq=2400):
    t = tt(0.12)
    return (np.sin(2 * np.pi * freq * t) + 0.5 * np.sin(2 * np.pi * freq * 2.7 * t)) * np.exp(-t / 0.018) * 0.5


def impact(d=2.5):
    t = tt(d)
    sub = np.sin(sweep(110, 38, d, 0.05)) * np.exp(-t / 0.6)
    crash = filt(noise(d), lo=200, hi=6000) * np.exp(-t / 0.3) * 0.45
    ring = sum(a * np.sin(2 * np.pi * f * t) * np.exp(-t / dd)
               for f, dd, a in [(110, 1.2, .3), (277, .9, .2), (523, .7, .12), (1046, .5, .06)])
    return np.tanh((sub + crash + ring) * 1.3)


def riser(d):
    t = tt(d)
    x = t / d
    n = noise(d)
    body = (1 - x) * filt(n, hi=900) + x * filt(n, lo=2500)
    tone = 0.25 * np.sin(2 * np.pi * np.cumsum(150 * (8 ** x)) / SR)
    return (body * 0.5 + tone) * x ** 2.2


def whoosh(d=0.6):
    """Steel shutter sweep: band-limited noise that brightens through the middle."""
    t = tt(d)
    x = t / d
    n = noise(d)
    bright = np.sin(np.pi * x) ** 2
    body = (1 - bright) * filt(n, lo=200, hi=1200) + bright * filt(n, lo=1500, hi=8000)
    return body * np.sin(np.pi * x) ** 1.5 * 0.9


def crackle(d):
    """Weld crackle: sparse random pops, bandpassed."""
    s = np.zeros(int(d * SR))
    idx = rng.integers(0, len(s), int(d * 350))
    s[idx] = rng.standard_normal(len(idx)) * rng.random(len(idx)) ** 3
    s = filt(s, lo=1800, hi=9000)
    return s * 4


def reverse_swell(d):
    t = tt(d)
    return filt(noise(d), lo=3000) * (t / d) ** 4 * 0.5


def bell(freq, d=1.6):
    t = tt(d)
    return sum(a * np.sin(2 * np.pi * freq * m * t) * np.exp(-t / dd)
               for m, a, dd in [(1, 1, .9), (2.76, .4, .5), (5.4, .2, .3)]) * 0.5


# ---------- harmony ----------
A1, C2, D2, E2, F1, G1 = 55.0, 65.41, 73.42, 82.41, 43.65, 49.0
CHORDS = [  # (bass root, pad voicing) for Am | F | C | G
    (A1, [220.0, 261.63, 329.63]),
    (F1 * 2, [174.61, 220.0, 261.63]),
    (C2, [196.0, 261.63, 329.63]),
    (G1 * 2, [196.0, 246.94, 293.66]),
]


def chord_at(t):
    return CHORDS[int((t - 3.0) // 2) % 4]


# ---------- arrangement ----------
CUTS = [5.5, 10.0, 14.5, 19.0, 21.5, 24.5, 26.8]

# 0–3 s  HOOK: drone, riser, hit as the counter lands on "90", second riser into the cut
place(saw(A1, 3.0, cut=300) * np.minimum(1, tt(3.0) / 1.2), 0, 0.35)
place(riser(1.5), 0.0, 0.6, send=0.2)
place(impact(1.5), 1.5, 0.55, send=0.3)
place(kick(), 1.5, 0.8)
place(pad([220.0, 261.63, 329.63], 1.6, cut=900, att=0.6), 1.5, 0.35, send=0.4)
for i, t in enumerate(np.arange(1.75, 3.0, 0.125)):
    place(hat(), t, 0.3 + 0.5 * i / 10, pan=0.3 * (-1) ** i)
place(riser(1.2), 1.8, 0.5)
place(impact(), 3.0, 0.8, send=0.3)

# 3–21.5 s  GROOVE
for t in np.arange(3.0, 21.5, 0.5):
    place(kick(), t, 0.55)
    place(hat(), t + 0.25, 0.45, pan=0.2)
    if t >= 5.5 and round((t - 3.0) / 0.5) % 2 == 1:
        place(clap(), t, 0.5, send=0.25)
    if round((t - 3.0) / 0.5) % 4 == 3:
        place(hat(True), t + 0.25, 0.35, pan=-0.2)
for t in np.arange(10.0, 21.5, 0.25):
    place(hat(), t + 0.125, 0.22, pan=-0.35)
for k, t in enumerate(np.arange(3.0, 21.5, 0.25)):
    root, _ = chord_at(t)
    place(bass(root * (2 if k % 4 == 3 else 1)), t, 0.38)
for t in np.arange(3.0, 21.5, 2.0):
    _, voicing = chord_at(t)
    place(pad(voicing, 2.3, cut=1400), t, 0.22, send=0.5)
# arpeggio from the main-doors scene on, ping-pong echoes
for k, t in enumerate(np.arange(10.0, 21.5, 0.125)):
    _, voicing = chord_at(t)
    f = voicing[[0, 1, 2, 1][k % 4]] * 2
    pan = 0.45 * (-1) ** k
    place(pluck(f), t, 0.16, pan=pan, send=0.3)
    place(pluck(f), t + 0.375, 0.06, pan=-pan)

# SFX locked to picture
place(crackle(1.4) * np.sin(np.pi * tt(1.4) / 1.4), 3.55, 0.25, pan=0.2)       # weld line
for i in range(4):
    place(tick(1800), 3.65 + i * 0.32, 0.3)                                     # process steps
for i in range(5):
    place(tick(2600), 7.0 + i * 0.22, 0.16, pan=0.3 * (i - 2))                  # single-door chips
for i in range(6):
    place(clunk(), 10.6 + i * 0.62 + 0.62, 0.55, send=0.2)                      # main-door swings close
for i in range(6):
    place(tick(2200), 15.9 + i * 0.38, 0.16)                                    # window style chips
for k in range(1, 6):
    place(tick(3000), 19.45 + k * 0.33, 0.12)                                   # frame finishes
for c in CUTS:
    place(whoosh(), c - 0.3, 0.55, send=0.15)                                   # steel-shutter wipes
for c in [5.5, 10.0, 14.5, 19.0]:
    place(impact(1.2), c, 0.75, send=0.2)

# 21.5–24.5 s  PETRA: drop to bass and boom
place(impact(3.0), 21.5, 0.95, send=0.4)
dark = [(21.5, [146.83, 174.61, 220.0], D2), (23.0, [164.81, 207.65, 246.94], E2)]
for t, voicing, root in dark:
    place(pad(voicing, 1.7, cut=800, att=0.2), t, 0.4, send=0.6)
    place(saw(root, 1.5, cut=220) * np.exp(-tt(1.5) / 0.9), t, 0.5)
for t in [22.5, 23.5]:
    place(kick(), t, 0.5)
place(reverse_swell(1.0), 23.5, 0.6)

# 24.5–27 s  BUILD into the logo hit
for t in np.arange(24.5, 26.5, 0.5):
    place(kick(), t, 0.55)
for t in np.arange(26.5, 26.95, 0.25):
    place(kick(), t, 0.6)
roll = list(np.arange(24.5, 25.5, 0.25)) + list(np.arange(25.5, 26.5, 0.125)) + list(np.arange(26.5, 26.95, 0.0625))
for t in roll:
    place(clap(), t, 0.2 + 0.35 * (t - 24.5) / 2.45, send=0.2)
for t, f in zip(np.arange(24.5, 26.95, 0.25), [A1, A1, C2, C2, D2, D2, E2, E2, E2 * 2, E2 * 2]):
    place(bass(f), t, 0.38)
place(pad([174.61, 220.0, 261.63], 1.1, cut=1600), 24.5, 0.22, send=0.5)
place(pad([196.0, 246.94, 293.66], 1.45, cut=2200), 25.5, 0.25, send=0.5)
place(riser(2.45), 24.5, 0.45)

# 27–30 s  BRAND CLOSE: hit, A minor add9 ring-out, chime as the URL lands
place(impact(3.0), 27.0, 1.0, send=0.5)
place(pad([220.0, 261.63, 329.63, 493.88], 3.0, cut=1800, att=0.05, rel=2.6), 27.0, 0.4, send=0.7)
place(np.sin(2 * np.pi * A1 * tt(3.0)) * np.exp(-tt(3.0) / 1.0), 27.0, 0.5)
place(bell(880.0), 28.1, 0.28, send=0.6)
place(bell(1318.5), 28.35, 0.16, pan=0.3, send=0.6)

# ---------- reverb (synthetic plate, FFT convolution) ----------
def reverb(x, seed):
    g = np.random.default_rng(seed)
    t = tt(2.2)
    ir = filt(g.standard_normal(len(t)), lo=200, hi=7000) * np.exp(-t / 0.55)
    ir /= np.sqrt(np.sum(ir ** 2))
    n = len(x) + len(ir)
    y = np.fft.irfft(np.fft.rfft(x, n) * np.fft.rfft(ir, n), n)[: len(x)]
    return y


L += reverb(SL, 1) * 0.5
R += reverb(SR_, 2) * 0.5

# ---------- bounce + master ----------
mix = np.stack([L, R], 1)
fade = np.ones(N)
fade[-int(0.35 * SR):] = np.linspace(1, 0, int(0.35 * SR))
mix *= fade[:, None]
mix /= np.max(np.abs(mix)) * 1.05

with tempfile.TemporaryDirectory() as d:
    raw = os.path.join(d, 'mix.wav')
    with wave.open(raw, 'wb') as w:
        w.setnchannels(2)
        w.setsampwidth(2)
        w.setframerate(SR)
        w.writeframes((mix * 32767).astype('<i2').tobytes())
    # Linear gain to the social-platform target (-14 LUFS) so the arrangement keeps its
    # dynamics (quiet intro, Petra drop, build); a brickwall limiter catches the hits.
    glue = 'acompressor=threshold=-18dB:ratio=2:attack=10:release=150'
    meter = subprocess.run(['ffmpeg', '-hide_banner', '-nostats', '-i', raw, '-af', f'{glue},ebur128', '-f', 'null', '-'],
                           capture_output=True, text=True).stderr
    measured = float(meter.rsplit('I:', 1)[1].split('LUFS')[0])
    gain = -14.0 - measured
    subprocess.run([
        'ffmpeg', '-y', '-loglevel', 'error', '-i', raw,
        '-af', f'{glue},volume={gain:.2f}dB,alimiter=limit=0.75:attack=2:release=80:level=disabled',
        '-t', str(DUR), '-c:a', 'aac', '-b:a', '192k', OUT,
    ], check=True)
print('Wrote', OUT)
