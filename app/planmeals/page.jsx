'use client';

import { useEffect, useState } from 'react';
import { Trash2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { Button } from '../../components/ui/button';
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
  const [planStatus, setPlanStatus] = useState({});

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/signin');
    }

    if (status === 'authenticated' && !session?.user?.id) {
      update();
    }
  }, [status, session, router, update]);

  useEffect(() => {
    const newStatus = {};
    days.forEach((day) => {
      newStatus[day] = mealPlans[day].length > 0;
    });
    setPlanStatus(newStatus);
  }, [mealPlans]);

  const addItemToDay = (items) => {
    setMealPlans((prev) => ({
      ...prev,
      [selectedDay]: [...prev[selectedDay], ...items],
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

      router.push('/meals');
    } catch (error) {
      setMessage(error.message);
    } finally {
      setLoading(false);
    }
  };

  const isMealPlanComplete = () => {
    return days.every((day) => mealPlans[day].length > 0);
  };

  const calculateProgress = () => {
    const completedDays = days.filter(
      (day) => mealPlans[day].length > 0
    ).length;
    return Math.round((completedDays / days.length) * 100);
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
          <h1 className="text-2xl font-bold mb-4">วางแผนอาหารของคุณ</h1>

          <div className="mb-6">
            <div className="flex justify-between mb-1 text-sm">
              <span>ความคืบหน้า</span>
              <span>{calculateProgress()}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-green-500 h-2 rounded-full"
                style={{ width: `${calculateProgress()}%` }}
              ></div>
            </div>
          </div>

          <div className="flex flex-col md:flex-row gap-6">
            <div className="md:w-1/3 p-4 bg-gray-50 rounded-lg">
              <h2 className="text-xl font-bold mb-4">1. เลือกวัตถุดิบ</h2>
              <Button onClick={() => setOpen(true)} className="w-full mb-4">
                เพิ่มวัตถุดิบใหม่
              </Button>

              <div className="max-h-[500px] overflow-y-auto">
                {Object.values(mealPlans).flat().length > 0 ? (
                  <div className="grid grid-cols-2 gap-2">
                    {Array.from(
                      new Set(
                        Object.values(mealPlans)
                          .flat()
                          .map((item) => item.id)
                      )
                    ).map((id) => {
                      const item = Object.values(mealPlans)
                        .flat()
                        .find((i) => i.id === id);
                      return (
                        <div
                          key={id}
                          className="flex flex-col items-center p-2 rounded-lg shadow-sm border border-gray-200"
                        >
                          <img
                            src={`/images/ingredients/${item.image}`}
                            alt={item.name}
                            className="w-full h-20 object-cover rounded-lg"
                          />
                          <div className="mt-1 text-sm font-medium text-center">
                            {item.name}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="text-center text-gray-500 py-8">
                    คุณยังไม่มีวัตถุดิบ กรุณาเลือกวัตถุดิบก่อน
                  </div>
                )}
              </div>
            </div>

            <div className="md:w-2/3 p-4 bg-gray-50 rounded-lg">
              <h2 className="text-xl font-bold mb-4">
                2. จัดสรรวัตถุดิบตามวัน
              </h2>

              <div className="flex overflow-x-auto space-x-2 py-2 mb-4">
                {days.map((day) => (
                  <Button
                    key={day}
                    size="sm"
                    variant={selectedDay === day ? 'default' : 'outline'}
                    onClick={() => setSelectedDay(day)}
                    className={`${
                      planStatus[day] ? 'border-green-500' : ''
                    } min-w-[100px]`}
                  >
                    {day} {planStatus[day] && '✓'}
                  </Button>
                ))}
              </div>

              <div className="bg-white p-4 rounded-lg border">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold text-lg">{selectedDay}</h3>
                  <Button
                    onClick={() => setOpen(true)}
                    variant="outline"
                    size="sm"
                  >
                    เพิ่มวัตถุดิบ
                  </Button>
                </div>

                {mealPlans[selectedDay].length > 0 ? (
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {mealPlans[selectedDay].map((item, index) => (
                      <div
                        key={index}
                        className="flex items-center p-3 rounded-lg shadow-sm border border-gray-200 hover:border-gray-300"
                      >
                        <img
                          src={`/images/ingredients/${item.image}`}
                          alt={item.name}
                          className="w-14 h-14 object-cover rounded-lg"
                        />
                        <div className="ml-3 flex-1">
                          <div className="text-sm font-medium">{item.name}</div>
                        </div>
                        <button
                          onClick={() => removeItemFromDay(index)}
                          className="text-red-500 hover:text-red-700 p-1"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center text-gray-500 py-8">
                    ยังไม่มีวัตถุดิบสำหรับวันนี้ กดปุ่ม "เพิ่มวัตถุดิบ"
                    เพื่อเริ่มต้น
                  </div>
                )}
              </div>

              <div className="mt-6">
                <h3 className="font-medium mb-3">แผนอาหารทั้งสัปดาห์</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {days.map((day) => (
                    <div
                      key={day}
                      className={`p-3 rounded-lg border ${
                        planStatus[day]
                          ? 'bg-green-50 border-green-200'
                          : 'bg-gray-50'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-medium">{day}</h4>
                        {planStatus[day] && (
                          <span className="text-green-600 text-xs">
                            ✓ วัตถุดิบพร้อม
                          </span>
                        )}
                      </div>

                      {mealPlans[day].length > 0 ? (
                        <div className="flex flex-wrap gap-1">
                          {mealPlans[day].slice(0, 3).map((item, index) => (
                            <img
                              key={index}
                              src={`/images/ingredients/${item.image}`}
                              alt={item.name}
                              className="w-8 h-8 object-cover rounded-full"
                              title={item.name}
                            />
                          ))}
                          {mealPlans[day].length > 3 && (
                            <span className="flex items-center justify-center w-8 h-8 bg-gray-200 rounded-full text-xs">
                              +{mealPlans[day].length - 3}
                            </span>
                          )}
                        </div>
                      ) : (
                        <span className="text-sm text-gray-500">
                          ยังไม่มีวัตถุดิบ
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="mt-6 text-center">
            <Button
              onClick={generateMealPlan}
              disabled={!isMealPlanComplete() || loading}
              size="lg"
              className="px-8"
            >
              {loading ? 'กำลังสร้างแพลนอาหาร...' : 'สร้างแพลนอาหาร'}
            </Button>

            {!isMealPlanComplete() && (
              <p className="text-amber-600 text-sm mt-2">
                กรุณาเพิ่มวัตถุดิบให้ครบทุกวันก่อนสร้างแผนอาหาร
              </p>
            )}
          </div>

          {message && (
            <div className="text-sm mt-4">
              <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-2">
                {message}
              </div>
            </div>
          )}
        </section>

        <IngredientsModal
          open={open}
          setOpen={setOpen}
          setSelectedItems={addItemToDay}
          days={days}
          selectedDay={selectedDay}
          setSelectedDay={setSelectedDay}
        />
      </>
    )
  );
}
