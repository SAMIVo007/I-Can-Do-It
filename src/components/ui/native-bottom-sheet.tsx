import React, { useEffect, useState } from "react";
import { Modal, Pressable, StyleSheet, View } from "react-native";
import {
  KeyboardAwareScrollView,
  type KeyboardAwareScrollViewProps,
} from "react-native-keyboard-controller";

export interface NativeBottomSheetProps {
  isOpen: boolean;
  onClosed: () => void;
  children: React.ReactNode;
  /** iOS-only presentation detent; ignored on Android/web. */
  height?: number;
}

/** Android-only; web stub returns undefined. */
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
}: NativeBottomSheetProps) {
  const [visible, setVisible] = useState(isOpen);

  useEffect(() => {
    setVisible(isOpen);
  }, [isOpen]);

  const handleClose = () => {
    setVisible(false);
    // Add a slight delay to allow the slide down animation to complete before unmounting the route
    setTimeout(() => {
      onClosed();
    }, 300);
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      onRequestClose={handleClose}
    >
      <View style={styles.overlay}>
        <Pressable style={StyleSheet.absoluteFill} onPress={handleClose} />
        <View style={styles.sheetContent}>{children}</View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: "flex-end",
    backgroundColor: "rgba(0,0,0,0.4)",
  },
  sheetContent: {
    backgroundColor: "white",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    overflow: "hidden",
    // Max height to behave somewhat like a bottom sheet
    maxHeight: "90%",
  },
});
