import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

export async function POST(req) {
  try {
    // ✅ รับค่าจาก body
    const body = await req.json();
    const { name, email, password, age, weight, height, gender } = body;

    // ✅ ตรวจสอบค่าที่รับเข้ามา
    if (
      !name ||
      !email ||
      !password ||
      !age ||
      !weight ||
      !height ||
      gender === undefined
    ) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // ✅ ตรวจสอบ email ซ้ำ
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return new Response(JSON.stringify({ error: 'Email already in use' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // ✅ เข้ารหัส password อย่างถูกต้อง
    const hashedPassword = await bcrypt.hash(password, 10);

    // ✅ บันทึก user ลงฐานข้อมูล
    const newUser = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        age,
        weight,
        height,
        gender,
      },
    });

    return new Response(
      JSON.stringify({
        message: 'User created successfully',
        data: { newUser },
      }),
      { status: 201, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Server error:', error);
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
