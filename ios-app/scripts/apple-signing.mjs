// Creates the Apple signing files for an App Store / TestFlight build, without a Mac,
// using the App Store Connect API key. Runs inside the GitHub workflow before each build.
//
// What it does:
// 1. makes a new private key and certificate request (openssl)
// 2. asks Apple for a distribution certificate (revoking our older ones, Apple allows only a few)
// 3. asks Apple for an App Store provisioning profile for the app
// 4. writes dist.p12, profile.mobileprovision and credentials.json for EAS (credentialsSource: local)
//
// Builds already on TestFlight or the App Store keep working when an old certificate is revoked.

import crypto from 'node:crypto';
import fs from 'node:fs';
import { execFileSync } from 'node:child_process';

const KEY_ID = process.env.EXPO_ASC_KEY_ID;
const ISSUER = process.env.EXPO_ASC_ISSUER_ID;
const KEY_PATH = process.env.EXPO_ASC_API_KEY_PATH;
const BUNDLE_ID = process.env.BUNDLE_ID;
const OUT = process.env.SIGNING_DIR || 'signing';
const NAME = 'Overlap EAS';

if (!KEY_ID || !ISSUER || !KEY_PATH || !BUNDLE_ID) throw new Error('Missing Apple key settings');
fs.mkdirSync(OUT, { recursive: true });

const b64url = (b) => Buffer.from(b).toString('base64url');
function token() {
  const now = Math.floor(Date.now() / 1000);
  const head = b64url(JSON.stringify({ alg: 'ES256', kid: KEY_ID, typ: 'JWT' }));
  const body = b64url(JSON.stringify({ iss: ISSUER, iat: now, exp: now + 15 * 60, aud: 'appstoreconnect-v1' }));
  const sig = crypto.sign('sha256', Buffer.from(`${head}.${body}`), {
    key: fs.readFileSync(KEY_PATH, 'utf8'),
    dsaEncoding: 'ieee-p1363',
  });
  return `${head}.${body}.${b64url(sig)}`;
}

async function api(method, path, body) {
  const r = await fetch(`https://api.appstoreconnect.apple.com${path}`, {
    method,
    headers: { Authorization: `Bearer ${token()}`, 'Content-Type': 'application/json' },
    body: body ? JSON.stringify(body) : undefined,
  });
  const text = await r.text();
  if (!r.ok) throw new Error(`${method} ${path} → ${r.status}: ${text.slice(0, 600)}`);
  return text ? JSON.parse(text) : {};
}

const run = (cmd, args) => execFileSync(cmd, args, { stdio: ['ignore', 'pipe', 'inherit'] });

// 1. key and request
run('openssl', ['genrsa', '-out', `${OUT}/dist.key`, '2048']);
run('openssl', ['req', '-new', '-key', `${OUT}/dist.key`, '-out', `${OUT}/dist.csr`, '-subj', '/CN=Overlap Distribution/C=CH']);
const csr = fs.readFileSync(`${OUT}/dist.csr`, 'utf8');

// 2. certificate: revoke ours from earlier runs, then make a new one
const certs = await api('GET', '/v1/certificates?limit=200');
for (const c of certs.data || []) {
  const t = c.attributes.certificateType;
  if (t === 'DISTRIBUTION' || t === 'IOS_DISTRIBUTION') {
    console.log(`Revoking older distribution certificate ${c.attributes.name} (${c.id})`);
    await api('DELETE', `/v1/certificates/${c.id}`);
  }
}
const cert = await api('POST', '/v1/certificates', {
  data: { type: 'certificates', attributes: { certificateType: 'DISTRIBUTION', csrContent: csr } },
});
const der = Buffer.from(cert.data.attributes.certificateContent, 'base64');
fs.writeFileSync(`${OUT}/dist.cer`, der);
run('openssl', ['x509', '-inform', 'DER', '-in', `${OUT}/dist.cer`, '-out', `${OUT}/dist.pem`]);
console.log('Created distribution certificate', cert.data.id);

// 3. profile for the app
const bundles = await api('GET', `/v1/bundleIds?filter[identifier]=${encodeURIComponent(BUNDLE_ID)}`);
const bundle = (bundles.data || []).find((b) => b.attributes.identifier === BUNDLE_ID);
if (!bundle) throw new Error(`Bundle ID ${BUNDLE_ID} is not registered in the Apple Developer account`);
const profiles = await api('GET', `/v1/profiles?filter[name]=${encodeURIComponent(NAME)}`);
for (const p of profiles.data || []) await api('DELETE', `/v1/profiles/${p.id}`);
const profile = await api('POST', '/v1/profiles', {
  data: {
    type: 'profiles',
    attributes: { name: NAME, profileType: 'IOS_APP_STORE' },
    relationships: {
      bundleId: { data: { type: 'bundleIds', id: bundle.id } },
      certificates: { data: [{ type: 'certificates', id: cert.data.id }] },
    },
  },
});
fs.writeFileSync(`${OUT}/profile.mobileprovision`, Buffer.from(profile.data.attributes.profileContent, 'base64'));
console.log('Created provisioning profile', profile.data.id);

// 4. p12 for EAS
const password = crypto.randomBytes(18).toString('base64url');
const p12Args = ['pkcs12', '-export', '-inkey', `${OUT}/dist.key`, '-in', `${OUT}/dist.pem`, '-out', `${OUT}/dist.p12`, '-passout', `pass:${password}`];
try {
  run('openssl', [...p12Args.slice(0, 2), '-legacy', ...p12Args.slice(2)]);
} catch {
  run('openssl', p12Args);
}
fs.writeFileSync(
  'credentials.json',
  JSON.stringify(
    {
      ios: {
        provisioningProfilePath: `${OUT}/profile.mobileprovision`,
        distributionCertificate: { path: `${OUT}/dist.p12`, password },
      },
    },
    null,
    2
  )
);
console.log('Signing files ready');
