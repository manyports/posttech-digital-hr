"use client";

import { useCallback, useEffect, useState } from "react";
import { api, ApiError } from "./api";

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
 */
export function useApi<T>(path: string | null, { interval = 0 }: { interval?: number } = {}) {
  const [state, setState] = useState<State<T>>({ data: null, error: null, loading: path !== null });
  const [tick, setTick] = useState(0);
  const reload = useCallback(() => setTick((t) => t + 1), []);

  useEffect(() => {
    if (path === null) return;
    const ctrl = new AbortController();

    const run = async () => {
      try {
        const data = await api<T>(path, { signal: ctrl.signal });
        if (!ctrl.signal.aborted) setState({ data, error: null, loading: false });
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
