"""Original 30 s upbeat ukulele-pop bed (120 BPM, D major) with transition whooshes and text pops.
Synthesised from scratch with numpy, so it is royalty-free.  Usage: python3 music.py out.wav
"""
import sys, wave
import numpy as np

SR, DUR, BPM = 44100, 30.0, 120
BEAT = 60 / BPM
N = int(SR * DUR)
rng = np.random.default_rng(7)
L = np.zeros(N); R = np.zeros(N)

def f(m): return 440 * 2 ** ((m - 69) / 12)

def add(sig, t, gain=1.0, pan=0.0):
    i = int(t * SR)
    if i >= N: return
    sig = sig[: N - i] * gain
    L[i:i + len(sig)] += sig * np.sqrt((1 - pan) / 2)
    R[i:i + len(sig)] += sig * np.sqrt((1 + pan) / 2)

def fft_filter(x, lo=0, hi=SR / 2):
    X = np.fft.rfft(x); fr = np.fft.rfftfreq(len(x), 1 / SR)
    X *= 1 / (1 + (lo / np.maximum(fr, 1)) ** 4) * 1 / (1 + (fr / hi) ** 4)
    return np.fft.irfft(X, len(x))

def pluck(freq, dur=0.9, decay=0.996):          # Karplus-Strong, vectorised per period
    p = max(2, int(SR / freq)); n = int(dur * SR)
    y = np.zeros(n + p); y[:p] = fft_filter(rng.uniform(-1, 1, p), hi=6000)[:p]
    for k in range(1, (n + p) // p + 1):
        a, b = k * p, min((k + 1) * p, n + p)
        if a >= n + p: break
        prev = y[a - p - 1:b - p - 1] if a - p - 1 >= 0 else np.r_[0, y[a - p:b - p - 1]]
        y[a:b] = decay * 0.5 * (y[a - p:b - p] + prev[: b - a])
    y = y[p:p + n]
    return y * np.minimum(1, np.linspace(8, 0, n))

def bell(freq, dur=1.2):
    t = np.arange(int(dur * SR)) / SR
    s = sum(a * np.sin(2 * np.pi * freq * r * t) * np.exp(-t * d) for r, a, d in [(1, 1, 3.5), (2.76, .35, 7), (5.4, .15, 12)])
    return s * np.minimum(1, t / .003)

def kick():
    t = np.arange(int(.35 * SR)) / SR
    ph = 2 * np.pi * np.cumsum(48 + 110 * np.exp(-t * 28)) / SR
    return np.sin(ph) * np.exp(-t * 9)

def clap():
    n = int(.25 * SR); t = np.arange(n) / SR
    env = sum(np.exp(-np.maximum(t - o, 0) * 60) * (t >= o) for o in (0, .011, .022)) + .4 * np.exp(-t * 14)
    return fft_filter(rng.uniform(-1, 1, n), 900, 6000) * env * .5

def shaker():
    n = int(.08 * SR); t = np.arange(n) / SR
    return fft_filter(rng.uniform(-1, 1, n), 5000, 14000) * np.exp(-t * 55) * np.minimum(1, t / .01)

def bass(freq, dur):
    t = np.arange(int(dur * SR)) / SR
    return (np.sin(2 * np.pi * freq * t) + .25 * np.sin(4 * np.pi * freq * t)) * np.exp(-t * 2.5) * np.minimum(1, t / .005) * np.minimum(1, (dur - t) / .02)

def whoosh(dur=.9):
    n = int(dur * SR); t = np.arange(n) / SR
    env = np.sin(np.pi * t / dur) ** 2
    return fft_filter(rng.uniform(-1, 1, n), 300, 3500) * env

def pop():
    t = np.arange(int(.09 * SR)) / SR
    return np.sin(2 * np.pi * np.cumsum(700 + 900 * t / .09) / SR) * np.exp(-t * 45)

# chords per 2 s bar: D A Bm G
CH = [([62, 66, 69, 74], 38), ([64, 69, 73, 76], 45), ([62, 66, 71, 74], 47), ([62, 67, 71, 74], 43)]
MEL = [[(0, 81), (.5, 78), (1, 81), (1.5, 83), (2, 81), (3, 78)],
       [(0, 76), (1, 81), (1.5, 85), (2, 83), (3, 81)],
       [(0, 78), (.5, 74), (1, 78), (1.5, 81), (2, 83), (3, 86)],
       [(0, 83), (1, 81), (2, 79), (2.5, 78), (3, 76), (3.5, 81)]]
STRUM = [(0, 1), (1, .6), (1.5, .75), (2.5, .6), (3, .8), (3.5, .5)]
pluck_cache = {}
def P(m, dur=.9):
    k = (m, dur)
    if k not in pluck_cache: pluck_cache[k] = pluck(f(m), dur)
    return pluck_cache[k]

for bar in range(15):
    t0 = bar * 4 * BEAT
    notes, root = CH[bar % 4]
    last = bar == 14
    if bar == 0:                          # intro: gentle bell arpeggio
        for i, m in enumerate(notes + [notes[-1] + 12]):
            add(bell(f(m + 12), 1.4), t0 + i * .35, .3, (-.4 + i * .2))
    if last:                              # final ring-out on D
        for i, m in enumerate(CH[0][0]): add(P(m, 2.0), t0 + i * .02, .32, -.2 + i * .13)
        add(bell(f(86), 2.0), t0, .2); add(bell(f(93), 2.0), t0 + .12, .12, .3)
        add(kick(), t0, .8); add(bass(f(38), 1.9), t0, .5)
        continue
    for b, acc in STRUM:                  # ukulele strums
        for i, m in enumerate(notes):
            add(P(m), t0 + b * BEAT + i * .012, (.4 if bar == 0 else .22) * acc, -.3 + i * .15)
    if bar >= 1:
        for b in range(4): add(kick(), t0 + b * BEAT, .6)
        for b in (1, 3): add(clap(), t0 + b * BEAT, .45, .1)
        for s in range(16): add(shaker(), t0 + s * BEAT / 4, .22 if s % 2 else .12, .5)
        for b, d in [(0, .9), (1.5, .4), (2, .9), (3.5, .4)]: add(bass(f(root), d), t0 + b * BEAT, .55)
        mel = MEL[bar % 4]
        for b, m in mel: add(bell(f(m), 1.0), t0 + b * BEAT, .18 if bar < 12 else .22, .25)

for tc in (4.0, 10.5, 17.0, 23.5):        # transition whooshes, centred on the cut
    add(whoosh(), tc - .45, .35, -.3); add(whoosh(), tc - .45, .3, .3)
for tp in (.6, 4.2, 4.4, 10.65, 10.95, 17.15, 17.45, 24.6, 24.85):  # pops as text lands
    add(pop(), tp, .12)

mix = np.stack([L, R], 1)
mix = np.tanh(mix * 1.1)                  # gentle glue
fade = np.ones(N); fn = int(.8 * SR); fade[-fn:] = np.linspace(1, 0, fn) ** 1.5
mix *= fade[:, None]
mix /= np.abs(mix).max() / 0.89
with wave.open(sys.argv[1], 'wb') as w:
    w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR)
    w.writeframes((mix * 32767).astype('<i2').tobytes())
print('wrote', sys.argv[1])
