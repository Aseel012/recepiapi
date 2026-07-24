import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { RecipesRepository } from './recipes.repository';
import { CreateRecipeDto } from './dto/create-recipe.dto';
import { UpdateRecipeDto } from './dto/update-recipe.dto';
import { FindRecipesQueryDto } from './dto/find-recipes-query.dto';

// The service layer holds business logic and orchestrates the repository.
// Controllers never talk to Prisma directly — they only talk to this.
@Injectable()
export class RecipesService {
  constructor(private readonly repository: RecipesRepository) {}

  create(dto: CreateRecipeDto) {
    return this.repository.create(dto);
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
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
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
    // Ensure it exists first so we throw a clean 404 instead of
    // letting a raw Prisma P2025 error bubble up.
    await this.findOne(id);
    return this.repository.update(id, dto);
  }

  async remove(id: number) {
    await this.findOne(id);
    await this.repository.remove(id);
    return { message: `Recipe with id ${id} deleted successfully` };
  }
}
