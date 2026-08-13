import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Patch,
  Delete,
  Query,
  ParseIntPipe,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { RecipesService } from './recipes.service';
import { CreateRecipeDto } from './dto/create-recipe.dto';
import { UpdateRecipeDto } from './dto/update-recipe.dto';
import { FindRecipesQueryDto } from './dto/find-recipes-query.dto';

// Controllers stay THIN: parse the request, call the service, return the result.
// No business logic and no direct DB access lives here.
@ApiTags('recipes')
@Controller('recipes')
export class RecipesController {
  constructor(private readonly recipesService: RecipesService) {}

  
  @Post()
  @ApiOperation({ summary: 'Create a new recipe' })
  @ApiResponse({ status: 201, description: 'Recipe created' })
  @ApiResponse({ status: 400, description: 'Validation failed' })
  create(@Body() createRecipeDto: CreateRecipeDto) {
    return this.recipesService.create(createRecipeDto);
  }

  
  @Get()
  @ApiOperation({ summary: 'List recipes (paginated, filterable)' })
  findAll(@Query() query: FindRecipesQueryDto) {
    return this.recipesService.findAll(query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a single recipe by id' })
  @ApiResponse({ status: 404, description: 'Recipe not found' })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.recipesService.findOne(id);
  }

  
  @Patch(':id')
  @ApiOperation({ summary: 'Update a recipe (partial update)' })
  @ApiResponse({ status: 404, description: 'Recipe not found' })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateRecipeDto: UpdateRecipeDto,
  ) {
    return this.recipesService.update(id, updateRecipeDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Delete a recipe' })
  @ApiResponse({ status: 404, description: 'Recipe not found' })
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.recipesService.remove(id);
  }
}
