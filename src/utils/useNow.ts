import { useState, useEffect } from 'react';

function toDecimalHour(date: Date): number {
  return date.getHours() + date.getMinutes() / 60 + date.getSeconds() / 3600;
}

/** Gibt die aktuelle Uhrzeit als Dezimalstunde zurück (z.B. 10.75 = 10:45).
 *  Aktualisiert sich jede Minute. */
export function useNow(): number {
  const [now, setNow] = useState(() => toDecimalHour(new Date()));

  useEffect(() => {
    // Sofort auf nächste volle Minute synchronisieren
    const msToNextMinute = (60 - new Date().getSeconds()) * 1000;
    const timeout = setTimeout(() => {
      setNow(toDecimalHour(new Date()));
      const interval = setInterval(() => setNow(toDecimalHour(new Date())), 60_000);
      return () => clearInterval(interval);
    }, msToNextMinute);

    return () => clearTimeout(timeout);
  }, []);

  return now;
}
