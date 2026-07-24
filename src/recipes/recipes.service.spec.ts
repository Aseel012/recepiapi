import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { RecipesService } from './recipes.service';
import { RecipesRepository } from './recipes.repository';

describe('RecipesService', () => {
  let service: RecipesService;
  let repository: jest.Mocked<RecipesRepository>;

  const mockRecipe = {
    id: 1,
    title: 'Test Recipe',
    description: null,
    ingredients: ['salt'],
    steps: ['mix'],
    cookTimeMin: 10,
    servings: 2,
    difficulty: 'EASY' as const,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RecipesService,
        {
          provide: RecipesRepository,
          useValue: {
            create: jest.fn(),
            findMany: jest.fn(),
            count: jest.fn(),
            findOne: jest.fn(),
            update: jest.fn(),
            remove: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get(RecipesService);
    repository = module.get(RecipesRepository);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findOne', () => {
    it('returns the recipe when found', async () => {
      repository.findOne.mockResolvedValue(mockRecipe);
      const result = await service.findOne(1);
      expect(result).toEqual(mockRecipe);
    });

    it('throws NotFoundException when missing', async () => {
      repository.findOne.mockResolvedValue(null);
      await expect(service.findOne(999)).rejects.toThrow(NotFoundException);
    });
  });

  describe('remove', () => {
    it('deletes an existing recipe', async () => {
      repository.findOne.mockResolvedValue(mockRecipe);
      repository.remove.mockResolvedValue(mockRecipe);
      const result = await service.remove(1);
      expect(repository.remove).toHaveBeenCalledWith(1);
      expect(result.message).toContain('deleted successfully');
    });

    it('throws NotFoundException if recipe does not exist', async () => {
      repository.findOne.mockResolvedValue(null);
      await expect(service.remove(999)).rejects.toThrow(NotFoundException);
    });
  });
});
