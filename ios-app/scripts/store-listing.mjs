// Fills the App Store page for Overlap (texts, screenshots, category, age rating, price, build, review info)
// and, with SUBMIT=1, sends it to Apple for review. Safe to run again: it updates what is there.
import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';

const APP = '6836661604';
const VERSION = '1.0.0';
const SUBMIT = process.env.SUBMIT === '1';
const key = fs.readFileSync(process.env.EXPO_ASC_API_KEY_PATH, 'utf8');
const b64 = (o) => Buffer.from(typeof o === 'string' ? o : JSON.stringify(o)).toString('base64url');
function token() {
  const now = Math.floor(Date.now() / 1000);
  const h = b64({ alg: 'ES256', kid: process.env.EXPO_ASC_KEY_ID, typ: 'JWT' });
  const p = b64({ iss: process.env.EXPO_ASC_ISSUER_ID, iat: now, exp: now + 1100, aud: 'appstoreconnect-v1' });
  return h + '.' + p + '.' + crypto.sign('sha256', Buffer.from(h + '.' + p), { key, dsaEncoding: 'ieee-p1363' }).toString('base64url');
}
async function api(method, url, data) {
  const r = await fetch(url.startsWith('http') ? url : 'https://api.appstoreconnect.apple.com' + url, {
    method, headers: { Authorization: 'Bearer ' + token(), 'Content-Type': 'application/json' }, body: data ? JSON.stringify(data) : undefined });
  const t = await r.text(); let j = null; try { j = t ? JSON.parse(t) : null; } catch {}
  return { ok: r.ok, status: r.status, json: j, err: r.ok ? '' : (j && j.errors ? j.errors.map((e) => e.detail || e.title).join(' | ') : t).slice(0, 400) };
}
const say = (step, r) => console.log((r.ok ? 'OK   ' : 'FAIL ') + step + (r.ok ? '' : ' -> ' + r.status + ' ' + r.err));
let problems = 0; const must = (step, r) => { say(step, r); if (!r.ok) problems++; return r; };

const TEXT = {
  subtitle: 'See when friends are nearby',
  promo: 'Share where you will be. Find out when friends are in the same city, and meet up.',
  keywords: 'friends,travel,calendar,trips,meet,city,plans,share,nearby,meetup,abroad,visit,itinerary,where',
  description: `Overlap shows you when your friends are in the same city as you.

Add the city you live in and the trips you plan. Your friends do the same. When two of you will be in the same place on the same days, or close by, Overlap tells you, so you can send a message and meet.

• One calendar for you and your friends, month after month
• Yellow days show when you and a friend overlap
• Tap a day to see where everyone is
• "Let's meet?" sends a friend a day and a place to say yes to
• Trips for all friends, close friends only, or just you
• Add trips in seconds, or from your iPhone calendar
• Share your plans as text in any chat
• An alert when a friend will be in your city

Only friends you accept see your plans. You can block or report anyone, and delete your account at any time from Settings.`,
  whatsNew: 'First version of Overlap.',
  support: 'https://biancavalma.github.io/support.html',
  marketing: 'https://biancavalma.github.io/',
  privacy: 'https://biancavalma.github.io/privacy.html',
  copyright: '2026 Bianca Valmarana',
};

// version
let v = await api('GET', `/v1/apps/${APP}/appStoreVersions?filter[platform]=IOS&limit=10`);
let ver = v.json && v.json.data.find((x) => ['PREPARE_FOR_SUBMISSION', 'DEVELOPER_REJECTED', 'REJECTED', 'METADATA_REJECTED', 'INVALID_BINARY', 'WAITING_FOR_REVIEW', 'IN_REVIEW'].includes(x.attributes.appStoreState || x.attributes.appVersionState));
if (!ver) { const c = must('create version ' + VERSION, await api('POST', '/v1/appStoreVersions', { data: { type: 'appStoreVersions', attributes: { platform: 'IOS', versionString: VERSION }, relationships: { app: { data: { type: 'apps', id: APP } } } } })); ver = c.json && c.json.data; }
if (!ver) process.exit(1);
console.log('Version', ver.attributes.versionString, ver.attributes.appStoreState || ver.attributes.appVersionState);
must('copyright and release', await api('PATCH', `/v1/appStoreVersions/${ver.id}`, { data: { type: 'appStoreVersions', id: ver.id, attributes: { copyright: TEXT.copyright, releaseType: 'AFTER_APPROVAL' } } }));

// texts on the version
const locs = await api('GET', `/v1/appStoreVersions/${ver.id}/appStoreVersionLocalizations`);
let loc = locs.json && locs.json.data.find((x) => x.attributes.locale === 'en-US') || (locs.json && locs.json.data[0]);
const la = { description: TEXT.description, keywords: TEXT.keywords, promotionalText: TEXT.promo, supportUrl: TEXT.support, marketingUrl: TEXT.marketing };
if (loc) must('texts (' + loc.attributes.locale + ')', await api('PATCH', `/v1/appStoreVersionLocalizations/${loc.id}`, { data: { type: 'appStoreVersionLocalizations', id: loc.id, attributes: la } }));
else { const c = must('texts (new en-US)', await api('POST', '/v1/appStoreVersionLocalizations', { data: { type: 'appStoreVersionLocalizations', attributes: { locale: 'en-US', ...la }, relationships: { appStoreVersion: { data: { type: 'appStoreVersions', id: ver.id } } } } })); loc = c.json && c.json.data; }

// app info: subtitle, privacy link, categories, age rating
const infos = await api('GET', `/v1/apps/${APP}/appInfos`);
const info = infos.json && infos.json.data.find((x) => !['READY_FOR_SALE', 'REPLACED_WITH_NEW_INFO'].includes(x.attributes.appStoreState || x.attributes.state)) || (infos.json && infos.json.data[0]);
if (info) {
  const il = await api('GET', `/v1/appInfos/${info.id}/appInfoLocalizations`);
  const ilo = il.json && (il.json.data.find((x) => x.attributes.locale === 'en-US') || il.json.data[0]);
  if (ilo) must('subtitle and privacy link', await api('PATCH', `/v1/appInfoLocalizations/${ilo.id}`, { data: { type: 'appInfoLocalizations', id: ilo.id, attributes: { subtitle: TEXT.subtitle, privacyPolicyUrl: TEXT.privacy } } }));
  must('category Travel + Social Networking', await api('PATCH', `/v1/appInfos/${info.id}`, { data: { type: 'appInfos', id: info.id, relationships: { primaryCategory: { data: { type: 'appCategories', id: 'TRAVEL' } }, secondaryCategory: { data: { type: 'appCategories', id: 'SOCIAL_NETWORKING' } } } } }));
  const ar = await api('GET', `/v1/appInfos/${info.id}/ageRatingDeclaration`);
  if (ar.ok) {
    // all answers go together: nothing violent, adult or gambling; friends can see each other's photos and notes
    const id = ar.json.data.id;
    const at = {};
    for (const k of ['alcoholTobaccoOrDrugUseOrReferences','contests','gamblingSimulated','gunsOrOtherWeapons','horrorOrFearThemes','matureOrSuggestiveThemes','medicalOrTreatmentInformation','profanityOrCrudeHumor','sexualContentGraphicAndNudity','sexualContentOrNudity','violenceCartoonOrFantasy','violenceRealistic','violenceRealisticProlongedGraphicOrSadistic']) at[k] = 'NONE';
    for (const k of ['gambling','unrestrictedWebAccess','lootBox','advertising','parentalControls','ageAssurance','healthOrWellnessTopics','socialMedia']) at[k] = false;
    /* Bianca's answers in App Store Connect: user content yes, messages yes (meet-up notes and invites), shared location yes (which city you will be in), no public feed */
    const YES = ['userGeneratedContent', 'messagingAndChat', 'sharedLocation', 'locationSharing'];
    for (const k of YES) at[k] = true;
    let r;
    for (let i = 0; i < 6; i++) {
      r = await api('PATCH', `/v1/ageRatingDeclarations/${id}`, { data: { type: 'ageRatingDeclarations', id, attributes: at } });
      if (r.ok) break;
      let fixed = false;
      for (const m of r.err.matchAll(/attribute '(\w+)'\. Expected a (BOOLEAN|STRING)/g)) { at[m[1]] = m[2] === 'BOOLEAN' ? (YES.includes(m[1]) || /location/i.test(m[1])) : 'NONE'; fixed = true; }
      for (const m of r.err.matchAll(/value for the attribute '(\w+)'/g)) { if (!(m[1] in at)) { at[m[1]] = 'NONE'; fixed = true; } }
      for (const m of r.err.matchAll(/'(\w+)' is not a valid|attribute '(\w+)' is not|'(\w+)' is not an attribute/g)) { delete at[m[1] || m[2] || m[3]]; fixed = true; }
      if (!fixed) break;
    }
    must('age rating', r);
    const now = await api('GET', `/v1/appInfos/${info.id}/ageRatingDeclaration`);
    console.log('     sent: ' + Object.keys(at).filter((k) => at[k] === true).join(', ') + ' | all keys: ' + (now.ok ? Object.keys(now.json.data.attributes).join(',') : now.status));
    if (now.ok) console.log('     answers: ' + Object.entries(now.json.data.attributes).filter(([, v]) => v === true || (typeof v === 'string' && v !== 'NONE')).map(([k, v]) => k + '=' + v).join(', '));
  } else say('age rating read', ar);
}

// price: free
const ps = await api('GET', `/v1/apps/${APP}/appPriceSchedule`);
if (!ps.ok || !ps.json || !ps.json.data) {
  const pts = await api('GET', `/v1/apps/${APP}/appPricePoints?filter[territory]=USA&limit=200`);
  const free = pts.json && pts.json.data.find((x) => Number(x.attributes.customerPrice) === 0);
  if (free) must('price free', await api('POST', '/v1/appPriceSchedules', { data: { type: 'appPriceSchedules', relationships: { app: { data: { type: 'apps', id: APP } }, baseTerritory: { data: { type: 'territories', id: 'USA' } }, manualPrices: { data: [{ type: 'appPrices', id: '${p1}' }] } } }, included: [{ type: 'appPrices', id: '${p1}', attributes: { startDate: null }, relationships: { appPricePoint: { data: { type: 'appPricePoints', id: free.id } } } }] }));
  else say('price points', pts);
} else console.log('OK   price already set');

// availability: all countries
const av = await api('GET', `/v1/apps/${APP}/appAvailabilityV2`);
if (!av.ok || !av.json || !av.json.data) {
  const terr = await api('GET', '/v1/territories?limit=200');
  if (terr.ok) {
    const inc = terr.json.data.map((t, i) => ({ type: 'territoryAvailabilities', id: '${t' + i + '}', attributes: { available: true }, relationships: { territory: { data: { type: 'territories', id: t.id } } } }));
    must('available in all countries', await api('POST', '/v2/appAvailabilities', { data: { type: 'appAvailabilities', attributes: { availableInNewTerritories: true }, relationships: { app: { data: { type: 'apps', id: APP } }, territoryAvailabilities: { data: inc.map((x) => ({ type: x.type, id: x.id })) } } }, included: inc }));
  } else say('territories', terr);
} else console.log('OK   countries already set');

// not in China mainland: it needs government permits (ICP licence, security assessment)
{
  const cur = await api('GET', `/v1/apps/${APP}/appAvailabilityV2`);
  const aid = cur.json && cur.json.data && cur.json.data.id;
  if (aid) {
    let url = `/v2/appAvailabilities/${aid}/territoryAvailabilities?include=territory&limit=200`, done = false;
    while (url && !done) {
      const ta = await api('GET', url);
      if (!ta.ok) { say('china check', ta); break; }
      const row = (ta.json.data || []).find((x) => x.relationships && x.relationships.territory && x.relationships.territory.data && x.relationships.territory.data.id === 'CHN');
      if (row) {
        done = true;
        if (row.attributes.available) must('removed China mainland', await api('PATCH', `/v1/territoryAvailabilities/${row.id}`, { data: { type: 'territoryAvailabilities', id: row.id, attributes: { available: false } } }));
        else console.log('OK   China mainland already off');
      }
      url = ta.json.links && ta.json.links.next ? ta.json.links.next.replace('https://api.appstoreconnect.apple.com', '') : null;
    }
  }
}

// screenshots (6.7-inch iPhone)
if (loc) {
  const sets = await api('GET', `/v1/appStoreVersionLocalizations/${loc.id}/appScreenshotSets`);
  let set = sets.json && sets.json.data.find((x) => x.attributes.screenshotDisplayType === 'APP_IPHONE_67');
  if (!set) { const c = must('screenshot set', await api('POST', '/v1/appScreenshotSets', { data: { type: 'appScreenshotSets', attributes: { screenshotDisplayType: 'APP_IPHONE_67' }, relationships: { appStoreVersionLocalization: { data: { type: 'appStoreVersionLocalizations', id: loc.id } } } } })); set = c.json && c.json.data; }
  if (set) {
    const old = await api('GET', `/v1/appScreenshotSets/${set.id}/appScreenshots`);
    for (const s of (old.json && old.json.data) || []) await api('DELETE', `/v1/appScreenshots/${s.id}`);
    for (const n of [1, 2, 3, 4]) {
      const file = path.join('store', `appstore-${n}.png`); const buf = fs.readFileSync(file);
      const res = await api('POST', '/v1/appScreenshots', { data: { type: 'appScreenshots', attributes: { fileName: `overlap-${n}.png`, fileSize: buf.length }, relationships: { appScreenshotSet: { data: { type: 'appScreenshotSets', id: set.id } } } } });
      if (!res.ok) { must('screenshot ' + n, res); continue; }
      const id = res.json.data.id;
      for (const op of res.json.data.attributes.uploadOperations) {
        const h = {}; for (const x of op.requestHeaders || []) h[x.name] = x.value;
        const put = await fetch(op.url, { method: op.method, headers: h, body: buf.subarray(op.offset, op.offset + op.length) });
        if (!put.ok) console.log('   upload part', put.status);
      }
      must('screenshot ' + n, await api('PATCH', `/v1/appScreenshots/${id}`, { data: { type: 'appScreenshots', id, attributes: { uploaded: true, sourceFileChecksum: crypto.createHash('md5').update(buf).digest('hex') } } }));
    }
  }
}

// newest finished build
const bl = await api('GET', `/v1/builds?filter[app]=${APP}&filter[processingState]=VALID&sort=-uploadedDate&limit=1`);
const build = bl.json && bl.json.data[0];
if (build) must('build ' + build.attributes.version, await api('PATCH', `/v1/appStoreVersions/${ver.id}/relationships/build`, { data: { type: 'builds', id: build.id } }));

// information for Apple's reviewer (the demo password is typed in App Store Connect by Bianca)
const rd = await api('GET', `/v1/appStoreVersions/${ver.id}/appStoreReviewDetail`);
const ra = { contactFirstName: 'Bianca', contactLastName: 'Valmarana', contactEmail: 'hello.overlap.app@gmail.com', contactPhone: '+39 347 528 6289', demoAccountRequired: true, demoAccountName: 'review.overlap@example.com',
  notes: 'Type the demo email on the sign-in screen and tap "Send me a code": for this account a password field appears instead of an email code. The demo account has one friend (Sam) and trips that overlap in Paris. Overlap uses push notifications, the iPhone calendar (only when you tap "From my calendar"), the camera or photos (only to choose a profile photo) and the share sheet. Users can block and report others from a friend\'s page, and delete their account in Settings.' };
if (rd.ok && rd.json && rd.json.data) must('review information', await api('PATCH', `/v1/appStoreReviewDetails/${rd.json.data.id}`, { data: { type: 'appStoreReviewDetails', id: rd.json.data.id, attributes: ra } }));
else must('review information', await api('POST', '/v1/appStoreReviewDetails', { data: { type: 'appStoreReviewDetails', attributes: ra, relationships: { appStoreVersion: { data: { type: 'appStoreVersions', id: ver.id } } } } }));

// is the demo password typed in? (only says yes or no, never prints it)
{
  const r2 = await api('GET', `/v1/appStoreVersions/${ver.id}/appStoreReviewDetail`);
  const pw = r2.json && r2.json.data && r2.json.data.attributes && r2.json.data.attributes.demoAccountPassword;
  if (pw) console.log('OK   demo password is filled in'); else { console.log('MISSING demo password: type it in App Review Information'); problems++; }
}
console.log(problems ? `\n${problems} step(s) need a look.` : '\nAll set.');

if (SUBMIT) {
  if (problems) { console.log('Not sending to Apple: fix the steps above first.'); process.exit(1); }
  const sub = must('review submission', await api('POST', '/v1/reviewSubmissions', { data: { type: 'reviewSubmissions', attributes: { platform: 'IOS' }, relationships: { app: { data: { type: 'apps', id: APP } } } } }));
  if (sub.ok) {
    const sid = sub.json.data.id;
    must('add version', await api('POST', '/v1/reviewSubmissionItems', { data: { type: 'reviewSubmissionItems', relationships: { reviewSubmission: { data: { type: 'reviewSubmissions', id: sid } }, appStoreVersion: { data: { type: 'appStoreVersions', id: ver.id } } } } }));
    must('SENT TO APPLE', await api('PATCH', `/v1/reviewSubmissions/${sid}`, { data: { type: 'reviewSubmissions', id: sid, attributes: { submitted: true } } }));
  }
}
