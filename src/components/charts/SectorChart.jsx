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

const SectorChart = ({ data, onFilterChange }) => {
  const entries = Object.entries(data || {});
  if (!entries.length) {
    return <p>Nenhum dado para exibir.</p>;
  }

  // Ordenar do maior para o menor
  entries.sort((a, b) => b[1] - a[1]);

  const labels = entries.map(([label]) => label);
  const values = entries.map(([, value]) => value);
  const maxValue = Math.max(...values);

  const chartData = {
    labels,
    datasets: [
      {
        label: "Atendimentos",
        data: values,
        backgroundColor: values.map((v) =>
          v === maxValue ? "#0f766e" : "#0EA5E9"
        ),
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: { mode: "nearest", intersect: false },
    plugins: {
      legend: { display: false },
      datalabels: {
        anchor: "end",
        align: "end",
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
    onFilterChange({ field: "setorNome", value: label, source: "sector" });
  };

  return <Bar data={chartData} options={options} onClick={handleClick} />;
};

export default SectorChart;

