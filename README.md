# مولّد خارطة الطريق بالذكاء الاصطناعي
# AI-Powered Learning Roadmap Generator

---

## 🇸🇦 العربية

### ما هو المشروع؟
تطبيق ويب يعمل في المتصفح مباشرةً. أدخل اسم تخصصك (مثل: تطوير الويب، علم البيانات، الأمن السيبراني) وسيقوم الذكاء الاصطناعي (Google Gemini) بتوليد خارطة طريق تعليمية شاملة ومنظّمة على شكل مراحل متسلسلة، تشمل المواضيع والمصادر والمدة الزمنية المقدّرة.

### كيفية الحصول على مفتاح Gemini API مجانًا
1. اذهب إلى [Google AI Studio](https://aistudio.google.com/)
2. سجّل الدخول بحساب Google
3. اضغط على **Get API Key** ثم **Create API Key**
4. انسخ المفتاح

### كيفية إضافة مفتاح API
1. افتح ملف `app.js`
2. ابحث عن السطر:
   ```js
   const API_KEY = "YOUR_GEMINI_API_KEY";
   ```
3. استبدل `YOUR_GEMINI_API_KEY` بمفتاحك الحقيقي:
   ```js
   const API_KEY = "AIzaSy...مفتاحك هنا...";
   ```
4. احفظ الملف

### كيفية تشغيل الموقع
افتح ملف `index.html` مباشرةً في أي متصفح حديث (Chrome, Firefox, Edge). لا حاجة لخادم أو برامج إضافية.

### هيكل الملفات
```
Joo/
├── index.html   — صفحة HTML الرئيسية
├── style.css    — التنسيق والمظهر
├── app.js       — منطق التطبيق والاتصال بـ Gemini API
└── README.md    — هذا الملف
```

---

## 🇬🇧 English

### What is this project?
A browser-based single-page web app. Enter your field of specialization (e.g. Web Development, Data Science, Cybersecurity) and Google Gemini AI will generate a structured, phase-by-phase learning roadmap including topics, resources, and estimated durations — all in Arabic.

### How to get a free Gemini API key
1. Go to [Google AI Studio](https://aistudio.google.com/)
2. Sign in with a Google account
3. Click **Get API Key** → **Create API Key**
4. Copy the key

### How to add your API key
1. Open `app.js`
2. Find this line:
   ```js
   const API_KEY = "YOUR_GEMINI_API_KEY";
   ```
3. Replace `YOUR_GEMINI_API_KEY` with your actual key:
   ```js
   const API_KEY = "AIzaSy...your-key-here...";
   ```
4. Save the file

### How to run the site
Open `index.html` directly in any modern browser (Chrome, Firefox, Edge). No server or build tools required.

### File Structure
```
Joo/
├── index.html   — Main HTML page
├── style.css    — Styles and visual design
├── app.js       — Application logic + Gemini API integration
└── README.md    — This file
```

---

## ⚙️ Tech Stack
- Pure HTML / CSS / JavaScript (no framework, no build step)
- Google Gemini 1.5 Flash API
- Google Fonts: Tajawal (Arabic) + Inter (English)
- Fully RTL and responsive design
