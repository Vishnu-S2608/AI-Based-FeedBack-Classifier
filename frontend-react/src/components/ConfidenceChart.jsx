import { Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Tooltip,
} from "chart.js";

ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip);

const CATEGORY_COLORS = {
  positive: { bg: "rgba(16,185,129,0.6)", border: "#10b981" },
  negative: { bg: "rgba(239,68,68,0.6)", border: "#ef4444" },
  constructive: { bg: "rgba(245,158,11,0.6)", border: "#f59e0b" },
  formal: { bg: "rgba(59,130,246,0.6)", border: "#3b82f6" },
  informal: { bg: "rgba(168,85,247,0.6)", border: "#a855f7" },
};

export default function ConfidenceChart({ probabilities }) {
  if (!probabilities) return null;

  const labels = Object.keys(probabilities).map(
    (l) => l.charAt(0).toUpperCase() + l.slice(1)
  );
  const values = Object.values(probabilities);
  const keys = Object.keys(probabilities);

  const data = {
    labels,
    datasets: [
      {
        data: values,
        backgroundColor: keys.map((k) => CATEGORY_COLORS[k]?.bg || "rgba(148,163,184,0.6)"),
        borderColor: keys.map((k) => CATEGORY_COLORS[k]?.border || "#94a3b8"),
        borderWidth: 2,
        borderRadius: 8,
      },
    ],
  };

  const options = {
    indexAxis: "y",
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        callbacks: {
          label: (ctx) => `${ctx.raw}%`,
        },
      },
    },
    scales: {
      x: {
        max: 100,
        grid: { color: "rgba(255,255,255,0.06)" },
        ticks: { color: "#9ca3af", callback: (v) => v + "%" },
      },
      y: {
        grid: { display: false },
        ticks: { color: "#e2e8f0", font: { weight: "600" } },
      },
    },
  };

  return (
    <div className="confidence-chart">
      <h4>Probability Distribution</h4>
      <div style={{ height: "180px" }}>
        <Bar data={data} options={options} />
      </div>
    </div>
  );
}
