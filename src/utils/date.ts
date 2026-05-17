/**
 * Date formatting helpers for the habit tracker.
 */

const DAY_LABELS = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'] as const;
const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
] as const;
const DAY_NAMES = [
  'Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday',
] as const;

/** Returns "YYYY-MM-DD" for a Date object */
export function toDateKey(date: Date = new Date()): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

/** Returns "Tuesday, October 24" style string */
export function formatDateFull(date: Date = new Date()): string {
  const dayName = DAY_NAMES[date.getDay()];
  const month = MONTH_NAMES[date.getMonth()];
  return `${dayName}, ${month} ${date.getDate()}`;
}

/** Returns "MON", "TUE", etc. */
export function getDayLabel(date: Date): string {
  return DAY_LABELS[date.getDay()];
}

/** Returns time-based greeting */
export function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good Morning';
  if (hour < 17) return 'Good Afternoon';
  return 'Good Evening';
}

/** Returns an array of Date objects for the current week (Mon–Sun) */
export function getCurrentWeekDates(): Date[] {
  const today = new Date();
  const currentDay = today.getDay(); // 0 = Sun
  const monday = new Date(today);
  // Adjust to Monday (if Sunday, go back 6 days; otherwise go back currentDay - 1)
  const diff = currentDay === 0 ? 6 : currentDay - 1;
  monday.setDate(today.getDate() - diff);

  const week: Date[] = [];
  for (let i = 0; i < 7; i++) {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);
    week.push(d);
  }
  return week;
}

/** Returns number of days in a given month/year */
export function getDaysInMonth(month: number, year: number): number {
  return new Date(year, month + 1, 0).getDate();
}

/** Returns short month name, e.g. "Oct" */
export function getShortMonthName(month: number): string {
  return MONTH_NAMES[month].slice(0, 3);
}
