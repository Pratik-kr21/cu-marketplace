<div align="center">

# 🎓 CU Market

### The Exclusive Campus Marketplace for Chandigarh University

Buy, sell, barter, and connect — all within your university ecosystem.

<br/>

<!-- Tech Stack Badges (Square Style) -->
<img src="https://img.shields.io/badge/React-20232A?style=flat-square&logo=react&logoColor=61DAFB" alt="React" />
<img src="https://img.shields.io/badge/Vite-646CFF?style=flat-square&logo=vite&logoColor=white" alt="Vite" />
<img src="https://img.shields.io/badge/Tailwind_CSS-06B6D4?style=flat-square&logo=tailwindcss&logoColor=white" alt="Tailwind CSS" />
<img src="https://img.shields.io/badge/Zustand-433E38?style=flat-square&logo=react&logoColor=white" alt="Zustand" />
<img src="https://img.shields.io/badge/React_Router-CA4245?style=flat-square&logo=reactrouter&logoColor=white" alt="React Router" />
<img src="https://img.shields.io/badge/Node.js-5FA04E?style=flat-square&logo=nodedotjs&logoColor=white" alt="Node.js" />
<img src="https://img.shields.io/badge/Express-000000?style=flat-square&logo=express&logoColor=white" alt="Express" />
<img src="https://img.shields.io/badge/MongoDB-47A248?style=flat-square&logo=mongodb&logoColor=white" alt="MongoDB" />
<img src="https://img.shields.io/badge/Mongoose-880000?style=flat-square&logo=mongoose&logoColor=white" alt="Mongoose" />
<img src="https://img.shields.io/badge/JWT-000000?style=flat-square&logo=jsonwebtokens&logoColor=white" alt="JWT" />
<img src="https://img.shields.io/badge/Cloudinary-3448C5?style=flat-square&logo=cloudinary&logoColor=white" alt="Cloudinary" />
<img src="https://img.shields.io/badge/Nodemailer-0F9DCE?style=flat-square&logo=minutemailer&logoColor=white" alt="Nodemailer" />
<img src="https://img.shields.io/badge/Zod-3E67B1?style=flat-square&logo=zod&logoColor=white" alt="Zod" />
<img src="https://img.shields.io/badge/PWA-5A0FC8?style=flat-square&logo=pwa&logoColor=white" alt="PWA" />
<img src="https://img.shields.io/badge/Web_Push-4285F4?style=flat-square&logo=googlechrome&logoColor=white" alt="Web Push" />
<img src="https://img.shields.io/badge/Vercel-000000?style=flat-square&logo=vercel&logoColor=white" alt="Vercel" />

<br/><br/>

<img src="https://img.shields.io/github/last-commit/Pratik-kr21/cu-marketplace?style=flat-square&color=blue" alt="Last Commit" />
<img src="https://img.shields.io/github/languages/top/Pratik-kr21/cu-marketplace?style=flat-square&color=yellow" alt="Top Language" />
<img src="https://img.shields.io/github/repo-size/Pratik-kr21/cu-marketplace?style=flat-square&color=green" alt="Repo Size" />

</div>

---

## 📑 Table of Contents

- [Overview](#-overview)
- [Features](#-features)
- [Tech Stack](#-tech-stack)
- [Architecture](#-architecture)
- [Security](#-security)
- [Pages & Routes](#-pages--routes)
- [Prerequisites](#-prerequisites)
- [Local Setup](#-local-setup)
- [Environment Variables](#-environment-variables)
- [Project Structure](#-project-structure)
- [Roadmap](#-roadmap)
- [Author](#-author)

---

## 🧭 Overview

**CU Market** is a full-stack, production-grade campus marketplace built exclusively for **Chandigarh University** students. Only users with a verified `@cuchd.in` email can register and participate. The platform enables students to list items for sale or barter, negotiate trades with automated cash-value computation, chat in real time, and stay updated with push notifications — all within a beautiful, mobile-first Progressive Web App.

---

## 🚀 Features

### 🔐 Authentication & Access Control
- **University-exclusive registration** — only `@cuchd.in` emails are accepted
- **Email verification** via automated HTML emails (Gmail SMTP with Nodemailer)
- **JWT session management** with secure Bcrypt password hashing
- **Forgot/Reset password** flow with tokenized email links
- **Admin Dashboard** for platform-wide user & listing management
- **Rate limiting** on auth endpoints to prevent brute-force attacks

### 🛒 Marketplace & Listings
- **Browse, search & filter** products across categories (Electronics, Books, Vehicles, Clothing, etc.)
- **Create rich listings** with multi-image uploads powered by **Cloudinary**
- **Lazy-loaded images** with smooth skeleton placeholders for fast perceived performance
- **Item detail pages** with seller info, pricing, condition tags, and trade/buy CTAs

### 🔄 Trade & Barter System
- **Propose trades** as alternatives to cash-only transactions
- **Automatic cash offer computation** based on listed item values
- **Trade status tracking** — pending, accepted, rejected, completed
- **Dedicated Trade Dashboard** to manage all incoming/outgoing negotiations

### 💬 Real-Time Chat
- **Integrated messaging** between buyers and sellers
- **Conversation threads** organized per trade/item context
- **Message persistence** stored in MongoDB for full chat history

### 🔔 Push Notifications (PWA)
- **Installable as a native app** via Progressive Web App manifest
- **Service Worker integration** for background web-push alerts
- **Notification prompts** for trade updates, messages, and listing activity
- **Safe graceful fallback** in Incognito or unsupported browser contexts

### 📧 Developer Contact System
- **Authenticated contact form** — only logged-in students can reach the developer
- **Auto-injected student data** (Name, UID, Email) in every message for verification
- **No-reply SMTP delivery** from the site's official Gmail account
- **Anti-spam headers** and plain-text fallbacks for reliable inbox delivery

### ⭐ Ratings & Reviews
- **Post-trade rating system** allowing buyers and sellers to rate each other
- **Trust building** through visible community feedback on user profiles

### 🎨 UI & Design
- **Mobile-first responsive design** using Tailwind CSS with custom design tokens
- **Custom branded splash screen** with animated logo
- **Smooth micro-animations** (fade-in, scale-in, slide-up transitions)
- **Dark mode sections** with gradient overlays and glassmorphism accents
- **Google Fonts (Inter)** for premium, modern typography
- **Custom SVG logo branding** across Navbar, Footer, Login, Signup, and PWA icons

---

## 🛠 Tech Stack

### Frontend

| Technology | Purpose |
|:---|:---|
| **React 18** | Component-based UI framework |
| **Vite 5** | Next-gen build tool & dev server |
| **Tailwind CSS 3** | Utility-first CSS styling |
| **Zustand 4** | Lightweight global state management |
| **React Router 6** | Client-side routing & navigation |
| **React Hook Form + Zod** | Form handling with schema validation |
| **Lucide React** | Beautiful, consistent icon system |
| **Vite PWA Plugin** | Service Worker & manifest generation |

### Backend

| Technology | Purpose |
|:---|:---|
| **Node.js** | Server-side JavaScript runtime |
| **Express 4** | Minimal, flexible web framework |
| **MongoDB Atlas** | Cloud-hosted NoSQL database |
| **Mongoose 8** | Elegant ODM for MongoDB |
| **JWT** | Stateless authentication tokens |
| **Bcrypt.js** | Secure password hashing |
| **Nodemailer** | SMTP email delivery (Gmail) |
| **Cloudinary** | Cloud image storage & optimization |
| **Multer** | Multipart file upload middleware |
| **Web Push** | Server-side push notification dispatch |
| **Express Rate Limit** | API abuse & brute-force prevention |

### Deployment

| Service | Purpose |
|:---|:---|
| **Vercel** | Frontend hosting & CI/CD |
| **MongoDB Atlas** | Managed database cluster |
| **Cloudinary** | Image CDN & transformation |

---

## 🏗 Architecture

```
┌─────────────────────────────────────────────────────────┐
│                     CLIENT (React + Vite)                │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌─────────┐ │
│  │  Zustand  │  │  Router   │  │  Forms   │  │   PWA   │ │
│  │  Store    │  │  v6       │  │  + Zod   │  │  Worker │ │
│  └─────┬────┘  └─────┬────┘  └─────┬────┘  └────┬────┘ │
│        └──────────────┼────────────┼────────────┘       │
│                       │            │                     │
│                 ┌─────▼────────────▼──────┐             │
│                 │     API Client (Axios)   │             │
│                 └───────────┬─────────────┘             │
└─────────────────────────────┼───────────────────────────┘
                              │ HTTPS / REST
┌─────────────────────────────▼───────────────────────────┐
│                   SERVER (Express.js)                    │
│  ┌────────────┐  ┌────────────┐  ┌────────────────────┐ │
│  │   Auth MW  │  │  Rate Limit│  │  Multer + Cloudinary│ │
│  │   (JWT)    │  │  Middleware │  │  Upload Pipeline    │ │
│  └─────┬──────┘  └─────┬──────┘  └─────┬──────────────┘ │
│        └────────────────┼──────────────┘                 │
│                         │                                │
│  ┌──────────────────────▼──────────────────────────────┐ │
│  │              REST API Routes                        │ │
│  │  /auth · /items · /trades · /conversations          │ │
│  │  /ratings · /push · /upload · /admin · /contact     │ │
│  └──────────────────────┬──────────────────────────────┘ │
│                         │                                │
│  ┌──────────────────────▼──────────────────────────────┐ │
│  │         MongoDB Atlas (Mongoose ODM)                │ │
│  │  Users · Items · Trades · Conversations             │ │
│  │  Messages · Ratings · PushSubscriptions             │ │
│  └─────────────────────────────────────────────────────┘ │
│                                                          │
│  ┌─────────────────┐   ┌─────────────────────────────┐  │
│  │  Nodemailer SMTP│   │  Web Push (VAPID Keys)      │  │
│  │  → Gmail        │   │  → Browser Notifications    │  │
│  └─────────────────┘   └─────────────────────────────┘  │
└──────────────────────────────────────────────────────────┘
```

---

## 🔒 Security

| Layer | Implementation |
|:---|:---|
| **Password Storage** | Bcrypt hashing with automatic salt rounds |
| **Session Tokens** | JWT with configurable expiration, validated on every protected route |
| **Email Verification** | SHA-256 hashed tokens with 1-hour TTL stored in MongoDB |
| **Rate Limiting** | 3 verification attempts/hour, throttled login/signup endpoints |
| **CORS Protection** | Whitelisted frontend origins only |
| **File Uploads** | Server-side validation via Multer before Cloudinary forwarding |
| **Data Privacy** | UIDs and emails hidden from public API responses |
| **No-Reply Emails** | `replyTo` set to inactive address preventing unauthorized replies |
| **Service Worker Safety** | Graceful `getRegistration()` probing to avoid UI deadlocks in restricted contexts |

---

## 📄 Pages & Routes

| Route | Page | Auth Required | Description |
|:---|:---|:---:|:---|
| `/` | Home | ❌ | Landing page with hero, features, and categories |
| `/marketplace` | Marketplace | ❌ | Browse, search, and filter all listings |
| `/items/:id` | Item Detail | ❌ | Full item page with images, seller info, trade CTA |
| `/login` | Login | ❌ | Sign in with branded logo |
| `/signup` | Signup | ❌ | Register with @cuchd.in email verification |
| `/verify-email` | Email Verification | ❌ | Token-based email verification handler |
| `/forgot-password` | Forgot Password | ❌ | Request a password reset link |
| `/reset-password` | Reset Password | ❌ | Set a new password via tokenized link |
| `/create-listing` | Create Listing | ✅ | Multi-image upload with category & pricing |
| `/profile` | Profile | ✅ | View/edit profile, manage your listings |
| `/trades` | Trade Dashboard | ✅ | Full negotiation dashboard with status tracking |
| `/chat` | Chat | ✅ | Real-time messaging with trade context |
| `/admin` | Admin Dashboard | ✅ | Platform-wide user & listing management |
| `/contact` | Developer Contact | ✅ | Authenticated feedback form with auto-injected student data |

---

## ⚙️ Prerequisites

| Requirement | Minimum Version |
|:---|:---|
| **Node.js** | v16.0+ |
| **npm** | v8.0+ |
| **MongoDB Atlas** | Free tier (M0) or local instance |
| **Google Account** | For Gmail SMTP App Password |
| **Cloudinary Account** | Free tier for image uploads |
| **Git** | Any recent version |

---

## 💻 Local Setup

### 1. Clone the Repository
```bash
git clone https://github.com/Pratik-kr21/cu-marketplace.git
cd cu-marketplace
```

### 2. Install Dependencies
```bash
# Frontend dependencies (from root)
npm install

# Backend dependencies
cd server
npm install
cd ..
```

### 3. Configure Environment Variables
Create the required `.env` files as described in the [Environment Variables](#-environment-variables) section below.

### 4. Start the Application
Open **two terminal windows:**

```bash
# Terminal 1 — Backend Server
cd server
node index.js
# → Runs at http://localhost:4000
```

```bash
# Terminal 2 — Frontend Client
npm run dev
# → Runs at http://localhost:5173
```

---

## 🔐 Environment Variables

### Frontend — `.env` (root directory)
```env
VITE_API_URL=http://localhost:4000
```

### Backend — `server/.env`
```env
PORT=4000
MONGODB_URI=mongodb+srv://<user>:<password>@<cluster>.mongodb.net/<dbname>?retryWrites=true&w=majority
JWT_SECRET=your_super_secret_jwt_key

# Frontend URL (CORS & Email Links)
VITE_FRONTEND_URL=http://localhost:5173

# Gmail SMTP (Nodemailer)
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_16_char_app_password

# Cloudinary
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

<details>
<summary><strong>📝 How to Set Up Gmail App Password</strong></summary>

1. Log into your [Google Account](https://myaccount.google.com/)
2. Go to **Security** → Enable **2-Step Verification**
3. Search for **App Passwords** in account settings
4. Generate a new App Password (e.g., name it `CU Market`)
5. Copy the 16-character code (remove spaces) → paste as `EMAIL_PASS`

> 💡 **Dev Bypass:** If `EMAIL_PASS` is missing, the server will print a verification link directly in the terminal for local testing!

</details>

<details>
<summary><strong>📝 How to Set Up MongoDB Atlas</strong></summary>

1. Create a free cluster at [MongoDB Atlas](https://www.mongodb.com/atlas)
2. Create a Database User with a strong password
3. Whitelist your IP in **Network Access** (use `0.0.0.0/0` for development)
4. Copy the connection string and paste as `MONGODB_URI`

</details>

---

## 📂 Project Structure

```
cu-marketplace/
├── public/                      # Static assets, PWA manifest, favicons, logo SVGs
├── index.html                   # App entry point with SEO meta tags
│
├── src/                         # ── React Frontend ──
│   ├── components/
│   │   ├── auth/                # ProtectedRoute wrapper
│   │   ├── layout/              # Navbar, Footer
│   │   ├── marketplace/         # ItemGrid, ItemCard
│   │   └── ui/                  # Button, Input, Modal, Badge, Avatar,
│   │                            #   InstallPWA, NotificationBell, LazyImage
│   ├── lib/
│   │   ├── api.js               # Axios HTTP client with JWT interceptors
│   │   ├── imageUpload.js       # Cloudinary upload utilities
│   │   ├── pushNotifications.js # Web Push subscription management
│   │   └── validators.js        # Zod schemas for form validation
│   ├── pages/
│   │   ├── Home.jsx             # Landing page with hero & features
│   │   ├── Marketplace.jsx      # Browsable product grid with filters
│   │   ├── ItemDetail.jsx       # Full item view with trade actions
│   │   ├── CreateListing.jsx    # Multi-image listing creation form
│   │   ├── Login.jsx            # Branded sign-in page
│   │   ├── Signup.jsx           # University registration form
│   │   ├── VerifyEmail.jsx      # Email token verification
│   │   ├── ForgotPassword.jsx   # Password reset request
│   │   ├── ResetPassword.jsx    # New password submission
│   │   ├── Profile.jsx          # User profile & listing management
│   │   ├── TradeDashboard.jsx   # Trade negotiation hub
│   │   ├── Chat.jsx             # Real-time messaging
│   │   ├── AdminDashboard.jsx   # Admin controls panel
│   │   └── DeveloperContact.jsx # Authenticated feedback form
│   ├── store/
│   │   └── authStore.js         # Zustand auth state & JWT persistence
│   ├── App.jsx                  # Root component with routing & splash screen
│   └── main.jsx                 # React DOM entry point
│
└── server/                      # ── Express Backend ──
    ├── config/
    │   └── db.js                # MongoDB Atlas connection
    ├── controllers/
    │   ├── authController.js    # Register, login, verify, reset password
    │   └── itemController.js    # CRUD item operations
    ├── middleware/
    │   ├── auth.js              # JWT verification middleware
    │   └── upload.js            # Multer + Cloudinary pipeline
    ├── models/
    │   ├── User.js              # Student schema (name, UID, email, password)
    │   ├── Item.js              # Listing schema (title, price, images, category)
    │   ├── Trade.js             # Trade schema (buyer, seller, status, offers)
    │   ├── Conversation.js      # Chat thread schema
    │   ├── Message.js           # Individual message schema
    │   ├── Rating.js            # Post-trade rating schema
    │   └── PushSubscription.js  # Web push subscription storage
    ├── routes/
    │   ├── auth.js              # /api/auth endpoints
    │   ├── items.js             # /api/items CRUD
    │   ├── trades.js            # /api/trades negotiation
    │   ├── conversations.js     # /api/conversations messaging
    │   ├── ratings.js           # /api/ratings feedback
    │   ├── push.js              # /api/push subscription management
    │   ├── upload.js            # /api/upload image handling
    │   ├── admin.js             # /api/admin management
    │   └── contact.js           # /api/contact developer feedback
    ├── utils/
    │   ├── email.js             # Nodemailer SMTP transporter
    │   └── cloudinary.js        # Cloudinary SDK configuration
    ├── index.js                 # Express server entry point
    └── vapid.json               # VAPID keys for Web Push
```

---

## 🌱 Roadmap

- [ ] Socket.io integration for live real-time chat
- [ ] Wishlist / Saved Items feature
- [ ] Advanced search with autocomplete suggestions
- [ ] Seller verification badges
- [x] Image compression before Cloudinary upload
- [ ] Automated E2E testing suite
- [ ] Dark mode toggle across the entire app
- [ ] Multi-language support (Hindi/English)

---

## 👨‍💻 Author

<div align="center">

**Pratik Kumar**

[![LinkedIn](https://img.shields.io/badge/LinkedIn-0A66C2?style=flat-square&logo=linkedin&logoColor=white)](https://linkedin.com/in/pratikkumar21)
[![GitHub](https://img.shields.io/badge/GitHub-181717?style=flat-square&logo=github&logoColor=white)](https://github.com/Pratik-kr21)

<br/>

<sub>© 2026 CU Market · Designed & Developed by Pratik Kumar · All Rights Reserved</sub>

</div>
