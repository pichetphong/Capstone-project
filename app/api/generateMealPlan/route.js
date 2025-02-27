import { PrismaClient } from '@prisma/client';
import OpenAI from 'openai';
import { zodResponseFormat } from 'openai/helpers/zod';
import { z } from 'zod';

const prisma = new PrismaClient();
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// สร้าง Zod schema สำหรับ Meal Plan ที่เราคาดหวัง
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
    })
  ),
});

export async function POST(req) {
  try {
    const body = await req.json();
    const { dailySurplus, protein, fat, carbs, ingredients } = body;

    if (
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

    // ```${}```

    const prompt = `
    You are a professional nutritionist chef. Please create a meal plan for 1 day with 3 meals, ensuring balanced energy and nutrients per meal.
  
    **Daily targets:**
    - Total Calories: ${dailySurplus} kcal
    - Protein: ${protein}g
    - Fat: ${fat}g
    - Carbohydrates: ${carbs}g
  
    **Available ingredients:**
    ${JSON.stringify(ingredients, null, 2)}
  
    Each meal should have similar nutrient distribution.  
    You can adjust ingredient quantities to achieve the optimal nutrient balance.  
  
    Return the result in JSON format with the following fields:
    - \`meal\` (Breakfast, Lunch, Dinner)
    - \`menu_name\` (Meal name in **Thai language**)
    - \`ingredients\` (List of ingredients and their amounts)
    - \`cooking_method\` (Cooking instructions in **Thai language**)
    - \`calories\` (Total calories per meal)
    - \`protein\` (Total protein per meal in grams)
    - \`fat\` (Total fat per meal in grams)
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
      response_format: zodResponseFormat(MealPlanResponseSchema, 'mealPlan'), // ใช้ Zod เพื่อตรวจสอบ response
    });

    const mealPlan = completion.choices[0].message.parsed;

    // const response = await openai.chat.completions.create({
    //   model: 'gpt-4o-2024-08-06',
    //   messages: [
    //     {
    //       role: 'system',
    //       content:
    //         'You are an expert Thai chef specializing in balanced meal planning.',
    //     },
    //     { role: 'user', content: prompt },
    //   ],
    //   response_format: {
    //     name: 'meal_plan',
    //     schema: {
    //       type: 'object',
    //       properties: {
    //         mealPlan: {
    //           type: 'array',
    //           description: 'List of meals in the meal plan.',
    //           items: {
    //             type: 'object',
    //             properties: {
    //               meal: {
    //                 type: 'string',
    //                 description: 'Type of the meal (Breakfast, Lunch, Dinner).',
    //               },
    //               menu_name: {
    //                 type: 'string',
    //                 description: 'Name of the menu.',
    //               },
    //               ingredients: {
    //                 type: 'array',
    //                 description: 'List of ingredients used in the meal.',
    //                 items: {
    //                   type: 'object',
    //                   properties: {
    //                     name: {
    //                       type: 'string',
    //                       description: 'Name of the ingredient.',
    //                     },
    //                     amount: {
    //                       type: 'string',
    //                       description: 'Amount of the ingredient.',
    //                     },
    //                   },
    //                   required: ['name', 'amount'],
    //                   additionalProperties: false,
    //                 },
    //               },
    //               cooking_method: {
    //                 type: 'string',
    //                 description: 'Instructions on how to cook the meal.',
    //               },
    //               calories: {
    //                 type: 'number',
    //                 description: 'Total calories in the meal.',
    //               },
    //               protein: {
    //                 type: 'number',
    //                 description: 'Total protein content in grams.',
    //               },
    //               fat: {
    //                 type: 'number',
    //                 description: 'Total fat content in grams.',
    //               },
    //             },
    //             required: [
    //               'meal',
    //               'menu_name',
    //               'ingredients',
    //               'cooking_method',
    //               'calories',
    //               'protein',
    //               'fat',
    //             ],
    //             additionalProperties: false,
    //           },
    //         },
    //       },
    //       required: ['mealPlan'],
    //       additionalProperties: false,
    //     },
    //     strict: true,
    //   },
    //   temperature: 0.7,
    // });

    console.log('mealPlan for 1 day 3 meals', mealPlan);

    return new Response(JSON.stringify({ mealPlan }), { status: 200 });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
    });
  }
}
