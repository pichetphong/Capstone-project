import { PrismaClient } from '@prisma/client';
import OpenAI from 'openai';
import { zodResponseFormat } from 'openai/helpers/zod';
import { z } from 'zod';

const prisma = new PrismaClient();
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Zod schema
const MealPlanResponseSchema = z.object({
  mealPlan: z.array(
    z.object({
      week: z.number(),
      day: z.string(),
      meal: z.string(),
      menu_name: z.string(),
      ingredients: z.array(
        z.object({
          name: z.string(),
          amount: z.string(),
        })
      ),
      cooking_method: z.string(),
      calories: z.number(),
      protein: z.number(),
      fat: z.number(),
      carbohydrates: z.number(),
      reason: z.string(),
    })
  ),
});

export async function POST(req) {
  try {
    const body = await req.json();
    const { userId, dailySurplus, protein, fat, carbs, days } = body;

    if (!userId || !dailySurplus || !protein || !fat || !carbs || !days) {
      return new Response(
        JSON.stringify({ error: 'Missing required parameters' }),
        { status: 400 }
      );
    }

    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      return new Response(JSON.stringify({ error: 'User not found' }), {
        status: 404,
      });
    }

    const latestWeek = await prisma.meals.findFirst({
      where: { UserId: userId },
      orderBy: { week: 'desc' },
      select: { week: true },
    });

    const currentWeek = latestWeek?.week ? latestWeek.week + 1 : 1;

    const ingredientIds = Object.values(days).flatMap((day) => day.ingredients);

    const existingIngredients = await prisma.ingredients.findMany({
      where: { id: { in: ingredientIds } },
      select: {
        id: true,
        name: true,
        calories: true,
        protein: true,
        fat: true,
        carbohydrates: true,
      },
    });

    console.log('✅ Ingredients Retrieved from Database:', existingIngredients);

    const ingredientMap = new Map(
      existingIngredients.map((ing) => [ing.name, ing])
    );

    const updatedDays = Object.entries(days).reduce((acc, [day, data]) => {
      acc[day] = {
        ...data,
        ingredients: data.ingredients
          .map((id) => existingIngredients.find((ing) => ing.id === id) || null)
          .filter(Boolean),
      };
      return acc;
    }, {});

    console.log(
      '📌 Updated Ingredients for OpenAI Prompt:',
      JSON.stringify(updatedDays, null, 2)
    );

    const prompt = `
You are a professional nutritionist chef. Please create a meal plan for **Week ${currentWeek}**, covering 7 days (Monday to Sunday).
Each day must have **Breakfast, Lunch, and Dinner**.

### **Daily Nutrition Targets**
- **Total Calories**: ${dailySurplus} kcal
- **Protein**: ${protein}g
- **Fat**: ${fat}g
- **Carbohydrates**: ${carbs}g

### **Allowed Ingredients for Each Day**
Each day has a specific set of allowed ingredients.  
DO NOT use any ingredient that is not listed here:
\`\`\`json
${JSON.stringify(updatedDays, null, 2)}
\`\`\`

### **Meal Planning Rules**
- Each day must have exactly **3 meals**: **Breakfast, Lunch, and Dinner**.
- Strictly use only the provided ingredients for that specific day.
- Specify the exact amount of each ingredient used in grams (g).
- Provide a detailed **cooking method in Thai language**.
- Include a **reason for each meal selection in Thai language**.

### **Response Format**
The response must be in JSON format:
\`\`\`json
{
  "mealPlan": [
    {
      "week": <number>,
      "day": "<Day Name>",
      "meal": "<Breakfast/Lunch/Dinner>",
      "menu_name": "<Meal Name in Thai>",
      "ingredients": [
        { "name": "<Ingredient Name>", "amount": "<Amount in grams>" }
      ],
      "cooking_method": "<Cooking instructions in Thai>",
      "calories": <number>,
      "protein": <number>,
      "fat": <number>,
      "carbohydrates": <number>,
      "reason": "<Reason for choosing this meal in Thai>"
    }
  ]
}
\`\`\`
`;

    const completion = await openai.beta.chat.completions.parse({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content:
            'You are an expert Thai chef specializing in balanced meal planning.',
        },
        { role: 'user', content: prompt },
      ],
      response_format: zodResponseFormat(MealPlanResponseSchema, 'mealPlan'),
    });

    const mealPlan = completion.choices?.[0]?.message?.parsed;

    console.log(
      '🍽️ Generated Meal Plan from OpenAI:',
      JSON.stringify(mealPlan, null, 2)
    );

    if (!mealPlan || !Array.isArray(mealPlan.mealPlan)) {
      throw new Error('Invalid mealPlan data');
    }

    await prisma.meals.createMany({
      data: mealPlan.mealPlan.map((meal) => ({
        UserId: userId,
        week: meal.week,
        day: meal.day,
        meal: meal.meal,
        name: meal.menu_name,
        cooking_method: meal.cooking_method,
        calories: meal.calories,
        protein: meal.protein,
        fat: meal.fat,
        carbohydrates: meal.carbohydrates,
        reason: meal.reason,
      })),
    });

    // 🔥 ดึงข้อมูล Meal ที่เพิ่งสร้างจาก Database
    const createdMealsList = await prisma.meals.findMany({
      where: { UserId: userId, week: currentWeek },
      select: { id: true, day: true, meal: true },
    });

    // ✅ Map `day-meal` -> `id`
    const mealIdMap = new Map(
      createdMealsList.map((meal) => [`${meal.day}-${meal.meal}`, meal.id])
    );

    console.log('✅ Created Meals Map:', [...mealIdMap.entries()]);

    const mealIngredientsData = mealPlan.mealPlan.flatMap((meal) =>
      meal.ingredients.map((ing) => {
        const mealId = mealIdMap.get(`${meal.day}-${meal.meal}`);
        const ingredient = ingredientMap.get(ing.name);
        const ingredientId = ingredient?.id;

        console.log(
          `🔍 Meal: ${meal.day} - ${meal.meal} | Meal ID: ${
            mealId || '❌ NOT FOUND'
          }`
        );
        console.log(
          `🔍 Checking Ingredient: ${ing.name} | Found ID: ${
            ingredientId || '❌ NOT FOUND'
          }`
        );

        if (!mealId)
          throw new Error(`Meal ID not found for ${meal.day} - ${meal.meal}`);
        if (!ingredientId)
          throw new Error(`Ingredient ID not found for ${ing.name}`);

        return {
          mealId: mealId,
          ingredientId: ingredientId,
          quantity: parseFloat(ing.amount) || 0,
        };
      })
    );

    await prisma.meal_Ingredients.createMany({ data: mealIngredientsData });

    return new Response(
      JSON.stringify({
        success: true,
        week: currentWeek,
        data: mealPlan.mealPlan,
      }),
      { status: 200 }
    );
  } catch (error) {
    console.error('❌ Error:', error.message);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
    });
  }
}
