import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsNumber, Min, MaxLength } from 'class-validator';

export class IngredientDto {
  @ApiProperty({ example: 'Egg' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(120)
  name: string;

  @ApiProperty({ example: 2 })
  @IsNumber()
  @Min(0.01)
  quantity: number;

  @ApiProperty({ example: 'pcs', description: 'e.g. g, ml, tsp, tbsp, pcs' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(20)
  unit: string;
}
