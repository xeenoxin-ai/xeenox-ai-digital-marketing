# Rebuilding the Trioz video

`video.html` draws each frame on a canvas with `renderFrame(t)`. `render.cjs` steps through it in headless Chromium (Playwright) and pipes the frames to ffmpeg. `music.py` synthesises the original music bed and sound effects with numpy.

Run these commands from the `docs/creative/trioz-first-impression` folder.

1. Generate the music bed:

   ```bash
   python3 render/music.py /tmp/music_raw.wav
   ```

2. Normalise it to −14 LUFS:

   ```bash
   ffmpeg -y -i /tmp/music_raw.wav -af loudnorm=I=-14:TP=-1.5:LRA=11 -ar 48000 /tmp/music.wav
   ```

3. Render the 30-second master:

   ```bash
   node render/render.cjs video /tmp/music.wav trioz-strong-first-impression-30s.mp4
   ```

4. Render the thumbnail:

   ```bash
   node render/render.cjs thumb trioz-thumbnail.png
   ```

5. Optionally, render stills at chosen timestamps for review:

   ```bash
   node render/render.cjs stills /tmp/stills 1.5,12.3,28.0
   ```

The 6-second cut-down joins 0:10.0–0:13.5 and 0:27.5–0:30.0 of the master:

```bash
ffmpeg -y -i trioz-strong-first-impression-30s.mp4 -filter_complex "[0:v]trim=10:13.5,setpts=PTS-STARTPTS[v1];[0:v]trim=27.5:30,setpts=PTS-STARTPTS[v2];[0:a]atrim=10:13.5,asetpts=PTS-STARTPTS,afade=t=out:st=3.35:d=0.15[a1];[0:a]atrim=27.5:30,asetpts=PTS-STARTPTS,afade=t=in:d=0.1[a2];[v1][a1][v2][a2]concat=n=2:v=1:a=1[v][a]" -map "[v]" -map "[a]" -c:v libx264 -crf 20 -maxrate 9M -bufsize 18M -pix_fmt yuv420p -c:a aac -b:a 192k -movflags +faststart trioz-strong-first-impression-6s.mp4
```

To use real Trioz assets, replace the drawing functions `newFrame`, `newLeaf`, `handle`, `win` and `logo` in `video.html` with `ctx.drawImage` calls that place the approved product renders and logo files.
