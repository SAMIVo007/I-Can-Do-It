/**
 * Handles interactive habit notification actions (Mark done / Snooze / open).
 * Kept separate from notifications.ts to avoid a circular import with the habit store.
 */

import * as Notifications from "expo-notifications";
import { useHabitStore } from "@/stores/habit-store";
import { toDateKey } from "@/utils/date";
import { storage } from "@/utils/storage";
import {
  HABIT_ACTION,
  prepareNotifications,
  snoozeHabitReminder,
} from "@/utils/notifications";

function responseKey(response: Notifications.NotificationResponse): string {
  return [
    response.notification.request.identifier,
    response.actionIdentifier,
    String(response.notification.date ?? ""),
  ].join("|");
}

function alreadyHandled(response: Notifications.NotificationResponse): boolean {
  const key = responseKey(response);
  return storage.get("lastHandledNotificationResponse", "") === key;
}

function markHandled(response: Notifications.NotificationResponse): void {
  storage.set("lastHandledNotificationResponse", responseKey(response));
}

/** Remove the presented notification (and any other tray banners for that habit). */
async function dismissPresentedHabitNotification(
  identifier: string,
  habitId: string,
): Promise<void> {
  try {
    await Notifications.dismissNotificationAsync(identifier);
  } catch {
    // Already dismissed / platform quirk.
  }

  try {
    const presented = await Notifications.getPresentedNotificationsAsync();
    await Promise.all(
      presented
        .filter(
          (n) =>
            n.request.identifier === identifier ||
            n.request.content.data?.habitId === habitId,
        )
        .map((n) =>
          Notifications.dismissNotificationAsync(n.request.identifier),
        ),
    );
  } catch {
    // Presented-list APIs can fail on some platforms; ignore.
  }
}

/** Mark a habit complete for today from a notification action (idempotent). */
export async function completeHabitFromNotification(
  habitId: string,
): Promise<void> {
  const store = useHabitStore.getState();
  if (!store.isHydrated) {
    await store.hydrate();
  }

  const habit = useHabitStore.getState().habits.find((h) => h.id === habitId);
  if (!habit) return;

  const today = toDateKey();
  const existing = useHabitStore.getState().getLogForHabit(habitId, today);

  if (habit.type === "quantitative") {
    const target = habit.target ?? 1;
    if (!existing || existing.value < target) {
      await useHabitStore.getState().updateProgress(habitId, today, target);
    }
  } else if (!existing || existing.value !== 1) {
    // Boolean: only mark done, never un-complete from a notification action.
    await useHabitStore.getState().toggleHabit(habitId, today);
  }
}

/**
 * Handle a notification tap or action button.
 * Returns whether navigation should open the habit detail screen.
 */
export async function handleNotificationResponse(
  response: Notifications.NotificationResponse,
): Promise<{ shouldOpenHabit: boolean; habitId?: string }> {
  if (alreadyHandled(response)) {
    return { shouldOpenHabit: false };
  }

  await prepareNotifications();

  const habitId = response.notification.request.content.data?.habitId;
  if (typeof habitId !== "string") {
    markHandled(response);
    return { shouldOpenHabit: false };
  }

  const action = response.actionIdentifier;

  if (action === HABIT_ACTION.MARK_DONE) {
    await completeHabitFromNotification(habitId);
    markHandled(response);
    await dismissPresentedHabitNotification(
      response.notification.request.identifier,
      habitId,
    );
    return { shouldOpenHabit: false };
  }

  if (action === HABIT_ACTION.SNOOZE_1H) {
    const store = useHabitStore.getState();
    if (!store.isHydrated) {
      await store.hydrate();
    }
    const habit = useHabitStore.getState().habits.find((h) => h.id === habitId);
    if (habit) {
      await snoozeHabitReminder(habit);
    }
    markHandled(response);
    await dismissPresentedHabitNotification(
      response.notification.request.identifier,
      habitId,
    );
    return { shouldOpenHabit: false };
  }

  if (action === Notifications.DEFAULT_ACTION_IDENTIFIER) {
    markHandled(response);
    return { shouldOpenHabit: true, habitId };
  }

  markHandled(response);
  return { shouldOpenHabit: false };
}
