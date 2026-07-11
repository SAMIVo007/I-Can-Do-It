import { useAppColors } from "@/hooks/use-app-colors";
import Stack from "expo-router/stack";

export default function GoalsLayout() {
	const Colors = useAppColors();
	return (
		<Stack
			screenOptions={{
				headerShown: false,
				headerStyle: { backgroundColor: Colors.background },
				headerShadowVisible: false,
				headerTintColor: Colors.accent,
				contentStyle: { backgroundColor: Colors.background },
			}}
		>
			<Stack.Screen name="index" options={{ title: "Goals" }} />
		</Stack>
	);
}

