/**
 * Local habit reminder notifications using expo-notifications.
 * Includes interactive action category registration (Mark done / Remind in 1h).
 */

import * as Notifications from "expo-notifications";
import { Platform } from "react-native";
import type { Habit } from "@/types/models";
import { storage } from "@/utils/storage";

export const HABIT_REMINDER_CHANNEL = "habit-reminders";
export const DEFAULT_REMINDER_TIME = "09:00";

/** Category id — avoid ":" and "-" per expo-notifications docs. */
export const HABIT_REMINDER_CATEGORY = "habitReminder";

export const HABIT_ACTION = {
  MARK_DONE: "MARK_DONE",
  SNOOZE_1H: "SNOOZE_1H",
} as const;

if (Platform.OS !== "web") {
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowAlert: true,
      shouldPlaySound: true,
      shouldSetBadge: false,
      shouldShowBanner: true,
      shouldShowList: true,
    }),
  });
}

function isNativeNotificationsAvailable(): boolean {
  return Platform.OS === "ios" || Platform.OS === "android";
}

function notificationIdFor(habitId: string, time: string): string {
  return `habit-${habitId}-${time}`;
}

function parseReminderTime(
  time: string,
): { hour: number; minute: number } | null {
  const [hours, minutes] = time.split(":").map(Number);
  if (
    Number.isNaN(hours) ||
    Number.isNaN(minutes) ||
    hours < 0 ||
    hours > 23 ||
    minutes < 0 ||
    minutes > 59
  ) {
    return null;
  }
  return { hour: hours, minute: minutes };
}

function getMotivationalBody(habit: Habit): string {
  const messages = [
    "Small steps lead to big results. You got this!",
    "Consistency is the key to progress. Keep it going!",
    "Every day counts. Make this one matter!",
    "You're building something amazing, one habit at a time.",
    "Don't break the chain! Your streak depends on it.",
  ];
  const index = habit.id.charCodeAt(0) % messages.length;
  return messages[index];
}

export function buildHabitNotificationContent(
  habit: Habit,
  overrides?: Partial<Notifications.NotificationContentInput>,
): Notifications.NotificationContentInput {
  return {
    title: `Time for: ${habit.title}`,
    body: getMotivationalBody(habit),
    data: {
      habitId: habit.id,
      url: `/habit/${habit.id}`,
    },
    categoryIdentifier: HABIT_REMINDER_CATEGORY,
    sound: true,
    ...overrides,
  };
}

/** Ensure Android has a named channel (required before the permission prompt on Android 13+). */
export async function ensureNotificationChannel(): Promise<void> {
  if (Platform.OS !== "android") return;

  await Notifications.setNotificationChannelAsync(HABIT_REMINDER_CHANNEL, {
    name: "Habit Reminders",
    importance: Notifications.AndroidImportance.HIGH,
    vibrationPattern: [0, 250, 250, 250],
    lightColor: "#6B9E9E",
  });
}

/** Register interactive action buttons for habit reminders. */
export async function ensureNotificationCategory(): Promise<void> {
  if (!isNativeNotificationsAvailable()) return;

  await Notifications.setNotificationCategoryAsync(HABIT_REMINDER_CATEGORY, [
    {
      identifier: HABIT_ACTION.MARK_DONE,
      buttonTitle: "Mark done",
      options: {
        // Keep false so user can complete from the shade; when the app is
        // killed the response is delivered on next launch via last response.
        opensAppToForeground: false,
      },
    },
    {
      identifier: HABIT_ACTION.SNOOZE_1H,
      buttonTitle: "Remind in 1h",
      options: {
        opensAppToForeground: false,
      },
    },
  ]);
}

export async function prepareNotifications(): Promise<void> {
  await ensureNotificationChannel();
  await ensureNotificationCategory();
}

/** Request notification permissions. Returns true if granted. */
export async function requestNotificationPermissions(): Promise<boolean> {
  if (!isNativeNotificationsAvailable()) return false;

  await prepareNotifications();

  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  if (existingStatus === "granted") return true;

  const { status } = await Notifications.requestPermissionsAsync();
  return status === "granted";
}

/** Check whether notification permission is already granted (no prompt). */
export async function hasNotificationPermissions(): Promise<boolean> {
  if (!isNativeNotificationsAvailable()) return false;
  const { status } = await Notifications.getPermissionsAsync();
  return status === "granted";
}

/** Cancel all scheduled reminders for a single habit. */
export async function cancelHabitReminders(habitId: string): Promise<void> {
  if (!isNativeNotificationsAvailable()) return;

  const scheduled = await Notifications.getAllScheduledNotificationsAsync();
  await Promise.all(
    scheduled
      .filter(
        (n) =>
          n.identifier.startsWith(`habit-${habitId}-`) ||
          n.content.data?.habitId === habitId,
      )
      .map((n) => Notifications.cancelScheduledNotificationAsync(n.identifier)),
  );
}

/** Cancel a scheduled notification by its identifier */
export async function cancelHabitReminder(
  notificationId: string,
): Promise<void> {
  if (!isNativeNotificationsAvailable()) return;
  await Notifications.cancelScheduledNotificationAsync(notificationId);
}

/** Cancel all scheduled notifications */
export async function cancelAllReminders(): Promise<void> {
  if (!isNativeNotificationsAvailable()) return;
  await Notifications.cancelAllScheduledNotificationsAsync();
}

/**
 * Schedule daily repeating notifications for every reminder time on a habit.
 * Respects the global remindersEnabled setting and permission state.
 */
export async function scheduleHabitReminders(habit: Habit): Promise<void> {
  if (!isNativeNotificationsAvailable()) return;

  await cancelHabitReminders(habit.id);

  const globalEnabled = storage.get("remindersEnabled", false);
  const times = (habit.reminderTimes ?? []).filter(Boolean);
  const reminderOn = habit.reminderEnabled || times.length > 0;
  if (!globalEnabled || !habit.isActive || !reminderOn || times.length === 0)
    return;

  const granted = await hasNotificationPermissions();
  if (!granted) return;

  await prepareNotifications();

  for (const time of times) {
    const parsed = parseReminderTime(time);
    if (!parsed) continue;

    await Notifications.scheduleNotificationAsync({
      identifier: notificationIdFor(habit.id, time),
      content: buildHabitNotificationContent(habit),
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.DAILY,
        hour: parsed.hour,
        minute: parsed.minute,
        channelId: HABIT_REMINDER_CHANNEL,
      },
    });
  }
}

/** @deprecated Prefer scheduleHabitReminders — kept for callers that expect a single id. */
export async function scheduleHabitReminder(
  habit: Habit,
): Promise<string | null> {
  await scheduleHabitReminders(habit);
  const times = habit.reminderTimes ?? [];
  return times[0] ? notificationIdFor(habit.id, times[0]) : null;
}

/**
 * Rebuild the full local notification schedule from the current habit list.
 * Call after enabling the global toggle, onboarding, or bulk data changes.
 */
export async function syncAllHabitReminders(habits: Habit[]): Promise<void> {
  if (!isNativeNotificationsAvailable()) return;

  await cancelAllReminders();

  const globalEnabled = storage.get("remindersEnabled", false);
  if (!globalEnabled) return;

  const granted = await hasNotificationPermissions();
  if (!granted) return;

  await prepareNotifications();

  for (const habit of habits) {
    if (!habit.isActive) continue;
    const times = (habit.reminderTimes ?? []).filter(Boolean);
    const reminderOn = habit.reminderEnabled || times.length > 0;
    if (!reminderOn || times.length === 0) continue;

    for (const time of times) {
      const parsed = parseReminderTime(time);
      if (!parsed) continue;

      await Notifications.scheduleNotificationAsync({
        identifier: notificationIdFor(habit.id, time),
        content: buildHabitNotificationContent(habit),
        trigger: {
          type: Notifications.SchedulableTriggerInputTypes.DAILY,
          hour: parsed.hour,
          minute: parsed.minute,
          channelId: HABIT_REMINDER_CHANNEL,
        },
      });
    }
  }
}

/**
 * Enable the global reminders master switch: request permission, then schedule.
 * Returns false if permission was denied.
 */
export async function enableReminders(habits: Habit[]): Promise<boolean> {
  const granted = await requestNotificationPermissions();
  if (!granted) {
    storage.set("remindersEnabled", false);
    return false;
  }

  storage.set("remindersEnabled", true);
  await syncAllHabitReminders(habits);
  return true;
}

/** Disable reminders and clear every scheduled notification. */
export async function disableReminders(): Promise<void> {
  storage.set("remindersEnabled", false);
  await cancelAllReminders();
}

/** Schedule a one-off follow-up reminder in one hour. */
export async function snoozeHabitReminder(habit: Habit): Promise<void> {
  if (!isNativeNotificationsAvailable()) return;

  await prepareNotifications();

  await Notifications.scheduleNotificationAsync({
    identifier: `habit-snooze-${habit.id}-${Date.now()}`,
    content: buildHabitNotificationContent(habit, {
      title: `Reminder: ${habit.title}`,
      body: "Still time to finish this today. You got this!",
    }),
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
      seconds: 60 * 60,
      channelId: HABIT_REMINDER_CHANNEL,
    },
  });
}
