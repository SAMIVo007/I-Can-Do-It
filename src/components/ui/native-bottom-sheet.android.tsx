import type { ModalBottomSheetRef } from "@expo/ui/jetpack-compose";
import {
  Box,
  Column,
  Host,
  ModalBottomSheet,
  RNHostView,
} from "@expo/ui/jetpack-compose";
import {
  background,
  clip,
  fillMaxWidth,
  height,
  padding,
  Shapes,
  width,
} from "@expo/ui/jetpack-compose/modifiers";
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { useWindowDimensions, View, type ViewStyle } from "react-native";
import {
  KeyboardAwareScrollView,
  useKeyboardState,
  type KeyboardAwareScrollViewProps,
} from "react-native-keyboard-controller";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export interface NativeBottomSheetProps {
  isOpen: boolean;
  onClosed: () => void;
  children: React.ReactNode;
  /** iOS-only presentation detent; ignored on Android. */
  height?: number;
}

/** Approx. height of the Compose drag-handle slot (padding + pill). */
const HANDLE_HEIGHT = 30;

/**
 * Placeholder body height before the first content-size measurement.
 * Kept intentionally mid-range so the sheet doesn't flash full-screen.
 */
const INITIAL_BODY_ESTIMATE = 360;

type SheetLayoutContextValue = {
  maxBodyHeight: number;
  reportContentHeight: (height: number) => void;
};

const SheetLayoutContext = createContext<SheetLayoutContextValue | null>(null);

export function useBottomSheetMaxHeight(): number | undefined {
  return useContext(SheetLayoutContext)?.maxBodyHeight;
}

/**
 * ScrollView for content inside {@link NativeBottomSheet}.
 * Reports its content height so the sheet can size to content (capped), and
 * scrolls when the keyboard eats the remaining space.
 */
export function BottomSheetScrollView({
  style,
  contentContainerStyle,
  onContentSizeChange,
  ...props
}: KeyboardAwareScrollViewProps) {
  const layout = useContext(SheetLayoutContext);

  return (
    <KeyboardAwareScrollView
      nestedScrollEnabled
      keyboardShouldPersistTaps="handled"
      bottomOffset={24}
      style={[{ flex: 1, width: "100%" } as ViewStyle, style]}
      contentContainerStyle={contentContainerStyle}
      showsVerticalScrollIndicator={false}
      onContentSizeChange={(w, h) => {
        layout?.reportContentHeight(h);
        onContentSizeChange?.(w, h);
      }}
      {...props}
    />
  );
}

export function NativeBottomSheet({
  isOpen,
  onClosed,
  children,
}: NativeBottomSheetProps) {
  const [mounted, setMounted] = useState(isOpen);
  const sheetRef = useRef<ModalBottomSheetRef>(null);
  const [contentHeight, setContentHeight] = useState(0);

  const { height: windowHeight } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const keyboardHeight = useKeyboardState((s) => (s.isVisible ? s.height : 0));

  // Space available for the body (below handle), never past the top edge /
  // keyboard. Without matchContents, ModalBottomSheet would otherwise expand
  // to full screen — we drive height explicitly instead.
  const maxBodyHeight = Math.max(
    180,
    windowHeight - insets.top - keyboardHeight - HANDLE_HEIGHT,
  );

  const bodyHeight = Math.min(
    contentHeight > 0 ? contentHeight : INITIAL_BODY_ESTIMATE,
    maxBodyHeight,
  );

  const reportContentHeight = useCallback((h: number) => {
    setContentHeight((prev) => (prev === h ? prev : h));
  }, []);

  useEffect(() => {
    if (isOpen && !mounted) {
      setContentHeight(0);
      setMounted(true);
    } else if (!isOpen && mounted) {
      sheetRef.current?.hide().then(() => {
        setMounted(false);
        setContentHeight(0);
        onClosed();
      });
    }
  }, [isOpen]);

  return (
    <Host matchContents>
      {mounted && (
        <ModalBottomSheet
          ref={sheetRef}
          onDismissRequest={() => {
            setMounted(false);
            setContentHeight(0);
            onClosed();
          }}
          skipPartiallyExpanded={true}
        >
          <ModalBottomSheet.DragHandle>
            <Column
              horizontalAlignment="center"
              modifiers={[fillMaxWidth(), padding(0, 12, 0, 12)]}
            >
              <Box
                modifiers={[
                  width(54),
                  height(6),
                  clip(Shapes.Circle),
                  background("#777777ff"),
                ]}
              />
            </Column>
          </ModalBottomSheet.DragHandle>
          <SheetLayoutContext.Provider
            value={{ maxBodyHeight, reportContentHeight }}
          >
            {/*
              No matchContents: that mode ignores keyboard/screen caps and
              overflows the top. Explicit Column height = min(content, max)
              keeps short sheets compact and tall/keyboard sheets scrollable.
              flexGrow:1 + height:0 lets the ScrollView fill the Column without
              inheriting unbounded content height (expo community sheet pattern).
            */}
            <Column modifiers={[fillMaxWidth(), height(bodyHeight)]}>
              <RNHostView>
                <View style={{ flexGrow: 1, height: 0, width: "100%" }}>
                  {children}
                </View>
              </RNHostView>
            </Column>
          </SheetLayoutContext.Provider>
        </ModalBottomSheet>
      )}
    </Host>
  );
}
