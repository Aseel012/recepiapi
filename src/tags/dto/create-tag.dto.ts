import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, MaxLength } from 'class-validator';

export class CreateTagDto {
  @ApiProperty({ example: 'Spicy' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(60)
  name: string;
}
