-- =============================================
-- USER EXERCISE DATA TABLE
-- Stores user-specific customizations for exercises (weight, sets, reps)
-- =============================================

-- User exercise data table
CREATE TABLE IF NOT EXISTS public.user_exercise_data (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  exercise_id TEXT NOT NULL REFERENCES public.exercises(id) ON DELETE CASCADE,
  weight DECIMAL,
  sets INTEGER,
  reps TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(user_id, exercise_id)
);

-- =============================================
-- INDEXES
-- =============================================

CREATE INDEX IF NOT EXISTS idx_user_exercise_data_user_id ON public.user_exercise_data(user_id);
CREATE INDEX IF NOT EXISTS idx_user_exercise_data_exercise_id ON public.user_exercise_data(exercise_id);

-- =============================================
-- ROW LEVEL SECURITY (RLS)
-- =============================================

ALTER TABLE public.user_exercise_data ENABLE ROW LEVEL SECURITY;

-- Users can view their own exercise data
CREATE POLICY "Users can view own exercise data" ON public.user_exercise_data
  FOR SELECT USING (auth.uid() = user_id);

-- Users can insert their own exercise data
CREATE POLICY "Users can insert own exercise data" ON public.user_exercise_data
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Users can update their own exercise data
CREATE POLICY "Users can update own exercise data" ON public.user_exercise_data
  FOR UPDATE USING (auth.uid() = user_id);

-- Users can delete their own exercise data
CREATE POLICY "Users can delete own exercise data" ON public.user_exercise_data
  FOR DELETE USING (auth.uid() = user_id);

-- =============================================
-- TRIGGERS
-- =============================================

-- Trigger for updated_at
CREATE TRIGGER update_user_exercise_data_updated_at
  BEFORE UPDATE ON public.user_exercise_data
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

