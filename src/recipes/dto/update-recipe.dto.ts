import { PartialType } from '@nestjs/swagger';
import { CreateRecipeDto } from './create-recipe.dto';

// PartialType makes every field from CreateRecipeDto optional,
// while keeping all its validation rules — perfect for PATCH.
export class UpdateRecipeDto extends PartialType(CreateRecipeDto) {}
