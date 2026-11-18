-- Add slug column to mission_category table
ALTER TABLE mission_category ADD COLUMN slug TEXT;

-- Add unique constraint to slug
ALTER TABLE mission_category ADD CONSTRAINT mission_category_slug_unique UNIQUE (slug);
