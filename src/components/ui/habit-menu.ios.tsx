import { router } from 'expo-router';
import { useHabitStore } from '@/stores/habit-store';
import { Host, Menu, ContextMenu, Button, Divider, RNHostView } from '@expo/ui/swift-ui';
import React, { isValidElement, cloneElement, useState } from 'react';
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

  const trigger = isValidElement(children) && !isIcon
    ? cloneElement(children as React.ReactElement<any>, {
        onPress: () => router.push(`/habit/${habitId}` as any),
      })
    : children;

  return (
    <>
      {isIcon ? (
        <Host matchContents>
          <Menu
            label={<RNHostView matchContents>{trigger as any}</RNHostView>}
          >
            <Button label="Edit Habit" systemImage="pencil" onPress={() => router.push(`/add-habit?id=${habitId}` as any)} />
            <Divider />
            <Button label="Delete Habit" role="destructive" systemImage="trash" onPress={() => setDialogVisible(true)} />
          </Menu>
        </Host>
      ) : (
        <Host matchContents>
          <ContextMenu>
            <ContextMenu.Items>
              <Button label="Edit Habit" systemImage="pencil" onPress={() => router.push(`/add-habit?id=${habitId}` as any)} />
              <Button label="Delete Habit" role="destructive" systemImage="trash" onPress={() => setDialogVisible(true)} />
            </ContextMenu.Items>
            <ContextMenu.Trigger>
              <RNHostView matchContents>{trigger as any}</RNHostView>
            </ContextMenu.Trigger>
          </ContextMenu>
        </Host>
      )}

      <ConfirmDialog
        visible={dialogVisible}
        title="Delete Habit"
        message="Are you sure you want to delete this habit? This cannot be undone."
        confirmLabel="Delete"
        confirmDestructive
        onConfirm={handleDelete}
        cancelLabel="Cancel"
        onDismiss={() => setDialogVisible(false)}
      />
    </>
  );
}
