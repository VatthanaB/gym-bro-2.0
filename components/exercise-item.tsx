"use client"

import { useState, useEffect } from "react"
import { ChevronDown, Info, Check, Pencil } from "lucide-react"
import { cn } from "@/lib/utils"
import type { Exercise } from "@/lib/types"
import type { UserExerciseData } from "@/lib/hooks/use-supabase"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"

interface ExerciseItemProps {
  exercise: Exercise
  index: number
  showWeight?: boolean
  userData?: UserExerciseData
  onUpdateData?: (exerciseId: string, data: Partial<Omit<UserExerciseData, "exerciseId">>) => Promise<void>
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
  userData,
  onUpdateData,
}: ExerciseItemProps) {
  const category = categoryLabels[exercise.category]
  const [isEditing, setIsEditing] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  
  // Form state with user data overlay
  const [weight, setWeight] = useState<string>("")
  const [sets, setSets] = useState<string>("")
  const [reps, setReps] = useState<string>("")

  // Initialize form with userData or defaults
  useEffect(() => {
    setWeight(userData?.weight?.toString() ?? exercise.startingWeight?.toString() ?? "")
    setSets(userData?.sets?.toString() ?? exercise.sets.toString())
    setReps(userData?.reps ?? exercise.reps)
  }, [userData, exercise.startingWeight, exercise.sets, exercise.reps])

  // Display values (user data takes precedence)
  const displayWeight = userData?.weight ?? exercise.startingWeight
  const displaySets = userData?.sets ?? exercise.sets
  const displayReps = userData?.reps ?? exercise.reps
  const hasUserData = userData && (userData.weight !== undefined || userData.sets !== undefined || userData.reps !== undefined)

  const handleSave = async () => {
    if (!onUpdateData) return
    
    setIsSaving(true)
    try {
      await onUpdateData(exercise.id, {
        weight: weight ? parseFloat(weight) : undefined,
        sets: sets ? parseInt(sets, 10) : undefined,
        reps: reps || undefined,
      })
      setIsEditing(false)
    } catch (error) {
      console.error("Failed to save:", error)
    } finally {
      setIsSaving(false)
    }
  }

  const handleCancel = () => {
    // Reset to current values
    setWeight(userData?.weight?.toString() ?? exercise.startingWeight?.toString() ?? "")
    setSets(userData?.sets?.toString() ?? exercise.sets.toString())
    setReps(userData?.reps ?? exercise.reps)
    setIsEditing(false)
  }

  return (
    <Sheet>
      <SheetTrigger asChild>
        <button className="group w-full text-left">
          <div className={cn(
            "flex items-center gap-4 rounded-2xl border bg-card p-4 transition-all hover:border-primary/20 hover:shadow-sm active:scale-[0.98]",
            hasUserData ? "border-primary/30" : "border-border"
          )}>
            {/* Number indicator */}
            <div className={cn(
              "flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-lg font-semibold",
              hasUserData ? "bg-primary/10 text-primary" : "bg-secondary text-foreground"
            )}>
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
                {hasUserData && (
                  <span className="shrink-0 rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-medium text-primary">
                    Custom
                  </span>
                )}
              </div>
              <p className="mt-0.5 text-sm text-muted-foreground">
                {displaySets} × {displayReps}
                {showWeight && displayWeight && (
                  <span className="ml-2 font-medium text-foreground">
                    @ {displayWeight}
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

      <SheetContent side="bottom" className="rounded-t-3xl max-h-[90vh] overflow-y-auto">
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
            {hasUserData && (
              <span className="rounded-full bg-primary/10 px-2.5 py-1 text-xs font-medium text-primary">
                Customized
              </span>
            )}
          </div>
          <SheetTitle className="text-2xl">{exercise.name}</SheetTitle>
        </SheetHeader>

        <div className="mt-6 space-y-6 px-6 pb-8">
          {/* My Settings - Editable Section */}
          {onUpdateData && (
            <div className="rounded-2xl border-2 border-dashed border-primary/20 bg-primary/5 p-4">
              <div className="flex items-center justify-between mb-4">
                <h4 className="font-semibold text-foreground flex items-center gap-2">
                  <Pencil className="h-4 w-4 text-primary" />
                  My Settings
                </h4>
                {!isEditing ? (
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => setIsEditing(true)}
                    className="gap-2"
                  >
                    <Pencil className="h-3 w-3" />
                    Edit
                  </Button>
                ) : (
                  <div className="flex gap-2">
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={handleCancel}
                      disabled={isSaving}
                    >
                      Cancel
                    </Button>
                    <Button 
                      size="sm" 
                      onClick={handleSave}
                      disabled={isSaving}
                      className="gap-2"
                    >
                      {isSaving ? (
                        <div className="h-3 w-3 animate-spin rounded-full border-2 border-current border-t-transparent" />
                      ) : (
                        <Check className="h-3 w-3" />
                      )}
                      Save
                    </Button>
                  </div>
                )}
              </div>

              {isEditing ? (
                <div className="grid grid-cols-3 gap-3">
                  <div className="space-y-2">
                    <Label htmlFor="weight" className="text-xs text-muted-foreground">
                      Weight ({exercise.weightUnit})
                    </Label>
                    <Input
                      id="weight"
                      type="number"
                      step="0.5"
                      value={weight}
                      onChange={(e) => setWeight(e.target.value)}
                      placeholder={exercise.startingWeight?.toString() ?? "0"}
                      className="h-12 text-center text-lg font-semibold"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="sets" className="text-xs text-muted-foreground">
                      Sets
                    </Label>
                    <Input
                      id="sets"
                      type="number"
                      value={sets}
                      onChange={(e) => setSets(e.target.value)}
                      placeholder={exercise.sets.toString()}
                      className="h-12 text-center text-lg font-semibold"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="reps" className="text-xs text-muted-foreground">
                      Reps
                    </Label>
                    <Input
                      id="reps"
                      value={reps}
                      onChange={(e) => setReps(e.target.value)}
                      placeholder={exercise.reps}
                      className="h-12 text-center text-lg font-semibold"
                    />
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-3 gap-3">
                  <div className="rounded-xl bg-background p-3 text-center">
                    <p className="text-xl font-bold text-foreground">
                      {displayWeight ?? "—"}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {exercise.weightUnit}
                    </p>
                  </div>
                  <div className="rounded-xl bg-background p-3 text-center">
                    <p className="text-xl font-bold text-foreground">
                      {displaySets}
                    </p>
                    <p className="text-xs text-muted-foreground">Sets</p>
                  </div>
                  <div className="rounded-xl bg-background p-3 text-center">
                    <p className="text-xl font-bold text-foreground">
                      {displayReps}
                    </p>
                    <p className="text-xs text-muted-foreground">Reps</p>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Default Program Values */}
          <div className="rounded-2xl bg-secondary p-4">
            <h4 className="mb-3 text-sm font-medium text-muted-foreground">
              Program Defaults
            </h4>
            <div className="flex gap-4">
              <div className="flex-1 text-center">
                <p className="text-lg font-semibold text-foreground">
                  {exercise.sets}
                </p>
                <p className="text-xs text-muted-foreground">Sets</p>
              </div>
              <div className="flex-1 text-center">
                <p className="text-lg font-semibold text-foreground">
                  {exercise.reps}
                </p>
                <p className="text-xs text-muted-foreground">Reps</p>
              </div>
              <div className="flex-1 text-center">
                <p className="text-lg font-semibold text-foreground">
                  {Math.floor(exercise.restSeconds / 60)}:{String(exercise.restSeconds % 60).padStart(2, "0")}
                </p>
                <p className="text-xs text-muted-foreground">Rest</p>
              </div>
              {exercise.startingWeight && (
                <div className="flex-1 text-center">
                  <p className="text-lg font-semibold text-foreground">
                    {exercise.startingWeight}
                  </p>
                  <p className="text-xs text-muted-foreground">{exercise.weightUnit}</p>
                </div>
              )}
            </div>
          </div>

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
