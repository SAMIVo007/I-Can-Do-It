/**
 * Onboarding state — tracks which step user is on and collects data.
 */

import { create } from 'zustand';
import type { HabitCategory } from '@/types/models';

interface OnboardingHabit {
  title: string;
  category: HabitCategory;
  type: 'boolean' | 'quantitative';
  target?: number;
  unit?: string;
}

interface OnboardingState {
  // User input
  userName: string;
  goalTitle: string;
  focusArea: HabitCategory | null;
  selectedHabits: OnboardingHabit[];

  // Actions
  setUserName: (name: string) => void;
  setGoalTitle: (title: string) => void;
  setFocusArea: (area: HabitCategory) => void;
  toggleHabit: (habit: OnboardingHabit) => void;
  addCustomHabit: (habit: OnboardingHabit) => void;
  reset: () => void;
}

const initialState = {
  userName: '',
  goalTitle: '',
  focusArea: null as HabitCategory | null,
  selectedHabits: [] as OnboardingHabit[],
};

export const useOnboardingStore = create<OnboardingState>((set, get) => ({
  ...initialState,

  setUserName: (name) => set({ userName: name }),
  setGoalTitle: (title) => set({ goalTitle: title }),
  setFocusArea: (area) => set({ focusArea: area }),

  toggleHabit: (habit) => {
    const state = get();
    const exists = state.selectedHabits.some((h) => h.title === habit.title);
    if (exists) {
      set({ selectedHabits: state.selectedHabits.filter((h) => h.title !== habit.title) });
    } else {
      set({ selectedHabits: [...state.selectedHabits, habit] });
    }
  },

  addCustomHabit: (habit) => {
    set((s) => ({ selectedHabits: [...s.selectedHabits, habit] }));
  },

  reset: () => set(initialState),
}));

/** Suggested habits per focus area */
export const SUGGESTED_HABITS: Record<HabitCategory, OnboardingHabit[]> = {
  'Health': [
    { title: 'Drink 2L Water', category: 'Health', type: 'quantitative', target: 2, unit: 'L' },
    { title: 'No Sugar', category: 'Health', type: 'boolean' },
    { title: 'Take Vitamins', category: 'Health', type: 'boolean' },
    { title: 'Sleep 8 Hours', category: 'Health', type: 'boolean' },
  ],
  'Fitness': [
    { title: 'Walk 10,000 Steps', category: 'Fitness', type: 'quantitative', target: 10000, unit: 'steps' },
    { title: 'Stretch 10 min', category: 'Fitness', type: 'boolean' },
    { title: 'Workout', category: 'Fitness', type: 'boolean' },
    { title: 'Morning Run', category: 'Fitness', type: 'boolean' },
  ],
  'Learning': [
    { title: 'Read 20 Pages', category: 'Learning', type: 'quantitative', target: 20, unit: 'pages' },
    { title: 'Practice Language', category: 'Learning', type: 'boolean' },
    { title: 'Online Course', category: 'Learning', type: 'boolean' },
    { title: 'Write Journal', category: 'Learning', type: 'boolean' },
  ],
  'Mindfulness': [
    { title: 'Morning Meditation', category: 'Mindfulness', type: 'boolean' },
    { title: 'Gratitude Journal', category: 'Mindfulness', type: 'boolean' },
    { title: 'Digital Detox 1hr', category: 'Mindfulness', type: 'boolean' },
    { title: 'Deep Breathing', category: 'Mindfulness', type: 'boolean' },
  ],
  'Finance': [
    { title: 'Track Expenses', category: 'Finance', type: 'boolean' },
    { title: 'No Impulse Buys', category: 'Finance', type: 'boolean' },
    { title: 'Save $10', category: 'Finance', type: 'quantitative', target: 10, unit: '$' },
    { title: 'Review Budget', category: 'Finance', type: 'boolean' },
  ],
  'Creative': [
    { title: 'Sketch / Draw', category: 'Creative', type: 'boolean' },
    { title: 'Write 500 Words', category: 'Creative', type: 'quantitative', target: 500, unit: 'words' },
    { title: 'Practice Music', category: 'Creative', type: 'boolean' },
    { title: 'Photography', category: 'Creative', type: 'boolean' },
  ],
  'Custom': [],
};
