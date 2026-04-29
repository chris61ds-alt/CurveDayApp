import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { useOnboardingStore } from '../src/store/onboardingStore';
import { useIntakeStore } from '../src/store/intakeStore';
import { useThemeStore } from '../src/store/themeStore';
import { requestNotificationPermissions } from '../src/services/notifications';
import { router } from 'expo-router';

export default function RootLayout() {
  const { hydrate: hydrateOnboarding, done, hydrated: obHydrated } = useOnboardingStore();
  const { hydrate: hydrateIntakes } = useIntakeStore();
  const { hydrate: hydrateTheme, colors } = useThemeStore();

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

  useEffect(() => {
    requestNotificationPermissions();
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
