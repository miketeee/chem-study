# Chem Study Hub

A static, self-grading study site for CHEM 1110, built the same way as the Micro Quiz Bank: a homepage
listing every homework by test, one generic quiz page, a Navigator, and a Practice Bank with Google Sheet sync.

## Publishing to GitHub Pages

1. Create a new repository on GitHub (public on the free tier).
2. Unzip this folder and push its **contents** (not the folder itself) to the repo root:
   ```
   git init
   git add .
   git commit -m "Chem study hub"
   git branch -M main
   git remote add origin https://github.com/<your-username>/<repo-name>.git
   git push -u origin main
   ```
3. On GitHub: **Settings → Pages** → under "Build and deployment," set **Source** to "Deploy from a branch," branch `main`, folder `/ (root)`. Save.
4. GitHub gives you a URL like `https://<your-username>.github.io/<repo-name>/` within a minute or two.
5. Connect your Google Sheet: see `drill/SHEET_SETUP.md`.

If you reuse the old quiz-site repo instead, delete everything in it first (including `.github/workflows/deploy.yml`),
then switch **Settings → Pages → Source** from "GitHub Actions" to "Deploy from a branch". No repo secrets are needed anymore.

## File structure

```
index.html            homepage: Navigator and Practice Bank cards, then every homework grouped by test
quiz/index.html       generic quiz runner (reads ?q=<slug> from the URL)
qa/index.html         study guide viewer (reads ?q=<slug>, loads data-qa/<slug>.html)
navigator/index.html  Chem Navigator: flowcharts, check-my-answer tools, naming and shapes drill (Test 2)
drill/index.html      Chem Practice Bank: every quiz question pooled, test/homework filters, misses, Sheet sync
drill/Code.gs         Apps Script for the Google Sheet (setup steps in drill/SHEET_SETUP.md)
assets/chem-core.js   question types and grading, Sheet connection, notes, Resources button
assets/quiz.js        quiz page logic (all questions on one page, resume where you left off)
assets/style.css      homepage, quiz and Q&A styles
assets/core.css       question, notes and Resources styles (shared by quiz and Practice Bank)
assets/*.png, *.jpg   periodic table (Resources) and the HW 09 lettered charts
data/manifest.json    the list of tests and homework; drives the homepage and the Practice Bank
data/<slug>.json      one file per quiz
data-qa/<slug>.html   study guide Q&A pages (none yet)
```

## Adding a homework (Test 1, Test 3, HW 10–12)

1. Add `data/<slug>.json` (for example `hw10.json`) with `slug`, `test` (`"T1"`, `"T2"` or `"T3"`), `title`, `subtitle`
   and `questions`. Give each question an `id` of `<slug>-qNN` that never changes; notes and scores are keyed to it.
2. Add the homework to that test's `items` in `data/manifest.json`.
3. That's it: the homepage, quiz page and Practice Bank all pick it up.

Question types: `single` (multiple choice), `multi` (select all that apply), `match` (dropdown per item), `calc`
(typed number, scientific notation ok, `tolerance` as a fraction) and `fill` (typed text per blank). Optional on any:
`given`, `tag`, `note`. The Resources list lives at the bottom of `assets/chem-core.js`.

## Local preview

From this folder: `python3 -m http.server 8000`, then open `http://localhost:8000`.
