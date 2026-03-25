# 🤖 AI Based Feedback Classifier (Pro Edition)

A high-performance, AI-powered full-stack application that analyzes, classifies, and visualizes user feedback using Google Gemini AI and React.

![Dashboard Preview](https://img.shields.io/badge/UI-Modern%20Glassmorphism-blueviolet)
![React](https://img.shields.io/badge/Frontend-React%20%2B%20Vite-blue)
![Flask](https://img.shields.io/badge/Backend-Python%20Flask-green)
![Gemini](https://img.shields.io/badge/AI-Google%20Gemini%202.5-orange)

---

## ✨ New Features

*   **📊 Probability Distribution**: See not just the category, but exactly how confident the AI is across all 5 categories (Positive, Negative, Constructive, Formal, Informal).
*   **📈 Admin Dashboard**: Track classification trends over time with interactive Doughnut and Bar charts.
*   **📁 Batch Classification**: Upload a CSV of feedback items and classify hundreds of items in seconds.
*   **📥 Professional Export**: Generate detailed reports in **CSV** or **PDF** format with category filters.
*   **💎 Premium UI**: Fully responsive, dark-mode glassmorphism design with smooth animations.
*   **🧹 Data Management**: Persistent storage with unique IDs, timestamps, and delete functionality.

---

## 🛠️ Technology Stack

| Layer | Technology |
|---|---|
| **AI Model** | Google Gemini 2.5 Flash API |
| **Frontend** | React (Vite), Chart.js, React Router, Lucide Icons |
| **Backend** | Python Flask, Flask-CORS, python-dotenv |
| **Export** | fpdf2 (PDF Generation), CSV Module |
| **Database** | JSON Document Store (`Db.json`) |

---

## 📂 Project Structure

```text
AI-Based-Feedback-Classifier/
├── frontend-react/         # Modern React Application
│   ├── src/
│   │   ├── components/     # Reusable UI components
│   │   ├── pages/          # Feedbacks, Dashboard, Batch, Home
│   │   ├── utils/          # API services
│   │   └── App.jsx
│   └── package.json
├── Backend/                # Python Flask API
│   ├── app.py              # Main API Logic
│   ├── Db.json             # Persistent Storage
│   └── requirements.txt    # Python Dependencies
├── render.yaml             # Deployment Blueprint
└── README.md
```

---

## 🚀 How To Run

### 1️⃣ Backend Setup
1.  Navigate to `Backend/`
2.  Create a `.env` file: `GEMINI_API_KEY=your_key_here`
3.  Install dependencies: `pip install -r requirements.txt`
4.  Run: `python app.py` (Default: http://localhost:5000)

### 2️⃣ Frontend Setup
1.  Navigate to `frontend-react/`
2.  Install dependencies: `npm install`
3.  Run: `npm run dev` (Default: http://localhost:5173)

---

## 🌐 Deployment

This project is ready for **Render**. 
1.  Connect your GitHub repo to Render.
2.  The `render.yaml` file will automatically configure the services.
3.  Don't forget to add your `GEMINI_API_KEY` in the Render environment variables.

---

## 📄 License
Educational purposes only. AI-generated feedback should be reviewed for critical business decisions.

**Author:** Vishnu S