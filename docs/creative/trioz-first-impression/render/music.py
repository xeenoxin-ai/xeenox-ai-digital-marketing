"""Synthesise the original 30 s music bed and sound effects for the Trioz video.

120 BPM, so the reveal hit at 0:10.0 lands on beat 20.
Writes a 48 kHz stereo WAV to the path given as the first argument.
"""
import sys
import wave

import numpy as np

SR = 48000
DUR = 30.0
N = int(SR * DUR)
BEAT = 0.5
L = np.zeros(N)
R = np.zeros(N)
rng = np.random.default_rng(7)


def add(sig, start, gain=1.0, pan=0.0):
    i = int(round(start * SR))
    if i >= N:
        return
    if i < 0:
        sig, i = sig[-i:], 0
    n = min(len(sig), N - i)
    ang = (pan + 1) * np.pi / 4
    L[i:i + n] += sig[:n] * gain * np.cos(ang) * np.sqrt(2)
    R[i:i + n] += sig[:n] * gain * np.sin(ang) * np.sqrt(2)


def secs(d):
    return np.arange(int(d * SR)) / SR


def filt(x, lo=None, hi=None):
    """Zero-phase 2nd-order-ish band filter done in the frequency domain."""
    X = np.fft.rfft(x)
    f = np.fft.rfftfreq(len(x), 1 / SR) + 1e-9
    g = np.ones_like(f)
    if hi:
        g *= 1 / np.sqrt(1 + (f / hi) ** 4)
    if lo:
        g *= 1 / np.sqrt(1 + (lo / f) ** 4)
    return np.fft.irfft(X * g, len(x))


def tone(freq, dur, decay, harm=(1,), amps=(1,), attack=0.004):
    tt = secs(dur)
    s = sum(a * np.sin(2 * np.pi * freq * h * tt) for h, a in zip(harm, amps))
    return s * np.minimum(tt / attack, 1) * np.exp(-tt / decay)


def noise(dur):
    return rng.standard_normal(int(dur * SR))


def hz(note):
    names = {'C': -9, 'D': -7, 'E': -5, 'F': -4, 'G': -2, 'A': 0, 'B': 2}
    return 440 * 2 ** ((names[note[0]] + 12 * (int(note[-1]) - 4)) / 12)


CHORDS = {
    'Am': ('A2', ['A3', 'C4', 'E4'], ['E5', 'C5', 'A4', 'C5']),
    'F': ('F2', ['F3', 'A3', 'C4'], ['C5', 'A4', 'F4', 'A4']),
    'C': ('C3', ['C4', 'E4', 'G4'], ['G5', 'E5', 'C5', 'E5']),
    'G': ('G2', ['G3', 'B3', 'D4'], ['D5', 'B4', 'G4', 'B4']),
}


def pad(chord, start, dur, gain):
    _, tones, _ = CHORDS[chord]
    tt = secs(dur)
    s = np.zeros(len(tt))
    for n in tones:
        for det in (-0.6, 0.6):
            f = hz(n) + det
            s += sum(np.sin(2 * np.pi * f * h * tt) / h for h in range(1, 6))
    env = np.minimum(tt / 0.35, 1) * np.minimum((dur - tt) / 0.35, 1)
    add(filt(s * env, hi=1400), start, gain)


def pluck(note, start, gain, decay=0.35, hi=2500, pan=0.0):
    add(filt(tone(hz(note), decay * 5, decay, (1, 2, 3, 4), (1, .45, .2, .08)), hi=hi), start, gain, pan)


# ---------- 0:00-0:10  flat, muted intro ----------
for bar, ch in enumerate(['Am', 'F', 'Am', 'F']):
    st = bar * 2.0
    pad(ch, st, 2.15, 0.010)
    for k, n in enumerate(CHORDS[ch][2]):
        pluck(n[:-1] + str(int(n[-1]) - 1), st + k * BEAT, 0.07, decay=0.22, hi=1200, pan=(-.3, .3)[k % 2])
pad('Am', 8.0, 1.6, 0.007)

# soft bass pulse on the first cut (0:03)
add(tone(55, 1.2, 0.35, (1, 2), (1, .3)), 3.0, 0.45)

# swipe whooshes between close-ups
for st in (4.33, 5.67):
    w = noise(0.45)
    tt = secs(0.45)
    add(filt(w, lo=600, hi=3500) * np.sin(np.pi * tt / 0.45) ** 2, st - 0.15, 0.05)

# ---------- 0:07-0:09.6  riser into silence ----------
rd = 2.6
tt = secs(rd)
sweep_f = 150 * (1500 / 150) ** (tt / rd)
sweep = np.sin(2 * np.pi * np.cumsum(sweep_f) / SR)
ramp = (tt / rd) ** 2
cut = np.minimum((rd - tt) / 0.04, 1)
add(sweep * ramp * cut, 7.0, 0.10)
add(filt(noise(rd), lo=900) * ramp * cut, 7.0, 0.06)

# ---------- 0:10  impact ----------
tt = secs(2.5)
boom_f = 35 + 40 * np.exp(-tt / 0.25)
boom = np.sin(2 * np.pi * np.cumsum(boom_f) / SR) * np.exp(-tt / 0.9)
add(boom, 10.0, 0.95)
add(filt(noise(0.8), hi=3000) * np.exp(-secs(0.8) / 0.18), 10.0, 0.35)
add(filt(noise(2.0), lo=2000) * np.exp(-secs(2.0) / 0.6), 10.0, 0.05)

# metallic clanks as frame, leaf and handle lock into place
for st, base, pan in ((11.2, 410, -.25), (11.6, 360, .25), (12.0, 520, 0)):
    c = sum(tone(base * p, 1.2, d) * a for p, d, a in ((1, .45, 1), (2.76, .3, .6), (5.4, .18, .4), (8.93, .1, .25)))
    add(c, st, 0.16, pan)
    add(filt(noise(0.03), lo=3000) * np.exp(-secs(0.03) / 0.006), st, 0.5, pan)

# ---------- 0:10-0:28  confident groove ----------
def chord_at(tm):
    if tm >= 27.0:
        return 'G'
    if tm >= 26.0:
        return 'F'
    return ['Am', 'F', 'C', 'G'][int((tm - 10) // 2) % 4]


tt = secs(0.4)
kick = np.sin(2 * np.pi * np.cumsum(45 + 75 * np.exp(-tt / 0.03)) / SR) * np.exp(-tt / 0.18)
for b in range(int(10 / BEAT), int(28 / BEAT)):
    tm = b * BEAT
    ch = chord_at(tm)
    add(kick, tm, 0.75)
    # off-beat hats
    add(filt(noise(0.08), lo=7000) * np.exp(-secs(0.08) / 0.025), tm + BEAT / 2, 0.10, .2)
    if b % 2 == 1:
        add(filt(noise(0.25), lo=1000, hi=6000) * np.exp(-secs(0.25) / 0.07), tm, 0.22, -.1)
        add(tone(190, 0.2, 0.05), tm, 0.12)
    # bass on 8ths
    root = hz(CHORDS[ch][0])
    for k in (0, 1):
        add(filt(tone(root, 0.5, 0.18, (1, 2, 3), (1, .4, .15)), hi=900), tm + k * BEAT / 2, 0.28)

for st in np.arange(10.0, 28.0, 1.0):
    pad(chord_at(st), st, 1.05, 0.012)
for st in np.arange(10.0, 28.0, 2.0):
    mel = CHORDS[chord_at(st)][2]
    for n, off, p in zip(mel, (0, .75, 1.0, 1.5), (-.35, .35, -.2, .2)):
        pluck(n, st + off, 0.07, decay=0.45, hi=4000, pan=p)

# ---------- 0:28  resolution ----------
tt = secs(2.0)
final = np.zeros(len(tt))
for n in ('C3', 'G3', 'C4', 'E4', 'G4', 'D5'):
    final += sum(np.sin(2 * np.pi * hz(n) * h * tt) / h ** 1.5 for h in (1, 2, 3))
final *= np.minimum(tt / 0.01, 1) * np.exp(-tt / 1.4)
add(filt(final, hi=3500), 28.0, 0.06)
add(kick, 28.0, 0.6)
add(tone(hz('C2'), 2.0, 0.8, (1, 2), (1, .3)), 28.0, 0.30)

# ---------- shimmers, whooshes, door ----------
def shimmer(st, dur, gain):
    tt = secs(dur)
    s = sum(np.sin(2 * np.pi * f * tt) for f in (2093, 2637, 3136, 4186))
    env = np.sin(np.pi * tt / dur) ** 2 * (0.7 + 0.3 * np.sin(2 * np.pi * 9 * tt))
    add(s * env, st, gain)


shimmer(13.2, 1.0, 0.012)
shimmer(18.6, 1.0, 0.010)
shimmer(27.0, 1.0, 0.009)
shimmer(29.3, 0.7, 0.014)
for st, d, g in ((19.6, 0.6, 0.05), (23.6, 0.5, 0.05), (24.9, 1.4, 0.04), (26.4, 0.6, 0.04), (14.4, 0.6, 0.05)):
    tt = secs(d)
    add(filt(noise(d), lo=500, hi=4000) * np.sin(np.pi * tt / d) ** 2, st, g)
# door swing: low airy swell
tt = secs(1.8)
add(filt(noise(1.8), lo=80, hi=500) * np.sin(np.pi * tt / 1.8) ** 2, 20.8, 0.12)

# ---------- master ----------
mix = np.stack([L, R], 1)
mix /= np.max(np.abs(mix)) + 1e-9
mix = np.tanh(mix * 1.3) / np.tanh(1.3)
fade = np.minimum(np.arange(N)[::-1] / (0.05 * SR), 1)
mix *= fade[:, None]
pcm = (mix * 0.9 * 32767).astype('<i2')
with wave.open(sys.argv[1], 'wb') as w:
    w.setnchannels(2)
    w.setsampwidth(2)
    w.setframerate(SR)
    w.writeframes(pcm.tobytes())
