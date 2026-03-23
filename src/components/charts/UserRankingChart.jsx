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

const UserRankingChart = ({ data, onFilterChange }) => {
  const labels = Object.keys(data || {});
  const values = Object.values(data || {});

  if (!labels.length) {
    return <p>Nenhum dado para exibir.</p>;
  }

  const chartData = {
    labels,
    datasets: [
      {
        label: "Atendimentos",
        data: values,
        backgroundColor: "#22C55E",
      },
    ],
  };

  const options = {
    responsive: true,
    plugins: {
      legend: { display: false },
      datalabels: {
        anchor: "end",
        align: "end",
        offset: 4,
        clamp: true,
        color: "#111827",
        font: { size: 10, weight: "600" },
        formatter: (v) => v,
      },
    },
  };

  const handleClick = (_event, elements) => {
    if (!onFilterChange || !elements?.length) return;
    const index = elements[0].index;
    const label = labels[index];
    onFilterChange({ field: "usuarioNome", value: label, source: "user" });
  };

  return <Bar data={chartData} options={options} onClick={handleClick} />;
};

export default UserRankingChart;

