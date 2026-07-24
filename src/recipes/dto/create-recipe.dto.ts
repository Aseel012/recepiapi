import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Difficulty } from '@prisma/client';
import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsInt,
  Min,
  IsArray,
  ArrayMinSize,
  IsEnum,
  MaxLength,
} from 'class-validator';

export class CreateRecipeDto {
  @ApiProperty({ example: 'Classic Margherita Pizza' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(120)
  title: string;

  @ApiPropertyOptional({ example: 'Simple, fresh, and always a crowd pleaser.' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ example: ['Pizza dough', 'Tomatoes', 'Mozzarella'] })
  @IsArray()
  @ArrayMinSize(1, { message: 'At least one ingredient is required' })
  @IsString({ each: true })
  ingredients: string[];

  @ApiProperty({ example: ['Preheat oven', 'Add toppings', 'Bake for 10 minutes'] })
  @IsArray()
  @ArrayMinSize(1, { message: 'At least one step is required' })
  @IsString({ each: true })
  steps: string[];

  @ApiProperty({ example: 25, description: 'Cook time in minutes' })
  @IsInt()
  @Min(1)
  cookTimeMin: number;

  @ApiProperty({ example: 4 })
  @IsInt()
  @Min(1)
  servings: number;

  @ApiPropertyOptional({ enum: Difficulty, default: Difficulty.EASY })
  @IsOptional()
  @IsEnum(Difficulty)
  difficulty?: Difficulty;
}
