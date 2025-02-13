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

// export async function PUT(req, context) {
//   const { id } = await context.params;
//   const body = await req.json();

//   try {
//     // -1 = lose weight, 0 = maintain weight, 1 = gain weight
//     if (body.goal !== 1 && body.goal !== 0 && body.goal !== -1) {
//       return new Response(JSON.stringify({ error: 'Invalid goal value' }), {
//         status: 400,
//         headers: { 'Content-Type': 'application/json' },
//       });
//     }

//     // low carb = -1, balanced = 0, high protein = 1
//     if (body.dietType !== -1 && body.dietType !== 0 && body.dietType !== 1) {
//       return new Response(JSON.stringify({ error: 'Invalid dietType value' }), {
//         status: 400,
//         headers: { 'Content-Type': 'application/json' },
//       });
//     }

//     // 0 = female, 1 = male
//     if (body.gender !== 1 && body.gender !== 0) {
//       return new Response(JSON.stringify({ error: 'Invalid gender value' }), {
//         status: 400,
//         headers: { 'Content-Type': 'application/json' },
//       });
//     }

//     // 0 = sedentary, 1 = lightly active, 2 = moderately active, 3 = very active, 4 = super active
//     if (
//       body.activityLevel !== 0 &&
//       body.activityLevel !== 1 &&
//       body.activityLevel !== 2 &&
//       body.activityLevel !== 3 &&
//       body.activityLevel !== 4
//     ) {
//       return new Response(
//         JSON.stringify({ error: 'Invalid activityLevel value' }),
//         {
//           status: 400,
//           headers: { 'Content-Type': 'application/json' },
//         }
//       );
//     }

//     const updatedUser = await prisma.user.update({
//       where: { id },
//       data: {
//         name: body.name,
//         age: body.age,
//         weight: body.weight,
//         height: body.height,
//         gender: body.gender,
//         goal: body.goal,
//         dietType: body.dietType,
//         activityLevel: body.activityLevel,
//       },
//     });

//     return new Response(JSON.stringify(updatedUser), {
//       status: 200,
//       headers: { 'Content-Type': 'application/json' },
//     });
//   } catch (error) {
//     console.log('Error updating user:', error);
//     return new Response(JSON.stringify({ error: 'Failed to update user' }), {
//       status: 500,
//       headers: { 'Content-Type': 'application/json' },
//     });
//   }
// }
