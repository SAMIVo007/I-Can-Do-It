import React from 'react';
import { Alert } from 'react-native';
import { router } from 'expo-router';
import { useHabitStore } from '@/stores/habit-store';
import { Host, Menu, Button, Divider, RNHostView } from '@expo/ui/swift-ui';
import React, { isValidElement, cloneElement } from 'react';

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

  const trigger = isValidElement(children) && !isIcon
    ? cloneElement(children as React.ReactElement<any>, { onPress: undefined, onLongPress: undefined })
    : children;

  return (
    <Host matchContents>
      <Menu
        label={<RNHostView matchContents>{trigger}</RNHostView>}
        onPrimaryAction={isIcon ? undefined : () => router.push(`/habit/${habitId}` as any)}
      >
        <Button label="Edit Habit" systemImage="pencil" onPress={() => router.push(`/add-habit?id=${habitId}` as any)} />
        <Divider />
        <Button label="Delete Habit" role="destructive" systemImage="trash" onPress={handleDelete} />
      </Menu>
    </Host>
  );
}
