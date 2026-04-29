import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import { Platform } from 'react-native';

// Handler: zeige Notifications auch wenn App offen ist
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

export async function requestNotificationPermissions(): Promise<boolean> {
  if (!Device.isDevice) return false; // Kein Emulator-Support für Push

  const { status: existing } = await Notifications.getPermissionsAsync();
  if (existing === 'granted') return true;

  const { status } = await Notifications.requestPermissionsAsync();
  if (status !== 'granted') return false;

  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('medication-reminders', {
      name: 'Einnahme-Erinnerungen',
      importance: Notifications.AndroidImportance.MAX,
      sound: 'default',
      vibrationPattern: [0, 250, 250, 250],
    });
  }

  return true;
}

export async function scheduleDailyReminder(
  substanceId: string,
  name: string,
  hour: number,
  minute: number,
): Promise<string> {
  const id = await Notifications.scheduleNotificationAsync({
    content: {
      title: '💊 Einnahme-Erinnerung',
      body: `Zeit für ${name}`,
      data: { substanceId },
      sound: 'default',
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.DAILY,
      hour,
      minute,
    },
  });
  return id;
}

export async function schedulePeakAlert(
  substanceId: string,
  name: string,
  peakInMs: number,   // ms ab jetzt bis zum Peak
): Promise<string> {
  const id = await Notifications.scheduleNotificationAsync({
    content: {
      title: '📈 Peak in 15 Minuten',
      body: `${name} erreicht gleich maximale Wirkung`,
      data: { substanceId },
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
      seconds: Math.max(1, Math.floor((peakInMs - 15 * 60 * 1000) / 1000)),
    },
  });
  return id;
}

export async function cancelAllReminders(): Promise<void> {
  await Notifications.cancelAllScheduledNotificationsAsync();
}
