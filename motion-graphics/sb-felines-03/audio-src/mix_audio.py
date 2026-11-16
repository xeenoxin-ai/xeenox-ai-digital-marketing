"""Synthesize lo-fi music + SFX, mix with voiceover lines, ducking music under voice.
usage: mix_audio.py config.json vo_dir out_mix.wav out_music_only.wav"""
import numpy as np, soundfile as sf, json, sys
cfg=json.load(open(sys.argv[1])); vod=sys.argv[2]
SR=44100; DUR=cfg.get("duration",30.0); N=int(SR*DUR)
rng=np.random.default_rng(cfg.get("seed",3))
L=np.zeros(N); R=np.zeros(N)
def midi(m): return 440*2**((m-69)/12)
def add(sig,t,pan=0.0,gain=1.0):
    i=int(t*SR)
    if i>=N: return
    j=min(N,i+len(sig)); s=sig[:j-i]*gain
    L[i:j]+=s*np.sqrt((1-pan)/2); R[i:j]+=s*np.sqrt((1+pan)/2)
def env(n,a=0.005,d=1.0):
    t=np.arange(n)/SR; return np.exp(-t/d)*np.minimum(1,t/a)
def rel(n,r): return np.minimum(1,(n-np.arange(n))/(r*SR))
def epiano(m,dur,vel=1.0):
    n=int(dur*SR); t=np.arange(n)/SR; f=midi(m)
    s=np.sin(2*np.pi*f*t)+.35*np.sin(2*np.pi*2*f*t)*np.exp(-t/0.4)+.12*np.sin(2*np.pi*3*f*t)*np.exp(-t/0.15)
    return s*(1+.15*np.sin(2*np.pi*4.5*t))*env(n,0.004,1.3)*rel(n,.08)*vel*0.18
def pluck(m,vel=1.0):
    n=int(0.9*SR); t=np.arange(n)/SR; f=midi(m)
    return np.sin(2*np.pi*f*t+0.8*np.sin(2*np.pi*f*t)*np.exp(-t/0.08))*env(n,0.002,0.28)*vel*0.13
def bass(m,dur):
    n=int(dur*SR); t=np.arange(n)/SR; f=midi(m)
    return (np.sin(2*np.pi*f*t)+.2*np.sin(2*np.pi*2*f*t))*env(n,0.01,1.2)*rel(n,.05)*0.22
def kick():
    n=int(0.35*SR); t=np.arange(n)/SR; f=110*np.exp(-t/0.05)+45
    return np.sin(2*np.pi*np.cumsum(f)/SR)*env(n,0.001,0.12)*0.35
def hat(v=1):
    n=int(0.08*SR); s=np.diff(np.diff(rng.standard_normal(n),prepend=0),prepend=0)
    return s*env(n,0.001,0.02)*0.025*v
def snap():
    n=int(0.2*SR); s=np.convolve(rng.standard_normal(n),np.ones(6)/6,'same')
    return s*env(n,0.001,0.05)*0.08
beat=60/cfg["bpm"]; bar=4*beat
chords,roots,mel=cfg["chords"],cfg["roots"],cfg["mel"]
for b in range(int(DUR/bar)+1):
    t0=b*bar; c=chords[b%len(chords)]
    for k,m in enumerate(c): add(epiano(m,bar*0.98,0.9),t0+k*0.012,pan=-.3+.2*k)
    add(epiano(c[1]+12,beat*1.5,.5),t0+2.5*beat,pan=.3)
    r=roots[b%len(roots)]; add(bass(r,beat*1.9),t0); add(bass(r+7,beat*1.9),t0+2*beat)
    if b>0:
        for q in range(8): add(hat(1.2 if q%2 else .7),t0+q*beat/2+(0.03 if q%2 else 0),pan=.4)
        add(kick(),t0); add(kick(),t0+2.5*beat,gain=.7); add(snap(),t0+beat,pan=-.1); add(snap(),t0+3*beat,pan=-.1)
        for q,m in enumerate(mel[b%len(mel)]): add(pluck(m,.8),t0+q*beat+beat*0.5,pan=.25)
ir_n=int(1.6*SR); ir=rng.standard_normal(ir_n)*np.exp(-np.arange(ir_n)/SR/0.45); ir/=np.sqrt((ir**2).sum())
def conv(x):
    F=1<<(len(x)+ir_n-1).bit_length()
    return np.fft.irfft(np.fft.rfft(x,F)*np.fft.rfft(ir,F),F)[:len(x)]
L=L+0.35*conv(L); R=R+0.35*conv(R)
fade=np.ones(N); fi=int(0.6*SR); fade[:fi]=np.linspace(0,1,fi); fo=int(1.4*SR); fade[-fo:]=np.linspace(1,0,fo)
music=np.stack([L*fade,R*fade],1)
# SFX
S=np.zeros((N,2))
def sadd(sig,t,g=1.0):
    i=int(t*SR)
    if i>=N: return
    j=min(N,i+len(sig)); S[i:j,0]+=sig[:j-i]*g; S[i:j,1]+=sig[:j-i]*g
def pop(f=900):
    n=int(0.12*SR); t=np.arange(n)/SR; fr=f*np.exp(-t/0.03)+f*0.6
    return np.sin(2*np.pi*np.cumsum(fr)/SR)*env(n,0.001,0.035)*0.35
def shaped(n,center,width,low=0.0):
    F=np.fft.rfft(rng.standard_normal(n)); fr=np.fft.rfftfreq(n,1/SR)
    F*=np.exp(-((fr-center)/width)**2)+low*np.exp(-((fr-400)/300)**2); return np.fft.irfft(F,n)
def whoosh(d=0.9):
    n=int(d*SR); s=shaped(n,1500,1500,.3)*np.sin(np.pi*np.linspace(0,1,n))**2; return s/np.abs(s).max()*0.22
def scratch(d=0.22):
    n=int(d*SR); s=shaped(n,3200,1800)*np.sin(np.pi*np.linspace(0,1,n)); return s/np.abs(s).max()*0.18
def grain():
    n=int(0.03*SR); s=shaped(n,4500,2500)*env(n,0.0005,0.006); return s/np.abs(s).max()*0.08
def drip():
    n=int(0.25*SR); t=np.arange(n)/SR; fr=600+1400*(t/0.25)
    return np.sin(2*np.pi*np.cumsum(fr)/SR)*env(n,0.001,0.06)*0.3
def chime(m):
    n=int(1.8*SR); t=np.arange(n)/SR; f=midi(m)
    return (np.sin(2*np.pi*f*t)+.4*np.sin(2*np.pi*2.76*f*t)*np.exp(-t/0.3))*env(n,0.002,0.6)*0.14
fx={"pop":lambda p:pop(p or 900),"whoosh":lambda p:whoosh(),"scratch":lambda p:scratch(),"grain":lambda p:grain(),
    "drip":lambda p:drip(),"chime":lambda p:chime(p or 96)}
for kind,t,p,g in cfg["sfx"]: sadd(fx[kind](p),t,g)
# VO
V=np.zeros(N)
for i,st in enumerate(cfg["vo_starts"]):
    v,sr=sf.read(f"{vod}/vo_{i}.wav")
    if v.ndim>1: v=v.mean(1)
    x=np.linspace(0,len(v)-1,int(len(v)*SR/sr)); v=np.interp(x,np.arange(len(v)),v)
    a=int(st*SR); b=min(N,a+len(v)); V[a:b]+=v[:b-a]
V=V/np.abs(V).max()*0.8
ve=np.convolve(np.abs(V),np.ones(int(0.15*SR))/int(0.15*SR),'same'); duck=1-0.5*np.clip(ve/(ve.max()*0.25),0,1)
bed=music*duck[:,None]*0.9+S
mix=bed+np.stack([V,V],1); mix/=np.abs(mix).max()/0.95
mo=music*0.9+S; mo/=np.abs(mo).max()/0.9
sf.write(sys.argv[3],mix,SR); sf.write(sys.argv[4],mo,SR); print("ok")
