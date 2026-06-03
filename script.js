let mode = "study";
let score = 0;
let attempted = 0;
let answered = new Set();
let missed = new Set();
let currentPool = [...questions];

const container = document.getElementById("questionContainer");
const topicFilter = document.getElementById("topicFilter");
const search = document.getElementById("search");
const scoreEl = document.getElementById("score");
const attemptedEl = document.getElementById("attempted");
const totalQuestionsEl = document.getElementById("totalQuestions");
const missedCountEl = document.getElementById("missedCount");
const modeSelect = document.getElementById("modeSelect");

function setupTopics() {
  const topics = [...new Set(questions.map(q => q.topic))].sort();
  topics.forEach(topic => {
    const opt = document.createElement("option");
    opt.value = topic;
    opt.textContent = topic;
    topicFilter.appendChild(opt);
  });
}

function shuffleArray(array) {
  return [...array].sort(() => Math.random() - 0.5);
}

function getFilteredQuestions() {
  const topic = topicFilter.value;
  const term = search.value.toLowerCase();

  let pool = currentPool;

  if (mode === "random") {
    pool = shuffleArray(questions).slice(0, 25);
    currentPool = pool;
    mode = "quiz";
    modeSelect.value = "quiz";
  }

  if (mode === "missed") {
    pool = questions.filter((_, idx) => missed.has(idx));
  }

  return pool.filter(q => {
    const matchesTopic = topic === "All" || q.topic === topic;
    const matchesSearch = q.question.toLowerCase().includes(term) ||
      q.choices.some(c => c.toLowerCase().includes(term));
    return matchesTopic && matchesSearch;
  });
}

function renderQuestions() {
  const filtered = getFilteredQuestions();
  totalQuestionsEl.textContent = filtered.length;
  container.innerHTML = "";

  if (filtered.length === 0) {
    container.innerHTML = `<div class="empty">No questions found for this view.</div>`;
    return;
  }

  if (mode === "flashcards") {
    renderFlashcards(filtered);
    return;
  }

  filtered.forEach((q, index) => {
    const originalIndex = questions.indexOf(q);
    const card = document.createElement("div");
    card.className = "question-card";

    const topic = document.createElement("span");
    topic.className = "topic";
    topic.textContent = q.topic;

    const title = document.createElement("h3");
    title.textContent = `${index + 1}. ${q.question}`;

    card.appendChild(topic);
    card.appendChild(title);

    q.choices.forEach((choice, choiceIndex) => {
      const btn = document.createElement("button");
      btn.className = "choice";
      btn.textContent = choice;

      if (mode === "study" && choiceIndex === q.answer) {
        btn.classList.add("correct");
        btn.textContent = "✅ " + choice;
      }

      btn.addEventListener("click", () => checkAnswer(btn, card, q, choiceIndex, originalIndex));
      card.appendChild(btn);
    });

    const exp = document.createElement("div");
    exp.className = "explanation";
    if (mode === "study") exp.classList.add("show");
    exp.innerHTML = `<strong>Explanation:</strong> ${q.explanation}`;
    card.appendChild(exp);

    container.appendChild(card);
  });
}

function renderFlashcards(filtered) {
  filtered.forEach((q, index) => {
    const card = document.createElement("div");
    card.className = "question-card flashcard";

    const topic = document.createElement("span");
    topic.className = "topic";
    topic.textContent = q.topic;

    const title = document.createElement("h3");
    title.textContent = `${index + 1}. ${q.question}`;

    const reveal = document.createElement("button");
    reveal.textContent = "Reveal Answer";

    const ans = document.createElement("div");
    ans.className = "flash-answer";
    ans.innerHTML = `✅ ${q.choices[q.answer]}<br><br><span>${q.explanation}</span>`;

    reveal.addEventListener("click", () => {
      ans.classList.toggle("show");
      reveal.textContent = ans.classList.contains("show") ? "Hide Answer" : "Reveal Answer";
    });

    card.appendChild(topic);
    card.appendChild(title);
    card.appendChild(reveal);
    card.appendChild(ans);
    container.appendChild(card);
  });
}

function checkAnswer(button, card, q, choiceIndex, originalIndex) {
  const choices = card.querySelectorAll(".choice");
  const explanation = card.querySelector(".explanation");

  choices.forEach((btn, i) => {
    btn.disabled = true;
    if (i === q.answer) {
      btn.classList.add("correct");
      btn.textContent = "✅ " + q.choices[i];
    }
  });

  if (choiceIndex !== q.answer) {
    button.classList.add("wrong");
    button.textContent = "❌ " + q.choices[choiceIndex];
    missed.add(originalIndex);
  } else {
    missed.delete(originalIndex);
  }

  if (!answered.has(originalIndex)) {
    attempted++;
    if (choiceIndex === q.answer) score++;
    answered.add(originalIndex);
  }

  explanation.classList.add("show");
  updateStats();
}

function updateStats() {
  scoreEl.textContent = score;
  attemptedEl.textContent = attempted;
  missedCountEl.textContent = missed.size;
}

modeSelect.addEventListener("change", () => {
  mode = modeSelect.value;
  if (mode !== "random") currentPool = [...questions];
  renderQuestions();
});

document.getElementById("shuffleBtn").addEventListener("click", () => {
  currentPool = shuffleArray(getFilteredQuestions());
  renderQuestions();
});

document.getElementById("resetBtn").addEventListener("click", () => {
  score = 0;
  attempted = 0;
  answered.clear();
  missed.clear();
  currentPool = [...questions];
  updateStats();
  renderQuestions();
});

document.getElementById("darkToggle").addEventListener("click", () => {
  document.body.classList.toggle("dark");
  document.getElementById("darkToggle").textContent =
    document.body.classList.contains("dark") ? "☀️ Light Mode" : "🌙 Dark Mode";
});

topicFilter.addEventListener("change", renderQuestions);
search.addEventListener("input", renderQuestions);

setupTopics();
updateStats();
renderQuestions();
