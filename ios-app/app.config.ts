// Overlap iPhone app settings.
// The three values to fill in live in overlap.json: the web app's address, the Expo project id and the app id.
import type { ExpoConfig } from 'expo/config';
import settings from './overlap.json';

const appUrl = process.env.APP_URL || settings.appUrl;
const projectId = process.env.EAS_PROJECT_ID || settings.projectId;
const bundleId = process.env.BUNDLE_ID || settings.bundleId;
if (!appUrl && process.env.EAS_BUILD) throw new Error('Put your Overlap web address in ios-app/overlap.json (appUrl) before building.');

const config: ExpoConfig = {
  name: 'Overlap',
  slug: 'overlap',
  owner: process.env.EXPO_OWNER || settings.owner || undefined,
  version: '1.0.0',
  orientation: 'portrait',
  icon: './assets/icon.png',
  userInterfaceStyle: 'light',
  backgroundColor: '#f5f0ff',
  scheme: 'overlap',
  ios: {
    bundleIdentifier: bundleId,
    supportsTablet: false,
    buildNumber: '1',
    infoPlist: {
      ITSAppUsesNonExemptEncryption: false,
    },
  },
  android: {
    package: bundleId,
    adaptiveIcon: { foregroundImage: './assets/adaptive-icon.png', backgroundColor: '#f5f0ff' },
  },
  plugins: [
    ['expo-splash-screen', { image: './assets/splash-icon.png', imageWidth: 160, resizeMode: 'contain', backgroundColor: '#f5f0ff' }],
    ['expo-notifications', { color: '#ff9cc8' }],
  ],
  extra: {
    appUrl: appUrl || 'https://example.com',
    eas: projectId ? { projectId } : undefined,
  },
};

export default config;
