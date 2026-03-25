import { useState } from "react";

export default function FeedbackForm({ onAnalyze, isLoading }) {
  const [text, setText] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!text.trim() || isLoading) return;
    onAnalyze(text.trim());
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  return (
    <form className="card" onSubmit={handleSubmit}>
      <label htmlFor="feedbackInput">Enter your feedback</label>
      <textarea
        id="feedbackInput"
        placeholder="Type your feedback here... (e.g. The product is amazing and easy to use!)"
        rows="3"
        value={text}
        onChange={(e) => setText(e.target.value)}
        onKeyDown={handleKeyDown}
        disabled={isLoading}
      />
      <div className="card-footer">
        <p>Press Enter to analyze</p>
        <button type="submit" className="analyze-btn" disabled={isLoading}>
          {isLoading ? (
            <span className="btn-loading">
              <span className="spinner" /> Analyzing...
            </span>
          ) : (
            "⚡ Analyze"
          )}
        </button>
      </div>
    </form>
  );
}
