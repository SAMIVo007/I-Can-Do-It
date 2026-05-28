import { BottomSheet, Group, Host, RNHostView } from '@expo/ui/swift-ui';
import { presentationDetents, presentationDragIndicator } from '@expo/ui/swift-ui/modifiers';
import React from 'react';

export interface NativeBottomSheetProps {
  isOpen: boolean;
  onClosed: () => void;
  children: React.ReactNode;
}

export function NativeBottomSheet({ isOpen, onClosed, children }: NativeBottomSheetProps) {
  return (
    <Host style={{ flex: 1 }}>
      <BottomSheet 
        isPresented={isOpen} 
        onIsPresentedChange={(val) => {
          if (!val) onClosed();
        }}
      >
        <Group modifiers={[
          presentationDetents(['medium', 'large']),
          presentationDragIndicator('visible')
        ]}>
          <RNHostView matchContents>
            {children as any}
          </RNHostView>
        </Group>
      </BottomSheet>
    </Host>
  );
}
