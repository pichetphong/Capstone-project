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
    const { userId, dailySurplus, protein, fat, carbs, ingredients } = body;

    // VALIDATION

    if (
      !userId ||
      !dailySurplus ||
      !protein ||
      !fat ||
      !carbs ||
      !ingredients ||
      ingredients.length === 0
    ) {
      return new Response(
        JSON.stringify({ error: 'Missing required parameters' }),
        { status: 400 }
      );
    }

    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      return new Response(JSON.stringify({ error: 'User not found' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const ingredientIds = ingredients.map((ing) => ing.id);
    const existingIngredients = await prisma.ingredients.findMany({
      where: { id: { in: ingredientIds } },
    });
    const existingIngredientIds = new Set(
      existingIngredients.map((ing) => ing.id)
    );

    const missingIngredients = ingredients.filter(
      (ing) => !existingIngredientIds.has(ing.id)
    );
    if (missingIngredients.length > 0) {
      return new Response(
        JSON.stringify({
          error: `Invalid ingredients: ${missingIngredients
            .map((ing) => ing.name)
            .join(', ')}`,
        }),
        { status: 400 }
      );
    }

    // ```${}```

    const prompt = `
    You are a professional nutritionist chef. Please create a meal plan for 1 day with 3 meals, ensuring balanced energy and nutrients per meal.

### **Daily Nutrition Targets**
- **Total Calories**: ${dailySurplus} kcal
- **Protein**: ${protein}g
- **Fat**: ${fat}g
- **Carbohydrates**: ${carbs}g

### **Allowed Ingredients**
Below is a list of available ingredients with their nutritional values. **You must use only these ingredients when creating the meal plan.**  
${JSON.stringify(ingredients, null, 2)}

### **Meal Planning Rules**
- Create **3 meals** (Breakfast, Lunch, Dinner).
- Each meal should **contribute evenly** to the total daily nutrient targets.
- **Only use the provided ingredients**. Do not include any other ingredients.
- Specify the **exact amount** of each ingredient used in grams (g).
- Provide a **detailed cooking method** in Thai language.
- Include a **reason for each meal selection** in Thai language.

### **Response Format**
The response must be in JSON format and contain:
- **meal** (Breakfast, Lunch, Dinner)
- **menu_name** (Meal name in Thai language)
- **ingredients** (List of ingredients used with their amounts)
- **cooking_method** (Instructions in Thai)
- **calories** (Total calories per meal)
- **protein** (Protein in grams)
- **fat** (Fat in grams)
- **carbohydrates** (Carbohydrates in grams)
- **reason** (Explanation in Thai)
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
      response_format: zodResponseFormat(MealPlanResponseSchema, 'mealPlan'), // Zod check response
    });

    const mealPlan = completion.choices?.[0]?.message?.parsed;
    if (!mealPlan || !Array.isArray(mealPlan.mealPlan)) {
      throw new Error('Invalid mealPlan data');
    }

    const mealPlanData = mealPlan.mealPlan;
    console.log('mealPlan response:', JSON.stringify(mealPlanData, null, 2));

    await prisma.meals.createMany({
      data: mealPlanData.map((meal) => ({
        UserId: userId,
        name: meal.menu_name,
        cooking_method: meal.cooking_method,
        calories: meal.calories,
        protein: meal.protein,
        fat: meal.fat,
        carbohydrates: meal.carbohydrates,
        reason: meal.reason,
      })),
    });

    const createdMealsList = await prisma.meals.findMany({
      where: {
        UserId: userId,
        name: { in: mealPlanData.map((meal) => meal.menu_name) },
      },
    });

    const mealIdMap = new Map(
      createdMealsList.map((meal) => [meal.name, meal.id])
    );
    const ingredientMap = new Map(ingredients.map((ing) => [ing.name, ing.id]));

    const mealIngredientsData = mealPlanData.flatMap((meal) =>
      meal.ingredients.map((ing) => {
        const ingredientId = ingredientMap.get(ing.name);
        if (!ingredientId) {
          throw new Error(`Ingredient ID not found for: ${ing.name}`);
        }
        return {
          mealId: mealIdMap.get(meal.menu_name),
          ingredientId: ingredientId,
          quantity: parseFloat(ing.amount) || 0,
        };
      })
    );

    const createdMealIngredients = await prisma.meal_Ingredients.createMany({
      data: mealIngredientsData,
    });

    return new Response(
      JSON.stringify({
        mealPlan: mealPlanData,
        createdMeals: { count: createdMealsList.length },
        createdMealIngredients: { count: createdMealIngredients.count },
      }),
      { status: 200 }
    );
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
    });
  }
}
