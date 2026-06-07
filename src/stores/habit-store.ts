/**
 * Zustand store for habits, goals, and daily logs.
 * Hydrates from expo-sqlite on launch, write-through on mutations.
 */

import { create } from 'zustand';
import * as SQLite from 'expo-sqlite';
import * as Crypto from 'expo-crypto';
import type { Goal, Habit, DailyLog, DaySummary, MonthlyBar, HabitCategory, HabitType } from '@/types/models';
import { toDateKey, getDayLabel, getCurrentWeekDates, getDaysInMonth } from '@/utils/date';

// ─── Database Setup ────────────────────────────────────────────

let db: SQLite.SQLiteDatabase | null = null;

async function getDb(): Promise<SQLite.SQLiteDatabase> {
  if (!db) {
    db = await SQLite.openDatabaseAsync('icandoit.db');
    await db.execAsync(`
      CREATE TABLE IF NOT EXISTS goals (
        id TEXT PRIMARY KEY,
        title TEXT NOT NULL,
        focusArea TEXT NOT NULL,
        createdAt TEXT NOT NULL
      );
      CREATE TABLE IF NOT EXISTS habits (
        id TEXT PRIMARY KEY,
        goalId TEXT NOT NULL,
        title TEXT NOT NULL,
        description TEXT,
        category TEXT NOT NULL,
        type TEXT NOT NULL DEFAULT 'boolean',
        target REAL,
        unit TEXT,
        isActive INTEGER NOT NULL DEFAULT 1,
        createdAt TEXT NOT NULL,
        sortOrder INTEGER NOT NULL DEFAULT 0,
        reminderEnabled INTEGER NOT NULL DEFAULT 0,
        reminderTime TEXT,
        FOREIGN KEY (goalId) REFERENCES goals(id)
      );
      CREATE TABLE IF NOT EXISTS daily_logs (
        id TEXT PRIMARY KEY,
        habitId TEXT NOT NULL,
        date TEXT NOT NULL,
        value REAL NOT NULL DEFAULT 0,
        completedAt TEXT,
        UNIQUE(habitId, date),
        FOREIGN KEY (habitId) REFERENCES habits(id)
      );
    `);
    // Incremental migrations — each wrapped so existing columns are silently skipped
    const migrations = [
      'ALTER TABLE habits ADD COLUMN incrementValue REAL DEFAULT 1',
      'ALTER TABLE goals ADD COLUMN emoji TEXT',
      'ALTER TABLE goals ADD COLUMN color TEXT',
    ];
    for (const sql of migrations) {
      try { await db.execAsync(sql); } catch { /* column already exists */ }
    }
  }
  return db;
}

function generateId(): string {
  return Crypto.randomUUID();
}

// ─── Store Types ───────────────────────────────────────────────

interface HabitState {
  goals: Goal[];
  habits: Habit[];
  logs: DailyLog[];
  isHydrated: boolean;

  // Hydration
  hydrate: () => Promise<void>;

  // Goal actions
  addGoal: (title: string, focusArea: HabitCategory, emoji?: string, color?: string) => Promise<Goal>;
  updateGoal: (id: string, updates: Partial<Pick<Goal, 'title' | 'focusArea' | 'emoji' | 'color'>>) => Promise<void>;
  /**
   * Delete a goal.
   *  - 'cascade'  → also delete the goal's habits and their logs.
   *  - 'reassign' → move the goal's habits to a generic "Daily" goal (created
   *                 if needed), preserving their streaks/history.
   */
  deleteGoal: (id: string, mode?: 'cascade' | 'reassign') => Promise<void>;
  /** Get-or-create the generic catch-all "Daily" goal. */
  getOrCreateDailyGoal: () => Promise<Goal>;

  // Habit actions
  addHabit: (params: {
    goalId: string;
    title: string;
    description?: string;
    category: HabitCategory;
    type: HabitType;
    target?: number;
    unit?: string;
    incrementValue?: number;
  }) => Promise<Habit>;
  updateHabit: (id: string, updates: Partial<Habit>) => Promise<void>;
  deleteHabit: (id: string) => Promise<void>;

  // Log actions
  toggleHabit: (habitId: string, date: string) => Promise<void>;
  updateProgress: (habitId: string, date: string, value: number) => Promise<void>;

  // Selectors
  getHabitsForGoal: (goalId: string) => Habit[];
  getHabitsForDate: (date: string) => Habit[];
  getLogForHabit: (habitId: string, date: string) => DailyLog | undefined;
  getTodayCompletionRate: () => number;
  getStreak: () => number;
  getWeekSummary: () => DaySummary[];
  getMonthlyData: (month: number, year: number) => MonthlyBar[];
  getTotalActiveDays: () => number;
}

// ─── Store Implementation ──────────────────────────────────────

export const useHabitStore = create<HabitState>((set, get) => ({
  goals: [],
  habits: [],
  logs: [],
  isHydrated: false,

  hydrate: async () => {
    const database = await getDb();
    const goals = await database.getAllAsync<Goal>('SELECT * FROM goals ORDER BY createdAt DESC');
    const habits = await database.getAllAsync<Habit>(
      'SELECT *, CAST(isActive AS INTEGER) as isActive, CAST(reminderEnabled AS INTEGER) as reminderEnabled FROM habits ORDER BY sortOrder ASC'
    );
    const logs = await database.getAllAsync<DailyLog>(
      'SELECT * FROM daily_logs ORDER BY date DESC LIMIT 1000'
    );

    // Convert SQLite integers to booleans
    const parsedHabits = habits.map((h) => ({
      ...h,
      isActive: Boolean(h.isActive),
      reminderEnabled: Boolean(h.reminderEnabled),
    }));

    set({ goals, habits: parsedHabits, logs, isHydrated: true });
  },

  addGoal: async (title, focusArea, emoji, color) => {
    const database = await getDb();
    const goal: Goal = {
      id: generateId(),
      title,
      focusArea,
      emoji: emoji ?? undefined,
      color: color ?? undefined,
      createdAt: new Date().toISOString(),
    };
    await database.runAsync(
      'INSERT INTO goals (id, title, focusArea, emoji, color, createdAt) VALUES (?, ?, ?, ?, ?, ?)',
      [goal.id, goal.title, goal.focusArea, goal.emoji ?? null, goal.color ?? null, goal.createdAt]
    );
    set((s) => ({ goals: [goal, ...s.goals] }));
    return goal;
  },

  updateGoal: async (id, updates) => {
    const database = await getDb();
    const setClauses: string[] = [];
    const values: (string | null)[] = [];
    for (const [key, value] of Object.entries(updates)) {
      setClauses.push(`${key} = ?`);
      values.push(value as string | null ?? null);
    }
    values.push(id);
    if (setClauses.length > 0) {
      await database.runAsync(`UPDATE goals SET ${setClauses.join(', ')} WHERE id = ?`, values);
    }
    set((s) => ({
      goals: s.goals.map((g) => (g.id === id ? { ...g, ...updates } : g)),
    }));
  },

  getOrCreateDailyGoal: async () => {
    const existing = get().goals.find(
      (g) => g.title.trim().toLowerCase() === 'daily'
    );
    if (existing) return existing;
    return get().addGoal('Daily', 'Custom', '🗓️', '#6B9E9E');
  },

  deleteGoal: async (id, mode = 'cascade') => {
    const database = await getDb();
    const orphanHabits = get().habits.filter((h) => h.goalId === id);

    if (orphanHabits.length > 0) {
      if (mode === 'reassign') {
        // Move habits to the generic "Daily" goal, preserving logs/streaks.
        const daily = await get().getOrCreateDailyGoal();
        await database.runAsync('UPDATE habits SET goalId = ? WHERE goalId = ?', [daily.id, id]);
        set((s) => ({
          habits: s.habits.map((h) => (h.goalId === id ? { ...h, goalId: daily.id } : h)),
        }));
      } else {
        // Cascade — delete the habits and their logs.
        for (const h of orphanHabits) {
          await database.runAsync('DELETE FROM daily_logs WHERE habitId = ?', [h.id]);
        }
        await database.runAsync('DELETE FROM habits WHERE goalId = ?', [id]);
        set((s) => ({
          habits: s.habits.filter((h) => h.goalId !== id),
          logs: s.logs.filter((l) => !orphanHabits.some((h) => h.id === l.habitId)),
        }));
      }
    }

    await database.runAsync('DELETE FROM goals WHERE id = ?', [id]);
    set((s) => ({ goals: s.goals.filter((g) => g.id !== id) }));
  },

  addHabit: async (params) => {
    const database = await getDb();
    const state = get();
    const habit: Habit = {
      id: generateId(),
      goalId: params.goalId,
      title: params.title,
      description: params.description,
      category: params.category,
      type: params.type,
      target: params.target,
      unit: params.unit,
      incrementValue: params.incrementValue ?? 1,
      isActive: true,
      createdAt: new Date().toISOString(),
      sortOrder: state.habits.length,
      reminderEnabled: false,
    };
    await database.runAsync(
      `INSERT INTO habits (id, goalId, title, description, category, type, target, unit, incrementValue, isActive, createdAt, sortOrder, reminderEnabled)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [habit.id, habit.goalId, habit.title, habit.description ?? null, habit.category, habit.type, habit.target ?? null, habit.unit ?? null, habit.incrementValue ?? 1, 1, habit.createdAt, habit.sortOrder, 0]
    );
    set((s) => ({ habits: [...s.habits, habit] }));
    return habit;
  },

  updateHabit: async (id, updates) => {
    const database = await getDb();
    const setClauses: string[] = [];
    const values: (string | number | null)[] = [];

    for (const [key, value] of Object.entries(updates)) {
      if (key === 'id') continue;
      const dbKey = key === 'isActive' || key === 'reminderEnabled' ? key : key;
      setClauses.push(`${dbKey} = ?`);
      if (key === 'isActive' || key === 'reminderEnabled') {
        values.push(value ? 1 : 0);
      } else {
        values.push(value as string | number | null);
      }
    }
    values.push(id);

    if (setClauses.length > 0) {
      await database.runAsync(
        `UPDATE habits SET ${setClauses.join(', ')} WHERE id = ?`,
        values
      );
    }
    set((s) => ({
      habits: s.habits.map((h) => (h.id === id ? { ...h, ...updates } : h)),
    }));
  },

  deleteHabit: async (id) => {
    const database = await getDb();
    await database.runAsync('DELETE FROM daily_logs WHERE habitId = ?', [id]);
    await database.runAsync('DELETE FROM habits WHERE id = ?', [id]);
    set((s) => ({
      habits: s.habits.filter((h) => h.id !== id),
      logs: s.logs.filter((l) => l.habitId !== id),
    }));
  },

  toggleHabit: async (habitId, date) => {
    const database = await getDb();
    const state = get();
    const existing = state.logs.find((l) => l.habitId === habitId && l.date === date);

    if (existing) {
      const newValue = existing.value === 1 ? 0 : 1;
      const completedAt = newValue === 1 ? new Date().toISOString() : null;
      await database.runAsync(
        'UPDATE daily_logs SET value = ?, completedAt = ? WHERE id = ?',
        [newValue, completedAt, existing.id]
      );
      set((s) => ({
        logs: s.logs.map((l) =>
          l.id === existing.id
            ? { ...l, value: newValue, completedAt: completedAt ?? undefined }
            : l
        ),
      }));
    } else {
      const log: DailyLog = {
        id: generateId(),
        habitId,
        date,
        value: 1,
        completedAt: new Date().toISOString(),
      };
      await database.runAsync(
        'INSERT INTO daily_logs (id, habitId, date, value, completedAt) VALUES (?, ?, ?, ?, ?)',
        [log.id, log.habitId, log.date, log.value, log.completedAt ?? null]
      );
      set((s) => ({ logs: [log, ...s.logs] }));
    }
  },

  updateProgress: async (habitId, date, value) => {
    const database = await getDb();
    const state = get();
    const habit = state.habits.find((h) => h.id === habitId);
    const existing = state.logs.find((l) => l.habitId === habitId && l.date === date);
    const isComplete = habit && value >= (habit.target ?? 1);
    const completedAt = isComplete ? new Date().toISOString() : null;

    if (existing) {
      await database.runAsync(
        'UPDATE daily_logs SET value = ?, completedAt = ? WHERE id = ?',
        [value, completedAt, existing.id]
      );
      set((s) => ({
        logs: s.logs.map((l) =>
          l.id === existing.id
            ? { ...l, value, completedAt: completedAt ?? undefined }
            : l
        ),
      }));
    } else {
      const log: DailyLog = {
        id: generateId(),
        habitId,
        date,
        value,
        completedAt: completedAt ?? undefined,
      };
      await database.runAsync(
        'INSERT INTO daily_logs (id, habitId, date, value, completedAt) VALUES (?, ?, ?, ?, ?)',
        [log.id, log.habitId, log.date, log.value, log.completedAt ?? null]
      );
      set((s) => ({ logs: [log, ...s.logs] }));
    }
  },

  getHabitsForGoal: (goalId) => {
    return get().habits.filter((h) => h.goalId === goalId && h.isActive);
  },

  getHabitsForDate: (_date) => {
    const state = get();
    return state.habits.filter((h) => h.isActive);
  },

  getLogForHabit: (habitId, date) => {
    const state = get();
    return state.logs.find((l) => l.habitId === habitId && l.date === date);
  },

  getTodayCompletionRate: () => {
    const state = get();
    const today = toDateKey();
    const activeHabits = state.habits.filter((h) => h.isActive);
    if (activeHabits.length === 0) return 0;

    const completedCount = activeHabits.filter((h) => {
      const log = state.logs.find((l) => l.habitId === h.id && l.date === today);
      if (!log) return false;
      if (h.type === 'boolean') return log.value === 1;
      return log.value >= (h.target ?? 1);
    }).length;

    return completedCount / activeHabits.length;
  },

  getStreak: () => {
    const state = get();
    const activeHabits = state.habits.filter((h) => h.isActive);
    if (activeHabits.length === 0) return 0;

    let streak = 0;
    const today = new Date();
    const date = new Date(today);

    for (let i = 0; i < 365; i++) {
      const dateKey = toDateKey(date);
      const allCompleted = activeHabits.every((h) => {
        const log = state.logs.find((l) => l.habitId === h.id && l.date === dateKey);
        if (!log) return false;
        if (h.type === 'boolean') return log.value === 1;
        return log.value >= (h.target ?? 1);
      });

      if (allCompleted) {
        streak++;
      } else if (i > 0) {
        // Skip today if not complete yet, but break on any other incomplete day
        break;
      }
      date.setDate(date.getDate() - 1);
    }
    return streak;
  },

  getWeekSummary: () => {
    const state = get();
    const weekDates = getCurrentWeekDates();
    const today = toDateKey();
    const activeHabits = state.habits.filter((h) => h.isActive);

    return weekDates.map((d) => {
      const dateKey = toDateKey(d);
      const isFuture = dateKey > today;
      let completionRate = 0;

      if (!isFuture && activeHabits.length > 0) {
        const completed = activeHabits.filter((h) => {
          const log = state.logs.find((l) => l.habitId === h.id && l.date === dateKey);
          if (!log) return false;
          if (h.type === 'boolean') return log.value === 1;
          return log.value >= (h.target ?? 1);
        }).length;
        completionRate = completed / activeHabits.length;
      }

      return {
        date: dateKey,
        dayLabel: getDayLabel(d),
        completionRate,
        isToday: dateKey === today,
        isFuture,
      } satisfies DaySummary;
    });
  },

  getMonthlyData: (month, year) => {
    const state = get();
    const daysInMonth = getDaysInMonth(month, year);
    const today = toDateKey();
    const activeHabits = state.habits.filter((h) => h.isActive);

    const bars: MonthlyBar[] = [];
    for (let day = 1; day <= daysInMonth; day++) {
      const dateKey = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
      const completed = activeHabits.filter((h) => {
        const log = state.logs.find((l) => l.habitId === h.id && l.date === dateKey);
        if (!log) return false;
        if (h.type === 'boolean') return log.value === 1;
        return log.value >= (h.target ?? 1);
      }).length;

      bars.push({
        day,
        habitsCompleted: completed,
        totalHabits: activeHabits.length,
        isToday: dateKey === today,
      });
    }
    return bars;
  },

  getTotalActiveDays: () => {
    const state = get();
    const uniqueDates = new Set(state.logs.map((l) => l.date));
    return uniqueDates.size;
  },
}));
