import numpy as np, soundfile as sf, json, sys
SR=44100; DUR=30.0; N=int(SR*DUR)
rng=np.random.default_rng(3)
L=np.zeros(N); R=np.zeros(N)
def midi(m): return 440*2**((m-69)/12)
def add(sig, t, pan=0.0, gain=1.0):
    i=int(t*SR); j=min(N,i+len(sig)); 
    if i>=N: return
    s=sig[:j-i]*gain
    L[i:j]+=s*np.sqrt((1-pan)/2); R[i:j]+=s*np.sqrt((1+pan)/2)
def env(n, a=0.005, d=1.0):
    t=np.arange(n)/SR; e=np.exp(-t/d); att=np.minimum(1,t/a); return e*att
def epiano(m, dur, vel=1.0):
    n=int(dur*SR); t=np.arange(n)/SR; f=midi(m)
    s=(np.sin(2*np.pi*f*t)+.35*np.sin(2*np.pi*2*f*t)*np.exp(-t/0.4)+.12*np.sin(2*np.pi*3*f*t)*np.exp(-t/0.15))
    s*= (1+.15*np.sin(2*np.pi*4.5*t))
    e=env(n,0.004,1.3); rel=np.minimum(1,(n-np.arange(n))/(0.08*SR))
    return s*e*rel*vel*0.18
def pluck(m, vel=1.0):
    n=int(0.9*SR); t=np.arange(n)/SR; f=midi(m)
    s=np.sin(2*np.pi*f*t+0.8*np.sin(2*np.pi*f*t)*np.exp(-t/0.08))
    return s*env(n,0.002,0.28)*vel*0.13
def bass(m, dur):
    n=int(dur*SR); t=np.arange(n)/SR; f=midi(m)
    s=np.sin(2*np.pi*f*t)+.2*np.sin(2*np.pi*2*f*t)
    rel=np.minimum(1,(n-np.arange(n))/(0.05*SR))
    return s*env(n,0.01,1.2)*rel*0.22
def kick():
    n=int(0.35*SR); t=np.arange(n)/SR; f=110*np.exp(-t/0.05)+45
    ph=2*np.pi*np.cumsum(f)/SR; return np.sin(ph)*env(n,0.001,0.12)*0.35
def hat(v=1):
    n=int(0.08*SR); s=rng.standard_normal(n); s=np.diff(s,prepend=0); s=np.diff(s,prepend=0)
    return s*env(n,0.001,0.02)*0.025*v
def snap():
    n=int(0.2*SR); s=rng.standard_normal(n); s=np.convolve(s,np.ones(6)/6,'same')
    return s*env(n,0.001,0.05)*0.08
# tempo 92 bpm
bpm=92; beat=60/bpm; bar=4*beat
chords=[[60,64,67,71],[57,60,64,67],[53,57,60,64],[55,59,62,65]]   # Cmaj7 Am7 Fmaj7 G7
roots=[36,33,29,31]
mel=[[72,76,79,76],[72,69,72,76],[69,72,77,76],[74,71,67,71]]
nbars=int(DUR/bar)+1
for b in range(nbars):
    t0=b*bar; c=chords[b%4]
    intro = b==0
    for k,m in enumerate(c): add(epiano(m, bar*0.98, 0.9), t0+k*0.012, pan=-.3+.2*k)
    add(epiano(c[1]+12, beat*1.5, .5), t0+2.5*beat, pan=.3)
    add(bass(roots[b%4], beat*1.9), t0); add(bass(roots[b%4]+7, beat*1.9), t0+2*beat)
    if not intro:
        for q in range(8):
            add(hat(1.2 if q%2 else .7), t0+q*beat/2+ (0.03 if q%2 else 0), pan=.4)
        add(kick(), t0); add(kick(), t0+2.5*beat, gain=.7)
        add(snap(), t0+beat, pan=-.1); add(snap(), t0+3*beat, pan=-.1)
    if b>=1:
        for q,m in enumerate(mel[b%4]):
            add(pluck(m, .8), t0+q*beat+beat*0.5, pan=.25)
# reverb (FFT conv with decaying noise IR)
ir_n=int(1.6*SR); ir=rng.standard_normal(ir_n)*np.exp(-np.arange(ir_n)/SR/0.45); ir/=np.sqrt((ir**2).sum())
def conv(x):
    m=len(x)+ir_n; F=1<<(m-1).bit_length()
    return np.fft.irfft(np.fft.rfft(x,F)*np.fft.rfft(ir,F),F)[:len(x)]
L=L+0.35*conv(L); R=R+0.35*conv(R)
# end: fade out last 1.2s, intro fade-in
fade=np.ones(N); fi=int(0.6*SR); fade[:fi]=np.linspace(0,1,fi); fo=int(1.4*SR); fade[-fo:]=np.linspace(1,0,fo)
music=np.stack([L*fade,R*fade],1)
# --- SFX ---
S=np.zeros((N,2))
def sadd(sig,t,g=1.0):
    i=int(t*SR); j=min(N,i+len(sig)); S[i:j,0]+=sig[:j-i]*g; S[i:j,1]+=sig[:j-i]*g
def pop(f=900):
    n=int(0.12*SR); t=np.arange(n)/SR; fr=f*np.exp(-t/0.03)+f*0.6
    return np.sin(2*np.pi*np.cumsum(fr)/SR)*env(n,0.001,0.035)*0.35
def whoosh(d=0.9):
    n=int(d*SR); s=rng.standard_normal(n); F=np.fft.rfft(s); fr=np.fft.rfftfreq(n,1/SR)
    F*= np.exp(-((fr-1500)/1500)**2)+0.3*np.exp(-((fr-400)/300)**2); s=np.fft.irfft(F,n)
    e=np.sin(np.pi*np.linspace(0,1,n))**2; s=s*e; return s/np.abs(s).max()*0.22
def chime(m):
    n=int(1.8*SR); t=np.arange(n)/SR; f=midi(m)
    return (np.sin(2*np.pi*f*t)+.4*np.sin(2*np.pi*2.76*f*t)*np.exp(-t/0.3))*env(n,0.002,0.6)*0.14
for i,t in enumerate([3.15,3.37,3.59]): sadd(pop(700+i*180), t+0.12)
for t in [5,11,17,23]: sadd(whoosh(), t-0.45)
for t in [5.45,11.45,17.45]: sadd(pop(1100), t+0.05, .7)
for i,m in enumerate([84,88,91,96]): sadd(chime(m), 27.9+i*0.11)
for t in [6.4,9.0]: sadd(chime(96), t, .5)   # blink sparkle
for i in range(5): sadd(pop(1400+i*120), 14.4+i*0.38, .35)  # hearts
sadd(pop(500),1.15,.4); sadd(pop(520),2.05,.4) # ear twitch
# --- VO ---
lines=json.load(open(sys.argv[1])); vod=sys.argv[2]
V=np.zeros(N)
starts=[0.25,3.15,5.45,11.45,17.45,23.2,27.5]
for i,st in enumerate(starts):
    v,sr=sf.read(f"{vod}/vo_{i}.wav"); 
    if v.ndim>1: v=v.mean(1)
    # resample 24k->44.1k
    x=np.linspace(0,len(v)-1,int(len(v)*SR/sr)); v=np.interp(x,np.arange(len(v)),v)
    a=int(st*SR); b=min(N,a+len(v)); V[a:b]+=v[:b-a]
V=V/np.abs(V).max()*0.8
# ducking envelope
ve=np.abs(V); k=int(0.15*SR); ve=np.convolve(ve,np.ones(k)/k,'same'); duck=1-0.5*np.clip(ve/ (ve.max()*0.25),0,1)
music=music*duck[:,None]
mix=music*0.9+S+np.stack([V,V],1)*1.0
mix=mix/np.abs(mix).max()*0.95
sf.write(sys.argv[3], mix, SR)
sf.write(sys.argv[4], (music*0.9+S)/np.abs(music*0.9+S).max()*0.9, SR)
print("ok")
