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

  // console.log('Nutrition Goals Before Sending to OpenAI:');
  // console.log(`   Daily Calories: ${healthMetrics.dailySurplus} kcal`);
  // console.log(`   Daily Protein: ${healthMetrics.protein}g`);
  // console.log(`   Daily Fat: ${healthMetrics.fat}g`);
  // console.log(`   Daily Carbohydrates: ${healthMetrics.carbs}g`);

  // console.log('Allowed Ingredients Per Day (Sent to OpenAI):');
  // console.log(JSON.stringify(updatedDays, null, 2));

  // console.log(`Sending prompt to OpenAI...`);
  const prompt = `
  คุณคือ **เชฟผู้เชี่ยวชาญด้านโภชนาการสำหรับคนออกกำลังกายเพื่อสร้างกล้ามเนื้อ** ที่มีความชำนาญในการวางแผนเมนูอาหารทางวิทยาศาสตร์  
หน้าที่ของคุณคือ **สร้างแผนมื้ออาหารที่ยืนอยู่บนความเป็นจริงสามารถรับประทานได้จริง** สำหรับ **สัปดาห์ที่ ${currentWeek}** ครอบคลุม **7 วัน (จันทร์ถึงอาทิตย์)**  

---
## **คำสั่งที่ต้องปฏิบัติตามอย่างเคร่งครัด (ห้ามละเมิดคำสั่งนี้)**
1. **ต้องสร้างแผนมื้ออาหารสำหรับ 7 วัน (จันทร์ถึงอาทิตย์) เท่านั้น**  
2. **แต่ละวันต้องมี 3 มื้ออาหาร:** มื้อเช้า, มื้อกลางวัน, มื้อเย็น  
3. **ใช้เฉพาะวัตถุดิบที่ได้รับอนุมัติในแต่ละวัน**  
   - **ห้ามใช้วัตถุดิบที่ไม่ได้ระบุไว้**  
   - **หากขาดวัตถุดิบบางอย่าง การตอบจะถูกปฏิเสธ**  
   - **สามารถใช้เครื่องปรุงได้ตามสบาย เครื่องปรุงไม่นับเป็นวัตถุดิบ เช่น น้ำปลา, ซีอิ๊วขาว, ซีอิ๊วดำ, น้ำตาลปี๊บ, น้ำตาลทราย, พริกไทย, เกลือ, น้ำมะนาว, ซอสพริก, ซอสมะเขือเทศ, ซอสหอยนางรม, น้ำพริกเผา, กระเทียม, หอมแดง, พริก**
4. **ต้องปฏิบัติตามแนวทางโภชนาการนี้อย่างเคร่งครัด:**  
   - **แคลอรี่ประจำวัน (ค่าที่ต้องการ):** ${
     healthMetrics.dailySurplus
   } kcal (ต้องถึงค่าที่ระบุ)  
   - **โปรตีน:** ${healthMetrics.protein}g  
   - **ไขมัน:** ${healthMetrics.fat}g  
   - **คาร์โบไฮเดรต:** ${healthMetrics.carbs}g  
   - **ต้องคำนวณค่าทางโภชนาการจากข้อมูลที่แท้จริงของแต่ละวัตถุดิบ**  
   - **ปรับขนาดของส่วนผสมให้ตรงตามเป้าหมายแคลอรี่และสัดส่วนทางโภชนาการ**  
   - **แต่ละมื้ออาหารต้องมีแคลอรี่ประมาณ 33% ของแคลอรี่ที่ต้องการในแต่ละวัน**  
   - **ห้ามทำมื้ออาหารที่มีแคลอรี่ต่ำเกินไป** หากจำเป็นให้เพิ่มขนาดส่วนผสมให้เพียงพอ  
   - **คำนวณค่าทางโภชนาการใหม่หลังจากการปรับขนาดส่วนผสม**  
5. **หากไม่สามารถทำตามข้อกำหนดทั้งหมดได้ ให้สร้างคำตอบใหม่จนกว่าจะถูกต้อง**  

*** รายชื่อตัวอย่างเมนู ***
"
  ข้าวไก่ย่างพริกไทยดำกับผักต้ม
  ข้าวหน้าอกไก่ทอดกระเทียมพริกไทย
  ข้าวหมูย่างซอสซีอิ๊ว
  ไข่เจียวหมูสับกับข้าวกล้อง
  สเต็กอกไก่กับมันฝรั่งอบ
  ข้าวต้มหมูสับไข่เยี่ยวม้า
  ข้าวผัดโปรตีนทูน่ากับผัก
  ไข่ต้มกับผักสลัดและข้าวกล้อง
  ข้าวมันไก่แซลมอนย่าง
  ข้าวโพดคั่วกับอกไก่ย่าง
  ข้าวคั่วหมูย่างกับน้ำพริกหนุ่ม
  ข้าวแกงเขียวหวานไก่
  ข้าวผัดกุ้งผักบุ้ง
  ข้าวเหนียวหมูปิ้ง
  แซลมอนย่างซอสซีอิ๊วกับผักย่าง
  ไข่คนผัดผักรวมมิตร
  ข้าวผัดหมูกรอบกับผัก
  ผัดไทยหมูกรอบ
  สเต็กเนื้อวัวกับข้าวโพดต้ม
  ข้าวกะเพราหมูสับไข่ดาว
  ซุปกระดูกหมูต้มยำ
  ข้าวปลาทอดกระเทียมพริกไทย
  ไก่ย่างสมุนไพรกับข้าวกล้อง
  ข้าวซอยไก่
  ข้าวผัดกุ้งกระเพรา
  หมูย่างน้ำจิ้มซีฟู้ด
  สเต็กหมูเนื้อนุ่มกับข้าวโพด
  ข้าวผัดพริกสดไก่
  ข้าวต้มปลาย่าง
  ข้าวหมูกรอบกระเพรา
"

---
## **วัตถุดิบที่อนุญาต**  
**รายการวัตถุดิบที่อนุญาตสำหรับแต่ละวัน**  
**ห้ามใช้วัตถุดิบที่ไม่ได้ระบุไว้**  

\`\`\`json
${JSON.stringify(updatedDays, null, 2)}
\`\`\`

---
## **Response Format (DO NOT CHANGE THIS FORMAT)**
**The response MUST be a valid JSON object with exactly 7 days and 3 meals per day.**  
\\\json
{
  "mealPlan": [
    {
      "week": ${currentWeek},
      "day": "<Monday-Sunday>",
      "meal": "<Breakfast/Lunch/Dinner>",
      "menu_name": "<ชื่อเมนูในภาษาไทย เช่น ข้าวไข่เจียว อกไก่ย่างพริกไทยดำ>",
      "ingredients": [
        { "id": "<Ingredient ID>", "name": "<Ingredient Name>", "amount": "<Amount in grams>" }
      ],
      "cooking_method": "<วิธีการทำอาหารโดยละเอียด>",
      "calories": <number> kcal,
      "protein": <number> g,
      "fat": <number> g,
      "carbohydrates": <number> g,
      "reason": "<เหตุผลในการเลือกเมนูนี้ เช่น เมนูนี้ช่วยเสริมโปรตีนและไขมันดี ทำให้ร่างกายแข็งแรง>"
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
    console.error('AI did not return all 7 days !!!!!');
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
