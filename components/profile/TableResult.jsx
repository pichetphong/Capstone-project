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
import { FaSpinner } from 'react-icons/fa';

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
        if (!res.ok) throw new Error('ไม่พบบันชีผู้ใช้');

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
      setMessage('ไม่พบไอดีผู้ใช้');

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

    try {
      const res = await fetch('http://localhost:3000/api/kcalCalculator', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!res.ok) throw new Error('เกิดข้อผิดพลาดในการบันทึกข้อมูล');

      const data = await res.json();
      window.location.reload();
      setMessage('บันทึกข้อมูลเรียบร้อย');
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
      date: new Date(metric.createdAt).toISOString().split('T')[0],
    }))
    .sort((a, b) => new Date(b.date) - new Date(a.date));

  // 📌 ตั้งค่า Default เป็นข้อมูลล่าสุด
  useEffect(() => {
    if (dateOptions.length > 0 && !selectedDate) {
      setSelectedDate(dateOptions[0].id);
    }
  }, [dateOptions]);

  // 📌 หา Health Metrics ตามวันที่ที่เลือก
  const selectedMetrics =
    healthMetricsList.find((metric) => metric.id === selectedDate) ||
    healthMetricsList[0]; // ให้ default เป็นค่าล่าสุด

  if (status === 'loading' || loading)
    return <FaSpinner className=" animate-spin text-4xl" />;

  const latestHealthMetrics = data?.healthMetrics?.length
    ? data.healthMetrics.reduce((latest, current) =>
        new Date(current.createdAt) > new Date(latest.createdAt)
          ? current
          : latest
      )
    : null;

  const metrics = [
    { label: 'อายุ', key: 'age' },
    { label: 'น้ำหนัก', key: 'weight' },
    { label: 'ส่วนสูง', key: 'height' },
    { label: 'เพศ', key: 'gender' },
    { label: 'เป้าหมายการออกกำลังกาย', key: 'goal' },
    { label: 'วิธีรับประทาน', key: 'dietType' },
    { label: 'ระดับการออกกำลังกาย', key: 'activityLevel' },
    { label: 'BMI', key: 'bmi' },
    { label: 'BMR', key: 'bmr' },
    { label: 'TDEE', key: 'tdee' },
  ];

  if (!latestHealthMetrics)
    return (
      <>
        <Dialog>
          <DialogTrigger asChild>
            <Button variant="">บันทึกข้อมูลสุขภาพ</Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg">
            <DialogTitle>บันทึกข้อมูลสุขภาพ</DialogTitle>
            <DialogDescription>
              ปรับแต่งเป้าหมายการออกกำลังกายและการบริโภคอาหารของคุณ
            </DialogDescription>
            <Card>
              <CardContent className="space-y-2">
                <div className="space-y-1">
                  <Label htmlFor="age">อายุ</Label>
                  <Input
                    id="age"
                    type="number"
                    value={age}
                    onChange={(e) => setAge(e.target.value)}
                  />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="weight">น้ำหนัก</Label>
                  <Input
                    id="weight"
                    type="number"
                    value={weight}
                    onChange={(e) => setWeight(e.target.value)}
                  />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="height">ส่วนสูง</Label>
                  <Input
                    id="height"
                    type="number"
                    value={height}
                    onChange={(e) => setHeight(e.target.value)}
                  />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="gender">เพศ</Label>
                  <select
                    id="gender"
                    value={gender}
                    onChange={(e) => setGender(e.target.value)}
                    className="border rounded-md p-2 w-full"
                  >
                    <option value="" disabled>
                      เลือกเพศของคุณ
                    </option>
                    <option value="FEMALE">ผู้หญิง</option>
                    <option value="MALE">ผู้ชาย</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <Label htmlFor="goal">เป้าหมายการออกกำลังกาย</Label>
                  <select
                    id="goal"
                    value={goal}
                    onChange={(e) => setGoal(e.target.value)}
                    className="border rounded-md p-2 w-full"
                  >
                    <option value="" disabled>
                      เลือกเป้าหมายการออกกำลังกาย
                    </option>
                    <option value="LOSE_WEIGHT">ลดน้ำหนัก</option>
                    <option value="MAINTAIN">คงน้ำหนัก</option>
                    <option value="GAIN_WEIGHT">เพิ่มน้ำหนัก</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <Label htmlFor="dietType">วิธีรับประทาน</Label>
                  <select
                    id="dietType"
                    value={dietType}
                    onChange={(e) => setDietType(e.target.value)}
                    className="border rounded-md p-2 w-full"
                  >
                    <option value="" disabled>
                      เลือกวิธีรับประทาน
                    </option>
                    <option value="LOW_CARB">แป้งต่ำ</option>
                    <option value="BALANCED">สมมาตร</option>
                    <option value="HIGH_PROTEIN">โปรตีนสูง</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <Label htmlFor="activityLevel">ระดับการออกกำลังกาย</Label>
                  <select
                    id="activityLevel"
                    value={activityLevel}
                    onChange={(e) => setActivityLevel(e.target.value)}
                    className="border rounded-md p-2 w-full"
                  >
                    <option value="" disabled>
                      เลือกระดับการออกกำลังกาย
                    </option>
                    <option value="SEDENTARY">ไม่ออกกำลังกาย</option>
                    <option value="LIGHTLY_ACTIVE">
                      สัปดาห์ละประมาณ 1-3 วัน
                    </option>
                    <option value="MODERATELY_ACTIVE">
                      สัปดาห์ละประมาณ 3-5 วัน
                    </option>
                    <option value="VERY_ACTIVE">สัปดาห์ละประมาณ 6-7 วัน</option>
                    <option value="SUPER_ACTIVE">ทุกวันเช้าและเย็น</option>
                  </select>
                </div>
              </CardContent>
              <CardFooter>
                <Button onClick={handleUpdate}>บันทึกข้อมูลสุขภาพ</Button>
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
      <div className="container bg-gray-400 bg-opacity-50 mx-auto mb-5 p-5 rounded-xl  ">
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
              {metrics.map(({ label, key }) => (
                <TableRow key={key}>
                  <TableCell className="w-[100px] font-semibold">
                    {label}
                  </TableCell>
                  <TableCell className="w-[50px]">:</TableCell>
                  <TableCell className="min-w-[100px]">
                    {selectedMetrics[key]}
                  </TableCell>
                </TableRow>
              ))}
              <TableRow className="hover:bg-transparent">
                <TableCell>
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button variant="">Update</Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-lg">
                      <DialogTitle>Edit Details</DialogTitle>
                      <DialogDescription>
                        Adjust your fitness goals and preferences.
                      </DialogDescription>
                      <Card>
                        <CardContent className="space-y-2">
                          <div className="space-y-1">
                            <Label htmlFor="age">Age</Label>
                            <Input
                              id="age"
                              type="number"
                              value={age}
                              onChange={(e) => setAge(e.target.value)}
                            />
                          </div>
                          <div className="space-y-1">
                            <Label htmlFor="weight">Weight</Label>
                            <Input
                              id="weight"
                              type="number"
                              value={weight}
                              onChange={(e) => setWeight(e.target.value)}
                            />
                          </div>
                          <div className="space-y-1">
                            <Label htmlFor="height">Height</Label>
                            <Input
                              id="height"
                              type="number"
                              value={height}
                              onChange={(e) => setHeight(e.target.value)}
                            />
                          </div>
                          <div className="space-y-1">
                            <Label htmlFor="gender">Gender</Label>
                            <select
                              id="gender"
                              value={gender}
                              onChange={(e) => setGender(e.target.value)}
                              className="border rounded-md p-2 w-full"
                            >
                              <option value="" disabled>
                                Select your gender
                              </option>
                              <option value="FEMALE">FEMALE</option>
                              <option value="MALE">MALE</option>
                            </select>
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
                            <Label htmlFor="activityLevel">Activity</Label>
                            <select
                              id="activityLevel"
                              value={activityLevel}
                              onChange={(e) => setActivityLevel(e.target.value)}
                              className="border rounded-md p-2 w-full"
                            >
                              <option value="" disabled>
                                Select your activity
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
                <TableCell></TableCell>
                <TableCell></TableCell>
              </TableRow>
            </TableBody>
          </Table>
        ) : (
          <p className="text-red-500">No health metrics found.</p>
        )}
        {message && (
          <div className=" text-sm mt-2">
            <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-2">
              {message}
            </div>
          </div>
        )}
      </div>
    )
  );
}
