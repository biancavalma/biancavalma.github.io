// Overlap for iPhone: the live Overlap web app inside a native shell,
// with Apple notifications and notification taps that open the right day.
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Linking, Platform, Pressable, Share, StyleSheet, Text, View } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { WebView as RNWebView, type WebViewMessageEvent } from 'react-native-webview';
import type { ShouldStartLoadRequest } from 'react-native-webview/lib/WebViewTypes';
import * as Notifications from 'expo-notifications';
import * as Calendar from 'expo-calendar';
import * as Device from 'expo-device';
import Constants from 'expo-constants';

const APP_URL: string = (Constants.expoConfig?.extra?.appUrl as string) || 'https://example.com';
const ORIGIN = new URL(APP_URL).origin;
// the library's combined iOS/Android/Windows prop types cancel out under React 19's types; the props below are all iOS ones it supports
type WebViewHandle = { injectJavaScript: (js: string) => void; reload: () => void };
const WebView = RNWebView as unknown as React.ComponentType<Record<string, unknown> & { ref?: React.Ref<WebViewHandle> }>;
const BG = '#FFF6F9';
const INK = '#2A1420';
const PINK = '#FF8FB8';

// show alerts even while the app is open
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

// tells the page it runs inside the iPhone app, before any of its code runs
const BRIDGE = `
  window.OverlapNative = { platform: ${JSON.stringify(Platform.OS)}, calendar: true, share: true };
  true;
`;

type Msg = { type: 'push-state' | 'push-request' | 'open-external' | 'calendar-events' | 'share'; url?: string; text?: string; id?: number };

// Next 6 months of events from the phone's calendars, read only when the person taps "From my calendar".
async function calendarEvents() {
  let p;
  try {
    p = await Calendar.requestCalendarPermissionsAsync();
  } catch {
    p = await Calendar.getCalendarPermissionsAsync();
  }
  if (p.status !== 'granted') return { state: 'denied' };
  const cals = await Calendar.getCalendarsAsync(Calendar.EntityTypes.EVENT);
  const start = new Date();
  const end = new Date(start.getTime() + 183 * 864e5);
  // one calendar at a time, so a calendar the phone cannot read (birthdays, a broken subscription) does not stop the rest
  let ev: Calendar.Event[] = [];
  for (const c of cals) {
    try {
      ev = ev.concat(await Calendar.getEventsAsync([c.id], start, end));
    } catch {}
    if (ev.length > 600) break;
  }
  ev.sort((a, b) => +new Date(a.startDate) - +new Date(b.startDate));
  const events = ev.slice(0, 400).map((e) => ({
    title: (e.title || '').slice(0, 120),
    location: (e.location || '').slice(0, 160),
    start: new Date(e.startDate).toISOString(),
    end: new Date(e.endDate).toISOString(),
    allDay: !!e.allDay,
  }));
  return { state: 'granted', events };
}

async function permission(): Promise<'granted' | 'denied' | 'default'> {
  const p = await Notifications.getPermissionsAsync();
  if (p.granted) return 'granted';
  return p.canAskAgain ? 'default' : 'denied';
}

async function pushToken(ask: boolean): Promise<{ state: string; token?: string }> {
  if (!Device.isDevice) return { state: 'unsupported' };
  let state = await permission();
  if (state === 'default' && ask) {
    const r = await Notifications.requestPermissionsAsync({
      ios: { allowAlert: true, allowSound: true, allowBadge: false },
    });
    state = r.granted ? 'granted' : 'denied';
  }
  if (state !== 'granted') return { state };
  const projectId = Constants.expoConfig?.extra?.eas?.projectId;
  const t = await Notifications.getExpoPushTokenAsync(projectId ? { projectId } : undefined);
  return { state, token: t.data };
}

export default function App() {
  const web = useRef<WebViewHandle>(null);
  const [uri, setUri] = useState(APP_URL);
  const [failed, setFailed] = useState(false);
  const [key, setKey] = useState(0);
  const last = Notifications.useLastNotificationResponse();
  const handled = useRef<string | null>(null);

  const reply = useCallback((id: number | undefined, data: object) => {
    const js = `window.__ovNative && window.__ovNative(${JSON.stringify(id ?? 0)}, ${JSON.stringify(data)}); true;`;
    web.current?.injectJavaScript(js);
  }, []);

  // open the page an alert points to, like a day where you overlap
  useEffect(() => {
    if (!last) return;
    const id = last.notification.request.identifier;
    if (handled.current === id) return;
    handled.current = id;
    const path = String(last.notification.request.content.data?.url || '/');
    const target = new URL(path, APP_URL).href;
    if (new URL(target).origin !== ORIGIN) return;
    setUri(target);
    web.current?.injectJavaScript(`location.href = ${JSON.stringify(target)}; true;`);
  }, [last]);

  const onMessage = useCallback(
    async (e: WebViewMessageEvent) => {
      let m: Msg;
      try {
        m = JSON.parse(e.nativeEvent.data);
      } catch {
        return;
      }
      if (m.type === 'open-external' && m.url && /^(https?|mailto|tel|sms):/i.test(m.url)) {
        Linking.openURL(m.url).catch(() => {});
        return;
      }
      if (m.type === 'share' && m.text) {
        Share.share({ message: String(m.text).slice(0, 4000) }).catch(() => {});
        return;
      }
      if (m.type === 'calendar-events') {
        try {
          reply(m.id, await calendarEvents());
        } catch {
          reply(m.id, { state: 'error' });
        }
        return;
      }
      if (m.type === 'push-state' || m.type === 'push-request') {
        try {
          reply(m.id, await pushToken(m.type === 'push-request'));
        } catch {
          reply(m.id, { state: 'error' });
        }
      }
    },
    [reply]
  );

  // Overlap pages stay inside the app; anything else opens in Safari
  const onNav = useCallback((r: ShouldStartLoadRequest) => {
    if (r.url.startsWith(ORIGIN) || r.url.startsWith('about:') || r.url.startsWith('blob:') || r.url.startsWith('data:')) return true;
    if (r.isTopFrame === false) return true;
    Linking.openURL(r.url).catch(() => {});
    return false;
  }, []);

  if (failed) {
    return (
      <View style={s.center}>
        <StatusBar style="dark" />
        <Text style={s.title}>No connection</Text>
        <Text style={s.hint}>Overlap needs the internet to show your friends' plans.</Text>
        <Pressable
          style={s.btn}
          onPress={() => {
            setFailed(false);
            setKey((k) => k + 1);
          }}
        >
          <Text style={s.btnText}>Try again</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <View style={[s.root, { paddingTop: Platform.OS === 'ios' ? Constants.statusBarHeight : 0 }]}>
      <StatusBar style="dark" />
      <WebView
        key={key}
        ref={web}
        source={{ uri }}
        style={s.root}
        originWhitelist={['*']}
        injectedJavaScriptBeforeContentLoaded={BRIDGE}
        onMessage={onMessage}
        onShouldStartLoadWithRequest={onNav}
        onError={() => setFailed(true)}
        onContentProcessDidTerminate={() => web.current?.reload()}
        startInLoadingState
        renderLoading={() => (
          <View style={[s.center, StyleSheet.absoluteFill]}>
            <ActivityIndicator color={PINK} size="large" />
          </View>
        )}
        contentInsetAdjustmentBehavior="never"
        automaticallyAdjustContentInsets={false}
        bounces={false}
        overScrollMode="never"
        allowsBackForwardNavigationGestures={false}
        allowsInlineMediaPlayback
        sharedCookiesEnabled
        domStorageEnabled
        hideKeyboardAccessoryView
        keyboardDisplayRequiresUserAction={false}
        setSupportMultipleWindows={false}
        decelerationRate="normal"
      />
    </View>
  );
}

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: BG },
  center: { flex: 1, backgroundColor: BG, alignItems: 'center', justifyContent: 'center', padding: 24, gap: 10 },
  title: { fontSize: 22, fontWeight: '700', color: INK },
  hint: { fontSize: 15, color: '#665b7d', textAlign: 'center' },
  btn: { marginTop: 8, backgroundColor: PINK, borderRadius: 999, paddingVertical: 14, paddingHorizontal: 28 },
  btnText: { fontSize: 17, fontWeight: '700', color: INK },
});
