import { Calculation } from '../../../utils/functions/Calculation';

export async function POST(req) {
  try {
    const body = await req.json();
    const { weight, height, age, gender, activityLevel, goal } = body;

    if (
      !weight ||
      !height ||
      !age ||
      gender === undefined ||
      activityLevel === undefined ||
      goal === undefined
    ) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    if (gender !== 0 && gender !== 1) {
      return new Response(JSON.stringify({ error: 'gender must be 0 or 1' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const validActivityLevels = [1.2, 1.375, 1.55, 1.725, 1.9];
    if (!validActivityLevels.includes(activityLevel)) {
      return new Response(
        JSON.stringify({
          error: 'activityLevel must be 1.2, 1.375, 1.55, 1.725, or 1.9',
        }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    if (goal < -20 || goal > 20) {
      return new Response(
        JSON.stringify({ error: 'goal must be between -20% and 20%' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const result = Calculation({
      weight,
      height,
      age,
      gender,
      activityLevel,
      goal,
    });

    console.log('✅ Calculation result:', result);

    return new Response(
      JSON.stringify({
        message: 'Calculation successful',
        data: result,
      }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    return new Response(JSON.stringify({ error: 'Invalid request' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
