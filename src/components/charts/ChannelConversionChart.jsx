import React from "react";
import { Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Tooltip,
  Legend,
} from "chart.js";
import ChartDataLabels from "chartjs-plugin-datalabels";

ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip, Legend, ChartDataLabels);

const ChannelConversionChart = ({ data, onFilterChange }) => {
  const items = Array.isArray(data) ? data : [];
  const labels = items.map((i) => i.canal);
  const values = items.map((i) => i.conversao);

  if (!labels.length) {
    return <p>Nenhum dado para exibir.</p>;
  }

  const chartData = {
    labels,
    datasets: [
      {
        label: "Taxa de conversão (%)",
        data: values,
        backgroundColor: "#0ea5e9",
      },
    ],
  };

  const options = {
    responsive: true,
    plugins: {
      legend: { display: false },
      tooltip: {
        callbacks: {
          label: (ctx) => `${ctx.parsed.y.toFixed(1)}%`,
        },
      },
      datalabels: {
        anchor: "end",
        align: "end",
        offset: 4,
        clamp: true,
        color: "#111827",
        font: { size: 10, weight: "600" },
        formatter: (v) => `${v.toFixed(1)}%`,
      },
    },
    scales: {
      y: {
        ticks: {
          callback: (value) => `${value}%`,
        },
        beginAtZero: true,
        max: 100,
      },
    },
  };

  const handleClick = (_event, elements) => {
    if (!onFilterChange || !elements?.length) return;
    const index = elements[0].index;
    const label = labels[index];
    onFilterChange({ field: "canalNome", value: label, source: "channelConversion" });
  };

  return <Bar data={chartData} options={options} onClick={handleClick} />;
};

export default ChannelConversionChart;

