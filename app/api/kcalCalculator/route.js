import { Calculation } from '../../../utils/functions/Calculation';
import { validateInput } from '../../../utils/functions/validateInput';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function POST(req) {
  try {
    const body = await req.json();

    const validation = validateInput(body);
    if (!validation.isValid) {
      return new Response(JSON.stringify({ error: validation.error }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const {
      userId,
      age,
      weight,
      height,
      gender,
      goal,
      dietType,
      activityLevel,
    } = body;

    // ดึงข้อมูล User
    const user = await prisma.user.findUnique({ where: { id: userId } });

    if (!user) {
      return new Response(JSON.stringify({ error: 'User not found' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // console.log('Input to Calculation:', {
    //   weight,
    //   height,
    //   age,
    //   gender,
    //   activityLevel,
    //   goal,
    //   dietType,
    // });

    const result = Calculation({
      weight,
      height,
      age,
      gender,
      activityLevel,
      goal,
      dietType,
    });

    if (!result) {
      console.error('Calculation() returned null');
      return new Response(
        JSON.stringify({ error: 'Calculation function returned null' }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // บันทึกค่า Health Metrics
    const healthMetrics = await prisma.healthMetrics.create({
      data: {
        weight,
        height,
        age,
        gender,
        activityLevel,
        goal,
        dietType,
        bmi: parseFloat(result.BMI),
        bmr: parseFloat(result.BMR),
        tdee: parseFloat(result.TDEE),
        bodyFat: parseFloat(result.BodyFat),
        fatMass: parseFloat(result.FatMass),
        leanMass: parseFloat(result.LeanMass),
        weeklySurplus: parseFloat(result.weeklySurplus),
        dailySurplus: parseFloat(result.dailySurplus),
        protein: parseFloat(result.protein),
        fat: parseFloat(result.fat),
        carbs: parseFloat(result.carbs),
        userId,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            createdAt: true,
            updatedAt: true,
          },
        },
      },
    });

    return new Response(
      JSON.stringify({
        message: 'Calculation successful',
        data: healthMetrics,
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
