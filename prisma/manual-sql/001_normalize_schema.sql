-- =====================================================================
-- Phase 2: Normalized schema — Category / Ingredient / Tag
-- Run this yourself with:
--   psql "$DATABASE_URL" -f prisma/manual-sql/001_normalize_schema.sql
-- (or paste it into psql / TablePlus / DBeaver / pgAdmin directly)
--
-- This is a HAND-WRITTEN equivalent of what `npx prisma migrate dev`
-- would generate from schema.prisma. Use ONE path, not both:
--   Path A: let Prisma manage it → npx prisma migrate dev --name normalize_schema
--   Path B: run this file yourself, then run `npx prisma db pull` +
--           `npx prisma generate` so Prisma's client matches reality.
-- =====================================================================

-- Drop old single-table version if you're upgrading from Phase 1
-- (comment these out if you want to keep old data — you'd need a real
-- data-migration step instead, see notes at the bottom of this file)
DROP TABLE IF EXISTS recipes CASCADE;


-- ── ENUM ──────────────────────────────────────────────────
DO $$ BEGIN
  CREATE TYPE "Difficulty" AS ENUM ('EASY', 'MEDIUM', 'HARD');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- ── categories ────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS categories (
  id         SERIAL PRIMARY KEY,
  name       VARCHAR(120) NOT NULL UNIQUE,
  created_at TIMESTAMP NOT NULL DEFAULT now()
);

-- ── tags ──────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS tags (
  id   SERIAL PRIMARY KEY,
  name VARCHAR(60) NOT NULL UNIQUE
);

-- ── recipes ───────────────────────────────────────────────
-- ManyToOne to categories: category_id is a foreign key living on THIS table.
CREATE TABLE IF NOT EXISTS recipes (
  id            SERIAL PRIMARY KEY,
  title         VARCHAR(120) NOT NULL,
  description   TEXT,
  cook_time_min INT NOT NULL CHECK (cook_time_min > 0),
  servings      INT NOT NULL CHECK (servings > 0),
  difficulty    "Difficulty" NOT NULL DEFAULT 'EASY',
  category_id   INT NOT NULL REFERENCES categories(id) ON DELETE RESTRICT,
  created_at    TIMESTAMP NOT NULL DEFAULT now(),
  updated_at    TIMESTAMP NOT NULL DEFAULT now()
);

-- Index the FK — every foreign key column should have an index,
-- Postgres does NOT create one automatically like it does for PRIMARY KEY.
CREATE INDEX IF NOT EXISTS idx_recipes_category_id ON recipes(category_id);

-- ── ingredients ───────────────────────────────────────────
-- OneToMany from recipes. ON DELETE CASCADE = deleting a recipe
-- automatically deletes all its ingredient rows (no orphans left behind).
CREATE TABLE IF NOT EXISTS ingredients (
  id        SERIAL PRIMARY KEY,
  name      VARCHAR(120) NOT NULL,
  quantity  NUMERIC(10, 2) NOT NULL CHECK (quantity > 0),
  unit      VARCHAR(20) NOT NULL,
  recipe_id INT NOT NULL REFERENCES recipes(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_ingredients_recipe_id ON ingredients(recipe_id);

-- ── recipe_tags (Many-to-Many join table) ────────────────
-- Composite primary key (recipe_id, tag_id) prevents duplicate tag
-- assignments. Both FKs cascade — deleting a recipe OR a tag cleans
-- up the join rows automatically.
CREATE TABLE IF NOT EXISTS recipe_tags (
  recipe_id INT NOT NULL REFERENCES recipes(id) ON DELETE CASCADE,
  tag_id    INT NOT NULL REFERENCES tags(id) ON DELETE CASCADE,
  PRIMARY KEY (recipe_id, tag_id)
);

CREATE INDEX IF NOT EXISTS idx_recipe_tags_tag_id ON recipe_tags(tag_id);

-- =====================================================================
-- NOTE on migrating existing Phase-1 data:
-- If you had real data in the old single-table `recipes` (with a text[]
-- `ingredients` column) that you want to KEEP, don't run the DROP TABLE
-- above blind. Instead:
--   1. Rename the old table:  ALTER TABLE recipes RENAME TO recipes_old;
--   2. Run everything below the DROP in this file.
--   3. Write a one-off script to INSERT INTO recipes (...) SELECT ... FROM
--      recipes_old, and unnest recipes_old.ingredients into INSERT INTO
--      ingredients (...) for each row.
--   4. DROP TABLE recipes_old; once you've verified the copy.
-- =====================================================================
