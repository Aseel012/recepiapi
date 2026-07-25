# Recipe API

Project 1 — REST API Fundamentals, extended with **Phase 2 — Better Database Design**.
A CRUD API built with NestJS, PostgreSQL, and Prisma, now normalized into
`Category` (ManyToOne), `Ingredient` (OneToMany + Cascade), and `Tag` (Many-to-Many).

## Stack

- **NestJS** (TypeScript) — Controller / Service / Repository architecture, built in
- **PostgreSQL** — database
- **Prisma** — ORM / repository layer
- **class-validator / class-transformer** — DTO validation
- **Swagger** — auto-generated API docs at `/docs`

## Architecture

```
Controller  →  handles HTTP only (routes, status codes, request/response shape)
   ↓
Service     →  business logic, throws domain exceptions (e.g. NotFoundException)
   ↓
Repository  →  the ONLY layer that talks to Prisma / the database
```

This separation is the whole point of the project: it means you could swap Prisma
for raw SQL, or add caching, without touching the service or controller at all.

## Schema (Phase 2 — normalized)

```
Category  1 ──< Many   Recipe
Recipe    1 ──< Many   Ingredient      (ON DELETE CASCADE)
Recipe    Many ──< recipe_tags >── Many   Tag
```

- **Category → Recipe**: ManyToOne. `recipes.category_id` is a real foreign key.
  Deleting a Category that still has recipes is **blocked** (`ON DELETE RESTRICT`) —
  you'll get a 409 Conflict, not a silent orphan.
- **Recipe → Ingredient**: OneToMany. `ingredients.recipe_id` cascades — delete a
  recipe, its ingredient rows vanish automatically. "Orphan removal" (Prisma has
  no automatic JPA-style equivalent) is handled manually in `recipes.service.ts`:
  on `PATCH`, old ingredient rows are deleted and new ones created inside a
  `$transaction`, so a recipe never ends up with stale + new ingredients mixed.
- **Recipe ↔ Tag**: Many-to-Many through the explicit `recipe_tags` join table
  (composite PK `[recipe_id, tag_id]`, both FKs cascade).

## Setup

### 1. Install dependencies
```bash
npm install
```

### 2. Set up PostgreSQL
Easiest path — run Postgres in Docker:
```bash
docker run --name recipe-postgres -e POSTGRES_PASSWORD=postgres -e POSTGRES_DB=recipe_api -p 5432:5432 -d postgres:16
```
(Or point `DATABASE_URL` at any Postgres instance you already have — Neon, Supabase, local install, etc.)

### 3. Configure environment
```bash
cp .env.example .env
# edit .env if your DATABASE_URL differs from the default
```

### 4. Create the schema — pick ONE path

**Path A — let Prisma manage migrations (recommended day-to-day):**
```bash
npx prisma migrate dev --name normalize_schema
```

**Path B — write/run the SQL yourself** (this is what you asked for — a place to
practice raw SQL directly):
```bash
psql "$DATABASE_URL" -f prisma/manual-sql/001_normalize_schema.sql
# then sync Prisma's client to match what you just built by hand:
npx prisma generate
```
Either way you end up with the same tables. Don't run both — pick one.

`prisma/manual-sql/002_practice_queries.sql` has 10 ready-to-run queries
(joins across category/ingredient/tag, aggregations, an anti-join, and a
cascade-delete demo) — open it in psql or any GUI client and run them one
at a time to see the relations in action.

### 5. Seed sample data
```bash
npm run prisma:seed
```

### 6. Start the server
```bash
npm run start:dev
```

- API: http://localhost:3000
- Swagger docs: http://localhost:3000/docs
- Prisma Studio (DB GUI): `npm run prisma:studio`

## Endpoints

| Method | Path             | Description                                         |
|--------|------------------|------------------------------------------------------|
| POST   | /categories      | Create a category                                   |
| GET    | /categories      | List categories                                     |
| GET    | /categories/:id  | Get one category                                    |
| PATCH  | /categories/:id  | Update a category                                   |
| DELETE | /categories/:id  | Delete (blocked if recipes still reference it)      |
| POST   | /tags            | Create a tag                                        |
| GET    | /tags            | List tags                                           |
| DELETE | /tags/:id        | Delete a tag (cascades join rows)                   |
| POST   | /recipes         | Create a recipe with ingredients + tags             |
| GET    | /recipes         | List recipes (pagination + filters)                 |
| GET    | /recipes/:id     | Get one recipe (category + ingredients + tags)      |
| PATCH  | /recipes/:id     | Partial update (replaces ingredients/tags if sent)  |
| DELETE | /recipes/:id     | Delete a recipe (cascades ingredients + tags)       |

### Example: create a category first
```bash
curl -X POST http://localhost:3000/categories \
  -H "Content-Type: application/json" \
  -d '{"name": "Dinner"}'
# → { "id": 1, "name": "Dinner", ... }
```

### Example: create a recipe (nested ingredients, tag names auto-created)
```bash
curl -X POST http://localhost:3000/recipes \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Chicken Curry",
    "cookTimeMin": 45,
    "servings": 4,
    "difficulty": "MEDIUM",
    "categoryId": 1,
    "ingredients": [
      { "name": "Chicken thighs", "quantity": 500, "unit": "g" },
      { "name": "Onion", "quantity": 2, "unit": "pcs" }
    ],
    "tags": ["Indian", "Spicy", "Dinner"]
  }'
```

### Example: list with filters
```bash
curl "http://localhost:3000/recipes?difficulty=EASY&page=1&limit=5"
```

### Example: update — replaces ingredients (orphan removal in action)
```bash
curl -X PATCH http://localhost:3000/recipes/1 \
  -H "Content-Type: application/json" \
  -d '{ "ingredients": [{ "name": "Tofu", "quantity": 300, "unit": "g" }] }'
# The old ingredient rows are deleted, replaced with just this one — no orphans left.
```

## What each concept maps to in this codebase

- **Controllers** → `src/recipes/recipes.controller.ts`, `src/categories/categories.controller.ts`, `src/tags/tags.controller.ts`
- **Services** → `*.service.ts` in each module
- **Repository** → `*.repository.ts` in each module — the only files that call Prisma
- **DTOs** → `dto/*.dto.ts` in each module
- **Validation** → `class-validator` decorators + global `ValidationPipe` in `main.ts`
- **Exception Handling** → `src/common/filters/http-exception.filter.ts` (HTTP errors, P2025 not-found, P2002 duplicate, P2003 FK-restrict)
- **PostgreSQL** → `prisma/schema.prisma` + `DATABASE_URL` in `.env`
- **`@ManyToOne` / `@OneToMany`** → `Recipe.categoryId` / `Category.recipes` in `schema.prisma`
- **Foreign Keys** → `category_id`, `recipe_id`, `recipe_tags.tag_id` — see `prisma/manual-sql/001_normalize_schema.sql` for the raw `REFERENCES ... ON DELETE ...` syntax
- **Cascade** → `Ingredient.recipe` and `RecipeTag` both use `onDelete: Cascade`
- **Orphan removal** → handled manually in `recipes.service.ts#update()` via `deleteMany` + `create` inside a `$transaction` (Prisma has no automatic equivalent — see the comment in that function)
- **Many-to-Many** → the explicit `RecipeTag` join model (composite `@@id([recipeId, tagId])`) in `schema.prisma`

## Raw SQL practice

- `prisma/manual-sql/001_normalize_schema.sql` — the schema, hand-written, runnable with `psql`
- `prisma/manual-sql/002_practice_queries.sql` — 10 queries covering every join type (ManyToOne join, OneToMany join, Many-to-Many join, aggregation, anti-join for "no tags", cascade-delete demo)

## Tests

```bash
npm test
```
Includes a unit test for the service layer using a mocked repository —
this is the pattern to copy for testing any other module without touching the real database.

## Next steps to extend this project

- Add auth (JWT) and scope recipes to a user
- Add pagination + full-text search on ingredient names
- Add image upload for recipe photos
- Add rate limiting (`@nestjs/throttler`)
- Write e2e tests against a real test database (including a cascade-delete e2e test)
