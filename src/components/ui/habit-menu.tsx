import React, { isValidElement, cloneElement } from 'react';
import { ActionSheetIOS, Alert, Platform, Pressable, View } from 'react-native';
import { router } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { useHabitStore } from '@/stores/habit-store';

export interface HabitMenuProps {
  habitId: string;
  children: React.ReactNode;
  isIcon?: boolean;
}

export function HabitMenu({ habitId, children, isIcon }: HabitMenuProps) {
  const deleteHabit = useHabitStore((s) => s.deleteHabit);

  const handleDelete = () => {
    Alert.alert("Delete Habit", "Are you sure you want to delete this habit? This cannot be undone.", [
      { text: "Cancel", style: "cancel" },
      { text: "Delete", style: "destructive", onPress: () => { deleteHabit(habitId); router.back(); } }
    ]);
  };

  const showOptions = () => {
    if (Platform.OS === 'ios') {
      ActionSheetIOS.showActionSheetWithOptions(
        { options: ['Cancel', 'Edit Habit', 'Delete Habit'], cancelButtonIndex: 0, destructiveButtonIndex: 2 },
        (idx) => {
          if (idx === 1) router.push(`/add-habit?id=${habitId}` as any);
          if (idx === 2) handleDelete();
        }
      );
    } else {
      Alert.alert('Habit Options', 'What would you like to do?', [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Edit Habit', onPress: () => router.push(`/add-habit?id=${habitId}` as any) },
        { text: 'Delete Habit', style: 'destructive', onPress: handleDelete }
      ]);
    }
  };

  const triggerOptions = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    showOptions();
  };

  return isIcon ? (
    <Pressable onPress={triggerOptions}>
      <View pointerEvents="none">
        {children}
      </View>
    </Pressable>
  ) : isValidElement(children) ? (
    cloneElement(children as React.ReactElement<any>, {
      onPress: () => router.push(`/habit/${habitId}` as any),
      onLongPress: triggerOptions,
    })
  ) : (
    <>{children}</>
  );
}
