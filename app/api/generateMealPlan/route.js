import { generateMealPlan } from '../../../utils/functions/mealPlanService';

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

    const mealPlan = await generateMealPlan(userId, days);

    return new Response(JSON.stringify({ success: true, data: mealPlan }), {
      status: 200,
    });
  } catch (error) {
    console.error('❌ Error:', error.message);
    return new Response(JSON.stringify({ message: 'Internal server error' }), {
      status: 500,
    });
  }
}
