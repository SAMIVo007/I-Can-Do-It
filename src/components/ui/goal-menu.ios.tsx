import { router } from 'expo-router';
import { useHabitStore } from '@/stores/habit-store';
import { Host, Menu, Button, Divider, RNHostView } from '@expo/ui/swift-ui';
import React, { isValidElement, cloneElement, useState } from 'react';
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
    router.back();
  };
  const handleMove = async () => {
    await deleteGoal(goalId, 'reassign');
    router.back();
  };

  const trigger = isValidElement(children) && !isIcon
    ? cloneElement(children as React.ReactElement<any>, { onPress: undefined, onLongPress: undefined })
    : children;

  return (
    <>
      <Host matchContents>
        <Menu
          label={<RNHostView matchContents>{trigger as any}</RNHostView>}
          onPrimaryAction={isIcon ? undefined : () => router.push(`/goal/${goalId}` as any)}
        >
          <Button label="Edit Goal" systemImage="pencil" onPress={() => router.push(`/add-goal?id=${goalId}` as any)} />
          <Divider />
          <Button label="Delete Goal" role="destructive" systemImage="trash" onPress={() => setDialogVisible(true)} />
        </Menu>
      </Host>

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
