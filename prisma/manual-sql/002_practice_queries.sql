-- =====================================================================
-- Practice queries against the normalized schema.
-- Run with: psql "$DATABASE_URL" -f prisma/manual-sql/002_practice_queries.sql
-- Or copy individual queries into psql / a GUI client / Prisma Studio's
-- raw query tab.
-- =====================================================================



-- 1. Every recipe with its category name (ManyToOne join)
SELECT r.id, r.title, c.name AS category
FROM recipes r
JOIN categories c ON c.id = r.category_id
ORDER BY r.id;


-- 2. All ingredients for a single recipe (OneToMany)
SELECT i.name, i.quantity, i.unit
FROM ingredients i
WHERE i.recipe_id = 1;

-- 3. All tags for a single recipe (Many-to-Many via join table)
SELECT t.name
FROM tags t
JOIN recipe_tags rt ON rt.tag_id = t.id
WHERE rt.recipe_id = 1;

-- 4. Full recipe detail in one query: category + ingredients + tags
-- (aggregated so it's one row per recipe instead of a row-explosion join)
SELECT
  r.id,
  r.title,
  c.name AS category,
  json_agg(DISTINCT jsonb_build_object(
    'name', i.name, 'quantity', i.quantity, 'unit', i.unit
  )) FILTER (WHERE i.id IS NOT NULL) AS ingredients,
  array_agg(DISTINCT t.name) FILTER (WHERE t.id IS NOT NULL) AS tags
FROM recipes r
JOIN categories c ON c.id = r.category_id
LEFT JOIN ingredients i ON i.recipe_id = r.id
LEFT JOIN recipe_tags rt ON rt.recipe_id = r.id
LEFT JOIN tags t ON t.id = rt.tag_id
GROUP BY r.id, r.title, c.name
ORDER BY r.id;

-- 5. How many recipes per category
SELECT c.name AS category, COUNT(r.id) AS recipe_count
FROM categories c
LEFT JOIN recipes r ON r.category_id = c.id
GROUP BY c.name
ORDER BY recipe_count DESC;

-- 6. All recipes tagged "Spicy" AND category "Dinner"
SELECT r.title
FROM recipes r
JOIN categories c ON c.id = r.category_id AND c.name = 'Dinner'
JOIN recipe_tags rt ON rt.recipe_id = r.id
JOIN tags t ON t.id = rt.tag_id AND t.name = 'Spicy';

-- 7. Recipes with NO tags at all (LEFT JOIN + IS NULL anti-join pattern)
SELECT r.title
FROM recipes r
LEFT JOIN recipe_tags rt ON rt.recipe_id = r.id
WHERE rt.recipe_id IS NULL;

-- 8. Most-used tags across all recipes
SELECT t.name, COUNT(rt.recipe_id) AS usage_count
FROM tags t
JOIN recipe_tags rt ON rt.tag_id = t.id
GROUP BY t.name
ORDER BY usage_count DESC;

-- 9. Delete a recipe and watch cascade do the cleanup
-- (ingredients + recipe_tags rows for it disappear automatically)
-- DELETE FROM recipes WHERE id = 1;

-- 10. Prove orphan cleanup: this should return 0 rows after query 9
-- SELECT * FROM ingredients WHERE recipe_id = 1;
