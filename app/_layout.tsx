import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import { useOnboardingStore } from '../src/store/onboardingStore';
import { useIntakeStore } from '../src/store/intakeStore';
import { requestNotificationPermissions } from '../src/services/notifications';
import { router } from 'expo-router';

export default function RootLayout() {
  const { hydrate: hydrateOnboarding, done, hydrated: obHydrated } = useOnboardingStore();
  const { hydrate: hydrateIntakes } = useIntakeStore();

  useEffect(() => {
    (async () => {
      await Promise.all([hydrateOnboarding(), hydrateIntakes()]);
    })();
  }, []);

  useEffect(() => {
    if (!obHydrated) return;
    if (!done) {
      router.replace('/onboarding');
    }
  }, [obHydrated, done]);

  useEffect(() => {
    requestNotificationPermissions();
  }, []);

  return (
    <>
      <StatusBar style="light" backgroundColor="#060b13" />
      <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: '#060b13' } }}>
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="onboarding" options={{ animation: 'fade' }} />
      </Stack>
    </>
  );
}
