'use client';

import React from 'react';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

export default function WeightChart({ userData }) {
  if (!userData || userData.length === 0) {
    return;
  }

  const sortedMetrics = [...userData].sort(
    (a, b) => new Date(a.createdAt) - new Date(b.createdAt)
  );

  const chartData = {
    labels: sortedMetrics.map((metric) =>
      new Date(metric.createdAt).toLocaleDateString()
    ),
    datasets: [
      {
        label: 'น้ำหนัก (กก.)',
        data: sortedMetrics.map((metric) => metric.weight),
        borderColor: '#27548A',
        backgroundColor: 'rgba(39, 84, 138, 0.2)',
        tension: 0.2,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: true,
      },
    },
  };

  return (
    <div>
      <Line data={chartData} options={chartOptions} />
    </div>
  );
}
