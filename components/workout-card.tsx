"use client";

import { useState } from "react";
import {
  Timer,
  Flame,
  Zap,
  RefreshCw,
  Plus,
  RotateCcw,
  Trash2,
} from "lucide-react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ExerciseItem } from "@/components/exercise-item";
import { ExerciseSwapSheet } from "@/components/exercise-swap-sheet";
import { AddExerciseSheet } from "@/components/add-exercise-sheet";
import { cn } from "@/lib/utils";
import type { WorkoutTemplate, Exercise } from "@/lib/types";

// Extended exercise type with customization markers
interface CustomizedExercise extends Exercise {
  _swappedFrom?: string;
  _isAdded?: boolean;
}

interface WorkoutCardProps {
  workout: Omit<WorkoutTemplate, "exercises"> & {
    exercises: CustomizedExercise[];
  };
  showCardio?: boolean;
  allExercises?: Exercise[];
  hasCustomizations?: boolean;
  onSwapExercise?: (originalId: string, replacementId: string) => void;
  onAddExercise?: (exerciseId: string) => void;
  onRemoveAddedExercise?: (exerciseId: string) => void;
  onResetCustomizations?: () => void;
  editable?: boolean;
}

const typeStyles: Record<string, { icon: React.ElementType; color: string }> = {
  upper: { icon: Zap, color: "text-primary" },
  lower: { icon: Flame, color: "text-warning" },
  cardio: { icon: Flame, color: "text-success" },
  rest: { icon: Timer, color: "text-muted-foreground" },
};

export function WorkoutCard({
  workout,
  showCardio = true,
  allExercises = [],
  hasCustomizations = false,
  onSwapExercise,
  onAddExercise,
  onRemoveAddedExercise,
  onResetCustomizations,
  editable = false,
}: WorkoutCardProps) {
  const [swapSheetOpen, setSwapSheetOpen] = useState(false);
  const [addSheetOpen, setAddSheetOpen] = useState(false);
  const [exerciseToSwap, setExerciseToSwap] = useState<Exercise | null>(null);

  const style = typeStyles[workout.type] || typeStyles.rest;
  const Icon = style.icon;

  const currentExerciseIds = workout.exercises.map((e) => e.id);

  const handleSwapClick = (exercise: Exercise) => {
    setExerciseToSwap(exercise);
    setSwapSheetOpen(true);
  };

  const handleSwapExercise = (originalId: string, replacementId: string) => {
    onSwapExercise?.(originalId, replacementId);
    setSwapSheetOpen(false);
    setExerciseToSwap(null);
  };

  const handleAddExercise = (exerciseId: string) => {
    onAddExercise?.(exerciseId);
  };

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
    );
  }

  return (
    <>
      <Card
        className={cn(
          "overflow-hidden",
          hasCustomizations && "border-primary/30"
        )}
      >
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Icon className={`h-5 w-5 ${style.color}`} />
              <span className="text-sm font-medium uppercase tracking-wide text-muted-foreground">
                {workout.type} Body
              </span>
              {hasCustomizations && (
                <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-medium text-primary">
                  CUSTOMIZED
                </span>
              )}
            </div>
            {/* <span className="text-sm text-muted-foreground">
              ~
              {workout.exercises.length * 12 +
                (workout.cardio?.durationMinutes || 0)}{" "}
              min
            </span> */}
          </div>
          {workout.focus && (
            <p className="mt-1 text-sm text-muted-foreground">
              {workout.focus}
            </p>
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
              <div key={exercise.id} className="relative">
                {/* Customization indicators */}
                {(exercise._swappedFrom || exercise._isAdded) && (
                  <div className="absolute -left-1 top-1/2 -translate-y-1/2 z-10">
                    <div
                      className={cn(
                        "h-2 w-2 rounded-full",
                        exercise._isAdded ? "bg-success" : "bg-primary"
                      )}
                      title={
                        exercise._isAdded
                          ? "Added exercise"
                          : "Swapped exercise"
                      }
                    />
                  </div>
                )}

                <div className="flex items-stretch gap-2">
                  <div className="min-w-0 flex-1">
                    <ExerciseItem exercise={exercise} index={index} />
                  </div>

                  {/* Action buttons */}
                  {editable && (
                    <div className="flex shrink-0 flex-col gap-1 justify-center">
                      {!exercise._isAdded && (
                        <button
                          onClick={() => handleSwapClick(exercise)}
                          className="flex h-8 w-8 items-center justify-center rounded-lg bg-secondary hover:bg-secondary/80 transition-colors"
                          title="Swap exercise"
                        >
                          <RefreshCw className="h-4 w-4 text-muted-foreground" />
                        </button>
                      )}
                      {exercise._isAdded && onRemoveAddedExercise && (
                        <button
                          onClick={() => onRemoveAddedExercise(exercise.id)}
                          className="flex h-8 w-8 items-center justify-center rounded-lg bg-destructive/10 hover:bg-destructive/20 transition-colors"
                          title="Remove exercise"
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </button>
                      )}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Add Exercise Button */}
          {editable && onAddExercise && (
            <Button
              variant="outline"
              onClick={() => setAddSheetOpen(true)}
              className="w-full rounded-xl border-dashed gap-2"
            >
              <Plus className="h-4 w-4" />
              Add Exercise
            </Button>
          )}

          {/* Reset Customizations Button */}
          {editable && hasCustomizations && onResetCustomizations && (
            <Button
              variant="ghost"
              onClick={onResetCustomizations}
              className="w-full text-muted-foreground gap-2"
              size="sm"
            >
              <RotateCcw className="h-4 w-4" />
              Reset to Default
            </Button>
          )}

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

      {/* Swap Sheet */}
      <ExerciseSwapSheet
        isOpen={swapSheetOpen}
        onClose={() => {
          setSwapSheetOpen(false);
          setExerciseToSwap(null);
        }}
        exerciseToSwap={exerciseToSwap}
        workoutType={workout.type}
        allExercises={allExercises}
        currentWorkoutExerciseIds={currentExerciseIds}
        onSwapExercise={handleSwapExercise}
      />

      {/* Add Exercise Sheet */}
      <AddExerciseSheet
        isOpen={addSheetOpen}
        onClose={() => setAddSheetOpen(false)}
        workoutType={workout.type}
        allExercises={allExercises}
        currentWorkoutExerciseIds={currentExerciseIds}
        onAddExercise={handleAddExercise}
      />
    </>
  );
}
