# Coaching Manager — SaaS Platform

> A scalable, multi-tenant SaaS application for coaching institutes to manage students, teachers, batches, and revenue analytics — all in one system.

[![Frontend](cms.lawxkd.dev)](https://cms-six-rho.vercel.app)

---

## Overview

Each coaching institute using this platform can:

- Log in securely via **Google OAuth**
- Access **fully isolated data** (multi-tenant)
- Manage day-to-day operations efficiently
- Make **data-driven decisions** through analytics

---

## Project Evolution

The system was built iteratively across 5 phases, each solving a real problem.

### Phase 1 — Basic CRUD
Initial version with student, teacher, and batch management. No authentication, no isolation, MongoDB for everything.

**Problems:** No scalability, no user isolation, no analytics.

---

### Phase 2 — Authentication Layer
Integrated **Google OAuth 2.0** with **JWT-based** session management.

**Impact:** Secure login, multi-user support, SaaS foundation established.

---

### Phase 3 — Hybrid Database Architecture _(Major Upgrade)_

**Problem:** MongoDB handling all operational data was costly and rigid.

**Solution:**

| Layer | Storage |
|---|---|
| Users, Auth, Subscriptions | MongoDB Atlas |
| Students, Teachers, Batches | Google Sheets |

**Impact:** Reduced infrastructure cost, faster iteration, easier data management.

---

### Phase 4 — Analytics Dashboard
Added revenue tracking, teacher earnings, student/batch metrics, and visual charts via **Recharts**.

**Impact:** Coaching owners can now make data-driven decisions at a glance.

---

### Phase 5 — Premium Subscription System
Backend-enforced feature gating (`403 Forbidden`) with a frontend upgrade flow.

| Feature | Free | Pro |
|---|:---:|:---:|
| Student Management | ✅ | ✅ |
| Teacher Management | ✅ | ✅ |
| Revenue Analytics | ❌ | ✅ |
| Charts & Insights | ❌ | ✅ |

---

## Architecture

```
Client (React — Vercel)
        │
        ▼
Backend API (Node.js — Render)
        │
        ├──► MongoDB Atlas      (Auth, Users, Subscriptions)
        │
        └──► Google Sheets      (Students, Teachers, Batches)
```

### Key Engineering Decisions

**Hybrid Database** — MongoDB stores structured, secure data. Google Sheets handles flexible operational data, reducing cost and complexity.

**JWT Authentication** — Stateless tokens make the system horizontally scalable with no server-side session storage.

**Backend Feature Gating** — Subscription checks run server-side, preventing any client-side bypass and ensuring subscription integrity.

---

## Features

**Student Management** — Add, update, and search students. Assign to batches and track fee payments.

**Teacher Management** — Manage teachers with subject and hourly rate. Earnings are calculated automatically.

**Batch Management** — Create and configure batches, assign teachers, and monitor enrollment.

**Analytics Dashboard** — Revenue insights, teacher performance metrics, and visual charts — all in one view.

---

## Tech Stack

| Layer | Tech |
|---|---|
| Frontend | React (Vite), React Router, Recharts |
| Backend | Node.js, Express |
| Database | MongoDB Atlas |
| Operational Data | Google Sheets API |
| Auth | Google OAuth 2.0, JWT |
| Deployment | Vercel (frontend), Render (backend) |

---

## Authentication Flow

```
1. User clicks "Login with Google"
2. Redirected to Google OAuth consent screen
3. Backend handles the OAuth callback
4. JWT token is generated and returned
5. Frontend stores the token securely
6. Protected routes become accessible
```

---

## Local Setup

**1. Clone the repository**
```bash
git clone https://github.com/Lavkush24/CMS.git
cd coaching-manager
```

**2. Start the backend**
```bash
cd backend
npm install
npm start
```

**3. Start the frontend**
```bash
cd frontend
npm install
npm run dev
```

---

## Environment Variables

**Backend** (`.env`)
```env
PORT=3000
JWT_SECRET=your_secret
MONGO_URI=your_mongodb_uri
GOOGLE_CLIENT_ID=your_client_id
GOOGLE_CLIENT_SECRET=your_client_secret
GOOGLE_CALLBACK_URL=your_backend_url/oauth2callback
FRONTEND_URL=your_frontend_url
```

**Frontend** (`.env`)
```env
VITE_API_URL=your_backend_url
```

---

## OAuth Configuration

**Authorized Redirect URIs**
```
http://localhost:3000/oauth2callback
https://your-backend.onrender.com/oauth2callback
```

**Authorized JavaScript Origins**
```
http://localhost:5173
https://your-frontend.vercel.app
```

---

## Production Checklist

- [ ] Replace all placeholder links (`your-...`) with real URLs
- [ ] Configure CORS for your deployed domains
- [ ] Never commit `.env` files to version control
- [ ] Handle JWT token expiry on the frontend
- [ ] Verify OAuth redirect URIs match exactly in Google Console

---

## Roadmap

- [ ] Payment integration (Razorpay / Stripe)
- [ ] In-app notifications system
- [ ] Multi-admin support per institute
- [ ] Mobile app (React Native)
- [ ] Advanced analytics with date-range filtering

---

## Author

Built as a real-world SaaS system with focus on **architecture design**, **scalability**, and **monetization strategy**.

---

## License

For educational and demonstration purposes.