import { useEffect, useState } from 'react';

/**
 * Returns the current time, refreshed on an interval, so components can
 * re-render live countdowns (deadline badges, "x saat kaldı" labels) without
 * needing new data from the server.
 */
export function useNowTick(intervalMs: number = 60_000): Date {
  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), intervalMs);
    return () => clearInterval(id);
  }, [intervalMs]);

  return now;
}
