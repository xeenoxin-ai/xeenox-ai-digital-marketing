"""Original 30 s soundtrack for the SkyPool reel (no samples, no third-party audio).

Upbeat tropical-house in D major at 120 BPM, synthesised from scratch with numpy/scipy.
Every scene change in reel.html lands on a beat (4.0, 9.5, 15.5, 19.5, 23.5, 26.5 s):
the drop hits at 4.0 s and a water "whoosh" peaks on each wipe.

    python3 music.py            -> assets/music.wav (48 kHz stereo, loudness-normalised later by render.mjs)
"""
import os
import wave

import numpy as np
from scipy.signal import butter, fftconvolve, sosfilt

SR = 48000
DUR = 30.0
BPM = 120
BEAT = 60 / BPM            # 0.5 s
BAR = 4 * BEAT             # 2.0 s
S16 = BEAT / 4             # 16th note
N = int(SR * DUR)
SCENE_CUTS = [4.0, 9.5, 15.5, 19.5, 23.5, 26.5]
DROP, END_HIT = 4.0, 29.0

rng = np.random.default_rng(7)
L = np.zeros(N)
R = np.zeros(N)


def mtof(m):
    return 440.0 * 2 ** ((m - 69) / 12)


def add(sig, t0, gain=1.0, pan=0.0):
    """Mix a mono signal into the stereo bus at time t0 (pan -1..1)."""
    i = int(t0 * SR)
    if i >= N:
        return
    sig = sig[: N - i] * gain
    lg, rg = np.cos((pan + 1) * np.pi / 4), np.sin((pan + 1) * np.pi / 4)
    L[i : i + len(sig)] += sig * lg * 1.414
    R[i : i + len(sig)] += sig * rg * 1.414


def filt(x, kind, f):
    return sosfilt(butter(4, f, kind, fs=SR, output="sos"), x)


def tail(x, ms=12):
    """Fade the last few ms so truncated notes never click."""
    k = min(len(x), int(ms * SR / 1000))
    x[-k:] *= np.linspace(1, 0, k)
    return x


def env(n, a=0.005, d=0.3):
    t = np.arange(n) / SR
    return tail(np.minimum(1, t / a) * np.exp(-t / d))


def saw(f, n, detune=0.0):
    t = np.arange(n) / SR
    ph = (t * f * 2 ** (detune / 1200) + rng.random()) % 1.0
    return 2 * ph - 1


def sweep_filter(x, f0, f1, q=0.7):
    """State-variable band-pass whose centre glides f0 -> f1 (exponential)."""
    n = len(x)
    fc = f0 * (f1 / f0) ** (np.arange(n) / max(1, n - 1))
    out = np.zeros(n)
    low = band = 0.0
    for i in range(n):
        f = 2 * np.sin(np.pi * fc[i] / SR)
        high = x[i] - low - q * band
        band += f * high
        low += f * band
        out[i] = band
    return out


# ---------------- harmony: D - A - Bm - G (one chord per bar) ----------------
CHORDS = [[62, 66, 69, 74], [61, 64, 69, 73], [59, 62, 66, 71], [59, 62, 67, 71]]
ROOTS = [38, 33, 35, 31]
MELODY_A = [
    [(0, 74), (3, 78), (6, 81), (8, 78), (10, 76), (12, 74), (14, 76)],
    [(0, 73), (3, 76), (6, 81), (8, 76), (10, 73), (12, 71), (14, 73)],
    [(0, 74), (3, 78), (6, 83), (8, 81), (10, 78), (12, 76), (14, 74)],
    [(0, 71), (3, 74), (6, 79), (8, 78), (10, 76), (12, 74), (14, 71)],
]
MELODY_B = [
    [(0, 81), (2, 78), (4, 76), (6, 78), (8, 81), (11, 83), (14, 81)],
    [(0, 76), (2, 73), (4, 76), (6, 81), (8, 80), (11, 76), (14, 73)],
    [(0, 78), (2, 81), (4, 83), (6, 81), (8, 78), (11, 76), (14, 74)],
    [(0, 79), (2, 78), (4, 76), (6, 74), (8, 71), (11, 74), (14, 76)],
]
NBARS = int(DUR / BAR)

pad_bus = np.zeros(N)
lead_bus = np.zeros(N)
fx_bus = np.zeros(N)

# ---------------- kick / clap / hats ----------------
def kick():
    n = int(0.45 * SR)
    t = np.arange(n) / SR
    f = 48 + 120 * np.exp(-t / 0.035)
    ph = 2 * np.pi * np.cumsum(f) / SR
    return tail(np.sin(ph) * np.exp(-t / 0.22) + 0.3 * rng.standard_normal(n) * np.exp(-t / 0.004), 40)


def clap():
    n = int(0.35 * SR)
    noise = filt(rng.standard_normal(n), "bandpass", [900, 3500])
    e = np.zeros(n)
    for k, off in enumerate([0, 0.011, 0.022]):
        i = int(off * SR)
        e[i:] += env(n - i, 0.001, 0.012 if k < 2 else 0.12)
    return noise * e


def hat(open_=False):
    n = int((0.25 if open_ else 0.08) * SR)
    return filt(rng.standard_normal(n), "highpass", 7000) * env(n, 0.001, 0.09 if open_ else 0.025)


KICK, CLAP = kick(), clap()
kick_times = []

for b in range(NBARS):
    t0 = b * BAR
    groove = t0 >= DROP and t0 < END_HIT
    for beat in range(4):
        tb = t0 + beat * BEAT
        if groove and tb < END_HIT:
            add(KICK, tb, 0.95)
            kick_times.append(tb)
            if beat in (1, 3):
                add(CLAP, tb, 0.42, 0.05)
            add(hat(open_=True), tb + BEAT / 2, 0.16, 0.3)
            for s in (1, 3):
                add(hat(), tb + s * S16, 0.09, -0.35)
        elif not groove and t0 < DROP and beat in (0, 2) and b == 1:
            add(KICK, tb, 0.45)          # soft pulse in the build bar

# snare build into the drop (last bar of the intro)
for k in range(16):
    tb = DROP - BAR + k * S16 if k < 8 else DROP - BEAT * 2 + (k - 8) * (S16 / 2)
    add(CLAP, tb, 0.12 + 0.025 * k, 0)

# ---------------- sidechain envelope ----------------
side = np.ones(N)
for kt in kick_times:
    i = int(kt * SR)
    n = min(int(0.3 * SR), N - i)
    t = np.arange(n) / SR
    side[i : i + n] = np.minimum(side[i : i + n], 1 - 0.65 * np.exp(-t / 0.09))

# ---------------- pad (supersaw chords) ----------------
for b in range(NBARS):
    t0 = b * BAR
    if t0 >= END_HIT:
        break
    n = int(BAR * SR) + int(0.2 * SR)
    chord = CHORDS[b % 4]
    sig = np.zeros(n)
    for m in chord:
        for dt in (-9, 0, 9):
            sig += saw(mtof(m), n, dt)
    t = np.arange(n) / SR
    e = np.minimum(1, t / 0.08) * np.minimum(1, np.maximum(0, (BAR + 0.2 - t) / 0.2))
    cutoff = 1200 + (2200 if t0 >= DROP else 1600 * (t0 + 1) / DROP)
    pad_bus[int(t0 * SR) : int(t0 * SR) + n][: N - int(t0 * SR)] += (filt(sig, "lowpass", cutoff) * e * 0.05)[: N - int(t0 * SR)]

# ---------------- bass (offbeat tropical pump) ----------------
bass_bus = np.zeros(N)
for b in range(NBARS):
    t0 = b * BAR
    if t0 < DROP or t0 >= END_HIT:
        continue
    root = ROOTS[b % 4]
    for beat in range(4):
        for step, m in ((2, root + 12), (3, root + 12)) if beat == 3 else ((2, root + 12),):
            ts = t0 + beat * BEAT + step * S16
            n = int(0.22 * SR)
            sig = saw(mtof(m), n) * 0.6 + np.sin(2 * np.pi * mtof(m - 12) * np.arange(n) / SR)
            sig = filt(sig, "lowpass", 600) * env(n, 0.004, 0.14)
            i = int(ts * SR)
            bass_bus[i : i + n] += sig[: N - i] * 0.38

# ---------------- lead pluck (marimba-ish) ----------------
def pluck(m, dur=0.45):
    n = int(dur * SR)
    t = np.arange(n) / SR
    f = mtof(m)
    sig = np.sin(2 * np.pi * f * t) + 0.35 * np.sin(2 * np.pi * 4 * f * t) * np.exp(-t / 0.03) + 0.2 * np.sin(2 * np.pi * 2 * f * t)
    return sig * env(n, 0.002, 0.16)


for b in range(NBARS):
    t0 = b * BAR
    if t0 >= END_HIT:
        break
    if t0 < DROP:
        # intro: gentle arpeggio of the chord
        for k in range(8):
            m = CHORDS[b % 4][k % 4] + 12
            lead_bus_i = int((t0 + k * BEAT / 2) * SR)
            p = pluck(m) * (0.12 + 0.03 * k)
            lead_bus[lead_bus_i : lead_bus_i + len(p)] += p[: N - lead_bus_i]
        continue
    mel = (MELODY_B if 6 <= b <= 9 else MELODY_A)[b % 4]
    for step, m in mel:
        i = int((t0 + step * S16) * SR)
        p = pluck(m) * 0.26
        lead_bus[i : i + len(p)] += p[: N - i]

# dotted-8th delay on the lead
delayed = np.zeros(N)
d = int(0.375 * SR)
src = lead_bus.copy()
for k in range(1, 4):
    delayed[d * k :] += src[: N - d * k] * (0.33 ** k)

# ---------------- FX: splash, riser, crash, whooshes ----------------
def noise_burst(dur, f0, f1, a, d, q=0.6):
    n = int(dur * SR)
    return sweep_filter(rng.standard_normal(n), f0, f1, q) * env(n, a, d)


add(noise_burst(1.2, 3000, 600, 0.01, 0.35, 1.2), 0.0, 0.5, -0.2)                 # opening splash
riser = noise_burst(BAR, 300, 7000, BAR * 0.95, 99, 0.5) * np.linspace(0, 1, int(BAR * SR)) ** 2
add(riser, DROP - BAR, 0.55, 0.0)


def crash(dur=1.8):
    n = int(dur * SR)
    return filt(rng.standard_normal(n), "highpass", 4500) * env(n, 0.002, 0.55)


add(crash(), DROP, 0.32, 0.25)
for c in SCENE_CUTS[1:]:
    n = int(0.9 * SR)
    sig = sweep_filter(rng.standard_normal(n), 250, 5000, 0.45)
    t = np.arange(n) / SR
    sig *= np.exp(-((t - 0.45) ** 2) / (2 * 0.12 ** 2))              # peak on the cut
    add(sig, c - 0.45, 0.55, 0.0)
    add(crash(1.0), c, 0.12, -0.25)

# final hit: full chord + kick + crash, ringing out
fin = np.zeros(int(1.0 * SR))
for m in CHORDS[0] + [50]:
    fin += np.concatenate([saw(mtof(m), len(fin), dt) for dt in (0,)]) * 0.5
fin = filt(fin, "lowpass", 3000) * env(len(fin), 0.004, 0.45) * 0.1
add(fin, END_HIT, 1.0, 0)
add(KICK, END_HIT, 1.0)
add(crash(1.0), END_HIT, 0.35, 0.2)
for m in (74, 78, 81, 86):
    add(pluck(m, 1.0), END_HIT, 0.18, 0.2)

# ---------------- reverb + mix ----------------
ir_n = int(1.4 * SR)
ir = rng.standard_normal(ir_n) * np.exp(-np.arange(ir_n) / SR / 0.35)
ir /= np.sqrt(np.sum(ir ** 2))

pad = pad_bus * side
lead = lead_bus + delayed * 0.6
wet = fftconvolve(pad * 0.5 + lead * 0.6, ir)[:N] * 0.25

L += pad * 0.9 + lead * 0.85 + delayed * 0.25 + wet + bass_bus * side
R += pad * 0.9 + lead * 0.75 + np.roll(delayed, int(0.012 * SR)) * 0.35 + np.roll(wet, 240) + bass_bus * side

# gentle fade at the very end
fade = np.ones(N)
fn = int(0.35 * SR)
fade[-fn:] = np.linspace(1, 0, fn)
L *= fade
R *= fade

peak = max(np.abs(L).max(), np.abs(R).max())
st = np.stack([L, R], 1) / peak * 0.89
st = np.tanh(st * 1.15) / np.tanh(1.15)          # soft-clip glue

out = os.path.join(os.path.dirname(os.path.abspath(__file__)), "assets", "music.wav")
with wave.open(out, "wb") as w:
    w.setnchannels(2)
    w.setsampwidth(2)
    w.setframerate(SR)
    w.writeframes((st * 32767).astype("<i2").tobytes())
print("wrote", out)
