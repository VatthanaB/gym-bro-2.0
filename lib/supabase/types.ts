export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      exercises: {
        Row: {
          id: string
          name: string
          category: 'big' | 'medium' | 'small'
          muscle_group: 'push' | 'pull' | 'squat' | 'hinge' | 'isolation' | 'calves'
          body_section: 'upper' | 'lower'
          sets: number
          reps: string
          rest_seconds: number
          form_cues: string[]
          why: string
          starting_weight: number | null
          weight_unit: 'kg' | 'bodyweight'
          created_at: string
        }
        Insert: {
          id: string
          name: string
          category: 'big' | 'medium' | 'small'
          muscle_group: 'push' | 'pull' | 'squat' | 'hinge' | 'isolation' | 'calves'
          body_section: 'upper' | 'lower'
          sets: number
          reps: string
          rest_seconds: number
          form_cues: string[]
          why: string
          starting_weight?: number | null
          weight_unit?: 'kg' | 'bodyweight'
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          category?: 'big' | 'medium' | 'small'
          muscle_group?: 'push' | 'pull' | 'squat' | 'hinge' | 'isolation' | 'calves'
          body_section?: 'upper' | 'lower'
          sets?: number
          reps?: string
          rest_seconds?: number
          form_cues?: string[]
          why?: string
          starting_weight?: number | null
          weight_unit?: 'kg' | 'bodyweight'
          created_at?: string
        }
      }
      foods: {
        Row: {
          id: string
          name: string
          calories: number
          protein: number
          carbs: number
          fat: number
          portion: string
          category: 'protein' | 'carb' | 'vegetable' | 'fat' | 'dairy' | 'complete'
          food_bank_category: string
          created_at: string
        }
        Insert: {
          id: string
          name: string
          calories: number
          protein: number
          carbs: number
          fat: number
          portion: string
          category: 'protein' | 'carb' | 'vegetable' | 'fat' | 'dairy' | 'complete'
          food_bank_category: string
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          calories?: number
          protein?: number
          carbs?: number
          fat?: number
          portion?: string
          category?: 'protein' | 'carb' | 'vegetable' | 'fat' | 'dairy' | 'complete'
          food_bank_category?: string
          created_at?: string
        }
      }
      meals: {
        Row: {
          id: string
          slot: 'breakfast' | 'snack1' | 'lunch' | 'snack2' | 'dinner'
          label: string
          target_calories: number
          target_protein: number
          notes: string | null
          created_at: string
        }
        Insert: {
          id?: string
          slot: 'breakfast' | 'snack1' | 'lunch' | 'snack2' | 'dinner'
          label: string
          target_calories: number
          target_protein: number
          notes?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          slot?: 'breakfast' | 'snack1' | 'lunch' | 'snack2' | 'dinner'
          label?: string
          target_calories?: number
          target_protein?: number
          notes?: string | null
          created_at?: string
        }
      }
      meal_foods: {
        Row: {
          id: string
          meal_id: string
          food_id: string
          created_at: string
        }
        Insert: {
          id?: string
          meal_id: string
          food_id: string
          created_at?: string
        }
        Update: {
          id?: string
          meal_id?: string
          food_id?: string
          created_at?: string
        }
      }
      workout_templates: {
        Row: {
          id: string
          day_of_week: number
          day_name: string
          type: 'upper' | 'lower' | 'cardio' | 'rest'
          focus: string | null
          warmup: string[] | null
          cardio_type: string | null
          cardio_duration_minutes: number | null
          cardio_intensity: string | null
          cardio_rpe: string | null
          cardio_notes: string | null
          created_at: string
        }
        Insert: {
          id?: string
          day_of_week: number
          day_name: string
          type: 'upper' | 'lower' | 'cardio' | 'rest'
          focus?: string | null
          warmup?: string[] | null
          cardio_type?: string | null
          cardio_duration_minutes?: number | null
          cardio_intensity?: string | null
          cardio_rpe?: string | null
          cardio_notes?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          day_of_week?: number
          day_name?: string
          type?: 'upper' | 'lower' | 'cardio' | 'rest'
          focus?: string | null
          warmup?: string[] | null
          cardio_type?: string | null
          cardio_duration_minutes?: number | null
          cardio_intensity?: string | null
          cardio_rpe?: string | null
          cardio_notes?: string | null
          created_at?: string
        }
      }
      workout_template_exercises: {
        Row: {
          id: string
          workout_template_id: string
          exercise_id: string
          order_index: number
          created_at: string
        }
        Insert: {
          id?: string
          workout_template_id: string
          exercise_id: string
          order_index: number
          created_at?: string
        }
        Update: {
          id?: string
          workout_template_id?: string
          exercise_id?: string
          order_index?: number
          created_at?: string
        }
      }
      user_profiles: {
        Row: {
          id: string
          user_id: string
          name: string
          current_weight: number
          target_weight: number
          height: number
          start_date: string
          week_number: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          name: string
          current_weight: number
          target_weight: number
          height: number
          start_date: string
          week_number?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          name?: string
          current_weight?: number
          target_weight?: number
          height?: number
          start_date?: string
          week_number?: number
          created_at?: string
          updated_at?: string
        }
      }
      workout_logs: {
        Row: {
          id: string
          user_id: string
          date: string
          day_of_week: number
          type: 'upper' | 'lower' | 'cardio' | 'rest'
          exercises: Json
          cardio: Json | null
          notes: string | null
          completed: boolean
          duration: number | null
          rating: number | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          date: string
          day_of_week: number
          type: 'upper' | 'lower' | 'cardio' | 'rest'
          exercises: Json
          cardio?: Json | null
          notes?: string | null
          completed?: boolean
          duration?: number | null
          rating?: number | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          date?: string
          day_of_week?: number
          type?: 'upper' | 'lower' | 'cardio' | 'rest'
          exercises?: Json
          cardio?: Json | null
          notes?: string | null
          completed?: boolean
          duration?: number | null
          rating?: number | null
          created_at?: string
          updated_at?: string
        }
      }
      weight_entries: {
        Row: {
          id: string
          user_id: string
          date: string
          weight: number
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          date: string
          weight: number
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          date?: string
          weight?: number
          created_at?: string
        }
      }
      user_meal_preferences: {
        Row: {
          id: string
          user_id: string
          slot: 'breakfast' | 'snack1' | 'lunch' | 'snack2' | 'dinner'
          foods: Json
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          slot: 'breakfast' | 'snack1' | 'lunch' | 'snack2' | 'dinner'
          foods: Json
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          slot?: 'breakfast' | 'snack1' | 'lunch' | 'snack2' | 'dinner'
          foods?: Json
          created_at?: string
          updated_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
  }
}

// Helper types for easier use
export type Exercise = Database['public']['Tables']['exercises']['Row']
export type Food = Database['public']['Tables']['foods']['Row']
export type Meal = Database['public']['Tables']['meals']['Row']
export type MealFood = Database['public']['Tables']['meal_foods']['Row']
export type WorkoutTemplate = Database['public']['Tables']['workout_templates']['Row']
export type WorkoutTemplateExercise = Database['public']['Tables']['workout_template_exercises']['Row']
export type UserProfile = Database['public']['Tables']['user_profiles']['Row']
export type WorkoutLog = Database['public']['Tables']['workout_logs']['Row']
export type WeightEntry = Database['public']['Tables']['weight_entries']['Row']
export type UserMealPreference = Database['public']['Tables']['user_meal_preferences']['Row']

