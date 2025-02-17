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

export async function PUT(req) {
  try {
    const body = await req.json();

    const { id, name, email } = body;

    const updatedUser = await prisma.user.update({
      where: { id },
      data: {
        name,
        email,
      },
    });

    return new Response(JSON.stringify(updatedUser), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.log('Error updating user:', error);
    return new Response(JSON.stringify({ error: 'Failed to update user' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
