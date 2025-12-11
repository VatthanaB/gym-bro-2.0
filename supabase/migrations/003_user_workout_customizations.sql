-- =============================================
-- USER WORKOUT CUSTOMIZATIONS TABLE
-- Stores user-specific workout customizations (swapped/added exercises) per week
-- =============================================

-- User workout customizations table
CREATE TABLE IF NOT EXISTS public.user_workout_customizations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  day_of_week INTEGER NOT NULL CHECK (day_of_week >= 0 AND day_of_week <= 6),
  week_start DATE NOT NULL,  -- Start of the week (Sunday) - supports past/current/future weeks
  swapped_exercises JSONB NOT NULL DEFAULT '[]',  -- [{originalId, replacementId}]
  added_exercises JSONB NOT NULL DEFAULT '[]',    -- [exerciseId, ...]
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(user_id, day_of_week, week_start)
);

-- =============================================
-- INDEXES
-- =============================================

CREATE INDEX IF NOT EXISTS idx_user_workout_customizations_user_id 
  ON public.user_workout_customizations(user_id);
CREATE INDEX IF NOT EXISTS idx_user_workout_customizations_week_start 
  ON public.user_workout_customizations(week_start);
CREATE INDEX IF NOT EXISTS idx_user_workout_customizations_user_week 
  ON public.user_workout_customizations(user_id, week_start);

-- =============================================
-- ROW LEVEL SECURITY (RLS)
-- =============================================

ALTER TABLE public.user_workout_customizations ENABLE ROW LEVEL SECURITY;

-- Users can view their own workout customizations
CREATE POLICY "Users can view own workout customizations" ON public.user_workout_customizations
  FOR SELECT USING (auth.uid() = user_id);

-- Users can insert their own workout customizations
CREATE POLICY "Users can insert own workout customizations" ON public.user_workout_customizations
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Users can update their own workout customizations
CREATE POLICY "Users can update own workout customizations" ON public.user_workout_customizations
  FOR UPDATE USING (auth.uid() = user_id);

-- Users can delete their own workout customizations
CREATE POLICY "Users can delete own workout customizations" ON public.user_workout_customizations
  FOR DELETE USING (auth.uid() = user_id);

-- =============================================
-- TRIGGERS
-- =============================================

-- Trigger for updated_at
CREATE TRIGGER update_user_workout_customizations_updated_at
  BEFORE UPDATE ON public.user_workout_customizations
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

