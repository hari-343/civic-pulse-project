# 🏙️ Civic Pulse: Transparent Civic Grievance & Infrastructure Triage

An AI-powered platform that turns citizen photos into prioritized, routed and publicly tracked civic complaints, and verifies every fix with before-and-after image checks.

Built for the **IDEA//FORGE Online Hackathon**, Track 1: Civic Pulse, Digital Governance & Public Information.

## ❗ Problem
Citizens report potholes, garbage, water leaks and blocked drains through slow, opaque channels. Complaints are duplicated, urgent hazards are not prioritized, and tickets can be marked "resolved" without proof.

## ✅ Solution
Citizens report with a photo, location and voice note. Gemini AI classifies the issue, scores its severity, routes it to the right department and drafts a formal complaint. A public map shows every complaint, and officers must upload an "after" photo that AI verifies before a ticket can be closed.

## ✨ Features
- **AI photo triage:** category, severity (1-10) with reason, department and SLA
- **Duplicate detection:** reports within 50 m are merged and priority rises
- **Multilingual voice input:** English, Tamil, Hindi (Web Speech API)
- **Public dashboard:** live map with red/yellow/green pins and KPI cards
- **AI fix verification:** before vs after comparison blocks false resolutions
- **Citizen and Officer views**
- **Spam filter:** non-civic images are rejected

## 🧰 Tech Stack
| Layer | Technology |
|---|---|
| Frontend | React (Vite), Tailwind CSS, React-Leaflet |
| Backend | Node.js, Express, Multer |
| Database | MongoDB Atlas (2dsphere geospatial index) |
| Media | Cloudinary |
| AI | Google Gemini 2.5 Flash |

## 🔄 How It Works
1. Citizen uploads a photo, location and optional voice note.
2. Gemini validates the image and returns category, severity, department and a formal complaint.
3. MongoDB checks for an open report of the same category within 50 m.
4. A new ticket is created, or the existing one is merged and boosted.
5. The map updates. The officer later uploads an "after" photo, AI audits it, and the ticket is closed only if verified.

## 🚀 Getting Started

### Prerequisites
Node.js 18+, a MongoDB Atlas cluster, a Gemini API key, and a Cloudinary account.

### Backend
```bash
cd server
npm install
cp .env.example .env     # fill in your keys
npm run seed             # optional demo data
npm run dev
```

### Frontend
```bash
cd client
npm install
cp .env.example .env
npm run dev
```
Open http://localhost:5173

### Environment variables (`server/.env`)
```
PORT=5000
CLIENT_URL=http://localhost:5173
MONGO_URI=your_mongodb_connection_string
GEMINI_API_KEY=your_gemini_api_key
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

## 📡 API
| Method | Endpoint | Purpose |
|---|---|---|
| POST | `/api/grievances` | Submit a report (photo + location) |
| GET | `/api/grievances` | List reports (filter by category, status) |
| PATCH | `/api/grievances/:id/status` | Update status |
| PATCH | `/api/grievances/:id/resolve` | Upload after-photo for AI verification |

## 📁 Project Structure
```
civic-pulse/
├── client/   # React + Tailwind + Leaflet dashboard
└── server/   # Express API, Gemini triage, MongoDB models
```

## 🔮 Future Scope
- WhatsApp/Telegram reporting bot
- More Indian languages and voice transcription
- Direct integration with municipal systems
- Officer authentication and analytics

## 📄 License
MIT
