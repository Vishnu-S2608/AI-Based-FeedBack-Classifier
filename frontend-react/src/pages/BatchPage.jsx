import { useState, useRef } from "react";
import { batchAnalyze, getSampleCSVUrl } from "../utils/api";
import ConfidenceChart from "../components/ConfidenceChart";

const CATEGORY_EMOJI = {
  positive: "😊",
  negative: "😞",
  constructive: "💡",
  formal: "📋",
  informal: "💬",
};

export default function BatchPage() {
  const [file, setFile] = useState(null);
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [dragActive, setDragActive] = useState(false);
  const [expandedIdx, setExpandedIdx] = useState(null);
  const inputRef = useRef();

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") setDragActive(true);
    else if (e.type === "dragleave") setDragActive(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files?.[0]) {
      setFile(e.dataTransfer.files[0]);
      setError("");
    }
  };

  const handleFileChange = (e) => {
    if (e.target.files?.[0]) {
      setFile(e.target.files[0]);
      setError("");
    }
  };

  const handleUpload = async () => {
    if (!file) return;
    if (!file.name.endsWith(".csv")) {
      setError("Only CSV files are supported.");
      return;
    }

    setLoading(true);
    setError("");
    setResults(null);

    try {
      const data = await batchAnalyze(file);
      setResults(data);
    } catch (err) {
      console.error(err);
      setError("Batch analysis failed. Make sure the backend is running.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-container">
      <h1>
        <span className="gradient-text">Batch Classification</span>
      </h1>
      <p className="batch-subtitle">
        Upload a CSV file with feedback items. The first column should contain
        the feedback text.
      </p>

      <div className="batch-actions-top">
        <a href={getSampleCSVUrl()} className="download-sample-btn" download>
          📥 Download Sample CSV
        </a>
      </div>

      {/* Drop Zone */}
      <div
        className={`drop-zone ${dragActive ? "drag-active" : ""} ${file ? "has-file" : ""}`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        onClick={() => inputRef.current?.click()}
      >
        <input
          ref={inputRef}
          type="file"
          accept=".csv"
          onChange={handleFileChange}
          hidden
        />
        {file ? (
          <div className="file-info">
            <span className="file-icon">📄</span>
            <span className="file-name">{file.name}</span>
            <span className="file-size">
              ({(file.size / 1024).toFixed(1)} KB)
            </span>
          </div>
        ) : (
          <div className="drop-prompt">
            <span className="drop-icon">☁️</span>
            <p>
              <strong>Drag & drop</strong> your CSV file here
            </p>
            <p className="drop-hint">or click to browse</p>
          </div>
        )}
      </div>

      {error && <p className="error-text">{error}</p>}

      <button
        className="analyze-btn batch-btn"
        onClick={handleUpload}
        disabled={!file || loading}
      >
        {loading ? (
          <span className="btn-loading">
            <span className="spinner" /> Processing...
          </span>
        ) : (
          "🚀 Classify All"
        )}
      </button>

      {/* Results */}
      {results && (
        <div className="batch-results">
          <h2>
            Results — <span className="accent">{results.total}</span> items
            classified
          </h2>

          <div className="batch-results-grid">
            {results.results.map((item, idx) => (
              <div
                key={idx}
                className={`batch-result-card ${item.category}`}
                onClick={() =>
                  setExpandedIdx(expandedIdx === idx ? null : idx)
                }
              >
                <div className="batch-card-top">
                  <span className="category-tag">
                    {CATEGORY_EMOJI[item.category]} {item.category}
                  </span>
                  <span className="confidence-pill">{item.confidence}%</span>
                </div>
                <p className="feedback-text">{item.text}</p>

                {expandedIdx === idx && (
                  <div className="batch-card-expanded">
                    <p>
                      <strong>Explanation:</strong> {item.explanation}
                    </p>
                    <p>
                      <strong>AI Comment:</strong> {item.short_comment}
                    </p>
                    <ConfidenceChart probabilities={item.probabilities} />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
