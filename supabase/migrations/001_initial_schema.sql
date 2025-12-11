-- =============================================
-- GYM BRO 2.0 - DATABASE SCHEMA
-- Run this in Supabase SQL Editor
-- =============================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =============================================
-- REFERENCE DATA TABLES (Public, read-only)
-- =============================================

-- Exercises table
CREATE TABLE IF NOT EXISTS public.exercises (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  category TEXT NOT NULL CHECK (category IN ('big', 'medium', 'small')),
  muscle_group TEXT NOT NULL CHECK (muscle_group IN ('push', 'pull', 'squat', 'hinge', 'isolation', 'calves')),
  body_section TEXT NOT NULL CHECK (body_section IN ('upper', 'lower')),
  sets INTEGER NOT NULL,
  reps TEXT NOT NULL,
  rest_seconds INTEGER NOT NULL,
  form_cues TEXT[] NOT NULL DEFAULT '{}',
  why TEXT NOT NULL,
  starting_weight DECIMAL,
  weight_unit TEXT NOT NULL DEFAULT 'kg' CHECK (weight_unit IN ('kg', 'bodyweight')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Foods table
CREATE TABLE IF NOT EXISTS public.foods (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  calories INTEGER NOT NULL,
  protein INTEGER NOT NULL,
  carbs INTEGER NOT NULL,
  fat INTEGER NOT NULL,
  portion TEXT NOT NULL,
  raw_weight INTEGER, -- raw weight in grams (before cooking)
  cooked_weight INTEGER, -- cooked weight in grams (after cooking)
  category TEXT NOT NULL CHECK (category IN ('protein', 'carb', 'vegetable', 'fat', 'dairy', 'complete')),
  food_bank_category TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Default meals table
CREATE TABLE IF NOT EXISTS public.meals (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  slot TEXT NOT NULL CHECK (slot IN ('breakfast', 'snack1', 'lunch', 'snack2', 'dinner')),
  label TEXT NOT NULL,
  target_calories INTEGER NOT NULL,
  target_protein INTEGER NOT NULL,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Meal-Food junction table
CREATE TABLE IF NOT EXISTS public.meal_foods (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  meal_id UUID NOT NULL REFERENCES public.meals(id) ON DELETE CASCADE,
  food_id TEXT NOT NULL REFERENCES public.foods(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Workout templates table
CREATE TABLE IF NOT EXISTS public.workout_templates (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  day_of_week INTEGER NOT NULL CHECK (day_of_week >= 0 AND day_of_week <= 6),
  day_name TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('upper', 'lower', 'cardio', 'rest')),
  focus TEXT,
  warmup TEXT[],
  cardio_type TEXT,
  cardio_duration_minutes INTEGER,
  cardio_intensity TEXT,
  cardio_rpe TEXT,
  cardio_notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Workout template exercises junction table
CREATE TABLE IF NOT EXISTS public.workout_template_exercises (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  workout_template_id UUID NOT NULL REFERENCES public.workout_templates(id) ON DELETE CASCADE,
  exercise_id TEXT NOT NULL REFERENCES public.exercises(id) ON DELETE CASCADE,
  order_index INTEGER NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- =============================================
-- USER DATA TABLES (Protected by RLS)
-- =============================================

-- User profiles table
CREATE TABLE IF NOT EXISTS public.user_profiles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  current_weight DECIMAL NOT NULL,
  target_weight DECIMAL NOT NULL,
  height DECIMAL NOT NULL,
  start_date DATE NOT NULL DEFAULT CURRENT_DATE,
  week_number INTEGER NOT NULL DEFAULT 1,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(user_id)
);

-- Workout logs table
CREATE TABLE IF NOT EXISTS public.workout_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  day_of_week INTEGER NOT NULL CHECK (day_of_week >= 0 AND day_of_week <= 6),
  type TEXT NOT NULL CHECK (type IN ('upper', 'lower', 'cardio', 'rest')),
  exercises JSONB NOT NULL DEFAULT '[]',
  cardio JSONB,
  notes TEXT,
  completed BOOLEAN NOT NULL DEFAULT FALSE,
  duration INTEGER,
  rating INTEGER CHECK (rating >= 1 AND rating <= 5),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(user_id, date)
);

-- Weight entries table
CREATE TABLE IF NOT EXISTS public.weight_entries (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  weight DECIMAL NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(user_id, date)
);

-- User meal preferences table
CREATE TABLE IF NOT EXISTS public.user_meal_preferences (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  slot TEXT NOT NULL CHECK (slot IN ('breakfast', 'snack1', 'lunch', 'snack2', 'dinner')),
  foods JSONB NOT NULL DEFAULT '[]',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(user_id, slot)
);

-- =============================================
-- INDEXES
-- =============================================

CREATE INDEX IF NOT EXISTS idx_exercises_category ON public.exercises(category);
CREATE INDEX IF NOT EXISTS idx_exercises_muscle_group ON public.exercises(muscle_group);
CREATE INDEX IF NOT EXISTS idx_exercises_body_section ON public.exercises(body_section);
CREATE INDEX IF NOT EXISTS idx_foods_category ON public.foods(category);
CREATE INDEX IF NOT EXISTS idx_foods_bank_category ON public.foods(food_bank_category);
CREATE INDEX IF NOT EXISTS idx_meals_slot ON public.meals(slot);
CREATE INDEX IF NOT EXISTS idx_workout_templates_day ON public.workout_templates(day_of_week);
CREATE INDEX IF NOT EXISTS idx_user_profiles_user_id ON public.user_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_workout_logs_user_id ON public.workout_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_workout_logs_date ON public.workout_logs(date);
CREATE INDEX IF NOT EXISTS idx_weight_entries_user_id ON public.weight_entries(user_id);
CREATE INDEX IF NOT EXISTS idx_weight_entries_date ON public.weight_entries(date);
CREATE INDEX IF NOT EXISTS idx_user_meal_preferences_user_id ON public.user_meal_preferences(user_id);

-- =============================================
-- ROW LEVEL SECURITY (RLS)
-- =============================================

-- Enable RLS on user tables
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workout_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.weight_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_meal_preferences ENABLE ROW LEVEL SECURITY;

-- User profiles policies
CREATE POLICY "Users can view own profile" ON public.user_profiles
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own profile" ON public.user_profiles
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own profile" ON public.user_profiles
  FOR UPDATE USING (auth.uid() = user_id);

-- Workout logs policies
CREATE POLICY "Users can view own workout logs" ON public.workout_logs
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own workout logs" ON public.workout_logs
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own workout logs" ON public.workout_logs
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own workout logs" ON public.workout_logs
  FOR DELETE USING (auth.uid() = user_id);

-- Weight entries policies
CREATE POLICY "Users can view own weight entries" ON public.weight_entries
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own weight entries" ON public.weight_entries
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own weight entries" ON public.weight_entries
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own weight entries" ON public.weight_entries
  FOR DELETE USING (auth.uid() = user_id);

-- User meal preferences policies
CREATE POLICY "Users can view own meal preferences" ON public.user_meal_preferences
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own meal preferences" ON public.user_meal_preferences
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own meal preferences" ON public.user_meal_preferences
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own meal preferences" ON public.user_meal_preferences
  FOR DELETE USING (auth.uid() = user_id);

-- Reference tables are public read-only
ALTER TABLE public.exercises ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.foods ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.meals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.meal_foods ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workout_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workout_template_exercises ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view exercises" ON public.exercises
  FOR SELECT USING (true);

CREATE POLICY "Anyone can view foods" ON public.foods
  FOR SELECT USING (true);

CREATE POLICY "Anyone can view meals" ON public.meals
  FOR SELECT USING (true);

CREATE POLICY "Anyone can view meal_foods" ON public.meal_foods
  FOR SELECT USING (true);

CREATE POLICY "Anyone can view workout_templates" ON public.workout_templates
  FOR SELECT USING (true);

CREATE POLICY "Anyone can view workout_template_exercises" ON public.workout_template_exercises
  FOR SELECT USING (true);

-- =============================================
-- FUNCTIONS & TRIGGERS
-- =============================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers for updated_at
CREATE TRIGGER update_user_profiles_updated_at
  BEFORE UPDATE ON public.user_profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_workout_logs_updated_at
  BEFORE UPDATE ON public.workout_logs
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_meal_preferences_updated_at
  BEFORE UPDATE ON public.user_meal_preferences
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to create user profile on signup
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.user_profiles (user_id, name, current_weight, target_weight, height, start_date)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'name', 'New User'),
    80,
    75,
    175,
    CURRENT_DATE
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to create profile on user signup
CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

