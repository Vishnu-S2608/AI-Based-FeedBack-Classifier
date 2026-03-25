import ConfidenceChart from "./ConfidenceChart";

export default function ResultCard({ result, onClear }) {
  if (!result) return null;

  return (
    <div className={`result-card ${result.category}`}>
      <div className="result-header">
        <h3>{result.category.toUpperCase()}</h3>
        <span className="confidence-badge">{result.confidence}% confident</span>
      </div>

      <p>
        <strong>Why this category?</strong>
        <br />
        {result.explanation}
      </p>

      <p>
        <strong>AI Comment:</strong>
        <br />
        {result.short_comment}
      </p>

      <ConfidenceChart probabilities={result.probabilities} />

      <button className="clear-btn" onClick={onClear}>
        ✕ Clear
      </button>
    </div>
  );
}
