import { Injectable, NotFoundException } from '@nestjs/common';
import { TagsRepository } from './tags.repository';
import { CreateTagDto } from './dto/create-tag.dto';

@Injectable()
export class TagsService {
  constructor(private readonly repository: TagsRepository) {}

  create(dto: CreateTagDto) {
    return this.repository.create(dto.name);
  }

  findAll() {
    return this.repository.findMany();
  }

  async findOne(id: number) {
    const tag = await this.repository.findOne(id);
    if (!tag) {
      throw new NotFoundException(`Tag with id ${id} not found`);
    }
    return tag;
  }

  async remove(id: number) {
    await this.findOne(id);
    // recipe_tags rows cascade-delete automatically — no orphaned join rows.
    await this.repository.remove(id);
    return { message: `Tag with id ${id} deleted successfully` };
  }
}
