"use client"

import { cn } from "@/lib/utils"
import type { WorkoutTemplate } from "@/lib/types"
import { Check, Flame, Dumbbell, BedDouble } from "lucide-react"

interface WeekViewProps {
  schedule: WorkoutTemplate[]
  completedDays: Set<number>
  selectedDay: number
  onSelectDay: (day: number) => void
}

const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]

const typeIcons: Record<string, React.ElementType> = {
  upper: Dumbbell,
  lower: Dumbbell,
  cardio: Flame,
  rest: BedDouble,
}

const typeColors: Record<string, string> = {
  upper: "bg-primary text-primary-foreground",
  lower: "bg-warning text-white",
  cardio: "bg-success text-white",
  rest: "bg-secondary text-muted-foreground",
}

export function WeekView({
  schedule,
  completedDays,
  selectedDay,
  onSelectDay,
}: WeekViewProps) {
  const today = new Date().getDay()

  // Reorder schedule to start from Monday (dayOfWeek 1)
  const orderedDays = [1, 2, 3, 4, 5, 6, 0] // Mon to Sun

  return (
    <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
      {orderedDays.map((dayOfWeek) => {
        const workout = schedule.find((w) => w.dayOfWeek === dayOfWeek)
        const isToday = dayOfWeek === today
        const isSelected = dayOfWeek === selectedDay
        const isCompleted = completedDays.has(dayOfWeek)
        const Icon = workout ? typeIcons[workout.type] : BedDouble

        return (
          <button
            key={dayOfWeek}
            onClick={() => onSelectDay(dayOfWeek)}
            className={cn(
              "relative flex min-w-[52px] flex-col items-center gap-2 rounded-2xl p-3 transition-all",
              isSelected
                ? "bg-foreground text-background shadow-lg scale-105"
                : "bg-card hover:bg-secondary"
            )}
          >
            {/* Day name */}
            <span
              className={cn(
                "text-[10px] font-medium uppercase tracking-wide",
                isSelected ? "text-background/70" : "text-muted-foreground",
                isToday && !isSelected && "text-primary font-semibold"
              )}
            >
              {dayNames[dayOfWeek]}
            </span>

            {/* Icon */}
            <div
              className={cn(
                "flex h-9 w-9 items-center justify-center rounded-xl",
                isSelected
                  ? "bg-background/20"
                  : workout
                  ? typeColors[workout.type]
                  : "bg-secondary"
              )}
            >
              {isCompleted ? (
                <Check
                  className={cn(
                    "h-4 w-4",
                    isSelected ? "text-background" : "text-success"
                  )}
                  strokeWidth={3}
                />
              ) : (
                <Icon
                  className={cn(
                    "h-4 w-4",
                    isSelected && "text-background"
                  )}
                />
              )}
            </div>

            {/* Workout type */}
            <span
              className={cn(
                "text-[10px] font-medium capitalize",
                isSelected ? "text-background/70" : "text-muted-foreground"
              )}
            >
              {workout?.type || "Rest"}
            </span>

            {/* Today indicator */}
            {isToday && (
              <div
                className={cn(
                  "absolute -bottom-1 h-1 w-4 rounded-full",
                  isSelected ? "bg-background" : "bg-primary"
                )}
              />
            )}
          </button>
        )
      })}
    </div>
  )
}

