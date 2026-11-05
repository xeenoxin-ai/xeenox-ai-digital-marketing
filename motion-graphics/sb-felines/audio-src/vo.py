import sys, json, soundfile as sf
from kokoro_onnx import Kokoro
k = Kokoro(sys.argv[1]+"/kokoro-v1.0.onnx", sys.argv[1]+"/voices-v1.0.bin")
voice = sys.argv[2]; out = sys.argv[3]
lines = json.load(open(sys.argv[4]))
res=[]
for i,(start,maxlen,text,speed) in enumerate(lines):
    s, sr = k.create(text, voice=voice, speed=speed, lang="en-us")
    sf.write(f"{out}/vo_{i}.wav", s, sr)
    res.append((i, round(len(s)/sr,2), maxlen))
print(res)
