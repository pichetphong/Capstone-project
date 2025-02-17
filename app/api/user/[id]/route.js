import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(req, context) {
  const { id } = await context.params;

  try {
    const user = await prisma.user.findUnique({
      where: { id },
      include: { healthMetrics: true },
    });

    if (!user) {
      return new Response(JSON.stringify({ error: 'User not found' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    console.log(user);

    return new Response(JSON.stringify(user), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error fetching user:', error);
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}

export async function PUT(req, context) {
  try {
    const { id } = context.params;
    const body = await req.json();
    const { name, email } = body;

    // console.log('Updating user with ID:', id);

    if (!id) {
      return new Response(JSON.stringify({ error: 'Missing user ID in URL' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Regular Expression สำหรับตรวจสอบรูปแบบของ Email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!name || !email || !emailRegex.test(email)) {
      return new Response(JSON.stringify({ error: 'Invalid name or email' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const updatedUser = await prisma.user.update({
      where: { id },
      data: { name, email },
    });

    return new Response(JSON.stringify(updatedUser), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    // P2025 คือ Error ที่ Prisma แจ้งว่าไม่มีข้อมูลให้ update/delete
    if (error.code === 'P2025') {
      return new Response(JSON.stringify({ error: 'User not found' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    console.error('Error updating user:', error);
    return new Response(JSON.stringify({ error: 'Failed to update user' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
