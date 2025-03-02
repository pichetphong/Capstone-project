import { PrismaClient } from '@prisma/client';
import OpenAI from 'openai';
import { zodResponseFormat } from 'openai/helpers/zod';
import { z } from 'zod';

const prisma = new PrismaClient();
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const MealPlanResponseSchema = z.object({
  mealPlan: z.array(
    z.object({
      week: z.number(),
      day: z.string(),
      meal: z.string(),
      menu_name: z.string(),
      ingredients: z.array(
        z.object({
          id: z.string(),
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
    const { userId, days } = body;

    if (!userId || !days) {
      return new Response(
        JSON.stringify({ error: 'Missing required parameters' }),
        { status: 400 }
      );
    }

    const healthMetrics = await prisma.healthMetrics.findFirst({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      select: {
        dailySurplus: true,
        protein: true,
        fat: true,
        carbs: true,
      },
    });

    if (!healthMetrics) {
      return new Response(
        JSON.stringify({ error: 'Health metrics not found' }),
        { status: 404 }
      );
    }

    const { dailySurplus, protein, fat, carbs } = healthMetrics;

    console.log('healthMetrics:', healthMetrics);

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

    const ingredientIds = new Set(
      Object.values(days).flatMap((day) => day.ingredients)
    );

    const existingIngredients = await prisma.ingredients.findMany({
      where: { id: { in: [...ingredientIds] } },
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
      existingIngredients.map((ing) => [ing.id, ing])
    );

    const updatedDays = Object.fromEntries(
      Object.entries(days).map(([day, data]) => [
        day,
        {
          ...data,
          ingredients: data.ingredients
            .map((id) => ingredientMap.get(id) || null)
            .filter(Boolean),
        },
      ])
    );

    console.log(
      '📌 Updated Ingredients for OpenAI Prompt:',
      JSON.stringify(updatedDays, null, 2)
    );

    const prompt = `
    You are a professional nutritionist chef. Please create a meal plan for **Week ${currentWeek}**, covering **7 days (Monday to Sunday)**.
    Each day must have **Breakfast, Lunch, and Dinner**.
    
    ### **Rules (VERY IMPORTANT)**
    **You MUST generate meal plans for ALL 7 DAYS (Monday to Sunday).**  
    Each day **MUST** have **exactly 3 meals**: Breakfast, Lunch, and Dinner.  
    **If any day is missing, your response will be REJECTED.**  
    **STRICTLY use only the provided ingredients for each specific day.**
    
    ### **Allowed Ingredients**
    Here is the list of **allowed ingredients for each day**.  
    **DO NOT use ingredients that are not listed here.**  
    **Using an unapproved ingredient will result in meal rejection.**
    
    \`\`\`json
    ${JSON.stringify(updatedDays, null, 2)}
    \`\`\`
    
    ### **Nutrition Goals**
    - **Daily Surplus Calories**: ${dailySurplus}
    - **Daily Protein**: ${protein}g
    - **Daily Fat**: ${fat}g
    - **Daily Carbohydrates**: ${carbs}g
    
    ### **Response Format**
    The response **MUST** be in valid JSON and contain **exactly 7 days**:  
    \`\`\`json
    {
      "mealPlan": [
        {
          "week": <number>,
          "day": "<Day Name>",
          "meal": "<Breakfast/Lunch/Dinner>",
          "menu_name": "<Meal Name in Thai>",
          "ingredients": [
            { "id": "<Ingredient ID>", "name": "<Ingredient Name>", "amount": "<Amount in grams>" }
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

    if (!mealPlan || !Array.isArray(mealPlan.mealPlan)) {
      throw new Error('Invalid mealPlan data');
    }

    const createdMeals = await prisma.meals.createMany({
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
    return new Response(JSON.stringify({ message: 'Internal server error' }), {
      status: 500,
    });
  }
}
