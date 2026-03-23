import React from "react";
import { Pie } from "react-chartjs-2";
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
} from "chart.js";

ChartJS.register(ArcElement, Tooltip, Legend);

const CategoryChart = ({ data, onFilterChange }) => {
  const labels = Object.keys(data || {});
  const values = Object.values(data || {});
  const total = values.reduce((sum, v) => sum + v, 0);

  if (!labels.length) {
    return <p>Nenhum dado para exibir.</p>;
  }

  const chartData = {
    labels,
    datasets: [
      {
        data: values,
        backgroundColor: [
          "#6366F1",
          "#22C55E",
          "#F97316",
          "#E11D48",
          "#0EA5E9",
          "#84CC16",
          "#A855F7",
        ],
        borderWidth: 1,
      },
    ],
  };

  const handleClick = (_event, elements) => {
    if (!onFilterChange || !elements?.length) return;
    const index = elements[0].index;
    const label = labels[index];
    onFilterChange({ field: "category", value: label, source: "category" });
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      // chartjs-plugin-datalabels pode estar registrado globalmente
      datalabels: { display: false },
      tooltip: {
        callbacks: {
          label: (ctx) => {
            const label = ctx.label || "";
            const v = ctx.parsed;
            const pct = total ? ((v / total) * 100).toFixed(1) : 0;
            return `${label}: ${v} (${pct}%)`;
          },
        },
      },
    },
  };

  return <Pie data={chartData} onClick={handleClick} options={options} />;
};

export default CategoryChart;

