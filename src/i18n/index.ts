/**
 * CurveDay i18n hook
 * Usage: const t = useT();  →  t.cancel, t.settingsTitle, etc.
 *
 * Language is determined by region:
 *   US  → English
 *   DE | AT | CH → German (default)
 */
import { useOnboardingStore } from '../store/onboardingStore';
import { de } from './de';
import { en } from './en';
import { Strings } from './strings';

export { Strings };
export { de, en };

export function useT(): Strings {
  const region = useOnboardingStore(s => s.prefs.profile?.region ?? 'DE');
  return region === 'US' ? en : de;
}
