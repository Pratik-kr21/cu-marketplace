<div align="center">
  <img src="https://img.shields.io/badge/Vite-B73BFE?style=for-the-badge&logo=vite&logoColor=FFD62E" alt="Vite" />
  <img src="https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB" alt="React" />
  <img src="https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white" alt="Node" />
  <img src="https://img.shields.io/badge/Express.js-000000?style=for-the-badge&logo=express&logoColor=white" alt="Express" />
  <img src="https://img.shields.io/badge/MongoDB-4EA94B?style=for-the-badge&logo=mongodb&logoColor=white" alt="MongoDB" />
  <img src="https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white" alt="Tailwind" />
</div>

<h1 align="center">🎓 CU Marketplace</h1>

<p align="center">
  An exclusive, highly secure, and feature-rich campus marketplace application built specifically for <strong>Chandigarh University</strong> students. Designed to facilitate buying, selling, and bartering of items securely within the university ecosystem.
</p>

---

## 📑 Table of Contents

- [Features](#-features)
- [Technology Stack](#-technology-stack)
- [Architecture & Flow](#-architecture--flow)
- [Prerequisites](#-prerequisites)
- [Local Setup & Installation](#-local-setup--installation)
- [Environment Variables](#-environment-variables)
- [Project Structure](#-project-structure)
- [Future Enhancements / Roadmap](#-future-enhancements--roadmap)

---

## 🚀 Features

- **Exclusive Access:** Strict authentication ensuring only users with valid `@cuchd.in` emails can register and access the platform.
- **Secure Authentication:** Implementation of robust JWT (JSON Web Token) session validation and Bcrypt password hashing.
- **Real Email Verification:** Automated HTML email dispatch using **Nodemailer** bonded to Gmail's SMTP service.
- **Marketplace Listings:** 
  - Browse, filter, and search for products across categories (Electronics, Books, Vehicles, etc.).
  - Upload items with image handling via the Node.js API and local `server/uploads` storage.
- **Trade & Barter System:** Users can propose trades instead of purely cash transactions.
- **Real-time Chat:** Integrated messaging system to negotiate and communicate directly with sellers/buyers.
- **Push Notifications (PWA):** Built as a Progressive Web Application. Features service-worker integrations for web-push notifications to alert users of messages and trade updates. Includes safe probing fallback for environments like Incognito mode.
- **Responsive UI:** A beautifully crafted, mobile-first interface built utilizing Vite, React, and Tailwind CSS.
- **Form Validation:** Client-side validation powered by **Zod** and **React Hook Form**.

---

## 🛠️ Technology Stack

### Frontend Architecture
- **Framework:** React.js (v18)
- **Bundler:** Vite
- **Styling:** Tailwind CSS (with Lucide React Icons)
- **State Management:** Zustand
- **Forms & Validation:** React Hook Form + Zod
- **Routing:** React Router v6
- **PWA:** Vite PWA Plugin (`vite-plugin-pwa`)

### Backend Architecture
- **Runtime:** Node.js
- **Framework:** Express.js
- **Database:** MongoDB Atlas (via Mongoose ODM)
- **Mail Service:** Nodemailer (SMTP Delivery)
- **Authentication:** JWT (JSON Web Tokens)
- **Uploads:** Multer (Local Disk Storage)

---

## 🏗️ Architecture & Flow

### Runtime Flow
1. The **Frontend** authenticates and requests data from the backend using the configured `VITE_API_URL`.
2. The **Express Backend** receives API requests, validating JWTs via middleware (`Authorization: Bearer <token>`) for protected routes.
3. The **MongoDB Collections** manage the persistence of users, items, trades, conversations, messages, and push subscriptions.
4. Uploaded listing images are stored on local disk at `server/uploads` and seamlessly served dynamically through `/uploads/*` routes.

### Security Notes
- **Database Tokens:** Email verification tokens are generated dynamically during signup. The raw tokens are discarded by the database, and only a strict `SHA-256` hashed version is saved to MongoDB. A 1-hour expiration timestamp is handled inherently by Mongoose logic.
- **Rate-Limiting:** The Express backend implements `express-rate-limit` to prevent brute-force abuse of the `/signup`, `/login`, and `/resend-verification` endpoints (limited to 3 verification attempts per hour).
- **Graceful Fallbacks:** The Push Notification logic utilizes `getRegistration()` probing to avoid infinite spinners or UI deadlocks if Web Push Service Workers fail to mount (e.g., in unsupported or Incognito contexts).

---

## ⚙️ Prerequisites

Before you dive in, ensure you have the following installed on your machine:

1. **[Node.js](https://nodejs.org/)** (v16.0 or higher)
2. **[MongoDB Atlas](https://www.mongodb.com/atlas/database)** account (or a local MongoDB instance running locally)
3. **Google Account** (Required for configuring Gmail SMTP sending and generating an App Password)
4. **Git** for version control tracking

---

## 💻 Local Setup & Installation

Follow these steps to get a local copy up and running:

### 1. Clone the repository
```bash
git clone https://github.com/Pratik-kr21/cu-marketplace.git
cd cu-marketplace
```

### 2. Install Frontend Dependencies
```bash
npm install
```

### 3. Install Backend Dependencies
```bash
cd server
npm install
```

### 4. Running the Application

To run the application locally, you will need two separate terminal windows.

**Start the Backend Server (Terminal 1):**
```bash
cd server
npm run dev
```

**Start the Frontend Client (Terminal 2):**
```bash
# From the root "cu-marketplace" directory
npm run dev
```

Your frontend client should now be running precisely at `http://localhost:5173` while the backend runs at `http://localhost:4000`.

---

## 🔐 Environment Variables

You need two `.env` files to configure URLs and Secrets.

### Frontend (`.env` or `.env.local` inside the root directory)
```env
VITE_API_URL=http://localhost:4000
```

### Backend (`server/.env` inside the server directory)
```env
PORT=4000
MONGODB_URI=mongodb+srv://<db_user>:<db_password>@<cluster>.mongodb.net/<app-name>?retryWrites=true&w=majority
JWT_SECRET=your_super_secret_jwt_key

# Frontend URL for CORS and Email Links
VITE_FRONTEND_URL=http://localhost:5173

# Gmail SMTP Configuration (Nodemailer)
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_16_character_app_password
```

#### Configuring MongoDB
1. Create a free Atlas cluster at MongoDB.
2. Create a Database User and save the password.
3. Whitelist your IP in Atlas Network Access (use `0.0.0.0/0` for generic local development access).
4. Substitute the SRV URI to `MONGODB_URI`.

#### Setting up Gmail Verification (App Passwords)
To allow the server to successfully dispatch real verification emails:
1. Log into your Google Account dashboard.
2. Navigate to **Security** and ensure **2-Step Verification** is turned ON.
3. Search for **App passwords** in your Google Account settings.
4. Generate a new App Password (e.g., `Node Mailer App`).
5. Copy the exact 16-character code (remove spaces) and paste it into `server/.env` as `EMAIL_PASS`.

> 💡 **Developer Bypass:** If the `EMAIL_PASS` is missing or fails during local development, the backend terminal is engineered to catch the mail delivery attempt. It will print a fallback "Developer Bypass Link" to the active terminal, allowing local verifications without mailing real inboxes!

---

## 📂 Project Structure

```text
cu-marketplace/
├── public/                 # PWA Manifests and Favicons
├── src/                    # React Frontend
│   ├── components/         # Reusable UI/Form elements
│   ├── lib/                # API Client and Push Notification Utilities
│   ├── pages/              # Main Route Views (Signup, Home, Market, Chat)
│   └── store/              # Zustand State (Auth flow & Global Modals)
│
└── server/                 # Express Backend
    ├── config/             # DB Connection Logic
    ├── controllers/        # Business Logic (Auth, Trades, Items)
    ├── middleware/         # JWT parsing, Upload routing, Route Protection
    ├── models/             # Mongoose Entity Schemas (User, Item, Trade)
    ├── routes/             # REST API Express endpoints
    ├── uploads/            # Local disk storage for listing Images
    └── utils/              # Cryptography and Nodemailer instances
```

---

## 🌱 Future Enhancements / Roadmap

> Our current architecture successfully migrated from a Supabase monolithic to a custom Express + MongoDB decoupled infrastructure.

Here is what's on the roadmap:
- Add comprehensive input validation middleware on all API routes.
- Implement automated API End-to-End tests.
- Transition from local disk `multer` paths (`server/uploads`) to scalable cloud object storage (e.g., AWS S3, Cloudinary).
- Build production CORS allowlists for secure staging domains.
- Strengthen Express backend with global request logging (Morgan/Winston).
