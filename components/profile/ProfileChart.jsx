'use client';

import { useSession } from 'next-auth/react';
import { useState, useEffect } from 'react';
import WeightChart from '../Chart/WeightChart';
import FatLeanChart from '../Chart/FatLeanChart';
import BodyFatChart from '../Chart/BodyFatChart';
import KcalChart from '../Chart/KcalChart';
import { FaSpinner } from 'react-icons/fa';

export default function ProfileChart() {
  const { data: session, status } = useSession();
  const userId = session?.user?.id;

  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [userData, setUserData] = useState(null);

  useEffect(() => {
    if (!userId) return;

    const fetchData = async () => {
      try {
        const res = await fetch(`http://localhost:3000/api/user/${userId}`);
        if (!res.ok) throw new Error('ไม่พบบันชีผู้ใช้');

        const json = await res.json();
        setUserData(json.healthMetrics);
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

  if (error) {
    return (
      <div className="flex justify-center items-center h-screen">
        <p className="text-red-500 text-lg">{error}</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4">
      <div className="grid grid-cols-1 gap-4">
        <div className="bg-white shadow-md rounded-lg p-4 w-full ">
          <WeightChart userData={userData} />
        </div>
        <div className="bg-white shadow-md rounded-lg p-4 w-full ">
          <FatLeanChart userData={userData} />
        </div>
        <div className="bg-white shadow-md rounded-lg p-4 w-full ">
          <BodyFatChart userData={userData} />
        </div>
        <div className="bg-white shadow-md rounded-lg p-4 w-full ">
          <KcalChart userData={userData} />
        </div>
      </div>
    </div>
  );
}
