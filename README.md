# Civic Pulse – AI Grievance & Infrastructure Triage

MERN + Gemini app: citizens upload a photo of a civic issue, Gemini classifies it,
scores severity, routes it to a department, merges duplicates within 50 m, and an
AI "before vs after" audit verifies fixes. Public Leaflet map dashboard.

## Run locally
### Backend
    cd server
    npm install
    cp .env.example .env     # fill MONGO_URI, GEMINI_API_KEY, Cloudinary keys
    npm run seed             # optional demo data
    npm run dev

### Frontend
    cd client
    npm install
    cp .env.example .env
    npm run dev              # http://localhost:5173

## Deploy
- Backend (Render): root `server`, build `npm install`, start `npm start`, add env vars.
- Frontend (Vercel): root `client`, build `npm run build`, output `dist`,
  set `VITE_API_URL=https://<your-render-url>/api`.
