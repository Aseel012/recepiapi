# Recipe API

Project 1 — REST API Fundamentals. A CRUD API built with NestJS, PostgreSQL, and Prisma.

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

### 4. Run the migration (creates the `recipes` table)
```bash
npx prisma migrate dev --name init
```

### 5. (Optional) Seed sample data
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

| Method | Path            | Description                          |
|--------|-----------------|--------------------------------------|
| POST   | /recipes        | Create a recipe                      |
| GET    | /recipes        | List recipes (pagination + filters)  |
| GET    | /recipes/:id    | Get one recipe                       |
| PATCH  | /recipes/:id    | Partial update                       |
| DELETE | /recipes/:id    | Delete a recipe                      |

### Example: create a recipe
```bash
curl -X POST http://localhost:3000/recipes \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Masala Chai",
    "ingredients": ["Water", "Milk", "Tea leaves", "Ginger", "Cardamom"],
    "steps": ["Boil water with spices", "Add tea", "Add milk", "Strain and serve"],
    "cookTimeMin": 10,
    "servings": 2,
    "difficulty": "EASY"
  }'
```

### Example: list with filters
```bash
curl "http://localhost:3000/recipes?difficulty=EASY&page=1&limit=5"
```

## What each concept maps to in this codebase

- **Controllers** → `src/recipes/recipes.controller.ts`
- **Services** → `src/recipes/recipes.service.ts`
- **Repository** → `src/recipes/recipes.repository.ts`
- **DTOs** → `src/recipes/dto/*.dto.ts`
- **Validation** → `class-validator` decorators on DTOs + global `ValidationPipe` in `main.ts`
- **Exception Handling** → `src/common/filters/http-exception.filter.ts` (catches HTTP + Prisma errors)
- **PostgreSQL** → `prisma/schema.prisma` + `DATABASE_URL` in `.env`

## Tests

```bash
npm test
```
Includes a unit test for the service layer (`recipes.service.spec.ts`) using a mocked repository —
this is the pattern to copy for testing any other module without touching the real database.

## Next steps to extend this project

- Add auth (JWT) and scope recipes to a user
- Add a `Category` or `Tag` model with a relation to `Recipe`
- Add image upload for recipe photos
- Add rate limiting (`@nestjs/throttler`)
- Write e2e tests against a real test database
