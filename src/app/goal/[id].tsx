/**
 * Goal Detail — full-screen dashboard for a single goal.
 * Renders OVER the tabs (registered in root _layout, outside the tabs group).
 *
 * Layout:
 *   1. Header — back · "Goal" · 3-dot GoalMenu (Edit / Delete)
 *   2. Hero — emoji + title + focus, today's ring on its own row, streak strip
 *   3. Stat tiles — 30-day rate · check-ins · best streak (goal-scoped)
 *   4. This Week — 7-day completion rings (goal-scoped)
 *   5. Last 30 Days — bar chart (goal-scoped)
 *   6. Habits — functional HabitCards (toggle / increment), like Today
 */

import { GOAL_COLORS } from "@/app/add-goal";
import { BarChart } from "@/components/ui/bar-chart";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { GoalMenu } from "@/components/ui/goal-menu";
import { HabitCard } from "@/components/ui/habit-card";
import { HabitMenu } from "@/components/ui/habit-menu";
import { NativeCircularProgress } from "@/components/ui/native-progress";
import { StatCard } from "@/components/ui/stat-card";
import { Body, Heading } from "@/components/ui/typography";
import { WeekCircles } from "@/components/ui/week-circles";
import { Radii, Spacing } from "@/constants/theme";
import { useAppColors } from "@/hooks/use-app-colors";
import { useHabitStore } from "@/stores/habit-store";
import type { DaySummary, MonthlyBar } from "@/types/models";
import { isHabitComplete } from "@/types/models";
import { getCurrentWeekDates, getDayLabel, toDateKey } from "@/utils/date";
import * as Haptics from "expo-haptics";
import { triggerHaptic } from "@/utils/haptics";
import { router, useLocalSearchParams } from "expo-router";
import { SymbolView } from "expo-symbols";
import React, { useMemo } from "react";
import { Pressable, ScrollView, View, type ViewStyle } from "react-native";
import Animated, {
  FadeInDown,
  LinearTransition,
} from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const DEFAULT_GOAL_COLOR = GOAL_COLORS[0];

export default function GoalDetailScreen() {
  const Colors = useAppColors();
  const insets = useSafeAreaInsets();
  const { id } = useLocalSearchParams<{ id: string }>();
  const today = toDateKey();

  const goals = useHabitStore((s) => s.goals);
  const allHabits = useHabitStore((s) => s.habits);
  const logs = useHabitStore((s) => s.logs);
  const toggleHabit = useHabitStore((s) => s.toggleHabit);
  const updateProgress = useHabitStore((s) => s.updateProgress);

  const goal = goals.find((g) => g.id === id);
  const goalHabits = useMemo(
    () => allHabits.filter((h) => h.goalId === id && h.isActive),
    [allHabits, id],
  );

  // ── Today's completion ────────────────────────────────────────
  const completedToday = useMemo(
    () =>
      goalHabits.filter((h) => {
        const log = logs.find((l) => l.habitId === h.id && l.date === today);
        return isHabitComplete(h, log);
      }).length,
    [goalHabits, logs, today],
  );
  const todayProgress =
    goalHabits.length > 0 ? completedToday / goalHabits.length : 0;

  // ── Helper: were ALL goal habits complete on a given date key? ──
  const allDoneOn = useMemo(() => {
    return (dateKey: string) => {
      if (goalHabits.length === 0) return false;
      return goalHabits.every((h) => {
        const log = logs.find((l) => l.habitId === h.id && l.date === dateKey);
        return isHabitComplete(h, log);
      });
    };
  }, [goalHabits, logs]);

  // ── Current streak (goal-scoped) ──────────────────────────────
  const currentStreak = useMemo(() => {
    if (goalHabits.length === 0) return 0;
    let streak = 0;
    const date = new Date();
    for (let i = 0; i < 365; i++) {
      const dk = toDateKey(date);
      if (allDoneOn(dk)) {
        streak++;
      } else if (i > 0) {
        break;
      }
      date.setDate(date.getDate() - 1);
    }
    return streak;
  }, [goalHabits, allDoneOn]);

  // ── Best streak (goal-scoped, last 365 days) ──────────────────
  const bestStreak = useMemo(() => {
    if (goalHabits.length === 0) return 0;
    let best = 0;
    let run = 0;
    const date = new Date();
    for (let i = 0; i < 365; i++) {
      const dk = toDateKey(date);
      if (allDoneOn(dk)) {
        run++;
        if (run > best) best = run;
      } else {
        run = 0;
      }
      date.setDate(date.getDate() - 1);
    }
    return best;
  }, [goalHabits, allDoneOn]);

  // ── 30-day completion rate (avg daily fraction) ───────────────
  const thirtyDayRate = useMemo(() => {
    if (goalHabits.length === 0) return 0;
    let sum = 0;
    const date = new Date();
    for (let i = 0; i < 30; i++) {
      const dk = toDateKey(date);
      const done = goalHabits.filter((h) => {
        const log = logs.find((l) => l.habitId === h.id && l.date === dk);
        return isHabitComplete(h, log);
      }).length;
      sum += done / goalHabits.length;
      date.setDate(date.getDate() - 1);
    }
    return Math.round((sum / 30) * 100);
  }, [goalHabits, logs]);

  // ── Total check-ins (completed logs, all time) ────────────────
  const checkIns = useMemo(() => {
    const goalHabitIds = new Set(goalHabits.map((h) => h.id));
    return logs.filter((l) => {
      if (!goalHabitIds.has(l.habitId)) return false;
      const h = goalHabits.find((gh) => gh.id === l.habitId);
      return h ? isHabitComplete(h, l) : false;
    }).length;
  }, [goalHabits, logs]);

  // ── This week summary (goal-scoped) ───────────────────────────
  const weekSummary = useMemo((): DaySummary[] => {
    const weekDates = getCurrentWeekDates();
    return weekDates.map((d) => {
      const dk = toDateKey(d);
      const isFuture = dk > today;
      let completionRate = 0;
      if (!isFuture && goalHabits.length > 0) {
        const done = goalHabits.filter((h) => {
          const log = logs.find((l) => l.habitId === h.id && l.date === dk);
          return isHabitComplete(h, log);
        }).length;
        completionRate = done / goalHabits.length;
      }
      return {
        date: dk,
        dayLabel: getDayLabel(d),
        completionRate,
        isToday: dk === today,
        isFuture,
      };
    });
  }, [goalHabits, logs, today]);

  // ── Last 30 days bar chart (goal-scoped) ──────────────────────
  const monthlyData = useMemo((): MonthlyBar[] => {
    const bars: MonthlyBar[] = [];
    const date = new Date();
    date.setDate(date.getDate() - 29);
    for (let i = 0; i < 30; i++) {
      const dk = toDateKey(date);
      const done = goalHabits.filter((h) => {
        const log = logs.find((l) => l.habitId === h.id && l.date === dk);
        return isHabitComplete(h, log);
      }).length;
      bars.push({
        day: date.getDate(),
        habitsCompleted: done,
        totalHabits: goalHabits.length,
        isToday: dk === today,
      });
      date.setDate(date.getDate() + 1);
    }
    return bars;
  }, [goalHabits, logs, today]);

  // ── Handlers (functional habit toggles) ───────────────────────
  const getLogForHabit = (habitId: string) =>
    logs.find((l) => l.habitId === habitId && l.date === today);

  const handleToggle = async (habitId: string) => {
    if (process.env.EXPO_OS === "ios") {
      triggerHaptic(Haptics.ImpactFeedbackStyle.Light);
    }
    await toggleHabit(habitId, today);
  };

  const handleIncrement = async (habitId: string, amount: number) => {
    if (process.env.EXPO_OS === "ios") {
      triggerHaptic(Haptics.ImpactFeedbackStyle.Light);
    }
    const log = getLogForHabit(habitId);
    await updateProgress(habitId, today, (log?.value ?? 0) + amount);
  };

  // ── Not found ─────────────────────────────────────────────────
  if (!goal) {
    return (
      <View
        style={{
          flex: 1,
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: Colors.background,
          gap: Spacing.lg,
        }}
      >
        <Body secondary>Goal not found.</Body>
        <Button
          title="Go back"
          variant="outlined"
          onPress={() => router.back()}
        />
      </View>
    );
  }

  const goalColor = goal.color ?? DEFAULT_GOAL_COLOR;
  const goalEmoji = goal.emoji ?? "🎯";

  return (
    <View style={{ flex: 1, backgroundColor: Colors.background }}>
      {/* ── Header (mirrors Habit Detail) ──────────────────────── */}
      <View
        style={{
          paddingTop: insets.top + 16,
          paddingHorizontal: Spacing.xl,
          paddingBottom: Spacing.md,
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
          backgroundColor: Colors.background,
        }}
      >
        <Pressable
          onPress={() => router.back()}
          hitSlop={20}
          android_ripple={{
            borderless: true,
            color: Colors.border,
            radius: 20,
            foreground: true,
          }}
        >
          <SymbolView
            name={{
              ios: "chevron.left",
              android: "arrow_back",
              web: "arrow_back",
            }}
            size={24}
            tintColor={Colors.textPrimary}
            fallback={
              <Body style={{ color: Colors.textPrimary, fontSize: 18 }}>←</Body>
            }
          />
        </Pressable>

        <Body
          style={{
            flex: 1,
            textAlign: "left",
            paddingHorizontal: 16,
            fontSize: 20,
            fontWeight: "medium",
          }}
        >
          Goal Details
        </Body>

        <GoalMenu goalId={goal.id} isIcon>
          <SymbolView
            name={{
              ios: "ellipsis.circle",
              android: "more_vert",
              web: "more_horiz",
            }}
            size={24}
            tintColor={Colors.textPrimary}
            fallback={
              <Body style={{ color: Colors.textPrimary, fontSize: 20 }}>⋮</Body>
            }
          />
        </GoalMenu>
      </View>

      <Animated.ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          padding: Spacing.xl,
          paddingTop: Spacing.sm,
          paddingBottom: Spacing.xxxl * 2,
          gap: Spacing.xl,
        }}
      >
        {/* ── Hero ──────────────────────────────────────────── */}
        {/* Plain View: Compose progress Host must not sit under Reanimated entering. */}
        <View>
          <Card
            variant="filled"
            padding="lg"
            style={{
              backgroundColor: goalColor + "14",
              borderWidth: 1,
              borderColor: goalColor + "33",
            }}
          >
            <View style={{ gap: Spacing.lg }}>
              {/* Row 1: badge + title/subtitle (title free to wrap) */}
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  gap: Spacing.lg,
                }}
              >
                <View
                  style={{
                    width: 60,
                    height: 60,
                    borderRadius: Radii.lg,
                    backgroundColor: Colors.surface,
                    borderWidth: 1.5,
                    borderColor: goalColor,
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0,
                  }}
                >
                  <Body style={{ fontSize: 30 }}>{goalEmoji}</Body>
                </View>
                <View style={{ flex: 1, gap: Spacing.xs }}>
                  <Heading size="lg">{goal.title}</Heading>
                  <View
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                      gap: Spacing.xs,
                    }}
                  >
                    <View
                      style={{
                        width: 7,
                        height: 7,
                        borderRadius: 4,
                        backgroundColor: goalColor,
                      }}
                    />
                    <Body size="sm" secondary>
                      {goal.focusArea} · {goalHabits.length} habit
                      {goalHabits.length !== 1 ? "s" : ""}
                    </Body>
                  </View>
                </View>
              </View>

              {/* Row 2: today's ring + label (own row — no clash with long titles) */}
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  gap: Spacing.lg,
                  backgroundColor: Colors.background,
                  borderRadius: Radii.md,
                  padding: Spacing.md,
                }}
              >
                <NativeCircularProgress
                  progress={todayProgress}
                  size={54}
                  strokeWidth={5}
                  color={todayProgress >= 1 ? Colors.success : goalColor}
                  labelSize="sm"
                />

                <View style={{ flex: 1, gap: 2 }}>
                  <Body weight="bold" size="md">
                    {goalHabits.length === 0
                      ? "No habits yet"
                      : todayProgress >= 1
                        ? "All done today! 🎉"
                        : `${completedToday} of ${goalHabits.length} done today`}
                  </Body>
                  <Body size="sm" secondary>
                    {goalHabits.length === 0
                      ? "Add habits below to start tracking."
                      : "Today's progress for this goal"}
                  </Body>
                </View>
              </View>

              {/* Row 3: streak strip */}
              {currentStreak > 0 && (
                <View
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    gap: Spacing.sm,
                    backgroundColor: Colors.white,
                    borderRadius: Radii.md,
                    paddingVertical: Spacing.md,
                    paddingHorizontal: Spacing.lg,
                  }}
                >
                  <Body style={{ fontSize: 16 }}>🔥</Body>
                  <Body size="sm">
                    <Body size="sm" weight="bold" style={{ color: goalColor }}>
                      {currentStreak}-day
                    </Body>{" "}
                    streak on this goal
                  </Body>
                </View>
              )}
            </View>
          </Card>
        </View>

        {/* ── Stat tiles ────────────────────────────────────── */}
        <Animated.View entering={FadeInDown.duration(400).delay(80)}>
          <View
            style={
              { flexDirection: "row", gap: Spacing.md } satisfies ViewStyle
            }
          >
            <StatCard
              label="30-Day Rate"
              value={`${thirtyDayRate}%`}
              color={goalColor}
            />
            <StatCard label="Check-ins" value={checkIns} color={goalColor} />
            <StatCard
              label="Best Streak"
              value={bestStreak}
              unit="d"
              color={goalColor}
            />
          </View>
        </Animated.View>

        {/* ── This Week ─────────────────────────────────────── */}
        <Animated.View entering={FadeInDown.duration(400).delay(160)}>
          <Card variant="filled" padding="lg">
            <View style={{ gap: Spacing.lg }}>
              <View style={{ gap: Spacing.xs }}>
                <Body weight="bold" size="lg">
                  This Week
                </Body>
                <Body size="xs" secondary>
                  Days you completed every habit in this goal
                </Body>
              </View>
              <WeekCircles days={weekSummary} />
            </View>
          </Card>
        </Animated.View>

        {/* ── Last 30 Days ──────────────────────────────────── */}
        <Animated.View entering={FadeInDown.duration(400).delay(240)}>
          <Card variant="filled" padding="lg">
            <View style={{ gap: Spacing.lg }}>
              <View style={{ gap: Spacing.xs }}>
                <Body weight="bold" size="lg">
                  Last 30 Days
                </Body>
                <Body size="xs" secondary>
                  Habits completed each day for this goal
                </Body>
              </View>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                <BarChart data={monthlyData} />
              </ScrollView>
            </View>
          </Card>
        </Animated.View>

        {/* ── Habits ────────────────────────────────────────── */}
        <Animated.View
          entering={FadeInDown.duration(400).delay(320)}
          style={{ gap: Spacing.md }}
        >
          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <Body
              weight="bold"
              size="sm"
              style={{
                textTransform: "uppercase",
                letterSpacing: 1,
                color: Colors.textSecondary,
              }}
            >
              Habits · {goalHabits.length}
            </Body>
            <Button
              title="+ Add Habit"
              variant="ghost"
              size="sm"
              onPress={() =>
                router.push({
                  pathname: "/add-habit",
                  params: { goalId: goal.id },
                } as any)
              }
            />
          </View>

          {goalHabits.length === 0 ? (
            <Card variant="bordered" padding="lg">
              <View
                style={{
                  alignItems: "center",
                  gap: Spacing.lg,
                  paddingVertical: Spacing.lg,
                }}
              >
                <Body style={{ fontSize: 36 }}>🌱</Body>
                <Body secondary style={{ textAlign: "center" }}>
                  No habits linked to this goal yet.{"\n"}Add your first daily
                  action to start making progress.
                </Body>
                <Button
                  title="Add First Habit"
                  onPress={() =>
                    router.push({
                      pathname: "/add-habit",
                      params: { goalId: goal.id },
                    } as any)
                  }
                />
              </View>
            </Card>
          ) : (
            <View style={{ gap: Spacing.md }}>
              {goalHabits.map((habit, index) => (
                <Animated.View
                  key={habit.id}
                  entering={FadeInDown.duration(300).delay(360 + index * 50)}
                  layout={LinearTransition.springify()}
                >
                  <HabitMenu habitId={habit.id}>
                    <HabitCard
                      habit={habit}
                      log={getLogForHabit(habit.id)}
                      categoryLabel={goal.focusArea}
                      onToggle={() => handleToggle(habit.id)}
                      onIncrement={(amount) =>
                        handleIncrement(habit.id, amount)
                      }
                    />
                  </HabitMenu>
                </Animated.View>
              ))}
            </View>
          )}
        </Animated.View>
      </Animated.ScrollView>
    </View>
  );
}
