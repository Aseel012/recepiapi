import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Difficulty } from '@prisma/client';
import { Type } from 'class-transformer';
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
  ValidateNested,
} from 'class-validator';
import { IngredientDto } from './ingredient.dto';

export class CreateRecipeDto {
  @ApiProperty({ example: 'Chicken Curry' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(120)
  title: string;

  @ApiPropertyOptional({ example: 'Rich, spiced curry with tender chicken.' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ example: 40, description: 'Cook time in minutes' })
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

  // ManyToOne — the recipe points at exactly one existing category id.
  @ApiProperty({ example: 1, description: 'Existing Category id' })
  @IsInt()
  categoryId: number;

  // OneToMany — a recipe is created together with its ingredient rows.
  @ApiProperty({ type: [IngredientDto] })
  @IsArray()
  @ArrayMinSize(1, { message: 'At least one ingredient is required' })
  @ValidateNested({ each: true })
  @Type(() => IngredientDto)
  ingredients: IngredientDto[];

  // Many-to-Many — tag NAMES, not ids. Unknown names get created on the fly
  // (connectOrCreate), so the client never needs to know tag ids up front.
  @ApiPropertyOptional({ example: ['Indian', 'Spicy', 'Dinner'] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tags?: string[];
}
