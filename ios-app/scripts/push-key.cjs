// Sends the Apple notifications key (/tmp/key.p8) to Expo and links it to the app, using eas-cli's own helpers.
const path = require('path');
const fs = require('fs');
const base = '/tmp/e/node_modules/eas-cli/build/';
const { createGraphqlClient } = require(base + 'commandUtils/context/contextUtils/createGraphqlClient');
const G = require(base + 'credentials/ios/api/GraphqlClient');
const { AppQuery } = require(base + 'graphql/queries/AppQuery');
const cfg = require(path.join(__dirname, '..', 'overlap.json'));
const KEY_ID = 'P86C97B85Q', TEAM = '93VV2F4VS5', TEAM_NAME = 'Bianca Valmarana';
(async () => {
  const gc = createGraphqlClient({ accessToken: process.env.EXPO_TOKEN, sessionSecret: null });
  const app = await AppQuery.byIdAsync(gc, cfg.projectId);
  const account = app.ownerAccount;
  const lookup = { account, projectName: app.slug, bundleIdentifier: cfg.bundleId };
  const existing = (await G.getPushKeysForAccountAsync(gc, account)).find((k) => k.keyIdentifier === KEY_ID);
  const pushKey = existing || (await G.createPushKeyAsync(gc, account, { apnsKeyP8: fs.readFileSync('/tmp/key.p8', 'utf8'), apnsKeyId: KEY_ID, teamId: TEAM, teamName: TEAM_NAME }));
  console.log(existing ? 'Push key already in Expo' : 'Push key added to Expo', pushKey.id);
  const team = await G.createOrGetExistingAppleTeamAndUpdateNameIfChangedAsync(gc, account.id, { appleTeamIdentifier: TEAM, appleTeamName: TEAM_NAME });
  const creds = await G.createOrGetIosAppCredentialsWithCommonFieldsAsync(gc, lookup, { appleTeam: team });
  await G.updateIosAppCredentialsAsync(gc, creds, { applePushKeyId: pushKey.id });
  console.log('Push key linked to', cfg.bundleId);
})().catch((e) => { console.error(e); process.exit(1); });
