# 🛒 CU Marketplace

> A dedicated second-hand marketplace and barter platform exclusively for **Chandigarh University** students.

Built to help CU students buy, sell, and trade textbooks, lab equipment, electronics, and hostel essentials — all within the campus community.

---

## 📸 Features

| Feature | Description |
|---|---|
| 🔐 **CU-Only Auth** | Sign up only with your `UID@cuchd.in` email — no outsiders |
| 🛍️ **Marketplace** | Browse and list items across 6 categories with photos, price & condition |
| 🔍 **Search & Filter** | Filter by category, price range, condition, and hostel proximity |
| 🔄 **Barter System** | Propose trades (item-for-item or item + cash top-up) |
| 💬 **Real-time Chat** | In-app messaging between buyer and seller via Supabase Realtime |
| 🔔 **Push Notifications** | Browser push alerts for new messages and trade requests (PWA) |
| 👤 **Student Profiles** | Department, hostel, UID, seller ratings, and listing history |
| 📱 **PWA Ready** | Installable as a mobile app on Android & iOS with offline support |

---

## 🧰 Tech Stack

| Layer | Technology |
|---|---|
| **Frontend** | React 18 + Vite |
| **Styling** | Tailwind CSS v3 |
| **State Management** | Zustand |
| **Forms & Validation** | React Hook Form + Zod |
| **Backend / DB** | Supabase (PostgreSQL + Auth + Storage + Realtime) |
| **Icons** | Lucide React |
| **Routing** | React Router v6 |

---

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- A [Supabase](https://supabase.com) project (free tier works)

### 1. Clone the repo

```bash
git clone https://github.com/Pratik-kr21/cu-marketplace.git
cd cu-marketplace
```

### 2. Install dependencies

```bash
npm install
```

### 3. Configure environment variables

Create a `.env.local` file in the root:

```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
```

> Get these from your Supabase project → **Settings → API**.

> **Push Notifications** also require VAPID keys set as Supabase Edge Function secrets:
> `VAPID_PUBLIC_KEY` and `VAPID_PRIVATE_KEY`. Generate with `npx web-push generate-vapid-keys`.

### 4. Run the dev server

```bash
npm run dev
```

The app opens at `http://localhost:5173`.

---

## 🗄️ Supabase Setup

Apply the following tables in your Supabase SQL editor:

```sql
-- Profiles (extended user info)
create table profiles (
  id uuid references auth.users primary key,
  full_name text,
  uid text unique,
  department text,
  hostel text,
  avatar_url text,
  rating numeric,
  trade_count int default 0,
  sold_count int default 0,
  created_at timestamptz default now()
);

-- Items (listings)
create table items (
  id uuid primary key default gen_random_uuid(),
  seller_id uuid references profiles(id),
  title text not null,
  description text,
  price numeric,
  category text,
  condition text,
  images text[],
  is_available boolean default true,
  created_at timestamptz default now()
);

-- Trades (barter requests)
create table trades (
  id uuid primary key default gen_random_uuid(),
  requester_id uuid references profiles(id),
  receiver_id uuid references profiles(id),
  offered_item_id uuid references items(id),
  requested_item_id uuid references items(id),
  cash_added numeric default 0,
  message text,
  status text default 'pending', -- pending | accepted | declined | cancelled
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Conversations
create table conversations (
  id uuid primary key default gen_random_uuid(),
  item_id uuid references items(id),
  buyer_id uuid references profiles(id),
  seller_id uuid references profiles(id),
  created_at timestamptz default now()
);

-- Messages
create table messages (
  id uuid primary key default gen_random_uuid(),
  conversation_id uuid references conversations(id),
  sender_id uuid references profiles(id),
  content text not null,
  created_at timestamptz default now()
);
```

> Enable **Row Level Security (RLS)** on all tables and add appropriate policies so users can only read/write their own data.

---

## 📁 Project Structure

```
src/
├── components/
│   ├── layout/         # Navbar, Footer
│   └── ui/             # Button, Input, Select, Avatar, Badge
├── lib/
│   ├── supabase.js     # Supabase client
│   ├── validators.js   # Zod schemas + hostel/department data
│   └── mockData.js     # Dev-only fallback data
├── pages/
│   ├── Home.jsx
│   ├── Marketplace.jsx
│   ├── Login.jsx
│   ├── Signup.jsx
│   ├── Profile.jsx
│   ├── CreateListing.jsx
│   ├── ItemDetail.jsx
│   ├── TradeDashboard.jsx
│   └── Chat.jsx
├── store/
│   └── authStore.js    # Zustand auth store
└── App.jsx             # Routes
```

---

## 🔑 Authentication

- Students sign up using their **CU Student UID** (e.g. `23BCE10055`)
- The email is **auto-generated** as `uid@cuchd.in` — no manual entry needed
- Email format is enforced at both the UI and Zod schema level
- Supabase Auth sends a **confirmation email** to verify the CU inbox

---

## 🏗️ Available Scripts

| Command | Description |
|---|---|
| `npm run dev` | Start development server with hot reload |
| `npm run build` | Build for production |
| `npm run preview` | Preview the production build locally |

---

## 🗺️ Roadmap

- [x] Auth with CU email enforcement
- [x] Marketplace browse & search
- [x] Create listings with images
- [x] Barter / Trade Dashboard
- [x] Real-time chat (Supabase Realtime)
- [x] Student profiles with ratings
- [x] PWA support (installable, offline-ready)
- [x] Push notifications (messages & trade alerts)
- [x] RLS policies & full Supabase integration
- [ ] Semester-end featured sales
- [ ] Admin panel for moderation

---

## 🤝 Contributing

This project is currently for **Chandigarh University internal use**. Pull requests and suggestions from CU students are welcome!

1. Fork the repo
2. Create a branch: `git checkout -b feature/my-feature`
3. Commit your changes: `git commit -m 'Add feature'`
4. Push and open a Pull Request

---

## 📄 License

MIT © 2025 CU Marketplace — Made with ❤️ by a CU student, for CU students.
