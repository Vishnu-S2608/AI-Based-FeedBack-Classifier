import json
import os
import csv
import io
from datetime import datetime
from flask import Flask, request, jsonify, send_file
from flask_cors import CORS
import google.generativeai as genai
from dotenv import load_dotenv

load_dotenv()

app = Flask(__name__)
CORS(app)

# 🔑 Gemini API Key
genai.configure(api_key=os.getenv("GEMINI_API_KEY"))
model = genai.GenerativeModel("gemini-2.5-flash")

DB_FILE = "Db.json"

CATEGORIES = ["positive", "negative", "constructive", "formal", "informal"]


# ---------------------------
# Load Feedbacks
# ---------------------------
def load_feedbacks():
    if not os.path.exists(DB_FILE):
        return []
    with open(DB_FILE, "r") as file:
        return json.load(file)


# ---------------------------
# Save Feedbacks
# ---------------------------
def save_feedbacks(data):
    with open(DB_FILE, "w") as file:
        json.dump(data, file, indent=4)


# ---------------------------
# Gemini Classification (with confidence scores)
# ---------------------------
def classify_feedback(text):
    prompt = f"""
    Analyze the feedback below.

    Classify into ONE primary category from:
    positive, negative, constructive, formal, informal.

    Then provide:
    - short explanation (1-2 lines)
    - short AI comment
    - confidence score (0 to 100) for the primary category
    - probability distribution across ALL 5 categories (must sum to 100)

    Respond ONLY with pure JSON.
    Do NOT include markdown.
    Do NOT include extra text.

    Format:
    {{
        "category": "category_name",
        "explanation": "reason",
        "short_comment": "comment",
        "confidence": 85,
        "probabilities": {{
            "positive": 10,
            "negative": 5,
            "constructive": 70,
            "formal": 10,
            "informal": 5
        }}
    }}

    Feedback: "{text}"
    """

    try:
        response = model.generate_content(prompt)
        raw = response.text.strip()

        # Remove markdown if present
        raw = raw.replace("```json", "").replace("```", "").strip()

        # Extract JSON part safely
        start = raw.find("{")
        end = raw.rfind("}") + 1

        if start == -1 or end == -1:
            raise ValueError("No JSON found")

        json_string = raw[start:end]
        parsed = json.loads(json_string)

        # Validate category
        if parsed.get("category", "").lower() not in CATEGORIES:
            parsed["category"] = "constructive"

        # Ensure confidence exists
        if "confidence" not in parsed:
            parsed["confidence"] = 75

        # Ensure probabilities exist
        if "probabilities" not in parsed:
            parsed["probabilities"] = {cat: 20 for cat in CATEGORIES}

        return parsed

    except Exception as e:
        print("Gemini parsing error:", e)
        return {
            "category": "constructive",
            "explanation": "AI response formatting issue. Default category applied.",
            "short_comment": "Feedback analyzed with fallback mode.",
            "confidence": 50,
            "probabilities": {cat: 20 for cat in CATEGORIES}
        }


# ---------------------------
# Analyze Single Feedback
# ---------------------------
@app.route("/analyze", methods=["POST"])
def analyze():
    data = request.get_json()
    text = data.get("text")

    if not text:
        return jsonify({"error": "No text provided"}), 400

    result = classify_feedback(text)

    feedbacks = load_feedbacks()

    new_entry = {
        "id": len(feedbacks) + 1,
        "text": text,
        "category": result["category"],
        "confidence": result.get("confidence", 75),
        "probabilities": result.get("probabilities", {}),
        "timestamp": datetime.now().isoformat()
    }

    feedbacks.insert(0, new_entry)
    save_feedbacks(feedbacks)

    return jsonify({
        "text": text,
        "category": result["category"],
        "explanation": result["explanation"],
        "short_comment": result["short_comment"],
        "confidence": result.get("confidence", 75),
        "probabilities": result.get("probabilities", {})
    })


# ---------------------------
# Batch Analyze (CSV Upload)
# ---------------------------
@app.route("/batch-analyze", methods=["POST"])
def batch_analyze():
    if "file" not in request.files:
        return jsonify({"error": "No file uploaded"}), 400

    file = request.files["file"]

    if not file.filename.endswith(".csv"):
        return jsonify({"error": "Only CSV files are supported"}), 400

    try:
        stream = io.StringIO(file.stream.read().decode("utf-8"))
        reader = csv.reader(stream)
        rows = list(reader)

        # Skip header if present
        if rows and rows[0][0].lower() in ["feedback", "text", "comment", "review"]:
            rows = rows[1:]

        feedbacks = load_feedbacks()
        results = []

        for row in rows:
            if not row or not row[0].strip():
                continue

            text = row[0].strip()
            result = classify_feedback(text)

            new_entry = {
                "id": len(feedbacks) + len(results) + 1,
                "text": text,
                "category": result["category"],
                "confidence": result.get("confidence", 75),
                "probabilities": result.get("probabilities", {}),
                "timestamp": datetime.now().isoformat()
            }

            results.append({
                "text": text,
                "category": result["category"],
                "explanation": result["explanation"],
                "short_comment": result["short_comment"],
                "confidence": result.get("confidence", 75),
                "probabilities": result.get("probabilities", {})
            })

            feedbacks.insert(0, new_entry)

        save_feedbacks(feedbacks)

        return jsonify({
            "total": len(results),
            "results": results
        })

    except Exception as e:
        print("Batch processing error:", e)
        return jsonify({"error": f"Processing failed: {str(e)}"}), 500


# ---------------------------
# Get All Feedbacks
# ---------------------------
@app.route("/get-feedbacks", methods=["GET"])
def get_feedbacks():
    feedbacks = load_feedbacks()
    return jsonify(feedbacks)


# ---------------------------
# Delete a Feedback
# ---------------------------
@app.route("/delete-feedback/<int:feedback_id>", methods=["DELETE"])
def delete_feedback(feedback_id):
    feedbacks = load_feedbacks()
    feedbacks = [fb for fb in feedbacks if fb.get("id") != feedback_id]
    save_feedbacks(feedbacks)
    return jsonify({"message": "Feedback deleted successfully"})


# ---------------------------
# Dashboard Statistics
# ---------------------------
@app.route("/dashboard-stats", methods=["GET"])
def dashboard_stats():
    feedbacks = load_feedbacks()

    total = len(feedbacks)

    # Category counts
    category_counts = {cat: 0 for cat in CATEGORIES}
    for fb in feedbacks:
        cat = fb.get("category", "constructive").lower()
        if cat in category_counts:
            category_counts[cat] += 1

    # Average confidence
    confidences = [fb.get("confidence", 75) for fb in feedbacks]
    avg_confidence = round(sum(confidences) / len(confidences), 1) if confidences else 0

    # Timeline data (group by date)
    timeline = {}
    for fb in feedbacks:
        ts = fb.get("timestamp", "")
        if ts:
            date_str = ts[:10]  # YYYY-MM-DD
        else:
            date_str = "unknown"

        if date_str not in timeline:
            timeline[date_str] = {cat: 0 for cat in CATEGORIES}
        cat = fb.get("category", "constructive").lower()
        if cat in CATEGORIES:
            timeline[date_str][cat] += 1

    # Sort timeline by date
    sorted_timeline = dict(sorted(timeline.items()))

    # Recent feedbacks (latest 10)
    recent = feedbacks[:10]

    return jsonify({
        "total": total,
        "category_counts": category_counts,
        "avg_confidence": avg_confidence,
        "timeline": sorted_timeline,
        "recent": recent
    })


# ---------------------------
# AI Dashboard Insights
# ---------------------------
@app.route("/dashboard-insights", methods=["GET"])
def dashboard_insights():
    feedbacks = load_feedbacks()
    if not feedbacks:
        return jsonify({"insight": "No feedback data available to analyze yet."})

    # Prepare data for Gemini (just the text and category)
    summary_data = [f"[{fb.get('category')}] {fb.get('text')[:100]}" for fb in feedbacks[:50]]
    data_str = "\n".join(summary_data)

    prompt = f"""
    Analyze these feedback items and provide a high-level executive summary (3-4 bullet points).
    Focus on:
    - General sentiment trends
    - Common themes or complaints
    - Suggested action items

    Feedback Data:
    {data_str}

    Respond with a JSON object:
    {{
        "insight": "Your analysis here with bullet points"
    }}
    """

    try:
        response = model.generate_content(prompt)
        raw = response.text.strip().replace("```json", "").replace("```", "").strip()
        
        # Extract JSON part safely
        start = raw.find("{")
        end = raw.rfind("}") + 1
        parsed = json.loads(raw[start:end])
        
        return jsonify(parsed)
    except Exception as e:
        print("Insight error:", e)
        return jsonify({"insight": "AI was unable to generate insights at this time."})


# ---------------------------
# Export CSV
# ---------------------------
@app.route("/export/csv", methods=["GET"])
def export_csv():
    feedbacks = load_feedbacks()
    category_filter = request.args.get("category", None)

    if category_filter and category_filter in CATEGORIES:
        feedbacks = [fb for fb in feedbacks if fb.get("category") == category_filter]

    output = io.StringIO()
    writer = csv.writer(output)
    writer.writerow(["ID", "Feedback Text", "Category", "Confidence (%)", "Timestamp"])

    for fb in feedbacks:
        writer.writerow([
            fb.get("id", ""),
            fb.get("text", ""),
            fb.get("category", ""),
            fb.get("confidence", ""),
            fb.get("timestamp", "")
        ])

    output.seek(0)
    return send_file(
        io.BytesIO(output.getvalue().encode("utf-8")),
        mimetype="text/csv",
        as_attachment=True,
        download_name=f"feedback_report_{datetime.now().strftime('%Y%m%d_%H%M%S')}.csv"
    )


# ---------------------------
# Export PDF
# ---------------------------
@app.route("/export/pdf", methods=["GET"])
def export_pdf():
    try:
        from fpdf import FPDF
    except ImportError:
        return jsonify({"error": "fpdf2 not installed. Run: pip install fpdf2"}), 500

    feedbacks = load_feedbacks()
    category_filter = request.args.get("category", None)

    if category_filter and category_filter in CATEGORIES:
        feedbacks = [fb for fb in feedbacks if fb.get("category") == category_filter]

    pdf = FPDF()
    pdf.set_auto_page_break(auto=True, margin=15)
    pdf.add_page()

    # Title
    pdf.set_font("Helvetica", "B", 20)
    pdf.cell(0, 15, "AI Feedback Classifier Report", ln=True, align="C")
    pdf.set_font("Helvetica", "", 10)
    pdf.cell(0, 8, f"Generated: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}", ln=True, align="C")
    pdf.ln(5)

    # Summary
    total = len(feedbacks)
    category_counts = {cat: 0 for cat in CATEGORIES}
    for fb in feedbacks:
        cat = fb.get("category", "constructive").lower()
        if cat in category_counts:
            category_counts[cat] += 1

    pdf.set_font("Helvetica", "B", 14)
    pdf.cell(0, 10, "Summary", ln=True)
    pdf.set_font("Helvetica", "", 11)
    pdf.cell(0, 7, f"Total Feedbacks: {total}", ln=True)
    for cat, count in category_counts.items():
        pdf.cell(0, 7, f"  {cat.capitalize()}: {count}", ln=True)
    pdf.ln(5)

    # Table Header
    pdf.set_font("Helvetica", "B", 10)
    pdf.set_fill_color(100, 100, 200)
    pdf.set_text_color(255, 255, 255)
    pdf.cell(15, 8, "ID", 1, 0, "C", True)
    pdf.cell(95, 8, "Feedback", 1, 0, "C", True)
    pdf.cell(30, 8, "Category", 1, 0, "C", True)
    pdf.cell(25, 8, "Conf%", 1, 0, "C", True)
    pdf.cell(25, 8, "Date", 1, 1, "C", True)

    # Table Rows
    pdf.set_font("Helvetica", "", 9)
    pdf.set_text_color(0, 0, 0)

    for fb in feedbacks:
        text = fb.get("text", "")[:60]
        ts = fb.get("timestamp", "")[:10]

        pdf.cell(15, 7, str(fb.get("id", "")), 1, 0, "C")
        pdf.cell(95, 7, text, 1, 0, "L")
        pdf.cell(30, 7, fb.get("category", "").capitalize(), 1, 0, "C")
        pdf.cell(25, 7, str(fb.get("confidence", "")), 1, 0, "C")
        pdf.cell(25, 7, ts, 1, 1, "C")

    # Save to buffer
    pdf_buffer = io.BytesIO()
    pdf.output(pdf_buffer)
    pdf_buffer.seek(0)

    return send_file(
        pdf_buffer,
        mimetype="application/pdf",
        as_attachment=True,
        download_name=f"feedback_report_{datetime.now().strftime('%Y%m%d_%H%M%S')}.pdf"
    )


# ---------------------------
# Download Sample CSV
# ---------------------------
@app.route("/sample-csv", methods=["GET"])
def sample_csv():
    output = io.StringIO()
    writer = csv.writer(output)
    writer.writerow(["feedback_text"])
    writer.writerow(["The product is amazing and very easy to use!"])
    writer.writerow(["I had some trouble with the login screen yesterday."])
    writer.writerow(["Could you add a dark mode option to the settings?"])
    
    output.seek(0)
    return send_file(
        io.BytesIO(output.getvalue().encode("utf-8")),
        mimetype="text/csv",
        as_attachment=True,
        download_name="sample_feedback.csv"
    )


if __name__ == "__main__":
    port = int(os.environ.get("PORT", 5000))
    app.run(debug=False, host="0.0.0.0", port=port)