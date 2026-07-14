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
import React, { useEffect, useRef, useState } from "react";

export interface NativeBottomSheetProps {
  isOpen: boolean;
  onClosed: () => void;
  children: React.ReactNode;
  /** iOS-only presentation detent; ignored on Android. */
  height?: number;
}

export function NativeBottomSheet({
  isOpen,
  onClosed,
  children,
}: NativeBottomSheetProps) {
  const [mounted, setMounted] = useState(isOpen);
  const sheetRef = useRef<ModalBottomSheetRef>(null);

  useEffect(() => {
    if (isOpen && !mounted) {
      setMounted(true);
    } else if (!isOpen && mounted) {
      sheetRef.current?.hide().then(() => {
        setMounted(false);
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
          <RNHostView matchContents>{children as any}</RNHostView>
        </ModalBottomSheet>
      )}
    </Host>
  );
}
