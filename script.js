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


/* =========================
   Test Features: Progress, Streak, Timer, Leaderboard
   ========================= */

let currentStreak = 0;
let bestStreak = Number(localStorage.getItem("bestStreak") || 0);
let timerSeconds = 60 * 60;
let timerInterval = null;

const progressText = document.getElementById("progressText");
const progressBar = document.getElementById("progressBar");
const streakCount = null;
const examTimer = document.getElementById("examTimer");
const timerMinutesInput = document.getElementById("timerMinutes");
const startTimerBtn = document.getElementById("startTimerBtn");
const pauseTimerBtn = document.getElementById("pauseTimerBtn");
const resetTimerBtn = document.getElementById("resetTimerBtn");
const leaderboardList = document.getElementById("leaderboardList");
const clearLeaderboardBtn = document.getElementById("clearLeaderboardBtn");



function updateStreakFeature(wasCorrect = null) {
  if (wasCorrect === true) {
    currentStreak++;
    bestStreak = Math.max(bestStreak, currentStreak);
    localStorage.setItem("bestStreak", String(bestStreak));
  }

  if (wasCorrect === false) {
    currentStreak = 0;
  }

  if (streakCount) streakCount.textContent = currentStreak;
}

function formatTimer(seconds) {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
}

function updateTimerDisplay() {
  if (examTimer) examTimer.textContent = formatTimer(timerSeconds);
}

function startTimer() {
  if (timerInterval) return;

  if (timerMinutesInput && examTimer && examTimer.textContent === formatTimer(timerSeconds)) {
    const minutes = Number(timerMinutesInput.value || 60);
    timerSeconds = Math.max(1, Math.min(180, minutes)) * 60;
    updateTimerDisplay();
  }

  timerInterval = setInterval(() => {
    timerSeconds--;

    if (timerSeconds <= 0) {
      timerSeconds = 0;
      pauseTimer();
      saveLeaderboardScore();
      alert("Time is up! Your score was saved to the leaderboard.");
    }

    updateTimerDisplay();
  }, 1000);
}

function pauseTimer() {
  clearInterval(timerInterval);
  timerInterval = null;
}

function resetTimer() {
  pauseTimer();
  const minutes = timerMinutesInput ? Number(timerMinutesInput.value || 60) : 60;
  timerSeconds = Math.max(1, Math.min(180, minutes)) * 60;
  updateTimerDisplay();
}

function getLeaderboard() {
  try {
    return JSON.parse(localStorage.getItem("studyLeaderboard") || "[]");
  } catch {
    return [];
  }
}

function saveLeaderboardScore() {
  const total = attempted || 0;
  const percent = total ? Math.round((score / total) * 100) : 0;

  const entry = {
    score,
    attempted,
    percent,
    bestStreak,
    date: new Date().toLocaleString()
  };

  const leaderboard = getLeaderboard();
  leaderboard.push(entry);

  leaderboard.sort((a, b) => {
    if (b.percent !== a.percent) return b.percent - a.percent;
    return b.score - a.score;
  });

  localStorage.setItem("studyLeaderboard", JSON.stringify(leaderboard.slice(0, 5)));
  renderLeaderboard();
}

function renderLeaderboard() {
  if (!leaderboardList) return;

  const leaderboard = getLeaderboard();
  const topScoreText = document.getElementById("topScoreText");

  if (leaderboard.length === 0) {
    leaderboardList.innerHTML = "<li>No scores yet. Finish a timed quiz to save one.</li>";
    if (topScoreText) topScoreText.textContent = "No scores yet";
    return;
  }

  if (topScoreText) {
    topScoreText.textContent = `Top Score: ${leaderboard[0].percent}% — ${leaderboard[0].score}/${leaderboard[0].attempted}`;
  }

  leaderboardList.innerHTML = leaderboard.map(item => `
    <li>
      ${item.percent}% — ${item.score}/${item.attempted}
      <small>Best streak: ${item.bestStreak || 0} • ${item.date}</small>
    </li>
  `).join("");
}

if (startTimerBtn) startTimerBtn.addEventListener("click", startTimer);
if (pauseTimerBtn) pauseTimerBtn.addEventListener("click", pauseTimer);
if (resetTimerBtn) resetTimerBtn.addEventListener("click", resetTimer);

if (clearLeaderboardBtn) {
  clearLeaderboardBtn.addEventListener("click", () => {
    localStorage.removeItem("studyLeaderboard");
    renderLeaderboard();
  });
}

/* Hook into the existing answer checker without rewriting the whole app */
const originalCheckAnswer = checkAnswer;
checkAnswer = function(button, card, q, choiceIndex, originalIndex) {
  const alreadyAnswered = answered.has(originalIndex);
  const wasCorrect = choiceIndex === q.answer;

  originalCheckAnswer(button, card, q, choiceIndex, originalIndex);

  if (!alreadyAnswered) {
    updateStreakFeature(wasCorrect);
    updateProgressFeature();
  }
};

/* Hook into the reset button behavior */
const originalUpdateStats = updateStats;
updateStats = function() {
  originalUpdateStats();
  updateProgressFeature();
};

document.getElementById("resetBtn").addEventListener("click", () => {
  currentStreak = 0;
  updateStreakFeature();
  updateProgressFeature();
});

updateTimerDisplay();
updateProgressFeature();
updateStreakFeature();
renderLeaderboard();


/* =========================
   Polished V4 Add-ons
   ========================= */

const leaderboardToggle = document.getElementById("leaderboardToggle");
const leaderboardContent = document.getElementById("leaderboardContent");
const leaderboardArrow = document.getElementById("leaderboardArrow");

if (leaderboardToggle && leaderboardContent && leaderboardArrow) {
  leaderboardToggle.addEventListener("click", () => {
    leaderboardContent.classList.toggle("open");
    leaderboardArrow.classList.toggle("open");
  });
}

function launchConfetti() {
  const colors = ["#7c3aed", "#ec4899", "#f97316", "#22c55e", "#0ea5e9"];
  for (let i = 0; i < 22; i++) {
    const piece = document.createElement("span");
    piece.className = "confetti-piece";
    piece.textContent = ["✨", "💜", "☕", "⭐", "🎉"][Math.floor(Math.random() * 5)];
    piece.style.left = Math.random() * 100 + "vw";
    piece.style.animationDelay = Math.random() * 0.2 + "s";
    piece.style.color = colors[Math.floor(Math.random() * colors.length)];
    piece.style.fontSize = (14 + Math.random() * 12) + "px";
    document.body.appendChild(piece);
    setTimeout(() => piece.remove(), 1400);
  }
}

function updateDailyStreak() {
  const today = new Date().toDateString();
  const lastVisit = localStorage.getItem("dailyStudyVisit");
  let dailyStreak = Number(localStorage.getItem("dailyStudyStreak") || 0);

  if (lastVisit !== today) {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);

    if (lastVisit === yesterday.toDateString()) {
      dailyStreak++;
    } else {
      dailyStreak = 1;
    }

    localStorage.setItem("dailyStudyVisit", today);
    localStorage.setItem("dailyStudyStreak", String(dailyStreak));
  }

  const heroContent = document.querySelector(".hero-content");
  if (heroContent && !document.getElementById("dailyStreakNote")) {
    const note = document.createElement("div");
    note.id = "dailyStreakNote";
    note.className = "daily-streak-note";
    note.textContent = `🔥 Daily streak: ${dailyStreak || 1} day${(dailyStreak || 1) === 1 ? "" : "s"}`;
    heroContent.appendChild(note);
  }
}

/* Hook existing functions again safely */
if (typeof updateStats === "function") {
  const polishedOriginalUpdateStats = updateStats;
  updateStats = function() {
    polishedOriginalUpdateStats();
    };
}

if (typeof checkAnswer === "function") {
  const polishedOriginalCheckAnswer = checkAnswer;
  checkAnswer = function(button, card, q, choiceIndex, originalIndex) {
    const alreadyAnsweredBefore = answered.has(originalIndex);
    const correctBefore = choiceIndex === q.answer;

    polishedOriginalCheckAnswer(button, card, q, choiceIndex, originalIndex);

    if (!alreadyAnsweredBefore && correctBefore) {
      launchConfetti();
    }

    };
}

updateDailyStreak();
if (typeof renderLeaderboard === "function") renderLeaderboard();


/* =========================
   V5 Quiz Results + Topic Leaderboard
   ========================= */

let activeQuizQuestionIds = [];
let activeQuizTopicLabel = "All Topics";
let resultAlreadyShown = false;
let lastResult = null;

const resultsModal = document.getElementById("resultsModal");
const closeResultsBtn = document.getElementById("closeResultsBtn");
const resultsModeTopic = document.getElementById("resultsModeTopic");
const resultsPercent = document.getElementById("resultsPercent");
const resultsBreakdown = document.getElementById("resultsBreakdown");
const saveScoreBtn = document.getElementById("saveScoreBtn");
const reviewMissedBtn = document.getElementById("reviewMissedBtn");

function getCurrentTopicLabel() {
  const topic = topicFilter ? topicFilter.value : "All";
  if (modeSelect && modeSelect.value === "random") return "Random 25 Exam";
  if (currentPool.length === 25 && mode === "quiz") return topic === "All" ? "Random 25 Exam" : `${topic} — Random Set`;
  return topic === "All" ? "All Topics" : topic;
}

function refreshQuizQuestionIds() {
  if (mode !== "quiz") {
    activeQuizQuestionIds = [];
    resultAlreadyShown = false;
    return;
  }

  const topic = topicFilter.value;
  const term = search.value.toLowerCase();

  activeQuizQuestionIds = currentPool
    .filter(q => {
      const matchesTopic = topic === "All" || q.topic === topic;
      const matchesSearch = q.question.toLowerCase().includes(term) ||
        q.choices.some(c => c.toLowerCase().includes(term));
      return matchesTopic && matchesSearch;
    })
    .map(q => questions.indexOf(q));

  activeQuizTopicLabel = getCurrentTopicLabel();
  resultAlreadyShown = false;
}

function updateLiveScoreVisibility() {
  const scoreCard = scoreEl ? scoreEl.closest(".stat-card") : null;
  if (!scoreCard) return;

  if (mode === "quiz") {
    scoreCard.classList.add("hide-live-score");
  } else {
    scoreCard.classList.remove("hide-live-score");
  }
}

function maybeShowQuizResults() {
  if (mode !== "quiz" || resultAlreadyShown || activeQuizQuestionIds.length === 0) return;

  const completed = activeQuizQuestionIds.every(id => answered.has(id));
  if (!completed) return;

  resultAlreadyShown = true;
  showQuizResults();
}

function showQuizResults() {
  const attemptedInQuiz = activeQuizQuestionIds.length;
  const missedInQuiz = activeQuizQuestionIds.filter(id => missed.has(id)).length;
  const correctInQuiz = attemptedInQuiz - missedInQuiz;
  const percent = attemptedInQuiz ? Math.round((correctInQuiz / attemptedInQuiz) * 100) : 0;

  lastResult = {
    score: correctInQuiz,
    attempted: attemptedInQuiz,
    percent,
    bestStreak,
    topic: activeQuizTopicLabel,
    mode: activeQuizTopicLabel.includes("Random") ? "Random Exam" : "Quiz Mode",
    date: new Date().toLocaleString()
  };

  if (resultsModeTopic) resultsModeTopic.textContent = `${lastResult.mode} • ${lastResult.topic}`;
  if (resultsPercent) resultsPercent.textContent = `${percent}%`;
  if (resultsBreakdown) resultsBreakdown.textContent = `${correctInQuiz} / ${attemptedInQuiz} correct`;
  if (resultsModal) resultsModal.classList.add("show");

  if (typeof launchConfetti === "function" && percent >= 70) launchConfetti();
}

function saveSpecificLeaderboardScore(result) {
  if (!result) return;

  const leaderboard = getLeaderboard();
  leaderboard.push(result);

  leaderboard.sort((a, b) => {
    if (b.percent !== a.percent) return b.percent - a.percent;
    return b.score - a.score;
  });

  localStorage.setItem("studyLeaderboard", JSON.stringify(leaderboard.slice(0, 8)));
  renderLeaderboard();

  if (saveScoreBtn) {
    saveScoreBtn.textContent = "Saved ✓";
    setTimeout(() => saveScoreBtn.textContent = "Save to Leaderboard", 1200);
  }
}

/* Override leaderboard save to include topic/mode for timer-based saves too */
saveLeaderboardScore = function() {
  const total = attempted || 0;
  const percent = total ? Math.round((score / total) * 100) : 0;

  saveSpecificLeaderboardScore({
    score,
    attempted,
    percent,
    bestStreak,
    topic: getCurrentTopicLabel(),
    mode: modeSelect ? modeSelect.options[modeSelect.selectedIndex].text : "Study Session",
    date: new Date().toLocaleString()
  });
};

renderLeaderboard = function() {
  if (!leaderboardList) return;

  const leaderboard = getLeaderboard();
  const topScoreText = document.getElementById("topScoreText");

  if (leaderboard.length === 0) {
    leaderboardList.innerHTML = "<li>No scores yet. Finish a quiz to save one.</li>";
    if (topScoreText) topScoreText.textContent = "No scores yet";
    return;
  }

  if (topScoreText) {
    const top = leaderboard[0];
    topScoreText.textContent = `Top Score: ${top.percent}% — ${top.topic || "All Topics"}`;
  }

  leaderboardList.innerHTML = leaderboard.map(item => `
    <li>
      ${item.percent}% — ${item.score}/${item.attempted}
      <span class="leaderboard-topic">${item.mode || "Quiz"} • ${item.topic || "All Topics"}</span>
      <small>Best streak: ${item.bestStreak || 0} • ${item.date}</small>
    </li>
  `).join("");
};

if (closeResultsBtn) closeResultsBtn.addEventListener("click", () => resultsModal.classList.remove("show"));

if (saveScoreBtn) {
  saveScoreBtn.addEventListener("click", () => {
    saveSpecificLeaderboardScore(lastResult);
  });
}

if (reviewMissedBtn) {
  reviewMissedBtn.addEventListener("click", () => {
    if (resultsModal) resultsModal.classList.remove("show");
    mode = "missed";
    modeSelect.value = "missed";
    renderQuestions();
  });
}

/* Patch renderQuestions so quiz mode knows how many questions are in the current quiz */
const v5OriginalRenderQuestions = renderQuestions;
renderQuestions = function() {
  v5OriginalRenderQuestions();
  refreshQuizQuestionIds();
  updateLiveScoreVisibility();
};

/* Patch answer checking so results appear at end */
const v5OriginalCheckAnswer = checkAnswer;
checkAnswer = function(button, card, q, choiceIndex, originalIndex) {
  v5OriginalCheckAnswer(button, card, q, choiceIndex, originalIndex);
  maybeShowQuizResults();
};

/* Reset result state when changing modes/filters */
modeSelect.addEventListener("change", () => {
  setTimeout(() => {
    refreshQuizQuestionIds();
    updateLiveScoreVisibility();
  }, 0);
});

topicFilter.addEventListener("change", () => {
  setTimeout(refreshQuizQuestionIds, 0);
});

search.addEventListener("input", () => {
  setTimeout(refreshQuizQuestionIds, 0);
});

document.getElementById("resetBtn").addEventListener("click", () => {
  resultAlreadyShown = false;
  lastResult = null;
  if (resultsModal) resultsModal.classList.remove("show");
});

/* Initial refresh */
renderLeaderboard();
refreshQuizQuestionIds();
updateLiveScoreVisibility();


/* =========================
   V6 Topic/Quiz-Aware Progress Bar
   ========================= */

function getActiveProgressPool() {
  const topic = topicFilter ? topicFilter.value : "All";
  const term = search ? search.value.toLowerCase() : "";

  let pool = currentPool && currentPool.length ? currentPool : questions;

  if (mode === "missed") {
    pool = questions.filter((_, idx) => missed.has(idx));
  }

  return pool.filter(q => {
    const matchesTopic = topic === "All" || q.topic === topic;
    const matchesSearch =
      q.question.toLowerCase().includes(term) ||
      q.choices.some(c => c.toLowerCase().includes(term));
    return matchesTopic && matchesSearch;
  });
}

function getActiveProgressLabel(pool) {
  const topic = topicFilter ? topicFilter.value : "All";

  if (mode === "quiz" && currentPool.length === 25) {
    return topic === "All" ? "Random Exam" : `${topic} Quiz`;
  }

  if (mode === "quiz") {
    return topic === "All" ? "All Topics Quiz" : `${topic} Quiz`;
  }

  if (mode === "flashcards") {
    return topic === "All" ? "All Topics Flashcards" : `${topic} Flashcards`;
  }

  if (mode === "missed") {
    return "Missed Questions";
  }

  return topic === "All" ? "All Topics" : topic;
}

function updateProgressFeature() {
  const pool = getActiveProgressPool();
  const ids = pool.map(q => questions.indexOf(q)).filter(id => id >= 0);
  const total = ids.length || 1;
  const completed = ids.filter(id => answered.has(id)).length;
  const percent = Math.round((completed / total) * 100);

  if (progressText) {
    progressText.innerHTML = `${percent}% <small class="progress-detail">${completed}/${total}</small>`;
  }

  if (progressBar) {
    progressBar.style.width = `${percent}%`;
  }

  const label = document.querySelector(".progress-top span");
  if (label) {
    label.textContent = getActiveProgressLabel(pool);
  }
}

/* Make sure progress updates when the view changes */
const v6OriginalRenderQuestions = renderQuestions;
renderQuestions = function() {
  v6OriginalRenderQuestions();
  updateProgressFeature();
};

topicFilter.addEventListener("change", () => setTimeout(updateProgressFeature, 0));
search.addEventListener("input", () => setTimeout(updateProgressFeature, 0));
modeSelect.addEventListener("change", () => setTimeout(updateProgressFeature, 0));

updateProgressFeature();


/* =========================
   V7 Leaderboard Popup
   ========================= */

const leaderboardOpenBtn = document.getElementById("leaderboardOpenBtn");
const leaderboardModal = document.getElementById("leaderboardModal");
const leaderboardCloseBtn = document.getElementById("leaderboardCloseBtn");

if (leaderboardOpenBtn && leaderboardModal) {
  leaderboardOpenBtn.addEventListener("click", () => {
    leaderboardModal.classList.add("show");
    if (typeof renderLeaderboard === "function") renderLeaderboard();
  });
}

if (leaderboardCloseBtn && leaderboardModal) {
  leaderboardCloseBtn.addEventListener("click", () => {
    leaderboardModal.classList.remove("show");
  });
}

if (leaderboardModal) {
  leaderboardModal.addEventListener("click", (e) => {
    if (e.target === leaderboardModal) {
      leaderboardModal.classList.remove("show");
    }
  });
}

document.addEventListener("keydown", (e) => {
  if (e.key === "Escape" && leaderboardModal) {
    leaderboardModal.classList.remove("show");
  }
});





/* =========================
   V13 Stable Flags + Auto Attach
   ========================= */

function getQuestionStableId(q) {
  return `${q.topic}::${q.question}`;
}

function getQuestionByStableId(id) {
  return questions.find(q => getQuestionStableId(q) === id);
}

let flaggedQuestions = new Set(JSON.parse(localStorage.getItem("flaggedQuestionsV13") || "[]"));

const flaggedOpenBtn = document.getElementById("flaggedOpenBtn");
const flaggedModal = document.getElementById("flaggedModal");
const flaggedCloseBtn = document.getElementById("flaggedCloseBtn");
const flaggedList = document.getElementById("flaggedList");
const flaggedBadge = document.getElementById("flaggedBadge");

function saveFlaggedQuestions() {
  localStorage.setItem("flaggedQuestionsV13", JSON.stringify([...flaggedQuestions]));
}

function clearFlaggedQuestions() {
  flaggedQuestions.clear();
  localStorage.removeItem("flaggedQuestionsV13");
  localStorage.removeItem("flaggedQuestions");
  updateFlaggedBadge();
  renderFlaggedList();
}

function updateFlaggedBadge() {
  if (flaggedBadge) flaggedBadge.textContent = flaggedQuestions.size;
}

function getCurrentVisibleQuestionsForFlags() {
  const topic = topicFilter ? topicFilter.value : "All";
  const term = search ? search.value.toLowerCase() : "";

  let pool = currentPool && currentPool.length ? currentPool : questions;

  if (mode === "missed") {
    pool = questions.filter((_, idx) => missed.has(idx));
  }

  return pool.filter(q => {
    const matchesTopic = topic === "All" || q.topic === topic;
    const matchesSearch =
      q.question.toLowerCase().includes(term) ||
      q.choices.some(c => c.toLowerCase().includes(term));
    return matchesTopic && matchesSearch;
  });
}

function toggleFlagQuestionById(questionId) {
  if (flaggedQuestions.has(questionId)) {
    flaggedQuestions.delete(questionId);
  } else {
    flaggedQuestions.add(questionId);
  }

  saveFlaggedQuestions();
  updateFlaggedBadge();
  attachFlagButtons();
}

function attachFlagButtons() {
  const visibleQuestions = getCurrentVisibleQuestionsForFlags();
  const cards = [...document.querySelectorAll(".question-card")];

  cards.forEach((card, cardIndex) => {
    const q = visibleQuestions[cardIndex];
    if (!q) return;

    const questionId = getQuestionStableId(q);
    card.dataset.questionId = questionId;

    const title = card.querySelector("h3");
    if (!title) return;

    let flagBtn = card.querySelector(".flag-question-btn");

    if (!flagBtn) {
      flagBtn = document.createElement("button");
      flagBtn.className = "flag-question-btn";
      flagBtn.type = "button";

      flagBtn.addEventListener("click", (e) => {
        e.preventDefault();
        e.stopPropagation();
        toggleFlagQuestionById(card.dataset.questionId);
      });

      title.insertAdjacentElement("afterend", flagBtn);
    }

    const isFlagged = flaggedQuestions.has(questionId);
    flagBtn.textContent = isFlagged ? "🚩 Flagged" : "🚩 Flag for Review";
    flagBtn.classList.toggle("flagged", isFlagged);
    card.classList.toggle("flagged-card", isFlagged);
  });

  updateFlaggedBadge();
}

function renderFlaggedList() {
  if (!flaggedList) return;

  const ids = [...flaggedQuestions].filter(id => getQuestionByStableId(id));

  if (ids.length === 0) {
    flaggedList.innerHTML = `<div class="empty">No flagged questions yet.</div>`;
    return;
  }

  flaggedList.innerHTML = ids.map(id => {
    const q = getQuestionByStableId(id);
    const safeId = encodeURIComponent(id);
    return `
      <div class="flagged-item">
        <span>${q.topic}</span>
        <strong>${q.question}</strong>
        <div class="flagged-item-actions">
          <button onclick="jumpToFlaggedQuestionById('${safeId}')">Return to Question</button>
          <button class="danger-btn" onclick="removeFlaggedQuestionById('${safeId}')">Remove Flag</button>
        </div>
      </div>
    `;
  }).join("");
}

function jumpToFlaggedQuestionById(encodedId) {
  const questionId = decodeURIComponent(encodedId);
  if (flaggedModal) flaggedModal.classList.remove("show");

  let card = document.querySelector(`.question-card[data-question-id="${CSS.escape(questionId)}"]`);

  if (card) {
    card.scrollIntoView({ behavior: "smooth", block: "center" });
    card.classList.add("flagged-card");
    setTimeout(() => card.classList.remove("flagged-card"), 1400);
    return;
  }

  const q = getQuestionByStableId(questionId);
  if (!q) return;

  // If the flagged question is not in the active quiz/current view, open it in Study Mode for review.
  if (topicFilter) topicFilter.value = q.topic;
  if (modeSelect) {
    modeSelect.value = "study";
    mode = "study";
  }

  currentPool = [...questions];
  renderQuestions();

  setTimeout(() => {
    const reviewCard = document.querySelector(`.question-card[data-question-id="${CSS.escape(questionId)}"]`);
    if (reviewCard) {
      reviewCard.scrollIntoView({ behavior: "smooth", block: "center" });
      reviewCard.classList.add("flagged-card");
      setTimeout(() => reviewCard.classList.remove("flagged-card"), 1400);
    }
  }, 150);
}

function removeFlaggedQuestionById(encodedId) {
  const questionId = decodeURIComponent(encodedId);
  flaggedQuestions.delete(questionId);
  saveFlaggedQuestions();
  updateFlaggedBadge();
  renderFlaggedList();
  attachFlagButtons();
}

if (flaggedOpenBtn && flaggedModal) {
  flaggedOpenBtn.addEventListener("click", () => {
    renderFlaggedList();
    flaggedModal.classList.add("show");
  });
}

if (flaggedCloseBtn && flaggedModal) {
  flaggedCloseBtn.addEventListener("click", () => {
    flaggedModal.classList.remove("show");
  });
}

if (flaggedModal) {
  flaggedModal.addEventListener("click", (e) => {
    if (e.target === flaggedModal) flaggedModal.classList.remove("show");
  });
}

document.addEventListener("keydown", (e) => {
  if (e.key === "Escape" && flaggedModal) {
    flaggedModal.classList.remove("show");
  }
});

/* Auto-attach flag buttons any time the cards are rendered */
const v13OriginalRenderQuestions = renderQuestions;
renderQuestions = function() {
  v13OriginalRenderQuestions();
  attachFlagButtons();
};

/* Auto-attach after topic/search/mode changes too */
if (topicFilter) {
  topicFilter.addEventListener("change", () => {
    setTimeout(attachFlagButtons, 0);
  });
}

if (search) {
  search.addEventListener("input", () => {
    setTimeout(attachFlagButtons, 0);
  });
}

let previousModeForFlags = mode;
if (modeSelect) {
  modeSelect.addEventListener("change", () => {
    const newMode = modeSelect.value;

    const shouldClear =
      previousModeForFlags !== newMode &&
      (
        previousModeForFlags === "quiz" ||
        newMode === "quiz" ||
        newMode === "random" ||
        newMode === "flashcards" ||
        newMode === "missed"
      );

    if (shouldClear) clearFlaggedQuestions();

    previousModeForFlags = newMode;
    setTimeout(attachFlagButtons, 0);
  });
}

updateFlaggedBadge();
attachFlagButtons();


/* V14 Editable timer input behavior */
if (timerMinutesInput) {
  timerMinutesInput.addEventListener("change", () => {
    const minutes = Number(timerMinutesInput.value || 60);
    timerMinutesInput.value = Math.max(1, Math.min(180, minutes));
    if (!timerInterval) {
      timerSeconds = Number(timerMinutesInput.value) * 60;
      updateTimerDisplay();
    }
  });

  timerMinutesInput.addEventListener("input", () => {
    if (!timerInterval) {
      const minutes = Number(timerMinutesInput.value || 60);
      timerSeconds = Math.max(1, Math.min(180, minutes)) * 60;
      updateTimerDisplay();
    }
  });
}
