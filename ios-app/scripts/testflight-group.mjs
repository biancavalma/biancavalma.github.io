// Gives the newest build to the TestFlight group of friends ("Amici"), so nobody has to do it by hand in App Store Connect.
// Uses the App Store Connect key that the build already uses. Safe to run again: steps already done are skipped.
import crypto from 'node:crypto';
import fs from 'node:fs';

const APP = '6836661604';
const GROUP = process.env.TF_GROUP || 'Amici';
const NOTE = process.env.TF_NOTE || 'New version of Overlap with the latest fixes.';
const key = fs.readFileSync(process.env.EXPO_ASC_API_KEY_PATH, 'utf8');
const b64 = (o) => Buffer.from(typeof o === 'string' ? o : JSON.stringify(o)).toString('base64url');

function token() {
  const now = Math.floor(Date.now() / 1000);
  const head = b64({ alg: 'ES256', kid: process.env.EXPO_ASC_KEY_ID, typ: 'JWT' });
  const body = b64({ iss: process.env.EXPO_ASC_ISSUER_ID, iat: now, exp: now + 1100, aud: 'appstoreconnect-v1' });
  const sig = crypto.sign('sha256', Buffer.from(head + '.' + body), { key, dsaEncoding: 'ieee-p1363' }).toString('base64url');
  return head + '.' + body + '.' + sig;
}
async function api(method, path, data) {
  const r = await fetch('https://api.appstoreconnect.apple.com' + path, {
    method, headers: { Authorization: 'Bearer ' + token(), 'Content-Type': 'application/json' },
    body: data ? JSON.stringify(data) : undefined,
  });
  const text = await r.text();
  let json = null; try { json = text ? JSON.parse(text) : null; } catch {}
  return { ok: r.ok, status: r.status, json, text };
}
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

const g = await api('GET', `/v1/apps/${APP}/betaGroups?limit=50`);
if (!g.ok) { console.error('Could not read the tester groups:', g.status, g.text); process.exit(1); }
const group = g.json.data.find((x) => x.attributes.name === GROUP);
if (!group) { console.error('No TestFlight group called', GROUP, '- groups:', g.json.data.map((x) => x.attributes.name).join(', ')); process.exit(1); }

// newest build, once Apple has finished processing it
let build;
for (let i = 0; i < 45; i++) {
  const b = await api('GET', `/v1/builds?filter[app]=${APP}&sort=-uploadedDate&limit=1`);
  build = b.json && b.json.data && b.json.data[0];
  const state = build && build.attributes.processingState;
  console.log('Newest build', build && build.attributes.version, state);
  if (state === 'VALID') break;
  if (state === 'FAILED' || state === 'INVALID') process.exit(1);
  await sleep(60000);
}
if (!build || build.attributes.processingState !== 'VALID') { console.error('Build still processing, try again later'); process.exit(1); }

if (build.attributes.usesNonExemptEncryption == null) {
  const e = await api('PATCH', `/v1/builds/${build.id}`, { data: { type: 'builds', id: build.id, attributes: { usesNonExemptEncryption: false } } });
  console.log('Encryption answer:', e.status);
}
const loc = await api('POST', '/v1/betaBuildLocalizations', { data: { type: 'betaBuildLocalizations', attributes: { locale: 'en-US', whatsNew: NOTE }, relationships: { build: { data: { type: 'builds', id: build.id } } } } });
console.log('What to test:', loc.status);
const add = await api('POST', `/v1/betaGroups/${group.id}/relationships/builds`, { data: [{ type: 'builds', id: build.id }] });
console.log('Added to', GROUP + ':', add.status, add.ok ? '' : add.text.slice(0, 300));
const rev = await api('POST', '/v1/betaAppReviewSubmissions', { data: { type: 'betaAppReviewSubmissions', relationships: { build: { data: { type: 'builds', id: build.id } } } } });
console.log('Sent to Apple for the quick tester check:', rev.status, rev.ok ? '' : rev.text.slice(0, 300));
if (!add.ok && add.status !== 409) process.exit(1);

// how the newest build stands for the friends group
const det = await api('GET', `/v1/builds/${build.id}/buildBetaDetail`);
console.log('Build', build.attributes.version, 'for friends:', det.json && det.json.data && det.json.data.attributes.externalBuildState, '| expires', build.attributes.expirationDate);
const grpB = await api('GET', `/v1/betaGroups/${group.id}?fields[betaGroups]=name,publicLinkEnabled,publicLink`);
console.log('Group', GROUP, 'public link on:', grpB.json && grpB.json.data.attributes.publicLinkEnabled);
