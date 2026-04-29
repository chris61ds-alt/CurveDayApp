import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import { requestNotificationPermissions } from '../src/services/notifications';

export default function RootLayout() {
  useEffect(() => {
    requestNotificationPermissions();
  }, []);

  return (
    <>
      <StatusBar style="light" backgroundColor="#060b13" />
      <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: '#060b13' } }}>
        <Stack.Screen name="(tabs)" />
      </Stack>
    </>
  );
}
