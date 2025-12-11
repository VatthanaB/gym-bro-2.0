"use client";

export const dynamic = "force-dynamic";

import {
  CheckCircle2,
  Circle,
  Activity,
  Target,
  Calendar,
  LogOut,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { WorkoutCard } from "@/components/workout-card";
import {
  useWorkoutLogs,
  useUserProfile,
  useWeightHistory,
  useWorkoutTemplates,
  useAuth,
} from "@/lib/hooks/use-supabase";
import type { WorkoutLog, ExerciseLog, SetLog } from "@/lib/types";

function formatDate(date: Date): string {
  return date.toLocaleDateString("en-NZ", {
    weekday: "long",
    month: "long",
    day: "numeric",
  });
}

function getWeekNumber(startDate: string): number {
  const start = new Date(startDate);
  const now = new Date();
  const diffTime = Math.abs(now.getTime() - start.getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return Math.ceil(diffDays / 7) || 1;
}

export default function DashboardPage() {
  const { user, signOut } = useAuth();
  const {
    logs,
    addLog,
    updateLog,
    getTodayLog,
    isLoaded: logsLoaded,
  } = useWorkoutLogs();
  const { profile, isLoaded: profileLoaded } = useUserProfile();
  const { getLatestWeight, isLoaded: weightLoaded } = useWeightHistory();
  const { getTodaysWorkout, isLoaded: templatesLoaded } = useWorkoutTemplates();

  const todaysWorkout = getTodaysWorkout();
  const today = new Date();
  const todayStr = today.toISOString().split("T")[0];

  const isLoaded =
    logsLoaded && profileLoaded && weightLoaded && templatesLoaded;

  // Get or create today's log
  const todayLog = getTodayLog();

  // Calculate this week's completed sessions
  const startOfWeek = new Date(today);
  startOfWeek.setDate(today.getDate() - today.getDay());
  const weekStartStr = startOfWeek.toISOString().split("T")[0];

  const completedThisWeek = logs.filter(
    (log) => log.date >= weekStartStr && log.completed
  ).length;

  const latestWeight = getLatestWeight();
  const weekNumber = profile?.startDate ? getWeekNumber(profile.startDate) : 1;

  const handleStartWorkout = () => {
    if (todayLog || !todaysWorkout) return;

    const newLog: WorkoutLog = {
      id: crypto.randomUUID(),
      date: todayStr,
      dayOfWeek: today.getDay(),
      type: todaysWorkout.type,
      exercises: todaysWorkout.exercises.map(
        (ex): ExerciseLog => ({
          exerciseId: ex.id,
          name: ex.name,
          sets: Array.from(
            { length: ex.sets },
            (): SetLog => ({
              reps: 0,
              weight: ex.startingWeight || 0,
              completed: false,
            })
          ),
        })
      ),
      cardio: todaysWorkout.cardio
        ? {
            type: todaysWorkout.cardio.type,
            durationMinutes: todaysWorkout.cardio.durationMinutes,
            completed: false,
          }
        : undefined,
      completed: false,
    };
    addLog(newLog);
  };

  const handleCompleteWorkout = () => {
    if (!todayLog) return;
    updateLog(todayLog.id, { completed: true });
  };

  if (!isLoaded) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="px-4 pt-6">
      {/* Header */}
      <header className="mb-6">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-sm font-medium text-muted-foreground">
              {formatDate(today)}
            </p>
            <h1 className="mt-1 text-3xl font-bold tracking-tight text-foreground">
              {todaysWorkout?.type === "rest" ? "Rest Day" : "Today's Workout"}
            </h1>
          </div>
          {user && (
            <Button
              variant="ghost"
              size="sm"
              onClick={signOut}
              className="gap-2 text-muted-foreground"
            >
              <LogOut className="h-4 w-4" />
            </Button>
          )}
        </div>
      </header>

      {/* Quick Stats */}
      <div className="mb-6 grid grid-cols-3 gap-3">
        <Card>
          <CardContent className="flex flex-col items-center justify-center p-4 text-center">
            <Activity className="mb-1 h-5 w-5 text-primary" />
            <p className="text-2xl font-bold text-foreground">
              {completedThisWeek}
              <span className="text-sm font-normal text-muted-foreground">
                /4
              </span>
            </p>
            <p className="text-xs text-muted-foreground">This Week</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex flex-col items-center justify-center p-4 text-center">
            <Target className="mb-1 h-5 w-5 text-success" />
            <p className="text-2xl font-bold text-foreground">
              {latestWeight?.weight || profile.currentWeight}
              <span className="text-sm font-normal text-muted-foreground">
                kg
              </span>
            </p>
            <p className="text-xs text-muted-foreground">Current</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex flex-col items-center justify-center p-4 text-center">
            <Calendar className="mb-1 h-5 w-5 text-warning" />
            <p className="text-2xl font-bold text-foreground">{weekNumber}</p>
            <p className="text-xs text-muted-foreground">Week</p>
          </CardContent>
        </Card>
      </div>

      {/* Workout Card */}
      {todaysWorkout && (
        <section className="mb-6">
          <WorkoutCard workout={todaysWorkout} />
        </section>
      )}

      {/* Action Button */}
      {todaysWorkout && todaysWorkout.type !== "rest" && (
        <div className="fixed left-0 right-0 px-4" style={{ bottom: 'calc(4rem + env(safe-area-inset-bottom, 0px) + 1rem)' }}>
          <div className="mx-auto max-w-lg">
            {!todayLog ? (
              <Button
                onClick={handleStartWorkout}
                className="h-14 w-full gap-2 rounded-2xl text-base font-semibold shadow-lg"
                size="lg"
              >
                <Circle className="h-5 w-5" />
                Start Workout
              </Button>
            ) : todayLog.completed ? (
              <Button
                variant="secondary"
                className="h-14 w-full gap-2 rounded-2xl text-base font-semibold"
                size="lg"
                disabled
              >
                <CheckCircle2 className="h-5 w-5 text-success" />
                Completed
              </Button>
            ) : (
              <Button
                onClick={handleCompleteWorkout}
                className="h-14 w-full gap-2 rounded-2xl bg-success text-base font-semibold text-white shadow-lg hover:bg-success/90"
                size="lg"
              >
                <CheckCircle2 className="h-5 w-5" />
                Complete Workout
              </Button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
