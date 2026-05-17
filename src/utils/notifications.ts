/**
 * Local push notification helpers using expo-notifications.
 */

import * as Notifications from 'expo-notifications';
import type { Habit } from '@/types/models';

// Configure how notifications appear when app is in foreground
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

/** Request notification permissions. Returns true if granted. */
export async function requestNotificationPermissions(): Promise<boolean> {
  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  if (existingStatus === 'granted') return true;

  const { status } = await Notifications.requestPermissionsAsync();
  return status === 'granted';
}

/** Schedule a daily repeating notification for a habit */
export async function scheduleHabitReminder(habit: Habit): Promise<string | null> {
  if (!habit.reminderEnabled || !habit.reminderTime) return null;

  const [hours, minutes] = habit.reminderTime.split(':').map(Number);

  const id = await Notifications.scheduleNotificationAsync({
    content: {
      title: `Time for: ${habit.title}`,
      body: getMotivationalBody(habit),
      data: { habitId: habit.id },
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.DAILY,
      hour: hours,
      minute: minutes,
    },
  });

  return id;
}

/** Cancel a scheduled notification by its identifier */
export async function cancelHabitReminder(notificationId: string): Promise<void> {
  await Notifications.cancelScheduledNotificationAsync(notificationId);
}

/** Cancel all scheduled notifications */
export async function cancelAllReminders(): Promise<void> {
  await Notifications.cancelAllScheduledNotificationsAsync();
}

function getMotivationalBody(habit: Habit): string {
  const messages = [
    'Small steps lead to big results. You got this!',
    'Consistency is the key to progress. Keep it going!',
    'Every day counts. Make this one matter!',
    "You're building something amazing, one habit at a time.",
    "Don't break the chain! Your streak depends on it.",
  ];
  // Deterministic pick based on habit id to avoid random changes
  const index = habit.id.charCodeAt(0) % messages.length;
  return messages[index];
}
