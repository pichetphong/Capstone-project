import { Calculation } from '../../../utils/functions/Calculation';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function POST(req) {
  try {
    const body = await req.json();
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

    // ตรวจสอบค่าที่จำเป็น
    if (
      !userId ||
      typeof age === 'undefined' ||
      typeof weight === 'undefined' ||
      typeof height === 'undefined' ||
      typeof gender === 'undefined' ||
      typeof goal === 'undefined' ||
      typeof dietType === 'undefined' ||
      typeof activityLevel === 'undefined'
    ) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields' }),
        {
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }

    // ดึงข้อมูล User
    const user = await prisma.user.findUnique({ where: { id: userId } });

    if (!user) {
      return new Response(JSON.stringify({ error: 'User not found' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // ตรวจสอบว่าผู้ใช้มี HealthMetrics อยู่แล้วหรือไม่
    const existingMetrics = await prisma.healthMetrics.findUnique({
      where: { userId },
    });

    if (existingMetrics) {
      return new Response(
        JSON.stringify({ error: 'User already has health metrics' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // เรียกใช้ Calculation
    let result;
    try {
      result = Calculation({
        age,
        weight,
        height,
        gender,
        goal,
        dietType,
        activityLevel,
      });
    } catch (error) {
      return new Response(
        JSON.stringify({ error: 'Error in calculation function' }),
        {
          status: 500,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }

    if (!result) {
      return new Response(
        JSON.stringify({ error: 'Calculation function returned null' }),
        {
          status: 500,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }

    // บันทึกค่า Health Metrics
    const healthMetrics = await prisma.healthMetrics.create({
      data: {
        age,
        weight,
        height,
        gender,
        goal,
        dietType,
        activityLevel,
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
        userId: userId,
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
