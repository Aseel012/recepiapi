import { Injectable } from '@nestjs/common';
import { Prisma, Recipe } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';

// The repository's ONLY job is talking to the database.
// No business rules, no HTTP concerns — just Prisma queries.
// This is what makes the service layer swappable/testable later
// (e.g. swap Prisma for raw SQL without touching RecipesService).
@Injectable()
export class RecipesRepository {
  constructor(private readonly prisma: PrismaService) {}

  
  create(data: Prisma.RecipeCreateInput): Promise<Recipe> {
    return this.prisma.recipe.create({ data });
  }

  
  findMany(params: {
    where?: Prisma.RecipeWhereInput;
    skip?: number;
    take?: number;
  }): Promise<Recipe[]> {
    return this.prisma.recipe.findMany({
      where: params.where,
      skip: params.skip,
      take: params.take,
      orderBy: { createdAt: 'desc' },
    });
  }

  count(where?: Prisma.RecipeWhereInput): Promise<number> {
    return this.prisma.recipe.count({ where });
  }

  findOne(id: number): Promise<Recipe | null> {
    return this.prisma.recipe.findUnique({ where: { id } });
  }

  update(id: number, data: Prisma.RecipeUpdateInput): Promise<Recipe> {
    return this.prisma.recipe.update({ where: { id }, data });
  }

  remove(id: number): Promise<Recipe> {
    return this.prisma.recipe.delete({ where: { id } });
  }
}
