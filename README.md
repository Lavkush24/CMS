# 🚀 Coaching Manager SaaS Platform

A modern, full-stack SaaS application designed to help coaching institutes manage students, teachers, batches, and revenue analytics — all in one place.

---

## 📌 Overview

Coaching Manager is a multi-tenant web application where each coaching institute can:

* Manage students, teachers, and batches
* Track revenue and teacher earnings
* View analytics dashboards
* Store data securely using Google Sheets
* Upgrade to premium features

---

## 🧠 Core Idea

Each user (coaching owner) gets:

* 🔐 Secure login via Google OAuth
* 📊 Dedicated Google Sheet for data storage
* 📈 Personalized dashboard and analytics

This makes the system lightweight, scalable, and cost-efficient.

---

## 🏗️ Tech Stack

### Frontend

* React (Vite)
* React Router
* Recharts (charts & analytics)
* Custom CSS (modern UI)

### Backend

* Node.js + Express
* MongoDB Atlas (user & auth storage)
* Google OAuth 2.0
* JWT Authentication

### Database Strategy

* MongoDB → User + auth + plan
* Google Sheets → App data (students, teachers, batches)

---

## 🔐 Authentication Flow

1. User clicks **Login with Google**
2. Redirect to Google OAuth
3. Backend receives callback
4. JWT token generated
5. Redirect to frontend with token
6. Frontend stores token in localStorage
7. Protected routes unlock

---

## 📊 Features

### 👨‍🎓 Student Management

* Add, update, and search students
* Assign students to batches
* Track fees

### 👨‍🏫 Teacher Management

* Add teachers with subject & rate
* Calculate earnings automatically

### 🧩 Batch Management

* Create batches
* Assign teachers
* Manage structure

### 📈 Dashboard Analytics

* Total students & teachers
* Total revenue
* Top-performing teacher
* Visual charts

---

## 💰 Premium System

The app uses a subscription-based model:

| Feature            | Free | Pro |
| ------------------ | ---- | --- |
| Student Management | ✅    | ✅   |
| Teacher Management | ✅    | ✅   |
| Revenue Analytics  | ❌    | ✅   |
| Charts & Insights  | ❌    | ✅   |

### Flow:

* Premium APIs return `403`
* Frontend shows upgrade modal
* User upgrades → features unlocked

---

## 🌐 Deployment

### Frontend

* Hosted on Vercel

### Backend

* Hosted on Render

### Database

* MongoDB Atlas

---

## ⚙️ Environment Variables

### Backend (`.env`)

```
PORT=3000
JWT_SECRET=your_secret

MONGO_URI=your_mongodb_uri

GOOGLE_CLIENT_ID=your_client_id
GOOGLE_CLIENT_SECRET=your_client_secret
GOOGLE_CALLBACK_URL=your_backend_url/oauth2callback

FRONTEND_URL=your_frontend_url
```

---

### Frontend (`.env`)

```
VITE_API_URL=your_backend_url
```

---

## 🚀 Local Setup

### 1. Clone repo

```
git clone <repo-url>
```

---

### 2. Backend setup

```
cd backend
npm install
npm run dev
```

---

### 3. Frontend setup

```
cd frontend
npm install
npm run dev
```

---

## 🔄 OAuth Configuration

In Google Cloud Console:

### Authorized Redirect URIs:

```
http://localhost:3000/oauth2callback
https://your-backend.onrender.com/oauth2callback
```

### Authorized Origins:

```
http://localhost:5173
https://your-frontend.vercel.app
```

---

## ⚠️ Important Notes

* `.env` is not committed (security)
* Google credentials must be configured correctly
* Vercel requires SPA rewrite (`vercel.json`)
* Backend must allow CORS for frontend domain

---

## 🧠 Architecture

```
Frontend (Vercel)
↓
Backend API (Render)
↓
MongoDB Atlas (users)
↓
Google Sheets (app data)
```

---

## 🔥 Key Highlights

* Multi-user SaaS architecture
* Google Sheets as dynamic database
* JWT-based authentication
* Premium feature gating
* Production deployment

---

## 🚀 Future Improvements

* Payment integration (Razorpay/Stripe)
* Fee reminders & notifications
* Multi-admin support
* Mobile app
* Advanced analytics

---

## 👨‍💻 Author

Built as a full-stack SaaS project focusing on real-world architecture, scalability, and monetization.

---

## 📄 License

This project is for educational and demonstration purposes.
