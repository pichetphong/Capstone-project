'use client';

import { useSession } from 'next-auth/react';
import { useEffect, useState } from 'react';
import { Card, CardContent } from '../ui/card';
import { Carousel, CarouselContent, CarouselItem } from '../ui/carousel';
import { FaSpinner } from 'react-icons/fa';

export default function Meals() {
  const { data: session, status } = useSession();
  const [meals, setMeals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const userId = session?.user?.id;

  useEffect(() => {
    if (!userId) return;

    const fetchData = async () => {
      try {
        const res = await fetch(`http://localhost:3000/api/user/${userId}`);
        if (!res.ok) throw new Error('ไม่พบบันชีผู้ใช้');

        const json = await res.json();
        const allMeals = json.Meals || [];

        if (allMeals.length === 0) {
          setMeals([]);
          return;
        }

        const latestCreatedAt = Math.max(
          ...allMeals.map((meal) => new Date(meal.createdAt).getTime())
        );

        const latestMeals = allMeals.filter(
          (meal) => new Date(meal.createdAt).getTime() === latestCreatedAt
        );

        const dayOrder = [
          'Monday',
          'Tuesday',
          'Wednesday',
          'Thursday',
          'Friday',
          'Saturday',
          'Sunday',
        ];

        latestMeals.sort((a, b) => {
          return dayOrder.indexOf(a.day) - dayOrder.indexOf(b.day);
        });

        const groupedMeals = latestMeals.reduce((acc, meal) => {
          if (!acc[meal.day]) acc[meal.day] = [];
          acc[meal.day].push(meal);
          return acc;
        }, {});

        Object.keys(groupedMeals).forEach((day) => {
          groupedMeals[day].sort((a, b) => {
            const mealOrder = { Breakfast: 1, Lunch: 2, Dinner: 3 };
            return mealOrder[a.meal] - mealOrder[b.meal];
          });
        });

        setMeals(groupedMeals);
      } catch (error) {
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [userId]);

  if (status === 'loading' || loading)
    return <FaSpinner className=" animate-spin text-4xl" />;

  return (
    status === 'authenticated' &&
    session.user && (
      <div className="container bg-gray-400 bg-opacity-50 mx-auto mb-5 p-5 rounded-xl  ">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-4">
          {Object.entries(meals).map(([day, dayMeals]) => (
            <div key={day}>
              <div className="text-xl md:text-3xl font-bold mt-3 ">{day}</div>
              <Carousel opts={{ align: 'start' }} className="w-full max-w-none">
                <CarouselContent>
                  {dayMeals.map((meal) => (
                    <CarouselItem key={meal.id} className="w-full">
                      <div className="p-1">
                        <Card className="h-[auto] rounded-2xl shadow-lg">
                          <CardContent className="flex flex-col items-center justify-center p-6 space-y-2">
                            <span className="text-2xl font-bold">
                              {meal.meal}
                            </span>
                            <span className="text-xl font-semibold">
                              {meal.name}
                            </span>

                            <div className="grid grid-cols-2 gap-2 text-lg">
                              <span className="font-medium">
                                🥘 Ingredients:
                              </span>
                              <ul>
                                {meal.Meal_Ingredients.map((mealIngredient) => (
                                  <li key={mealIngredient.id}>
                                    {mealIngredient.ingredient.name} -{' '}
                                    {mealIngredient.quantity}g
                                  </li>
                                ))}
                              </ul>
                              <span className="font-medium ">🔥 Calories:</span>
                              <span className="">{meal.calories}</span>

                              <span className="font-medium ">💪 Protein:</span>
                              <span className="">{meal.protein}g</span>

                              <span className="font-medium ">🥑 Fat:</span>
                              <span className="">{meal.fat}g</span>

                              <span className="font-medium ">🍞 Carbs:</span>
                              <span className="">{meal.carbohydrates}g</span>
                            </div>
                            <span className="text-sm italic ">
                              🔪 Cooking: {meal.cooking_method}
                            </span>
                            <span className="text-sm italic ">
                              💡 Reason: {meal.reason}
                            </span>
                          </CardContent>
                        </Card>
                      </div>
                    </CarouselItem>
                  ))}
                </CarouselContent>
              </Carousel>
            </div>
          ))}
        </div>
      </div>
    )
  );
}
