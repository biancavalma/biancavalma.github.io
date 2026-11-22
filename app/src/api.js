// Everything that talks to the database lives here.
import { createClient } from '@supabase/supabase-js';

const URL = import.meta.env.VITE_SUPABASE_URL;
const KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;
export const VAPID = import.meta.env.VITE_VAPID_PUBLIC_KEY || '';
export const configured = !!(URL && KEY);

export const sb = configured
  ? createClient(URL, KEY, { auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: false } })
  : null;

const today = () => {
  const d = new Date();
  return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
};
const back = (days) => {
  const d = new Date(Date.now() - days * 864e5);
  return d.toISOString().slice(0, 10);
};

export async function session() {
  const { data } = await sb.auth.getSession();
  return data.session;
}

export async function sendCode(email) {
  const { error } = await sb.auth.signInWithOtp({ email, options: { shouldCreateUser: true } });
  if (error) throw error;
}

export async function verifyCode(email, token) {
  const { data, error } = await sb.auth.verifyOtp({ email, token, type: 'email' });
  if (error) throw error;
  return data.session;
}

/* only for Apple's test account: sign in with a password instead of an email code */
export const REVIEW_EMAIL = 'review.overlap@example.com';
export async function signInPassword(email, password) {
  const { data, error } = await sb.auth.signInWithPassword({ email, password });
  if (error) throw error;
  return data.session;
}

/* block someone: no more sharing, requests or invites between you; a report also blocks */
export async function blockUser(id) {
  const { error } = await sb.rpc('block_user', { other: id });
  if (error) throw error;
}
export async function reportUser(id, why) {
  const { error } = await sb.rpc('report_user', { other: id, why: why || '' });
  if (error) throw error;
}

export async function signOut() {
  await sb.auth.signOut();
}

export async function inviteName(code) {
  const { data, error } = await sb.rpc('invite_info', { code });
  if (error) return null;
  return data;
}

export async function requestByCode(code, email) {
  const { error } = await sb.rpc('request_by_code', { code, email });
  if (error) throw error;
}

// people search and @usernames (need update-5-usernames.sql)
export async function searchPeople(q) {
  const { data, error } = await sb.rpc('search_people', { q });
  if (error) throw error;
  return data || [];
}
export async function requestUser(id) {
  const { data, error } = await sb.rpc('request_user', { other: id });
  if (error) throw error;
  return data;
}
export async function setUsername(uid, username) {
  const { error } = await sb.from('profiles').update({ username }).eq('id', uid);
  if (error) throw error;
}

export async function requestByEmail(email) {
  const { error } = await sb.rpc('request_by_email', { email });
  if (error) throw error;
}

export async function acceptCode(code) {
  const { error } = await sb.rpc('accept_code', { code });
  if (error) throw error;
}

export async function acceptRequest(id) {
  const { error } = await sb.rpc('accept_request', { req: id });
  if (error) throw error;
}

export async function ignoreRequest(id) {
  await sb.from('friend_requests').delete().eq('id', id);
}

export async function unfriend(id) {
  const { error } = await sb.rpc('unfriend', { other: id });
  if (error) throw error;
}

// Me, my friends, all trips we can see (from two months ago on), and requests waiting for me
export async function loadAll(uid) {
  const [p, t, r, ti, tg] = await Promise.all([
    sb.from('profiles').select('id, name, home, invite_code, phone, username, avatar_url').then((r) => (r.error ? sb.from('profiles').select('id, name, home, invite_code, phone, username') : r)).then((r) => (r.error ? sb.from('profiles').select('id, name, home, invite_code, phone') : r)).then((r) => (r.error ? sb.from('profiles').select('id, name, home, invite_code') : r)),
    tripsQuery(),
    sb.rpc('my_requests'),
    sb.rpc('my_trip_invites'),
    sb.rpc('my_trip_guests'),
  ]);
  if (p.error) throw p.error;
  if (t.error) throw t.error;
  const profiles = p.data || [];
  const me = profiles.find((x) => x.id === uid) || { id: uid, name: '', home: '', invite_code: '' };
  const friends = profiles.filter((x) => x.id !== uid).sort((a, b) => (a.name || '').localeCompare(b.name || ''));
  const stays = (id) =>
    (t.data || [])
      .filter((s) => s.user_id === id)
      .map((s) => ({ id: s.id, city: s.city, a: s.start_date, b: s.end_date, e: s.emoji || undefined, note: s.note || '', priv: !!s.private }));
  return {
    me: { ...me, stays: stays(uid) },
    friends: friends.map((f) => ({ ...f, stays: stays(f.id) })),
    requests: r.error ? [] : r.data || [],
    tripInvites: ti.error ? [] : ti.data || [],
    guests: tg.error ? [] : tg.data || [],
    invitesReady: !tg.error,
  };
}

export async function saveProfile(uid, fields) {
  if ('phone' in fields) {
    const r = await sb.from('profiles').update(fields).eq('id', uid);
    if (!r.error) return;
    delete fields.phone; // the phone column is not in the database yet
  }
  const { error } = await sb.from('profiles').update(fields).eq('id', uid);
  if (error) throw error;
}

// notes and private trips need update-4-trips.sql; until it has run, trips save without them
let tripExtras = true;
const missingCol = (e) => e && (e.code === '42703' || e.code === 'PGRST204' || /column/i.test(e.message || ''));
function tripRow(s) {
  const r = { city: s.city, start_date: s.a, end_date: s.b, emoji: s.e || null };
  if (tripExtras) { r.note = s.note || null; r.private = !!s.priv; }
  return r;
}
async function tripsQuery() {
  const q = (cols) => sb.from('trips').select(cols).gte('end_date', back(62)).order('start_date');
  const r = await q('id, user_id, city, start_date, end_date, emoji, note, private');
  if (r.error && missingCol(r.error)) { tripExtras = false; return q('id, user_id, city, start_date, end_date, emoji'); }
  return r;
}
export const tripExtrasReady = () => tripExtras;

export async function addTrip(s) {
  let r = await sb.from('trips').insert(tripRow(s)).select('id').single();
  if (r.error && missingCol(r.error) && tripExtras) { tripExtras = false; r = await sb.from('trips').insert(tripRow(s)).select('id').single(); }
  if (r.error) throw r.error;
  return r.data.id;
}

export async function updateTrip(id, s) {
  let r = await sb.from('trips').update(tripRow(s)).eq('id', id);
  if (r.error && missingCol(r.error) && tripExtras) { tripExtras = false; r = await sb.from('trips').update(tripRow(s)).eq('id', id); }
  if (r.error) throw r.error;
}


export async function deleteTrip(id) {
  const { error } = await sb.from('trips').delete().eq('id', id);
  if (error) throw error;
}

// Reload when anything I can see changes (the database only sends what my privacy rules allow)
export function watch(onChange) {
  let timer = null;
  const ping = () => {
    clearTimeout(timer);
    timer = setTimeout(onChange, 400);
  };
  const ch = sb
    .channel('overlap-live')
    .on('postgres_changes', { event: '*', schema: 'public', table: 'trips' }, ping)
    .on('postgres_changes', { event: '*', schema: 'public', table: 'profiles' }, ping)
    .on('postgres_changes', { event: '*', schema: 'public', table: 'friendships' }, ping)
    .on('postgres_changes', { event: '*', schema: 'public', table: 'friend_requests' }, ping)
    .subscribe();
  return () => sb.removeChannel(ch);
}

// ---------- notifications ----------

// inside the iPhone app the page talks to the phone through a small bridge; in a browser it uses web alerts
export const native = typeof window !== 'undefined' && !!window.OverlapNative && !!window.ReactNativeWebView;
if (native) document.documentElement.classList.add('native');

export const isIOS = native || /iphone|ipad|ipod/i.test(navigator.userAgent) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
export const standalone = native || window.matchMedia('(display-mode: standalone)').matches || navigator.standalone === true;
export const pushSupported = native || ('serviceWorker' in navigator && 'PushManager' in window && 'Notification' in window && !!VAPID);
export const TESTFLIGHT = import.meta.env.VITE_TESTFLIGHT_URL || '';

let seq = 0;
const waiting = {};
if (native) {
  window.__ovNative = (id, data) => {
    const f = waiting[id];
    if (f) { delete waiting[id]; f(data); }
  };
}
function ask(type, wait = 20000) {
  return new Promise((resolve) => {
    const id = ++seq;
    waiting[id] = resolve;
    window.ReactNativeWebView.postMessage(JSON.stringify({ type, id }));
    setTimeout(() => { if (waiting[id]) { delete waiting[id]; resolve({ state: 'error' }); } }, wait);
  });
}
let nativeState = 'default', nativeToken = '';
async function saveToken(token) {
  const { error } = await sb.from('push_subscriptions').upsert({ endpoint: token, p256dh: '-', auth: '-' }, { onConflict: 'endpoint' });
  if (error) throw error;
}

export function openExternal(url) {
  if (native) window.ReactNativeWebView.postMessage(JSON.stringify({ type: 'open-external', url }));
  else window.open(url, '_blank', 'noopener');
}

export function pushState() {
  if (native) return nativeState === 'error' ? 'default' : nativeState;
  if (!pushSupported) return isIOS && !standalone ? 'install' : 'unsupported';
  return Notification.permission; // 'default' | 'granted' | 'denied'
}

function keyBytes(b64) {
  const pad = '='.repeat((4 - (b64.length % 4)) % 4);
  const raw = atob((b64 + pad).replace(/-/g, '+').replace(/_/g, '/'));
  return Uint8Array.from(raw, (c) => c.charCodeAt(0));
}

export async function enablePush() {
  if (native) {
    const r = await ask('push-request');
    nativeState = r.state;
    if (r.token) { nativeToken = r.token; await saveToken(r.token); }
    return r.state === 'granted' ? 'granted' : r.state === 'denied' ? 'denied' : 'default';
  }
  const perm = await Notification.requestPermission();
  if (perm !== 'granted') return perm;
  const reg = await navigator.serviceWorker.ready;
  let sub = await reg.pushManager.getSubscription();
  if (!sub) sub = await reg.pushManager.subscribe({ userVisibleOnly: true, applicationServerKey: keyBytes(VAPID) });
  const j = sub.toJSON();
  const { error } = await sb
    .from('push_subscriptions')
    .upsert({ endpoint: j.endpoint, p256dh: j.keys.p256dh, auth: j.keys.auth }, { onConflict: 'endpoint' });
  if (error) throw error;
  return 'granted';
}

// keep this device's alerts saved after a fresh sign-in, and learn the phone's alert setting
export async function syncPush() {
  if (native) {
    const r = await ask('push-state');
    nativeState = r.state;
    if (r.token) { nativeToken = r.token; try { await saveToken(r.token); } catch (e) {} }
    return;
  }
  if (!pushSupported || Notification.permission !== 'granted') return;
  try {
    await enablePush();
  } catch (e) {}
}

export async function disablePush() {
  if (native) {
    // the phone setting stays on; this phone just stops getting Overlap alerts until turned on again
    if (nativeToken) await sb.from('push_subscriptions').delete().eq('endpoint', nativeToken);
    nativeState = 'default';
    return;
  }
  if (!pushSupported) return;
  const reg = await navigator.serviceWorker.ready;
  const sub = await reg.pushManager.getSubscription();
  if (sub) {
    await sb.from('push_subscriptions').delete().eq('endpoint', sub.endpoint);
    await sub.unsubscribe();
  }
}

export async function deleteAccount() {
  await disablePush().catch(() => {});
  const { error } = await sb.rpc('delete_me');
  if (error) throw error;
  await sb.auth.signOut();
}

export { today };

// the phone's calendar, read only when the person taps "From my calendar" (iPhone app 1.0.0 build 7 and later)
export const calendarSupported = native && !!window.OverlapNative.calendar;
export function calendarEvents() {
  return ask('calendar-events', 90000);
}

// the phone's own share menu (iPhone app build 8 and later)
export const canShare = (native && !!window.OverlapNative.share) || (typeof navigator !== 'undefined' && !!navigator.share);
export function shareText(text) {
  if (native && window.OverlapNative.share) { window.ReactNativeWebView.postMessage(JSON.stringify({ type: 'share', text })); return; }
  try { navigator.share({ text }).catch(() => {}); } catch (e) {}
}

// true when this account has the iPhone app (its alerts are registered from the app)
export async function hasPhoneApp() {
  const { data, error } = await sb.from('push_subscriptions').select('endpoint').eq('p256dh', '-').limit(1);
  return !error && !!(data && data.length);
}

/* profile photo: a small square jpeg in the avatars folder, one file per person */
export async function uploadAvatar(uid, blob) {
  const path = uid + '/avatar.jpg';
  const up = await sb.storage.from('avatars').upload(path, blob, { upsert: true, contentType: 'image/jpeg', cacheControl: '3600' });
  if (up.error) throw up.error;
  const url = sb.storage.from('avatars').getPublicUrl(path).data.publicUrl + '?v=' + Date.now();
  const { error } = await sb.from('profiles').update({ avatar_url: url }).eq('id', uid);
  if (error) throw error;
  return url;
}
export async function removeAvatar(uid) {
  await sb.storage.from('avatars').remove([uid + '/avatar.jpg']);
  const { error } = await sb.from('profiles').update({ avatar_url: null }).eq('id', uid);
  if (error) throw error;
}

/* invite friends to one of my trips; they Join or say Not now */
export async function inviteToTrip(tripId, ids) {
  const { data, error } = await sb.rpc('invite_to_trip', { t: tripId, people: ids });
  if (error) throw error;
  return data;
}
export async function answerTripInvite(id, yes) {
  const { error } = await sb.rpc('answer_trip_invite', { i: id, yes });
  if (error) throw error;
}
