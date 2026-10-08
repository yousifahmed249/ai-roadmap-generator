// =====================================================
// AI Roadmap Generator — app.js
// Replace API_KEY with your key from https://aistudio.google.com/
// =====================================================

const API_KEY = "YOUR_GEMINI_API_KEY";
const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${API_KEY}`;

// -------------------------------------------------------
// DOM References
// -------------------------------------------------------
const inputEl       = document.getElementById("specialization-input");
const generateBtn   = document.getElementById("generate-btn");
const loadingEl     = document.getElementById("loading");
const errorEl       = document.getElementById("error-message");
const errorTextEl   = errorEl.querySelector(".error-text");
const resultsEl     = document.getElementById("results");
const titleEl       = document.getElementById("roadmap-title");
const descriptionEl = document.getElementById("roadmap-description");
const durationEl    = document.getElementById("total-duration");
const timelineEl    = document.getElementById("timeline");
const copyBtn       = document.getElementById("copy-btn");
const printBtn      = document.getElementById("print-btn");
const toastEl       = document.getElementById("toast");

// -------------------------------------------------------
// Prompt Builder
// -------------------------------------------------------
function buildPrompt(specialization) {
  return `You are an expert learning path advisor. Generate a comprehensive learning roadmap for someone who wants to become a specialist in: ${specialization}.

Respond ONLY with a valid JSON object — no markdown, no code fences, no extra text. Use this exact structure:
{
  "title": "Roadmap title in Arabic",
  "description": "Brief overview in Arabic (2-3 sentences)",
  "totalDuration": "X-Y months",
  "phases": [
    {
      "phase": 1,
      "title": "Phase title in Arabic",
      "duration": "X-Y months",
      "color": "#hexcolor",
      "icon": "single emoji",
      "topics": [
        {
          "name": "Topic name in Arabic",
          "description": "Why learn this, in Arabic (1-2 sentences)",
          "resources": ["Resource 1", "Resource 2", "Resource 3"],
          "estimatedTime": "X weeks"
        }
      ],
      "milestone": "What you can build/do after completing this phase, in Arabic"
    }
  ]
}
Generate 4-6 phases. Make the roadmap thorough and practical.`;
}

// -------------------------------------------------------
// API Call
// -------------------------------------------------------
async function callGeminiAPI(specialization) {
  const prompt = buildPrompt(specialization);

  const requestBody = {
    contents: [
      {
        parts: [{ text: prompt }]
      }
    ],
    generationConfig: {
      temperature: 0.7,
      maxOutputTokens: 4096
    }
  };

  const response = await fetch(API_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(requestBody)
  });

  if (!response.ok) {
    const errData = await response.json().catch(() => ({}));
    const msg = errData?.error?.message || `HTTP ${response.status}`;
    throw new Error(`خطأ في الاتصال بالخادم: ${msg}`);
  }

  const data = await response.json();
  let rawText = data?.candidates?.[0]?.content?.parts?.[0]?.text;

  if (!rawText) {
    throw new Error("لم يتم استلام أي استجابة من Gemini. حاول مجدداً.");
  }

  // Strip accidental markdown code fences
  rawText = rawText.replace(/^```(?:json)?\s*/i, "").replace(/\s*```\s*$/i, "").trim();

  let parsed;
  try {
    parsed = JSON.parse(rawText);
  } catch {
    throw new Error("فشل في تحليل استجابة الذكاء الاصطناعي. يرجى المحاولة مرة أخرى.");
  }

  return parsed;
}

// -------------------------------------------------------
// Render Roadmap
// -------------------------------------------------------
function renderRoadmap(data) {
  // Populate header
  titleEl.textContent       = data.title        || "خارطة الطريق";
  descriptionEl.textContent = data.description  || "";
  durationEl.textContent    = data.totalDuration || "—";

  // Clear previous results
  timelineEl.innerHTML = "";

  // Render each phase
  (data.phases || []).forEach((phase, index) => {
    const card = createPhaseCard(phase, index);
    timelineEl.appendChild(card);
  });

  // Show results section
  resultsEl.removeAttribute("hidden");

  // Smooth scroll to results
  setTimeout(() => {
    resultsEl.scrollIntoView({ behavior: "smooth", block: "start" });
  }, 100);
}

// -------------------------------------------------------
// Create Phase Card
// -------------------------------------------------------
function createPhaseCard(phase, index) {
  const card = document.createElement("article");
  card.className = "phase-card";
  card.style.setProperty("--card-color", phase.color || "#06b6d4");
  card.style.animationDelay = `${index * 0.15}s`;

  // Build topics HTML
  const topicsHTML = (phase.topics || []).map(topic => {
    const resourcesHTML = (topic.resources || []).map(r =>
      `<span class="resource-pill">📚 ${escapeHTML(r)}</span>`
    ).join("");

    return `
      <div class="topic-item">
        <div class="topic-header">
          <span class="topic-name">${escapeHTML(topic.name || "")}</span>
          ${topic.estimatedTime
            ? `<span class="topic-time">⏳ ${escapeHTML(topic.estimatedTime)}</span>`
            : ""}
        </div>
        ${topic.description
          ? `<p class="topic-description">${escapeHTML(topic.description)}</p>`
          : ""}
        ${resourcesHTML
          ? `<p class="resources-label">مصادر التعلم</p>
             <div class="resources-list">${resourcesHTML}</div>`
          : ""}
      </div>`;
  }).join("");

  card.innerHTML = `
    <div class="phase-header">
      <span class="phase-icon">${escapeHTML(phase.icon || "📌")}</span>
      <div class="phase-info">
        <div class="phase-number">المرحلة ${phase.phase || index + 1}</div>
        <h3 class="phase-title">${escapeHTML(phase.title || "")}</h3>
      </div>
      ${phase.duration
        ? `<span class="phase-duration-badge">⏱️ ${escapeHTML(phase.duration)}</span>`
        : ""}
    </div>
    <div class="topics-list">${topicsHTML}</div>
    ${phase.milestone
      ? `<div class="milestone-box">
           <span class="milestone-icon">🏆</span>
           <p class="milestone-text"><strong>ما ستتمكن من فعله:</strong> ${escapeHTML(phase.milestone)}</p>
         </div>`
      : ""}`;

  return card;
}

// -------------------------------------------------------
// Copy Roadmap
// -------------------------------------------------------
async function copyRoadmap() {
  const text = timelineEl.innerText || timelineEl.textContent;
  const fullText = `${titleEl.textContent}\n\n${descriptionEl.textContent}\n\nالمدة الإجمالية: ${durationEl.textContent}\n\n${text}`;

  try {
    await navigator.clipboard.writeText(fullText);
    showToast("✅ تم نسخ خارطة الطريق!");
  } catch {
    showToast("⚠️ تعذّر النسخ. جرّب يدوياً.");
  }
}

// -------------------------------------------------------
// Main Generate Function
// -------------------------------------------------------
async function generateRoadmap() {
  const specialization = inputEl.value.trim();

  // Validate input
  if (!specialization) {
    showError("يرجى إدخال تخصصك أولاً.");
    inputEl.focus();
    return;
  }

  // Guard: API key not set
  if (API_KEY === "YOUR_GEMINI_API_KEY") {
    showError("يرجى إضافة مفتاح Gemini API في ملف app.js أولاً");
    return;
  }

  // Reset UI
  hideError();
  resultsEl.setAttribute("hidden", "");
  showLoading();
  generateBtn.disabled = true;

  try {
    const roadmapData = await callGeminiAPI(specialization);
    renderRoadmap(roadmapData);
  } catch (err) {
    showError(err.message || "حدث خطأ غير متوقع. يرجى المحاولة مرة أخرى.");
  } finally {
    hideLoading();
    generateBtn.disabled = false;
  }
}

// -------------------------------------------------------
// Show / Hide Helpers
// -------------------------------------------------------
function showLoading() {
  loadingEl.removeAttribute("hidden");
}

function hideLoading() {
  loadingEl.setAttribute("hidden", "");
}

function showError(message) {
  errorTextEl.textContent = message;
  errorEl.removeAttribute("hidden");
}

function hideError() {
  errorEl.setAttribute("hidden", "");
  errorTextEl.textContent = "";
}

function showToast(message) {
  toastEl.textContent = message;
  toastEl.classList.add("show");
  setTimeout(() => toastEl.classList.remove("show"), 3000);
}

// -------------------------------------------------------
// Escape HTML to prevent XSS from AI output
// -------------------------------------------------------
function escapeHTML(str) {
  const div = document.createElement("div");
  div.appendChild(document.createTextNode(str));
  return div.innerHTML;
}

// -------------------------------------------------------
// Event Listeners
// -------------------------------------------------------

// Generate button
generateBtn.addEventListener("click", generateRoadmap);

// Enter key in input
inputEl.addEventListener("keydown", (e) => {
  if (e.key === "Enter") generateRoadmap();
});

// Example chips
document.querySelectorAll(".chip").forEach(chip => {
  chip.addEventListener("click", () => {
    inputEl.value = chip.dataset.value;
    inputEl.focus();
    generateRoadmap();
  });
});

// Export buttons
copyBtn.addEventListener("click", copyRoadmap);
printBtn.addEventListener("click", () => window.print());
