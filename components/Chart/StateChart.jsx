'use client';

import React from 'react';
import { Radar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  RadialLinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
  Legend,
} from 'chart.js';

ChartJS.register(
  RadialLinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
  Legend
);

export default function StateChart({ userData }) {
  if (!userData || userData.length < 2) {
    return <p>ข้อมูลไม่เพียงพอสำหรับการเปรียบเทียบ</p>;
  }

  // ใช้ข้อมูลล่าสุดและข้อมูลก่อนหน้า
  const latestMetrics = userData[userData.length - 1];
  const previousMetrics = userData[userData.length - 2];

  // กราฟแรก: dailySurplus, tdee, bmr
  const chartData1 = {
    labels: ['แคลอรี่ที่ควรได้รับต่อวัน', 'TDEE', 'BMR'],
    datasets: [
      {
        label: 'ค่าปัจจุบัน',
        data: [
          latestMetrics.dailySurplus,
          latestMetrics.tdee,
          latestMetrics.bmr,
        ],
        borderColor: '#27548A',
        backgroundColor: 'rgba(39, 84, 138, 0.2)',
        pointBackgroundColor: 'rgba(39, 84, 138, 1)',
      },
      {
        label: 'ค่าก่อนหน้า',
        data: [
          previousMetrics.dailySurplus,
          previousMetrics.tdee,
          previousMetrics.bmr,
        ],
        borderColor: '#DDA853',
        backgroundColor: 'rgba(221, 168, 83, 0.2)',
        pointBackgroundColor: 'rgba(221, 168, 83, 1)',
      },
    ],
  };

  // กราฟที่สอง: weight, fatMass, leanMass
  const chartData2 = {
    labels: ['น้ำหนัก (กก.)', 'มวลไขมัน (กก.)', 'มวลกล้ามเนื้อ (กก.)'],
    datasets: [
      {
        label: 'ค่าปัจจุบัน',
        data: [
          latestMetrics.weight,
          latestMetrics.fatMass,
          latestMetrics.leanMass,
        ],
        borderColor: '#27548A',
        backgroundColor: 'rgba(39, 84, 138, 0.2)',
        pointBackgroundColor: 'rgba(39, 84, 138, 1)',
      },
      {
        label: 'ค่าก่อนหน้า',
        data: [
          previousMetrics.weight,
          previousMetrics.fatMass,
          previousMetrics.leanMass,
        ],
        borderColor: '#DDA853',
        backgroundColor: 'rgba(221, 168, 83, 0.2)',
        pointBackgroundColor: 'rgba(221, 168, 83, 1)',
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top',
      },
      tooltip: {
        display: true,
      },
    },
    scales: {
      r: {
        angleLines: {
          display: true,
        },
        pointLabels: {
          display: false, // ปิดตัวเลขรอบกราฟ
        },
        suggestedMin: 0,
      },
    },
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div>
        <Radar
          data={chartData1}
          options={{
            ...chartOptions,
            plugins: {
              ...chartOptions.plugins,
            },
          }}
        />
      </div>
      <div>
        <Radar
          data={chartData2}
          options={{
            ...chartOptions,
            plugins: {
              ...chartOptions.plugins,
            },
          }}
        />
      </div>
    </div>
  );
}
