import { useState } from "react";
import FeedbackForm from "../components/FeedbackForm";
import ResultCard from "../components/ResultCard";
import { analyzeFeedback } from "../utils/api";

export default function HomePage() {
  const [result, setResult] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleAnalyze = async (text) => {
    setIsLoading(true);
    setResult(null);
    try {
      const data = await analyzeFeedback(text);
      setResult(data);
    } catch (err) {
      console.error(err);
      setResult({
        category: "error",
        explanation: "Server error occurred.",
        short_comment: "Please try again.",
        confidence: 0,
        probabilities: {},
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="page-container">
      <div className="hero">
        <h1>
          <span className="gradient-text">Feedback Classifier</span>
        </h1>
        <p>
          Analyze the sentiment of any feedback instantly with intelligent
          AI-powered classification.
        </p>
      </div>

      <FeedbackForm onAnalyze={handleAnalyze} isLoading={isLoading} />

      {isLoading && (
        <div className="analyzing-overlay">
          <div className="analyzing-pulse" />
          <p>AI is analyzing your feedback...</p>
        </div>
      )}

      <ResultCard result={result} onClear={() => setResult(null)} />
    </div>
  );
}
