// Sets up TestFlight through the App Store Connect API, so nobody has to click through App Store Connect.
// - adds the owner as an internal tester (can install at once, no Apple review)
// - makes the external group "Amici" with a public link, adds the latest build
// - fills the test information and, if REVIEW=yes, sends the build to Apple's beta review
import crypto from 'node:crypto';
import fs from 'node:fs';

const KEY_ID = process.env.EXPO_ASC_KEY_ID;
const ISSUER = process.env.EXPO_ASC_ISSUER_ID;
const KEY_PATH = process.env.EXPO_ASC_API_KEY_PATH;
const APP_ID = process.env.ASC_APP_ID;
const OWNER_EMAIL = process.env.OWNER_EMAIL;
const OWNER_FIRST = process.env.OWNER_FIRST || '';
const OWNER_LAST = process.env.OWNER_LAST || '';
const OWNER_PHONE = process.env.OWNER_PHONE || '';
const FEEDBACK = process.env.FEEDBACK_EMAIL;
const REVIEW = process.env.REVIEW === 'yes';

const b64url = (b) => Buffer.from(b).toString('base64url');
function token() {
  const now = Math.floor(Date.now() / 1000);
  const head = b64url(JSON.stringify({ alg: 'ES256', kid: KEY_ID, typ: 'JWT' }));
  const body = b64url(JSON.stringify({ iss: ISSUER, iat: now, exp: now + 15 * 60, aud: 'appstoreconnect-v1' }));
  const sig = crypto.sign('sha256', Buffer.from(`${head}.${body}`), { key: fs.readFileSync(KEY_PATH, 'utf8'), dsaEncoding: 'ieee-p1363' });
  return `${head}.${body}.${b64url(sig)}`;
}
async function api(method, path, body, okCodes = []) {
  const r = await fetch(`https://api.appstoreconnect.apple.com${path}`, {
    method,
    headers: { Authorization: `Bearer ${token()}`, 'Content-Type': 'application/json' },
    body: body ? JSON.stringify(body) : undefined,
  });
  const text = await r.text();
  if (!r.ok && !okCodes.includes(r.status)) throw new Error(`${method} ${path} → ${r.status}: ${text.slice(0, 800)}`);
  if (!r.ok) console.log(`(${method} ${path} → ${r.status}, skipped: ${text.slice(0, 300)})`);
  return text && r.ok ? JSON.parse(text) : {};
}

const DESCRIPTION =
  'Overlap is a shared calendar for friends. Each person sets the city they live in and adds their trips, and Overlap shows when friends will be in the same city at the same time, with an alert when that happens.';
const WHATS_NEW = 'First test version. Sign in with your email, set your city, add a trip and invite a friend from the Friends tab.';
const NOTES =
  'Sign in: enter any email address you can read and tap "Send me a code". A 6 digit code arrives by email; type it in the app. No password or demo account is needed. Then set a name and a city, and add a trip with the "Add trip" button.';

// latest build
const builds = await api('GET', `/v1/builds?filter[app]=${APP_ID}&sort=-uploadedDate&limit=1`);
const build = builds.data[0];
if (!build) throw new Error('No build found');
console.log(`Latest build ${build.attributes.version} (${build.attributes.processingState})`);

// groups
const groups = (await api('GET', `/v1/apps/${APP_ID}/betaGroups?limit=50`)).data || [];
const internal = groups.find((g) => g.attributes.isInternalGroup);
let friends = groups.find((g) => !g.attributes.isInternalGroup && g.attributes.name === 'Amici');

// 1. owner as internal tester
if (internal && OWNER_EMAIL) {
  await api(
    'POST',
    '/v1/betaTesters',
    {
      data: {
        type: 'betaTesters',
        attributes: { email: OWNER_EMAIL, firstName: OWNER_FIRST, lastName: OWNER_LAST },
        relationships: { betaGroups: { data: [{ type: 'betaGroups', id: internal.id }] } },
      },
    },
    [409]
  );
  console.log(`Owner added to internal group "${internal.attributes.name}"`);
}

// 2. test information
const locs = (await api('GET', `/v1/apps/${APP_ID}/betaAppLocalizations`)).data || [];
const locAttrs = { description: DESCRIPTION, feedbackEmail: FEEDBACK };
if (locs.length) for (const l of locs) await api('PATCH', `/v1/betaAppLocalizations/${l.id}`, { data: { type: 'betaAppLocalizations', id: l.id, attributes: locAttrs } });
else
  await api('POST', '/v1/betaAppLocalizations', {
    data: { type: 'betaAppLocalizations', attributes: { ...locAttrs, locale: 'en-GB' }, relationships: { app: { data: { type: 'apps', id: APP_ID } } } },
  });
const bLocs = (await api('GET', `/v1/builds/${build.id}/betaBuildLocalizations`)).data || [];
if (bLocs.length) for (const l of bLocs) await api('PATCH', `/v1/betaBuildLocalizations/${l.id}`, { data: { type: 'betaBuildLocalizations', id: l.id, attributes: { whatsNew: WHATS_NEW } } });
else
  await api('POST', '/v1/betaBuildLocalizations', {
    data: { type: 'betaBuildLocalizations', attributes: { whatsNew: WHATS_NEW, locale: 'en-GB' }, relationships: { build: { data: { type: 'builds', id: build.id } } } },
  }, [409]);
const detail = await api('GET', `/v1/apps/${APP_ID}/betaAppReviewDetail`);
await api('PATCH', `/v1/betaAppReviewDetails/${detail.data.id}`, {
  data: {
    type: 'betaAppReviewDetails',
    id: detail.data.id,
    attributes: {
      contactEmail: FEEDBACK,
      contactFirstName: OWNER_FIRST,
      contactLastName: OWNER_LAST,
      ...(OWNER_PHONE ? { contactPhone: OWNER_PHONE } : {}),
      demoAccountRequired: false,
      notes: NOTES,
    },
  },
});
console.log('Test information filled');

// 3. external group with public link, and the build in it
if (!friends) {
  friends = (
    await api('POST', '/v1/betaGroups', {
      data: {
        type: 'betaGroups',
        attributes: { name: 'Amici', publicLinkEnabled: true, publicLinkLimitEnabled: false },
        relationships: { app: { data: { type: 'apps', id: APP_ID } } },
      },
    })
  ).data;
  console.log('Created external group "Amici"');
}
await api('POST', `/v1/betaGroups/${friends.id}/relationships/builds`, { data: [{ type: 'builds', id: build.id }] }, [409, 422]);
console.log('Build added to "Amici"');

// 4. beta review
if (REVIEW) {
  await api('POST', '/v1/betaAppReviewSubmissions', { data: { type: 'betaAppReviewSubmissions', relationships: { build: { data: { type: 'builds', id: build.id } } } } }, [409, 422]);
  console.log('Sent to Apple beta review');
}
const g = await api('GET', `/v1/betaGroups/${friends.id}`);
console.log(`Public link: ${g.data.attributes.publicLink || '(appears after Apple approves the build)'}`);
