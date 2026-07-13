/**
 * Zustand store for habits, goals, and daily logs.
 * Hydrates from expo-sqlite on launch, write-through on mutations.
 */

import { create } from "zustand";
import * as SQLite from "expo-sqlite";
import * as Crypto from "expo-crypto";
import type {
  Goal,
  Habit,
  DailyLog,
  DaySummary,
  MonthlyBar,
  HabitCategory,
  HabitType,
} from "@/types/models";
import {
  toDateKey,
  getDayLabel,
  getCurrentWeekDates,
  getDaysInMonth,
} from "@/utils/date";
import { storage } from "@/utils/storage";
import {
  cancelAllReminders,
  cancelHabitReminders,
  scheduleHabitReminders,
  syncAllHabitReminders,
} from "@/utils/notifications";

// ─── Database Setup ────────────────────────────────────────────

let db: SQLite.SQLiteDatabase | null = null;

async function getDb(): Promise<SQLite.SQLiteDatabase> {
  if (!db) {
    db = await SQLite.openDatabaseAsync("icandoit.db");
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
      "ALTER TABLE habits ADD COLUMN incrementValue REAL DEFAULT 1",
      "ALTER TABLE goals ADD COLUMN emoji TEXT",
      "ALTER TABLE goals ADD COLUMN color TEXT",
    ];
    for (const sql of migrations) {
      try {
        await db.execAsync(sql);
      } catch {
        /* column already exists */
      }
    }
  }
  return db;
}

function generateId(): string {
  return Crypto.randomUUID();
}

const DEMO_GOALS: Goal[] = [
  {
    id: "demo-goal-health",
    title: "Build a Healthier Routine",
    focusArea: "Health",
    emoji: "💪",
    color: "#7BAE7F",
    createdAt: new Date(Date.now() - 1_000).toISOString(),
  },
  {
    id: "demo-goal-learning",
    title: "Become a Consistent Learner",
    focusArea: "Learning",
    emoji: "📚",
    color: "#5B8DB8",
    createdAt: new Date(Date.now() - 2_000).toISOString(),
  },
  {
    id: "demo-goal-mindfulness",
    title: "Protect Mental Clarity",
    focusArea: "Mindfulness",
    emoji: "🧘",
    color: "#8E7DB5",
    createdAt: new Date(Date.now() - 3_000).toISOString(),
  },
];

const DEMO_HABITS: Habit[] = [
  {
    id: "demo-habit-water",
    goalId: "demo-goal-health",
    title: "Drink 2L Water",
    category: "Health",
    type: "quantitative",
    target: 2,
    unit: "L",
    incrementValue: 0.5,
    isActive: true,
    createdAt: new Date(Date.now() - 90_000).toISOString(),
    sortOrder: 0,
    reminderEnabled: false,
    reminderTimes: ["08:30", "15:00"],
  },
  {
    id: "demo-habit-steps",
    goalId: "demo-goal-health",
    title: "Walk 8,000 Steps",
    category: "Fitness",
    type: "quantitative",
    target: 8000,
    unit: "steps",
    incrementValue: 1000,
    isActive: true,
    createdAt: new Date(Date.now() - 89_000).toISOString(),
    sortOrder: 1,
    reminderEnabled: false,
    reminderTimes: ["18:00"],
  },
  {
    id: "demo-habit-sleep",
    goalId: "demo-goal-health",
    title: "Sleep Before 11 PM",
    category: "Health",
    type: "boolean",
    isActive: true,
    createdAt: new Date(Date.now() - 88_000).toISOString(),
    sortOrder: 2,
    reminderEnabled: false,
    reminderTimes: ["22:30"],
  },
  {
    id: "demo-habit-sugar",
    goalId: "demo-goal-health",
    title: "No Sugar",
    category: "Health",
    type: "boolean",
    isActive: true,
    createdAt: new Date(Date.now() - 87_000).toISOString(),
    sortOrder: 3,
    reminderEnabled: false,
    reminderTimes: [],
  },
  {
    id: "demo-habit-read",
    goalId: "demo-goal-learning",
    title: "Read 20 Pages",
    category: "Learning",
    type: "quantitative",
    target: 20,
    unit: "pages",
    incrementValue: 5,
    isActive: true,
    createdAt: new Date(Date.now() - 86_000).toISOString(),
    sortOrder: 4,
    reminderEnabled: false,
    reminderTimes: ["21:00"],
  },
  {
    id: "demo-habit-code",
    goalId: "demo-goal-learning",
    title: "Practice Coding",
    category: "Learning",
    type: "boolean",
    isActive: true,
    createdAt: new Date(Date.now() - 85_000).toISOString(),
    sortOrder: 5,
    reminderEnabled: false,
    reminderTimes: [],
  },
  {
    id: "demo-habit-notes",
    goalId: "demo-goal-learning",
    title: "Review Notes",
    category: "Learning",
    type: "boolean",
    isActive: true,
    createdAt: new Date(Date.now() - 84_000).toISOString(),
    sortOrder: 6,
    reminderEnabled: false,
    reminderTimes: [],
  },
  {
    id: "demo-habit-meditate",
    goalId: "demo-goal-mindfulness",
    title: "Morning Meditation",
    category: "Mindfulness",
    type: "boolean",
    isActive: true,
    createdAt: new Date(Date.now() - 83_000).toISOString(),
    sortOrder: 7,
    reminderEnabled: false,
    reminderTimes: ["07:30"],
  },
  {
    id: "demo-habit-gratitude",
    goalId: "demo-goal-mindfulness",
    title: "Gratitude Journal",
    category: "Mindfulness",
    type: "boolean",
    isActive: true,
    createdAt: new Date(Date.now() - 82_000).toISOString(),
    sortOrder: 8,
    reminderEnabled: false,
    reminderTimes: ["21:30"],
  },
];

function getDemoHabitValue(habit: Habit, daysAgo: number): number | null {
  if (daysAgo === 0) {
    const todayValues: Record<string, number | null> = {
      "demo-habit-water": 2,
      "demo-habit-steps": 6500,
      "demo-habit-sleep": 1,
      "demo-habit-sugar": null,
      "demo-habit-read": 10,
      "demo-habit-code": 1,
      "demo-habit-notes": null,
      "demo-habit-meditate": 1,
      "demo-habit-gratitude": 1,
    };
    return todayValues[habit.id] ?? null;
  }

  if (daysAgo >= 1 && daysAgo <= 3) return completeValueFor(habit);

  if (daysAgo >= 4 && daysAgo <= 6) {
    if (
      habit.goalId === "demo-goal-health" ||
      habit.goalId === "demo-goal-learning"
    ) {
      return completeValueFor(habit);
    }
    return daysAgo === 4 ? null : partialValueFor(habit);
  }

  if (daysAgo >= 7 && daysAgo <= 9) {
    if (habit.goalId === "demo-goal-health") return completeValueFor(habit);
    if (habit.id === "demo-habit-code" && daysAgo !== 8) return 1;
    if (habit.id === "demo-habit-read")
      return daysAgo === 8 ? null : partialValueFor(habit);
    if (habit.id === "demo-habit-meditate" && daysAgo === 9) return 1;
    return null;
  }

  if (daysAgo === 10) {
    if (habit.id === "demo-habit-water") return partialValueFor(habit);
    if (habit.id === "demo-habit-steps") return completeValueFor(habit);
    if (habit.id === "demo-habit-sleep") return 1;
    return daysAgo % 2 === 0 ? partialValueFor(habit) : null;
  }

  const cadence = (daysAgo * 7 + habit.sortOrder * 5) % 20;
  const recentBoost = daysAgo < 30 ? 4 : daysAgo < 60 ? 2 : 0;
  const score = cadence + recentBoost;

  if (score >= 14) return completeValueFor(habit);
  if (score >= 9) return partialValueFor(habit);
  if (score >= 6 && habit.goalId === "demo-goal-health")
    return partialValueFor(habit);
  return null;
}

function completeValueFor(habit: Habit): number {
  if (habit.type === "boolean") return 1;
  return habit.target ?? 1;
}

function partialValueFor(habit: Habit): number | null {
  if (habit.type === "boolean") return null;
  return Math.max((habit.target ?? 1) * 0.55, habit.incrementValue ?? 1);
}

function buildDemoLogs(): DailyLog[] {
  const logs: DailyLog[] = [];
  for (let daysAgo = 0; daysAgo < 120; daysAgo++) {
    const date = new Date();
    date.setDate(date.getDate() - daysAgo);
    const dateKey = toDateKey(date);

    for (const habit of DEMO_HABITS) {
      const value = getDemoHabitValue(habit, daysAgo);
      if (value === null) continue;

      const completedAt =
        value >= (habit.target ?? 1)
          ? new Date(
              date.getFullYear(),
              date.getMonth(),
              date.getDate(),
              20,
              30,
            ).toISOString()
          : undefined;

      logs.push({
        id: `demo-log-${habit.id}-${dateKey}`,
        habitId: habit.id,
        date: dateKey,
        value,
        completedAt,
      });
    }
  }
  return logs;
}

// ─── Store Types ───────────────────────────────────────────────

interface HabitState {
  goals: Goal[];
  habits: Habit[];
  logs: DailyLog[];
  isHydrated: boolean;

  // Hydration
  hydrate: () => Promise<void>;
  seedDemoData: () => Promise<void>;
  resetAllData: () => Promise<void>;

  // Goal actions
  addGoal: (
    title: string,
    focusArea: HabitCategory,
    emoji?: string,
    color?: string,
  ) => Promise<Goal>;
  updateGoal: (
    id: string,
    updates: Partial<Pick<Goal, "title" | "focusArea" | "emoji" | "color">>,
  ) => Promise<void>;
  /**
   * Delete a goal.
   *  - 'cascade'  → also delete the goal's habits and their logs.
   *  - 'reassign' → move the goal's habits to a generic "Daily" goal (created
   *                 if needed), preserving their streaks/history.
   */
  deleteGoal: (id: string, mode?: "cascade" | "reassign") => Promise<void>;
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
    reminderTimes?: string[];
  }) => Promise<Habit>;
  updateHabit: (id: string, updates: Partial<Habit>) => Promise<void>;
  deleteHabit: (id: string) => Promise<void>;

  // Log actions
  toggleHabit: (habitId: string, date: string) => Promise<void>;
  updateProgress: (
    habitId: string,
    date: string,
    value: number,
  ) => Promise<void>;

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
    const goals = await database.getAllAsync<Goal>(
      "SELECT * FROM goals ORDER BY createdAt DESC",
    );
    const habits = await database.getAllAsync<Habit>(
      "SELECT *, CAST(isActive AS INTEGER) as isActive, CAST(reminderEnabled AS INTEGER) as reminderEnabled FROM habits ORDER BY sortOrder ASC",
    );
    const logs = await database.getAllAsync<DailyLog>(
      "SELECT * FROM daily_logs ORDER BY date DESC LIMIT 1000",
    );

    // Convert SQLite integers to booleans and parse JSON arrays
    const parsedHabits = habits.map((h: any) => ({
      ...h,
      isActive: Boolean(h.isActive),
      reminderEnabled: Boolean(h.reminderEnabled),
      reminderTimes: h.reminderTime ? JSON.parse(h.reminderTime) : [],
    })) as Habit[];

    set({ goals, habits: parsedHabits, logs, isHydrated: true });

    // Rebuild local schedules from persisted habits (source of truth).
    try {
      await syncAllHabitReminders(parsedHabits);
    } catch (error) {
      console.warn("Failed to sync habit reminders on hydrate:", error);
    }
  },

  resetAllData: async () => {
    const database = await getDb();
    await database.runAsync("DELETE FROM daily_logs");
    await database.runAsync("DELETE FROM habits");
    await database.runAsync("DELETE FROM goals");
    await cancelAllReminders();
    storage.clearAll();
    set({ goals: [], habits: [], logs: [] });
  },

  seedDemoData: async () => {
    const database = await getDb();
    const logs = buildDemoLogs();

    await database.runAsync("DELETE FROM daily_logs");
    await database.runAsync("DELETE FROM habits");
    await database.runAsync("DELETE FROM goals");

    for (const goal of DEMO_GOALS) {
      await database.runAsync(
        "INSERT INTO goals (id, title, focusArea, emoji, color, createdAt) VALUES (?, ?, ?, ?, ?, ?)",
        [
          goal.id,
          goal.title,
          goal.focusArea,
          goal.emoji ?? null,
          goal.color ?? null,
          goal.createdAt,
        ],
      );
    }

    for (const habit of DEMO_HABITS) {
      await database.runAsync(
        `INSERT INTO habits (id, goalId, title, description, category, type, target, unit, incrementValue, isActive, createdAt, sortOrder, reminderEnabled, reminderTime)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          habit.id,
          habit.goalId,
          habit.title,
          habit.description ?? null,
          habit.category,
          habit.type,
          habit.target ?? null,
          habit.unit ?? null,
          habit.incrementValue ?? 1,
          habit.isActive ? 1 : 0,
          habit.createdAt,
          habit.sortOrder,
          habit.reminderEnabled ? 1 : 0,
          JSON.stringify(habit.reminderTimes ?? []),
        ],
      );
    }

    for (const log of logs) {
      await database.runAsync(
        "INSERT INTO daily_logs (id, habitId, date, value, completedAt) VALUES (?, ?, ?, ?, ?)",
        [log.id, log.habitId, log.date, log.value, log.completedAt ?? null],
      );
    }

    storage.set("userName", "Alex");
    storage.set("hasOnboarded", true);
    storage.set("remindersEnabled", false);
    await cancelAllReminders();

    const hydratedGoals = await database.getAllAsync<Goal>(
      "SELECT * FROM goals ORDER BY createdAt DESC",
    );
    const hydratedHabits = await database.getAllAsync<Habit>(
      "SELECT *, CAST(isActive AS INTEGER) as isActive, CAST(reminderEnabled AS INTEGER) as reminderEnabled FROM habits ORDER BY sortOrder ASC",
    );
    const hydratedLogs = await database.getAllAsync<DailyLog>(
      "SELECT * FROM daily_logs ORDER BY date DESC LIMIT 1000",
    );
    const parsedHabits = hydratedHabits.map((h: any) => ({
      ...h,
      isActive: Boolean(h.isActive),
      reminderEnabled: Boolean(h.reminderEnabled),
      reminderTimes: h.reminderTime ? JSON.parse(h.reminderTime) : [],
    })) as Habit[];

    set({
      goals: hydratedGoals,
      habits: parsedHabits,
      logs: hydratedLogs,
      isHydrated: true,
    });
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
      "INSERT INTO goals (id, title, focusArea, emoji, color, createdAt) VALUES (?, ?, ?, ?, ?, ?)",
      [
        goal.id,
        goal.title,
        goal.focusArea,
        goal.emoji ?? null,
        goal.color ?? null,
        goal.createdAt,
      ],
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
      values.push((value as string | null) ?? null);
    }
    values.push(id);
    if (setClauses.length > 0) {
      await database.runAsync(
        `UPDATE goals SET ${setClauses.join(", ")} WHERE id = ?`,
        values,
      );
    }
    set((s) => ({
      goals: s.goals.map((g) => (g.id === id ? { ...g, ...updates } : g)),
    }));
  },

  getOrCreateDailyGoal: async () => {
    const existing = get().goals.find(
      (g) => g.title.trim().toLowerCase() === "daily",
    );
    if (existing) return existing;
    return get().addGoal("Daily", "Custom", "🗓️", "#6B9E9E");
  },

  deleteGoal: async (id, mode = "cascade") => {
    const database = await getDb();
    const orphanHabits = get().habits.filter((h) => h.goalId === id);

    if (orphanHabits.length > 0) {
      if (mode === "reassign") {
        // Move habits to the generic "Daily" goal, preserving logs/streaks.
        const daily = await get().getOrCreateDailyGoal();
        await database.runAsync(
          "UPDATE habits SET goalId = ? WHERE goalId = ?",
          [daily.id, id],
        );
        set((s) => ({
          habits: s.habits.map((h) =>
            h.goalId === id ? { ...h, goalId: daily.id } : h,
          ),
        }));
      } else {
        // Cascade — delete the habits and their logs.
        for (const h of orphanHabits) {
          await cancelHabitReminders(h.id);
          await database.runAsync("DELETE FROM daily_logs WHERE habitId = ?", [
            h.id,
          ]);
        }
        await database.runAsync("DELETE FROM habits WHERE goalId = ?", [id]);
        set((s) => ({
          habits: s.habits.filter((h) => h.goalId !== id),
          logs: s.logs.filter(
            (l) => !orphanHabits.some((h) => h.id === l.habitId),
          ),
        }));
      }
    }

    await database.runAsync("DELETE FROM goals WHERE id = ?", [id]);
    set((s) => ({ goals: s.goals.filter((g) => g.id !== id) }));
  },

  addHabit: async (params) => {
    const database = await getDb();
    const state = get();
    const reminderTimes = params.reminderTimes ?? [];
    const reminderEnabled = reminderTimes.length > 0;
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
      reminderEnabled,
      reminderTimes,
    };
    await database.runAsync(
      `INSERT INTO habits (id, goalId, title, description, category, type, target, unit, incrementValue, isActive, createdAt, sortOrder, reminderEnabled, reminderTime)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        habit.id,
        habit.goalId,
        habit.title,
        habit.description ?? null,
        habit.category,
        habit.type,
        habit.target ?? null,
        habit.unit ?? null,
        habit.incrementValue ?? 1,
        1,
        habit.createdAt,
        habit.sortOrder,
        reminderEnabled ? 1 : 0,
        JSON.stringify(habit.reminderTimes),
      ],
    );
    set((s) => ({ habits: [...s.habits, habit] }));
    await scheduleHabitReminders(habit);
    return habit;
  },

  updateHabit: async (id, updates) => {
    const database = await getDb();
    const setClauses: string[] = [];
    const values: (string | number | null)[] = [];

    // Keep reminderEnabled in sync when reminder times are edited.
    const normalizedUpdates: Partial<Habit> = { ...updates };
    if (
      updates.reminderTimes !== undefined &&
      updates.reminderEnabled === undefined
    ) {
      normalizedUpdates.reminderEnabled =
        (updates.reminderTimes?.length ?? 0) > 0;
    }

    for (const [key, value] of Object.entries(normalizedUpdates)) {
      if (key === "id") continue;

      let dbKey = key;
      let dbValue: any = value;

      if (key === "reminderTimes") {
        dbKey = "reminderTime";
        dbValue = value ? JSON.stringify(value) : null;
      } else if (key === "isActive" || key === "reminderEnabled") {
        dbValue = value ? 1 : 0;
      }

      setClauses.push(`${dbKey} = ?`);
      values.push(dbValue);
    }
    values.push(id);

    if (setClauses.length > 0) {
      await database.runAsync(
        `UPDATE habits SET ${setClauses.join(", ")} WHERE id = ?`,
        values,
      );
    }
    set((s) => ({
      habits: s.habits.map((h) =>
        h.id === id ? { ...h, ...normalizedUpdates } : h,
      ),
    }));

    const updated = get().habits.find((h) => h.id === id);
    if (updated) {
      await scheduleHabitReminders(updated);
    }
  },

  deleteHabit: async (id) => {
    const database = await getDb();
    await cancelHabitReminders(id);
    await database.runAsync("DELETE FROM daily_logs WHERE habitId = ?", [id]);
    await database.runAsync("DELETE FROM habits WHERE id = ?", [id]);
    set((s) => ({
      habits: s.habits.filter((h) => h.id !== id),
      logs: s.logs.filter((l) => l.habitId !== id),
    }));
  },

  toggleHabit: async (habitId, date) => {
    const database = await getDb();
    const state = get();
    const existing = state.logs.find(
      (l) => l.habitId === habitId && l.date === date,
    );

    if (existing) {
      const newValue = existing.value === 1 ? 0 : 1;
      const completedAt = newValue === 1 ? new Date().toISOString() : null;
      await database.runAsync(
        "UPDATE daily_logs SET value = ?, completedAt = ? WHERE id = ?",
        [newValue, completedAt, existing.id],
      );
      set((s) => ({
        logs: s.logs.map((l) =>
          l.id === existing.id
            ? { ...l, value: newValue, completedAt: completedAt ?? undefined }
            : l,
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
        "INSERT INTO daily_logs (id, habitId, date, value, completedAt) VALUES (?, ?, ?, ?, ?)",
        [log.id, log.habitId, log.date, log.value, log.completedAt ?? null],
      );
      set((s) => ({ logs: [log, ...s.logs] }));
    }
  },

  updateProgress: async (habitId, date, value) => {
    const database = await getDb();
    const state = get();
    const habit = state.habits.find((h) => h.id === habitId);
    const existing = state.logs.find(
      (l) => l.habitId === habitId && l.date === date,
    );
    const isComplete = habit && value >= (habit.target ?? 1);
    const completedAt = isComplete ? new Date().toISOString() : null;

    if (existing) {
      await database.runAsync(
        "UPDATE daily_logs SET value = ?, completedAt = ? WHERE id = ?",
        [value, completedAt, existing.id],
      );
      set((s) => ({
        logs: s.logs.map((l) =>
          l.id === existing.id
            ? { ...l, value, completedAt: completedAt ?? undefined }
            : l,
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
        "INSERT INTO daily_logs (id, habitId, date, value, completedAt) VALUES (?, ?, ?, ?, ?)",
        [log.id, log.habitId, log.date, log.value, log.completedAt ?? null],
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
      const log = state.logs.find(
        (l) => l.habitId === h.id && l.date === today,
      );
      if (!log) return false;
      if (h.type === "boolean") return log.value === 1;
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
        const log = state.logs.find(
          (l) => l.habitId === h.id && l.date === dateKey,
        );
        if (!log) return false;
        if (h.type === "boolean") return log.value === 1;
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
          const log = state.logs.find(
            (l) => l.habitId === h.id && l.date === dateKey,
          );
          if (!log) return false;
          if (h.type === "boolean") return log.value === 1;
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
      const dateKey = `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
      const completed = activeHabits.filter((h) => {
        const log = state.logs.find(
          (l) => l.habitId === h.id && l.date === dateKey,
        );
        if (!log) return false;
        if (h.type === "boolean") return log.value === 1;
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
