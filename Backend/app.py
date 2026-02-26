import json
import os
from flask import Flask, request, jsonify
from flask_cors import CORS
import google.generativeai as genai
from dotenv import load_dotenv
load_dotenv()

app = Flask(__name__)
CORS(app)

# 🔑 Add your Gemini API key here
genai.configure(api_key=os.getenv("GEMINI_API_KEY"))

model = genai.GenerativeModel("gemini-2.5-flash")

DB_FILE = "db.json"


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
# Gemini Classification
# ---------------------------


def classify_feedback(text):
    prompt = f"""
    Analyze the feedback below.

    Classify into ONE category:
    positive, negative, constructive, formal, informal.

    Then give:
    - short explanation (1-2 lines)
    - short AI comment

    Respond ONLY with pure JSON.
    Do NOT include markdown.
    Do NOT include extra text.

    Format:
    {{
        "category": "category_name",
        "explanation": "reason",
        "short_comment": "comment"
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

        allowed = ["positive", "negative", "constructive", "formal", "informal"]

        if parsed.get("category", "").lower() not in allowed:
            parsed["category"] = "constructive"

        return parsed

    except Exception as e:
        print("Gemini parsing error:", e)

        return {
            "category": "constructive",
            "explanation": "AI response formatting issue. Default category applied.",
            "short_comment": "Feedback analyzed with fallback mode."
        }


# ---------------------------
# Analyze API
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
        "text": text,
        "category": result["category"]
    }

    feedbacks.insert(0, new_entry)
    save_feedbacks(feedbacks)

    return jsonify({
        "text": text,
        "category": result["category"],
        "explanation": result["explanation"],
        "short_comment": result["short_comment"]
    })

# ---------------------------
# Get All Feedbacks
# ---------------------------
@app.route("/get-feedbacks", methods=["GET"])
def get_feedbacks():
    feedbacks = load_feedbacks()
    return jsonify(feedbacks)


if __name__ == "__main__":
    app.run(debug=False, port=5000)