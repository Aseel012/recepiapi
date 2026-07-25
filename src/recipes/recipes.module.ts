import { Module } from '@nestjs/common';
import { RecipesController } from './recipes.controller';
import { RecipesService } from './recipes.service';
import { RecipesRepository } from './recipes.repository';
import { CategoriesModule } from '../categories/categories.module';

@Module({
  imports: [CategoriesModule], // needed for CategoriesRepository (category existence check)
  controllers: [RecipesController],
  providers: [RecipesService, RecipesRepository],
})
export class RecipesModule {}
