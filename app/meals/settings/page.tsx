"use client";

export const dynamic = "force-dynamic";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, ShieldAlert } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LoadingPage } from "@/components/ui/loading";
import { MealConfigSection } from "@/components/meal-config-section";
import { AddIngredientForm } from "@/components/add-ingredient-form";
import { IngredientManagementSection } from "@/components/ingredient-management-section";
import {
  MealOptionEditor,
  DeleteConfirmDialog,
} from "@/components/meal-option-editor";
import {
  useUserProfile,
  useMeals,
  useFoods,
  useUserMeals,
  useMealOptions,
  type MealOption,
} from "@/lib/hooks/use-supabase";
import type { MealFood } from "@/lib/types";

export default function MealSettingsPage() {
  const router = useRouter();
  const { isLoaded: profileLoaded, isAdmin } = useUserProfile();
  const { meals: defaultMeals, isLoaded: mealsLoaded } = useMeals();
  const { foodBank, isLoaded: foodsLoaded, refetch: refetchFoods } = useFoods();
  const {
    customMeals,
    updateMealFoods,
    isLoaded: prefsLoaded,
  } = useUserMeals();
  const {
    getOptionsForSlot,
    addMealOption,
    updateMealOption,
    deleteMealOption,
    isLoaded: optionsLoaded,
  } = useMealOptions();

  // Editor state
  const [editorOpen, setEditorOpen] = useState(false);
  const [editorSlot, setEditorSlot] = useState<"breakfast" | "snack">(
    "breakfast"
  );
  const [editingOption, setEditingOption] = useState<MealOption | undefined>();

  // Delete confirmation state
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deletingOption, setDeletingOption] = useState<MealOption | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const isLoaded =
    profileLoaded && mealsLoaded && foodsLoaded && prefsLoaded && optionsLoaded;

  // Redirect non-admin users
  useEffect(() => {
    if (profileLoaded && !isAdmin) {
      router.push("/meals");
    }
  }, [profileLoaded, isAdmin, router]);

  if (!isLoaded) {
    return <LoadingPage />;
  }

  // Show access denied if not admin
  if (!isAdmin) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center px-4">
        <ShieldAlert className="mb-4 h-16 w-16 text-destructive" />
        <h1 className="mb-2 text-2xl font-bold text-foreground">
          Access Denied
        </h1>
        <p className="mb-6 text-center text-muted-foreground">
          You don&apos;t have permission to access this page.
        </p>
        <Button onClick={() => router.push("/meals")}>Go Back to Meals</Button>
      </div>
    );
  }

  // Get the current selection for each slot
  const getCurrentMealFoods = (slot: string) => {
    const custom = customMeals[slot as keyof typeof customMeals];
    if (custom && custom.length > 0) return custom;
    const defaultMeal = defaultMeals.find((m) => m.slot === slot);
    return defaultMeal?.foods || [];
  };

  // Food bank categories for the dropdown
  const foodBankCategories = [
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

  // Handler functions for meal options
  const handleCreateOption = (slot: "breakfast" | "snack") => {
    setEditorSlot(slot);
    setEditingOption(undefined);
    setEditorOpen(true);
  };

  const handleEditOption = (option: MealOption) => {
    setEditorSlot(option.slot);
    setEditingOption(option);
    setEditorOpen(true);
  };

  const handleDeleteOption = (option: MealOption) => {
    setDeletingOption(option);
    setDeleteDialogOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!deletingOption) return;
    setIsDeleting(true);
    await deleteMealOption(deletingOption.id);
    setIsDeleting(false);
    setDeleteDialogOpen(false);
    setDeletingOption(null);
  };

  const handleSaveOption = async (
    name: string,
    foods: MealFood[]
  ): Promise<boolean> => {
    if (editingOption) {
      return await updateMealOption(editingOption.id, name, foods);
    } else {
      const result = await addMealOption(editorSlot, name, foods);
      return result !== null;
    }
  };

  // Get breakfast and snack options from database
  const breakfastOptions = getOptionsForSlot("breakfast");
  const snackOptions = getOptionsForSlot("snack1"); // snack1 and snack2 use same options

  return (
    <div className="px-4 pb-24 pt-6">
      {/* Header */}
      <header className="mb-6">
        <Button
          variant="ghost"
          size="sm"
          className="mb-4 -ml-2 gap-1"
          onClick={() => router.push("/meals")}
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Meals
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">
            Meal Settings
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Configure meal options, manage ingredients, and control availability
          </p>
        </div>
      </header>

      {/* Section 1: Default Meal Configuration */}
      <section className="mb-8">
        <h2 className="mb-4 text-xl font-semibold text-foreground">
          Meal Options
        </h2>
        <p className="mb-4 text-sm text-muted-foreground">
          Manage available meal options. You can create, edit, or delete options
          that users can choose from.
        </p>

        <div className="space-y-4">
          {/* Breakfast */}
          <MealConfigSection
            slot="breakfast"
            label="Breakfast Options"
            mealOptions={breakfastOptions}
            currentFoods={getCurrentMealFoods("breakfast")}
            onSelectOption={(foods: MealFood[]) =>
              updateMealFoods("breakfast", foods)
            }
            onEditOption={handleEditOption}
            onDeleteOption={handleDeleteOption}
            onCreateOption={() => handleCreateOption("breakfast")}
            isAdmin={isAdmin}
          />

          {/* Snacks (shared between snack1 and snack2) */}
          <MealConfigSection
            slot="snack1"
            label="Snack Options"
            mealOptions={snackOptions}
            currentFoods={getCurrentMealFoods("snack1")}
            onSelectOption={(foods: MealFood[]) =>
              updateMealFoods("snack1", foods)
            }
            onEditOption={handleEditOption}
            onDeleteOption={handleDeleteOption}
            onCreateOption={() => handleCreateOption("snack")}
            isAdmin={isAdmin}
          />
        </div>

        <Card className="mt-4 border-muted bg-muted/30">
          <CardContent className="p-4">
            <p className="text-sm text-muted-foreground">
              <strong>Note:</strong> Lunch and Dinner use component-based
              swapping (protein + carb + vegetables + oil) rather than preset
              options. Users can customize them directly on the Meals page.
            </p>
          </CardContent>
        </Card>
      </section>

      {/* Section 2: Ingredient Management */}
      <section className="mb-8">
        <h2 className="mb-4 text-xl font-semibold text-foreground">
          Ingredient Management
        </h2>
        <p className="mb-4 text-sm text-muted-foreground">
          View, edit, and manage all ingredients. Toggle visibility to control
          what appears in meal swaps, and assign ingredients to multiple meal
          categories.
        </p>

        <IngredientManagementSection />
      </section>

      {/* Section 3: Add New Ingredient */}
      <section>
        <h2 className="mb-4 text-xl font-semibold text-foreground">
          Add Custom Ingredient
        </h2>
        <p className="mb-4 text-sm text-muted-foreground">
          Add a new ingredient to the global food bank. It will be available for
          all users to swap into their meals.
        </p>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">New Ingredient</CardTitle>
          </CardHeader>
          <CardContent>
            <AddIngredientForm
              foodBankCategories={foodBankCategories}
              onSuccess={() => {
                refetchFoods();
              }}
            />
          </CardContent>
        </Card>
      </section>

      {/* Meal Option Editor Sheet */}
      <MealOptionEditor
        isOpen={editorOpen}
        onClose={() => {
          setEditorOpen(false);
          setEditingOption(undefined);
        }}
        slot={editorSlot}
        option={editingOption}
        foodBank={foodBank}
        onSave={handleSaveOption}
      />

      {/* Delete Confirmation Dialog */}
      <DeleteConfirmDialog
        isOpen={deleteDialogOpen}
        onClose={() => {
          setDeleteDialogOpen(false);
          setDeletingOption(null);
        }}
        onConfirm={handleConfirmDelete}
        optionName={deletingOption?.name || ""}
        isDeleting={isDeleting}
      />
    </div>
  );
}
