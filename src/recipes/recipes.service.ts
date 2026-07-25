import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { RecipesRepository } from './recipes.repository';
import { CategoriesRepository } from '../categories/categories.repository';
import { CreateRecipeDto } from './dto/create-recipe.dto';
import { UpdateRecipeDto } from './dto/update-recipe.dto';
import { FindRecipesQueryDto } from './dto/find-recipes-query.dto';

@Injectable()
export class RecipesService {
  constructor(
    private readonly repository: RecipesRepository,
    private readonly categoriesRepository: CategoriesRepository,
  ) {}

  async create(dto: CreateRecipeDto) {
    // Validate the category exists up front so we throw a clean 404
    // instead of a raw FK-violation from Postgres.
    const category = await this.categoriesRepository.findOne(dto.categoryId);
    if (!category) {
      throw new NotFoundException(`Category with id ${dto.categoryId} not found`);
    }

    const data: Prisma.RecipeCreateInput = {
      title: dto.title,
      description: dto.description,
      cookTimeMin: dto.cookTimeMin,
      servings: dto.servings,
      difficulty: dto.difficulty,
      category: { connect: { id: dto.categoryId } },
      // Nested create — Prisma inserts the recipe AND its ingredient rows
      // in a single transaction. This is the OneToMany write side.
      ingredients: {
        create: dto.ingredients.map((i) => ({
          name: i.name,
          quantity: i.quantity,
          unit: i.unit,
        })),
      },
      // Many-to-Many via the explicit join model: for each tag name,
      // connectOrCreate either links an existing Tag or creates a new one
      // on the fly, then creates the recipe_tags join row.
      recipeTags: dto.tags
        ? {
            create: dto.tags.map((name) => ({
              tag: {
                connectOrCreate: {
                  where: { name },
                  create: { name },
                },
              },
            })),
          }
        : undefined,
    };

    return this.repository.create(data);
  }

  async findAll(query: FindRecipesQueryDto) {
    const { title, difficulty, page = 1, limit = 10 } = query;

    const where: Prisma.RecipeWhereInput = {
      ...(title && { title: { contains: title, mode: 'insensitive' } }),
      ...(difficulty && { difficulty }),
    };

    const skip = (page - 1) * limit;

    const [data, total] = await Promise.all([
      this.repository.findMany({ where, skip, take: limit }),
      this.repository.count(where),
    ]);

    return {
      data,
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
    };
  }

  async findOne(id: number) {
    const recipe = await this.repository.findOne(id);
    if (!recipe) {
      throw new NotFoundException(`Recipe with id ${id} not found`);
    }
    return recipe;
  }

  async update(id: number, dto: UpdateRecipeDto) {
    await this.findOne(id);

    if (dto.categoryId) {
      const category = await this.categoriesRepository.findOne(dto.categoryId);
      if (!category) {
        throw new NotFoundException(`Category with id ${dto.categoryId} not found`);
      }
    }

    // Ingredients and tags need "orphan removal": if the client sends a new
    // ingredients array, the OLD ingredient rows that aren't in it anymore
    // must be deleted, not just left dangling. Prisma has no automatic
    // orphanRemoval like JPA, so we do it explicitly with `deleteMany` +
    // `create` inside one transaction — either both succeed or neither does.
    return this.repository.client.$transaction(async (tx) => {
      if (dto.ingredients) {
        await tx.ingredient.deleteMany({ where: { recipeId: id } });
      }
      if (dto.tags) {
        await tx.recipeTag.deleteMany({ where: { recipeId: id } });
      }

      return tx.recipe.update({
        where: { id },
        data: {
          title: dto.title,
          description: dto.description,
          cookTimeMin: dto.cookTimeMin,
          servings: dto.servings,
          difficulty: dto.difficulty,
          category: dto.categoryId ? { connect: { id: dto.categoryId } } : undefined,
          ingredients: dto.ingredients
            ? {
                create: dto.ingredients.map((i) => ({
                  name: i.name,
                  quantity: i.quantity,
                  unit: i.unit,
                })),
              }
            : undefined,
          recipeTags: dto.tags
            ? {
                create: dto.tags.map((name) => ({
                  tag: {
                    connectOrCreate: { where: { name }, create: { name } },
                  },
                })),
              }
            : undefined,
        },
        include: {
          category: true,
          ingredients: true,
          recipeTags: { include: { tag: true } },
        },
      });
    });
  }

  async remove(id: number) {
    await this.findOne(id);
    // Cascade (DB-level) takes care of ingredients + recipe_tags rows.
    await this.repository.remove(id);
    return { message: `Recipe with id ${id} deleted successfully` };
  }
}
