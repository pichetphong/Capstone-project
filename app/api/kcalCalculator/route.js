import { Calculation } from '../../../utils/functions/Calculation';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function POST(req) {
  try {
    const body = await req.json();
    const { userId } = body;

    if (!userId) {
      return new Response(
        JSON.stringify({ error: 'Missing required userId' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // ดึงข้อมูล User จาก Database
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      return new Response(JSON.stringify({ error: 'User not found' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // ตรวจสอบว่ามี HealthMetrics แล้วหรือยัง
    const existingMetrics = await prisma.healthMetrics.findUnique({
      where: { userId: user.id },
    });

    if (existingMetrics) {
      return new Response(
        JSON.stringify({ error: 'User already has health metrics' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // ตรวจสอบค่า gender และ goal ว่าถูกต้องหรือไม่
    if (user.gender !== 1 && user.gender !== 0) {
      return new Response(JSON.stringify({ error: 'gender must be 0 or 1' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    if (user.goal !== 1 && user.goal !== 0 && user.goal !== -1) {
      return new Response(
        JSON.stringify({ error: 'goal must be 1, 0, or -1' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // ใช้ข้อมูลจาก user มาใส่ Calculation
    const result = Calculation({
      weight: user.weight,
      height: user.height,
      age: user.age,
      gender: user.gender,
      activityLevel: user.activityLevel,
      goal: user.goal,
      dietType: user.dietType,
    });

    if (!result) {
      return new Response(
        JSON.stringify({ error: 'Calculation function returned null' }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // บันทึกค่า Health Metrics
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

    // บันทึก Macronutrients
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
