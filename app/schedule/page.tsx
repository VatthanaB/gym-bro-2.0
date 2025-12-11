"use client";

export const dynamic = "force-dynamic";

import { useState, useMemo, useCallback } from "react";
import { ChevronLeft, ChevronRight, Calendar, RotateCcw } from "lucide-react";
import { WeekView } from "@/components/week-view";
import { WorkoutCard } from "@/components/workout-card";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  useWorkoutTemplates,
  useWorkoutLogs,
  useExercises,
  useUserWorkoutCustomizations,
  getWeekStart,
} from "@/lib/hooks/use-supabase";

// Get a date offset by a number of weeks from today
function getWeekStartOffset(weeksOffset: number): string {
  const date = new Date();
  date.setDate(date.getDate() + weeksOffset * 7);
  return getWeekStart(date);
}

// Format week range for display
function formatWeekRange(weekStart: string): string {
  const start = new Date(weekStart + "T00:00:00");
  const end = new Date(start);
  end.setDate(end.getDate() + 6);

  const startMonth = start.toLocaleDateString("en-US", { month: "short" });
  const endMonth = end.toLocaleDateString("en-US", { month: "short" });
  const startDay = start.getDate();
  const endDay = end.getDate();

  if (startMonth === endMonth) {
    return `${startMonth} ${startDay} - ${endDay}`;
  }
  return `${startMonth} ${startDay} - ${endMonth} ${endDay}`;
}

// Get week label
function getWeekLabel(weekStart: string): string {
  const currentWeekStart = getWeekStart(new Date());
  const nextWeekStart = getWeekStartOffset(1);
  const lastWeekStart = getWeekStartOffset(-1);

  if (weekStart === currentWeekStart) return "This Week";
  if (weekStart === nextWeekStart) return "Next Week";
  if (weekStart === lastWeekStart) return "Last Week";

  // Calculate how many weeks ago/ahead
  const diff =
    (new Date(weekStart).getTime() - new Date(currentWeekStart).getTime()) /
    (7 * 24 * 60 * 60 * 1000);
  if (diff > 0)
    return `${Math.round(diff)} week${Math.round(diff) > 1 ? "s" : ""} ahead`;
  return `${Math.abs(Math.round(diff))} week${
    Math.abs(Math.round(diff)) > 1 ? "s" : ""
  } ago`;
}

export default function SchedulePage() {
  const [selectedDay, setSelectedDay] = useState(new Date().getDay());
  const [weekOffset, setWeekOffset] = useState(0); // 0 = current week, -1 = last week, 1 = next week

  const selectedWeekStart = useMemo(
    () => getWeekStartOffset(weekOffset),
    [weekOffset]
  );

  const {
    templates: weeklySchedule,
    getWorkoutByDay,
    isLoaded: templatesLoaded,
  } = useWorkoutTemplates();
  const { logs, deleteLog, isLoaded: logsLoaded } = useWorkoutLogs();
  const { exercises: allExercises, isLoaded: exercisesLoaded } = useExercises();
  const {
    swapExercise,
    addExercise,
    removeAddedExercise,
    resetDayCustomizations,
    getCustomizedWorkout,
    hasCustomizations,
    isLoaded: customizationsLoaded,
  } = useUserWorkoutCustomizations(selectedWeekStart);

  const isLoaded =
    templatesLoaded && logsLoaded && exercisesLoaded && customizationsLoaded;

  // Calculate week boundaries
  const weekStartDate = new Date(selectedWeekStart + "T00:00:00");
  const weekEndDate = new Date(weekStartDate);
  weekEndDate.setDate(weekEndDate.getDate() + 6);
  const weekEndStr = weekEndDate.toISOString().split("T")[0];

  // Get completed days for selected week
  const completedDays = useMemo(() => {
    const completed = new Set<number>();
    if (isLoaded) {
      logs
        .filter(
          (log) =>
            log.date >= selectedWeekStart &&
            log.date <= weekEndStr &&
            log.completed
        )
        .forEach((log) => completed.add(log.dayOfWeek));
    }
    return completed;
  }, [logs, selectedWeekStart, weekEndStr, isLoaded]);

  // Get the date string for a specific day of week in the selected week
  const getDateForDayOfWeek = useCallback(
    (dayOfWeek: number): string => {
      // Parse the week start date manually to avoid timezone issues
      const [year, month, day] = selectedWeekStart.split("-").map(Number);
      const start = new Date(year, month - 1, day); // month is 0-indexed in Date constructor
      start.setDate(start.getDate() + dayOfWeek);
      // Format manually to avoid toISOString() timezone conversion
      const y = start.getFullYear();
      const m = String(start.getMonth() + 1).padStart(2, "0");
      const d = String(start.getDate()).padStart(2, "0");
      return `${y}-${m}-${d}`;
    },
    [selectedWeekStart]
  );

  // Get the log for a specific day in the selected week
  const getLogForDay = useCallback(
    (dayOfWeek: number) => {
      const dateStr = getDateForDayOfWeek(dayOfWeek);
      return logs.find((log) => log.date === dateStr && log.completed);
    },
    [logs, getDateForDayOfWeek]
  );

  // Check if selected day is completed
  const selectedDayLog = useMemo(
    () => getLogForDay(selectedDay),
    [getLogForDay, selectedDay]
  );
  const isSelectedDayCompleted = !!selectedDayLog;

  // Handle reverting a completed workout
  const handleRevertCompletion = useCallback(async () => {
    if (selectedDayLog) {
      await deleteLog(selectedDayLog.id);
    }
  }, [selectedDayLog, deleteLog]);

  // Get the workout template for selected day
  const selectedWorkoutTemplate = getWorkoutByDay(selectedDay);

  // Apply customizations to get the actual workout
  const selectedWorkout = useMemo(() => {
    if (!selectedWorkoutTemplate) return null;
    return getCustomizedWorkout(selectedWorkoutTemplate, allExercises);
  }, [selectedWorkoutTemplate, getCustomizedWorkout, allExercises]);

  // Handlers for customization
  const handleSwapExercise = (originalId: string, replacementId: string) => {
    swapExercise(selectedDay, originalId, replacementId);
  };

  const handleAddExercise = (exerciseId: string) => {
    addExercise(selectedDay, exerciseId);
  };

  const handleRemoveAddedExercise = (exerciseId: string) => {
    removeAddedExercise(selectedDay, exerciseId);
  };

  const handleResetCustomizations = () => {
    resetDayCustomizations(selectedDay);
  };

  // Navigation
  const goToPrevWeek = () => setWeekOffset(weekOffset - 1);
  const goToNextWeek = () => setWeekOffset(weekOffset + 1);
  const goToCurrentWeek = () => setWeekOffset(0);

  // Determine if we're looking at a future, current, or past week
  const isCurrentWeek = weekOffset === 0;
  const isFutureWeek = weekOffset > 0;
  const isPastWeek = weekOffset < 0;

  // Can only edit current and next week
  const canEdit = weekOffset >= 0 && weekOffset <= 1;

  // Today info for highlighting
  const today = new Date();
  const todayDayOfWeek = today.getDay();
  const isViewingCurrentWeek = isCurrentWeek;

  if (!isLoaded) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="px-4 pt-6">
      {/* Header with Week Navigation */}
      <header className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <h1 className="text-3xl font-bold tracking-tight text-foreground">
            Weekly Schedule
          </h1>
          {!isCurrentWeek && (
            <Button
              variant="ghost"
              size="sm"
              onClick={goToCurrentWeek}
              className="gap-1.5 text-primary"
            >
              <Calendar className="h-4 w-4" />
              Today
            </Button>
          )}
        </div>

        {/* Week Navigator */}
        <div className="flex items-center justify-between mt-4 p-3 rounded-xl bg-secondary/50">
          <button
            onClick={goToPrevWeek}
            className="flex h-9 w-9 items-center justify-center rounded-lg hover:bg-secondary transition-colors"
          >
            <ChevronLeft className="h-5 w-5 text-muted-foreground" />
          </button>

          <div className="text-center">
            <p
              className={cn(
                "text-sm font-semibold",
                isCurrentWeek
                  ? "text-primary"
                  : isPastWeek
                  ? "text-muted-foreground"
                  : "text-foreground"
              )}
            >
              {getWeekLabel(selectedWeekStart)}
            </p>
            <p className="text-xs text-muted-foreground">
              {formatWeekRange(selectedWeekStart)}
            </p>
          </div>

          <button
            onClick={goToNextWeek}
            disabled={weekOffset >= 1}
            className={cn(
              "flex h-9 w-9 items-center justify-center rounded-lg transition-colors",
              weekOffset >= 1
                ? "text-muted-foreground/30 cursor-not-allowed"
                : "hover:bg-secondary text-muted-foreground"
            )}
          >
            <ChevronRight className="h-5 w-5" />
          </button>
        </div>

        {isPastWeek && (
          <p className="mt-2 text-xs text-muted-foreground text-center">
            Viewing past week (read-only)
          </p>
        )}
        {isFutureWeek && (
          <p className="mt-2 text-xs text-primary text-center">
            Planning next week&apos;s workouts
          </p>
        )}
      </header>

      {/* Week View */}
      <section className="mb-6">
        <WeekView
          schedule={weeklySchedule}
          completedDays={completedDays}
          selectedDay={selectedDay}
          onSelectDay={setSelectedDay}
        />
      </section>

      {/* Selected Day Workout */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-foreground">
            {selectedWorkout?.dayName}&apos;s Workout
          </h2>
          <div className="flex items-center gap-2">
            {isSelectedDayCompleted && (
              <span className="rounded-full bg-success/10 px-2.5 py-1 text-[10px] font-semibold text-success">
                COMPLETED
              </span>
            )}
            {isViewingCurrentWeek && selectedDay === todayDayOfWeek && (
              <span className="rounded-full bg-primary px-2.5 py-1 text-[10px] font-semibold text-primary-foreground">
                TODAY
              </span>
            )}
          </div>
        </div>

        {/* Revert Completion Button */}
        {isSelectedDayCompleted && (
          <div className="mb-4 rounded-xl bg-success/5 border border-success/20 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-foreground">
                  Workout Completed
                </p>
                <p className="text-xs text-muted-foreground">
                  Logged on{" "}
                  {new Date(
                    selectedDayLog.date + "T00:00:00"
                  ).toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                  })}
                </p>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={handleRevertCompletion}
                className="gap-1.5 text-destructive border-destructive/30 hover:bg-destructive/10"
              >
                <RotateCcw className="h-3.5 w-3.5" />
                Mark Incomplete
              </Button>
            </div>
          </div>
        )}

        {selectedWorkout && (
          <WorkoutCard
            workout={selectedWorkout}
            allExercises={allExercises}
            hasCustomizations={hasCustomizations(selectedDay)}
            onSwapExercise={canEdit ? handleSwapExercise : undefined}
            onAddExercise={canEdit ? handleAddExercise : undefined}
            onRemoveAddedExercise={
              canEdit ? handleRemoveAddedExercise : undefined
            }
            onResetCustomizations={
              canEdit ? handleResetCustomizations : undefined
            }
            editable={canEdit}
          />
        )}
      </section>

      {/* Week Overview */}
      <section className="mt-8">
        <h2 className="mb-4 text-lg font-semibold text-foreground">
          {isCurrentWeek
            ? "This Week"
            : isFutureWeek
            ? "Next Week"
            : "That Week"}{" "}
          at a Glance
        </h2>
        <div className="space-y-3 pb-8">
          {[1, 2, 3, 4, 5, 6, 0].map((dayOfWeek) => {
            const template = weeklySchedule.find(
              (w) => w.dayOfWeek === dayOfWeek
            );
            if (!template) return null;

            const customizedWorkout = getCustomizedWorkout(
              template,
              allExercises
            );
            const isToday =
              isViewingCurrentWeek && dayOfWeek === todayDayOfWeek;
            const isCompleted = completedDays.has(dayOfWeek);
            const isCustomized = hasCustomizations(dayOfWeek);

            return (
              <button
                key={dayOfWeek}
                onClick={() => setSelectedDay(dayOfWeek)}
                className={cn(
                  "w-full rounded-2xl border p-4 text-left transition-all",
                  selectedDay === dayOfWeek
                    ? "border-primary bg-primary/5"
                    : "border-border bg-card hover:border-primary/20"
                )}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-foreground">
                        {template.dayName}
                      </span>
                      {isToday && (
                        <span className="rounded-full bg-primary px-2 py-0.5 text-[10px] font-medium text-primary-foreground">
                          TODAY
                        </span>
                      )}
                      {isCompleted && (
                        <span className="rounded-full bg-success/10 px-2 py-0.5 text-[10px] font-medium text-success">
                          DONE
                        </span>
                      )}
                      {isCustomized && (
                        <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-medium text-primary">
                          CUSTOM
                        </span>
                      )}
                    </div>
                    <p className="mt-0.5 text-sm text-muted-foreground capitalize">
                      {template.type === "rest"
                        ? "Rest & Recovery"
                        : `${template.type} Body`}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-foreground">
                      {customizedWorkout.exercises.length || 0} exercises
                    </p>
                    {template.cardio && (
                      <p className="text-xs text-muted-foreground">
                        + {template.cardio.durationMinutes} min cardio
                      </p>
                    )}
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </section>
    </div>
  );
}
