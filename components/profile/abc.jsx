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

function TableResult() {
  const { data: session, status } = useSession();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [message, setMessage] = useState('');

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

  return (
    status === 'authenticated' &&
    session.user && (
      <div className="container bg-gray-400 bg-opacity-50 mx-auto mb-5 p-5 rounded-xl text-white font-semibold">
        {/* 📌 Dropdown เลือกวันที่ */}
        <div className="mb-4">
          <Label htmlFor="date">Select Date</Label>
          <select
            id="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="border rounded-md p-2 w-full text-black"
          >
            {dateOptions.map((option) => (
              <option key={option.id} value={option.id}>
                {option.date}
              </option>
            ))}
          </select>
        </div>

        {/* 📌 แสดง Health Metrics ของวันที่เลือก */}
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
            </TableBody>
          </Table>
        ) : (
          <p className="text-red-500">No health metrics found.</p>
        )}
      </div>
    )
  );
}
