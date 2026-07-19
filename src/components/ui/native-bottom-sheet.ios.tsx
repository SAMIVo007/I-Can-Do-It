import { Colors } from "@/constants/theme";
import { BottomSheet, Group, Host, RNHostView } from "@expo/ui/swift-ui";
import {
  presentationBackground,
  presentationDragIndicator,
  presentationDetents,
} from "@expo/ui/swift-ui/modifiers";
import React from "react";
import { Dimensions } from "react-native";
import {
  KeyboardAwareScrollView,
  type KeyboardAwareScrollViewProps,
} from "react-native-keyboard-controller";

export interface NativeBottomSheetProps {
  isOpen: boolean;
  onClosed: () => void;
  children: React.ReactNode;
  height?: number;
}

/** Android-only; iOS stub returns undefined (SwiftUI sheet handles sizing). */
export function useBottomSheetMaxHeight(): number | undefined {
  return undefined;
}

export function BottomSheetScrollView(props: KeyboardAwareScrollViewProps) {
  return (
    <KeyboardAwareScrollView
      keyboardShouldPersistTaps="handled"
      bottomOffset={24}
      showsVerticalScrollIndicator={false}
      {...props}
    />
  );
}

export function NativeBottomSheet({
  isOpen,
  onClosed,
  children,
  height,
}: NativeBottomSheetProps) {
  const screenHeight = Dimensions.get("window").height;

  return (
    <Host style={{ flex: 1 }}>
      <BottomSheet
        isPresented={isOpen}
        onIsPresentedChange={(val) => {
          if (!val) onClosed();
        }}
      >
        <Group
          modifiers={[
            presentationDetents(
              height
                ? [{ height: Math.min(height, screenHeight * 0.9) }]
                : ["medium", "large"],
            ),
            presentationBackground(Colors.background as string),
            presentationDragIndicator("visible"),
          ]}
        >
          <RNHostView>{children as any}</RNHostView>
        </Group>
      </BottomSheet>
    </Host>
  );
}
