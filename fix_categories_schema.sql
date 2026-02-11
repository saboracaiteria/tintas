-- Add active and display_order columns to categories table
-- Run this in the Supabase SQL Editor

DO $$
BEGIN
    -- Add active column if not exists
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'categories' AND column_name = 'active') THEN
        ALTER TABLE categories ADD COLUMN active BOOLEAN DEFAULT true;
    END IF;

    -- Add display_order column if not exists
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'categories' AND column_name = 'display_order') THEN
        ALTER TABLE categories ADD COLUMN display_order INTEGER DEFAULT 0;
    END IF;
END $$;
