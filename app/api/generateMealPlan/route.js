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

    if (
      !userId ||
      !dailySurplus ||
      !protein ||
      !fat ||
      !carbs ||
      !days ||
      Object.keys(days).length === 0
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
      });
    }

    // ✅ แก้ไข UserId -> userId เพื่อให้ตรงกับ Schema
    const latestWeek = await prisma.meals.findFirst({
      where: { UserId: userId }, // แก้ไขจาก userId -> UserId
      orderBy: { week: 'desc' },
      select: { week: true },
    });

    const currentWeek = latestWeek?.week ? latestWeek.week + 1 : 1;

    const allIngredients = Object.values(days).flatMap(
      (day) => day.ingredients
    );
    const ingredientIds = allIngredients.map((ing) => ing.id);

    const existingIngredients = await prisma.ingredients.findMany({
      where: { id: { in: ingredientIds } },
    });

    const existingIngredientIds = new Set(
      existingIngredients.map((ing) => ing.id)
    );

    const missingIngredients = allIngredients.filter(
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

    const prompt = `
    You are a professional nutritionist chef. Please create a meal plan for **Week ${currentWeek}**, covering 7 days (Monday to Sunday).
Each day must have **Breakfast, Lunch, and Dinner**.

### **Daily Nutrition Targets**
- **Total Calories**: ${dailySurplus} kcal
- **Protein**: ${protein}g
- **Fat**: ${fat}g
- **Carbohydrates**: ${carbs}g

### **Allowed Ingredients for Each Day**
Below is a list of approved ingredients for each day.  
You MUST use ONLY these ingredients when creating the meal plan.  
DO NOT add any additional ingredients that are not listed below.  
Meals that contain unapproved ingredients will be rejected.  

${JSON.stringify(days, null, 2)}

### **Meal Planning Rules**
- Each meal must be unique for each day (No duplicated meals across different days).
- Strictly use only the provided ingredients.  
- Do not add new ingredients that are not explicitly listed.  
- Specify the exact amount of each ingredient used in grams (g).
- Provide a detailed cooking method in Thai language.
- Include a reason for each meal selection in Thai language.
- Include Week (${currentWeek}) and Day for each meal.

### **Response Format**
The response must be in JSON format and contain:
- **week** (Week number)
- **day** (Day name)
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

    // OpenAi API call
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
    if (!mealPlan || !Array.isArray(mealPlan.mealPlan)) {
      throw new Error('Invalid mealPlan data');
    }

    const mealPlanData = mealPlan.mealPlan;

    await prisma.$transaction(async (prisma) => {
      await prisma.meals.createMany({
        data: mealPlanData.map((meal) => ({
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

      // ✅ แก้ไขการดึง mealId เพื่อให้ไม่มี undefined
      const createdMealsList = await prisma.meals.findMany({
        where: { UserId: userId, week: currentWeek },
        select: { id: true, day: true, meal: true },
      });

      // ✅ ใช้ Map เพื่อจับคู่ day-meal กับ mealId
      const mealIdMap = new Map(
        createdMealsList.map((meal) => [`${meal.day}-${meal.meal}`, meal.id])
      );

      // ✅ แก้ไขการดึง ingredientId ให้ไม่มี undefined
      const ingredientMap = new Map(
        allIngredients.map((ing) => [ing.name, ing.id])
      );

      const mealIngredientsData = mealPlanData.flatMap((meal) =>
        meal.ingredients.map((ing) => {
          const mealId = mealIdMap.get(`${meal.day}-${meal.meal}`);
          const ingredientId = ingredientMap.get(ing.name);

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

      // ✅ บันทึก Meal_Ingredients อย่างถูกต้อง
      await prisma.meal_Ingredients.createMany({ data: mealIngredientsData });
    });

    return new Response(
      JSON.stringify({ success: true, week: currentWeek, data: mealPlanData }),
      {
        status: 200,
      }
    );
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
    });
  }
}
