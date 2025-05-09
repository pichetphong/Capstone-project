import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET() {
  try {
    const ingredients = await prisma.ingredients.findMany();

    if (ingredients.length === 0) {
      console.log('⚠️ No ingredients found.');
      return new Response(JSON.stringify({ message: 'No ingredients found' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    console.log(`Found ${ingredients.length} ingredients`);

    return new Response(JSON.stringify(ingredients), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error fetching ingredients:', error);
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}

export async function POST(req) {
  try {
    const body = await req.json();

    // ตรวจสอบว่าข้อมูลที่ส่งมาเป็นอาร์เรย์หรือไม่
    const ingredients = Array.isArray(body) ? body : [body];

    const createdIngredients = [];

    for (const ingredient of ingredients) {
      const { name, calories, protein, fat, carbohydrates, categories, image } =
        ingredient;

      if (
        !name ||
        calories == null ||
        protein == null ||
        fat == null ||
        carbohydrates == null
      ) {
        return new Response(
          JSON.stringify({
            error:
              'Missing required fields: name, calories, protein, fat and carbohydrates',
          }),
          { status: 400, headers: { 'Content-Type': 'application/json' } }
        );
      }

      const existingIngredient = await prisma.ingredients.findFirst({
        where: { name },
      });

      if (existingIngredient) {
        console.log('Ingredient already exists:', existingIngredient.name);
        return new Response(
          JSON.stringify({ error: `Ingredient "${name}" already exists` }),
          { status: 400, headers: { 'Content-Type': 'application/json' } }
        );
      }

      const newIngredient = await prisma.ingredients.create({
        data: {
          name,
          calories: parseFloat(calories),
          protein: parseFloat(protein),
          fat: parseFloat(fat),
          carbohydrates: parseFloat(carbohydrates),
          categories: categories,
          image: image,
        },
      });

      createdIngredients.push(newIngredient);
    }

    console.log('New Ingredients Created:', createdIngredients);

    return new Response(
      JSON.stringify({
        message: 'Added new ingredients successfully',
        data: createdIngredients,
      }),
      { status: 201, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Server Error:', error);

    return new Response(
      JSON.stringify({
        error: 'Internal Server Error',
        details: error.message,
      }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}
