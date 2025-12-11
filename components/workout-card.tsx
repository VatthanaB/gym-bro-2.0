"use client"

import { Timer, Flame, Zap } from "lucide-react"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { ExerciseItem } from "@/components/exercise-item"
import type { WorkoutTemplate } from "@/lib/types"

interface WorkoutCardProps {
  workout: WorkoutTemplate
  showCardio?: boolean
}

const typeStyles: Record<string, { icon: React.ElementType; color: string }> = {
  upper: { icon: Zap, color: "text-primary" },
  lower: { icon: Flame, color: "text-warning" },
  cardio: { icon: Flame, color: "text-success" },
  rest: { icon: Timer, color: "text-muted-foreground" },
}

export function WorkoutCard({ workout, showCardio = true }: WorkoutCardProps) {
  const style = typeStyles[workout.type] || typeStyles.rest
  const Icon = style.icon

  if (workout.type === "rest") {
    return (
      <Card className="border-dashed bg-secondary/30">
        <CardContent className="flex flex-col items-center justify-center py-12 text-center">
          <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-secondary">
            <Timer className="h-8 w-8 text-muted-foreground" />
          </div>
          <h3 className="text-xl font-semibold text-foreground">Rest Day</h3>
          <p className="mt-2 max-w-xs text-muted-foreground">
            {workout.focus || "Focus on recovery and nutrition"}
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Icon className={`h-5 w-5 ${style.color}`} />
            <span className="text-sm font-medium uppercase tracking-wide text-muted-foreground">
              {workout.type} Body
            </span>
          </div>
          <span className="text-sm text-muted-foreground">
            ~{workout.exercises.length * 12 + (workout.cardio?.durationMinutes || 0)} min
          </span>
        </div>
        {workout.focus && (
          <p className="mt-1 text-sm text-muted-foreground">{workout.focus}</p>
        )}
      </CardHeader>

      <CardContent className="space-y-3">
        {/* Warmup Section */}
        {workout.warmup && workout.warmup.length > 0 && (
          <div className="rounded-2xl bg-secondary/50 p-4">
            <h4 className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Warm-up
            </h4>
            <ul className="space-y-1 text-sm text-foreground">
              {workout.warmup.map((item, i) => (
                <li key={i} className="flex items-center gap-2">
                  <span className="h-1 w-1 rounded-full bg-muted-foreground" />
                  {item}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Exercises */}
        <div className="space-y-2">
          {workout.exercises.map((exercise, index) => (
            <ExerciseItem key={exercise.id} exercise={exercise} index={index} />
          ))}
        </div>

        {/* Cardio Section */}
        {showCardio && workout.cardio && (
          <div className="rounded-2xl bg-primary/5 p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Flame className="h-4 w-4 text-primary" />
                <h4 className="text-sm font-semibold uppercase tracking-wide text-primary">
                  Cardio
                </h4>
              </div>
              <span className="text-sm font-medium text-foreground">
                {workout.cardio.durationMinutes} min
              </span>
            </div>
            <p className="mt-2 font-medium text-foreground capitalize">
              {workout.cardio.type.replace("_", " ")}
            </p>
            <p className="mt-1 text-sm text-muted-foreground">
              {workout.cardio.intensity}
            </p>
            {workout.cardio.notes && (
              <p className="mt-2 text-xs text-muted-foreground">
                {workout.cardio.notes}
              </p>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
}

