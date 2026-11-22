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
    { id: 'f1', avatar_url: 'data:image/svg+xml,%3Csvg%20xmlns%3D%22http%3A//www.w3.org/2000/svg%22%20viewBox%3D%220%200%2080%2080%22%3E%3Crect%20width%3D%2280%22%20height%3D%2280%22%20fill%3D%22%23FFE3D0%22/%3E%3Cpath%20d%3D%22M18%2044c-4-22%206-34%2022-34s26%2012%2022%2034c-2%2010-2%2022%204%2030H14c6-8%206-20%204-30z%22%20fill%3D%22%238A4B2A%22/%3E%3Cpath%20d%3D%22M12%2080c2-16%2014-24%2028-24s26%208%2028%2024z%22%20fill%3D%22%235BA36B%22/%3E%3Crect%20x%3D%2234%22%20y%3D%2246%22%20width%3D%2212%22%20height%3D%2212%22%20rx%3D%225%22%20fill%3D%22%23F3C9A8%22/%3E%3Cellipse%20cx%3D%2240%22%20cy%3D%2236%22%20rx%3D%2215%22%20ry%3D%2217%22%20fill%3D%22%23F3C9A8%22/%3E%3Ccircle%20cx%3D%2234%22%20cy%3D%2237%22%20r%3D%221.8%22%20fill%3D%22%232A1420%22/%3E%3Ccircle%20cx%3D%2246%22%20cy%3D%2237%22%20r%3D%221.8%22%20fill%3D%22%232A1420%22/%3E%3Cpath%20d%3D%22M35%2044c3%203%207%203%2010%200%22%20stroke%3D%22%232A1420%22%20stroke-width%3D%221.8%22%20fill%3D%22none%22%20stroke-linecap%3D%22round%22/%3E%3Ccircle%20cx%3D%2230%22%20cy%3D%2242%22%20r%3D%222.5%22%20fill%3D%22%23F29C9C%22%20opacity%3D%22.5%22/%3E%3Ccircle%20cx%3D%2250%22%20cy%3D%2242%22%20r%3D%222.5%22%20fill%3D%22%23F29C9C%22%20opacity%3D%22.5%22/%3E%3C/svg%3E', name: 'Mariechen', home: 'Florence', stays: [{ id: 'x1', city: 'Zurich', a: d(11), b: d(13) }] },
    { id: 'f2', avatar_url: 'data:image/svg+xml,%3Csvg%20xmlns%3D%22http%3A//www.w3.org/2000/svg%22%20viewBox%3D%220%200%2080%2080%22%3E%3Crect%20width%3D%2280%22%20height%3D%2280%22%20fill%3D%22%23DDEBFF%22/%3E%3Cpath%20d%3D%22M12%2080c2-16%2014-24%2028-24s26%208%2028%2024z%22%20fill%3D%22%23E8607A%22/%3E%3Crect%20x%3D%2234%22%20y%3D%2246%22%20width%3D%2212%22%20height%3D%2212%22%20rx%3D%225%22%20fill%3D%22%23E9B48C%22/%3E%3Cellipse%20cx%3D%2240%22%20cy%3D%2236%22%20rx%3D%2215%22%20ry%3D%2217%22%20fill%3D%22%23E9B48C%22/%3E%3Ccircle%20cx%3D%2240%22%20cy%3D%2212%22%20r%3D%229%22%20fill%3D%22%232B1B14%22/%3E%3Cpath%20d%3D%22M20%2038c0-16%208-24%2020-24s20%208%2020%2024c-6-8-14-10-20-10s-14%202-20%2010z%22%20fill%3D%22%232B1B14%22/%3E%3Ccircle%20cx%3D%2234%22%20cy%3D%2237%22%20r%3D%221.8%22%20fill%3D%22%232A1420%22/%3E%3Ccircle%20cx%3D%2246%22%20cy%3D%2237%22%20r%3D%221.8%22%20fill%3D%22%232A1420%22/%3E%3Cpath%20d%3D%22M35%2044c3%203%207%203%2010%200%22%20stroke%3D%22%232A1420%22%20stroke-width%3D%221.8%22%20fill%3D%22none%22%20stroke-linecap%3D%22round%22/%3E%3Ccircle%20cx%3D%2230%22%20cy%3D%2242%22%20r%3D%222.5%22%20fill%3D%22%23F29C9C%22%20opacity%3D%22.5%22/%3E%3Ccircle%20cx%3D%2250%22%20cy%3D%2242%22%20r%3D%222.5%22%20fill%3D%22%23F29C9C%22%20opacity%3D%22.5%22/%3E%3C/svg%3E', name: 'Paola', home: 'Zurich',  stays: [{ id: 'x2', city: 'Florence', a: d(5), b: d(9) }, { id: 'x3', city: 'Bali', a: d(25), b: d(40) }] },
    { id: 'f3', avatar_url: 'data:image/svg+xml,%3Csvg%20xmlns%3D%22http%3A//www.w3.org/2000/svg%22%20viewBox%3D%220%200%2080%2080%22%3E%3Crect%20width%3D%2280%22%20height%3D%2280%22%20fill%3D%22%23FFF1C2%22/%3E%3Cpath%20d%3D%22M12%2080c2-16%2014-24%2028-24s26%208%2028%2024z%22%20fill%3D%22%236A8DE8%22/%3E%3Crect%20x%3D%2234%22%20y%3D%2246%22%20width%3D%2212%22%20height%3D%2212%22%20rx%3D%225%22%20fill%3D%22%23FAD9C1%22/%3E%3Cellipse%20cx%3D%2240%22%20cy%3D%2236%22%20rx%3D%2215%22%20ry%3D%2217%22%20fill%3D%22%23FAD9C1%22/%3E%3Cg%20fill%3D%22%23E8C26A%22%3E%3Ccircle%20cx%3D%2224%22%20cy%3D%2226%22%20r%3D%229%22/%3E%3Ccircle%20cx%3D%2234%22%20cy%3D%2218%22%20r%3D%2210%22/%3E%3Ccircle%20cx%3D%2247%22%20cy%3D%2219%22%20r%3D%2210%22/%3E%3Ccircle%20cx%3D%2256%22%20cy%3D%2228%22%20r%3D%229%22/%3E%3Ccircle%20cx%3D%2221%22%20cy%3D%2238%22%20r%3D%227%22/%3E%3Ccircle%20cx%3D%2259%22%20cy%3D%2240%22%20r%3D%227%22/%3E%3C/g%3E%3Ccircle%20cx%3D%2234%22%20cy%3D%2237%22%20r%3D%221.8%22%20fill%3D%22%232A1420%22/%3E%3Ccircle%20cx%3D%2246%22%20cy%3D%2237%22%20r%3D%221.8%22%20fill%3D%22%232A1420%22/%3E%3Cpath%20d%3D%22M35%2044c3%203%207%203%2010%200%22%20stroke%3D%22%232A1420%22%20stroke-width%3D%221.8%22%20fill%3D%22none%22%20stroke-linecap%3D%22round%22/%3E%3Ccircle%20cx%3D%2230%22%20cy%3D%2242%22%20r%3D%222.5%22%20fill%3D%22%23F29C9C%22%20opacity%3D%22.5%22/%3E%3Ccircle%20cx%3D%2250%22%20cy%3D%2242%22%20r%3D%222.5%22%20fill%3D%22%23F29C9C%22%20opacity%3D%22.5%22/%3E%3C/svg%3E', name: 'Masha', home: 'London', stays: [] } ],
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
