# CampusConnect (Vite + React 19)

## What this zip contains
- Vite-based React app scaffold using **React 19**.
- Pages: Home, Events (with filters/search), Event Detail, Gallery, Contact, About, Feedback (UI), Registration (static).
- Bookmarking using `localStorage`.
- JSON data in `public/data/*.json` — no backend required.

## Run locally
1. Extract the zip.
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start dev server:
   ```bash
   npm run dev
   ```
4. Open the URL shown by Vite (usually http://localhost:5173).

## Notes
- JSON files are in `public/data/` so they can be fetched via `/data/*.json`.
- Add images to `public/assets/images/` and update JSON paths.
- This is a starter app; expand UI/UX and accessibility as needed for the TechWiz competition.
