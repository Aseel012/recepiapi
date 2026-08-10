import { PrismaClient, Difficulty } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  // Categories first — recipes need an existing categoryId to reference.
  const [breakfast, dinner, dessert] = await Promise.all(
    ['Breakfast', 'Dinner', 'Dessert'].map((name) =>
      prisma.category.upsert({
        where: { name },
        update: {},
        create: { name },
      }),
    ),
  );
  await Promise.all(
    ['Lunch', 'Snacks'].map((name) =>
      prisma.category.upsert({ where: { name }, update: {}, create: { name } }),
    ),
  );

  await prisma.recipe.create({
    data: {
      title: 'Chicken Curry',
      description: 'Rich, spiced curry with tender chicken.',
      cookTimeMin: 45,
      servings: 4,
      difficulty: Difficulty.MEDIUM,
      category: { connect: { id: dinner.id } },
      ingredients: {
        create: [
          { name: 'Chicken thighs', quantity: 500, unit: 'g' },
          { name: 'Onion', quantity: 2, unit: 'pcs' },
          { name: 'Tomato puree', quantity: 200, unit: 'ml' },
          { name: 'Garam masala', quantity: 1, unit: 'tbsp' },
          { name: 'Ginger-garlic paste', quantity: 1, unit: 'tbsp' },
        ],
      },
      recipeTags: {
        create: [
          { tag: { connectOrCreate: { where: { name: 'Indian' }, create: { name: 'Indian' } } } },
          { tag: { connectOrCreate: { where: { name: 'Spicy' }, create: { name: 'Spicy' } } } },
          { tag: { connectOrCreate: { where: { name: 'Dinner' }, create: { name: 'Dinner' } } } },
        ],
      },
    },
  });

  await prisma.recipe.create({
    data: {
      title: 'Masala Chai',
      description: 'Spiced Indian tea to start your day.',
      cookTimeMin: 10,
      servings: 2,
      difficulty: Difficulty.EASY,
      category: { connect: { id: breakfast.id } },
      ingredients: {
        create: [
          { name: 'Water', quantity: 250, unit: 'ml' },
          { name: 'Milk', quantity: 250, unit: 'ml' },
          { name: 'Black tea leaves', quantity: 2, unit: 'tsp' },
          { name: 'Ginger', quantity: 1, unit: 'tsp' },
          { name: 'Cardamom', quantity: 2, unit: 'pcs' },
        ],
      },
      recipeTags: {
        create: [
          { tag: { connectOrCreate: { where: { name: 'Indian' }, create: { name: 'Indian' } } } },
          { tag: { connectOrCreate: { where: { name: 'Quick' }, create: { name: 'Quick' } } } },
        ],
      },
    },
  });

  await prisma.recipe.create({
    data: {
      title: 'Chocolate Mug Cake',
      description: 'Ready in 5 minutes, no oven needed.',
      cookTimeMin: 5,
      servings: 1,
      difficulty: Difficulty.EASY,
      category: { connect: { id: dessert.id } },
      ingredients: {
        create: [
          { name: 'Flour', quantity: 4, unit: 'tbsp' },
          { name: 'Cocoa powder', quantity: 2, unit: 'tbsp' },
          { name: 'Sugar', quantity: 3, unit: 'tbsp' },
          { name: 'Milk', quantity: 3, unit: 'tbsp' },
          { name: 'Oil', quantity: 2, unit: 'tbsp' },
        ],
      },
      recipeTags: {
        create: [
          { tag: { connectOrCreate: { where: { name: 'Quick' }, create: { name: 'Quick' } } } },
          { tag: { connectOrCreate: { where: { name: 'Dessert' }, create: { name: 'Dessert' } } } },
        ],
      },
    },
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
