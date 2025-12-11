"use client";

import { useState, useMemo } from "react";
import { ArrowRight, ChevronLeft, Check, RefreshCw } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { Exercise, DayType, ExerciseCategory } from "@/lib/types";

interface ExerciseSwapSheetProps {
  isOpen: boolean;
  onClose: () => void;
  exerciseToSwap: Exercise | null;
  workoutType: DayType;
  allExercises: Exercise[];
  currentWorkoutExerciseIds: string[];
  onSwapExercise: (originalId: string, replacementId: string) => void;
}

const categoryLabels: Record<ExerciseCategory, { label: string; color: string }> = {
  big: { label: "Big", color: "bg-primary/10 text-primary" },
  medium: { label: "Medium", color: "bg-warning/10 text-warning" },
  small: { label: "Small", color: "bg-success/10 text-success" },
};

const muscleGroupLabels: Record<string, string> = {
  push: "Push",
  pull: "Pull",
  squat: "Squat",
  hinge: "Hinge",
  isolation: "Isolation",
  calves: "Calves",
};

export function ExerciseSwapSheet({
  isOpen,
  onClose,
  exerciseToSwap,
  workoutType,
  allExercises,
  currentWorkoutExerciseIds,
  onSwapExercise,
}: ExerciseSwapSheetProps) {
  const [selectedMuscleGroup, setSelectedMuscleGroup] = useState<string | null>(null);

  // Filter exercises: same category, matching body section (upper/lower), not already in workout
  const availableExercises = useMemo(() => {
    if (!exerciseToSwap) return [];

    const isUpperWorkout = workoutType === "upper";
    const isLowerWorkout = workoutType === "lower";

    return allExercises.filter((ex) => {
      // Must be same category (big/medium/small)
      if (ex.category !== exerciseToSwap.category) return false;

      // Don't show exercises already in workout
      if (currentWorkoutExerciseIds.includes(ex.id)) return false;

      // Filter by body section based on workout type
      if (isUpperWorkout) {
        const upperMuscles = ["push", "pull"];
        const isUpperExercise =
          upperMuscles.includes(ex.muscleGroup) ||
          (ex.muscleGroup === "isolation" &&
            !["squat", "deadlift", "lunge", "leg", "calf", "hip"].some((name) =>
              ex.name.toLowerCase().includes(name)
            ));
        if (!isUpperExercise) return false;
      }

      if (isLowerWorkout) {
        const lowerMuscles = ["squat", "hinge", "calves"];
        const lowerBodyNames = ["squat", "deadlift", "lunge", "leg", "calf", "hip", "step"];
        const isLowerExercise =
          lowerMuscles.includes(ex.muscleGroup) ||
          lowerBodyNames.some((name) => ex.name.toLowerCase().includes(name));
        if (!isLowerExercise) return false;
      }

      // Filter by muscle group if selected
      if (selectedMuscleGroup && ex.muscleGroup !== selectedMuscleGroup) {
        return false;
      }

      return true;
    });
  }, [exerciseToSwap, allExercises, currentWorkoutExerciseIds, workoutType, selectedMuscleGroup]);

  // Get available muscle groups for filtering
  const availableMuscleGroups = useMemo(() => {
    if (!exerciseToSwap) return [];

    const groups = new Set<string>();
    allExercises.forEach((ex) => {
      if (ex.category === exerciseToSwap.category) {
        groups.add(ex.muscleGroup);
      }
    });
    return Array.from(groups);
  }, [exerciseToSwap, allExercises]);

  const handleSelectReplacement = (replacement: Exercise) => {
    if (exerciseToSwap) {
      onSwapExercise(exerciseToSwap.id, replacement.id);
      onClose();
    }
  };

  const handleClose = () => {
    setSelectedMuscleGroup(null);
    onClose();
  };

  if (!exerciseToSwap) return null;

  const category = categoryLabels[exerciseToSwap.category];

  return (
    <Sheet open={isOpen} onOpenChange={(open) => !open && handleClose()}>
      <SheetContent
        side="bottom"
        className="h-[85vh] overflow-hidden rounded-t-3xl"
      >
        <SheetHeader className="text-left">
          <div className="flex items-center gap-2">
            <RefreshCw className="h-5 w-5 text-primary" />
            <SheetTitle>Swap Exercise</SheetTitle>
          </div>
          <SheetDescription>
            Replace "{exerciseToSwap.name}" with another{" "}
            <span className={cn("font-medium", category.color)}>
              {category.label.toLowerCase()}
            </span>{" "}
            exercise
          </SheetDescription>
        </SheetHeader>

        {/* Current exercise info */}
        <div className="my-4 rounded-xl bg-muted p-4">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-sm font-medium text-foreground">
                Current: {exerciseToSwap.name}
              </span>
              <p className="text-xs text-muted-foreground">
                {exerciseToSwap.sets} × {exerciseToSwap.reps}
                {exerciseToSwap.startingWeight && (
                  <span> @ {exerciseToSwap.startingWeight}kg</span>
                )}
              </p>
            </div>
            <span
              className={cn(
                "rounded-full px-2.5 py-1 text-xs font-medium uppercase",
                category.color
              )}
            >
              {category.label}
            </span>
          </div>
        </div>

        {/* Muscle group filter pills */}
        {availableMuscleGroups.length > 1 && (
          <div className="mb-4 flex flex-wrap gap-2">
            <button
              onClick={() => setSelectedMuscleGroup(null)}
              className={cn(
                "rounded-full px-3 py-1.5 text-xs font-medium transition-all",
                !selectedMuscleGroup
                  ? "bg-foreground text-background"
                  : "bg-secondary text-muted-foreground hover:bg-secondary/80"
              )}
            >
              All
            </button>
            {availableMuscleGroups.map((group) => (
              <button
                key={group}
                onClick={() => setSelectedMuscleGroup(group)}
                className={cn(
                  "rounded-full px-3 py-1.5 text-xs font-medium transition-all",
                  selectedMuscleGroup === group
                    ? "bg-foreground text-background"
                    : "bg-secondary text-muted-foreground hover:bg-secondary/80"
                )}
              >
                {muscleGroupLabels[group] || group}
              </button>
            ))}
          </div>
        )}

        {/* Exercise list */}
        <div className="h-[calc(100%-240px)] overflow-y-auto pb-4">
          <p className="mb-3 text-sm text-muted-foreground">
            {availableExercises.length} exercise{availableExercises.length !== 1 && "s"} available
          </p>
          <div className="space-y-2">
            {availableExercises.map((exercise) => (
              <button
                key={exercise.id}
                onClick={() => handleSelectReplacement(exercise)}
                className="flex w-full items-center justify-between rounded-xl border border-border bg-card p-4 text-left transition-all hover:border-primary/30 hover:shadow-sm active:scale-[0.98]"
              >
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-foreground">
                      {exercise.name}
                    </span>
                    <span
                      className={cn(
                        "rounded-full px-2 py-0.5 text-[10px] font-medium uppercase",
                        "bg-secondary text-muted-foreground"
                      )}
                    >
                      {muscleGroupLabels[exercise.muscleGroup] || exercise.muscleGroup}
                    </span>
                  </div>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {exercise.sets} × {exercise.reps}
                    {exercise.startingWeight && (
                      <span> @ {exercise.startingWeight}kg</span>
                    )}
                  </p>
                </div>
                <ArrowRight className="h-4 w-4 text-muted-foreground" />
              </button>
            ))}
            {availableExercises.length === 0 && (
              <div className="py-8 text-center text-muted-foreground">
                No alternative exercises available
              </div>
            )}
          </div>
        </div>

        {/* Cancel button */}
        <div className="absolute bottom-0 left-0 right-0 border-t border-border bg-background p-4">
          <Button
            variant="outline"
            onClick={handleClose}
            className="h-12 w-full rounded-xl text-base font-semibold"
          >
            Cancel
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}

