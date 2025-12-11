"use client"

export const dynamic = 'force-dynamic'

import { useState, useMemo } from "react"
import { Search, X } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ExerciseItem } from "@/components/exercise-item"
import { useExercises } from "@/lib/hooks/use-supabase"
import { cn } from "@/lib/utils"

type BodySection = "all" | "upper" | "lower"
type Category = "all" | "big" | "medium" | "small"

const muscleGroupLabels: Record<string, string> = {
  push: "Push",
  pull: "Pull",
  squat: "Squat",
  hinge: "Hinge",
  isolation: "Isolation",
  calves: "Calves",
}

export default function ExercisesPage() {
  const { exercises: allExercises, getUpperBodyExercises, getLowerBodyExercises, isLoaded } = useExercises()
  
  const [search, setSearch] = useState("")
  const [bodySection, setBodySection] = useState<BodySection>("all")
  const [category, setCategory] = useState<Category>("all")
  const [selectedMuscle, setSelectedMuscle] = useState<string | null>(null)

  const upperBodyExercises = useMemo(() => getUpperBodyExercises(), [getUpperBodyExercises])
  const lowerBodyExercises = useMemo(() => getLowerBodyExercises(), [getLowerBodyExercises])

  const exercises = useMemo(() => {
    let filtered =
      bodySection === "upper"
        ? upperBodyExercises
        : bodySection === "lower"
        ? lowerBodyExercises
        : allExercises

    if (category !== "all") {
      filtered = filtered.filter((ex) => ex.category === category)
    }

    if (selectedMuscle) {
      filtered = filtered.filter((ex) => ex.muscleGroup === selectedMuscle)
    }

    if (search) {
      const searchLower = search.toLowerCase()
      filtered = filtered.filter(
        (ex) =>
          ex.name.toLowerCase().includes(searchLower) ||
          ex.muscleGroup.toLowerCase().includes(searchLower)
      )
    }

    return filtered
  }, [bodySection, category, selectedMuscle, search, allExercises, upperBodyExercises, lowerBodyExercises])

  // Get unique muscle groups for current selection
  const availableMuscleGroups = useMemo(() => {
    const baseExercises =
      bodySection === "upper"
        ? upperBodyExercises
        : bodySection === "lower"
        ? lowerBodyExercises
        : allExercises

    const groups = new Set(baseExercises.map((ex) => ex.muscleGroup))
    return Array.from(groups)
  }, [bodySection, allExercises, upperBodyExercises, lowerBodyExercises])

  const clearFilters = () => {
    setSearch("")
    setBodySection("all")
    setCategory("all")
    setSelectedMuscle(null)
  }

  const hasActiveFilters =
    search || bodySection !== "all" || category !== "all" || selectedMuscle

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
          Exercise Library
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {allExercises.length} exercises available
        </p>
      </header>

      {/* Search */}
      <div className="relative mb-4">
        <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          type="text"
          placeholder="Search exercises..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="h-12 rounded-2xl pl-11 pr-4"
        />
      </div>

      {/* Body Section Tabs */}
      <Tabs
        value={bodySection}
        onValueChange={(v) => {
          setBodySection(v as BodySection)
          setSelectedMuscle(null)
        }}
        className="mb-4"
      >
        <TabsList className="grid w-full grid-cols-3 rounded-2xl">
          <TabsTrigger value="all" className="rounded-xl">
            All
          </TabsTrigger>
          <TabsTrigger value="upper" className="rounded-xl">
            Upper
          </TabsTrigger>
          <TabsTrigger value="lower" className="rounded-xl">
            Lower
          </TabsTrigger>
        </TabsList>
      </Tabs>

      {/* Category Filter */}
      <div className="mb-4 flex gap-2">
        {(["all", "big", "medium", "small"] as Category[]).map((cat) => (
          <button
            key={cat}
            onClick={() => setCategory(cat)}
            className={cn(
              "rounded-full px-4 py-2 text-sm font-medium transition-all",
              category === cat
                ? "bg-foreground text-background"
                : "bg-secondary text-muted-foreground hover:bg-secondary/80"
            )}
          >
            {cat === "all" ? "All Sizes" : cat.charAt(0).toUpperCase() + cat.slice(1)}
          </button>
        ))}
      </div>

      {/* Muscle Group Pills */}
      <div className="mb-6 flex flex-wrap gap-2">
        {availableMuscleGroups.map((muscle) => (
          <button
            key={muscle}
            onClick={() =>
              setSelectedMuscle(selectedMuscle === muscle ? null : muscle)
            }
            className={cn(
              "rounded-full px-3 py-1.5 text-xs font-medium transition-all",
              selectedMuscle === muscle
                ? "bg-primary text-primary-foreground"
                : "bg-secondary/50 text-muted-foreground hover:bg-secondary"
            )}
          >
            {muscleGroupLabels[muscle] || muscle}
          </button>
        ))}
      </div>

      {/* Clear Filters */}
      {hasActiveFilters && (
        <Button
          variant="ghost"
          size="sm"
          onClick={clearFilters}
          className="mb-4 gap-2"
        >
          <X className="h-4 w-4" />
          Clear filters
        </Button>
      )}

      {/* Results Count */}
      <p className="mb-4 text-sm text-muted-foreground">
        Showing {exercises.length} exercise{exercises.length !== 1 && "s"}
      </p>

      {/* Exercise List */}
      <div className="space-y-2 pb-8">
        {exercises.length > 0 ? (
          exercises.map((exercise, index) => (
            <ExerciseItem
              key={exercise.id}
              exercise={exercise}
              index={index}
              showWeight={true}
            />
          ))
        ) : (
          <div className="py-12 text-center">
            <p className="text-muted-foreground">No exercises found</p>
            <Button
              variant="link"
              onClick={clearFilters}
              className="mt-2"
            >
              Clear all filters
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}
