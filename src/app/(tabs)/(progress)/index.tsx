/**
 * Progress — Analytics screen.
 *
 * Layout:
 *   1. Header — title + subtitle
 *   2. Today's Score — hero circular progress (native on Android)
 *   3. Stats Row — streak + productive days
 *   4. This Week — 7-day completion circles
 *   5. Habit Breakdown — per-habit linear progress bars
 *   6. Monthly Overview — bar chart with chevron month navigator
 */

import { BarChart } from "@/components/ui/bar-chart";
import { Card } from "@/components/ui/card";
import {
	NativeLinearProgress
} from "@/components/ui/native-progress";
import { StatCard } from "@/components/ui/stat-card";
import { Body, Heading } from "@/components/ui/typography";
import { WeekCircles } from "@/components/ui/week-circles";
import { YearlyHeatmap } from "@/components/ui/yearly-heatmap";
import { Spacing } from "@/constants/theme";
import { useAppColors } from "@/hooks/use-app-colors";
import { useHabitStore } from "@/stores/habit-store";
import type { DaySummary, MonthlyBar } from "@/types/models";
import {
	getCurrentWeekDates,
	getDayLabel,
	getDaysInMonth,
	getShortMonthName,
	toDateKey,
} from "@/utils/date";
import { useMemo, useState } from "react";
import { Pressable, ScrollView, View, type ViewStyle } from "react-native";
import Animated, { FadeInDown } from "react-native-reanimated";
import Svg, { Path } from "react-native-svg";

// ─── Month names for the navigator ────────────────────────────

const MONTH_NAMES = [
	"January",
	"February",
	"March",
	"April",
	"May",
	"June",
	"July",
	"August",
	"September",
	"October",
	"November",
	"December",
] as const;

export default function ProgressScreen() {
	const Colors = useAppColors();
	const now = new Date();
	const [selectedMonth, setSelectedMonth] = useState(now.getMonth());
	const [selectedYear, setSelectedYear] = useState(now.getFullYear());

	const habits = useHabitStore((s) => s.habits);
	const logs = useHabitStore((s) => s.logs);

	const activeHabits = useMemo(
		() => habits.filter((h) => h.isActive),
		[habits],
	);
	const today = toDateKey();

	// ─── Today's completion rate ────────────────────────────────

	const todayCompletion = useMemo(() => {
		if (activeHabits.length === 0) return { rate: 0, completed: 0, total: 0 };
		const completed = activeHabits.filter((h) => {
			const log = logs.find((l) => l.habitId === h.id && l.date === today);
			if (!log) return false;
			if (h.type === "boolean") return log.value === 1;
			return log.value >= (h.target ?? 1);
		}).length;
		return {
			rate: completed / activeHabits.length,
			completed,
			total: activeHabits.length,
		};
	}, [activeHabits, logs, today]);

	// ─── Current streak ────────────────────────────────────────

	const streak = useMemo(() => {
		if (activeHabits.length === 0) return 0;
		let s = 0;
		const date = new Date();
		for (let i = 0; i < 365; i++) {
			const dk = toDateKey(date);
			const allDone = activeHabits.every((h) => {
				const log = logs.find((l) => l.habitId === h.id && l.date === dk);
				if (!log) return false;
				if (h.type === "boolean") return log.value === 1;
				return log.value >= (h.target ?? 1);
			});
			if (allDone) {
				s++;
			} else if (i > 0) {
				break;
			}
			date.setDate(date.getDate() - 1);
		}
		return s;
	}, [activeHabits, logs]);

	// ─── Productive days (≥50% completion) ─────────────────────

	const productiveDays = useMemo(() => {
		if (activeHabits.length === 0) return 0;
		const dateSet = new Set(logs.map((l) => l.date));
		let count = 0;
		for (const dk of dateSet) {
			const completed = activeHabits.filter((h) => {
				const log = logs.find((l) => l.habitId === h.id && l.date === dk);
				if (!log) return false;
				if (h.type === "boolean") return log.value === 1;
				return log.value >= (h.target ?? 1);
			}).length;
			if (completed / activeHabits.length >= 0.5) {
				count++;
			}
		}
		return count;
	}, [activeHabits, logs]);

	// ─── This week summary ─────────────────────────────────────

	const weekSummary = useMemo((): DaySummary[] => {
		const weekDates = getCurrentWeekDates();
		return weekDates.map((d) => {
			const dk = toDateKey(d);
			const isFuture = dk > today;
			let completionRate = 0;
			if (!isFuture && activeHabits.length > 0) {
				const completed = activeHabits.filter((h) => {
					const log = logs.find((l) => l.habitId === h.id && l.date === dk);
					if (!log) return false;
					if (h.type === "boolean") return log.value === 1;
					return log.value >= (h.target ?? 1);
				}).length;
				completionRate = completed / activeHabits.length;
			}
			return {
				date: dk,
				dayLabel: getDayLabel(d),
				completionRate,
				isToday: dk === today,
				isFuture,
			};
		});
	}, [activeHabits, logs, today]);

	// ─── Per-habit breakdown for today ──────────────────────────

	const habitBreakdown = useMemo(() => {
		return activeHabits.map((h) => {
			const log = logs.find((l) => l.habitId === h.id && l.date === today);
			let progress = 0;
			if (log) {
				if (h.type === "boolean") {
					progress = log.value;
				} else {
					progress = Math.min(log.value / (h.target ?? 1), 1);
				}
			}
			return {
				id: h.id,
				title: h.title,
				progress,
				isComplete: h.type === "boolean" ? log?.value === 1 : log ? log.value >= (h.target ?? 1) : false,
				detail:
					h.type === "quantitative"
						? `${log?.value ?? 0} / ${h.target ?? "?"} ${h.unit ?? ""}`
						: progress >= 1
							? "Done"
							: "Not done",
			};
		});
	}, [activeHabits, logs, today]);

	// ─── Monthly data ──────────────────────────────────────────

	const monthlyData = useMemo((): MonthlyBar[] => {
		const days = getDaysInMonth(selectedMonth, selectedYear);
		const bars: MonthlyBar[] = [];
		for (let day = 1; day <= days; day++) {
			const dk = `${selectedYear}-${String(selectedMonth + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
			const completed = activeHabits.filter((h) => {
				const log = logs.find((l) => l.habitId === h.id && l.date === dk);
				if (!log) return false;
				if (h.type === "boolean") return log.value === 1;
				return log.value >= (h.target ?? 1);
			}).length;
			bars.push({
				day,
				habitsCompleted: completed,
				totalHabits: activeHabits.length,
				isToday: dk === today,
			});
		}
		return bars;
	}, [activeHabits, logs, selectedMonth, selectedYear, today]);

	const monthlyRate = useMemo(() => {
		const daysWithHabits = monthlyData.filter((d) => d.totalHabits > 0);
		if (daysWithHabits.length === 0) return 0;
		return Math.round(
			(daysWithHabits.filter((d) => d.habitsCompleted >= d.totalHabits)
				.length /
				daysWithHabits.length) *
			100,
		);
	}, [monthlyData]);

	// ─── Month navigation ──────────────────────────────────────

	const goToPrevMonth = () => {
		if (selectedMonth === 0) {
			setSelectedMonth(11);
			setSelectedYear((y) => y - 1);
		} else {
			setSelectedMonth((m) => m - 1);
		}
	};

	const goToNextMonth = () => {
		// Don't go past current month
		if (
			selectedMonth === now.getMonth() &&
			selectedYear === now.getFullYear()
		)
			return;
		if (selectedMonth === 11) {
			setSelectedMonth(0);
			setSelectedYear((y) => y + 1);
		} else {
			setSelectedMonth((m) => m + 1);
		}
	};

	const isCurrentMonth =
		selectedMonth === now.getMonth() && selectedYear === now.getFullYear();

	return (
		<ScrollView
			contentInsetAdjustmentBehavior="automatic"
			showsVerticalScrollIndicator={false}
			contentContainerStyle={{
				padding: Spacing.xl,
				paddingBottom: Spacing.xxxl * 2,
				paddingTop: Spacing.xxxl,
				gap: Spacing.xl,
			}}
			style={{ backgroundColor: Colors.background }}
		>
			{/* ── Header ──────────────────────────────────────────── */}
			<Animated.View
				entering={FadeInDown.duration(400)}
				style={{ gap: Spacing.xs }}
			>
				<Heading size="xl">Analytics</Heading>
				<Body secondary>Track your consistency and build momentum.</Body>
			</Animated.View>

			{/* ── Stats Row ────────────────────────────────────── */}
			<Animated.View entering={FadeInDown.duration(400).delay(100)}>
				<View
					style={{ flexDirection: "row", gap: Spacing.md } satisfies ViewStyle}
				>
					<StatCard
						label="Current Streak"
						value={streak}
						unit="days"
						icon={
							<Svg width={16} height={16} viewBox="0 0 24 24" fill="none">
								<Path
									d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"
									fill={Colors.accent}
								/>
							</Svg>
						}
					/>
					<StatCard
						label="Productive Days"
						value={productiveDays}
						unit="days"
						icon={
							<Svg width={16} height={16} viewBox="0 0 24 24" fill="none">
								<Path
									d="M12 2a10 10 0 100 20 10 10 0 000-20z"
									stroke={Colors.success}
									strokeWidth={2}
								/>
								<Path
									d="M9 12l2 2 4-4"
									stroke={Colors.success}
									strokeWidth={2}
									strokeLinecap="round"
									strokeLinejoin="round"
								/>
							</Svg>
						}
					/>
				</View>
			</Animated.View>

		
			{/* ── This Week ────────────────────────────────────── */}
			<Animated.View entering={FadeInDown.duration(400).delay(300)}>
				<Card variant="filled" padding="lg">
					<View style={{ gap: Spacing.lg }}>
						<Body weight="bold" size="lg">
							This Week
						</Body>
						<WeekCircles days={weekSummary} />
					</View>
				</Card>
			</Animated.View>

			{/* ── Monthly Overview ─────────────────────────────── */}
			<Animated.View entering={FadeInDown.duration(400).delay(500)}>
				<Card variant="filled" padding="lg">
					<View style={{ gap: Spacing.lg }}>
						{/* Header with month navigator */}
						<View
							style={{
								flexDirection: "row",
								justifyContent: "space-between",
								alignItems: "center",
							}}
						>
							<View style={{ gap: Spacing.xs }}>
								<Body weight="bold" size="lg">
									Monthly Overview
								</Body>
								<Body size="xs" secondary>
									{monthlyRate}% completion rate
								</Body>
							</View>

							{/* Chevron-based month navigator */}
							<View
								style={{
									flexDirection: "row",
									alignItems: "center",
									gap: Spacing.sm,
								}}
							>
								<Pressable
									onPress={goToPrevMonth}
									hitSlop={12}
									style={{
										padding: Spacing.xs,
									}}
								>
									<Svg
										width={18}
										height={18}
										viewBox="0 0 24 24"
										fill="none"
									>
										<Path
											d="M15 18l-6-6 6-6"
											stroke={Colors.textPrimary}
											strokeWidth={2}
											strokeLinecap="round"
											strokeLinejoin="round"
										/>
									</Svg>
								</Pressable>
								<Body size="sm" weight="medium" style={{ minWidth: 60, textAlign: "center" }}>
									{getShortMonthName(selectedMonth)}{" "}
									{selectedYear !== now.getFullYear()
										? `'${String(selectedYear).slice(2)}`
										: ""}
								</Body>
								<Pressable
									onPress={goToNextMonth}
									hitSlop={12}
									style={{
										padding: Spacing.xs,
										opacity: isCurrentMonth ? 0.3 : 1,
									}}
									disabled={isCurrentMonth}
								>
									<Svg
										width={18}
										height={18}
										viewBox="0 0 24 24"
										fill="none"
									>
										<Path
											d="M9 18l6-6-6-6"
											stroke={Colors.textPrimary}
											strokeWidth={2}
											strokeLinecap="round"
											strokeLinejoin="round"
										/>
									</Svg>
								</Pressable>
							</View>
						</View>

						<ScrollView horizontal showsHorizontalScrollIndicator={false}>
							<BarChart data={monthlyData} />
						</ScrollView>
					</View>
				</Card>
			</Animated.View>

			{/* ── Yearly Overview ─────────────────────────────── */}
			<Animated.View entering={FadeInDown.duration(400).delay(200)}>
				<Card variant="filled" padding="lg">
					<View style={{ gap: Spacing.lg }}>
						<View style={{ gap: Spacing.xs }}>
							<Body weight="bold" size="lg">
								Year in Review
							</Body>
							<Body size="xs" secondary>
								Your habit consistency over the last 365 days
							</Body>
						</View>
						<YearlyHeatmap habits={habits} logs={logs} />
					</View>
				</Card>
			</Animated.View>
			
			{/* ── Daily Habit Breakdown ───────────────────────────────── */}
			{habitBreakdown.length > 0 && (
				<Animated.View entering={FadeInDown.duration(400).delay(400)}>
					<Card variant="filled" padding="lg">
						<View style={{ gap: Spacing.lg }}>
							<View style={{ gap: Spacing.xs }}>
								<Body weight="bold" size="lg">
									Today's Breakdown
								</Body>
								<Body size="xs" secondary>
									Progress for each habit today
								</Body>
							</View>
							{habitBreakdown.map((habit) => (
								<View key={habit.id} style={{ gap: Spacing.sm }}>
									<View
										style={{
											flexDirection: "row",
											justifyContent: "space-between",
											alignItems: "center",
										}}
									>
										<Body
											size="sm"
											weight="medium"
											numberOfLines={1}
											style={{ flex: 1, marginRight: Spacing.md }}
										>
											{habit.title}
										</Body>
										<Body
											size="xs"
											secondary
											style={
												habit.isComplete ? { color: Colors.success } : undefined
											}
										>
											{habit.detail}
										</Body>
									</View>
									<NativeLinearProgress
										progress={habit.progress}
										height={6}
										color={habit.isComplete ? Colors.success : Colors.accent}
									/>
								</View>
							))}
						</View>
					</Card>
				</Animated.View>
			)}

		
		</ScrollView>
	);
}
