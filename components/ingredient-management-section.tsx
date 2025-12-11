"use client";

import { useState, useMemo } from "react";
import { Search, Edit2, Trash2, Eye, EyeOff, Filter } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  IngredientEditorSheet,
  DeleteIngredientDialog,
} from "@/components/ingredient-editor-sheet";
import {
  useFoods,
  useIngredientManagement,
  type ExtendedFood,
} from "@/lib/hooks/use-supabase";

// All food bank categories for filtering
const FOOD_BANK_CATEGORIES = [
  { value: "all", label: "All Categories" },
  { value: "breakfastProteins", label: "Breakfast Proteins" },
  { value: "breakfastCarbs", label: "Breakfast Carbs" },
  { value: "lunchProteins", label: "Lunch Proteins" },
  { value: "lunchCarbs", label: "Lunch Carbs" },
  { value: "lunchVegetables", label: "Lunch Vegetables" },
  { value: "dinnerProteins", label: "Dinner Proteins" },
  { value: "dinnerVegetables", label: "Dinner Vegetables" },
  { value: "snackProteins", label: "Snack Proteins" },
  { value: "fats", label: "Fats/Oils" },
];

const SOURCE_FILTERS = [
  { value: "all", label: "All Sources" },
  { value: "foods", label: "Default" },
  { value: "custom_foods", label: "Custom" },
];

const STATUS_FILTERS = [
  { value: "all", label: "All Status" },
  { value: "enabled", label: "Enabled" },
  { value: "disabled", label: "Disabled" },
];

export function IngredientManagementSection() {
  const { allFoodsForAdmin, refetch } = useFoods();
  const { toggleFoodEnabled, deleteFood, isLoading } =
    useIngredientManagement();

  // Filter state
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [sourceFilter, setSourceFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [showFilters, setShowFilters] = useState(false);

  // Edit sheet state
  const [editSheetOpen, setEditSheetOpen] = useState(false);
  const [editingIngredient, setEditingIngredient] =
    useState<ExtendedFood | null>(null);

  // Delete dialog state
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deletingIngredient, setDeletingIngredient] =
    useState<ExtendedFood | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Filter and search ingredients
  const filteredIngredients = useMemo(() => {
    return allFoodsForAdmin.filter((ingredient) => {
      // Search filter
      if (
        searchQuery &&
        !ingredient.name.toLowerCase().includes(searchQuery.toLowerCase())
      ) {
        return false;
      }

      // Category filter
      if (categoryFilter !== "all") {
        const inPrimary = ingredient.foodBankCategory === categoryFilter;
        const inAdditional =
          ingredient.additionalCategories.includes(categoryFilter);
        if (!inPrimary && !inAdditional) {
          return false;
        }
      }

      // Source filter
      if (sourceFilter !== "all" && ingredient.source !== sourceFilter) {
        return false;
      }

      // Status filter
      if (statusFilter === "enabled" && !ingredient.isEnabled) {
        return false;
      }
      if (statusFilter === "disabled" && ingredient.isEnabled) {
        return false;
      }

      return true;
    });
  }, [
    allFoodsForAdmin,
    searchQuery,
    categoryFilter,
    sourceFilter,
    statusFilter,
  ]);

  // Group ingredients by category for display
  const groupedIngredients = useMemo(() => {
    const groups: Record<string, ExtendedFood[]> = {};

    filteredIngredients.forEach((ingredient) => {
      const category = ingredient.foodBankCategory;
      if (!groups[category]) {
        groups[category] = [];
      }
      groups[category].push(ingredient);
    });

    // Sort each group alphabetically
    Object.keys(groups).forEach((key) => {
      groups[key].sort((a, b) => a.name.localeCompare(b.name));
    });

    return groups;
  }, [filteredIngredients]);

  const handleEdit = (ingredient: ExtendedFood) => {
    setEditingIngredient(ingredient);
    setEditSheetOpen(true);
  };

  const handleDelete = (ingredient: ExtendedFood) => {
    setDeletingIngredient(ingredient);
    setDeleteDialogOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!deletingIngredient) return;

    setIsDeleting(true);
    const success = await deleteFood(
      deletingIngredient.id,
      deletingIngredient.source
    );
    setIsDeleting(false);

    if (success) {
      setDeleteDialogOpen(false);
      setDeletingIngredient(null);
      refetch();
    }
  };

  const handleToggleEnabled = async (ingredient: ExtendedFood) => {
    const success = await toggleFoodEnabled(
      ingredient.id,
      ingredient.source,
      !ingredient.isEnabled
    );
    if (success) {
      refetch();
    }
  };

  const handleSaveEdit = () => {
    refetch();
  };

  const getCategoryLabel = (value: string) => {
    const cat = FOOD_BANK_CATEGORIES.find((c) => c.value === value);
    return cat?.label || value;
  };

  const totalCount = allFoodsForAdmin.length;
  const filteredCount = filteredIngredients.length;
  const enabledCount = allFoodsForAdmin.filter((i) => i.isEnabled).length;
  const disabledCount = totalCount - enabledCount;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">Manage Ingredients</CardTitle>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <span>{totalCount} total</span>
            <span>·</span>
            <span className="text-success">{enabledCount} enabled</span>
            <span>·</span>
            <span className="text-muted-foreground">
              {disabledCount} disabled
            </span>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Search and Filter Bar */}
        <div className="space-y-3">
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search ingredients..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
            <Button
              variant={showFilters ? "secondary" : "outline"}
              size="icon"
              onClick={() => setShowFilters(!showFilters)}
            >
              <Filter className="h-4 w-4" />
            </Button>
          </div>

          {/* Filters */}
          {showFilters && (
            <div className="grid grid-cols-3 gap-2">
              <div className="space-y-1">
                <Label className="text-xs">Category</Label>
                <select
                  value={categoryFilter}
                  onChange={(e) => setCategoryFilter(e.target.value)}
                  className="flex h-9 w-full rounded-md border border-input bg-background px-2 py-1 text-sm"
                >
                  {FOOD_BANK_CATEGORIES.map((cat) => (
                    <option key={cat.value} value={cat.value}>
                      {cat.label}
                    </option>
                  ))}
                </select>
              </div>
              <div className="space-y-1">
                <Label className="text-xs">Source</Label>
                <select
                  value={sourceFilter}
                  onChange={(e) => setSourceFilter(e.target.value)}
                  className="flex h-9 w-full rounded-md border border-input bg-background px-2 py-1 text-sm"
                >
                  {SOURCE_FILTERS.map((f) => (
                    <option key={f.value} value={f.value}>
                      {f.label}
                    </option>
                  ))}
                </select>
              </div>
              <div className="space-y-1">
                <Label className="text-xs">Status</Label>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="flex h-9 w-full rounded-md border border-input bg-background px-2 py-1 text-sm"
                >
                  {STATUS_FILTERS.map((f) => (
                    <option key={f.value} value={f.value}>
                      {f.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          )}
        </div>

        {/* Results count */}
        {(searchQuery ||
          categoryFilter !== "all" ||
          sourceFilter !== "all" ||
          statusFilter !== "all") && (
          <p className="text-sm text-muted-foreground">
            Showing {filteredCount} of {totalCount} ingredients
          </p>
        )}

        {/* Ingredients List */}
        <div className="max-h-[500px] space-y-4 overflow-y-auto">
          {Object.entries(groupedIngredients).length === 0 ? (
            <div className="rounded-lg border border-dashed border-border p-6 text-center">
              <p className="text-sm text-muted-foreground">
                {searchQuery ||
                categoryFilter !== "all" ||
                sourceFilter !== "all" ||
                statusFilter !== "all"
                  ? "No ingredients match your filters"
                  : "No ingredients found"}
              </p>
            </div>
          ) : (
            Object.entries(groupedIngredients).map(
              ([category, ingredients]) => (
                <div key={category}>
                  <h4 className="mb-2 text-sm font-semibold text-foreground">
                    {getCategoryLabel(category)} ({ingredients.length})
                  </h4>
                  <div className="space-y-1">
                    {ingredients.map((ingredient) => (
                      <div
                        key={ingredient.id}
                        className={`flex items-center justify-between rounded-lg border p-3 transition-colors ${
                          ingredient.isEnabled
                            ? "border-border bg-card"
                            : "border-border/50 bg-muted/30 opacity-60"
                        }`}
                      >
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <p
                              className={`font-medium truncate ${
                                ingredient.isEnabled
                                  ? "text-foreground"
                                  : "text-muted-foreground"
                              }`}
                            >
                              {ingredient.name}
                            </p>
                            {ingredient.source === "custom_foods" && (
                              <span className="shrink-0 rounded-full bg-primary/10 px-1.5 py-0.5 text-[10px] font-medium text-primary">
                                Custom
                              </span>
                            )}
                            {!ingredient.isEnabled && (
                              <span className="shrink-0 rounded-full bg-muted px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground">
                                Disabled
                              </span>
                            )}
                          </div>
                          <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            <span>{ingredient.caloriesPer100g} kcal/100g</span>
                            <span>·</span>
                            <span className="text-primary">
                              {ingredient.proteinPer100g}g P
                            </span>
                            <span>·</span>
                            <span>{ingredient.carbsPer100g}g C</span>
                            <span>·</span>
                            <span>{ingredient.fatPer100g}g F</span>
                            {ingredient.pieceWeightGrams && (
                              <>
                                <span>·</span>
                                <span className="text-muted-foreground/70">
                                  1 {ingredient.pieceName || "pc"} ={" "}
                                  {ingredient.pieceWeightGrams}g
                                </span>
                              </>
                            )}
                            {ingredient.additionalCategories.length > 0 && (
                              <>
                                <span>·</span>
                                <span className="text-primary/70">
                                  +{ingredient.additionalCategories.length} more
                                </span>
                              </>
                            )}
                          </div>
                        </div>

                        <div className="flex items-center gap-1 shrink-0 ml-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => handleToggleEnabled(ingredient)}
                            disabled={isLoading}
                            title={
                              ingredient.isEnabled
                                ? "Disable ingredient"
                                : "Enable ingredient"
                            }
                          >
                            {ingredient.isEnabled ? (
                              <Eye className="h-4 w-4 text-muted-foreground" />
                            ) : (
                              <EyeOff className="h-4 w-4 text-muted-foreground" />
                            )}
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => handleEdit(ingredient)}
                          >
                            <Edit2 className="h-4 w-4 text-muted-foreground" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-destructive hover:bg-destructive/10"
                            onClick={() => handleDelete(ingredient)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )
            )
          )}
        </div>

        {/* Edit Sheet */}
        <IngredientEditorSheet
          isOpen={editSheetOpen}
          onClose={() => {
            setEditSheetOpen(false);
            setEditingIngredient(null);
          }}
          ingredient={editingIngredient}
          onSave={handleSaveEdit}
        />

        {/* Delete Confirmation */}
        <DeleteIngredientDialog
          isOpen={deleteDialogOpen}
          onClose={() => {
            setDeleteDialogOpen(false);
            setDeletingIngredient(null);
          }}
          onConfirm={handleConfirmDelete}
          ingredientName={deletingIngredient?.name || ""}
          isDeleting={isDeleting}
        />
      </CardContent>
    </Card>
  );
}
