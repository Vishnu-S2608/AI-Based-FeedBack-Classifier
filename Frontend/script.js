const input = document.getElementById("feedbackInput");
const analyzeBtn = document.getElementById("analyzeBtn");
const resultCard = document.getElementById("resultCard");
const toggleBtn = document.getElementById("toggleBtn");
const countBadge = document.getElementById("countBadge");

/* =========================
   Load Existing Feedback Count
========================= */
async function loadFeedbackCount() {
  try {
    const response = await fetch("http://localhost:5000/get-feedbacks");
    const data = await response.json();
    countBadge.textContent = data.length;
  } catch (error) {
    console.error("Count load error:", error);
  }
}

loadFeedbackCount();


/* =========================
   Analyze Feedback
========================= */
analyzeBtn.addEventListener("click", async () => {
  const text = input.value.trim();
  if (!text) return;

  resultCard.classList.remove("hidden");
  resultCard.innerHTML = "Analyzing...";

  try {
    const response = await fetch("http://localhost:5000/analyze", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text })
    });

    const data = await response.json();

    // Update Count
    loadFeedbackCount();

    resultCard.className = "result-card";
    resultCard.classList.add(data.category);

    resultCard.innerHTML = `
      <h3>${data.category.toUpperCase()}</h3>
      <p><strong>Why this category?</strong><br>${data.explanation}</p>
      <p><strong>AI Comment:</strong><br>${data.short_comment}</p>
      <button id="clearBtn">Clear</button>
    `;

    const clearBtn = document.getElementById("clearBtn");
    clearBtn.style.marginTop = '12px';
    clearBtn.style.padding = '8px 20px';
    clearBtn.style.backgroundColor = '#ff4d4d';
    clearBtn.style.color = 'white';
    clearBtn.style.border = 'none';
    clearBtn.style.borderRadius = '6px';
    clearBtn.style.fontSize = '14px';
    clearBtn.style.cursor = 'pointer';
    clearBtn.addEventListener('mouseover', () => clearBtn.style.backgroundColor = '#cc0000');
    clearBtn.addEventListener('mouseout', () => clearBtn.style.backgroundColor = '#ff4d4d');
    clearBtn.onclick = clearResult;

    document.getElementById("clearBtn").onclick = clearResult;

  } catch (error) {
    console.error("Analyze error:", error);
    resultCard.innerHTML = "<p style='color:red;'>Server error. Try again.</p>";
  }
});


/* =========================
   Clear Result
========================= */
function clearResult() {
  resultCard.classList.add("hidden");
  resultCard.innerHTML = "";
  input.value = "";
  input.focus();
}


/* =========================
   Navigate to Feedback Page
========================= */
toggleBtn.addEventListener("click", () => {
  window.location.href = "feedbacks.html";
});