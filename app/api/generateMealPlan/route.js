import { PrismaClient } from '@prisma/client';
import OpenAI from 'openai';

const prisma = new PrismaClient();
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(req) {
  const { dailySurplus, protein, fat, carbs, ingredients } = await req.json();

  if (!dailySurplus || !protein || !fat || !carbs || !ingredients) {
    return new Response(
      JSON.stringify({ error: 'Missing required parameters' }),
      { status: 400 }
    );
  }

  const prompt = `
  คุณเป็นเชฟที่เชี่ยวชาญด้านโภชนาการ ช่วยสร้างเมนูอาหาร 3 มื้อสำหรับ 1 วัน 
  โดยให้แต่ละมื้อมีพลังงานและสารอาหารที่สมดุลกันตามเป้าหมายของวันนี้:
  - พลังงานรวม: ${dailySurplus} kcal
  - โปรตีน: ${protein}g
  - ไขมัน: ${fat}g
  - คาร์โบไฮเดรต: ${carbs}g

  **วัตถุดิบที่สามารถใช้ได้:** 
  ${JSON.stringify(ingredients, null, 2)}

  แต่ละมื้อต้องมีสารอาหารใกล้เคียงกัน
  สามารถใช้วัตถุดิบในรายการข้างต้น และปรับปริมาณเพื่อให้ได้สารอาหารที่เหมาะสม
  ให้รายละเอียดของแต่ละเมนูในรูปแบบ JSON โดยมีฟิลด์:
    - \`meal\` (เช้า, กลางวัน, เย็น)
    - \`menu_name\` (ชื่อเมนู)
    - \`ingredients\` (รายการวัตถุดิบและปริมาณที่ใช้)
    - \`cooking_method\` (วิธีทำ)
  `;

  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-4o-2024-08-06',
      messages: [
        {
          role: 'system',
          content:
            'You are an expert Thai chef specializing in balanced meal planning.',
        },
        { role: 'user', content: prompt },
      ],
      temperature: 0.7,
    });

    // convert the response to JSON
    const mealPlan = JSON.parse(response.choices[0].message.content);

    return new Response(JSON.stringify({ mealPlan }), { status: 200 });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
    });
  }
}
