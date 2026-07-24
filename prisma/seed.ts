import { PrismaClient, Difficulty } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  await prisma.recipe.createMany({
    data: [
      {
        title: 'Classic Margherita Pizza',
        description: 'Simple, fresh, and always a crowd pleaser.',
        ingredients: [
          'Pizza dough',
          'San Marzano tomatoes',
          'Fresh mozzarella',
          'Basil leaves',
          'Olive oil',
        ],
        steps: [
          'Preheat oven to 250°C with a pizza stone inside.',
          'Stretch the dough into a round base.',
          'Spread crushed tomatoes evenly over the dough.',
          'Add torn mozzarella pieces.',
          'Bake for 8-10 minutes until crust is golden.',
          'Top with fresh basil and a drizzle of olive oil.',
        ],
        cookTimeMin: 25,
        servings: 4,
        difficulty: Difficulty.MEDIUM,
      },
      {
        title: 'Masala Chai',
        description: 'Spiced Indian tea to start your day.',
        ingredients: [
          'Water',
          'Milk',
          'Black tea leaves',
          'Ginger',
          'Cardamom',
          'Sugar',
        ],
        steps: [
          'Boil water with crushed ginger and cardamom.',
          'Add tea leaves and simmer for 2 minutes.',
          'Add milk and bring to a boil.',
          'Strain into cups and add sugar to taste.',
        ],
        cookTimeMin: 10,
        servings: 2,
        difficulty: Difficulty.EASY,
      },
    ],
    skipDuplicates: true,
  });

  console.log('Seed data inserted.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
