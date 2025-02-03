import { Calculation } from '../../../utils/functions/Calculation';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function POST(req) {
  try {
    const body = await req.json();
    const {
      userId,
      weight,
      height,
      age,
      gender,
      activityLevel,
      goal,
      dietType,
    } = body;

    if (
      !weight ||
      !height ||
      !age ||
      gender === undefined ||
      activityLevel === undefined ||
      goal === undefined ||
      dietType === undefined
    ) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // ดูก่อนว่า user มีแล้วรึยัง
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      return new Response(JSON.stringify({ error: 'User not found' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // ดูก่อนว่า user มี healthMetrics อยู่แล้วรึยัง
    const existingMetrics = await prisma.healthMetrics.findUnique({
      where: { userId: user.id },
    });
    if (existingMetrics) {
      return new Response(
        JSON.stringify({ error: 'User already has health metrics' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    if (gender !== 1 && gender !== 0) {
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

    if (goal !== 1 && goal !== 0 && goal !== -1) {
      return new Response(
        JSON.stringify({ error: 'goal must be 1 , 0 , -2' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // call function
    const result = Calculation({
      weight,
      height,
      age,
      gender,
      activityLevel,
      goal,
      dietType,
    });
    console.log(result);
    if (!result) {
      return new Response(
        JSON.stringify({ error: 'Calculation function returned null' }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const healthMetrics = await prisma.healthMetrics.create({
      data: {
        bmi: parseFloat(result.BMI),
        bmr: parseFloat(result.BMR),
        tdee: parseFloat(result.TDEE),
        bodyFat: parseFloat(result.BodyFat),
        fatMass: parseFloat(result.FatMass),
        leanMass: parseFloat(result.LeanMass),
        weeklySurplus: parseFloat(result.weeklySurplus),
        dailySurplus: parseFloat(result.dailySurplus),
        userId: user.id,
      },
    });

    const macronutrients = await prisma.macronutrients.create({
      data: {
        protein: parseFloat(result.macronutrients.protein),
        fat: parseFloat(result.macronutrients.fat),
        carbs: parseFloat(result.macronutrients.carbs),
        healthMetricsId: healthMetrics.id, // Connect to healthMetrics
      },
    });

    return new Response(
      JSON.stringify({
        message: 'Calculation successful',
        data: {
          ...healthMetrics,
          macronutrients,
        },
      }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Server Error:', error);
    return new Response(JSON.stringify({ error: 'Internal Server Error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
