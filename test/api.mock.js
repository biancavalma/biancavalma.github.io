// Fake database for design checks. Not used by the real app.
const d = (n) => { const x = new Date(Date.now() + n * 864e5); return x.toISOString().slice(0, 10); };
const P = new URLSearchParams(location.search);
export const configured = true, VAPID = 'x';
export const isIOS = P.has('ios'), standalone = !P.has('browser');
export const pushSupported = true, native = false, TESTFLIGHT = P.has('tf') ? 'https://testflight.apple.com/join/EXAMPLE' : '';
export const openExternal = () => {}, deleteAccount = async () => { signedIn = false; };
let signedIn = !P.has('out');
const db = {
  me: { id: 'me', name: P.has('new') ? '' : 'Bianca Valmarana', home: P.has('new') ? '' : 'Zurich', invite_code: 'abc123', stays: P.has('new') ? [] : [
    { id: 't1', city: 'Florence', a: d(3), b: d(7), e: '🌻' }, { id: 't2', city: 'London', a: d(18), b: d(20) } ] },
  friends: P.has('new') ? [] : [
    { id: 'f1', name: 'Mariechen', home: 'Florence', stays: [{ id: 'x1', city: 'Zurich', a: d(11), b: d(13) }] },
    { id: 'f2', name: 'Paola', home: 'Zurich', stays: [{ id: 'x2', city: 'Florence', a: d(5), b: d(9) }, { id: 'x3', city: 'Bali', a: d(25), b: d(40) }] },
    { id: 'f3', name: 'Masha', home: 'London', stays: [] } ],
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
export const updateTrip = async () => {}, deleteTrip = async () => {};
export const watch = () => () => {};
let perm = P.has('alerts') ? 'granted' : 'default';
export const pushState = () => (isIOS && !standalone ? 'install' : perm);
export const enablePush = async () => (perm = 'granted');
export const syncPush = async () => {}, disablePush = async () => { perm = 'default'; };
export const today = () => d(0);
