import React from "react";
import { Doughnut } from "react-chartjs-2";
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
} from "chart.js";

ChartJS.register(ArcElement, Tooltip, Legend);

const ChannelChart = ({ data, onFilterChange }) => {
  const labels = Object.keys(data || {});
  const values = Object.values(data || {});

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
    onFilterChange({ field: "canalNome", value: label, source: "channel" });
  };

  return (
    <Doughnut
      data={chartData}
      onClick={handleClick}
      options={{
        responsive: true,
        maintainAspectRatio: false,
        interaction: { mode: "nearest", intersect: false },
        plugins: {
          // chartjs-plugin-datalabels pode estar registrado globalmente
          datalabels: { display: false },
        },
      }}
    />
  );
};

export default ChannelChart;

