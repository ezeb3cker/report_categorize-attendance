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

ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip, Legend);

const SectorConversionChart = ({ data, onFilterChange }) => {
  const items = (Array.isArray(data) ? data : []).filter(
    (i) => typeof i.conversao === "number"
  );
  const labels = items.map((i) => i.setor);
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
        backgroundColor: "#16a34a",
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: { mode: "nearest", intersect: false },
    plugins: {
      legend: { display: false },
      // desativa exibição de valores dentro das barras para este gráfico
      datalabels: { display: false },
      tooltip: {
        callbacks: {
          label: (ctx) => {
            const item = items[ctx.dataIndex];
            if (!item || !item.total) {
              return "Nenhum atendimento concluído";
            }
            return `${ctx.parsed.y.toFixed(1)}% (${item.agendou}/${item.total})`;
          },
        },
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
    onFilterChange({ field: "setorNome", value: label, source: "sectorConversion" });
  };

  return <Bar data={chartData} options={options} onClick={handleClick} />;
};

export default SectorConversionChart;

