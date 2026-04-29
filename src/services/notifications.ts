import { Platform } from 'react-native';

const isWeb = Platform.OS === 'web';

export async function requestNotificationPermissions(): Promise<boolean> {
  if (isWeb) return false;
  try {
    const Device = await import('expo-device');
    if (!Device.isDevice) return false;
    const Notifications = await import('expo-notifications');
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
  } catch { return false; }
}

export async function scheduleDailyReminder(
  substanceId: string, name: string, hour: number, minute: number,
): Promise<string> {
  if (isWeb) return '';
  try {
    const Notifications = await import('expo-notifications');
    return await Notifications.scheduleNotificationAsync({
      content: { title: '💊 Einnahme-Erinnerung', body: `Zeit für ${name}`, data: { substanceId }, sound: 'default' },
      trigger: { type: Notifications.SchedulableTriggerInputTypes.DAILY, hour, minute },
    });
  } catch { return ''; }
}

export async function schedulePeakAlert(
  substanceId: string, name: string, peakInMs: number,
): Promise<string> {
  if (isWeb) return '';
  try {
    const Notifications = await import('expo-notifications');
    return await Notifications.scheduleNotificationAsync({
      content: { title: '📈 Peak in 15 Minuten', body: `${name} erreicht gleich maximale Wirkung`, data: { substanceId } },
      trigger: { type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL, seconds: Math.max(1, Math.floor((peakInMs - 15 * 60 * 1000) / 1000)) },
    });
  } catch { return ''; }
}

export async function cancelAllReminders(): Promise<void> {
  if (isWeb) return;
  try {
    const Notifications = await import('expo-notifications');
    await Notifications.cancelAllScheduledNotificationsAsync();
  } catch {}
}
