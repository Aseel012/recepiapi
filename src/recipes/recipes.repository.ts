import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';

// Every findMany/findOne includes the full relation graph so the API
// always returns category + ingredients + tags in one response — the
// client never has to make three separate requests to reassemble a recipe.
const recipeInclude = {
  category: true,
  ingredients: true,
  recipeTags: { include: { tag: true } },
} satisfies Prisma.RecipeInclude;

@Injectable()
export class RecipesRepository {
  constructor(private readonly prisma: PrismaService) {}

<<<<<<< HEAD
  
  create(data: Prisma.RecipeCreateInput): Promise<Recipe> {
    return this.prisma.recipe.create({ data });
=======
  create(data: Prisma.RecipeCreateInput) {
    return this.prisma.recipe.create({ data, include: recipeInclude });
>>>>>>> 1f9ad38 (udapted)
  }

  
  findMany(params: {
    where?: Prisma.RecipeWhereInput;
    skip?: number;
    take?: number;
  }) {
    return this.prisma.recipe.findMany({
      where: params.where,
      skip: params.skip,
      take: params.take,
      orderBy: { createdAt: 'desc' },
      include: recipeInclude,
    });
  }

  count(where?: Prisma.RecipeWhereInput) {
    return this.prisma.recipe.count({ where });
  }

  findOne(id: number) {
    return this.prisma.recipe.findUnique({
      where: { id },
      include: recipeInclude,
    });
  }

  update(id: number, data: Prisma.RecipeUpdateInput) {
    return this.prisma.recipe.update({
      where: { id },
      data,
      include: recipeInclude,
    });
  }

  // onDelete: Cascade on Ingredient + RecipeTag means this single call
  // also removes every ingredient row and every recipe_tags join row.
  remove(id: number) {
    return this.prisma.recipe.delete({ where: { id } });
  }

  // Exposes the raw Prisma client for the one case (update) where the
  // service needs to run several statements as one atomic transaction.
  get client() {
    return this.prisma;
  }
}
