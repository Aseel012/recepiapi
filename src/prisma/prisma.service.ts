import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

// Wrapping PrismaClient in a Nest-managed service lets us inject it
// anywhere via DI, and hook into Nest's lifecycle for connect/disconnect.
@Injectable()
export class PrismaService
  extends PrismaClient
  implements OnModuleInit, OnModuleDestroy
{
  async onModuleInit() {
    await this.$connect();
  }

  
  async onModuleDestroy() {
    await this.$disconnect();
  }
}
