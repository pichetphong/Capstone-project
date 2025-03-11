'use client';

import { useEffect, useState } from 'react';
import { Trash2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { Button } from '../../components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../../components/ui/table';
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

  const addItemToDay = (item) => {
    setMealPlans((prev) => ({
      ...prev,
      [selectedDay]: [...prev[selectedDay], item],
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

      if (!response.ok) throw new Error('Failed to generate meal plan');

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
            <p className="ms-5">กำลังสร้างเมนู....</p>
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
            <div className="bg-gray-400 bg-opacity-50 mx-auto mb-5 p-5 mt-5 rounded-xl">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>ชื่อวัตถุดิบ</TableHead>
                    <TableHead>แคลอรี่</TableHead>
                    <TableHead>โปรตีน</TableHead>
                    <TableHead>ไขมัน</TableHead>
                    <TableHead>คาร์โบ</TableHead>
                    <TableHead>Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {mealPlans[selectedDay].map((item, index) => (
                    <TableRow key={index}>
                      <TableCell>{item.name}</TableCell>
                      <TableCell>{item.calories}</TableCell>
                      <TableCell>{item.protein}</TableCell>
                      <TableCell>{item.fat}</TableCell>
                      <TableCell>{item.carbohydrates}</TableCell>
                      <TableCell>
                        <Button
                          variant="outline"
                          onClick={() => removeItemFromDay(index)}
                          className="p-2"
                        >
                          <Trash2 size={16} />{' '}
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
          <div className="flex mt-5">
            <Button
              className="mr-4"
              onClick={generateMealPlan}
              disabled={!isMealPlanComplete() || loading}
            >
              {loading ? 'กำลังสร้างเมนู...' : 'สร้างเมนู'}
            </Button>

            {message && (
              <div className=" text-sm mt-2">
                <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-2">
                  {message}
                </div>
              </div>
            )}
          </div>
        </section>
      </>
    )
  );
}
