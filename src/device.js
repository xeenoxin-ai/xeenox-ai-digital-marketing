// Voice and keep-screen-on, free on every platform: the Capacitor community
// plugins use the phone's own text-to-speech and wake lock in the Android app,
// and fall back to the browser's speechSynthesis / Wake Lock on the web.

import { TextToSpeech } from '@capacitor-community/text-to-speech';
import { KeepAwake } from '@capacitor-community/keep-awake';
import { load, save } from './storage.js';

let muted = load('muted', false);

export const isMuted = () => muted;

export function setMuted(value) {
  muted = value;
  save('muted', value);
  if (muted) TextToSpeech.stop().catch(() => {});
}

export async function speak(text) {
  if (muted || !text) return;
  try {
    await TextToSpeech.stop();
    await TextToSpeech.speak({ text, lang: 'en-IN', rate: 1.0, category: 'playback' });
  } catch {
    /* no voice engine on this device: the banner still shows the turn */
  }
}

export async function keepScreenOn(on) {
  try {
    if (on) await KeepAwake.keepAwake();
    else await KeepAwake.allowSleep();
  } catch {
    /* not supported: the screen may dim on its own */
  }
}
