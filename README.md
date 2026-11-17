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
1. افتح الموقع وأدخل المفتاح في حقل **مفتاح Gemini API**
2. اضغط **حفظ المفتاح**؛ سيُحفظ محلياً في متصفحك

### كيفية تشغيل الموقع
افتح ملف `index.html` مباشرةً في أي متصفح حديث (Chrome, Firefox, Edge). لا حاجة لخادم أو برامج إضافية.

### تبديل اللغة
استخدم زر **English / العربية** في أعلى الصفحة لتغيير لغة الواجهة وحفظ اختيارك في المتصفح. تُولّد الخارطة الجديدة باللغة المحددة، ويُعرض جدول الدراسة وواجهة الصفحة بهذه اللغة. إذا بدّلت اللغة بعد توليد الخارطة، أعد توليدها لتظهر محتويات الخارطة نفسها باللغة الجديدة.

### جدول الدراسة
بعد توليد الخارطة، يمكنك اختيار أيام الدراسة ومدة الجلسة من الإعدادات. يُعاد توزيع موضوعات المرحلة الأولى تلقائياً، ويتكيّف تقسيم الجلسة اليومية مع المدة المختارة. تُحفظ الإعدادات محلياً لكل تخصص. بدّل بين العرضين الأسبوعي واليومي لرؤية الجدول والتفاصيل.

### متابعة التقدم
ضع علامة على الموضوع عند إنجازه لمتابعة النسبة الإجمالية ونسبة كل مرحلة. يُحفظ التقدم محلياً في المتصفح لكل تخصص ولغة، ولا يُرسل إلى Gemini.

### مصادر التعلم
تظهر المصادر كروابط تُفتح في تبويب جديد. يطلب التطبيق من Gemini روابط مباشرة لمصادر موثوقة، لكن الروابط المقترحة مولّدة آلياً ويجب التحقق من دقتها. إذا لم يتوفر رابط صالح، ينشئ التطبيق رابط بحث عن اسم المصدر بدلاً من فتح عنوان غير آمن.

### حفظ المصادر
اضغط زر الحفظ بجانب أي مصدر لإضافته إلى قائمة المصادر المحفوظة أعلى النتائج. تبقى القائمة متاحة بعد تحديث الصفحة وتُحفظ محلياً في المتصفح، ويمكن إزالة أي مصدر منها لاحقاً.

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
A browser-based single-page web app. Enter your field of specialization (e.g. Web Development, Data Science, Cybersecurity) and Google Gemini AI will generate a structured, phase-by-phase learning roadmap including topics, resources, and estimated durations in the selected language.

### How to get a free Gemini API key
1. Go to [Google AI Studio](https://aistudio.google.com/)
2. Sign in with a Google account
3. Click **Get API Key** → **Create API Key**
4. Copy the key

### How to add your API key
1. Open the site and enter your key in the **Gemini API key** field
2. Click **Save key**; it will be stored locally in your browser

### How to run the site
Open `index.html` directly in any modern browser (Chrome, Firefox, Edge). No server or build tools required.

### Switching languages
Use the **English / العربية** button at the top of the page to change the interface language; your choice is saved in the browser. New roadmaps are generated in the selected language, and the study schedule and page interface follow it. If you switch languages after generating a roadmap, generate it again to receive its content in the new language.

### Study schedule
After generating a roadmap, choose your study days and session length in the schedule settings. Topics from the first phase are automatically redistributed, and the daily session breakdown adapts to your selected duration. Settings are saved locally for each specialization. Switch between weekly and daily views to see the schedule and session details.

### Progress tracking
Check off a topic when you complete it to track overall and per-phase progress. Progress is stored locally in your browser for each specialization and language; it is not sent to Gemini.

### Learning resources
Resources appear as links that open in a new tab. The app asks Gemini for direct links to reliable sources, but AI-generated links should be verified. If a valid URL is unavailable, the app links to a search for the resource name instead of opening an unsafe address.

### Saving resources
Select the save button beside a resource to add it to the saved resources list above the results. The list remains available after refreshing the page, is stored locally in your browser, and lets you remove saved resources later.

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
- Google Gemini 3.8 Flash API, with automatic Gemini 3.7 Flash fallback during temporary overload
- Google Fonts: Tajawal (Arabic) + Inter (English)
- Arabic RTL and English LTR, responsive design
