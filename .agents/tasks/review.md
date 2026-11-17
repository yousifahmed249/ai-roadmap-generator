# AI Roadmap Generator — Static Frontend

A single-page Arabic-RTL web app that takes a specialization name, calls the Gemini 1.5 Flash API, and renders a phased learning roadmap. The app is structurally complete: all required DOM IDs are present, the API call is correctly shaped, and the rendering pipeline is wired end-to-end. The main watch items are the API key living in plain JS source and a minor CSS variable mismatch on milestone card coloring.

**Watch for:**
- API key hardcoded in `app.js` (confirmed) — anyone who opens DevTools or reads the source file gets the key.
- `--card-color-rgb` CSS variable used in `.milestone-box` gradient is never set (confirmed) — the milestone gradient silently falls back to a hardcoded `6, 182, 212` string in the rule itself, so it always renders cyan regardless of the phase color.
- `defer` on the `<script>` tag means DOM queries at module scope run before the element IDs are guaranteed to exist in some edge-case load orders — low-risk but worth confirming (likely safe given `defer` fires after parsing).

**Verdict**: APPROVED

---

## High-level view

All twelve required IDs (`specialization-input`, `generate-btn`, `loading`, `error-message`, `results`, `roadmap-title`, `roadmap-description`, `total-duration`, `timeline`, `copy-btn`, `print-btn`, plus `toast`) are present in `index.html` and referenced by exact ID in `app.js`. The DOM queries run at module scope on a `defer`-loaded script, which is fine — `defer` guarantees the full HTML is parsed before the script executes.

The Gemini call is a POST to the v1beta `gemini-1.5-flash:generateContent` endpoint with a well-formed `contents[0].parts[0].text` body and a `generationConfig` block. Response parsing drills `candidates[0].content.parts[0].text`, strips accidental markdown fences with a regex, and wraps `JSON.parse` in a try/catch — all the standard failure modes are covered.

The API key is the single meaningful security concern. It lives as a plain string in `app.js`, which ships to the browser. Any visitor can extract it from DevTools. The placeholder check (`if (API_KEY === "YOUR_GEMINI_API_KEY")`) prevents a confusing error when the key hasn't been set, but once a real key is inserted the exposure is unconditional. For a production deployment this needs a backend proxy; for a personal/demo tool the risk is accepted.

The CSS milestone gradient references `--card-color-rgb` which is never defined. The `setProperty` call in JS sets `--card-color` (a hex value), not an RGB triplet. The fallback `6, 182, 212` hardcoded inside the rule means the gradient always uses cyan, ignoring the per-phase color. This is a cosmetic issue only.

---

<details>
<summary>Issues (2)</summary>

1. **API key in client-side source** — `API_KEY` is a plain string in `app.js` and ships to the browser. Any user with DevTools can read it. For anything beyond a local/demo use, move API calls to a backend proxy and keep the key server-side.

2. **`--card-color-rgb` never defined** — `.milestone-box` uses `rgba(var(--card-color-rgb, 6, 182, 212), 0.08)` but JS only sets `--card-color` (hex). The milestone gradient always renders cyan regardless of phase color. Fix by either setting `--card-color-rgb` alongside `--card-color` in `createPhaseCard`, or rewrite the gradient to use a solid `rgba` derived from `--card-color` with `color-mix()`.

</details>

<details>
<summary>Details</summary>

### Required ID completeness

Every ID listed in the checklist is present in `index.html` and looked up by exact string in `app.js`. The `errorEl.querySelector(".error-text")` lookup works because `.error-text` is a direct child of `#error-message`. No mismatches.

### Gemini API call shape

The request body matches the Gemini REST API spec: `contents` is an array with one object containing a `parts` array with a single `{text}` object. `generationConfig` sets `temperature` and `maxOutputTokens`. The endpoint uses the `?key=` query-param authentication pattern (not a Bearer header), which is the correct approach for the browser-side Gemini API. HTTP errors read `error.message` from the JSON body and fall through to a user-facing Arabic string.

### JSON parsing robustness

The prompt instructs the model to return only JSON with no fences. The response handler also strips ` ```json ` / ` ``` ` wrappers with a regex before calling `JSON.parse`, and catches parse failures with a user-readable error. The one unhandled case is a partial/truncated response hitting `maxOutputTokens: 4096` — the JSON would be cut mid-structure and the parse would fail, which is caught and surfaces the "retry" error message. Acceptable.

### API key exposure (confirmed)

`const API_KEY = "YOUR_GEMINI_API_KEY"` is at the top of `app.js`. Once replaced with a real key, the value is readable in any browser's source view or network tab. The placeholder guard is a good UX safeguard but provides no security once the key is live.

### `--card-color-rgb` mismatch (confirmed)

`createPhaseCard` calls:
```js
card.style.setProperty("--card-color", phase.color || "#06b6d4");
```
The CSS rule for `.milestone-box` uses:
```css
rgba(var(--card-color-rgb, 6, 182, 212), 0.08)
```
`--card-color-rgb` is never set anywhere. The default `6, 182, 212` is always used, so all milestone boxes render with the same cyan tint regardless of the phase's assigned color. Every other phase-color usage (`border-right`, `.phase-card::before`, `.phase-number`) correctly references `--card-color` and works as expected.

### Example chips wiring

`document.querySelectorAll(".chip")` runs after DOM parse (via `defer`). Each chip sets `inputEl.value = chip.dataset.value` then immediately calls `generateRoadmap()`. The `data-value` attributes in HTML match the displayed chip text exactly. The flow is correct.

### Rendering pipeline

`renderRoadmap` populates the three header elements (`titleEl`, `descriptionEl`, `durationEl`), clears `timelineEl.innerHTML`, iterates `data.phases`, and calls `createPhaseCard` for each. Cards use `article` elements with `animationDelay` staggered at `index * 0.15s`. `escapeHTML` is applied to every AI-provided string before insertion via `innerHTML`, which closes the XSS vector from untrusted model output. The `hidden` attribute pattern (set/remove via `setAttribute`/`removeAttribute`) is consistent and matches the `[hidden] { display: none !important }` CSS rule.

### CSS completeness

Dark theme, RTL layout (`direction: rtl`, `text-align: right` on body, right-side timeline line and card border), responsive breakpoints at 768px and 480px, print stylesheet, entry animations (`fadeInUp`, `gradientShift`, `spin`), and hover/focus states are all present. The `focus` style on the input uses a box-shadow ring — meets basic keyboard accessibility visibility. The `button { outline: none }` reset is slightly aggressive; it removes the native focus ring from all buttons without a CSS replacement, which is a minor accessibility concern for keyboard users on the chip buttons and export buttons.

### Test coverage

No tests. The app is a static HTML/JS file with no test harness. Not a blocking issue for this type of project but worth noting if the project grows.

</details>

---

<details>
<summary>File map</summary>

| File | What changed |
|------|-------------|
| `index.html` | Full page structure with all required IDs, RTL attributes, semantic sections |
| `style.css` | Complete dark-theme stylesheet with RTL, responsive, print, and animation rules |
| `app.js` | All application logic: API call, prompt builder, renderer, event wiring |
| `README.md` | Project documentation (not reviewed for functional correctness) |

Full diff: local files, no git diff available — reviewed from source directly.

</details>
