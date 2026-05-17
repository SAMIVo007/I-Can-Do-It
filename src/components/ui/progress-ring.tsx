/**
 * ProgressRing — SVG circular progress indicator.
 * Thin, clean, solid-color lines per Slate & Sage visualization rules.
 * Animated with Reanimated v4.
 */

import { DataText } from "@/components/ui/typography";
import { Colors } from "@/constants/theme";
import React, { useEffect } from "react";
import { View, type ViewStyle } from "react-native";
import Animated, {
	useAnimatedProps,
	useSharedValue,
	withTiming,
} from "react-native-reanimated";
import Svg, { Circle } from "react-native-svg";

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

interface ProgressRingProps {
	/** 0.0 – 1.0 */
	progress: number;
	size?: number;
	strokeWidth?: number;
	color?: string;
	trackColor?: string;
	showLabel?: boolean;
	labelSize?: "sm" | "md" | "lg" | "xl";
	children?: React.ReactNode;
}

export function ProgressRing({
	progress,
	size = 80,
	strokeWidth = 6,
	color = Colors.accent,
	trackColor = Colors.border,
	showLabel = true,
	labelSize = "md",
	children,
}: ProgressRingProps) {
	const radius = (size - strokeWidth) / 2;
	const circumference = 2 * Math.PI * radius;
	const animatedProgress = useSharedValue(0);

	useEffect(() => {
		animatedProgress.value = withTiming(progress, { duration: 800 });
	}, [progress]);

	const animatedProps = useAnimatedProps(() => ({
		strokeDashoffset: circumference * (1 - animatedProgress.value),
	}));

	const center = size / 2;
	const percentage = Math.floor(progress * 100);

	return (
		<View
			style={
				{
					width: size,
					height: size,
					alignItems: "center",
					justifyContent: "center",
				} satisfies ViewStyle
			}
		>
			<Svg width={size} height={size} style={{ position: "absolute" }}>
				{/* Background track */}
				<Circle
					cx={center}
					cy={center}
					r={radius}
					stroke={trackColor}
					strokeWidth={strokeWidth}
					fill="none"
				/>
				{/* Progress arc */}
				<AnimatedCircle
					cx={center}
					cy={center}
					r={radius}
					stroke={color}
					strokeWidth={strokeWidth}
					fill="none"
					strokeDasharray={circumference}
					animatedProps={animatedProps}
					strokeLinecap="round"
					transform={`rotate(-90 ${center} ${center})`}
				/>
			</Svg>
			{/* Center content */}
			{children ? (
				children
			) : showLabel ? (
				<DataText size={labelSize} style={{ textTransform: "none" }}>
					{percentage}%
				</DataText>
			) : null}
		</View>
	);
}
