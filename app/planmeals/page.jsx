'use client';

import { useEffect, useState } from 'react';
import { Trash2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { Button } from '../../components/ui/button';
import Meals from '../../components/profile/Meals';
import IngredientsModal from '../../components/meals/IngredientsModal';
import { FaSpinner } from 'react-icons/fa';

export default function PlanMeals() {
  const { data: session, status, update } = useSession();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const router = useRouter();

  const days = [
    'Monday',
    'Tuesday',
    'Wednesday',
    'Thursday',
    'Friday',
    'Saturday',
    'Sunday',
  ];
  const [selectedDay, setSelectedDay] = useState('Monday');
  const [mealPlans, setMealPlans] = useState(
    days.reduce((acc, day) => ({ ...acc, [day]: [] }), {})
  );
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/signin');
    }

    if (status === 'authenticated' && !session?.user?.id) {
      update();
    }
  }, [status, session]);

  const addItemToDay = (items) => {
    setMealPlans((prev) => ({
      ...prev,
      [selectedDay]: [...prev[selectedDay], ...items], // เพิ่มหลายรายการพร้อมกัน
    }));
  };

  const removeItemFromDay = (index) => {
    setMealPlans((prev) => ({
      ...prev,
      [selectedDay]: prev[selectedDay].filter((_, i) => i !== index),
    }));
  };

  const generateMealPlan = async () => {
    setLoading(true);

    const payload = {
      userId: session.user.id,
      days: Object.keys(mealPlans).reduce((acc, day) => {
        acc[day] = {
          ingredients: mealPlans[day].map((item) => item.id),
        };
        return acc;
      }, {}),
    };

    try {
      const response = await fetch(
        'http://localhost:3000/api/generateMealPlan',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(payload),
        }
      );

      if (!response.ok) throw new Error('กรุณาลองใหม่อีกครั้ง');

      router.push('/profile');
    } catch (error) {
      setMessage(error.message);
    } finally {
      setLoading(false);
    }
  };

  const isMealPlanComplete = () => {
    return days.every((day) => mealPlans[day].length > 0);
  };

  return (
    status === 'authenticated' &&
    session.user && (
      <>
        {loading && (
          <div className="fixed top-0 left-0 w-full h-full bg-gray-700 bg-opacity-50 flex justify-center items-center z-50">
            <FaSpinner className="text-white animate-spin text-4xl" />
            <p className="ms-5">กำลังสร้างแพลนอาหาร....</p>
          </div>
        )}

        <section className="container mx-auto px-6 py-5 rounded-2xl">
          <div className="flex space-x-2 overflow-x-auto pb-2">
            {days.map((day) => (
              <Button
                key={day}
                variant={selectedDay === day ? 'default' : 'outline'}
                onClick={() => setSelectedDay(day)}
              >
                {day}
              </Button>
            ))}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-4">
            <Button onClick={() => setOpen(true)}>เลือกวัตถุดิบ</Button>
            <IngredientsModal
              open={open}
              setOpen={setOpen}
              setSelectedItems={addItemToDay}
            />
          </div>

          {mealPlans[selectedDay].length > 0 && (
            <div className=" mx-auto mb-5 p-5 mt-5 rounded-xl">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-4">
                {mealPlans[selectedDay].map((item, index) => (
                  <div
                    key={index}
                    className="flex flex-col items-center  p-4 rounded-lg shadow-md"
                  >
                    <img
                      src={`/images/ingredients/${item.image}`}
                      alt={item.name}
                      className="w-[300px] h-[200px] object-cover rounded-lg shadow-md"
                    />
                    <div className="mt-2 text-2xl font-semibold">
                      {item.name}
                    </div>
                    <div className="font-medium ">
                      🔥 แคลอรี่: {item.calories}
                    </div>
                    <div className="font-medium ">
                      💪 โปรตีน: {item.protein}
                    </div>
                    <div className="font-medium ">🥑 ไขมัน: {item.fat}</div>
                    <div className="font-medium ">
                      🍞 คาร์โบ: {item.carbohydrates}
                    </div>
                    <Button
                      variant="outline"
                      onClick={() => removeItemFromDay(index)}
                      className="mt-2 p-2"
                    >
                      <Trash2 size={16} /> ลบ
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          )}
          <div className="mt-5">
            <Button
              onClick={generateMealPlan}
              disabled={!isMealPlanComplete() || loading}
            >
              {loading ? 'กำลังสร้างแพลนอาหาร...' : 'สร้างแพลนอาหาร'}
            </Button>
          </div>
          {message && (
            <div className=" text-sm mt-2 ">
              <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-2">
                {message}
              </div>
            </div>
          )}

          <div className="">
            <h1 className="text-2xl md:text-6xl font-bold mb-4 ">เมนูอาหาร</h1>
            <Meals />
          </div>
        </section>
      </>
    )
  );
}
