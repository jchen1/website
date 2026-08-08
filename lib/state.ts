import { useEffect, useState } from "react";

import type { MetricEvent } from "./types";

interface GlobalState {
  ws: WebSocket | null;
  metrics: MetricEvent[];
  activeTab: string;
}

type Update<T> = T | ((prev: T) => T);

function createGlobalState<State extends object>(initialState: State) {
  const state = { ...initialState };
  const listeners = new Map<keyof State, Set<() => void>>();

  function getGlobalState<K extends keyof State>(key: K): State[K] {
    return state[key];
  }

  function setGlobalState<K extends keyof State>(
    key: K,
    update: Update<State[K]>,
  ) {
    state[key] =
      typeof update === "function"
        ? (update as (prev: State[K]) => State[K])(state[key])
        : update;
    listeners.get(key)?.forEach(listener => listener());
  }

  const setters = {} as {
    [K in keyof State]: (update: Update<State[K]>) => void;
  };
  for (const key of Object.keys(initialState) as (keyof State)[]) {
    setters[key] = update => setGlobalState(key, update);
  }

  function useGlobalState<K extends keyof State>(
    key: K,
  ): [State[K], (update: Update<State[K]>) => void] {
    const [value, setValue] = useState(() => state[key]);

    useEffect(() => {
      const listener = () => setValue(() => state[key]);
      let keyListeners = listeners.get(key);
      if (!keyListeners) {
        keyListeners = new Set();
        listeners.set(key, keyListeners);
      }
      keyListeners.add(listener);
      // resync in case the value changed between render and subscription
      listener();
      return () => {
        keyListeners.delete(listener);
      };
    }, [key]);

    return [value, setters[key]];
  }

  return { setGlobalState, getGlobalState, useGlobalState };
}

const { setGlobalState, getGlobalState, useGlobalState } =
  createGlobalState<GlobalState>({
    ws: null,
    metrics: [],
    activeTab: "Personal",
  });

function metricKey(metric: MetricEvent) {
  return `${metric.source.major}.${metric.source.minor}.${metric.event}.${metric.time}`;
}

function dedupMetrics(metrics: MetricEvent[]) {
  return metrics.reduce<[Record<string, boolean>, MetricEvent[]]>(
    (acc, metric) => {
      const [m, r] = acc;
      const k = metricKey(metric);

      if (!m[k]) {
        m[k] = true;
        r.push(metric);
      }

      return [m, r];
    },
    [{}, []],
  )[1];
}

export function addMetrics(metrics: MetricEvent[]) {
  setGlobalState("metrics", m => dedupMetrics(m.concat(metrics)));
}

export { useGlobalState, getGlobalState };
