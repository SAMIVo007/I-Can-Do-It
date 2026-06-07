/**
 * Core data models for the "I Can Do It" habit tracker.
 */

// ─── Enums & Discriminators ────────────────────────────────────

/** Habit progress type discriminator */
export type HabitType = 'boolean' | 'quantitative';

/** Category for grouping habits */
export type HabitCategory =
  | 'Health'
  | 'Fitness'
  | 'Learning'
  | 'Mindfulness'
  | 'Finance'
  | 'Creative'
  | 'Custom';

// ─── Core Entities ─────────────────────────────────────────────

export interface User {
  id: string;
  name: string;
  createdAt: string; // ISO date
  hasCompletedOnboarding: boolean;
}

export interface Goal {
  id: string;
  title: string; // e.g. "Get in better shape"
  focusArea: HabitCategory;
  emoji?: string;  // Optional visual identity, e.g. "💪"
  color?: string;  // Optional accent hex, e.g. "#7BAE7F"
  createdAt: string;
}

export interface Habit {
  id: string;
  goalId: string; // FK → Goal
  title: string; // e.g. "Drink 2L Water"
  description?: string;
  category: HabitCategory;
  type: HabitType;
  /** Only for quantitative habits */
  target?: number; // e.g. 4 (glasses), 2000 (ml)
  unit?: string; // e.g. "L", "pages", "steps"
  incrementValue?: number; // custom increment value
  isActive: boolean;
  createdAt: string;
  sortOrder: number;
  /** Notification scheduling */
  reminderEnabled: boolean;
  reminderTime?: string; // "HH:mm" format, e.g. "08:00"
}

/** One log entry per habit per day */
export interface DailyLog {
  id: string;
  habitId: string; // FK → Habit
  date: string; // "YYYY-MM-DD"
  /** For boolean: 0 or 1. For quantitative: current value (e.g. 1.2 for 1.2L) */
  value: number;
  completedAt?: string; // ISO timestamp when fully completed
}

// ─── Derived / View Types ──────────────────────────────────────

export interface DaySummary {
  date: string; // "YYYY-MM-DD"
  dayLabel: string; // "MON", "TUE", etc.
  completionRate: number; // 0.0 – 1.0
  isToday: boolean;
  isFuture: boolean;
}

export interface MonthlyBar {
  day: number; // 1–31
  habitsCompleted: number;
  totalHabits: number;
  isToday: boolean;
}

// ─── Helper Functions ──────────────────────────────────────────

export function isHabitComplete(habit: Habit, log: DailyLog | undefined): boolean {
  if (!log) return false;
  if (habit.type === 'boolean') return log.value === 1;
  return log.value >= (habit.target ?? 1);
}

export function getProgress(habit: Habit, log: DailyLog | undefined): number {
  if (!log) return 0;
  if (habit.type === 'boolean') return log.value;
  return Math.min(log.value / (habit.target ?? 1), 1);
}
