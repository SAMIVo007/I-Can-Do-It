import React, { isValidElement, cloneElement, useState } from 'react';
import { ActionSheetIOS, Platform, Pressable, View } from 'react-native';
import { router } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { useHabitStore } from '@/stores/habit-store';
import { ConfirmDialog } from './confirm-dialog';

export interface GoalMenuProps {
  goalId: string;
  children: React.ReactNode;
  isIcon?: boolean;
}

export function GoalMenu({ goalId, children, isIcon }: GoalMenuProps) {
  const [dialogVisible, setDialogVisible] = useState(false);
  const deleteGoal = useHabitStore((s) => s.deleteGoal);
  const goal = useHabitStore((s) => s.goals.find((g) => g.id === goalId));
  const habitCount = useHabitStore(
    (s) => s.habits.filter((h) => h.goalId === goalId && h.isActive).length
  );

  const handleCascade = async () => {
    await deleteGoal(goalId, 'cascade');
    if (router.canGoBack()) {
      router.back();
    }
  };
  const handleMove = async () => {
    await deleteGoal(goalId, 'reassign');
    if (router.canGoBack()) {
      router.back();
    }
  };

  const showOptions = () => {
    if (Platform.OS === 'ios') {
      ActionSheetIOS.showActionSheetWithOptions(
        { options: ['Cancel', 'Edit Goal', 'Delete Goal'], cancelButtonIndex: 0, destructiveButtonIndex: 2 },
        (idx) => {
          if (idx === 1) router.push(`/add-goal?id=${goalId}` as any);
          if (idx === 2) setDialogVisible(true);
        }
      );
    } else {
      // Non-iOS fallback: jump straight to the confirm dialog's host actions.
      setDialogVisible(true);
    }
  };

  const triggerOptions = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    showOptions();
  };

  return (
    <>
      {isIcon ? (
        <Pressable onPress={triggerOptions}>
          <View pointerEvents="none">{children}</View>
        </Pressable>
      ) : isValidElement(children) ? (
        cloneElement(children as React.ReactElement<any>, {
          onPress: () => router.push(`/goal/${goalId}` as any),
          onLongPress: triggerOptions,
        })
      ) : (
        <>{children}</>
      )}

      <ConfirmDialog
        visible={dialogVisible}
        title={`Delete "${goal?.title ?? 'this goal'}"?`}
        message={
          habitCount > 0
            ? `This goal has ${habitCount} habit${habitCount !== 1 ? 's' : ''} with their streaks and history. Choose what to do with them.`
            : 'This goal will be permanently deleted.'
        }
        confirmLabel={habitCount > 0 ? 'Delete habits too' : 'Delete'}
        confirmDestructive
        onConfirm={handleCascade}
        secondaryLabel={habitCount > 0 ? 'Move to Daily' : undefined}
        onSecondary={habitCount > 0 ? handleMove : undefined}
        cancelLabel="Cancel"
        onDismiss={() => setDialogVisible(false)}
      />
    </>
  );
}
