/**
 * NativeTextInput (iOS / web).
 *
 * Used only by screens rendered inside a native bottom-sheet host. On iOS/web
 * there's no Compose RNHostView tap issue, so we reuse the nice animated RN
 * field. Android overrides this with a Jetpack Compose field
 * (native-text-input.android.tsx).
 */

export { TextInput as NativeTextInput } from "./text-input";
