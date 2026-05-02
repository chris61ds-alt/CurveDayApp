import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useRef } from 'react';
import { Platform } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { useOnboardingStore } from '../src/store/onboardingStore';
import { useIntakeStore } from '../src/store/intakeStore';
import { useThemeStore } from '../src/store/themeStore';
import { requestNotificationPermissions } from '../src/services/notifications';
import { router } from 'expo-router';

export default function RootLayout() {
  const { hydrate: hydrateOnboarding, done, hydrated: obHydrated } = useOnboardingStore();
  const { hydrate: hydrateIntakes, setSelectedId } = useIntakeStore();
  const { hydrate: hydrateTheme, colors } = useThemeStore();
  const notifListenerRef = useRef<any>(null);
  const responseListenerRef = useRef<any>(null);

  useEffect(() => {
    (async () => {
      await Promise.all([hydrateOnboarding(), hydrateIntakes(), hydrateTheme()]);
    })();
  }, []);

  useEffect(() => {
    if (!obHydrated) return;
    if (!done) {
      router.replace('/onboarding');
    }
  }, [obHydrated, done]);

  // ── Notification setup ──────────────────────────────────────
  useEffect(() => {
    if (Platform.OS === 'web') return;
    requestNotificationPermissions();

    let cleanup: (() => void) | undefined;
    (async () => {
      try {
        const N = await import('expo-notifications');

        // Show notifications even when app is in foreground
        N.setNotificationHandler({
          handleNotification: async () => ({
            shouldShowAlert: true,
            shouldShowBanner: true,
            shouldShowList: true,
            shouldPlaySound: true,
            shouldSetBadge: false,
          }),
        });

        // Tapping a notification → navigate to home tab and select substance
        responseListenerRef.current = N.addNotificationResponseReceivedListener((response) => {
          const data = response.notification.request.content.data as any;
          if (data?.substanceId) {
            setSelectedId(data.substanceId);
            router.navigate('/(tabs)/');
          }
        });

        cleanup = () => {
          if (responseListenerRef.current) {
            N.removeNotificationSubscription(responseListenerRef.current);
          }
        };
      } catch {}
    })();

    return () => cleanup?.();
  }, []);

  return (
    <SafeAreaProvider>
      <StatusBar style={colors.statusBar} backgroundColor={colors.bg} />
      <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: colors.bg } }}>
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="onboarding" options={{ animation: 'fade' }} />
      </Stack>
    </SafeAreaProvider>
  );
}
