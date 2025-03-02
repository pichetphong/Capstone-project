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
  console.log(`🚀 Generating meal plan for userId: ${userId}`);

  // ✅ ดึงข้อมูลผู้ใช้
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) {
    console.error(`❌ User not found: ${userId}`);
    throw new Error('User not found');
  }

  // ✅ ดึงข้อมูล Health Metrics ล่าสุด
  const healthMetrics = await prisma.healthMetrics.findFirst({
    where: { userId },
    orderBy: { createdAt: 'desc' },
    select: { dailySurplus: true, protein: true, fat: true, carbs: true },
  });

  if (!healthMetrics) {
    console.error(`❌ Health metrics not found for userId: ${userId}`);
    throw new Error('Health metrics not found');
  }

  // ✅ ดึงค่า week ล่าสุดของผู้ใช้
  const latestWeek = await prisma.meals.findFirst({
    where: { UserId: userId },
    orderBy: { week: 'desc' },
    select: { week: true },
  });

  const currentWeek = latestWeek?.week ? latestWeek.week + 1 : 1;
  console.log(`📅 Current week: ${currentWeek}`);

  // ✅ ดึงข้อมูล Ingredients ที่มีอยู่
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

  // 🔥 เช็คว่า AI ส่ง `ingredientId` ที่ไม่มีใน DB มาหรือไม่
  const existingIngredientIds = new Set(
    existingIngredients.map((ing) => ing.id)
  );
  const invalidIngredients = [...ingredientIds].filter(
    (id) => !existingIngredientIds.has(id)
  );

  if (invalidIngredients.length > 0) {
    console.error(`❌ Invalid Ingredients:`, invalidIngredients);
    throw new Error(
      `Invalid ingredients found: ${invalidIngredients.join(', ')}`
    );
  }

  console.log(`✅ All ingredient IDs verified in DB`);

  // ✅ Map Ingredients ให้ตรงกับ Days
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

  // ✅ สร้าง Meal Plan ผ่าน OpenAI
  console.log(`🤖 Sending prompt to OpenAI...`);
  const prompt = `
  You are a professional nutritionist chef. Please create a meal plan for **Week ${currentWeek}**, covering **7 days (Monday to Sunday)**.
  Each day must have **Breakfast, Lunch, and Dinner**.

  ### **Allowed Ingredients**
  \`\`\`json
  ${JSON.stringify(updatedDays, null, 2)}
  \`\`\`

  ### **Nutrition Goals**
  - **Daily Surplus Calories**: ${healthMetrics.dailySurplus}
  - **Daily Protein**: ${healthMetrics.protein}g
  - **Daily Fat**: ${healthMetrics.fat}g
  - **Daily Carbohydrates**: ${healthMetrics.carbs}g
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
    console.error(`❌ Invalid mealPlan data from OpenAI`);
    throw new Error('Invalid mealPlan data');
  }

  console.log(`✅ Meal Plan successfully generated`);

  // ✅ บันทึก Meal Plan ลงฐานข้อมูล
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

  console.log(`✅ Meals saved to database`);

  // ✅ ดึง ID ของ meals ที่เพิ่งสร้างไป
  const createdMealsList = await prisma.meals.findMany({
    where: { UserId: userId, week: currentWeek },
    select: { id: true, day: true, meal: true },
  });

  // ✅ Map Meal ID กับวันและมื้ออาหาร
  const mealIdMap = new Map(
    createdMealsList.map((meal) => [`${meal.day}-${meal.meal}`, meal.id])
  );

  // ✅ เตรียมข้อมูล meal_Ingredients
  const mealIngredientsData = mealPlan.mealPlan.flatMap((meal) =>
    meal.ingredients.map((ing) => ({
      mealId: mealIdMap.get(`${meal.day}-${meal.meal}`),
      ingredientId: ing.id,
      quantity: parseFloat(ing.amount) || 0,
    }))
  );

  // ✅ บันทึก meal_Ingredients ลงฐานข้อมูล
  await prisma.meal_Ingredients.createMany({ data: mealIngredientsData });

  console.log(`✅ Meal Ingredients saved to database`);

  return mealPlan.mealPlan;
}
