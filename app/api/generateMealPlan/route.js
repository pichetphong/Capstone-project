import { PrismaClient } from '@prisma/client';
import OpenAI from 'openai';

const prisma = new PrismaClient();
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(req) {
  const { dailySurplus, protein, fat, carbs, ingredients } = await req.json();

  if (!dailySurplus || !protein || !fat || !carbs || !ingredients) {
    return new Response(
      JSON.stringify({ error: 'Missing required parameters' }),
      { status: 400 }
    );
  }

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

  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-4o-2024-08-06',
      messages: [
        {
          role: 'system',
          content:
            'You are an expert Thai chef specializing in balanced meal planning.',
        },
        { role: 'user', content: prompt },
      ],
      temperature: 0.7,
    });

    // convert the response to JSON
    const mealPlan = JSON.parse(response.choices[0].message.content);

    return new Response(JSON.stringify({ mealPlan }), { status: 200 });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
    });
  }
}
