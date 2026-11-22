// Fake database for design checks. Not used by the real app.
const d = (n) => { const x = new Date(Date.now() + n * 864e5); return x.toISOString().slice(0, 10); };
const P = new URLSearchParams(location.search);
export const configured = true, VAPID = 'x';
export const isIOS = P.has('ios'), standalone = !P.has('browser');
export const pushSupported = true, native = false, TESTFLIGHT = P.has('tf') ? 'https://testflight.apple.com/join/EXAMPLE' : '';
export const openExternal = () => {}, deleteAccount = async () => { signedIn = false; };
let signedIn = !P.has('out');
const db = {
  me: { avatar_url: '', id: 'me', name: P.has('new') ? '' : 'Bianca Valmarana', home: P.has('new') ? '' : 'Zurich', invite_code: 'abc123', stays: P.has('new') ? [] : [
    { id: 't1', city: 'Florence', a: d(3), b: d(7), e: '🌻' }, { id: 't2', city: 'London', a: d(18), b: d(20) } ] },
  friends: P.has('new') ? [] : [
    { id: 'f1', name: 'Mariechen', home: 'Florence', stays: [{ id: 'x1', city: 'Zurich', a: d(11), b: d(13) }] },
    { id: 'f2', name: 'Paola', home: 'Zurich', avatar_url: 'data:image/svg+xml,'+encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 40 40"><defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#8EC5FF"/><stop offset="1" stop-color="#FFD1E3"/></linearGradient></defs><rect width="40" height="40" fill="url(#g)"/><circle cx="28" cy="12" r="5" fill="#FFE14D"/><path d="M0 32l12-12 10 9 6-5 12 10v6H0z" fill="#5BA36B"/></svg>'), stays: [{ id: 'x2', city: 'Florence', a: d(5), b: d(9) }, { id: 'x3', city: 'Bali', a: d(25), b: d(40) }] },
    { id: 'f3', name: 'Masha', home: 'London', stays: [] } ],
  tripInvites: P.has('noreq') ? [] : [{ id: 'ti1', from_user: 'f1', from_name: 'Mariechen', city: 'Lisbon', start_date: d(30), end_date: d(33), emoji: '', note: '' }],
  guests: [], invitesReady: true, v10: true, close: ['f2'],
  meetups: P.has('noreq') ? [] : [{ id: 'm1', from_user: 'f1', to_user: 'me', day: d(4), city: 'Florence', note: 'Aperitivo?', status: 'pending' }],
  requests: P.has('noreq') ? [] : [{ id: 'r1', from_name: 'Giulia' }],
};
export const session = async () => (signedIn ? { user: { id: 'me' } } : null);
export const sendCode = async () => {};
export const verifyCode = async () => { signedIn = true; return { user: { id: 'me' } }; };
export const signOut = async () => { signedIn = false; };
export const inviteName = async () => 'Bianca';
export const requestByCode = async () => {}, requestByEmail = async () => {}, acceptCode = async () => {};
export const acceptRequest = async () => { db.requests = []; }, ignoreRequest = async () => {}, unfriend = async () => {};
export const loadAll = async () => JSON.parse(JSON.stringify(db));
export const saveProfile = async (u, f) => { db.me.name = f.name; db.me.home = f.home; };
export const addTrip = async (s) => { const id = 'n' + Math.random(); db.me.stays.push({ ...s, id }); return id; };
export const updateTrip = async (id, s) => { const i = db.me.stays.findIndex((x) => x.id === id); if (i >= 0) db.me.stays[i] = { ...s, id }; }, deleteTrip = async () => {};
export const tripExtrasReady = () => true;
export const watch = () => () => {};
let perm = P.has('alerts') ? 'granted' : 'default';
export const pushState = () => (isIOS && !standalone ? 'install' : perm);
export const enablePush = async () => (perm = 'granted');
export const syncPush = async () => {}, disablePush = async () => { perm = 'default'; };
export const today = () => d(0);

export const searchPeople = async (q) => [{ id: 'x1', name: 'Marta Rossi', username: 'marta.r', status: 'none' }, { id: 'x2', name: 'Martina', username: 'tina', status: 'sent' }].filter((p) => (p.name + p.username).toLowerCase().includes(q.toLowerCase().replace('@', '')));
export const requestUser = async () => 'sent';
export const setUsername = async () => {};

export const calendarSupported = new URLSearchParams(location.search).has('ios');
export const calendarEvents = async () => ({ state: 'granted', events: [
  { title: 'Flight to London', location: 'Heathrow Airport', start: '2026-12-02T08:00:00Z', end: '2026-12-02T10:00:00Z', allDay: false },
  { title: 'Hotel', location: 'Hotel Arts Barcelona', start: '2026-12-09T00:00:00Z', end: '2026-12-13T00:00:00Z', allDay: true },
  { title: 'Dentist', location: 'Zurich', start: '2026-12-05T08:00:00Z', end: '2026-12-05T09:00:00Z', allDay: false } ] });

export const canShare = true, shareText = (t) => console.log('share', t);

export const hasPhoneApp = async () => false;

export const uploadAvatar = async (u, b) => URL.createObjectURL(b);
export const removeAvatar = async () => {};
export const inviteToTrip = async (t, ids) => ids.length;
export const answerTripInvite = async () => { db.tripInvites = []; };
export const REVIEW_EMAIL = 'review.overlap@example.com';
export const signInPassword = async () => ({});
export const blockUser = async () => {};
export const reportUser = async () => {};
export const proposeMeetup = async () => {};
export const answerMeetup = async () => { db.meetups = []; };
export const setClose = async () => {};
export const closeReady = () => true;
