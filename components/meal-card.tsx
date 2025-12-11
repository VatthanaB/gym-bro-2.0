"use client"

import { useState } from "react"
import { ChevronDown, ChevronUp, ArrowLeftRight, RotateCcw } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import type { Meal, Food, MealSlot } from "@/lib/types"

interface MealCardProps {
  meal: Meal
  customFoods: Food[]
  onSwapFood: (slot: MealSlot) => void
  onReset: (slot: MealSlot) => void
}

export function MealCard({
  meal,
  customFoods,
  onSwapFood,
  onReset,
}: MealCardProps) {
  const [expanded, setExpanded] = useState(false)

  // Use custom foods if any, otherwise use defaults
  const displayFoods = customFoods.length > 0 ? customFoods : meal.foods
  const isCustomized = customFoods.length > 0

  // Calculate totals
  const totalCalories = displayFoods.reduce((sum, food) => sum + food.calories, 0)
  const totalProtein = displayFoods.reduce((sum, food) => sum + food.protein, 0)
  const totalCarbs = displayFoods.reduce((sum, food) => sum + food.carbs, 0)
  const totalFat = displayFoods.reduce((sum, food) => sum + food.fat, 0)

  // Calculate percentage of target
  const caloriePercent = Math.round((totalCalories / meal.targetCalories) * 100)
  const proteinPercent = Math.round((totalProtein / meal.targetProtein) * 100)

  // Determine if this is a simple swap slot (breakfast/snacks pick ONE option)
  const isSimpleSwapSlot = meal.slot === "breakfast" || meal.slot === "snack1" || meal.slot === "snack2"

  return (
    <Card className="overflow-hidden">
      <CardContent className="p-0">
        {/* Header - Always visible */}
        <button
          onClick={() => setExpanded(!expanded)}
          className="flex w-full items-center justify-between p-4 text-left"
        >
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <h3 className="font-semibold text-foreground">{meal.label}</h3>
              {isCustomized && (
                <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-medium text-primary">
                  CUSTOM
                </span>
              )}
            </div>
            <p className="mt-0.5 text-sm text-muted-foreground">
              {displayFoods.map((f) => f.name).join(", ")}
            </p>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right">
              <p className="text-lg font-bold text-foreground">{totalCalories}</p>
              <p className="text-xs text-muted-foreground">kcal</p>
            </div>
            <div className="text-right">
              <p className="text-lg font-bold text-primary">{totalProtein}g</p>
              <p className="text-xs text-muted-foreground">protein</p>
            </div>
            {expanded ? (
              <ChevronUp className="h-5 w-5 text-muted-foreground" />
            ) : (
              <ChevronDown className="h-5 w-5 text-muted-foreground" />
            )}
          </div>
        </button>

        {/* Expanded content */}
        {expanded && (
          <div className="border-t border-border bg-muted/30 p-4">
            {/* Target progress */}
            <div className="mb-4 grid grid-cols-2 gap-4">
              <div>
                <div className="mb-1 flex items-center justify-between text-xs text-muted-foreground">
                  <span>Calories</span>
                  <span>{caloriePercent}% of target</span>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-muted">
                  <div
                    className={`h-full rounded-full transition-all ${
                      caloriePercent > 120 ? "bg-destructive" : "bg-primary"
                    }`}
                    style={{ width: `${Math.min(caloriePercent, 100)}%` }}
                  />
                </div>
              </div>
              <div>
                <div className="mb-1 flex items-center justify-between text-xs text-muted-foreground">
                  <span>Protein</span>
                  <span>{proteinPercent}% of target</span>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-muted">
                  <div
                    className={`h-full rounded-full transition-all ${
                      proteinPercent >= 100 ? "bg-success" : "bg-warning"
                    }`}
                    style={{ width: `${Math.min(proteinPercent, 100)}%` }}
                  />
                </div>
              </div>
            </div>

            {/* Macro breakdown */}
            <div className="mb-4 flex gap-4 text-sm">
              <span className="text-muted-foreground">
                Carbs: <strong className="text-foreground">{totalCarbs}g</strong>
              </span>
              <span className="text-muted-foreground">
                Fat: <strong className="text-foreground">{totalFat}g</strong>
              </span>
            </div>

            {/* Foods list */}
            <div className="space-y-2">
              {displayFoods.map((food) => (
                <div
                  key={food.id}
                  className="flex items-center justify-between rounded-lg bg-card p-3"
                >
                  <div>
                    <p className="font-medium text-foreground">{food.name}</p>
                    <p className="text-xs text-muted-foreground">{food.portion}</p>
                  </div>
                  <div className="text-right text-sm">
                    <span className="text-muted-foreground">{food.calories} kcal</span>
                    <span className="mx-1 text-muted-foreground">·</span>
                    <span className="font-medium text-primary">{food.protein}g</span>
                  </div>
                </div>
              ))}
            </div>

            {/* Notes */}
            {meal.notes && (
              <p className="mt-3 text-xs text-muted-foreground italic">
                💡 {meal.notes}
              </p>
            )}

            {/* Action buttons */}
            <div className="mt-4 flex gap-2">
              <Button
                variant="outline"
                size="sm"
                className="flex-1 gap-1"
                onClick={() => onSwapFood(meal.slot)}
              >
                <ArrowLeftRight className="h-4 w-4" />
                {isSimpleSwapSlot ? "Change" : "Swap Foods"}
              </Button>
              {isCustomized && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="gap-1 text-muted-foreground"
                  onClick={() => onReset(meal.slot)}
                >
                  <RotateCcw className="h-4 w-4" />
                  Reset
                </Button>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
