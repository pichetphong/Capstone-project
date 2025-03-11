'use client';

import { useEffect, useState } from 'react';
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

export default function PlanMeals() {
  const { data: session, status, update } = useSession();
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

  return (
    status === 'authenticated' &&
    session.user && (
      <>
        <section className="container mx-auto my-5 px-6 py-5 rounded-2xl">
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

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
            <Button onClick={() => setOpen(true)}>เลือกวัตถุดิบ</Button>
            <IngredientsModal
              open={open}
              setOpen={setOpen}
              setSelectedItems={addItemToDay}
            />
          </div>

          {mealPlans[selectedDay].length > 0 && (
            <div className="container bg-gray-400 bg-opacity-50 mx-auto mb-5 p-5 mt-5 rounded-xl">
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
                          variant="destructive"
                          onClick={() => removeItemFromDay(index)}
                        >
                          นำออก
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </section>
      </>
    )
  );
}
