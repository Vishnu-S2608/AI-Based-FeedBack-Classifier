import { useState } from "react";
import { getExportCSVUrl, getExportPDFUrl } from "../utils/api";

const CATEGORIES = ["positive", "negative", "constructive", "formal", "informal"];

export default function ExportButton() {
  const [open, setOpen] = useState(false);
  const [category, setCategory] = useState("");

  return (
    <div className="export-wrapper">
      <button className="export-toggle-btn" onClick={() => setOpen(!open)}>
        📥 Export Report
      </button>

      {open && (
        <div className="export-dropdown">
          <label>Filter by category (optional)</label>
          <select value={category} onChange={(e) => setCategory(e.target.value)}>
            <option value="">All Categories</option>
            {CATEGORIES.map((cat) => (
              <option key={cat} value={cat}>
                {cat.charAt(0).toUpperCase() + cat.slice(1)}
              </option>
            ))}
          </select>

          <div className="export-actions">
            <a
              href={getExportCSVUrl(category)}
              className="export-btn csv"
              download
            >
              📄 Download CSV
            </a>
            <a
              href={getExportPDFUrl(category)}
              className="export-btn pdf"
              download
            >
              📑 Download PDF
            </a>
          </div>
        </div>
      )}
    </div>
  );
}
