import { useState, useEffect } from "react";
import { getAllFeedbacks, deleteFeedback } from "../utils/api";
import ExportButton from "../components/ExportButton";

const CATEGORIES = ["positive", "negative", "constructive", "formal", "informal"];

const CATEGORY_EMOJI = {
  positive: "😊",
  negative: "😞",
  constructive: "💡",
  formal: "📋",
  informal: "💬",
};

export default function FeedbacksPage() {
  const [feedbacks, setFeedbacks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    loadFeedbacks();
  }, []);

  const loadFeedbacks = async () => {
    setLoading(true);
    try {
      const data = await getAllFeedbacks();
      setFeedbacks(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      await deleteFeedback(id);
      setFeedbacks((prev) => prev.filter((fb) => fb.id !== id));
    } catch (err) {
      console.error(err);
    }
  };

  const filtered = feedbacks.filter((fb) => {
    const matchesCategory = filter === "all" || fb.category === filter;
    const matchesSearch = fb.text.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const counts = {};
  CATEGORIES.forEach((c) => {
    counts[c] = feedbacks.filter((fb) => fb.category === c).length;
  });

  return (
    <div className="page-container">
      <div className="feedbacks-header">
        <h1>
          <span className="gradient-text">All Feedbacks</span>
        </h1>
        <div className="header-right">
          <div className="search-wrapper">
            <span className="search-icon">🔍</span>
            <input
              type="text"
              placeholder="Search feedback..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="search-input"
            />
          </div>
          <ExportButton />
        </div>
      </div>

      {/* Filter Chips */}
      <div className="filter-chips">
        <button
          className={`chip ${filter === "all" ? "active" : ""}`}
          onClick={() => setFilter("all")}
        >
          All ({feedbacks.length})
        </button>
        {CATEGORIES.map((cat) => (
          <button
            key={cat}
            className={`chip chip-${cat} ${filter === cat ? "active" : ""}`}
            onClick={() => setFilter(cat)}
          >
            {CATEGORY_EMOJI[cat]} {cat.charAt(0).toUpperCase() + cat.slice(1)} ({counts[cat] || 0})
          </button>
        ))}
      </div>

      {/* Feedbacks Grid */}
      {loading ? (
        <div className="loading-state">
          <div className="spinner large" />
          <p>Loading feedbacks...</p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="empty-state">
          <p>No feedbacks found.</p>
        </div>
      ) : (
        <div className="feedbacks-grid">
          {filtered.map((fb, idx) => (
            <div key={fb.id || idx} className={`feedback-item ${fb.category}`}>
              <div className="feedback-item-top">
                <span className="category-tag">
                  {CATEGORY_EMOJI[fb.category]} {fb.category}
                </span>
                {fb.confidence && (
                  <span className="confidence-pill">{fb.confidence}%</span>
                )}
              </div>
              <p className="feedback-text">{fb.text}</p>
              <div className="feedback-item-bottom">
                <span className="timestamp">
                  {fb.timestamp
                    ? new Date(fb.timestamp).toLocaleDateString("en-IN", {
                        day: "2-digit",
                        month: "short",
                        year: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })
                    : "—"}
                </span>
                {fb.id && (
                  <button
                    className="delete-btn"
                    title="Delete"
                    onClick={() => handleDelete(fb.id)}
                  >
                    🗑️
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
