"""Original 30s upbeat track (120 BPM, F major) + SFX synced to anim.js. Writes music.wav."""
import numpy as np
from scipy.signal import butter, sosfilt, fftconvolve
import wave, sys

SR = 48000
DUR = 30.0
N = int(SR * DUR)
BEAT = 0.5
rng = np.random.default_rng(7)
L = np.zeros(N); R = np.zeros(N)


def mtof(m): return 440.0 * 2 ** ((m - 69) / 12)
def tt(d): return np.arange(int(d * SR)) / SR
def lp(x, f, o=2): return sosfilt(butter(o, f, 'low', fs=SR, output='sos'), x)
def hp(x, f, o=2): return sosfilt(butter(o, f, 'high', fs=SR, output='sos'), x)
def bp(x, lo, hi, o=2): return sosfilt(butter(o, [lo, hi], 'band', fs=SR, output='sos'), x)


def add(sig, t0, gain=1.0, pan=0.0, bus=None):
    i = int(t0 * SR)
    if i >= N: return
    s = sig[:N - i] * gain
    (bus or (L, R))[0][i:i + len(s)] += s * np.sqrt((1 - pan) / 2)
    (bus or (L, R))[1][i:i + len(s)] += s * np.sqrt((1 + pan) / 2)


def saw(f, t, det=0.0):
    ph = (f * (1 + det)) * t
    return 2 * (ph - np.floor(ph + 0.5))


# ---------- instruments ----------
def kick():
    t = tt(0.45)
    f = 45 + 110 * np.exp(-t * 28)
    ph = 2 * np.pi * np.cumsum(f) / SR
    return np.sin(ph) * np.exp(-t * 7.5) + 0.25 * np.exp(-t * 300) * rng.standard_normal(len(t))


def clap():
    t = tt(0.3)
    n = bp(rng.standard_normal(len(t)), 900, 3500)
    env = np.exp(-t * 18)
    for d in (0.0, 0.011, 0.022):
        env += 0.6 * np.exp(-np.clip(t - d, 0, None) * 160) * (t >= d)
    return n * env * 0.7


def hat(open_=False):
    t = tt(0.35 if open_ else 0.06)
    return hp(rng.standard_normal(len(t)), 7000) * np.exp(-t * (9 if open_ else 70))


def crash():
    t = tt(2.2)
    return hp(rng.standard_normal(len(t)), 4500) * np.exp(-t * 2.2)


def mallet(m, d=0.5):
    t = tt(d + 0.4)
    f = mtof(m)
    s = np.sin(2 * np.pi * f * t) * np.exp(-t * 6) + 0.35 * np.sin(2 * np.pi * f * 4 * t) * np.exp(-t * 22)
    s += 0.25 * lp(saw(f, t), 2500) * np.exp(-t * 9)
    return s * np.minimum(1, t * 400)


def pluck(m, d=0.25):
    t = tt(d + 0.2)
    f = mtof(m)
    s = lp(saw(f, t) + saw(f, t, 0.004), 1800)
    return s * np.exp(-t * 12) * np.minimum(1, t * 600)


def bass(m, d=0.25):
    t = tt(d)
    f = mtof(m)
    s = np.tanh(1.6 * lp(saw(f, t) + 0.6 * np.sin(2 * np.pi * f / 2 * t), 700))
    env = np.minimum(1, t * 300) * np.exp(-t * 4) * np.minimum(1, (d - t) * 80)
    return s * env


def pad(ms, d, det_sign=1):
    t = tt(d)
    s = sum(saw(mtof(m), t, det_sign * 0.006) + saw(mtof(m), t, -det_sign * 0.003) for m in ms)
    s = lp(s, 1600)
    env = np.minimum(1, t / 0.25) * np.minimum(1, (d - t) / 0.2)
    return s * env / len(ms)


# ---------- arrangement ----------
CH = [  # (bass root, pad voicing, arp tones) — F  C  Dm  Bb
    (41, [65, 69, 72], [65, 69, 72, 77]),
    (36, [64, 67, 72], [64, 67, 72, 76]),
    (38, [65, 69, 74], [62, 65, 69, 74]),
    (34, [65, 70, 74], [62, 65, 70, 74]),
]
MEL = [
    [(0, 77, 1), (1, 81, 1), (2, 84, 2), (4, 81, 1), (5, 79, 1), (6, 77, 2)],
    [(0, 76, 1), (1, 79, 1), (2, 84, 2), (4, 79, 1), (5, 76, 1), (6, 72, 2)],
    [(0, 74, 1), (1, 77, 1), (2, 81, 2), (4, 79, 1), (5, 77, 1), (6, 74, 1), (7, 77, 1)],
    [(0, 77, 1), (1, 79, 1), (2, 81, 1), (3, 82, 1), (4, 81, 2), (6, 79, 2)],
]

drums = (np.zeros(N), np.zeros(N))
music = (np.zeros(N), np.zeros(N))
lead = (np.zeros(N), np.zeros(N))
kick_times = []
K, CL, HC, HO = kick(), clap(), hat(), hat(True)

for bar in range(15):
    b0 = bar * 2.0
    root, voicing, arp = CH[bar % 4]
    full = 2 <= bar <= 14
    # pads
    for side, sgn in ((0, 1), (1, -1)):
        p = pad(voicing, 2.0, sgn) * (0.5 if bar < 2 else 0.75)
        if bar < 2: p = lp(p, 500 + 1200 * bar + 1)
        i = int(b0 * SR); music[side][i:i + len(p)] += p[:N - i] * 0.32
    # arp (intro + under groove)
    for s in range(16):
        t0 = b0 + s * 0.125
        add(pluck(arp[s % 4] + (12 if s % 8 >= 4 else 0)), t0, 0.16 if bar < 2 else 0.08, pan=0.35 if s % 2 else -0.35, bus=music)
    if bar >= 1:
        for e in range(8):
            t0 = b0 + e * 0.25
            if bar >= 2 or e >= 4:
                add(HC, t0 + (0.02 if e % 2 else 0), 0.16 if e % 2 else 0.22, pan=0.25, bus=drums)
    if full:
        for bt in range(4):
            t0 = b0 + bt * BEAT
            if 22.0 <= t0 < 23.0 or t0 >= 29.0: continue
            add(K, t0, 0.95, bus=drums); kick_times.append(t0)
            add(HO, t0 + 0.25, 0.12, pan=-0.2, bus=drums)
            if bt in (1, 3): add(CL, t0, 0.55, pan=0.05, bus=drums)
        # bass 8ths: root, root, oct, root...
        for e in range(8):
            t0 = b0 + e * 0.25
            if 22.0 <= t0 < 23.0 or t0 >= 29.0: continue
            m = root + (12 if e in (2, 5) else 0) + (7 if e == 7 else 0)
            add(bass(m, 0.23), t0, 0.55, bus=music)
        # lead melody (skip during build)
        for st, m, ln in MEL[bar % 4]:
            t0 = b0 + st * 0.25
            if 22.0 <= t0 < 23.0 or t0 >= 29.0: continue
            add(mallet(m + (12 if bar >= 11 else 0), ln * 0.25), t0, 0.30, bus=lead)

# snare roll build 22 -> 23
for k in range(16):
    t0 = 22.0 + k * 1.0 / 16
    add(CL, t0, 0.15 + 0.35 * k / 16, bus=drums)

# final hit at 29
for m, g in ((41, .5), (53, .4)):
    t = tt(1.0); f = mtof(m)
    add(np.tanh(2 * lp(saw(f, t), 600)) * np.exp(-t * 3), 29.0, g, bus=music)
fin = sum(mallet(m, 0.9) for m in (77, 81, 84, 89)) * 0.25
add(fin, 29.0, 0.9, bus=lead)
add(K, 29.0, 1.0, bus=drums)
for tc in (4.0, 23.0, 29.0):
    add(crash(), tc, 0.35, pan=0.1, bus=drums)

# sidechain on music bus
duck = np.ones(N)
env_t = tt(0.3)
shape = 1 - 0.55 * np.exp(-env_t * 14)
for kt in kick_times:
    i = int(kt * SR); n = min(len(shape), N - i)
    duck[i:i + n] = np.minimum(duck[i:i + n], shape[:n])
music = (music[0] * duck, music[1] * duck)

# lead: ping-pong delay (3/8 beat) + light reverb
d = int(0.375 * SR)
ldl, ldr = lead[0].copy(), lead[1].copy()
ldl[d:] += 0.28 * lead[1][:-d]; ldr[2 * d:] += 0.22 * lead[0][:-2 * d]
lead = (ldl, ldr)

# ---------- SFX ----------
sfx = (np.zeros(N), np.zeros(N))


def whoosh(d=0.6):
    t = tt(d)
    out = bp(rng.standard_normal(len(t)), 500, 6000)
    return out * np.sin(np.pi * t / d) ** 2


def riser(d=2.0):
    t = tt(d); n = rng.standard_normal(len(t))
    lo = lp(n, 800); hi = hp(n, 3000)
    x = t / d
    return (lo * (1 - x) + hi * x) * x ** 2


def pop(f0=900):
    t = tt(0.12); f = f0 * np.exp(-t * 18) + 200
    return np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t * 30)


def ding():
    t = tt(0.9)
    return (np.sin(2 * np.pi * 1318.5 * t) + 0.6 * np.sin(2 * np.pi * 1975.5 * t) + .3 * np.sin(2 * np.pi * 2637 * t)) * np.exp(-t * 6) / 1.9


def buzz():
    t = tt(0.35)
    s = np.sign(np.sin(2 * np.pi * 155 * t)) + np.sign(np.sin(2 * np.pi * 163 * t))
    return lp(s, 1400) * np.exp(-t * 7) * np.minimum(1, t * 300) * 0.5


W = whoosh()
for T in (4, 7, 11, 15, 19, 23, 26):
    add(W, T - 0.3, 0.33, pan=-0.3, bus=sfx)
add(riser(2.0), 2.0, 0.18, bus=sfx)
add(riser(1.0), 22.0, 0.22, bus=sfx)
for i in range(6): add(pop(1500), 0.05 + i * 0.12, 0.12, pan=-0.6 + i * 0.24, bus=sfx)
add(pop(), 0.4, 0.5, bus=sfx)
add(pop(1200), 4.45, 0.4, bus=sfx)
for T in (7, 11, 15, 19):
    add(pop(), T + 0.35, 0.4, pan=-0.2, bus=sfx)
    add(ding(), T + 1.0, 0.28, bus=sfx)
    add(pop(700), T + 1.25, 0.4, pan=0.2, bus=sfx)
    add(buzz(), T + 1.9, 0.30, bus=sfx)
add(pop(), 23.1, 0.5, bus=sfx)
add(ding(), 23.5, 0.2, bus=sfx)
add(pop(), 26.1, 0.45, bus=sfx)
for k in range(3): add(pop(1300), 26.9 + k * 0.25, 0.3, pan=-0.3 + .3 * k, bus=sfx)

# ---------- mix + reverb + master ----------
mixL = drums[0] * 0.9 + music[0] + lead[0] + sfx[0]
mixR = drums[1] * 0.9 + music[1] + lead[1] + sfx[1]
ir_t = tt(1.4)
irL = rng.standard_normal(len(ir_t)) * np.exp(-ir_t * 4.5)
irR = rng.standard_normal(len(ir_t)) * np.exp(-ir_t * 4.5)
sendL = hp(music[0] * 0.5 + lead[0] + sfx[0] * 0.3, 300)
sendR = hp(music[1] * 0.5 + lead[1] + sfx[1] * 0.3, 300)
mixL += 0.035 * fftconvolve(sendL, irL)[:N]
mixR += 0.035 * fftconvolve(sendR, irR)[:N]
mix = np.stack([mixL, mixR], 1)
mix = hp(mix.T, 28).T
mix /= np.max(np.abs(mix)) + 1e-9
mix = np.tanh(mix * 1.6) / np.tanh(1.6)
fade = np.ones(N); fn = int(0.6 * SR); fade[-fn:] = np.linspace(1, 0, fn) ** 2
fade[:int(0.01 * SR)] = np.linspace(0, 1, int(0.01 * SR))
mix *= fade[:, None] * 0.89
pcm = (mix * 32767).astype(np.int16)
out = sys.argv[1] if len(sys.argv) > 1 else 'music.wav'
with wave.open(out, 'wb') as w:
    w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR); w.writeframes(pcm.tobytes())
print('wrote', out)
