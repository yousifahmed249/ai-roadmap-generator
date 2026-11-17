// =====================================================
// AI Roadmap Generator — app.js
// Store the API key locally in the browser so it works without code edits.
// =====================================================

const STORAGE_KEY = "gemini_api_key";
const LANGUAGE_STORAGE_KEY = "roadmap_language";
const SAVED_RESOURCES_STORAGE_KEY = "roadmap_saved_resources";
const CUSTOM_GOALS_STORAGE_KEY = "roadmap_custom_goals";
const SCHEDULE_DAYS = [
  { id: "sat", translation: "daySaturday" },
  { id: "sun", translation: "daySunday" },
  { id: "mon", translation: "dayMonday" },
  { id: "tue", translation: "dayTuesday" },
  { id: "wed", translation: "dayWednesday" },
  { id: "thu", translation: "dayThursday" },
  { id: "fri", translation: "dayFriday" }
];
const DEFAULT_STUDY_DAYS = ["sat", "sun", "mon", "tue", "wed", "thu"];
const SESSION_DURATIONS = [30, 45, 60, 90, 120];
let API_KEY = "";
let LANGUAGE = "ar";

try {
  API_KEY = localStorage.getItem(STORAGE_KEY) || "";
  LANGUAGE = localStorage.getItem(LANGUAGE_STORAGE_KEY) === "en" ? "en" : "ar";
} catch {
  // Keep the app usable when browser storage is unavailable.
}

function getStoredCustomGoals() {
  try {
    return localStorage.getItem(CUSTOM_GOALS_STORAGE_KEY) || "";
  } catch {
    return "";
  }
}

function getApiUrl(model) {
  return `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${encodeURIComponent(API_KEY)}`;
}

// -------------------------------------------------------
// DOM References
// -------------------------------------------------------
const inputEl       = document.getElementById("specialization-input");
const apiKeyInput    = document.getElementById("api-key-input");
const saveKeyBtn     = document.getElementById("save-key-btn");
const generateBtn   = document.getElementById("generate-btn");
const goalsInput     = document.getElementById("goals-input");
const goalsClearBtn  = document.getElementById("goals-clear-btn");
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
const savedResourcesCountEl = document.getElementById("saved-resources-count");
const savedResourcesEmptyEl = document.getElementById("saved-resources-empty");
const savedResourcesListEl = document.getElementById("saved-resources-list");
const languageToggle = document.getElementById("language-toggle");
const weeklyTab     = document.getElementById("weekly-tab");
const dailyTab      = document.getElementById("daily-tab");
const weeklyScheduleEl = document.getElementById("weekly-schedule");
const dailyScheduleEl  = document.getElementById("daily-schedule");
const weeklyScheduleListEl = document.getElementById("weekly-schedule-list");
const scheduleDescriptionEl = document.getElementById("schedule-description");
const scheduleDaySelect = document.getElementById("schedule-day-select");
const dailyScheduleDetailsEl = document.getElementById("daily-schedule-details");
const studyDayInputs = [...document.querySelectorAll('input[name="study-day"]')];
const sessionDurationSelect = document.getElementById("session-duration-select");
const scheduleSettingsEl = document.querySelector(".schedule-settings");

let studySchedule = [];
let currentRoadmapData = null;
let currentRoadmapSpecialization = "";

if (apiKeyInput) apiKeyInput.value = API_KEY;
if (goalsInput) goalsInput.value = getStoredCustomGoals();

const TRANSLATIONS = {
  ar: {
    pageTitle: "مولّد خارطة الطريق بالذكاء الاصطناعي",
    siteTitle: "مولّد خارطة الطريق",
    siteSubtitle: "بالذكاء الاصطناعي",
    mainNavigation: "التنقل الرئيسي",
    navGenerator: "المولّد",
    navSaved: "المصادر المحفوظة",
    navStart: "ابدأ الآن",
    heroEyebrow: "تعلّم أذكى، واصل أبعد",
    heroHeading: "اكتشف مسار تعلّمك المثالي",
    heroDescription: "أدخل تخصصك واحصل على خارطة طريق شاملة ومنظّمة تعينك على الوصول إلى الاحتراف خطوة بخطوة",
    proofPersonalized: "مصمّم حسب أهدافك",
    proofActionable: "خطوات عملية واضحة",
    previewLabel: "خارطتك، على مقاسك",
    previewRoadmap: "مسار تطوير الويب",
    previewDuration: "رحلة متدرجة نحو الاحتراف",
    previewProgress: "مسارك يبدأ من هنا",
    previewStepOne: "الأساسيات",
    previewStepTwo: "أدوات التطوير",
    previewStepThree: "مشاريع عملية",
    previewFooter: "خطة شخصية مدعومة بالذكاء الاصطناعي",
    visualChipTop: "خطة تناسبك",
    visualChipBottom: "خطوة بخطوة",
    generatorKicker: "ابدأ رحلتك",
    generatorHeading: "ابنِ خارطة طريقك",
    generatorDescription: "أخبرنا بما تريد تعلّمه، وسنرتّب لك الطريق خطوة بخطوة.",
    formTitle: "خصّص مسار تعلّمك",
    formDescription: "ابدأ بتخصصك، وأضف أهدافك للحصول على خطة أقرب لما تحتاجه.",
    specializationLabel: "ما المجال الذي تريد تعلّمه؟",
    apiKeyLabel: "مفتاح Gemini API",
    privacyNote: "مفتاحك وأهدافك محفوظة محلياً في هذا المتصفح.",
    savedKicker: "مكتبتك الشخصية",
    savedResourcesEmptyHint: "احفظ المصادر المفيدة أثناء استكشاف خارطتك وستجدها هنا.",
    roadmapKicker: "مسار التعلّم",
    specializationPlaceholder: "أدخل تخصصك... مثال: تطوير الويب، علم البيانات",
    generateButton: "توليد خارطة الطريق",
    apiKeyPlaceholder: "أدخل مفتاح Gemini API",
    saveKeyButton: "حفظ المفتاح",
    goalsLabel: "أهدافك التعليمية (اختياري)",
    goalsPlaceholder: "مثال: بناء مشروع عملي، إتقان Git، كتابة CV",
    goalsClear: "مسح",
    goalsHint: "سيُدرج هذه الأهداف في رسالة الذكاء الاصطناعي لتخصيص الخريطة",
    apiKeyHelpStart: "لإنشاء مفتاحك الخاص، سجّل الدخول إلى",
    apiKeyHelpLink: "Google AI Studio",
    apiKeyHelpEnd: "، اختر Get API Key ثم Create API Key، وانسخ المفتاح والصقه هنا. لا تشاركه مع الآخرين.",
    chipsLabel: "أمثلة على التخصصات",
    tryLabel: "جرّب:",
    webDev: "تطوير الويب",
    dataScience: "علم البيانات",
    cybersecurity: "الأمن السيبراني",
    appDev: "تطوير التطبيقات",
    ai: "الذكاء الاصطناعي",
    uiux: "UI/UX Design",
    loadingLabel: "جارٍ التوليد",
    loadingText: "جارٍ توليد خارطة الطريق...",
    loadingSubtext: "قد يستغرق ذلك بضع ثوانٍ",
    totalDuration: "المدة الإجمالية:",
    timelineLabel: "مراحل خارطة الطريق",
    scheduleTitle: "📅 جدول الدراسة المقترح",
    scheduleViewLabel: "طريقة عرض الجدول",
    weeklyTab: "أسبوعي",
    dailyTab: "يومي",
    chooseDay: "اختر يوماً لعرض تفاصيل جلسة الدراسة:",
    copyButton: "نسخ الخارطة والجدول",
    printButton: "طباعة / PDF",
    footerText: "مدعوم بـ",
    footerTextEnd: "· صُمِّم لمساعدتك على رسم مسيرتك التعليمية",
    phase: "المرحلة",
    resources: "مصادر التعلم",
    resourceOpen: "فتح المصدر",
    resourceSearch: "ابحث عن المصدر",
    sourceDisclaimer: "روابط مقترحة من الذكاء الاصطناعي؛ تحقق من دقة المصدر ومناسبته قبل الاعتماد عليه.",
    savedResourcesTitle: "🔖 المصادر المحفوظة",
    savedResourcesEmpty: "لم تحفظ أي مصادر بعد.",
    savedResourcesCount: (count) => `${count} مصدر محفوظ`,
    saveResource: "حفظ المصدر",
    removeSavedResource: "إزالة من المحفوظات",
    savedResourceAdded: "✅ تمت إضافة المصدر إلى المحفوظات.",
    savedResourceRemoved: "تمت إزالة المصدر من المحفوظات.",
    savedResourcesSaveError: "تعذّر حفظ المصادر في هذا المتصفح.",
    savedResourcesLoadError: "تعذّرت قراءة المصادر المحفوظة. تحقق من مساحة التخزين في المتصفح.",
    milestone: "ما ستتمكن من فعله:",
    roadmap: "خارطة الطريق",
    weekDays: ["السبت", "الأحد", "الإثنين", "الثلاثاء", "الأربعاء", "الخميس"],
    friday: "الجمعة",
    roadmapStart: "بداية الخارطة",
    defaultTopic: "مراجعة أهداف التعلّم",
    defaultPhase: "الخارطة التعليمية",
    scheduleDescription: (phase, days, duration) => `خطة مرنة مبنية على موضوعات المرحلة الأولى (${phase}). الدراسة ${days} أيام أسبوعياً، والجلسة ${duration}.`,
    restAndReview: "راحة أو مراجعة خفيفة",
    prepareNextWeek: "استعد للأسبوع القادم",
    optional: "راحة",
    reviewAndApply: "مراجعة وتطبيق:",
    studyTopic: "دراسة الموضوع",
    restDay: "🌿 يوم راحة",
    restDayDescription: "خذ استراحة لاستعادة نشاطك، أو راجع ملاحظات الأسبوع لمدة 15 دقيقة إذا رغبت.",
    dayPlan: (day, topic) => `خطة يوم ${day}: ${topic}`,
    phaseLabel: "المرحلة:",
    quickReview: "مراجعة سريعة",
    reviewPrevious: "راجع ما تعلمته في الجلسة السابقة.",
    reviewAndApplyTitle: "مراجعة وتطبيق",
    focusedLearning: "تعلّم مركز",
    practice: "تطبيق عملي",
    practiceDescription: "نفّذ تمريناً قصيراً أو مثالاً عملياً على الموضوع.",
    summary: "تلخيص",
    summaryDescription: "دوّن ما أنجزته وحدد نقطة البداية للجلسة القادمة.",
    suggestedResource: "📚 مصدر مقترح:",
    applyTopic: (topic) => `طبّق ما تعلمته في ${topic} بمشروع صغير، ثم راجع النقاط التي تحتاج إلى تثبيت.`,
    learnTopic: (topic) => `تعلّم أساسيات ${topic} وسجّل أهم النقاط.`,
    minutes: ["10 دقائق", "30 دقيقة", "15 دقيقة", "5 دقائق"],
    fallbackToast: "تم استخدام Gemini 3.7 Flash بسبب الضغط المؤقت على النموذج الأساسي.",
    serverError: "خطأ في الاتصال بالخادم",
    noResponse: "لم يتم استلام نص من Gemini",
    retry: "حاول مجدداً.",
    parseError: "أعاد Gemini استجابة غير مكتملة أو بتنسيق غير صالح رغم طلب JSON. أعد المحاولة، وإذا تكرر الخطأ فتحقق من حد الإخراج أو جرّب لاحقاً.",
    copySuccess: "✅ تم نسخ الخارطة والجدول!",
    copyFailure: "⚠️ تعذّر النسخ. جرّب يدوياً.",
    missingKey: "يرجى إدخال مفتاح Gemini API في الحقل الخاص به ثم الضغط على \"حفظ المفتاح\".",
    missingSpecialization: "يرجى إدخال تخصصك أولاً.",
    unexpectedError: "حدث خطأ غير متوقع. يرجى المحاولة مرة أخرى.",
    savedKey: "✅ تم حفظ مفتاح Gemini محلياً",
    emptyKey: "يرجى إدخال مفتاح Gemini API أولاً.",
    languageChanged: "تم تغيير لغة الواجهة. أعد توليد الخارطة لتظهر نتائجها باللغة المحددة.",
    progressTitle: "متابعة التقدم",
    overallProgress: "التقدم الإجمالي",
    phaseProgress: "تقدم المرحلة",
    progressPercent: (percent) => `${percent}%`,
    progressCompleted: (completed, total) => `أُنجز ${completed} من ${total} موضوعات`,
    topicCompleted: "تم إنجاز هذا الموضوع",
    progressSaveError: "تعذّر حفظ تقدمك في هذا المتصفح. ستبقى العلامة ظاهرة حتى تحديث الصفحة.",
    progressLoadError: "تعذّرت قراءة تقدمك المحفوظ. تحقق من مساحة التخزين في المتصفح.",
    studyDaysLabel: "أيام الدراسة",
    sessionDurationLabel: "مدة الجلسة:",
    minutesUnit: "دقيقة",
    studyDayCount: (count) => count === 1 ? "يوماً واحداً" : count === 2 ? "يومين" : `${count} أيام`,
    daySaturday: "السبت",
    daySunday: "الأحد",
    dayMonday: "الإثنين",
    dayTuesday: "الثلاثاء",
    dayWednesday: "الأربعاء",
    dayThursday: "الخميس",
    dayFriday: "الجمعة",
    noStudyDay: "اختر يوماً واحداً على الأقل للدراسة.",
    restDescription: "يوم راحة",
    sessionDuration: (minutes) => `${minutes} دقيقة`,
    scheduleSaveError: "تعذّر حفظ إعدادات الجدول في هذا المتصفح.",
    scheduleLoadError: "تعذّرت قراءة إعدادات الجدول المحفوظة. تم استخدام الإعدادات الافتراضية."
  },
  en: {
    pageTitle: "AI Learning Roadmap Generator",
    siteTitle: "Learning Roadmap Generator",
    siteSubtitle: "Powered by AI",
    mainNavigation: "Main navigation",
    navGenerator: "Generator",
    navSaved: "Saved resources",
    navStart: "Get started",
    heroEyebrow: "Learn smarter. Go further.",
    heroHeading: "Discover Your Ideal Learning Path",
    heroDescription: "Enter your field and get a comprehensive, organized roadmap to help you become an expert step by step.",
    proofPersonalized: "Personalized to your goals",
    proofActionable: "Clear, actionable steps",
    previewLabel: "A roadmap made for you",
    previewRoadmap: "Web development path",
    previewDuration: "A guided journey to mastery",
    previewProgress: "Your path starts here",
    previewStepOne: "The fundamentals",
    previewStepTwo: "Developer tools",
    previewStepThree: "Hands-on projects",
    previewFooter: "A personal plan powered by AI",
    visualChipTop: "Made for you",
    visualChipBottom: "One step at a time",
    generatorKicker: "Start your journey",
    generatorHeading: "Build your learning roadmap",
    generatorDescription: "Tell us what you want to learn and we'll map the way, step by step.",
    formTitle: "Personalize your learning path",
    formDescription: "Choose a field and add your goals for a plan that fits what you need.",
    specializationLabel: "What do you want to learn?",
    apiKeyLabel: "Gemini API key",
    privacyNote: "Your key and goals are stored locally in this browser.",
    savedKicker: "Your personal library",
    savedResourcesEmptyHint: "Save useful resources as you explore your roadmap and find them here.",
    roadmapKicker: "Your learning path",
    specializationPlaceholder: "Enter a field... e.g. Web Development, Data Science",
    generateButton: "Generate Roadmap",
    apiKeyPlaceholder: "Enter your Gemini API key",
    saveKeyButton: "Save Key",
    goalsLabel: "Your learning goals (optional)",
    goalsPlaceholder: "Example: build a portfolio project, master Git, prepare a résumé",
    goalsClear: "Clear",
    goalsHint: "These goals are included in the AI prompt to personalize your roadmap",
    apiKeyHelpStart: "To create your own key, sign in to",
    apiKeyHelpLink: "Google AI Studio",
    apiKeyHelpEnd: ", select Get API Key, then Create API Key. Copy the key and paste it here. Do not share it with others.",
    chipsLabel: "Specialization examples",
    tryLabel: "Try:",
    webDev: "Web Development",
    dataScience: "Data Science",
    cybersecurity: "Cybersecurity",
    appDev: "App Development",
    ai: "Artificial Intelligence",
    uiux: "UI/UX Design",
    loadingLabel: "Generating",
    loadingText: "Generating your roadmap...",
    loadingSubtext: "This may take a few seconds",
    totalDuration: "Total duration:",
    timelineLabel: "Roadmap phases",
    scheduleTitle: "📅 Suggested Study Schedule",
    scheduleViewLabel: "Schedule view",
    weeklyTab: "Weekly",
    dailyTab: "Daily",
    chooseDay: "Choose a day to view its study session:",
    copyButton: "Copy Roadmap & Schedule",
    printButton: "Print / PDF",
    footerText: "Powered by",
    footerTextEnd: "· Designed to help you map your learning journey",
    phase: "Phase",
    resources: "Learning resources",
    resourceOpen: "Open resource",
    resourceSearch: "Search for resource",
    sourceDisclaimer: "AI-suggested links. Verify that each resource is accurate and suitable before relying on it.",
    savedResourcesTitle: "🔖 Saved resources",
    savedResourcesEmpty: "You haven't saved any resources yet.",
    savedResourcesCount: (count) => `${count} saved ${count === 1 ? "resource" : "resources"}`,
    saveResource: "Save resource",
    removeSavedResource: "Remove from saved",
    savedResourceAdded: "✅ Resource added to your saved list.",
    savedResourceRemoved: "Resource removed from your saved list.",
    savedResourcesSaveError: "Saved resources could not be stored in this browser.",
    savedResourcesLoadError: "Saved resources could not be read. Check your browser storage.",
    milestone: "What you'll be able to do:",
    roadmap: "Learning Roadmap",
    weekDays: ["Saturday", "Sunday", "Monday", "Tuesday", "Wednesday", "Thursday"],
    friday: "Friday",
    roadmapStart: "Roadmap start",
    defaultTopic: "Review learning goals",
    defaultPhase: "Learning roadmap",
    scheduleDescription: (phase, days, duration) => `A flexible plan based on the topics in phase one (${phase}). Study ${days} days per week, with ${duration} sessions.`,
    restAndReview: "Rest or light review",
    prepareNextWeek: "Get ready for next week",
    optional: "Rest",
    reviewAndApply: "Review & apply:",
    studyTopic: "Study the topic",
    restDay: "🌿 Rest day",
    restDayDescription: "Take a break to recharge, or review your notes for 15 minutes if you like.",
    dayPlan: (day, topic) => `${day} study plan: ${topic}`,
    phaseLabel: "Phase:",
    quickReview: "Quick review",
    reviewPrevious: "Review what you learned in the previous session.",
    reviewAndApplyTitle: "Review & apply",
    focusedLearning: "Focused learning",
    practice: "Hands-on practice",
    practiceDescription: "Complete a short exercise or practical example on this topic.",
    summary: "Summary",
    summaryDescription: "Note what you accomplished and choose a starting point for your next session.",
    suggestedResource: "📚 Suggested resource:",
    applyTopic: (topic) => `Apply what you learned about ${topic} in a small project, then review anything that needs more practice.`,
    learnTopic: (topic) => `Learn the fundamentals of ${topic} and note the key points.`,
    minutes: ["10 min", "30 min", "15 min", "5 min"],
    fallbackToast: "Gemini 3.7 Flash was used because the primary model is temporarily busy.",
    serverError: "Server connection error",
    noResponse: "Gemini returned no text",
    retry: "Please try again.",
    parseError: "Gemini returned incomplete or invalid JSON despite the format request. Please retry; if the issue persists, check the output limit or try again later.",
    copySuccess: "✅ Roadmap and schedule copied!",
    copyFailure: "⚠️ Could not copy. Please try manually.",
    missingKey: "Enter your Gemini API key in the field above, then select Save Key.",
    missingSpecialization: "Please enter a specialization first.",
    unexpectedError: "An unexpected error occurred. Please try again.",
    savedKey: "✅ Gemini API key saved locally",
    emptyKey: "Please enter your Gemini API key first.",
    languageChanged: "Interface language changed. Generate the roadmap again to get its content in the selected language.",
    progressTitle: "Learning Progress",
    overallProgress: "Overall progress",
    phaseProgress: "Phase progress",
    progressPercent: (percent) => `${percent}%`,
    progressCompleted: (completed, total) => `${completed} of ${total} topics completed`,
    topicCompleted: "Mark this topic as completed",
    progressSaveError: "Your progress could not be saved in this browser. This checkmark will remain until the page is refreshed.",
    progressLoadError: "Saved progress could not be read. Check your browser storage.",
    studyDaysLabel: "Study days",
    sessionDurationLabel: "Session length:",
    minutesUnit: "minutes",
    studyDayCount: (count) => `${count} ${count === 1 ? "day" : "days"}`,
    daySaturday: "Saturday",
    daySunday: "Sunday",
    dayMonday: "Monday",
    dayTuesday: "Tuesday",
    dayWednesday: "Wednesday",
    dayThursday: "Thursday",
    dayFriday: "Friday",
    noStudyDay: "Select at least one study day.",
    restDescription: "Rest day",
    sessionDuration: (minutes) => `${minutes} min`,
    scheduleSaveError: "Study schedule settings could not be saved in this browser.",
    scheduleLoadError: "Saved schedule settings could not be read. Default settings have been restored."
  }
};

function t(key, ...args) {
  const value = TRANSLATIONS[LANGUAGE][key];
  return typeof value === "function" ? value(...args) : value;
}

function applyLanguage() {
  const isEnglish = LANGUAGE === "en";
  document.documentElement.lang = LANGUAGE;
  document.documentElement.dir = isEnglish ? "ltr" : "rtl";
  document.body.dir = document.documentElement.dir;
  document.title = t("pageTitle");

  document.querySelectorAll("[data-i18n]").forEach((element) => {
    element.textContent = t(element.dataset.i18n);
  });
  document.querySelectorAll("[data-i18n-placeholder]").forEach((element) => {
    element.placeholder = t(element.dataset.i18nPlaceholder);
  });
  document.querySelectorAll("[data-i18n-aria]").forEach((element) => {
    element.setAttribute("aria-label", t(element.dataset.i18nAria));
  });
  document.getElementById("overall-progress-track").setAttribute("aria-label", t("overallProgress"));

  languageToggle.textContent = isEnglish ? "العربية" : "English";
  languageToggle.setAttribute("aria-label", isEnglish ? "التبديل إلى العربية" : "Switch to English");

  document.querySelectorAll(".chip").forEach((chip) => {
    chip.dataset.value = t(chip.dataset.i18n);
  });

  if (goalsInput) {
    goalsInput.placeholder = t("goalsPlaceholder");
  }

  renderSavedResources();

  if (currentRoadmapData) {
    renderRoadmap(currentRoadmapData, false, currentRoadmapSpecialization);
    showToast(t("languageChanged"));
  }
}

// -------------------------------------------------------
// Prompt Builder
// -------------------------------------------------------
function saveCustomGoals() {
  const text = goalsInput ? goalsInput.value.trim() : "";

  try {
    if (text) {
      localStorage.setItem(CUSTOM_GOALS_STORAGE_KEY, text);
    } else {
      localStorage.removeItem(CUSTOM_GOALS_STORAGE_KEY);
    }
  } catch {
    // Ignore storage failures; the form still works in the current session.
  }
}

function getCustomGoalsText() {
  const text = goalsInput ? goalsInput.value.trim() : "";
  if (!text) return "";

  const goals = text
    .split(/\n|,/)
    .map((goal) => goal.trim())
    .filter(Boolean);

  if (!goals.length) return "";

  const prefix = LANGUAGE === "en"
    ? "The learner has these personal goals:"
    : "لدى المتعلّم الأهداف الشخصية التالية:";

  return `\n${prefix} ${goals.join("; ")}. ${LANGUAGE === "en" ? "Prioritize them in the roadmap and make the plan practical for achieving them." : "أعطِ الأولوية لها في الخريطة واجعل الخطة عملية ومناسبة لتحقيقها."}`;
}

function buildPrompt(specialization) {
  const languageName = LANGUAGE === "en" ? "English" : "Arabic";
  const customGoals = getCustomGoalsText();
  return `You are an expert learning path advisor. Generate a comprehensive learning roadmap for someone who wants to become a specialist in: ${specialization}.${customGoals}

Write all user-facing text values in ${languageName}. Respond ONLY with a valid JSON object — no markdown, no code fences, no extra text. Use this exact structure:
{
  "title": "Roadmap title in ${languageName}",
  "description": "Brief overview in ${languageName} (2-3 sentences)",
  "totalDuration": "X-Y months",
  "phases": [
    {
      "phase": 1,
      "title": "Phase title in ${languageName}",
      "duration": "X-Y months",
      "color": "#hexcolor",
      "icon": "single emoji",
      "topics": [
        {
          "name": "Topic name in ${languageName}",
          "description": "Why learn this, in ${languageName} (1-2 sentences)",
          "resources": [
            { "name": "Resource title", "url": "" }
          ],
          "estimatedTime": "X weeks"
        }
      ],
      "milestone": "What you can build/do after completing this phase, in ${languageName}"
    }
  ]
}
For each resource, provide a concise name and a direct URL to a real, relevant official documentation page, course, or learning resource. Prefer stable, well-known sources. Never invent a URL; if you cannot provide a reliable direct URL, set "url" to an empty string. Generate 2-4 resources per topic.
Generate 4-6 phases. Make the roadmap thorough and practical.`;
}

// -------------------------------------------------------
// API Call
// -------------------------------------------------------
async function callGeminiAPI(specialization) {
  const prompt = buildPrompt(specialization);
  const models = ["gemini-3.8-flash", "gemini-3.7-flash"];

  const requestBody = {
    contents: [
      {
        parts: [{ text: prompt }]
      }
    ],
    generationConfig: {
      temperature: 0.4,
      maxOutputTokens: 8192,
      responseMimeType: "application/json"
    }
  };

  for (let index = 0; index < models.length; index++) {
    const response = await fetch(getApiUrl(models[index]), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(requestBody)
    });

    if (!response.ok) {
      const errData = await response.json().catch(() => ({}));
      const error = errData?.error || {};
      const message = error.message || `HTTP ${response.status}`;
      const isTemporary = response.status === 429
        || response.status === 503
        || error.status === "RESOURCE_EXHAUSTED"
        || error.status === "UNAVAILABLE"
        || /high demand|temporar(?:y|ily)/i.test(message);

      if (index < models.length - 1 && isTemporary) {
        continue;
      }

      throw new Error(`${t("serverError")}: ${message}`);
    }

    const data = await response.json();
    let rawText = data?.candidates?.[0]?.content?.parts
      ?.map((part) => part.text || "")
      .join("")
      .trim();

    if (!rawText) {
      const finishReason = data?.candidates?.[0]?.finishReason;
      const reason = finishReason ? ` (${LANGUAGE === "en" ? "finish reason" : "سبب الإنهاء"}: ${finishReason})` : "";
      throw new Error(`${t("noResponse")}${reason}. ${t("retry")}`);
    }

    if (index > 0) {
      showToast(t("fallbackToast"));
    }

    rawText = rawText
      .replace(/^```(?:json)?\s*/i, "")
      .replace(/\s*```\s*$/i, "")
      .trim();

    const jsonStart = rawText.indexOf("{");
    const jsonEnd = rawText.lastIndexOf("}");
    if (jsonStart >= 0 && jsonEnd > jsonStart) {
      rawText = rawText.slice(jsonStart, jsonEnd + 1);
    }

    try {
      return JSON.parse(rawText);
    } catch {
      throw new Error(t("parseError"));
    }
  }
}

// -------------------------------------------------------
// Render Roadmap
// -------------------------------------------------------
function renderRoadmap(data, scrollToResults = true, specialization = inputEl.value.trim()) {
  currentRoadmapData = data;
  currentRoadmapSpecialization = specialization;
  const progress = loadProgress();
  // Populate header
  titleEl.textContent       = data.title        || t("roadmap");
  descriptionEl.textContent = data.description  || "";
  durationEl.textContent    = data.totalDuration || "—";

  // Clear previous results
  timelineEl.innerHTML = "";

  // Render each phase
  (data.phases || []).forEach((phase, index) => {
    const card = createPhaseCard(phase, index, progress);
    timelineEl.appendChild(card);
  });
  updateProgressSummary(data.phases || [], progress);

  renderStudySchedule(data.phases || []);

  // Show results section
  resultsEl.removeAttribute("hidden");

  // Smooth scroll to results
  if (scrollToResults) {
    setTimeout(() => {
      resultsEl.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 100);
  }
}

// -------------------------------------------------------
// Create Phase Card
// -------------------------------------------------------
function createPhaseCard(phase, index, progress) {
  const card = document.createElement("article");
  card.className = "phase-card";
  const cardColor = phase.color || "#06b6d4";
  card.style.setProperty("--card-color", cardColor);

  // Convert hex to RGB components for use in rgba() inside CSS
  const hex = cardColor.replace("#", "");
  const r = parseInt(hex.slice(0, 2), 16);
  const g = parseInt(hex.slice(2, 4), 16);
  const b = parseInt(hex.slice(4, 6), 16);
  if (!isNaN(r) && !isNaN(g) && !isNaN(b)) {
    card.style.setProperty("--card-color-rgb", `${r}, ${g}, ${b}`);
  }

  card.style.animationDelay = `${index * 0.15}s`;

  // Build topics HTML
  const topicsHTML = (phase.topics || []).map((topic, topicIndex) => {
    const isCompleted = progress[topicProgressKey(index, phase, topicIndex, topic)] === true;
    const resourcesHTML = (topic.resources || []).map(renderResourceLink).join("");

    return `
      <div class="topic-item">
        <div class="topic-header">
          <span class="topic-name">${escapeHTML(topic.name || "")}</span>
          ${topic.estimatedTime
            ? `<span class="topic-time">⏳ ${escapeHTML(topic.estimatedTime)}</span>`
            : ""}
        </div>
        <label class="topic-completion${isCompleted ? " is-completed" : ""}">
          <input
            class="topic-completion-checkbox"
            type="checkbox"
            data-phase-index="${index}"
            data-topic-index="${topicIndex}"
            aria-label="${escapeHTML(t("topicCompleted"))}: ${escapeHTML(topic.name || "")}"
            ${isCompleted ? "checked" : ""}
          />
          <span>${escapeHTML(t("topicCompleted"))}</span>
        </label>
        ${topic.description
          ? `<p class="topic-description">${escapeHTML(topic.description)}</p>`
          : ""}
        ${resourcesHTML
          ? `<p class="resources-label">${t("resources")}</p>
             <div class="resources-list">${resourcesHTML}</div>
             <p class="resources-note">${t("sourceDisclaimer")}</p>`
          : ""}
      </div>`;
  }).join("");

  card.innerHTML = `
    <div class="phase-header">
      <span class="phase-icon">${escapeHTML(phase.icon || "📌")}</span>
      <div class="phase-info">
        <div class="phase-number">${t("phase")} ${phase.phase || index + 1}</div>
        <h3 class="phase-title">${escapeHTML(phase.title || "")}</h3>
      </div>
      ${phase.duration
        ? `<span class="phase-duration-badge">⏱️ ${escapeHTML(phase.duration)}</span>`
        : ""}
    </div>
    <div class="phase-progress" data-phase-progress="${index}">
      <div class="phase-progress-heading">
        <span>${t("phaseProgress")}</span>
        <span class="phase-progress-summary"></span>
      </div>
      <div class="progress-track phase-progress-track" role="progressbar" aria-label="${escapeHTML(t("phaseProgress"))} ${phase.phase || index + 1}" aria-valuemin="0" aria-valuemax="100" aria-valuenow="0">
        <div class="progress-bar"></div>
      </div>
    </div>
    <div class="topics-list">${topicsHTML}</div>
    ${phase.milestone
      ? `<div class="milestone-box">
           <span class="milestone-icon">🏆</span>
           <p class="milestone-text"><strong>${t("milestone")}</strong> ${escapeHTML(phase.milestone)}</p>
         </div>`
      : ""}`;

  return card;
}

function normalizeResource(resource) {
  if (typeof resource === "string") {
    return { name: resource, url: "" };
  }
  if (!resource || typeof resource !== "object") {
    return { name: "", url: "" };
  }
  return {
    name: String(resource.name || resource.title || resource.url || "").trim(),
    url: String(resource.url || "").trim()
  };
}

function getSafeResourceUrl(resource) {
  if (!resource.url) return "";
  try {
    const url = new URL(resource.url);
    if ((url.protocol !== "https:" && url.protocol !== "http:") || url.username || url.password) {
      return "";
    }
    return url.href;
  } catch {
    return "";
  }
}

function renderResourceLink(rawResource) {
  const resource = normalizeResource(rawResource);
  if (!resource.name) return "";

  const safeUrl = getSafeResourceUrl(resource);
  const href = safeUrl || `https://www.google.com/search?q=${encodeURIComponent(resource.name)}`;
  const linkLabel = safeUrl ? t("resourceOpen") : t("resourceSearch");
  return `<span class="resource-entry">
    <a class="resource-pill" href="${escapeHTML(href)}" target="_blank" rel="noopener noreferrer">
      <span aria-hidden="true">📚</span>
      <span>${escapeHTML(resource.name)}</span>
      <span class="resource-link-label">${escapeHTML(linkLabel)}</span>
    </a>
    <button
      class="resource-save-btn"
      type="button"
      data-resource-name="${escapeHTML(resource.name)}"
      data-resource-url="${escapeHTML(href)}"
      data-specialization="${escapeHTML(currentRoadmapSpecialization)}"
      aria-label="${escapeHTML(t("saveResource"))}: ${escapeHTML(resource.name)}"
    >☆ ${escapeHTML(t("saveResource"))}</button>
  </span>`;
}

function savedResourceKey(resource) {
  return resource.url;
}

function readSavedResources() {
  try {
    const savedResources = localStorage.getItem(SAVED_RESOURCES_STORAGE_KEY);
    if (!savedResources) return [];

    const parsedResources = JSON.parse(savedResources);
    if (!Array.isArray(parsedResources)) throw new Error("Saved resources must be a list.");

    return parsedResources.map((resource) => {
      const normalized = normalizeResource(resource);
      const url = getSafeResourceUrl(normalized);
      if (!normalized.name || !url) throw new Error("A saved resource is invalid.");
      return {
        name: normalized.name,
        url,
        specialization: String(resource.specialization || "").trim()
      };
    });
  } catch {
    showError(t("savedResourcesLoadError"));
    return null;
  }
}

function writeSavedResources(resources) {
  try {
    localStorage.setItem(SAVED_RESOURCES_STORAGE_KEY, JSON.stringify(resources));
    return true;
  } catch {
    showError(t("savedResourcesSaveError"));
    return false;
  }
}

function renderSavedResources(resources = readSavedResources()) {
  if (!resources) {
    savedResourcesCountEl.textContent = "";
    savedResourcesEmptyEl.hidden = true;
    savedResourcesListEl.innerHTML = "";
    return;
  }

  savedResourcesCountEl.textContent = t("savedResourcesCount", resources.length);
  savedResourcesEmptyEl.hidden = resources.length > 0;
  savedResourcesListEl.innerHTML = resources.map((resource) => `
    <li class="saved-resource-item">
      <a class="saved-resource-link" href="${escapeHTML(resource.url)}" target="_blank" rel="noopener noreferrer">
        <span aria-hidden="true">📚</span>
        <span>${escapeHTML(resource.name)}</span>
      </a>
      ${resource.specialization
        ? `<span class="saved-resource-specialization">${escapeHTML(resource.specialization)}</span>`
        : ""}
      <button
        class="saved-resource-remove-btn"
        type="button"
        data-resource-url="${escapeHTML(resource.url)}"
        aria-label="${escapeHTML(t("removeSavedResource"))}: ${escapeHTML(resource.name)}"
      >${escapeHTML(t("removeSavedResource"))}</button>
    </li>`).join("");

  updateResourceSaveButtons(resources);
}

function updateResourceSaveButtons(resources) {
  document.querySelectorAll(".resource-save-btn").forEach((button) => {
    const isSaved = resources.some((resource) => savedResourceKey(resource) === button.dataset.resourceUrl);
    const label = isSaved ? t("removeSavedResource") : t("saveResource");
    button.textContent = `${isSaved ? "★" : "☆"} ${label}`;
    button.setAttribute("aria-label", `${label}: ${button.dataset.resourceName}`);
    button.setAttribute("aria-pressed", String(isSaved));
  });
}

function toggleSavedResource(button) {
  const resources = readSavedResources();
  if (!resources) return;

  const url = button.dataset.resourceUrl;
  const existingIndex = resources.findIndex((resource) => savedResourceKey(resource) === url);
  const wasSaved = existingIndex >= 0;
  if (wasSaved) {
    resources.splice(existingIndex, 1);
  } else {
    const resource = normalizeResource({
      name: button.dataset.resourceName,
      url
    });
    const safeUrl = getSafeResourceUrl(resource);
    if (!resource.name || !safeUrl) {
      showError(t("savedResourcesSaveError"));
      return;
    }
    resources.push({
      name: resource.name,
      url: safeUrl,
      specialization: button.dataset.specialization || ""
    });
  }

  if (!writeSavedResources(resources)) return;
  renderSavedResources(resources);
  showToast(t(wasSaved ? "savedResourceRemoved" : "savedResourceAdded"));
}

function removeSavedResource(button) {
  const resources = readSavedResources();
  if (!resources) return;
  const updatedResources = resources.filter((resource) => savedResourceKey(resource) !== button.dataset.resourceUrl);
  if (updatedResources.length === resources.length) return;
  if (!writeSavedResources(updatedResources)) return;
  renderSavedResources(updatedResources);
  showToast(t("savedResourceRemoved"));
}

function progressStorageKey() {
  const specialization = currentRoadmapSpecialization.trim().toLocaleLowerCase();
  return `roadmap_progress_${LANGUAGE}_${encodeURIComponent(specialization)}`;
}

function scheduleStorageKey() {
  const specialization = currentRoadmapSpecialization.trim().toLocaleLowerCase();
  return `roadmap_schedule_${encodeURIComponent(specialization)}`;
}

function loadScheduleSettings() {
  const defaults = { studyDays: DEFAULT_STUDY_DAYS, sessionDuration: 60 };
  try {
    const savedSettings = localStorage.getItem(scheduleStorageKey());
    if (!savedSettings) return defaults;

    const settings = JSON.parse(savedSettings);
    const studyDays = Array.isArray(settings?.studyDays)
      ? [...new Set(settings.studyDays.filter((day) => SCHEDULE_DAYS.some(({ id }) => id === day)))]
      : defaults.studyDays;
    const sessionDuration = SESSION_DURATIONS.includes(Number(settings?.sessionDuration))
      ? Number(settings.sessionDuration)
      : defaults.sessionDuration;

    if (studyDays.length === 0) {
      return defaults;
    }
    return { studyDays, sessionDuration };
  } catch {
    showError(t("scheduleLoadError"));
    return defaults;
  }
}

function getCurrentScheduleSettings() {
  return {
    studyDays: studyDayInputs.filter((input) => input.checked).map((input) => input.value),
    sessionDuration: Number(sessionDurationSelect.value)
  };
}

function saveScheduleSettings(settings) {
  try {
    localStorage.setItem(scheduleStorageKey(), JSON.stringify(settings));
  } catch {
    showError(t("scheduleSaveError"));
  }
}

function topicProgressKey(phaseIndex, phase, topicIndex, topic) {
  const phaseTitle = (phase.title || "").trim().toLocaleLowerCase();
  const topicName = (topic.name || "").trim().toLocaleLowerCase();
  return `${phaseIndex}:${phaseTitle}:${topicIndex}:${topicName}`;
}

function loadProgress() {
  try {
    const savedProgress = localStorage.getItem(progressStorageKey());
    if (!savedProgress) return {};

    const progress = JSON.parse(savedProgress);
    if (
      !progress
      || typeof progress !== "object"
      || Array.isArray(progress)
      || Object.values(progress).some((value) => typeof value !== "boolean")
    ) {
      throw new Error("Invalid saved progress format");
    }
    return progress;
  } catch {
    showError(t("progressLoadError"));
    return {};
  }
}

function updateProgressSummary(phases, progress) {
  let totalTopics = 0;
  let completedTopics = 0;

  phases.forEach((phase, phaseIndex) => {
    const topics = phase.topics || [];
    const completed = topics.reduce((count, topic, topicIndex) => {
      return count + (progress[topicProgressKey(phaseIndex, phase, topicIndex, topic)] === true ? 1 : 0);
    }, 0);
    totalTopics += topics.length;
    completedTopics += completed;

    const phaseProgress = timelineEl.querySelector(`[data-phase-progress="${phaseIndex}"]`);
    if (phaseProgress) {
      const percent = topics.length ? Math.round((completed / topics.length) * 100) : 0;
      phaseProgress.querySelector(".phase-progress-summary").textContent =
        `${t("progressCompleted", completed, topics.length)} · ${t("progressPercent", percent)}`;
      const track = phaseProgress.querySelector(".progress-track");
      track.setAttribute("aria-valuenow", String(percent));
      track.setAttribute("aria-valuetext", t("progressPercent", percent));
      phaseProgress.querySelector(".progress-bar").style.width = `${percent}%`;
    }
  });

  const percent = totalTopics ? Math.round((completedTopics / totalTopics) * 100) : 0;
  document.getElementById("progress-summary").textContent =
    `${t("progressCompleted", completedTopics, totalTopics)} · ${t("progressPercent", percent)}`;
  const track = document.getElementById("overall-progress-track");
  track.setAttribute("aria-valuenow", String(percent));
  track.setAttribute("aria-valuetext", t("progressPercent", percent));
  document.getElementById("overall-progress-bar").style.width = `${percent}%`;

  timelineEl.querySelectorAll(".topic-completion-checkbox").forEach((checkbox) => {
    const label = checkbox.closest(".topic-completion");
    label.classList.toggle("is-completed", checkbox.checked);
    checkbox.closest(".topic-item").classList.toggle("is-completed", checkbox.checked);
  });
}

function saveTopicProgress(checkbox) {
  const phaseIndex = Number(checkbox.dataset.phaseIndex);
  const topicIndex = Number(checkbox.dataset.topicIndex);
  const phase = currentRoadmapData?.phases?.[phaseIndex];
  const topic = phase?.topics?.[topicIndex];
  if (!phase || !topic) return;

  const progress = loadProgress();
  const key = topicProgressKey(phaseIndex, phase, topicIndex, topic);
  if (checkbox.checked) {
    progress[key] = true;
  } else {
    delete progress[key];
  }

  try {
    localStorage.setItem(progressStorageKey(), JSON.stringify(progress));
  } catch {
    showError(t("progressSaveError"));
  }

  updateProgressSummary(currentRoadmapData.phases || [], progress);
}

// -------------------------------------------------------
// Study Schedule
// -------------------------------------------------------
function renderStudySchedule(phases, settingsOverride = null) {
  const selectedDayIndex = Number(scheduleDaySelect.value) || 0;
  const settings = settingsOverride || loadScheduleSettings();
  studyDayInputs.forEach((input) => {
    input.checked = settings.studyDays.includes(input.value);
  });
  sessionDurationSelect.value = String(settings.sessionDuration);

  const firstPhase = phases[0];
  const topics = firstPhase?.topics?.length ? firstPhase.topics : [{
    name: firstPhase?.title || t("defaultTopic"),
    description: "",
    resources: []
  }];

  let studyDayIndex = 0;
  studySchedule = SCHEDULE_DAYS.map(({ id, translation }) => {
    const day = t(translation);
    if (!settings.studyDays.includes(id)) {
      return {
        id,
        day,
        topic: null,
        phaseTitle: firstPhase?.title || t("defaultPhase"),
        isRestDay: true
      };
    }

    const topicIndex = studyDayIndex % topics.length;
    const item = {
      id,
      day,
      topic: topics[topicIndex],
      phaseTitle: firstPhase?.title || t("defaultPhase"),
      isReview: studyDayIndex >= topics.length
    };
    studyDayIndex++;
    return item;
  });

  scheduleDescriptionEl.textContent = t(
    "scheduleDescription",
    firstPhase?.title || t("roadmapStart"),
    t("studyDayCount", settings.studyDays.length),
    t("sessionDuration", settings.sessionDuration)
  );
  weeklyScheduleListEl.innerHTML = studySchedule.map((item) => `
    <article class="schedule-day-card${item.isRestDay ? " rest-day" : ""}">
      <span class="schedule-day-name">${item.day}</span>
      <strong>${item.isRestDay ? t("restAndReview") : `${item.isReview ? t("reviewAndApply") : ""} ${escapeHTML(item.topic.name || t("studyTopic"))}`}</strong>
      <span class="schedule-phase-name">${item.isRestDay ? t("restDescription") : `${LANGUAGE === "en" ? "From" : "من"} ${escapeHTML(item.phaseTitle)}`}</span>
      <span class="schedule-duration">${item.isRestDay ? t("optional") : `⏱️ ${t("sessionDuration", settings.sessionDuration)}`}</span>
    </article>
  `).join("");

  scheduleDaySelect.innerHTML = studySchedule.map((item, index) =>
    `<option value="${index}">${item.day}</option>`
  ).join("");
  const activeDayIndex = Math.min(selectedDayIndex, studySchedule.length - 1);
  scheduleDaySelect.value = String(activeDayIndex);
  renderDailySchedule(activeDayIndex);
}

function renderDailySchedule(dayIndex) {
  const item = studySchedule[dayIndex];
  if (!item) return;

  if (item.isRestDay) {
    dailyScheduleDetailsEl.innerHTML = `
      <article class="daily-session-card rest-day">
        <h3>${t("restDay")}</h3>
        <p>${t("restDayDescription")}</p>
      </article>`;
    return;
  }

  const topic = item.topic;
  const resource = topic.resources?.[0];
  const sessionDuration = Number(sessionDurationSelect.value);
  const reviewMinutes = Math.round(sessionDuration * 0.15);
  const focusedMinutes = Math.round(sessionDuration * 0.5);
  const practiceMinutes = Math.round(sessionDuration * 0.25);
  const summaryMinutes = sessionDuration - reviewMinutes - focusedMinutes - practiceMinutes;
  const formatMinutes = (minutes) => t("sessionDuration", minutes);
  const learningStep = item.isReview
    ? t("applyTopic", topic.name || t("studyTopic"))
    : topic.description || t("learnTopic", topic.name || t("studyTopic"));
  dailyScheduleDetailsEl.innerHTML = `
    <article class="daily-session-card">
      <h3>${t("dayPlan", item.day, escapeHTML(topic.name || t("studyTopic")))}</h3>
      <p class="daily-phase-name">${t("phaseLabel")} ${escapeHTML(item.phaseTitle)}</p>
      <p class="daily-phase-name">${t("sessionDurationLabel")} ${formatMinutes(sessionDuration)}</p>
      <ol class="daily-session-steps">
        <li><span class="session-time">${formatMinutes(reviewMinutes)}</span><span><strong>${t("quickReview")}</strong><br>${t("reviewPrevious")}</span></li>
        <li><span class="session-time">${formatMinutes(focusedMinutes)}</span><span><strong>${item.isReview ? t("reviewAndApplyTitle") : t("focusedLearning")}</strong><br>${escapeHTML(learningStep)}</span></li>
        <li><span class="session-time">${formatMinutes(practiceMinutes)}</span><span><strong>${t("practice")}</strong><br>${t("practiceDescription")}</span></li>
        <li><span class="session-time">${formatMinutes(summaryMinutes)}</span><span><strong>${t("summary")}</strong><br>${t("summaryDescription")}</span></li>
      </ol>
      ${resource ? `<p class="daily-resource">${t("suggestedResource")} ${renderResourceLink(resource)}</p>` : ""}
    </article>`;
}

function setScheduleView(view) {
  const isWeekly = view === "weekly";
  weeklyScheduleEl.hidden = !isWeekly;
  dailyScheduleEl.hidden = isWeekly;
  weeklyTab.classList.toggle("active", isWeekly);
  dailyTab.classList.toggle("active", !isWeekly);
  weeklyTab.setAttribute("aria-selected", String(isWeekly));
  dailyTab.setAttribute("aria-selected", String(!isWeekly));
}

// -------------------------------------------------------
// Copy Roadmap
// -------------------------------------------------------
async function copyRoadmap() {
  const text = timelineEl.innerText || timelineEl.textContent;
  const scheduleText = weeklyScheduleListEl.innerText || weeklyScheduleListEl.textContent;
  const fullText = `${titleEl.textContent}\n\n${descriptionEl.textContent}\n\n${t("totalDuration")} ${durationEl.textContent}\n\n${text}\n\n${t("scheduleTitle")}\n${scheduleText}`;

  try {
    await navigator.clipboard.writeText(fullText);
    showToast(t("copySuccess"));
  } catch {
    showToast(t("copyFailure"));
  }
}

// -------------------------------------------------------
// Main Generate Function
// -------------------------------------------------------
function saveApiKey(key) {
  const trimmedKey = (key || "").trim();

  if (!trimmedKey) {
    return false;
  }

  API_KEY = trimmedKey;

  try {
    localStorage.setItem(STORAGE_KEY, API_KEY);
  } catch {
    // Ignore storage errors; the app still works for the current session.
  }

  if (apiKeyInput) apiKeyInput.value = API_KEY;
  return true;
}

function ensureApiKey() {
  if (API_KEY) return true;

  const enteredKey = apiKeyInput ? apiKeyInput.value.trim() : "";

  if (enteredKey && saveApiKey(enteredKey)) {
    return true;
  }

  if (apiKeyInput) {
    apiKeyInput.focus();
  }

  showError(t("missingKey"));
  return false;
}

async function generateRoadmap() {
  const specialization = inputEl.value.trim();

  // Validate input
  if (!specialization) {
    showError(t("missingSpecialization"));
    inputEl.focus();
    return;
  }

  if (!ensureApiKey()) {
    return;
  }

  // Reset UI
  hideError();
  resultsEl.setAttribute("hidden", "");
  showLoading();
  generateBtn.disabled = true;

  try {
    saveCustomGoals();
    const roadmapData = await callGeminiAPI(specialization);
    renderRoadmap(roadmapData);
  } catch (err) {
    showError(err.message || t("unexpectedError"));
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

if (saveKeyBtn) {
  saveKeyBtn.addEventListener("click", () => {
    const key = apiKeyInput ? apiKeyInput.value : "";
    if (saveApiKey(key)) {
      hideError();
      showToast(t("savedKey"));
    } else {
      showError(t("emptyKey"));
    }
  });
}

if (apiKeyInput) {
  apiKeyInput.addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      saveKeyBtn?.click();
    }
  });
}

if (goalsInput) {
  goalsInput.addEventListener("input", saveCustomGoals);
}

if (goalsClearBtn) {
  goalsClearBtn.addEventListener("click", () => {
    if (goalsInput) {
      goalsInput.value = "";
      saveCustomGoals();
      goalsInput.focus();
    }
  });
}

weeklyTab.addEventListener("click", () => setScheduleView("weekly"));
dailyTab.addEventListener("click", () => setScheduleView("daily"));
timelineEl.addEventListener("change", (event) => {
  const checkbox = event.target.closest(".topic-completion-checkbox");
  if (checkbox) saveTopicProgress(checkbox);
});
languageToggle.addEventListener("click", () => {
  LANGUAGE = LANGUAGE === "ar" ? "en" : "ar";
  try {
    localStorage.setItem(LANGUAGE_STORAGE_KEY, LANGUAGE);
  } catch {
    showError(LANGUAGE === "en"
      ? "Language preference could not be saved in this browser."
      : "تعذّر حفظ تفضيل اللغة في هذا المتصفح.");
  }
  applyLanguage();
});
scheduleDaySelect.addEventListener("change", () => {
  renderDailySchedule(Number(scheduleDaySelect.value));
});
scheduleSettingsEl.addEventListener("change", (event) => {
  if (!currentRoadmapData) return;

  const settings = getCurrentScheduleSettings();
  if (settings.studyDays.length === 0) {
    event.target.checked = true;
    showError(t("noStudyDay"));
    return;
  }

  if (
    errorTextEl.textContent === TRANSLATIONS.ar.noStudyDay
    || errorTextEl.textContent === TRANSLATIONS.en.noStudyDay
  ) {
    hideError();
  }
  saveScheduleSettings(settings);
  renderStudySchedule(currentRoadmapData.phases || [], settings);
});

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
document.addEventListener("click", (event) => {
  const target = event.target;
  if (!(target instanceof Element)) return;
  const saveButton = target.closest(".resource-save-btn");
  if (saveButton) {
    toggleSavedResource(saveButton);
    return;
  }
  const removeButton = target.closest(".saved-resource-remove-btn");
  if (removeButton) removeSavedResource(removeButton);
});

applyLanguage();
