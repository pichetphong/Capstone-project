import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(req, context) {
  const { id } = await context.params;

  try {
    const user = await prisma.user.findUnique({
      where: { id },
      include: {
        healthMetrics: true,
        Meals: {
          include: {
            Meal_Ingredients: {
              include: {
                ingredient: { select: { name: true } },
              },
            },
          },
        },
      },
    });

    if (!user) {
      return new Response(JSON.stringify({ error: 'User not found' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' },
      });
    }

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
    const { id } = await context.params;
    const body = await req.json();
    const { name, email } = body;

    // console.log('Updating user with ID:', id);

    if (!id) {
      return new Response(JSON.stringify({ error: 'Missing user ID in URL' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }
    if (!name || !email) {
      return new Response(
        JSON.stringify({ error: 'Name and email are required' }),
        {
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }

    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return new Response(JSON.stringify({ error: 'Email already in use' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // อัปเดตข้อมูล
    const updatedUser = await prisma.user.update({
      where: { id },
      data: { name, email },
    });

    console.log('Updated user:', updatedUser);
    return new Response(JSON.stringify(updatedUser), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
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
