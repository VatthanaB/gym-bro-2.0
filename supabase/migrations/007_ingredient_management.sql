-- Migration: Ingredient Management System
-- This migration adds:
-- 1. is_enabled column to foods and custom_foods tables for visibility control
-- 2. food_category_assignments table to allow ingredients to appear in multiple meal categories

-- Add is_enabled column to foods table
ALTER TABLE public.foods ADD COLUMN IF NOT EXISTS is_enabled BOOLEAN DEFAULT TRUE;

-- Add is_enabled column to custom_foods table
ALTER TABLE custom_foods ADD COLUMN IF NOT EXISTS is_enabled BOOLEAN DEFAULT TRUE;

-- Create food_category_assignments table for multi-category support
-- This allows a single ingredient to appear in multiple meal categories
-- (e.g., a protein available in both lunchProteins and dinnerProteins)
CREATE TABLE IF NOT EXISTS public.food_category_assignments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  food_id TEXT NOT NULL,
  food_source TEXT NOT NULL CHECK (food_source IN ('foods', 'custom_foods')),
  category TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(food_id, food_source, category)
);

-- Enable RLS on food_category_assignments
ALTER TABLE public.food_category_assignments ENABLE ROW LEVEL SECURITY;

-- Policy: Anyone can read category assignments
CREATE POLICY "Anyone can read food category assignments" ON public.food_category_assignments
  FOR SELECT USING (true);

-- Policy: Only admins can insert category assignments
CREATE POLICY "Admins can insert food category assignments" ON public.food_category_assignments
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM user_profiles 
      WHERE user_id = auth.uid() AND is_admin = true
    )
  );

-- Policy: Only admins can update category assignments
CREATE POLICY "Admins can update food category assignments" ON public.food_category_assignments
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM user_profiles 
      WHERE user_id = auth.uid() AND is_admin = true
    )
  );

-- Policy: Only admins can delete category assignments
CREATE POLICY "Admins can delete food category assignments" ON public.food_category_assignments
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM user_profiles 
      WHERE user_id = auth.uid() AND is_admin = true
    )
  );

-- Create indexes for faster lookups
CREATE INDEX IF NOT EXISTS idx_food_category_assignments_food ON public.food_category_assignments(food_id, food_source);
CREATE INDEX IF NOT EXISTS idx_food_category_assignments_category ON public.food_category_assignments(category);

-- Add RLS policies for admins to update/delete foods table
-- (foods table may not have had these policies before)

-- Policy: Only admins can update foods
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'foods' AND policyname = 'Admins can update foods'
  ) THEN
    CREATE POLICY "Admins can update foods" ON public.foods
      FOR UPDATE USING (
        EXISTS (
          SELECT 1 FROM user_profiles 
          WHERE user_id = auth.uid() AND is_admin = true
        )
      );
  END IF;
END $$;

-- Policy: Only admins can delete foods
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'foods' AND policyname = 'Admins can delete foods'
  ) THEN
    CREATE POLICY "Admins can delete foods" ON public.foods
      FOR DELETE USING (
        EXISTS (
          SELECT 1 FROM user_profiles 
          WHERE user_id = auth.uid() AND is_admin = true
        )
      );
  END IF;
END $$;

-- Policy: Only admins can insert foods
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'foods' AND policyname = 'Admins can insert foods'
  ) THEN
    CREATE POLICY "Admins can insert foods" ON public.foods
      FOR INSERT WITH CHECK (
        EXISTS (
          SELECT 1 FROM user_profiles 
          WHERE user_id = auth.uid() AND is_admin = true
        )
      );
  END IF;
END $$;
