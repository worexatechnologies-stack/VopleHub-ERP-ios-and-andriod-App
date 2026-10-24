import { useCallback, useEffect, useRef, useState } from 'react';

/** Mounted-ref guard — replaces ~15 hand-rolled `let alive = true` blocks. */
export function useAlive(): React.MutableRefObject<boolean> {
  const ref = useRef(true);
  useEffect(() => {
    ref.current = true;
    return () => {
      ref.current = false;
    };
  }, []);
  return ref;
}

/**
 * Mount-safe async effect with cleanup.
 * `task(signal)` runs once per deps; state updates after unmount are skipped
 * via the `alive()` predicate instead of each call site tracking `alive`.
 */
export function useAsyncEffect(
  task: (alive: () => boolean) => void | Promise<void> | (() => void),
  deps: React.DependencyList = []
): void {
  useEffect(() => {
    let alive = true;
    const isAlive = () => alive;
    const cleanup = task(isAlive) as unknown;
    return () => {
      alive = false;
      if (typeof cleanup === 'function') (cleanup as () => void)();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);
}

interface BusyState {
  busy: boolean;
  run: <T>(task: () => Promise<T>) => Promise<T | undefined>;
}

/**
 * Single-flight busy flag for press handlers.
 * Replaces the repeated `if (busy) return; setBusy(true); try/finally` pattern.
 */
export function useBusy(): BusyState {
  const [busy, setBusy] = useState(false);
  const busyRef = useRef(false);
  const run = useCallback(async <T,>(task: () => Promise<T>): Promise<T | undefined> => {
    if (busyRef.current) return undefined;
    busyRef.current = true;
    setBusy(true);
    try {
      return await task();
    } finally {
      busyRef.current = false;
      setBusy(false);
    }
  }, []);
  return { busy, run };
}

interface BusyIdState {
  busyId: number | null;
  runWithId: <T>(id: number, task: () => Promise<T>) => Promise<T | undefined>;
}

/** Per-row busy flag (event register buttons) — single impl for 3 copies. */
export function useBusyId(): BusyIdState {
  const [busyId, setBusyId] = useState<number | null>(null);
  const ref = useRef<number | null>(null);
  const runWithId = useCallback(
    async <T,>(id: number, task: () => Promise<T>): Promise<T | undefined> => {
      if (ref.current != null) return undefined;
      ref.current = id;
      setBusyId(id);
      try {
        return await task();
      } finally {
        ref.current = null;
        setBusyId(null);
      }
    },
    []
  );
  return { busyId, runWithId };
}

/**
 * Interval poller with unmount cleanup.
 * Replaces hand-rolled setInterval blocks in chat/notices/transport tabs.
 */
export function usePoller(fn: () => void, ms: number | null): void {
  const fnRef = useRef(fn);
  fnRef.current = fn;
  useEffect(() => {
    if (ms == null) return;
    const t = setInterval(() => fnRef.current(), ms);
    return () => clearInterval(t);
  }, [ms]);
}
