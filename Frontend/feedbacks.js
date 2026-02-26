function goBack() {
  window.location.href = "index.html";
}

async function loadFeedbacks() {
  const response = await fetch("http://localhost:5000/get-feedbacks");
  const data = await response.json();

  const categories = {
    positive: document.getElementById("positiveList"),
    negative: document.getElementById("negativeList"),
    constructive: document.getElementById("constructiveList"),
    formal: document.getElementById("formalList"),
    informal: document.getElementById("informalList"),
  };

  Object.values(categories).forEach(div => div.innerHTML = "");

  data.forEach(item => {
    const div = document.createElement("div");
    div.className = "feedback-item-card";
    div.innerText = item.text;

    if (categories[item.category]) {
      categories[item.category].appendChild(div);
    }
  });
}

loadFeedbacks();