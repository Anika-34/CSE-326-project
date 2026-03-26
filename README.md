# Trip.com Clone – Hotel Booking Web App

## 📌 Project Overview

This project is a full-stack hotel booking web application inspired by platforms like **Trip.com**. It enables users to search for hotels, view detailed information, check room availability, reserve rooms, and cancel booking through a clean and interactive interface.

The application is built using a modern **React + Express + PostgreSQL** stack and deployed using cloud platforms.

---

## 🚀 Tech Stack

### 🔹 Frontend

* React
* Bootstrap / CSS

### 🔹 Backend

* Node.js
* Express.js
* REST API Architecture

### 🔹 Database

* PostgreSQL

---

## ☁️ Deployment

| Layer    | Platform |
| -------- | -------- |
| Frontend | Netlify  |
| Backend  | Render   |
| Database | NeonDB   |

---

## 🔌 Backend API Endpoints

### 📍 Hotel Routes

| Method | Endpoint                | Description       |
| ------ | ----------------------- | ----------------- |
| GET    | `/v1/hotels/details/:hotelId`       | Get hotel details |
| GET    | `/v1/hotels/search?q=` | Search hotels     |

---

### 📍 Room Routes

| Method | Endpoint              | Description             |
| ------ | --------------------- | ----------------------- |
| GET    | `--` | Get rooms for a hotel   |
| GET    | `--`   | Check room availability |

---


## ⚙️ Installation & Setup

### 1️⃣ Clone Repository

```id="t0e6mc"
git clone https://github.com/Anika-34/CSE-326-project.git
cd CSE-326-project
```

---

### 2️⃣ Frontend Setup

```id="p2dcxr"
cd client
npm install
npm start
```

---

### 3️⃣ Backend Setup

```id="8rqqk1"
cd server
npm install
npm start
```

---

### 4️⃣ Database Setup

* Create a PostgreSQL database (NeonDB recommended)
* Import SQL schema from `/server/database.sql`
* Configure `.env` file

---

## 🔐 Environment Variables

Create a `.env` file inside the **server/** directory and add the following:

```env
PORT=5000
DB_USER=postgres
DB_HOST=localhost
DB_NAME="db_name"
DB_PASSWORD="password"
DB_PORT=5432

JWT_SECRET=your_jwt_secret
STRIPE_SECRET_KEY=your_stripe_secret_key

CORS_ORIGIN=http://localhost:3000
NODE_ENV=development
```

---

### ⚠️ Notes

* 🔑 **JWT_SECRET** → Use a strong secret key for authentication
* 💳 **STRIPE_SECRET_KEY** → Required for payment integration (leave empty if not used yet)
* 🌐 **CORS_ORIGIN** → Set this to your frontend URL:

  * Local: `http://localhost:3000`
  * Production: `https://tripdotcom.netlify.app`

---

### ☁️ Production Configuration

When deploying:

* On **Render (Backend)**:

  * Set all environment variables in Render dashboard
  * Change:

    ```env
    NODE_ENV=production
    ```

* If using **NeonDB**, replace DB config with:

```env
DATABASE_URL=your_neon_database_url
```

---

### 🔒 Security Reminder

* Never commit `.env` file to GitHub
* Add this to `.gitignore`:

```
.env
```

---

## 🌐 Live Demo

* Frontend: https://tripdotcom.netlify.app
* Backend: https://cse326-backend.onrender.com

---

## 📸 Screenshots

(screenshot add**)

* Home page
* Search results
* Hotel details page

---

## 👥 Team Members

* **Anika Morshed** (Student ID: 2105068)
* **Tanjeem Tousif** (Student ID: 2105071)
* **Diganta Saha Tirtha** (Student ID: 2105081)
* **Jahedul Islam Nayeem** (Student ID: 2105082)
* **Dibya Jyoti Sarkar** (Student ID: 2105084)

---

## 📜 License

This project is developed for academic purposes (CSE-326).

---

## 🙌 Acknowledgements

Inspired by modern travel platforms like Trip.com.

---
