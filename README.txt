JINX AI SEARCH — PHONE-FRIENDLY STARTER
======================================

What this is
------------
A mobile-friendly AI search website prototype. With a Gemini API key, it can
generate answers and (when Google Search grounding is available for your key/
model/region) show source links. Without a key, the search button opens normal
Google web results.

IMPORTANT SECURITY NOTE
-----------------------
This is a learning prototype. The API key is used directly in the browser.
It is kept in JavaScript memory only (not saved in local storage), but browser
requests can still expose it to someone inspecting the session. Do not publish
this version as a public website or share your key. A public launch should use
a backend/serverless function to keep the API key secret.

START ON ANDROID
----------------
Option A — easiest: GitHub Pages (for the interface)
1. Download and unzip JINX_AI_Search.zip on your phone.
2. Open github.com in your browser and sign in/create an account.
3. Create a new repository named jinx-ai-search. You can make it public for
   hosting the frontend; do NOT add your API key to any file.
4. Upload index.html, style.css, app.js, and README.txt to the repository root.
5. In the repository, open Settings → Pages.
6. Under Build and deployment, choose Deploy from a branch.
7. Choose branch main and folder /(root), then Save.
8. Wait a little and open the Pages URL GitHub shows.

Option B — test locally
Open index.html using a code editor/preview app that supports local HTML.
Some mobile file viewers block network requests; if the AI request fails,
host the files with a static host such as GitHub Pages.

CONNECT AI
----------
1. Open Google AI Studio: https://aistudio.google.com/app/apikey
2. Sign in and create an API key. Review Google's current terms, quotas, and
   availability for your account/region.
3. Open your hosted JINX page and tap the ⚙ icon.
4. Paste the key and tap "Use key for this session".
5. Ask a question and tap Search. The key is not stored when you reload.

If Google Search grounding is not available for your API/model/account, turn
off "Use Google Search grounding when available" in settings. AI answers may
then be based on the model's knowledge and may not be current; use "Open more
web results" to verify current information.

COMMON ISSUES
-------------
- 400/403 error: check that the key is valid, API access is enabled, and your
  account can use the selected model and grounding feature.
- Quota error: review the current quota and billing details in AI Studio.
- Page opens but AI fails: make sure it is hosted on HTTPS and internet works.
- Do not commit API keys to GitHub or put them in app.js/index.html.

NEXT STEP FOR A REAL PUBLIC SEARCH ENGINE
-----------------------------------------
Before inviting other users, move Gemini calls into a server-side endpoint
(e.g. Cloudflare Worker or Firebase Cloud Function) and apply rate limits.
A true independent search engine additionally needs a crawler, a compliant
index, ranking, and significant infrastructure. This starter is the first
working prototype, not a full web crawler.
