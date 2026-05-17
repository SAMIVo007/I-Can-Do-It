/**
 * Reactive hook for localStorage-backed state.
 * Uses useSyncExternalStore for tear-free reads.
 */

import { useSyncExternalStore } from 'react';
import { storage } from '@/utils/storage';

export function useStorage<T>(
  key: string,
  defaultValue: T
): [T, (value: T) => void] {
  const value = useSyncExternalStore(
    (cb) => storage.subscribe(key, cb),
    () => storage.get(key, defaultValue)
  );

  return [value, (newValue: T) => storage.set(key, newValue)];
}
