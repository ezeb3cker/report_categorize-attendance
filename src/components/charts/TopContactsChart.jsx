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

const TopContactsChart = ({ data, onFilterChange }) => {
  const entries = Array.isArray(data) ? data : [];
  const labels = entries.map(([name]) => name);
  const values = entries.map(([, count]) => count);

  if (!labels.length) {
    return <p>Nenhum dado para exibir.</p>;
  }

  const chartData = {
    labels,
    datasets: [
      {
        label: "Atendimentos",
        data: values,
        backgroundColor: "#F97316",
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
    onFilterChange({ field: "contatoNome", value: label, source: "contact" });
  };

  return <Bar data={chartData} options={options} onClick={handleClick} />;
};

export default TopContactsChart;

