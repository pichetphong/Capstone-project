import { PrismaClient } from '@prisma/client';
import OpenAI from 'openai';
import { zodResponseFormat } from 'openai/helpers/zod';
import { z } from 'zod';

const prisma = new PrismaClient();
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

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

export async function generateMealPlan(userId, days) {
  console.log(`Generating meal plan for userId: ${userId}`);

  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) {
    console.error(`User not found: ${userId}`);
    throw new Error('User not found');
  }

  const healthMetrics = await prisma.healthMetrics.findFirst({
    where: { userId },
    orderBy: { createdAt: 'desc' },
    select: { dailySurplus: true, protein: true, fat: true, carbs: true },
  });

  if (!healthMetrics) {
    console.error(`Health metrics not found for userId: ${userId}`);
    throw new Error('Health metrics not found');
  }

  const latestWeek = await prisma.meals.findFirst({
    where: { UserId: userId },
    orderBy: { week: 'desc' },
    select: { week: true },
  });

  const currentWeek = latestWeek?.week ? latestWeek.week + 1 : 1;
  console.log(`Current week: ${currentWeek}`);

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

  const existingIngredientIds = new Set(
    existingIngredients.map((ing) => ing.id)
  );
  const invalidIngredients = [...ingredientIds].filter(
    (id) => !existingIngredientIds.has(id)
  );

  if (invalidIngredients.length > 0) {
    console.error(`Invalid Ingredients:`, invalidIngredients);
    throw new Error(
      `Invalid ingredients found: ${invalidIngredients.join(', ')}`
    );
  }

  console.log(`All ingredient IDs verified in DB`);

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

  console.log('Nutrition Goals Before Sending to OpenAI:');
  console.log(`   Daily Calories: ${healthMetrics.dailySurplus} kcal`);
  console.log(`   Daily Protein: ${healthMetrics.protein}g`);
  console.log(`   Daily Fat: ${healthMetrics.fat}g`);
  console.log(`   Daily Carbohydrates: ${healthMetrics.carbs}g`);

  console.log('Allowed Ingredients Per Day (Sent to OpenAI):');
  console.log(JSON.stringify(updatedDays, null, 2));

  console.log(`🤖 Sending prompt to OpenAI...`);
  const prompt = `
  You are a highly skilled **nutritionist chef** specializing in scientific meal planning.  
  Your task is to **generate a precise meal plan** for **Week ${currentWeek}**, covering **exactly 7 days (Monday to Sunday)**.  
  
  ---
  ## **STRICT INSTRUCTIONS (DO NOT BREAK THESE RULES)**
  1 **MUST create a meal plan for ALL 7 DAYS (Monday to Sunday).**  
  2 **Each day MUST have exactly 3 meals:** Breakfast, Lunch, and Dinner.  
  3 **STRICTLY use ONLY the provided ingredients for each specific day.**  
    - **DO NOT use ingredients that are not listed here.**  
    - **If any ingredient is missing, the response will be REJECTED.**  
  4 **Follow these exact nutritional guidelines (MANDATORY - DO NOT IGNORE):**  
    - **Daily Calories (ABSOLUTE REQUIREMENT):** ${
      healthMetrics.dailySurplus
    } kcal (MUST reach this value)  
    - **Daily Protein:** ${healthMetrics.protein}g  
    - **Daily Fat:** ${healthMetrics.fat}g  
    - **Daily Carbohydrates:** ${healthMetrics.carbs}g  
    - **Nutritional values MUST be calculated based on the actual nutritional values of each ingredient.**  
    - **Adjust ingredient portions to ensure that daily calories and macros meet the targets.**  
    - **Each meal should contribute proportionally to the total daily intake (e.g., ~33% per meal).**  
    - **DO NOT create meals that are too low in calories. If necessary, increase portion sizes.**  
    - **Recalculate nutrition values after adjusting portions to ensure accuracy.**  
  5 **If you fail to meet all 4 requirements above, regenerate the entire response.**  
  
  ---
  ## **Allowed Ingredients**
  **Here is the list of approved ingredients for each day.**  
  **STRICTLY use only the ingredients listed under each day.**  
  
  \`\`\`json
  ${JSON.stringify(updatedDays, null, 2)}
  \`\`\`
  
  ---
  ## **Response Format (DO NOT CHANGE THIS FORMAT)**
  **The response MUST be a valid JSON object with exactly 7 days and 3 meals per day.**  
  \`\`\`json
  {
    "mealPlan": [
      {
        "week": ${currentWeek},
        "day": "<Monday-Sunday>",
        "meal": "<Breakfast/Lunch/Dinner>",
        "menu_name": "<Meal Name in Thai>",
        "ingredients": [
          { "id": "<Ingredient ID>", "name": "<Ingredient Name>", "amount": "<Amount in grams>" }
        ],
        "cooking_method": "<Cooking instructions in Thai>",
        "calories": <number> kcal,
        "protein": <number> g,
        "fat": <number> g,
        "carbohydrates": <number> g,
        "reason": "<Reason for choosing this meal in Thai>"
      }
    ]
  }
  \`\`\`
  
  ---
  ## **ABSOLUTE RESTRICTIONS (DO NOT VIOLATE)**
    **DO NOT include any missing or unapproved ingredients.**  
    **DO NOT skip any day or meal.**  
    **DO NOT modify the JSON format.**  
    **DO NOT return additional text or explanation. JSON ONLY.**  
    **If the response does not strictly follow the rules, REGENERATE until it is correct.**  
  `;

  const completion = await openai.beta.chat.completions.parse({
    model: 'gpt-4o',
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
    console.error(`Invalid mealPlan data from OpenAI`);
    throw new Error('Invalid mealPlan data');
  }

  console.log(`Meal Plan successfully generated`);

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

  const daysSet = new Set(mealPlan.mealPlan.map((meal) => meal.day));
  const expectedDays = [
    'Monday',
    'Tuesday',
    'Wednesday',
    'Thursday',
    'Friday',
    'Saturday',
    'Sunday',
  ];

  if (expectedDays.some((day) => !daysSet.has(day))) {
    console.error('AI did not return all 7 days!');
    throw new Error('AI response is incomplete. Please try again.');
  }

  console.log(`Meals saved to database`);

  const createdMealsList = await prisma.meals.findMany({
    where: { UserId: userId, week: currentWeek },
    select: { id: true, day: true, meal: true },
  });

  const mealIdMap = new Map(
    createdMealsList.map((meal) => [`${meal.day}-${meal.meal}`, meal.id])
  );

  const mealIngredientsData = mealPlan.mealPlan.flatMap((meal) =>
    meal.ingredients.map((ing) => ({
      mealId: mealIdMap.get(`${meal.day}-${meal.meal}`),
      ingredientId: ing.id,
      quantity: parseFloat(ing.amount) || 0,
    }))
  );

  await prisma.meal_Ingredients.createMany({ data: mealIngredientsData });

  console.log(`Meal Ingredients saved to database`);

  return mealPlan.mealPlan;
}
