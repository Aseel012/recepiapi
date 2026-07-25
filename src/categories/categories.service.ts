import { Injectable, NotFoundException } from '@nestjs/common';
import { CategoriesRepository } from './categories.repository';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';

@Injectable()
export class CategoriesService {
  constructor(private readonly repository: CategoriesRepository) {}

  create(dto: CreateCategoryDto) {
    return this.repository.create(dto);
  }

  findAll() {
    return this.repository.findMany();
  }

  async findOne(id: number) {
    const category = await this.repository.findOne(id);
    if (!category) {
      throw new NotFoundException(`Category with id ${id} not found`);
    }
    return category;
  }

  async update(id: number, dto: UpdateCategoryDto) {
    await this.findOne(id);
    return this.repository.update(id, dto);
  }

  async remove(id: number) {
    await this.findOne(id);
    // NOTE: recipes.category_id has ON DELETE RESTRICT, so this throws a
    // Prisma P2003 foreign key error (caught by the global exception filter
    // as a 400) if any recipe still references this category.
    await this.repository.remove(id);
    return { message: `Category with id ${id} deleted successfully` };
  }
}
