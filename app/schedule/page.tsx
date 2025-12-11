"use client"

export const dynamic = 'force-dynamic'

import { useState } from "react"
import { WeekView } from "@/components/week-view"
import { WorkoutCard } from "@/components/workout-card"
import { useWorkoutTemplates, useWorkoutLogs } from "@/lib/hooks/use-supabase"

export default function SchedulePage() {
  const [selectedDay, setSelectedDay] = useState(new Date().getDay())
  const { templates: weeklySchedule, getWorkoutByDay, isLoaded: templatesLoaded } = useWorkoutTemplates()
  const { logs, isLoaded: logsLoaded } = useWorkoutLogs()

  const isLoaded = templatesLoaded && logsLoaded

  // Get completed days for current week
  const today = new Date()
  const startOfWeek = new Date(today)
  startOfWeek.setDate(today.getDate() - today.getDay())
  const weekStartStr = startOfWeek.toISOString().split("T")[0]

  const completedDays = new Set<number>()
  if (isLoaded) {
    logs
      .filter((log) => log.date >= weekStartStr && log.completed)
      .forEach((log) => completedDays.add(log.dayOfWeek))
  }

  const selectedWorkout = getWorkoutByDay(selectedDay)

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
          Weekly Schedule
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Your training plan for the week
        </p>
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
        <h2 className="mb-4 text-lg font-semibold text-foreground">
          {selectedWorkout?.dayName}'s Workout
        </h2>
        {selectedWorkout && <WorkoutCard workout={selectedWorkout} />}
      </section>

      {/* Week Overview */}
      <section className="mt-8">
        <h2 className="mb-4 text-lg font-semibold text-foreground">
          This Week at a Glance
        </h2>
        <div className="space-y-3 pb-8">
          {[1, 2, 3, 4, 5, 6, 0].map((dayOfWeek) => {
            const workout = weeklySchedule.find((w) => w.dayOfWeek === dayOfWeek)
            const isToday = dayOfWeek === today.getDay()
            const isCompleted = completedDays.has(dayOfWeek)

            return (
              <button
                key={dayOfWeek}
                onClick={() => setSelectedDay(dayOfWeek)}
                className={`w-full rounded-2xl border p-4 text-left transition-all ${
                  selectedDay === dayOfWeek
                    ? "border-primary bg-primary/5"
                    : "border-border bg-card hover:border-primary/20"
                }`}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-foreground">
                        {workout?.dayName}
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
                    </div>
                    <p className="mt-0.5 text-sm text-muted-foreground capitalize">
                      {workout?.type === "rest"
                        ? "Rest & Recovery"
                        : `${workout?.type} Body`}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-foreground">
                      {workout?.exercises.length || 0} exercises
                    </p>
                    {workout?.cardio && (
                      <p className="text-xs text-muted-foreground">
                        + {workout.cardio.durationMinutes} min cardio
                      </p>
                    )}
                  </div>
                </div>
              </button>
            )
          })}
        </div>
      </section>
    </div>
  )
}
