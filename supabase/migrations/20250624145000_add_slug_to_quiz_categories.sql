-- Add slug column to quiz_categories table
ALTER TABLE quiz_categories ADD COLUMN IF NOT EXISTS slug TEXT;

-- Create unique index on slug
CREATE UNIQUE INDEX IF NOT EXISTS idx_quiz_categories_slug ON quiz_categories(slug);
