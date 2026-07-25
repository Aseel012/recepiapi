import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, MaxLength } from 'class-validator';

export class CreateCategoryDto {
  @ApiProperty({ example: 'Dinner' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(120)
  name: string;
}
