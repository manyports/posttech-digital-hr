"use client";

import { useCallback, useEffect, useState } from "react";
import { api, ApiError } from "./api";

/**
 * Last good response per path, shared across pages. Coming back to a page
 * shows it instantly while a fresh copy loads. Cleared on sign-in/out so one
 * person's data never flashes up for the next.
 */
const cache = new Map<string, unknown>();
export const clearApiCache = () => cache.clear();

interface State<T> {
  data: T | null;
  error: ApiError | null;
  loading: boolean;
}

/**
 * GET `path` and keep it fresh.
 *  - `interval` (ms) enables polling: this is how statuses update "live"
 *    without WebSockets (works on serverless). Polling pauses in hidden tabs.
 *  - Keeps the last good data if a later poll fails.
 *  - `reload()` forces an immediate refetch (e.g. after a mutation).
 *  - Starts from the cached copy of `path` when there is one.
 */
export function useApi<T>(path: string | null, { interval = 0 }: { interval?: number } = {}) {
  const [state, setState] = useState<State<T>>(() => {
    const hit = path === null ? undefined : (cache.get(path) as T | undefined);
    return { data: hit ?? null, error: null, loading: path !== null && hit === undefined };
  });
  const [tick, setTick] = useState(0);
  const reload = useCallback(() => setTick((t) => t + 1), []);

  useEffect(() => {
    if (path === null) return;
    const ctrl = new AbortController();

    const run = async () => {
      try {
        const data = await api<T>(path, { signal: ctrl.signal });
        if (ctrl.signal.aborted) return;
        cache.set(path, data);
        setState({ data, error: null, loading: false });
      } catch (e) {
        if (ctrl.signal.aborted) return;
        setState((s) => ({ ...s, error: e instanceof ApiError ? e : new ApiError(0, "network", "Network error."), loading: false }));
      }
    };

    void run();
    const timer =
      interval > 0
        ? setInterval(() => {
            if (document.visibilityState === "visible") void run();
          }, interval)
        : undefined;

    return () => {
      ctrl.abort();
      if (timer) clearInterval(timer);
    };
  }, [path, interval, tick]);

  return { ...state, reload };
}

/**
 * Current time for relative labels ("5 min ago"). Read once on mount and then
 * every `interval` ms, so render stays pure and the labels don't go stale.
 */
export function useNow(interval = 30_000): number {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), interval);
    return () => clearInterval(t);
  }, [interval]);
  return now;
}
