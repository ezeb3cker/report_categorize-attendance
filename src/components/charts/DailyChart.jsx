import React from "react";
import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Tooltip,
  Legend,
} from "chart.js";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Tooltip,
  Legend
);

const DailyChart = ({ data, onFilterChange }) => {
  const rawKeys = Object.keys(data || {}).sort(); // YYYY-MM-DD

  if (!rawKeys.length) {
    return <p>Nenhum dado para exibir.</p>;
  }

  const values = rawKeys.map((l) => data[l] ?? 0);

  const total = values.reduce((sum, v) => sum + v, 0);
  const media = total / (values.length || 1);
  const maxValue = Math.max(...values);
  const maxIndex = values.indexOf(maxValue);

  const labels = rawKeys.map((key) => {
    // formata YYYY-MM-DD para DD/MM/YYYY
    const [year, month, day] = key.split("-");
    if (!year || !month || !day) return key;
    return `${day}/${month}/${year}`;
  });

  const chartData = {
    labels,
    datasets: [
      {
        label: "Atendimentos",
        data: values,
        borderColor: "#6366F1",
        backgroundColor: "rgba(99, 102, 241, 0.2)",
        tension: 0.3,
        pointRadius: values.map((_, idx) => (idx === maxIndex ? 5 : 3)),
        pointHoverRadius: 6,
      },
    ],
  };

  const options = {
    responsive: true,
    // Importante para respeitar a altura definida via CSS (.chartBody/.compactChartBody)
    maintainAspectRatio: false,
    interaction: { mode: "nearest", intersect: false },
    plugins: {
      legend: { display: false },
      // chartjs-plugin-datalabels pode estar registrado globalmente
      datalabels: { display: false },
      tooltip: {
        callbacks: {
          afterBody: (items) => {
            const v = items[0].parsed.y;
            const diff = v - media;
            const tendencia =
              diff > 0
                ? `Acima da média (+${diff.toFixed(1)})`
                : diff < 0
                ? `Abaixo da média (${diff.toFixed(1)})`
                : "Na média do período";
            return tendencia;
          },
        },
      },
    },
  };

  const handleClick = (_event, elements) => {
    if (!onFilterChange || !elements?.length) return;
    const index = elements[0].index;
    const raw = rawKeys[index]; // YYYY-MM-DD original para filtro
    onFilterChange({ field: "date", value: raw, source: "daily" });
  };

  return <Line data={chartData} options={options} onClick={handleClick} />;
};

export default DailyChart;

