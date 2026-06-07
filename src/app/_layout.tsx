/**
 * Root layout — loads fonts, hydrates stores, gates onboarding vs. tabs.
 */

import { Colors } from "@/constants/theme";
import { useStorage } from "@/hooks/use-storage";
import { useHabitStore } from "@/stores/habit-store";
import {
	Newsreader_400Regular,
	Newsreader_400Regular_Italic,
	Newsreader_500Medium,
	Newsreader_700Bold,
	useFonts,
} from "@expo-google-fonts/newsreader";
import {
	SpaceGrotesk_300Light,
	SpaceGrotesk_400Regular,
	SpaceGrotesk_500Medium,
	SpaceGrotesk_700Bold,
} from "@expo-google-fonts/space-grotesk";
import { DefaultTheme, ThemeProvider } from "expo-router";
import { Stack } from "expo-router/stack";
import * as SplashScreen from "expo-splash-screen";
import { useCallback, useEffect } from "react";
import { useColorScheme, Appearance } from "react-native";
import { KeyboardProvider } from "react-native-keyboard-controller";

SplashScreen.preventAutoHideAsync();

/** Custom theme to match Slate & Sage — strictly light mode */
const SlateTheme = {
	...DefaultTheme,
	colors: {
		...DefaultTheme.colors,
		background: Colors.background as string,
		card: Colors.background as string,
		text: Colors.textPrimary as string,
		border: Colors.border as string,
		primary: Colors.accent as string,
	},
};

export default function RootLayout() {
	useColorScheme();

	const [fontsLoaded] = useFonts({
		Newsreader_400Regular,
		Newsreader_500Medium,
		Newsreader_700Bold,
		Newsreader_400Regular_Italic,
		SpaceGrotesk_300Light,
		SpaceGrotesk_400Regular,
		SpaceGrotesk_500Medium,
		SpaceGrotesk_700Bold,
	});

	const hydrate = useHabitStore((s) => s.hydrate);
	const isHydrated = useHabitStore((s) => s.isHydrated);

	// Routing between onboarding and the main app is handled declaratively
	// via <Stack.Protected> guards below — no imperative redirect needed.
	const [hasOnboarded] = useStorage("hasOnboarded", false);
	const [appTheme] = useStorage<"system" | "light" | "dark">("appTheme", "system");

	useEffect(() => {
		hydrate();
	}, [hydrate]);

	useEffect(() => {
		if (appTheme === "system") {
			Appearance.setColorScheme("unspecified");
		} else {
			Appearance.setColorScheme(appTheme);
		}
	}, [appTheme]);

	const onLayoutReady = useCallback(async () => {
		if (fontsLoaded && isHydrated) {
			await SplashScreen.hideAsync();
		}
	}, [fontsLoaded, isHydrated]);

	useEffect(() => {
		onLayoutReady();
	}, [onLayoutReady]);

	if (!fontsLoaded || !isHydrated) {
		return null;
	}

	return (
		<KeyboardProvider>
			<ThemeProvider value={SlateTheme}>
				<Stack screenOptions={{ headerShown: false }}>

					{/* Un-onboarded users: only the onboarding flow exists, so the
					    app opens straight into it and seeds the first goal + habits. */}
					<Stack.Protected guard={!hasOnboarded}>
						<Stack.Screen
							name="(onboarding)"
							options={{
								presentation: "modal",
								animation: "slide_from_bottom",
							}}
						/>
					</Stack.Protected>

					{/* Onboarded users: the main app. Guarded so a fresh user can never
					    land here with an empty database. */}
					<Stack.Protected guard={hasOnboarded}>
						<Stack.Screen name="(tabs)" />
						<Stack.Screen
							name="add-habit"
							options={{
								presentation: "transparentModal",
								animation: "none",
								headerShown: false,
								title: "Add Habit",
								contentStyle: { backgroundColor: "transparent" },
								headerStyle: { backgroundColor: Colors.background as string },
								headerShadowVisible: false,
								headerTintColor: Colors.accent as string,
							}}
						/>
						<Stack.Screen
							name="add-goal"
							options={{
								presentation: "transparentModal",
								animation: "none",
								headerShown: false,
								title: "Add Goal",
								contentStyle: { backgroundColor: "transparent" },
							}}
						/>
						<Stack.Screen
							name="habit/[id]"
							options={{
								headerShown: false,
								title: "Habit Details",
								headerStyle: { backgroundColor: Colors.background as string },
								headerShadowVisible: false,
								headerTintColor: Colors.textPrimary as string,
							}}
						/>
						<Stack.Screen
							name="goal/[id]"
							options={{
								headerShown: false,
								title: "Goal Details",
								headerStyle: { backgroundColor: Colors.background as string },
								headerShadowVisible: false,
								headerTintColor: Colors.textPrimary as string,
							}}
						/>
					</Stack.Protected>

					<Stack.Screen name="+not-found" />
				</Stack>
			</ThemeProvider>
		</KeyboardProvider>
	);
}
