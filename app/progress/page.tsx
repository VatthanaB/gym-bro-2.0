"use client"

export const dynamic = 'force-dynamic'

import { useState } from "react"
import {
  Scale,
  TrendingDown,
  Calendar,
  Dumbbell,
  Plus,
  Check,
  X,
} from "lucide-react"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Separator } from "@/components/ui/separator"
import { ProgressChart } from "@/components/progress-chart"
import {
  useWorkoutLogs,
  useWeightHistory,
  useUserProfile,
} from "@/lib/hooks/use-supabase"

function formatFullDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("en-NZ", {
    weekday: "short",
    month: "short",
    day: "numeric",
  })
}

export default function ProgressPage() {
  const [showWeightInput, setShowWeightInput] = useState(false)
  const [weightInput, setWeightInput] = useState("")

  const { logs, isLoaded: logsLoaded } = useWorkoutLogs()
  const { weights, addWeight, getLatestWeight, isLoaded: weightLoaded } =
    useWeightHistory()
  const { profile, setProfile, isLoaded: profileLoaded } = useUserProfile()

  const isLoaded = logsLoaded && weightLoaded && profileLoaded

  const completedWorkouts = logs.filter((l) => l.completed)
  const latestWeight = getLatestWeight()
  const startWeight = weights.length > 0 ? weights[0].weight : profile.currentWeight
  const totalLost = startWeight - (latestWeight?.weight || startWeight)
  const toGoal = (latestWeight?.weight || startWeight) - profile.targetWeight

  const handleAddWeight = async () => {
    const weight = parseFloat(weightInput)
    if (isNaN(weight) || weight <= 0) return

    const today = new Date().toISOString().split("T")[0]
    await addWeight({ date: today, weight })
    await setProfile({ currentWeight: weight })
    setWeightInput("")
    setShowWeightInput(false)
  }

  if (!isLoaded) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    )
  }

  return (
    <div className="px-4 pt-6">
      {/* Header */}
      <header className="mb-6">
        <h1 className="text-3xl font-bold tracking-tight text-foreground">
          Progress
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Track your fitness journey
        </p>
      </header>

      {/* Weight Tracking Card */}
      <Card className="mb-6">
        <CardHeader className="flex-row items-center justify-between pb-2">
          <div className="flex items-center gap-2">
            <Scale className="h-5 w-5 text-primary" />
            <h2 className="font-semibold">Weight Tracking</h2>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowWeightInput(!showWeightInput)}
            className="gap-1"
          >
            {showWeightInput ? (
              <X className="h-4 w-4" />
            ) : (
              <Plus className="h-4 w-4" />
            )}
            {showWeightInput ? "Cancel" : "Log Weight"}
          </Button>
        </CardHeader>
        <CardContent>
          {/* Weight Input */}
          {showWeightInput && (
            <div className="mb-4 flex gap-2">
              <Input
                type="number"
                placeholder="Enter weight in kg"
                value={weightInput}
                onChange={(e) => setWeightInput(e.target.value)}
                className="h-12 rounded-xl"
                step="0.1"
              />
              <Button onClick={handleAddWeight} className="h-12 rounded-xl px-6">
                <Check className="h-4 w-4" />
              </Button>
            </div>
          )}

          {/* Stats Grid */}
          <div className="mb-6 grid grid-cols-3 gap-3">
            <div className="rounded-2xl bg-secondary p-3 text-center">
              <p className="text-2xl font-bold text-foreground">
                {latestWeight?.weight || startWeight}
              </p>
              <p className="text-xs text-muted-foreground">Current (kg)</p>
            </div>
            <div className="rounded-2xl bg-success/10 p-3 text-center">
              <p className="text-2xl font-bold text-success">
                {totalLost > 0 ? `-${totalLost.toFixed(1)}` : "0"}
              </p>
              <p className="text-xs text-muted-foreground">Lost (kg)</p>
            </div>
            <div className="rounded-2xl bg-primary/10 p-3 text-center">
              <p className="text-2xl font-bold text-primary">
                {toGoal.toFixed(1)}
              </p>
              <p className="text-xs text-muted-foreground">To Goal (kg)</p>
            </div>
          </div>

          {/* Chart */}
          <ProgressChart
            data={weights}
            targetWeight={profile.targetWeight}
            height={180}
          />

          {/* Goal Info */}
          <div className="mt-4 flex items-center justify-between rounded-xl bg-secondary/50 p-3">
            <div className="flex items-center gap-2">
              <TrendingDown className="h-4 w-4 text-success" />
              <span className="text-sm text-muted-foreground">Target</span>
            </div>
            <span className="font-semibold text-foreground">
              {profile.targetWeight} kg
            </span>
          </div>
        </CardContent>
      </Card>

      {/* Workout History */}
      <section className="mb-6">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-foreground">
            Workout History
          </h2>
          <span className="text-sm text-muted-foreground">
            {completedWorkouts.length} total
          </span>
        </div>

        {completedWorkouts.length > 0 ? (
          <div className="space-y-2">
            {completedWorkouts
              .sort((a, b) => b.date.localeCompare(a.date))
              .slice(0, 10)
              .map((log) => (
                <div
                  key={log.id}
                  className="flex items-center justify-between rounded-2xl border border-border bg-card p-4"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-success/10">
                      <Dumbbell className="h-5 w-5 text-success" />
                    </div>
                    <div>
                      <p className="font-medium text-foreground capitalize">
                        {log.type} {log.type !== "rest" && "Body"}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {log.exercises.length} exercises
                        {log.cardio?.completed && " + cardio"}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-foreground">
                      {formatFullDate(log.date)}
                    </p>
                    {log.duration && (
                      <p className="text-xs text-muted-foreground">
                        {log.duration} min
                      </p>
                    )}
                  </div>
                </div>
              ))}
          </div>
        ) : (
          <Card className="border-dashed">
            <CardContent className="flex flex-col items-center justify-center py-12 text-center">
              <Calendar className="mb-4 h-12 w-12 text-muted-foreground/50" />
              <p className="text-muted-foreground">No workouts completed yet</p>
              <p className="mt-1 text-sm text-muted-foreground">
                Start your first workout from the Today tab
              </p>
            </CardContent>
          </Card>
        )}
      </section>

      {/* Stats Summary */}
      <Card className="mb-8">
        <CardHeader className="pb-2">
          <h2 className="font-semibold">Statistics</h2>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">Total Workouts</span>
            <span className="font-semibold text-foreground">
              {completedWorkouts.length}
            </span>
          </div>
          <Separator />
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">Upper Body Sessions</span>
            <span className="font-semibold text-foreground">
              {completedWorkouts.filter((l) => l.type === "upper").length}
            </span>
          </div>
          <Separator />
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">Lower Body Sessions</span>
            <span className="font-semibold text-foreground">
              {completedWorkouts.filter((l) => l.type === "lower").length}
            </span>
          </div>
          <Separator />
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">Cardio Sessions</span>
            <span className="font-semibold text-foreground">
              {completedWorkouts.filter((l) => l.cardio?.completed).length}
            </span>
          </div>
          <Separator />
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">Weight Logs</span>
            <span className="font-semibold text-foreground">
              {weights.length}
            </span>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
