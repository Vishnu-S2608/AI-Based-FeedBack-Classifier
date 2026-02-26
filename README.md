# 🤖 AI Based Feedback Classifier

An AI-powered full-stack web application that analyzes user feedback using Google Gemini AI and classifies it into structured categories.  

The system provides:
- Feedback category
- Short explanation of why it belongs to that category
- Short AI-generated comment
- Persistent storage using a JSON database

---

## 🚀 Project Overview

This project uses:

- 🔹 **Frontend** – HTML, CSS, JavaScript  
- 🔹 **Backend** – Python (Flask)  
- 🔹 **AI Model** – Google Gemini API  
- 🔹 **Database** – JSON file (`db.json`)  

Users can enter feedback, and the AI analyzes it instantly.

---

## 🧠 Feedback Classifications

The system classifies feedback into **5 categories**:

### 1️⃣ Positive
Feedback expressing satisfaction, appreciation, or praise.

**Example:**
> The product is amazing and very easy to use.

---

### 2️⃣ Negative
Feedback expressing dissatisfaction, complaints, or criticism.

**Example:**
> The app keeps crashing and is very frustrating.

---

### 3️⃣ Constructive
Feedback that suggests improvements or provides helpful criticism.

**Example:**
> The interface is good, but adding more themes would improve it.

---

### 4️⃣ Formal
Professional or structured feedback, often workplace-related.

**Example:**
> During your annual review, we would like to discuss your progress.

---

### 5️⃣ Informal
Casual, conversational, or friendly feedback.

**Example:**
> Hey! Loved it, super cool stuff!

---

# 🛠️ How To Run This Project

---

# 🔹 Backend Setup (Flask + Gemini)

## Step 1️⃣ Navigate to Backend Folder

```bash
cd backend
```

---

## Step 2️⃣ Create Virtual Environment

```bash
python -m venv venv
```

---

## Step 3️⃣ Activate Virtual Environment

### On Windows:

```bash
venv\Scripts\activate
```

### On Mac/Linux:

```bash
source venv/bin/activate
```

---

## Step 4️⃣ Install Required Python Libraries

```bash
pip install flask
pip install flask-cors
pip install google-generativeai
pip install python-dotenv
```

Or install all together:

```bash
pip install flask flask-cors google-generativeai python-dotenv
```

---

## Step 5️⃣ Set Gemini API Key

Create a `.env` file inside backend folder:

```env
GEMINI_API_KEY=your_api_key_here
```

---

## Step 6️⃣ Run Backend Server

```bash
python app.py
```

If successful, you will see:

```
Running on http://127.0.0.1:5000
```

Backend is now running.

---

# 🔹 Frontend Setup

## Step 1️⃣ Navigate to Frontend Folder

```bash
cd frontend
```

---

## Step 2️⃣ Start Simple Static Server

```bash
python -m http.server 5500
```

---

## Step 3️⃣ Open In Browser

Open Chrome and type:

```
http://localhost:5500/
```

---

# 🎯 How It Works

1. User enters feedback.
2. Frontend sends request to Flask backend.
3. Backend sends prompt to Gemini AI.
4. AI returns:
   - Category
   - Explanation
   - Short Comment
5. Backend stores feedback in `db.json`.
6. Frontend displays the result.

---

# 📂 Project Structure

```
AI-Based-Feedback-Classifier/
│
├── frontend/
│   ├── index.html
│   ├── feedbacks.html
│   ├── script.js
│   └── style.css
│
├── backend/
│   ├── app.py
│   ├── Db.json
│   └── venv/
│
└── README.md
```

---

# ⚠️ Important Notes

- Do NOT push your API key to GitHub.
- Add `venv/` and `.env` to `.gitignore`.
- Always activate virtual environment before running backend.

---

# 🌟 Features

✔ AI-powered classification  
✔ 5 structured feedback categories  
✔ Explanation + AI comment  
✔ Persistent JSON storage  
✔ Clean modern UI  
✔ Full-stack integration  

---

# 🔮 Future Improvements

- Authentication system  
- Admin dashboard  
- Database migration to PostgreSQL  
- Deployment to Render or Railway  
- Docker support  

---

# 👨‍💻 Author

Vishnu S  

---

# 📌 License

This project is for educational and demonstration purposes.