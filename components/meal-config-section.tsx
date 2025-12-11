"use client";

import { useState } from "react";
import {
  ChevronDown,
  ChevronUp,
  Check,
  Pencil,
  Trash2,
  Plus,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import type { MealFood, MealSlot } from "@/lib/types";
import type { MealOption } from "@/lib/hooks/use-supabase";

interface MealConfigSectionProps {
  slot: MealSlot;
  label: string;
  mealOptions: MealOption[];
  currentFoods: MealFood[];
  onSelectOption: (foods: MealFood[]) => void;
  onEditOption?: (option: MealOption) => void;
  onDeleteOption?: (option: MealOption) => void;
  onCreateOption?: () => void;
  isAdmin?: boolean;
}

export function MealConfigSection({
  slot,
  label,
  mealOptions,
  currentFoods,
  onSelectOption,
  onEditOption,
  onDeleteOption,
  onCreateOption,
  isAdmin = false,
}: MealConfigSectionProps) {
  const [expanded, setExpanded] = useState(false);

  // Check if current foods match a meal option (compare id, quantity, and quantityType)
  const isCurrentOption = (option: MealOption) => {
    if (option.foods.length !== currentFoods.length) return false;

    // Create a key for each food: id-quantity-quantityType
    const makeKey = (f: MealFood) => `${f.id}-${f.quantity}-${f.quantityType}`;
    const currentKeys = currentFoods.map(makeKey).sort();
    const optionKeys = option.foods.map(makeKey).sort();

    return currentKeys.every((key, i) => key === optionKeys[i]);
  };

  // Find the currently selected option name
  const currentOptionName =
    mealOptions.find((opt) => isCurrentOption(opt))?.name || "Custom selection";

  // Calculate current totals
  const totalCalories = currentFoods.reduce((sum, f) => sum + f.calories, 0);
  const totalProtein = currentFoods.reduce((sum, f) => sum + f.protein, 0);

  const handleSelectOption = (option: MealOption) => {
    onSelectOption(option.foods);
  };

  return (
    <Card className="overflow-hidden">
      <CardContent className="p-0">
        {/* Header - Always visible */}
        <button
          onClick={() => setExpanded(!expanded)}
          className="flex w-full items-center justify-between p-4 text-left"
        >
          <div className="flex-1">
            <h3 className="font-semibold text-foreground">{label}</h3>
            <p className="mt-0.5 text-sm text-muted-foreground">
              {currentOptionName}
            </p>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right">
              <p className="text-sm font-medium text-foreground">
                {totalCalories} kcal
              </p>
              <p className="text-xs text-primary">{totalProtein}g protein</p>
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
            <div className="mb-3 flex items-center justify-between">
              <p className="text-xs text-muted-foreground">
                Select your preferred default option:
              </p>
              {isAdmin && onCreateOption && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    onCreateOption();
                  }}
                  className="gap-1"
                >
                  <Plus className="h-4 w-4" />
                  New Option
                </Button>
              )}
            </div>
            <div className="space-y-2">
              {mealOptions.map((option) => {
                const optionCalories = option.foods.reduce(
                  (sum, f) => sum + f.calories,
                  0
                );
                const optionProtein = option.foods.reduce(
                  (sum, f) => sum + f.protein,
                  0
                );
                const isCurrent = isCurrentOption(option);

                return (
                  <div
                    key={option.id}
                    className={`rounded-xl transition-all ${
                      isCurrent
                        ? "border-2 border-primary bg-primary/5"
                        : "border border-border bg-card hover:border-primary/30"
                    }`}
                  >
                    <div className="flex items-center p-4">
                      {/* Main clickable area */}
                      <button
                        onClick={() => !isCurrent && handleSelectOption(option)}
                        disabled={isCurrent}
                        className="flex flex-1 items-center justify-between text-left"
                      >
                        <div className="flex-1 pr-4">
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="font-medium text-foreground">
                              {option.name}
                            </span>
                            {isCurrent && (
                              <span className="flex items-center gap-1 rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-medium text-primary">
                                <Check className="h-3 w-3" />
                                CURRENT
                              </span>
                            )}
                          </div>
                          <p className="mt-1 text-xs text-muted-foreground">
                            {option.foods.map((f) => f.name).join(" + ")}
                          </p>
                        </div>
                        <div className="text-right text-sm">
                          <p className="text-foreground">
                            {optionCalories} kcal
                          </p>
                          <p className="font-medium text-primary">
                            {optionProtein}g protein
                          </p>
                        </div>
                      </button>

                      {/* Admin Edit/Delete buttons */}
                      {isAdmin && (
                        <div className="ml-3 flex shrink-0 gap-1 border-l border-border pl-3">
                          {onEditOption && (
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 text-muted-foreground hover:text-foreground"
                              onClick={(e) => {
                                e.stopPropagation();
                                onEditOption(option);
                              }}
                            >
                              <Pencil className="h-4 w-4" />
                            </Button>
                          )}
                          {onDeleteOption && (
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 text-muted-foreground hover:text-destructive"
                              onClick={(e) => {
                                e.stopPropagation();
                                onDeleteOption(option);
                              }}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}

              {mealOptions.length === 0 && (
                <div className="rounded-lg border border-dashed border-border p-6 text-center">
                  <p className="text-sm text-muted-foreground">
                    No options available.{" "}
                    {isAdmin && onCreateOption && (
                      <button
                        onClick={onCreateOption}
                        className="text-primary hover:underline"
                      >
                        Create one
                      </button>
                    )}
                  </p>
                </div>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
