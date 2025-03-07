'use client';

import { useSession } from 'next-auth/react';

import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogTrigger,
  DialogTitle,
  DialogDescription,
} from '../ui/dialog';
import { Card, CardContent, CardFooter } from '../ui/card';
import { Table, TableBody, TableCell, TableRow } from '../ui/table';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Button } from '../ui/button';

export default function TableResult() {
  const { data: session, status } = useSession();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [message, setMessage] = useState('');
  const [gender, setGender] = useState('');
  const [age, setAge] = useState('');
  const [weight, setWeight] = useState('');
  const [height, setHeight] = useState('');
  const [goal, setGoal] = useState('');
  const [dietType, setDietType] = useState('');
  const [activityLevel, setActivityLevel] = useState('');
  const [selectedDate, setSelectedDate] = useState('');
  const [healthMetricsList, setHealthMetricsList] = useState([]);

  const userId = session?.user?.id;

  useEffect(() => {
    if (!userId) return;

    const fetchData = async () => {
      try {
        const res = await fetch(`http://localhost:3000/api/user/${userId}`);
        if (!res.ok) throw new Error('Failed to fetch user data');

        const json = await res.json();
        setData(json);
        setHealthMetricsList(json.healthMetrics || []);
      } catch (error) {
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [userId]);

  const handleUpdate = async () => {
    setLoading(true);
    setMessage('');

    const userId = session?.user?.id;
    if (!userId) {
      setMessage('User ID not found');

      setLoading(false);
      return;
    }

    const payload = {
      userId: userId,
      age: age ? parseInt(age, 10) : null,
      weight: weight ? parseFloat(weight) : null,
      height: height ? parseFloat(height) : null,
      gender: gender ? gender.toUpperCase() : null,
      goal: goal ? goal.toUpperCase() : null,
      dietType: dietType ? dietType.toUpperCase() : null,
      activityLevel: activityLevel ? activityLevel.toUpperCase() : null,
    };

    if (Object.values(payload).includes(null)) {
      setMessage('Some fields are missing');
      setLoading(false);

      throw new Error('Failed to update user data');
    }

    try {
      const res = await fetch('http://localhost:3000/api/kcalCalculator', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const errorResponse = await res.json();
        throw new Error(
          errorResponse.message || 'Failed to calculate calories'
        );
      }

      const data = await res.json();
      window.location.reload();
      setMessage('Calories calculated successfully!');
    } catch (error) {
      setMessage(error.message);
    } finally {
      setLoading(false);
    }
  };

  // 📌 จัดเรียงวันที่ Health Metrics ล่าสุดขึ้นก่อน
  const dateOptions = healthMetricsList
    .map((metric) => ({
      id: metric.id,
      date: new Date(metric.createdAt).toLocaleDateString(),
    }))
    .sort((a, b) => new Date(b.date) - new Date(a.date));

  // 📌 ตั้งค่า Default เป็นข้อมูลล่าสุด
  useEffect(() => {
    if (dateOptions.length > 0 && !selectedDate) {
      setSelectedDate(dateOptions[0].id);
    }
  }, [dateOptions]);

  // 📌 หา Health Metrics ตามวันที่ที่เลือก
  const selectedMetrics = healthMetricsList.find(
    (metric) => metric.id === selectedDate
  );

  if (status === 'loading' || loading) return <p>Loading...</p>;

  if (!userId) return <p className="text-red-500">User ID not found</p>;

  if (error) return <p className="text-red-500">Error: {error}</p>;

  const latestHealthMetrics = data?.healthMetrics?.length
    ? data.healthMetrics.reduce((latest, current) =>
        new Date(current.createdAt) > new Date(latest.createdAt)
          ? current
          : latest
      )
    : null;

  if (!latestHealthMetrics)
    return (
      <>
        <Dialog>
          <DialogTrigger asChild>
            <Button variant="secondary">Update</Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg">
            <DialogTitle>Edit Details</DialogTitle>
            <DialogDescription>
              Adjust your fitness goals and preferences.
            </DialogDescription>
            <Card>
              <CardContent className="space-y-2">
                <div className="space-y-1">
                  <Label htmlFor="gender">Gender</Label>
                  <Input
                    id="gender"
                    value={gender}
                    onChange={(e) => setGender(e.target.value)}
                  />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="age">Age</Label>
                  <Input
                    id="age"
                    value={age}
                    onChange={(e) => setAge(e.target.value)}
                  />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="weight">Weight</Label>
                  <Input
                    id="weight"
                    value={weight}
                    onChange={(e) => setWeight(e.target.value)}
                  />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="height">Height</Label>
                  <Input
                    id="height"
                    value={height}
                    onChange={(e) => setHeight(e.target.value)}
                  />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="goal">Goal</Label>
                  <select
                    id="goal"
                    value={goal}
                    onChange={(e) => setGoal(e.target.value)}
                    className="border rounded-md p-2 w-full"
                  >
                    <option value="" disabled>
                      Select your goal
                    </option>
                    <option value="LOSE_WEIGHT">Lose Weight</option>
                    <option value="MAINTAIN">Maintain</option>
                    <option value="GAIN_WEIGHT">Gain Weight</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <Label htmlFor="dietType">Diet Type</Label>
                  <select
                    id="dietType"
                    value={dietType}
                    onChange={(e) => setDietType(e.target.value)}
                    className="border rounded-md p-2 w-full"
                  >
                    <option value="" disabled>
                      Select your diet type
                    </option>
                    <option value="LOW_CARB">Low Carb</option>
                    <option value="BALANCED">Balanced</option>
                    <option value="HIGH_PROTEIN">High Protein</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <Label htmlFor="activityLevel">Activity Level</Label>
                  <select
                    id="activityLevel"
                    value={activityLevel}
                    onChange={(e) => setActivityLevel(e.target.value)}
                    className="border rounded-md p-2 w-full"
                  >
                    <option value="" disabled>
                      Select your activity level
                    </option>
                    <option value="SEDENTARY">Sedentary</option>
                    <option value="LIGHTLY_ACTIVE">Lightly Active</option>
                    <option value="MODERATELY_ACTIVE">Moderately Active</option>
                    <option value="VERY_ACTIVE">Very Active</option>
                    <option value="SUPER_ACTIVE">Super Active</option>
                  </select>
                </div>
              </CardContent>
              <CardFooter>
                <Button onClick={handleUpdate}>Save changes</Button>
              </CardFooter>
            </Card>
            {message && <p className=" text-sm mt-2">!! {message} !!</p>}
          </DialogContent>
        </Dialog>
      </>
    );

  return (
    status === 'authenticated' &&
    session.user && (
      <div className="container bg-gray-400 bg-opacity-50 mx-auto mb-5 p-5 rounded-xl text-white font-semibold">
        <Card className="mb-4">
          <div className="">
            <select
              id="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="border rounded-md p-2 w-full"
            >
              {dateOptions.map((option) => (
                <option key={option.id} value={option.id}>
                  {option.date}
                </option>
              ))}
            </select>
          </div>
        </Card>
        {selectedMetrics ? (
          <Table>
            <TableBody>
              <TableRow>
                <TableCell className="w-[100px]">Gender</TableCell>
                <TableCell className="w-[50px]">:</TableCell>
                <TableCell className="min-w-[100px]">
                  {selectedMetrics.gender}
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell>Age</TableCell>
                <TableCell>:</TableCell>
                <TableCell>{selectedMetrics.age}</TableCell>
              </TableRow>
              <TableRow>
                <TableCell>Weight</TableCell>
                <TableCell>:</TableCell>
                <TableCell>{selectedMetrics.weight}</TableCell>
              </TableRow>
              <TableRow>
                <TableCell>Height</TableCell>
                <TableCell>:</TableCell>
                <TableCell>{selectedMetrics.height}</TableCell>
              </TableRow>
              <TableRow>
                <TableCell>Goal</TableCell>
                <TableCell>:</TableCell>
                <TableCell>{selectedMetrics.goal}</TableCell>
              </TableRow>
              <TableRow>
                <TableCell>Diet Type</TableCell>
                <TableCell>:</TableCell>
                <TableCell>{selectedMetrics.dietType}</TableCell>
              </TableRow>
              <TableRow>
                <TableCell>Activity Level</TableCell>
                <TableCell>:</TableCell>
                <TableCell>{selectedMetrics.activityLevel}</TableCell>
              </TableRow>
              <TableRow>
                <TableCell>BMI</TableCell>
                <TableCell>:</TableCell>
                <TableCell>{selectedMetrics.bmi}</TableCell>
              </TableRow>
              <TableRow>
                <TableCell>BMR</TableCell>
                <TableCell>:</TableCell>
                <TableCell>{selectedMetrics.bmr}</TableCell>
              </TableRow>
              <TableRow>
                <TableCell>TDEE</TableCell>
                <TableCell>:</TableCell>
                <TableCell>{selectedMetrics.tdee}</TableCell>
              </TableRow>
              <TableRow className="hover:bg-transparent">
                <TableCell>
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button variant="secondary">Update</Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-lg">
                      <DialogTitle>Edit Details</DialogTitle>
                      <DialogDescription>
                        Adjust your fitness goals and preferences.
                      </DialogDescription>
                      <Card>
                        <CardContent className="space-y-2">
                          <div className="space-y-1">
                            <Label htmlFor="gender">Gender</Label>
                            <Input
                              id="gender"
                              value={gender}
                              onChange={(e) => setGender(e.target.value)}
                            />
                          </div>
                          <div className="space-y-1">
                            <Label htmlFor="age">Age</Label>
                            <Input
                              id="age"
                              value={age}
                              onChange={(e) => setAge(e.target.value)}
                            />
                          </div>
                          <div className="space-y-1">
                            <Label htmlFor="weight">Weight</Label>
                            <Input
                              id="weight"
                              value={weight}
                              onChange={(e) => setWeight(e.target.value)}
                            />
                          </div>
                          <div className="space-y-1">
                            <Label htmlFor="height">Height</Label>
                            <Input
                              id="height"
                              value={height}
                              onChange={(e) => setHeight(e.target.value)}
                            />
                          </div>
                          <div className="space-y-1">
                            <Label htmlFor="goal">Goal</Label>
                            <select
                              id="goal"
                              value={goal}
                              onChange={(e) => setGoal(e.target.value)}
                              className="border rounded-md p-2 w-full"
                            >
                              <option value="" disabled>
                                Select your goal
                              </option>
                              <option value="LOSE_WEIGHT">Lose Weight</option>
                              <option value="MAINTAIN">Maintain</option>
                              <option value="GAIN_WEIGHT">Gain Weight</option>
                            </select>
                          </div>

                          <div className="space-y-1">
                            <Label htmlFor="dietType">Diet Type</Label>
                            <select
                              id="dietType"
                              value={dietType}
                              onChange={(e) => setDietType(e.target.value)}
                              className="border rounded-md p-2 w-full"
                            >
                              <option value="" disabled>
                                Select your diet type
                              </option>
                              <option value="LOW_CARB">Low Carb</option>
                              <option value="BALANCED">Balanced</option>
                              <option value="HIGH_PROTEIN">High Protein</option>
                            </select>
                          </div>

                          <div className="space-y-1">
                            <Label htmlFor="activityLevel">
                              Activity Level
                            </Label>
                            <select
                              id="activityLevel"
                              value={activityLevel}
                              onChange={(e) => setActivityLevel(e.target.value)}
                              className="border rounded-md p-2 w-full"
                            >
                              <option value="" disabled>
                                Select your activity level
                              </option>
                              <option value="SEDENTARY">Sedentary</option>
                              <option value="LIGHTLY_ACTIVE">
                                Lightly Active
                              </option>
                              <option value="MODERATELY_ACTIVE">
                                Moderately Active
                              </option>
                              <option value="VERY_ACTIVE">Very Active</option>
                              <option value="SUPER_ACTIVE">Super Active</option>
                            </select>
                          </div>
                        </CardContent>
                        <CardFooter>
                          <Button onClick={handleUpdate}>Save changes</Button>
                        </CardFooter>
                      </Card>
                    </DialogContent>
                  </Dialog>
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        ) : (
          <p className="text-red-500">No health metrics found.</p>
        )}
      </div>
    )
  );
}
