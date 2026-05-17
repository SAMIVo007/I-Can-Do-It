/**
 * Hook that provides today's date info and greeting.
 */

import { useMemo } from 'react';
import { toDateKey, formatDateFull, getGreeting } from '@/utils/date';

export function useToday() {
  return useMemo(() => {
    const now = new Date();
    return {
      dateKey: toDateKey(now),
      dateFormatted: formatDateFull(now),
      greeting: getGreeting(),
    };
  }, []);
}
