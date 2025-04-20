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

  const dateOptions = healthMetricsList
    .map((metric) => ({
      id: metric.id,
      date: metric.createdAt, // ใช้ createdAt ดั้งเดิมสำหรับการเรียงลำดับ
      displayDate: new Date(metric.createdAt).toLocaleDateString(), // ใช้ toLocaleDateString() สำหรับแสดงผล
    }))
    .sort((a, b) => new Date(b.date) - new Date(a.date)); // เรียงลำดับจากวันที่ใหม่ไปเก่า

  useEffect(() => {
    if (dateOptions.length > 0 && !selectedDate) {
      setSelectedDate(dateOptions[0].id);
    }
  }, [dateOptions]);

  const selectedMetrics =
    healthMetricsList.find((metric) => metric.id === selectedDate) ||
    healthMetricsList[0];

  const latestHealthMetrics = data?.healthMetrics?.length
    ? data.healthMetrics.reduce((latest, current) =>
        new Date(current.createdAt) > new Date(latest.createdAt)
          ? current
          : latest
      )
    : null;

  useEffect(() => {
    if (latestHealthMetrics) {
      setGender(latestHealthMetrics.gender);
    }
  }, [latestHealthMetrics]);

  if (status === 'loading' || loading)
    return <FaSpinner className=" animate-spin text-4xl" />;

  const metrics = [
    { label: 'อายุ', key: 'age' },
    { label: 'น้ำหนัก', key: 'weight' },
    { label: 'ส่วนสูง', key: 'height' },
    { label: 'เพศ', key: 'gender' },
    { label: 'เป้าหมายที่ต้องการ', key: 'goal' },
    { label: 'วิธีรับประทาน', key: 'dietType' },
    { label: 'ระดับการออกกำลังกาย', key: 'activityLevel' },
  ];

  const metricsR = [
    { label: 'แคลอรี่ที่ควรได้รับต่อวัน', key: 'dailySurplus' },
    { label: 'เปอร์เซ็นต์ไขมัน', key: 'bodyFat' },
    { label: 'มวลไขมัน', key: 'fatMass' },
    { label: 'มวลกล้ามเนื้อ', key: 'leanMass' },
    { label: 'BMI', key: 'bmi' },
    { label: 'BMR', key: 'bmr' },
    { label: 'TDEE', key: 'tdee' },
  ];

  const genderMapping = {
    FEMALE: 'ผู้หญิง',
    MALE: 'ผู้ชาย',
  };

  const goalMapping = {
    LOSE_WEIGHT: 'ลดน้ำหนัก',
    MAINTAIN: 'คงน้ำหนัก',
    GAIN_WEIGHT: 'เพิ่มน้ำหนัก',
  };

  const dietTypeMapping = {
    LOW_CARB: 'แป้งต่ำ',
    BALANCED: 'สมมาตร',
    HIGH_PROTEIN: 'โปรตีนสูง',
  };

  const activityLevelMapping = {
    SEDENTARY: 'ไม่ออกกำลังกาย',
    LIGHTLY_ACTIVE: 'สัปดาห์ละประมาณ 1-3 วัน',
    MODERATELY_ACTIVE: 'สัปดาห์ละประมาณ 3-5 วัน',
    VERY_ACTIVE: 'สัปดาห์ละประมาณ 6-7 วัน',
    SUPER_ACTIVE: 'ทุกวันเช้าและเย็น',
  };

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

      window.location.reload();
    } catch (error) {
      setMessage(error.message);
    } finally {
      setLoading(false);
    }
  };

  if (!latestHealthMetrics)
    return (
      <>
        <Dialog>
          <DialogTrigger asChild>
            <Button variant="" className="bg-black text-white">
              บันทึกข้อมูลสุขภาพ
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg">
            <DialogTitle>บันทึกข้อมูลสุขภาพ</DialogTitle>
            <DialogDescription>
              ปรับแต่งเป้าหมายที่ต้องการและการบริโภคอาหารของคุณ
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
                  <Label htmlFor="goal">เป้าหมายที่ต้องการ</Label>
                  <select
                    id="goal"
                    value={goal}
                    onChange={(e) => setGoal(e.target.value)}
                    className="border rounded-md p-2 w-full"
                  >
                    <option value="" disabled>
                      เลือกเป้าหมายที่ต้องการ
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
      <>
        <div className="container text-black bg-white shadow-md rounded-lg p-4 mx-auto mb-5 ">
          <div className="mb-5">
            <select
              id="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="border bg-white rounded-md p-2 w-full"
            >
              {dateOptions.map((option) => (
                <option key={option.id} value={option.id}>
                  {option.displayDate}
                </option>
              ))}
            </select>
          </div>

          {selectedMetrics ? (
            <Table>
              <TableBody>
                {metrics.map(({ label, key }) => (
                  <TableRow key={key}>
                    <TableCell className="w-[175px] font-semibold">
                      {label}
                    </TableCell>
                    <TableCell className="w-[50px]">:</TableCell>
                    <TableCell className="min-w-[100px]">
                      {key === 'gender' && genderMapping[selectedMetrics[key]]}
                      {key === 'goal' && goalMapping[selectedMetrics[key]]}
                      {key === 'dietType' &&
                        dietTypeMapping[selectedMetrics[key]]}
                      {key === 'activityLevel' &&
                        activityLevelMapping[selectedMetrics[key]]}
                      {key === 'weight' && `${selectedMetrics[key]} กก.`}{' '}
                      {key === 'height' && `${selectedMetrics[key]} ซม.`}{' '}
                      {![
                        'gender',
                        'goal',
                        'dietType',
                        'activityLevel',
                        'weight',
                        'height',
                      ].includes(key) && selectedMetrics[key]}
                    </TableCell>
                  </TableRow>
                ))}

                <TableRow className="hover:bg-transparent">
                  <TableCell>
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button variant="" className="bg-black text-white">
                          บันทึกข้อมูลสุขภาพ
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-lg">
                        <DialogTitle>บันทึกข้อมูลสุขภาพ</DialogTitle>
                        <DialogDescription>
                          ปรับแต่งเป้าหมายที่ต้องการและการบริโภคอาหารของคุณ
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
                                disabled
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
                              <Label htmlFor="goal">เป้าหมายที่ต้องการ</Label>
                              <select
                                id="goal"
                                value={goal}
                                onChange={(e) => setGoal(e.target.value)}
                                className="border rounded-md p-2 w-full"
                              >
                                <option value="" disabled>
                                  เลือกเป้าหมายที่ต้องการ
                                </option>
                                <option value="LOSE_WEIGHT">ลดน้ำหนัก</option>
                                <option value="MAINTAIN">คงน้ำหนัก</option>
                                <option value="GAIN_WEIGHT">
                                  เพิ่มน้ำหนัก
                                </option>
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
                              <Label htmlFor="activityLevel">
                                ระดับการออกกำลังกาย
                              </Label>
                              <select
                                id="activityLevel"
                                value={activityLevel}
                                onChange={(e) =>
                                  setActivityLevel(e.target.value)
                                }
                                className="border rounded-md p-2 w-full"
                              >
                                <option value="" disabled>
                                  เลือกระดับการออกกำลังกาย
                                </option>
                                <option value="SEDENTARY">
                                  ไม่ออกกำลังกาย
                                </option>
                                <option value="LIGHTLY_ACTIVE">
                                  สัปดาห์ละประมาณ 1-3 วัน
                                </option>
                                <option value="MODERATELY_ACTIVE">
                                  สัปดาห์ละประมาณ 3-5 วัน
                                </option>
                                <option value="VERY_ACTIVE">
                                  สัปดาห์ละประมาณ 6-7 วัน
                                </option>
                                <option value="SUPER_ACTIVE">
                                  ทุกวันเช้าและเย็น
                                </option>
                              </select>
                            </div>
                          </CardContent>
                          <CardFooter>
                            <Button onClick={handleUpdate}>
                              บันทึกข้อมูลสุขภาพ
                            </Button>
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
        <div className="container text-black bg-white shadow-md rounded-lg p-4 mx-auto mb-5 ">
          {selectedMetrics ? (
            <Table>
              <TableBody>
                {metricsR.map(({ label, key }) => (
                  <TableRow key={key}>
                    <TableCell className="w-[175px] font-semibold">
                      {label}
                    </TableCell>
                    <TableCell className="w-[50px]">:</TableCell>
                    <TableCell className="min-w-[100px]">
                      {key === 'dailySurplus' &&
                        `${selectedMetrics[key]} กิโลแคลอรี่`}
                      {key === 'bodyFat' && `${selectedMetrics[key]}%`}
                      {key === 'fatMass' && `${selectedMetrics[key]} กิโลกรัม`}
                      {key === 'leanMass' && `${selectedMetrics[key]} กิโลกรัม`}
                      {key === 'bmi' && `${selectedMetrics[key]}`}
                      {key === 'bmr' && `${selectedMetrics[key]} กิโลแคลอรี่`}
                      {key === 'tdee' && `${selectedMetrics[key]} กิโลแคลอรี่`}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <p className="text-red-500">No health metrics found.</p>
          )}
        </div>
      </>
    )
  );
}
