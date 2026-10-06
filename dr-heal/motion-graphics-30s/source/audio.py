import numpy as np, wave
SR=44100; D=30.0; N=int(SR*D)
L=np.zeros(N); R=np.zeros(N)
rng=np.random.default_rng(3)
def at(t): return int(t*SR)
def add(sig,t,gain=1.0,pan=0.0):
    i=at(t); j=min(N,i+len(sig)); s=sig[:j-i]*gain
    L[i:j]+=s*np.sqrt((1-pan)/2); R[i:j]+=s*np.sqrt((1+pan)/2)
def hz(n): return 440*2**((n-69)/12)
def lp(x,cut):  # one-pole lowpass, cut may be array
    cut=np.broadcast_to(np.asarray(cut,float),x.shape); a=np.exp(-2*np.pi*cut/SR)
    y=np.empty_like(x); z=0.0
    for i in range(len(x)): z=(1-a[i])*x[i]+a[i]*z; y[i]=z
    return y
def env(n,a,r):
    e=np.ones(n); ka=int(a*SR); kr=int(r*SR)
    if ka: e[:ka]=np.linspace(0,1,ka)
    if kr: e[-kr:]*=np.linspace(1,0,kr)
    return e
def pad(notes,dur,gain=.06,bright=1.0):
    n=int(dur*SR); t=np.arange(n)/SR; s=np.zeros(n)
    for m in notes:
        for det in (-0.12,0.12):
            f=hz(m+det)
            for h,amp in ((1,1),(2,.35*bright),(3,.15*bright),(4,.07*bright)):
                s+=amp*np.sin(2*np.pi*f*h*t+rng.random()*6)
    return s*env(n,.35,.5)*gain/len(notes)
def pluck(m,dur=.45,gain=.12):
    n=int(dur*SR); t=np.arange(n)/SR; f=hz(m)
    return gain*(np.sin(2*np.pi*f*t)+.4*np.sin(4*np.pi*f*t)+.15*np.sin(6*np.pi*f*t))*np.exp(-t*7)
def kick(gain=.5):
    n=int(.35*SR); t=np.arange(n)/SR; f=45+80*np.exp(-t*30)
    return gain*np.sin(2*np.pi*np.cumsum(f)/SR)*np.exp(-t*9)
def heart(gain=.55):
    n=int(.22*SR); t=np.arange(n)/SR; f=38+50*np.exp(-t*25)
    return gain*np.sin(2*np.pi*np.cumsum(f)/SR)*np.exp(-t*16)
def hat(gain=.05):
    n=int(.06*SR); x=rng.standard_normal(n); x=x-lp(x,6000)
    return gain*x*np.exp(-np.arange(n)/SR*60)
def whoosh(dur=.7,gain=.25,up=True):
    n=int(dur*SR); x=rng.standard_normal(n); p=np.linspace(0,1,n)
    cut=200+ (p if up else 1-p)**2*7000
    e=np.sin(np.pi*p)**1.5 if not up else p**2*(1-p)**.3*3
    return gain*lp(x,cut)*e/np.max(np.abs(e)+1e-9)
def impact(gain=.7):
    n=int(1.6*SR); t=np.arange(n)/SR
    boom=np.sin(2*np.pi*np.cumsum(40+60*np.exp(-t*12))/SR)*np.exp(-t*3)
    nz=lp(rng.standard_normal(n),1500)*np.exp(-t*8)
    return gain*(boom+.6*nz)
def chime(m,gain=.12):
    n=int(1.8*SR); t=np.arange(n)/SR; f=hz(m)
    return gain*(np.sin(2*np.pi*f*t)+.5*np.sin(2*np.pi*f*2.01*t)+.25*np.sin(2*np.pi*f*3.02*t))*np.exp(-t*2.5)

# --- Part A 0-9.3: dark pad + heartbeat (synced to visual pulse period 1.1s)
add(pad([45,52,57,60],5.0,.10,.5),0.0)
add(pad([41,48,53,57],5.0,.10,.5),4.5)
k=0
while True:
    tp=1.1*(0.25+k)
    if tp>9.3: break
    add(heart(),tp-0.03); add(heart(.35),tp+0.17); k+=1
# low drone
n=at(9.4); t=np.arange(n)/SR; add(.05*np.sin(2*np.pi*55*t)*env(n,1,.4),0)
# whooshes / transitions
add(whoosh(.6,.18,True),4.0)
add(whoosh(1.0,.30,True),9.2)
add(impact(.75),10.18); add(impact(.45),10.78)
add(whoosh(.7,.22,True),13.3); add(whoosh(.7,.22,True),19.3); add(whoosh(.8,.25,True),23.6)
# pops for labels & cards
for tt in (4.9,5.4,5.9,6.4,6.9,7.4): add(pluck(84,.25,.06),tt,pan=.4 if int(tt*10)%2 else -.4)
for i in range(4): add(pluck(79+[0,2,4,7][i],.4,.09),15.0+i*.75)
for tt in (20.6,21.4): add(chime(84,.08),tt)

# --- Part B 10.2-29.9: uplifting groove, 120bpm
prog=[[48,55,60,64],[43,50,55,59],[45,52,57,60],[41,48,53,57]]  # C G Am F
bass=[36,31,33,29]
start=10.2; bar=2.0; c=0
tt=start
while tt<28.2:
    ch=prog[c%4]
    add(pad(ch,bar+.4,.11,1.0),tt)
    nb=int(bar*SR); tb=np.arange(nb)/SR
    add(.16*np.sin(2*np.pi*hz(bass[c%4])*tb)*env(nb,.02,.3),tt)
    arp=[ch[1]+12,ch[2]+12,ch[3]+12,ch[2]+12]
    for s in range(8):
        add(pluck(arp[s%4],.4,.05),tt+s*.25,pan=-.3 if s%2 else .3)
    for b in range(4):
        if tt+b*.5>14.0: add(kick(.45),tt+b*.5)
        if tt+b*.5>14.0: add(hat(.05),tt+b*.5+.25)
    tt+=bar; c+=1
# ending: final C chord + chime on CTA button
add(pad([48,55,60,64,67],3.2,.14,1.0),tt)
n=at(3.2); t=np.arange(n)/SR; add(.16*np.sin(2*np.pi*hz(36)*t)*env(n,.02,1.5),tt)
add(chime(88,.14),25.62); add(chime(91,.10),25.75)
add(kick(.5),tt)

mix=np.stack([L,R],1)
fade=np.ones(N); fade[-at(1.2):]=np.linspace(1,0,at(1.2)); mix*=fade[:,None]
mix=np.tanh(mix*1.2)/np.tanh(1.2)
mix/=np.max(np.abs(mix))/0.89
with wave.open('music.wav','wb') as w:
    w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR)
    w.writeframes((mix*32767).astype('<i2').tobytes())
print('ok')
