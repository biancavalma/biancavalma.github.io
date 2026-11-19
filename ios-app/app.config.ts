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
  backgroundColor: '#F3F0FF',
  scheme: 'overlap',
  ios: {
    bundleIdentifier: bundleId,
    supportsTablet: false,
    buildNumber: '1',
    infoPlist: {
      ITSAppUsesNonExemptEncryption: false,
      NSLocationWhenInUseUsageDescription: 'Overlap uses your location once, only when you tap "Use my location", to fill in your city.',
    },
  },
  android: {
    package: bundleId,
    adaptiveIcon: { foregroundImage: './assets/adaptive-icon.png', backgroundColor: '#F3F0FF' },
  },
  plugins: [
    ['expo-splash-screen', { image: './assets/splash-icon.png', imageWidth: 160, resizeMode: 'contain', backgroundColor: '#F3F0FF' }],
    ['expo-notifications', { color: '#B9AEFF' }],
  ],
  extra: {
    appUrl: appUrl || 'https://example.com',
    eas: projectId ? { projectId } : undefined,
  },
};

export default config;
