# HealSync — Hospital Management System

<div align="center">

![HealSync](https://img.shields.io/badge/HealSync-Synchronised%20Healthcare-2563eb?style=for-the-badge&logo=heart&logoColor=white)

[![Live Demo](https://img.shields.io/badge/🌐%20Live%20Demo-heal--sync--ivory.vercel.app-22c55e?style=for-the-badge)](https://heal-sync-ivory.vercel.app)
[![Backend](https://img.shields.io/badge/⚙️%20Backend%20API-healsync--vsui.onrender.com-f97316?style=for-the-badge)](https://healsync-vsui.onrender.com)
[![GitHub](https://img.shields.io/badge/GitHub-harshit--ag5965%2FHealSync-181717?style=for-the-badge&logo=github)](https://github.com/harshit-ag5965/HealSync)

![React](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=black)
![Node.js](https://img.shields.io/badge/Node.js-Express%20v5-339933?logo=node.js&logoColor=white)
![MongoDB](https://img.shields.io/badge/MongoDB-Mongoose-47A248?logo=mongodb&logoColor=white)
![TailwindCSS](https://img.shields.io/badge/TailwindCSS-v3-06B6D4?logo=tailwindcss&logoColor=white)
![Vercel](https://img.shields.io/badge/Frontend-Vercel-000000?logo=vercel)
![Render](https://img.shields.io/badge/Backend-Render-46E3B7?logo=render&logoColor=black)

</div>

---

A full-stack **Hospital Management System** with role-based dashboards for **Admins**, **Doctors**, and **Patients**. Built with React on the frontend and Node.js + Express + MongoDB on the backend — deployed on Vercel + Render.

---

## 🌐 Live Demo

| Service | URL |
|---|---|
| 🖥️ Frontend | [heal-sync-ivory.vercel.app](https://heal-sync-ivory.vercel.app) |

---

## ✨ Features

### 👤 Authentication
- JWT-based login & registration
- Role-based access control (Admin / Doctor / Patient)
- Forgot password & reset password via email (Nodemailer)
- Protected routes on both frontend and backend

### 🧑‍⚕️ Admin Dashboard
- Manage all users (view, delete)
- View & manage doctors and patients
- Oversee all appointments
- Billing management
- In-app notification system

### 👨‍⚕️ Doctor Dashboard
- View assigned appointments
- Manage patient medical records
- Update appointment status
- Receive appointment reminders

### 🧑‍💼 Patient Dashboard
- Book & manage appointments
- View medical history & records
- View billing information
- Real-time notifications

### ⚙️ Other
- Automated appointment reminders via **node-cron**
- File/image uploads via **Cloudinary**
- Charts & analytics with **Recharts**
- Dark mode support
- Notification bell with polling (30s interval)

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 19, React Router v7, TailwindCSS v3 |
| Charts | Recharts |
| HTTP Client | Axios |
| Notifications | React Hot Toast |
| Backend | Node.js, Express v5 |
| Database | MongoDB (Mongoose) |
| Auth | JWT, bcryptjs |
| File Uploads | Multer + Cloudinary |
| Email | Nodemailer |
| Scheduler | node-cron |
| Frontend Hosting | Vercel |
| Backend Hosting | Render |

---

## 📁 Project Structure

```
Hospital-Management-System/
├── Backend/
│   ├── src/
│   │   ├── config/         # DB connection
│   │   ├── controllers/    # Route logic (auth, appointments, doctors, etc.)
│   │   ├── middleware/     # JWT auth + role guards
│   │   ├── models/         # Mongoose schemas
│   │   ├── routes/         # Express routers
│   │   ├── utils/          # Cloudinary, email, cron scheduler
│   │   └── server.js       # App entry point
│   ├── .env.example        # Environment variable template
│   └── package.json
└── frontend/
    ├── src/
    │   ├── components/     # Shared UI components (Navbar, NotificationBell, Logo, etc.)
    │   ├── hooks/          # Custom React hooks (useDarkMode)
    │   ├── pages/          # Route-level page components
    │   ├── api.js          # Base URL config (reads REACT_APP_API_URL)
    │   ├── App.js
    │   └── index.js
    └── package.json
```

---

## 🚀 Getting Started (Local Development)

### Prerequisites
- Node.js v18+
- MongoDB Atlas account (or local MongoDB)
- Cloudinary account
- Gmail account with an App Password

---

### 1. Clone the repository

```bash
git clone https://github.com/harshit-ag5965/HealSync.git
cd HealSync
```

---

### 2. Set up the Backend

```bash
cd Backend
npm install
```

Create your `.env` file from the template:

```bash
cp .env.example .env
```

Fill in the values in `.env`:

```env
PORT=5000
FRONTEND_URL=http://localhost:3000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_strong_random_secret
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_gmail_app_password
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

> 💡 Generate a strong JWT secret:
> ```bash
> node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
> ```

Start the backend:

```bash
npm run dev    # development (nodemon, hot reload)
npm start      # production
```

Backend runs on: `http://localhost:5000`

---

### 3. Set up the Frontend

```bash
cd frontend
npm install
```

Create a `.env` file in the `frontend/` folder:

```env
REACT_APP_API_URL=http://localhost:5000
```

Start the frontend:

```bash
npm start
```

Frontend runs on: `http://localhost:3000`

---

## ☁️ Deployment

### Frontend — Vercel

1. Push the repo to GitHub
2. Import the project on [vercel.com](https://vercel.com)
3. Set **Root Directory** to `frontend`
4. Add environment variable:
   - `REACT_APP_API_URL` = `https://your-render-backend-url.onrender.com`
5. Deploy

### Backend — Render

1. Create a new **Web Service** on [render.com](https://render.com)
2. Connect the GitHub repo
3. Set **Root Directory** to `Backend`
4. Set **Start Command** to `npm start`
5. Add all environment variables from `.env.example`
6. Set `FRONTEND_URL` = `https://your-vercel-app.vercel.app`

---

## 🔌 API Overview

| Method | Endpoint | Access | Description |
|---|---|---|---|
| POST | `/api/auth/register` | Public | Register a new user |
| POST | `/api/auth/login` | Public | Login |
| POST | `/api/auth/forgot-password` | Public | Send reset email |
| POST | `/api/auth/reset-password/:token` | Public | Reset password |
| GET | `/api/auth/users` | Admin | List all users |
| DELETE | `/api/auth/users/:id` | Admin | Delete a user |
| GET | `/api/appointments` | Protected | View appointments |
| POST | `/api/appointments` | Protected | Book appointment |
| PUT | `/api/appointments/:id` | Protected | Update appointment |
| GET | `/api/doctors` | Protected | List doctors |
| GET | `/api/patients` | Protected | List patients |
| GET | `/api/bills` | Protected | View bills |
| GET | `/api/medical-records` | Protected | View medical records |
| GET | `/api/notifications` | Protected | View notifications |
| PUT | `/api/notifications/:id/read` | Protected | Mark notification as read |
| PUT | `/api/notifications/mark-all-read` | Protected | Mark all as read |

---

## 🔒 Security Notes

- All sensitive credentials are stored in `.env` (never committed to git)
- JWT tokens are verified on every protected request
- Role-based middleware (`adminOnly`, `doctorOnly`) guards sensitive routes
- Passwords are hashed with **bcryptjs**
- CORS is restricted to trusted frontend origins only

---

## 📄 License

This project is for educational purposes.
