import { Platform } from 'react-native';

const isWeb = Platform.OS === 'web';

// ─────────────────────────────────────────────────────────────
// PERMISSIONS + CHANNEL SETUP
// ─────────────────────────────────────────────────────────────
export async function requestNotificationPermissions(): Promise<boolean> {
  if (isWeb) return false;
  try {
    const Device = await import('expo-device');
    if (!Device.isDevice) return false;
    const N = await import('expo-notifications');
    const { status: existing } = await N.getPermissionsAsync();
    if (existing === 'granted') return true;
    const { status } = await N.requestPermissionsAsync();
    if (status !== 'granted') return false;
    if (Platform.OS === 'android') {
      await N.setNotificationChannelAsync('curveday-pk', {
        name: 'Wirkungskurven',
        description: 'Onset, Peak und Wear-off deiner Einnahmen',
        importance: N.AndroidImportance.HIGH,
        sound: 'default',
        vibrationPattern: [0, 200, 100, 200],
      });
      await N.setNotificationChannelAsync('curveday-warn', {
        name: 'Wechselwirkungen',
        description: 'Kritische Kombinationshinweise',
        importance: N.AndroidImportance.MAX,
        sound: 'default',
        vibrationPattern: [0, 400, 100, 400],
      });
    }
    return true;
  } catch { return false; }
}

// ─────────────────────────────────────────────────────────────
// SMART PK NOTIFICATIONS – schedule on intake creation
// ─────────────────────────────────────────────────────────────
/**
 * Schedules up to 4 local notifications for a single intake:
 *   1. Onset   – substance starts working
 *   2. Peak    – maximum effect reached  🎯
 *   3. Wearoff – effect noticeably declining (65 % of duration)
 *   4. Sleep   – warning 30 min before sleepStart if still active
 *
 * Returns array of notification IDs stored on the Intake object
 * so they can be precisely cancelled when the intake is deleted.
 */
export async function scheduleIntakeNotifications(
  intakeId: string,
  substanceId: string,
  takenAtISO: string,
  substance: {
    name: string;
    icon?: string;
    pk: {
      onsetHours: number;
      tmaxHours: number;
      durationHours: number;
      halflifeHours: number;
    };
  },
  sleepStartHour?: number, // decimal hour e.g. 23.5 = 23:30
): Promise<string[]> {
  if (isWeb) return [];

  const ids: string[] = [];
  const takenMs = new Date(takenAtISO).getTime();
  const nowMs   = Date.now();
  const pk      = substance.pk;
  const icon    = substance.icon ?? '💊';
  const name    = substance.name;

  const FUTURE_BUFFER_MS = 45_000; // ignore notifications <45 s away

  try {
    const N = await import('expo-notifications');
    const { status } = await N.getPermissionsAsync();
    if (status !== 'granted') return [];

    const schedule = async (
      title: string,
      body: string,
      triggerMs: number,
      channel: 'curveday-pk' | 'curveday-warn',
    ) => {
      if (triggerMs <= nowMs + FUTURE_BUFFER_MS) return;
      try {
        const id = await N.scheduleNotificationAsync({
          content: {
            title,
            body,
            data: { intakeId, substanceId },
            sound: 'default',
            ...(Platform.OS === 'android' ? { channelId: channel } : {}),
          },
          trigger: {
            type: N.SchedulableTriggerInputTypes.DATE,
            date: new Date(triggerMs),
          },
        });
        ids.push(id);
      } catch {}
    };

    // ── 1. Onset ─────────────────────────────────────────────
    // Only fire if onset > 5 min (skip fast-acting substances)
    const onsetMs = takenMs + pk.onsetHours * 3_600_000;
    if (pk.onsetHours >= 0.083) {
      const mins = Math.round(pk.onsetHours * 60);
      await schedule(
        `${icon} ${name} – Wirkung beginnt`,
        `${name} beginnt jetzt nach ${mins} Min. zu wirken`,
        onsetMs,
        'curveday-pk',
      );
    }

    // ── 2. Peak ──────────────────────────────────────────────
    const peakMs = takenMs + pk.tmaxHours * 3_600_000;
    await schedule(
      `${icon} ${name} – Wirkpeak 🎯`,
      `${name} hat jetzt seine maximale Wirkstärke erreicht`,
      peakMs,
      'curveday-pk',
    );

    // ── 3. Wear-off (65 % of duration, at least 30 min after peak)
    const wearoffMs = takenMs + pk.durationHours * 0.65 * 3_600_000;
    if (wearoffMs > peakMs + 30 * 60_000) {
      await schedule(
        `${icon} ${name} – Wirkung lässt nach`,
        `Die Wirkung von ${name} nimmt jetzt merklich ab`,
        wearoffMs,
        'curveday-pk',
      );
    }

    // ── 4. Sleep disruption warning ──────────────────────────
    if (sleepStartHour != null) {
      const todayMidnight = new Date();
      todayMidnight.setHours(0, 0, 0, 0);
      let sleepMs = todayMidnight.getTime() + sleepStartHour * 3_600_000;
      // If sleep already happened today before intake was taken, shift to tomorrow
      if (sleepMs < takenMs - 3_600_000) sleepMs += 24 * 3_600_000;

      // Warn if substance still at >~25 % potency at sleep time
      // Heuristic: within 2 half-lives from peak ≈ 25 % remaining
      const twoHalflivesAfterPeakMs = peakMs + pk.halflifeHours * 2 * 3_600_000;
      if (twoHalflivesAfterPeakMs > sleepMs) {
        await schedule(
          `🌙 Schlaf heute ggf. beeinträchtigt`,
          `${name} wirkt noch beim Einschlafen – Einschlafen könnte schwerer fallen`,
          sleepMs - 30 * 60_000, // 30 min before sleep
          'curveday-pk',
        );
      }
    }
  } catch {}

  return ids;
}

// ─────────────────────────────────────────────────────────────
// IMMEDIATE INTERACTION WARNING
// ─────────────────────────────────────────────────────────────
/**
 * Fires an immediate notification for critical/high interactions
 * when the user logs a new substance that conflicts with an active one.
 */
export async function notifyInteraction(
  nameA: string,
  nameB: string,
  severity: string,
  note: string,
): Promise<void> {
  if (isWeb) return;
  if (severity !== 'critical' && severity !== 'high') return;
  try {
    const N = await import('expo-notifications');
    const { status } = await N.getPermissionsAsync();
    if (status !== 'granted') return;
    const emoji = severity === 'critical' ? '🚨' : '⚠️';
    const body = note.replace(/^[⚠️🚨\s]+/u, '').substring(0, 140);
    await N.scheduleNotificationAsync({
      content: {
        title: `${emoji} Wechselwirkung: ${nameA} + ${nameB}`,
        body,
        data: { type: 'interaction' },
        sound: 'default',
        ...(Platform.OS === 'android' ? { channelId: 'curveday-warn' } : {}),
      },
      trigger: null, // fire immediately
    });
  } catch {}
}

// ─────────────────────────────────────────────────────────────
// CANCEL helpers
// ─────────────────────────────────────────────────────────────

/** Cancel only the notifications tied to one specific intake. */
export async function cancelIntakeNotifications(notificationIds: string[]): Promise<void> {
  if (isWeb || !notificationIds?.length) return;
  try {
    const N = await import('expo-notifications');
    await Promise.all(
      notificationIds.map(id => N.cancelScheduledNotificationAsync(id).catch(() => {})),
    );
  } catch {}
}

// ─────────────────────────────────────────────────────────────
// DAILY RECURRING REMINDER (set from AddIntakeModal)
// ─────────────────────────────────────────────────────────────
/** Schedule a repeating daily notification to remind the user to take a substance. */
export async function scheduleDailyReminder(
  substanceId: string,
  name: string,
  hour: number,
  minute: number,
): Promise<string> {
  if (isWeb) return '';
  try {
    const N = await import('expo-notifications');
    return await N.scheduleNotificationAsync({
      content: {
        title: `💊 Einnahme-Erinnerung`,
        body: `Zeit für ${name}`,
        data: { substanceId },
        sound: 'default',
        ...(Platform.OS === 'android' ? { channelId: 'curveday-pk' } : {}),
      },
      trigger: {
        type: N.SchedulableTriggerInputTypes.DAILY,
        hour,
        minute,
      },
    });
  } catch { return ''; }
}

/** Cancel every scheduled notification (used in Settings). */
export async function cancelAllReminders(): Promise<void> {
  if (isWeb) return;
  try {
    const N = await import('expo-notifications');
    await N.cancelAllScheduledNotificationsAsync();
  } catch {}
}
