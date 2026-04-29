import { Platform } from 'react-native';

// Web: Notifications nicht unterstützt — alle Funktionen sind No-Ops
const isWeb = Platform.OS === 'web';

let Notifications: any = null;
let Device: any = null;

if (!isWeb) {
  Notifications = require('expo-notifications');
  Device = require('expo-device');

  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowAlert: true,
      shouldPlaySound: true,
      shouldSetBadge: false,
      shouldShowBanner: true,
      shouldShowList: true,
    }),
  });
}

export async function requestNotificationPermissions(): Promise<boolean> {
  if (isWeb || !Device?.isDevice) return false;

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
  if (isWeb) return '';
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
  peakInMs: number,
): Promise<string> {
  if (isWeb) return '';
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
  if (isWeb) return;
  await Notifications.cancelAllScheduledNotificationsAsync();
}
