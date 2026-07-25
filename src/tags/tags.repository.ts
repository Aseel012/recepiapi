import { Injectable } from '@nestjs/common';
import { Tag } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class TagsRepository {
  constructor(private readonly prisma: PrismaService) {}

  create(name: string): Promise<Tag> {
    return this.prisma.tag.create({ data: { name } });
  }

  findMany(): Promise<Tag[]> {
    return this.prisma.tag.findMany({ orderBy: { name: 'asc' } });
  }

  findOne(id: number): Promise<Tag | null> {
    return this.prisma.tag.findUnique({ where: { id } });
  }

  remove(id: number): Promise<Tag> {
    return this.prisma.tag.delete({ where: { id } });
  }
}
