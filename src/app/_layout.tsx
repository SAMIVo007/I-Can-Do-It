/**
 * Root layout — loads fonts, hydrates stores, gates onboarding vs. tabs.
 */

import { Colors } from "@/constants/theme";
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
import { useColorScheme } from "react-native";

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

	useEffect(() => {
		hydrate();
	}, [hydrate]);

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
		<ThemeProvider value={SlateTheme}>
			<Stack screenOptions={{ headerShown: false }}>
				<Stack.Screen
					name="(onboarding)"
					options={{
						presentation: "modal",
						animation: "slide_from_bottom",
					}}
				/>
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
					name="habit/[id]"
					options={{
						headerShown: true,
						title: "Habit Details",
						headerStyle: { backgroundColor: Colors.background as string },
						headerShadowVisible: false,
						headerTintColor: Colors.accent as string,
					}}
				/>
				<Stack.Screen name="+not-found" />
			</Stack>
		</ThemeProvider>
	);
}
