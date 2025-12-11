"use client"

import { useState } from "react"
import { ChevronDown, Clock, Info } from "lucide-react"
import { cn } from "@/lib/utils"
import type { Exercise } from "@/lib/types"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"

interface ExerciseItemProps {
  exercise: Exercise
  index: number
  showWeight?: boolean
}

const categoryLabels: Record<string, { label: string; color: string }> = {
  big: { label: "Big", color: "bg-primary/10 text-primary" },
  medium: { label: "Medium", color: "bg-warning/10 text-warning" },
  small: { label: "Small", color: "bg-success/10 text-success" },
}

export function ExerciseItem({
  exercise,
  index,
  showWeight = true,
}: ExerciseItemProps) {
  const category = categoryLabels[exercise.category]

  return (
    <Sheet>
      <SheetTrigger asChild>
        <button className="group w-full text-left">
          <div className="flex items-center gap-4 rounded-2xl border border-border bg-card p-4 transition-all hover:border-primary/20 hover:shadow-sm active:scale-[0.98]">
            {/* Number indicator */}
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-secondary text-lg font-semibold text-foreground">
              {index + 1}
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <h3 className="font-semibold text-foreground truncate">
                  {exercise.name}
                </h3>
                <span
                  className={cn(
                    "shrink-0 rounded-full px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide",
                    category.color
                  )}
                >
                  {category.label}
                </span>
              </div>
              <p className="mt-0.5 text-sm text-muted-foreground">
                {exercise.sets} × {exercise.reps}
                {showWeight && exercise.startingWeight && (
                  <span className="ml-2 font-medium text-foreground">
                    @ {exercise.startingWeight}
                    {exercise.weightUnit === "kg" ? "kg" : ""}
                  </span>
                )}
              </p>
            </div>

            {/* Chevron */}
            <ChevronDown className="h-5 w-5 shrink-0 text-muted-foreground transition-transform group-hover:translate-y-0.5" />
          </div>
        </button>
      </SheetTrigger>

      <SheetContent side="bottom" className="rounded-t-3xl">
        <SheetHeader className="text-left">
          <div className="flex items-center gap-2">
            <span
              className={cn(
                "rounded-full px-2.5 py-1 text-xs font-medium uppercase tracking-wide",
                category.color
              )}
            >
              {category.label} Movement
            </span>
          </div>
          <SheetTitle className="text-2xl">{exercise.name}</SheetTitle>
        </SheetHeader>

        <div className="mt-6 space-y-6 px-6 pb-8">
          {/* Sets and Reps */}
          <div className="flex gap-4">
            <div className="flex-1 rounded-2xl bg-secondary p-4 text-center">
              <p className="text-2xl font-bold text-foreground">
                {exercise.sets}
              </p>
              <p className="text-sm text-muted-foreground">Sets</p>
            </div>
            <div className="flex-1 rounded-2xl bg-secondary p-4 text-center">
              <p className="text-2xl font-bold text-foreground">
                {exercise.reps}
              </p>
              <p className="text-sm text-muted-foreground">Reps</p>
            </div>
            <div className="flex-1 rounded-2xl bg-secondary p-4 text-center">
              <p className="text-2xl font-bold text-foreground">
                {Math.floor(exercise.restSeconds / 60)}:{String(exercise.restSeconds % 60).padStart(2, "0")}
              </p>
              <p className="text-sm text-muted-foreground">Rest</p>
            </div>
          </div>

          {/* Starting Weight */}
          {exercise.startingWeight && (
            <div className="rounded-2xl bg-primary/5 p-4">
              <p className="text-sm font-medium text-muted-foreground">
                Starting Weight
              </p>
              <p className="text-xl font-bold text-foreground">
                {exercise.startingWeight}
                {exercise.weightUnit === "kg" ? " kg" : ""}
              </p>
            </div>
          )}

          {/* Form Cues */}
          <div>
            <h4 className="mb-3 flex items-center gap-2 font-semibold text-foreground">
              <Info className="h-4 w-4 text-primary" />
              Form Cues
            </h4>
            <ul className="space-y-2">
              {exercise.formCues.map((cue, i) => (
                <li
                  key={i}
                  className="flex items-start gap-3 text-sm text-muted-foreground"
                >
                  <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
                  {cue}
                </li>
              ))}
            </ul>
          </div>

          {/* Why This Exercise */}
          <div className="rounded-2xl bg-secondary p-4">
            <h4 className="mb-1 text-sm font-medium text-muted-foreground">
              Why This Exercise
            </h4>
            <p className="text-foreground">{exercise.why}</p>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  )
}

