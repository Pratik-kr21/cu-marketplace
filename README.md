# 🎓 CU Marketplace

An exclusive, highly secure, and feature-rich campus marketplace application built specifically for Chandigarh University students. Designed to facilitate buying, selling, and bartering of items securely within the university ecosystem.

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
- **Push Notifications (PWA):** Built as a Progressive Web Application. Features service-worker integrations for web-push notifications to alert users of messages and trade updates.
- **Responsive UI:** A beautifully crafted, mobile-first interface built utilizing Vite, React, and Tailwind CSS.

---

## 🛠️ Technology Stack

**Frontend:**
- React.js
- Vite
- Tailwind CSS (with Lucide React Icons)
- Zustand (State Management)
- Vite PWA Plugin

**Backend:**
- Node.js
- Express.js
- MongoDB Atlas (via Mongoose)
- Nodemailer (Email Delivery)
- JWT (Authentication)

---

## ⚙️ Prerequisites

Before you begin, ensure you have the following installed on your machine:
- [Node.js](https://nodejs.org/) (v16.0 or higher)
- [MongoDB Atlas](https://www.mongodb.com/atlas/database) account (or a local MongoDB instance)
- A Google Account (for configuring Gmail SMTP sending)

---

## 💻 Local Setup & Installation

### 1. Clone & Install Dependencies
First, install the frontend dependencies:
```bash
npm install
```

Then, navigate to the backend directory and install the server dependencies:
```bash
cd server
npm install
```

### 2. Environment Variables configuration
You'll need to set up two `.env` files (one for the frontend, one for the backend).

**Frontend (`.env` or `.env.local` inside the root directory):**
```env
VITE_API_URL=http://localhost:4000
```

**Backend (`server/.env` inside the server directory):**
```env
PORT=4000
MONGODB_URI=mongodb+srv://<db_user>:<db_password>@<cluster>.mongodb.net/<app-name>?retryWrites=true&w=majority
JWT_SECRET=your_super_secret_jwt_key

# Frontend URL for CORS and Email Links
VITE_FRONTEND_URL=http://localhost:5173

# Gmail SMTP Strategy (Nodemailer)
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_16_character_app_password
```

### 3. Setting up Gmail Verification (App Passwords)
To allow the server to successfully dispatch verification emails:
1. Log into your Google Account.
2. Navigate to **Security** and ensure **2-Step Verification** is turned ON.
3. Search for **App passwords** in your Google Account settings.
4. Generate a new App Password (e.g., "Node Mailer App").
5. Copy the exact 16-character code (remove spaces) and paste it into your `server/.env` file as `EMAIL_PASS`.

*(Note: If the `EMAIL_PASS` is missing during local development, the backend terminal is configured to catch the mail delivery and actively print a mock "Developer Bypass Link" so you can still verify accounts without spamming real inboxes).*

### 4. Running the Application

**Start the Backend Server:**
Open a new terminal window:
```bash
cd server
npm run dev
```

**Start the Frontend Vite Server:**
Open a second terminal window:
```bash
npm run dev
```

The application should now be running on `http://localhost:5173`!

---

## 🏗️ Architecture & Security Notes

- **Database Tokens:** When an email verification token is generated during signup, the raw token is completely discarded by the database. Only a strict `SHA-256` hashed version of the token is saved to MongoDB. The 1-hour expiration timestamp is handled inherently by Mongoose logic.
- **Rate-Limiting:** The Express backend implements `express-rate-limit` to prevent brute-force abuse of the `/signup`, `/login`, and `/resend-verification` endpoints. Specific logic inside the resend controller limits users to strictly 3 verification attempts per hour.
- **Push Buffer Fix:** To prevent infinite loading spinners on the Notification Bell when a service worker fails to mount (like in Incognito mode), the push utility leverages safe `getRegistration()` probing instead of hard-locking UI states.

---

## 📂 Folder Structure

```text
cu-marketplace/
├── public/                 # PWA Manifests and Favicons
├── src/                    # React Frontend
│   ├── components/         # Reusable UI/Form elements
│   ├── lib/                # API Client and Push Notification Utilities
│   ├── pages/              # Main Route Views (Signup, Home, Market, Chat)
│   └── store/              # Zustand State (Auth flow)
│
└── server/                 # Express Backend
    ├── config/             # DB Connection Logic
    ├── controllers/        # Business Logic (Auth, Trades, Items)
    ├── middleware/         # JWT parsing and Route Protection
    ├── models/             # Mongoose Schemas (User, Item, Trade)
    ├── routes/             # REST API Express endpoints
    ├── uploads/            # Local Asset storage for Item Images
    └── utils/              # Cryptography and Nodemailer instances
```
