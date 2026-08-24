# 🏥 Hospital Management System

A full-stack Hospital Management System with role-based dashboards for **Admins**, **Doctors**, and **Patients**. Built with React on the frontend and Node.js + Express + MongoDB on the backend.

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
    │   ├── components/     # Shared UI components
    │   ├── hooks/          # Custom React hooks (useDarkMode)
    │   ├── pages/          # Route-level page components
    │   ├── App.js
    │   └── index.js
    └── package.json
```

---

## 🚀 Getting Started

### Prerequisites
- Node.js v18+
- MongoDB Atlas account (or local MongoDB)
- Cloudinary account
- Gmail account with an App Password

---

### 1. Clone the repository

```bash
git clone https://github.com/your-username/Hospital-Management-System.git
cd Hospital-Management-System
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
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_strong_random_secret
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_gmail_app_password
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

> 💡 Generate a strong JWT secret: `node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"`

Start the backend:

```bash
npm run dev       # development (nodemon)
npm start         # production
```

Backend runs on: `http://localhost:5000`

---

### 3. Set up the Frontend

```bash
cd frontend
npm install
npm start
```

Frontend runs on: `http://localhost:3000`

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
| GET | `/api/doctors` | Protected | List doctors |
| GET | `/api/patients` | Protected | List patients |
| GET | `/api/bills` | Protected | View bills |
| GET | `/api/medical-records` | Protected | View medical records |
| GET | `/api/notifications` | Protected | View notifications |

---

## 🔒 Security Notes

- All sensitive credentials are stored in `.env` (never committed to git)
- JWT tokens are verified on every protected request
- Role-based middleware (`adminOnly`, `doctorOnly`) guards sensitive routes
- Passwords are hashed with **bcryptjs**

---

## 📄 License

This project is for educational purposes.