# I Can Do It

Goal-driven habit tracking for people who want daily progress to feel clear, calm, and achievable.

Built for **HACKHAZARDS '26** under the **Human Experience & Productivity** theme and the **Expo sponsor track**.

## Overview

I Can Do It is a React Native Expo mobile app that helps users turn a personal goal into small daily habits, track progress, and understand consistency over time. Instead of treating habits as isolated checklist items, the app connects every habit to a larger goal and gives users daily, weekly, monthly, yearly, and goal-specific feedback.

## Problem

Productivity apps often become overwhelming: too many tasks, too much setup, and not enough emotional momentum. People usually know what they want to improve, but they struggle to convert that goal into repeatable actions and stay aware of progress without feeling judged by the app.

## Solution

I Can Do It creates a gentle loop:

1. Define a main goal.
2. Break it into suggested or custom daily habits.
3. Track boolean and measurable progress each day.
4. Review progress through clear analytics and goal-specific dashboards.
5. Adjust habits and goals as life changes.

## Features

- Three-step onboarding for name, primary goal, focus area, habits, and reminder preference.
- Suggested habit templates for Health, Fitness, Learning, Mindfulness, Finance, and Creative goals.
- Custom goals with emoji icons, muted accent colors, and focus areas.
- Custom habits linked to goals.
- Boolean habits, such as "Workout" or "No Sugar".
- Quantitative habits, such as "Drink 2L Water" or "Read 20 Pages".
- Custom increment values for measurable habits.
- Today dashboard with greeting, date, progress ring, momentum message, and habit cards.
- Goal labels on habit cards so daily actions stay tied to the bigger outcome.
- Goal detail screens with goal-scoped analytics, streaks, check-ins, weekly circles, and last-30-day chart.
- Progress analytics with current streak, productive days, weekly view, monthly bar chart, yearly heatmap, and per-habit breakdown.
- Local-first SQLite persistence for goals, habits, and daily logs.
- Local key-value preferences using the Expo SQLite localStorage polyfill.
- Notification permission flow and reminder-time UI.
- Haptic feedback with a user setting.
- Light, dark, and system theme modes.
- Native-feeling bottom sheets, action menus, platform-aware dialogs, native tabs, and Expo Symbols.

## Tech Stack

- **Framework:** Expo SDK 56, React Native 0.85, React 19
- **Navigation:** Expo Router with file-based routing and protected route groups
- **Language:** TypeScript with strict mode
- **State:** Zustand stores
- **Database:** Expo SQLite
- **Preferences:** `expo-sqlite/localStorage` polyfill plus `useSyncExternalStore`
- **Notifications:** Expo Notifications
- **Haptics:** Expo Haptics
- **UI:** Expo UI, Expo Symbols, React Native SVG, Reanimated, Gesture Handler
- **Fonts:** Newsreader and Space Grotesk from Expo Google Fonts
- **Charts:** Custom React Native SVG/components for bars, weekly circles, progress, and heatmap

## Architecture

```text
src/
  app/                 Expo Router screens and route groups
    (onboarding)/      First-run goal and habit setup
    (tabs)/            Today, Progress, Goals, Settings
    goal/[id].tsx      Goal-specific dashboard
    habit/[id].tsx     Habit detail and progress update screen
    add-goal.tsx       Goal create/edit bottom sheet
    add-habit.tsx      Habit create/edit bottom sheet
  components/ui/       Reusable design-system components
  constants/theme.ts   Slate & Sage color, spacing, radii, font tokens
  hooks/               Storage, theme, and today/date hooks
  stores/              Zustand onboarding and habit stores
  types/models.ts      Core data models and progress helpers
  utils/               Date, haptics, notifications, storage helpers
```

Core data model:

- `Goal`: title, focus area, optional emoji/color.
- `Habit`: linked goal, title, category, boolean or quantitative type, target/unit/increment, reminder fields.
- `DailyLog`: one habit entry per day with numeric progress and completion timestamp.

The app is local-first: goal, habit, and log mutations are written through to SQLite and reflected in the Zustand store. On launch, the root layout hydrates the store, loads fonts, applies theme settings, and gates users between onboarding and the main tab app.

## Installation

```bash
npm install
npx expo start
```

Run on a platform:

```bash
npm run android
npm run ios
npm run web
```

Verify TypeScript:

```bash
npx tsc --noEmit
```

## Screenshots

Add final screenshots before submission:

- `screenshots/01-onboarding-goal.png` - Goal setup
- `screenshots/02-onboarding-habits.png` - Suggested/custom habits
- `screenshots/03-today.png` - Daily dashboard
- `screenshots/04-goals.png` - Goals overview
- `screenshots/05-goal-detail.png` - Goal analytics
- `screenshots/06-progress.png` - Analytics and heatmap
- `screenshots/07-settings.png` - Preferences

## Expo Sponsor Track Fit

The project uses Expo as the full mobile foundation: Expo Router, Expo SQLite, Expo Notifications, Expo Haptics, Expo Font, Expo Splash Screen, Expo Symbols, Expo UI, Expo Image/WebBrowser plugins, and a native development workflow. The app demonstrates how Expo can support a polished local-first productivity experience with platform-specific native details.

## Current Limitations

- Reminder times can be created in the UI, but full scheduling for every saved reminder still needs to be wired into habit create/update flows.
- Settings includes placeholder rows for language and feedback.
- Reset All Data opens a confirmation dialog, but the destructive reset action is not yet implemented.
- No cloud sync, accounts, or external API integrations are implemented; the app is intentionally local-first.

## Future Roadmap

- Schedule and cancel all per-habit reminder times automatically.
- Add a proper reset/export/import data flow.
- Add optional cloud backup/sync.
- Add richer goal templates and onboarding personalization.
- Add streak recovery or pause days for more humane habit tracking.
- Add widgets and push notification deep links.
- Add accessibility pass for screen readers, contrast, and reduced motion.
- Add tests for store selectors, SQLite migrations, and analytics calculations.
