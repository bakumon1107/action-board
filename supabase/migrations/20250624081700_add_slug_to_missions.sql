-- Add slug column to missions table
ALTER TABLE missions ADD COLUMN slug TEXT;

-- Add unique constraint to slug
ALTER TABLE missions ADD CONSTRAINT missions_slug_unique UNIQUE (slug);
