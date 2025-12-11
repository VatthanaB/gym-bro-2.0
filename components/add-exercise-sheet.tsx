"use client";

import { useState, useMemo } from "react";
import { Plus, Check, Search } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import type { Exercise, DayType, ExerciseCategory } from "@/lib/types";

interface AddExerciseSheetProps {
  isOpen: boolean;
  onClose: () => void;
  workoutType: DayType;
  allExercises: Exercise[];
  currentWorkoutExerciseIds: string[];
  onAddExercise: (exerciseId: string) => void;
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

export function AddExerciseSheet({
  isOpen,
  onClose,
  workoutType,
  allExercises,
  currentWorkoutExerciseIds,
  onAddExercise,
}: AddExerciseSheetProps) {
  const [selectedCategory, setSelectedCategory] = useState<ExerciseCategory | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  // Filter exercises based on workout type (upper/lower), not already in workout
  const availableExercises = useMemo(() => {
    const isUpperWorkout = workoutType === "upper";
    const isLowerWorkout = workoutType === "lower";

    return allExercises.filter((ex) => {
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

      // Filter by category if selected
      if (selectedCategory && ex.category !== selectedCategory) {
        return false;
      }

      // Filter by search query
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        if (!ex.name.toLowerCase().includes(query)) {
          return false;
        }
      }

      return true;
    });
  }, [allExercises, currentWorkoutExerciseIds, workoutType, selectedCategory, searchQuery]);

  // Group exercises by category
  const groupedExercises = useMemo(() => {
    const groups: Record<ExerciseCategory, Exercise[]> = {
      big: [],
      medium: [],
      small: [],
    };

    availableExercises.forEach((ex) => {
      groups[ex.category].push(ex);
    });

    return groups;
  }, [availableExercises]);

  const handleAddExercise = (exerciseId: string) => {
    onAddExercise(exerciseId);
    // Don't close - allow adding multiple exercises
  };

  const handleClose = () => {
    setSelectedCategory(null);
    setSearchQuery("");
    onClose();
  };

  return (
    <Sheet open={isOpen} onOpenChange={(open) => !open && handleClose()}>
      <SheetContent
        side="bottom"
        className="h-[85vh] overflow-hidden rounded-t-3xl"
      >
        <SheetHeader className="text-left">
          <div className="flex items-center gap-2">
            <Plus className="h-5 w-5 text-primary" />
            <SheetTitle>Add Exercise</SheetTitle>
          </div>
          <SheetDescription>
            Add an extra exercise to your {workoutType} body workout
          </SheetDescription>
        </SheetHeader>

        {/* Search input */}
        <div className="my-4 relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search exercises..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 h-11 rounded-xl"
          />
        </div>

        {/* Category filter pills */}
        <div className="mb-4 flex gap-2">
          <button
            onClick={() => setSelectedCategory(null)}
            className={cn(
              "rounded-full px-4 py-2 text-sm font-medium transition-all",
              !selectedCategory
                ? "bg-foreground text-background"
                : "bg-secondary text-muted-foreground hover:bg-secondary/80"
            )}
          >
            All
          </button>
          {(["big", "medium", "small"] as ExerciseCategory[]).map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={cn(
                "rounded-full px-4 py-2 text-sm font-medium transition-all",
                selectedCategory === cat
                  ? "bg-foreground text-background"
                  : "bg-secondary text-muted-foreground hover:bg-secondary/80"
              )}
            >
              {categoryLabels[cat].label}
            </button>
          ))}
        </div>

        {/* Exercise list */}
        <div className="h-[calc(100%-260px)] overflow-y-auto pb-4">
          <p className="mb-3 text-sm text-muted-foreground">
            {availableExercises.length} exercise{availableExercises.length !== 1 && "s"} available
          </p>

          {selectedCategory ? (
            // Show flat list when category is selected
            <div className="space-y-2">
              {availableExercises.map((exercise) => (
                <ExerciseAddButton
                  key={exercise.id}
                  exercise={exercise}
                  onAdd={() => handleAddExercise(exercise.id)}
                />
              ))}
            </div>
          ) : (
            // Show grouped by category
            <div className="space-y-6">
              {(["big", "medium", "small"] as ExerciseCategory[]).map((cat) => {
                const exercises = groupedExercises[cat];
                if (exercises.length === 0) return null;

                return (
                  <div key={cat}>
                    <h4
                      className={cn(
                        "mb-2 text-sm font-semibold uppercase tracking-wide",
                        categoryLabels[cat].color
                      )}
                    >
                      {categoryLabels[cat].label} Exercises ({exercises.length})
                    </h4>
                    <div className="space-y-2">
                      {exercises.map((exercise) => (
                        <ExerciseAddButton
                          key={exercise.id}
                          exercise={exercise}
                          onAdd={() => handleAddExercise(exercise.id)}
                        />
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {availableExercises.length === 0 && (
            <div className="py-8 text-center text-muted-foreground">
              {searchQuery
                ? "No exercises match your search"
                : "No more exercises available to add"}
            </div>
          )}
        </div>

        {/* Done button */}
        <div className="absolute bottom-0 left-0 right-0 border-t border-border bg-background p-4">
          <Button
            onClick={handleClose}
            className="h-12 w-full rounded-xl text-base font-semibold"
          >
            Done
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}

interface ExerciseAddButtonProps {
  exercise: Exercise;
  onAdd: () => void;
}

function ExerciseAddButton({ exercise, onAdd }: ExerciseAddButtonProps) {
  const [justAdded, setJustAdded] = useState(false);
  const category = categoryLabels[exercise.category];

  const handleClick = () => {
    onAdd();
    setJustAdded(true);
    setTimeout(() => setJustAdded(false), 1500);
  };

  return (
    <button
      onClick={handleClick}
      disabled={justAdded}
      className={cn(
        "flex w-full items-center justify-between rounded-xl border p-4 text-left transition-all",
        justAdded
          ? "border-success bg-success/10"
          : "border-border bg-card hover:border-primary/30 hover:shadow-sm active:scale-[0.98]"
      )}
    >
      <div className="flex-1">
        <div className="flex items-center gap-2">
          <span className="font-medium text-foreground">{exercise.name}</span>
          <span
            className={cn(
              "rounded-full px-2 py-0.5 text-[10px] font-medium uppercase",
              category.color
            )}
          >
            {category.label}
          </span>
          <span className="rounded-full bg-secondary px-2 py-0.5 text-[10px] font-medium text-muted-foreground">
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
      {justAdded ? (
        <div className="flex items-center gap-1.5 text-success">
          <Check className="h-4 w-4" />
          <span className="text-xs font-medium">Added</span>
        </div>
      ) : (
        <Plus className="h-5 w-5 text-muted-foreground" />
      )}
    </button>
  );
}

