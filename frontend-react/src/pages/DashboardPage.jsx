import { useState, useEffect } from "react";
import { getDashboardStats } from "../utils/api";
import { Doughnut, Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  ArcElement,
  CategoryScale,
  LinearScale,
  BarElement,
  Tooltip,
  Legend,
} from "chart.js";

ChartJS.register(ArcElement, CategoryScale, LinearScale, BarElement, Tooltip, Legend);

const CATEGORY_COLORS = {
  positive: "#10b981",
  negative: "#ef4444",
  constructive: "#f59e0b",
  formal: "#3b82f6",
  informal: "#a855f7",
};

const CATEGORY_EMOJI = {
  positive: "😊",
  negative: "😞",
  constructive: "💡",
  formal: "📋",
  informal: "💬",
};

export default function DashboardPage() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [insights, setInsights] = useState("");
  const [insightsLoading, setInsightsLoading] = useState(false);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      const data = await getDashboardStats();
      setStats(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleGetInsights = async () => {
    setInsightsLoading(true);
    try {
      const data = await getDashboardInsights();
      setInsights(data.insight);
    } catch (err) {
      setInsights("Failed to load AI insights.");
    } finally {
      setInsightsLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="page-container">
        <div className="loading-state">
          <div className="spinner large" />
          <p>Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="page-container">
        <div className="empty-state">
          <p>Failed to load dashboard data.</p>
        </div>
      </div>
    );
  }

  // Doughnut chart data
  const doughnutData = {
    labels: Object.keys(stats.category_counts).map(
      (k) => k.charAt(0).toUpperCase() + k.slice(1)
    ),
    datasets: [
      {
        data: Object.values(stats.category_counts),
        backgroundColor: Object.keys(stats.category_counts).map(
          (k) => CATEGORY_COLORS[k]
        ),
        borderColor: "rgba(7,7,13,1)",
        borderWidth: 3,
        hoverOffset: 8,
      },
    ],
  };

  const doughnutOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "bottom",
        labels: { color: "#e2e8f0", padding: 16, font: { size: 13 } },
      },
    },
    cutout: "65%",
  };

  // Timeline bar chart data
  const timelineLabels = Object.keys(stats.timeline);
  const timelineDatasets = Object.keys(CATEGORY_COLORS).map((cat) => ({
    label: cat.charAt(0).toUpperCase() + cat.slice(1),
    data: timelineLabels.map((date) => stats.timeline[date]?.[cat] || 0),
    backgroundColor: CATEGORY_COLORS[cat],
    borderRadius: 4,
  }));

  const timelineData = {
    labels: timelineLabels.map((d) => {
      const date = new Date(d);
      return date.toLocaleDateString("en-IN", { day: "2-digit", month: "short" });
    }),
    datasets: timelineDatasets,
  };

  const timelineOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "top",
        labels: { color: "#e2e8f0", padding: 14, font: { size: 12 } },
      },
    },
    scales: {
      x: {
        stacked: true,
        grid: { color: "rgba(255,255,255,0.04)" },
        ticks: { color: "#9ca3af" },
      },
      y: {
        stacked: true,
        grid: { color: "rgba(255,255,255,0.06)" },
        ticks: { color: "#9ca3af", stepSize: 1 },
      },
    },
  };

  return (
    <div className="page-container">
      <div className="dashboard-header">
        <h1>
          <span className="gradient-text">Admin Dashboard</span>
        </h1>
        <button 
          className="insights-trigger-btn" 
          onClick={handleGetInsights}
          disabled={insightsLoading}
        >
          {insightsLoading ? "🧙 Analyzing..." : "💡 Get AI Insights"}
        </button>
      </div>

      {insights && (
        <div className="insights-box animate-fade-in">
          <h3>🤖 AI Executive Summary</h3>
          <p style={{ whiteSpace: "pre-line" }}>{insights}</p>
        </div>
      )}

      {/* Stat Cards */}
      <div className="stat-cards">
        <div className="stat-card total">
          <span className="stat-number">{stats.total}</span>
          <span className="stat-label">Total Feedbacks</span>
        </div>
        <div className="stat-card confidence">
          <span className="stat-number">{stats.avg_confidence}%</span>
          <span className="stat-label">Avg Confidence</span>
        </div>
        {Object.entries(stats.category_counts).map(([cat, count]) => (
          <div key={cat} className={`stat-card ${cat}`}>
            <span className="stat-number">
              {CATEGORY_EMOJI[cat]} {count}
            </span>
            <span className="stat-label">
              {cat.charAt(0).toUpperCase() + cat.slice(1)}
            </span>
          </div>
        ))}
      </div>

      {/* Charts Row */}
      <div className="dashboard-charts">
        <div className="chart-box">
          <h3>Category Distribution</h3>
          <div style={{ height: "300px" }}>
            <Doughnut data={doughnutData} options={doughnutOptions} />
          </div>
        </div>

        <div className="chart-box wide">
          <h3>Classification Trends Over Time</h3>
          <div style={{ height: "300px" }}>
            <Bar data={timelineData} options={timelineOptions} />
          </div>
        </div>
      </div>

      {/* Recent Feedbacks Table */}
      <div className="recent-table-wrapper">
        <h3>Recent Feedbacks</h3>
        <table className="recent-table">
          <thead>
            <tr>
              <th>Feedback</th>
              <th>Category</th>
              <th>Confidence</th>
              <th>Date</th>
            </tr>
          </thead>
          <tbody>
            {stats.recent.map((fb, idx) => (
              <tr key={idx}>
                <td className="cell-text">
                  {fb.text?.length > 80 ? fb.text.slice(0, 80) + "…" : fb.text}
                </td>
                <td>
                  <span className={`category-tag ${fb.category}`}>
                    {CATEGORY_EMOJI[fb.category]} {fb.category}
                  </span>
                </td>
                <td>
                  <span className="confidence-pill">{fb.confidence || "—"}%</span>
                </td>
                <td className="cell-date">
                  {fb.timestamp
                    ? new Date(fb.timestamp).toLocaleDateString("en-IN", {
                        day: "2-digit",
                        month: "short",
                      })
                    : "—"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
