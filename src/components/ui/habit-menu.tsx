import React, { useState } from 'react';
import { Pressable, View } from 'react-native';
import { router } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { triggerHaptic } from '@/utils/haptics';
import { useHabitStore } from '@/stores/habit-store';
import { ConfirmDialog } from './confirm-dialog';

export interface HabitMenuProps {
  habitId: string;
  children: React.ReactNode;
  isIcon?: boolean;
}

export function HabitMenu({ habitId, children, isIcon }: HabitMenuProps) {
  const [dialogVisible, setDialogVisible] = useState(false);
  const deleteHabit = useHabitStore((s) => s.deleteHabit);

  const handleDelete = async () => {
    await deleteHabit(habitId);
    if (router.canGoBack()) {
      router.back();
    }
  };

  const openMenu = () => {
    triggerHaptic(Haptics.ImpactFeedbackStyle.Medium);
    setDialogVisible(true);
  };

  return (
    <>
      {isIcon ? (
        <Pressable onPress={openMenu}>
          <View pointerEvents="none">{children}</View>
        </Pressable>
      ) : React.isValidElement(children) ? (
        React.cloneElement(children as React.ReactElement<any>, {
          onPress: () => router.push(`/habit/${habitId}` as any),
          onLongPress: openMenu,
        })
      ) : (
        <>{children}</>
      )}

      <ConfirmDialog
        visible={dialogVisible}
        title="Habit Options"
        message="What would you like to do?"
        confirmLabel="Delete Habit"
        confirmDestructive
        onConfirm={handleDelete}
        secondaryLabel="Edit Habit"
        onSecondary={() => router.push(`/add-habit?id=${habitId}` as any)}
        cancelLabel="Cancel"
        onDismiss={() => setDialogVisible(false)}
      />
    </>
  );
}
