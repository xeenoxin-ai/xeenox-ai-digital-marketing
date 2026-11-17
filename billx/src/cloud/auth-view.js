// Sign in / create account / verify email screens.
import {
  signInWithEmailAndPassword, createUserWithEmailAndPassword, GoogleAuthProvider, signInWithPopup,
  sendEmailVerification, sendPasswordResetEmail, updateProfile, signOut,
} from 'firebase/auth';
import { firebase } from './firebase.js';
import { TRIAL_DAYS } from '../plans.js';
import { icon, esc, toast } from '../ui.js';
import logoUrl from '../../logo.svg';

const ERRORS = {
  'auth/invalid-credential': 'Email or password is wrong.',
  'auth/wrong-password': 'Email or password is wrong.',
  'auth/user-not-found': 'No account with this email. Create one below.',
  'auth/email-already-in-use': 'This email already has an account. Sign in instead.',
  'auth/weak-password': 'Use at least 8 characters for the password.',
  'auth/invalid-email': 'That email address does not look right.',
  'auth/too-many-requests': 'Too many attempts. Wait a minute and try again.',
  'auth/popup-closed-by-user': 'Google sign-in was closed.',
  'auth/network-request-failed': 'No internet connection.',
};
const nice = (e) => ERRORS[e.code] || e.message || 'Something went wrong.';

function shell(inner) {
  document.body.classList.add('onboarding');
  document.getElementById('pageTitle').textContent = 'BillX';
  const main = document.getElementById('view');
  main.innerHTML = `<div class="auth"><a class="auth-brand" href="../"><img src="${logoUrl}" alt="" width="40" height="40"><span>Bill<b>X</b></span></a>${inner}</div>`;
  return main.firstElementChild;
}

export function showStatus(text) {
  shell(`<div class="auth-card"><div class="spinner" aria-hidden="true"></div><p>${esc(text)}</p></div>`);
}

export function showAuth(mode = location.hash.startsWith('#/signup') ? 'signup' : 'login') {
  const signup = mode === 'signup';
  const root = shell(`
    <form class="auth-card" id="authForm">
      <h1>${signup ? `Start your ${TRIAL_DAYS}-day free trial` : 'Sign in to BillX'}</h1>
      <p class="muted">${signup ? 'No card needed. All features included during the trial.' : 'Welcome back.'}</p>
      <button type="button" class="btn block google" id="google">${googleIcon} Continue with Google</button>
      <div class="or"><span>or</span></div>
      ${signup ? '<label class="fld"><span>Your name</span><input name="name" autocomplete="name" required></label>' : ''}
      <label class="fld"><span>Email</span><input name="email" type="email" autocomplete="email" required></label>
      <label class="fld"><span>Password</span><input name="password" type="password" minlength="8" autocomplete="${signup ? 'new-password' : 'current-password'}" required></label>
      <p class="auth-err" id="authErr" role="alert"></p>
      <button class="btn primary block">${signup ? 'Create account' : 'Sign in'}</button>
      ${signup ? '' : '<button type="button" class="btn ghost block" id="forgot">Forgot password?</button>'}
      <p class="auth-switch">${signup ? 'Already have an account? <a href="#/login">Sign in</a>' : 'New to BillX? <a href="#/signup">Start free trial</a>'}</p>
      ${signup ? '<p class="muted small">By creating an account you agree to the <a href="../legal/terms.html" target="_blank">Terms</a> and <a href="../legal/privacy.html" target="_blank">Privacy Policy</a>.</p>' : ''}
      <p class="muted small">Staff member? Sign in with the email your employer added to BillX.</p>
    </form>`);
  const { auth } = firebase();
  const err = (e) => { root.querySelector('#authErr').textContent = nice(e); };
  const form = root.querySelector('#authForm');
  const busy = (on) => form.querySelectorAll('button').forEach((b) => { b.disabled = on; });

  root.querySelector('#google').addEventListener('click', async () => {
    busy(true);
    try { await signInWithPopup(auth, new GoogleAuthProvider()); } catch (e) { err(e); busy(false); }
  });
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const fd = new FormData(form);
    busy(true);
    try {
      if (signup) {
        const cred = await createUserWithEmailAndPassword(auth, fd.get('email').trim(), fd.get('password'));
        await updateProfile(cred.user, { displayName: fd.get('name').trim() });
        await sendEmailVerification(cred.user);
      } else {
        await signInWithEmailAndPassword(auth, fd.get('email').trim(), fd.get('password'));
      }
    } catch (ex) { err(ex); busy(false); }
  });
  const forgot = root.querySelector('#forgot');
  if (forgot) forgot.addEventListener('click', async () => {
    const email = form.elements.email.value.trim();
    if (!email) return err({ message: 'Type your email above first.' });
    try { await sendPasswordResetEmail(auth, email); toast('Password reset email sent'); } catch (ex) { err(ex); }
  });
  window.onhashchange = () => {
    if (['#/signup', '#/login'].some((h) => location.hash.startsWith(h))) showAuth();
  };
}

export function showVerify(user) {
  const root = shell(`<div class="auth-card">
    <h1>Check your email</h1>
    <p>We sent a link to <b>${esc(user.email)}</b>. Open it to confirm your email, then come back here.</p>
    <button class="btn primary block" id="done">${icon('check')} I've confirmed my email</button>
    <button class="btn block" id="resend">Send the link again</button>
    <button class="btn ghost block" id="out">Use a different account</button>
    <p class="auth-err" id="authErr" role="alert"></p>
  </div>`);
  root.querySelector('#done').addEventListener('click', async () => {
    await user.reload();
    if (user.emailVerified) {
      await user.getIdToken(true);
      location.reload();
    } else root.querySelector('#authErr').textContent = 'Not confirmed yet. Open the link in the email (check spam too).';
  });
  root.querySelector('#resend').addEventListener('click', async () => {
    try { await sendEmailVerification(user); toast('Sent again'); } catch (e) { root.querySelector('#authErr').textContent = nice(e); }
  });
  root.querySelector('#out').addEventListener('click', () => signOut(firebase().auth));
}

const googleIcon = '<svg width="18" height="18" viewBox="0 0 48 48" aria-hidden="true"><path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3C33.7 32.7 29.2 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.8 1.2 7.9 3.1l5.7-5.7C34 6.1 29.3 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.3-.1-2.4-.4-3.5z"/><path fill="#FF3D00" d="m6.3 14.7 6.6 4.8C14.7 15.1 19 12 24 12c3.1 0 5.8 1.2 7.9 3.1l5.7-5.7C34 6.1 29.3 4 24 4 16.3 4 9.7 8.3 6.3 14.7z"/><path fill="#4CAF50" d="M24 44c5.2 0 9.9-2 13.4-5.2l-6.2-5.2C29.2 35.1 26.7 36 24 36c-5.2 0-9.6-3.3-11.3-7.9l-6.5 5C9.5 39.6 16.2 44 24 44z"/><path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-.8 2.2-2.2 4.2-4.1 5.6l6.2 5.2C37 39.2 44 34 44 24c0-1.3-.1-2.4-.4-3.5z"/></svg>';
