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
| 🖼️ **Image Compression** | Auto-compresses uploads to WebP (max 300 KB) before storing |

---

## 🧰 Tech Stack

| Layer | Technology |
|---|---|
| **Frontend** | React 18 + Vite 5 |
| **Styling** | Tailwind CSS v3 |
| **State Management** | Zustand |
| **Forms & Validation** | React Hook Form + Zod |
| **Backend / DB** | Supabase (PostgreSQL + Auth + Storage + Realtime) |
| **Icons** | Lucide React |
| **Routing** | React Router v6 |
| **PWA** | vite-plugin-pwa (Workbox) |

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

Create a `.env.local` file in the project root:

```env
VITE_SUPABASE_URL=https://your-project-ref.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
```

> Get these from your Supabase project → **Project Settings → API**.

> **Push Notifications** also require VAPID keys set as Supabase Edge Function secrets:
> `VAPID_PUBLIC_KEY` and `VAPID_PRIVATE_KEY`. Generate with `npx web-push generate-vapid-keys`.

### 4. Run the database migrations

Run the full migration SQL in your **Supabase SQL Editor** (see [🗄️ Supabase Setup](#️-supabase-setup) below).

### 5. Start the dev server

```bash
npm run dev
```

The app opens at `http://localhost:5173`.

---

## 🗄️ Supabase Setup

Run this in your **Supabase SQL Editor** to create all tables, RLS policies, the storage bucket, and the auto-profile trigger:

```sql
-- ─── Profiles ────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.profiles (
    id          uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email       text,
    full_name   text,
    uid         text,
    department  text,
    hostel      text,
    avatar_url  text,
    rating      numeric,
    trade_count integer DEFAULT 0,
    sold_count  integer DEFAULT 0,
    created_at  timestamptz DEFAULT now()
);
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Profiles are viewable by everyone" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "Users can insert own profile"      ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "Users can update own profile"      ON public.profiles FOR UPDATE USING (auth.uid() = id);

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
    INSERT INTO public.profiles (id, email, full_name, uid, department, hostel)
    VALUES (
        NEW.id, NEW.email,
        NEW.raw_user_meta_data->>'full_name',
        NEW.raw_user_meta_data->>'uid',
        NEW.raw_user_meta_data->>'department',
        NEW.raw_user_meta_data->>'hostel'
    ) ON CONFLICT (id) DO NOTHING;
    RETURN NEW;
END;
$$;
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ─── Items ───────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.items (
    id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    seller_id       uuid REFERENCES public.profiles(id) ON DELETE CASCADE,
    title           text NOT NULL,
    description     text,
    category        text,
    condition       text,
    price           numeric,
    is_barter_only  boolean DEFAULT false,
    accept_hybrid   boolean DEFAULT false,
    is_free         boolean DEFAULT false,
    hostel_area     text,
    images          text[] DEFAULT '{}',
    is_available    boolean DEFAULT true,
    views           integer DEFAULT 0,
    created_at      timestamptz DEFAULT now(),
    updated_at      timestamptz DEFAULT now(),
    expires_at      timestamptz DEFAULT (now() + interval '30 days')
);
ALTER TABLE public.items ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Items viewable by everyone"      ON public.items FOR SELECT USING (true);
CREATE POLICY "Authenticated users can create"  ON public.items FOR INSERT TO authenticated WITH CHECK (auth.uid() = seller_id);
CREATE POLICY "Sellers can update own items"    ON public.items FOR UPDATE USING (auth.uid() = seller_id);
CREATE POLICY "Sellers can delete own items"    ON public.items FOR DELETE USING (auth.uid() = seller_id);

-- ─── Trades ──────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.trades (
    id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    item_id         uuid REFERENCES public.items(id) ON DELETE CASCADE,
    buyer_id        uuid REFERENCES public.profiles(id) ON DELETE CASCADE,
    seller_id       uuid REFERENCES public.profiles(id) ON DELETE CASCADE,
    type            text DEFAULT 'barter',
    offer_item_desc text,
    message         text,
    status          text DEFAULT 'pending',
    created_at      timestamptz DEFAULT now(),
    updated_at      timestamptz DEFAULT now()
);
ALTER TABLE public.trades ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Trade parties can view"   ON public.trades FOR SELECT USING (auth.uid() = buyer_id OR auth.uid() = seller_id);
CREATE POLICY "Buyers can create trades" ON public.trades FOR INSERT TO authenticated WITH CHECK (auth.uid() = buyer_id);
CREATE POLICY "Seller/buyer can update"  ON public.trades FOR UPDATE USING (auth.uid() = seller_id OR auth.uid() = buyer_id);

-- ─── Conversations ────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.conversations (
    id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    item_id     uuid REFERENCES public.items(id) ON DELETE CASCADE,
    buyer_id    uuid REFERENCES public.profiles(id) ON DELETE CASCADE,
    seller_id   uuid REFERENCES public.profiles(id) ON DELETE CASCADE,
    created_at  timestamptz DEFAULT now()
);
ALTER TABLE public.conversations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Participants can view convos" ON public.conversations FOR SELECT USING (auth.uid() = buyer_id OR auth.uid() = seller_id);
CREATE POLICY "Buyers can create convos"     ON public.conversations FOR INSERT TO authenticated WITH CHECK (auth.uid() = buyer_id);

-- ─── Messages ────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.messages (
    id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    conversation_id uuid REFERENCES public.conversations(id) ON DELETE CASCADE,
    sender_id       uuid REFERENCES public.profiles(id) ON DELETE CASCADE,
    receiver_id     uuid REFERENCES public.profiles(id) ON DELETE CASCADE,
    content         text NOT NULL,
    created_at      timestamptz DEFAULT now()
);
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Convo participants can read messages"  ON public.messages FOR SELECT
    USING (EXISTS (SELECT 1 FROM public.conversations c
        WHERE c.id = messages.conversation_id
          AND (c.buyer_id = auth.uid() OR c.seller_id = auth.uid())));
CREATE POLICY "Authenticated users can send messages" ON public.messages FOR INSERT TO authenticated
    WITH CHECK (auth.uid() = sender_id);

-- ─── Push Subscriptions ───────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.push_subscriptions (
    id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id    uuid REFERENCES public.profiles(id) ON DELETE CASCADE,
    endpoint   text NOT NULL,
    p256dh     text,
    auth       text,
    created_at timestamptz DEFAULT now()
);
ALTER TABLE public.push_subscriptions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own push subs" ON public.push_subscriptions FOR ALL USING (auth.uid() = user_id);

-- ─── Storage bucket for listing images ───────────────────────────────────────
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES ('listing-images', 'listing-images', true, 524288, ARRAY['image/jpeg','image/webp','image/jpg'])
ON CONFLICT (id) DO NOTHING;
CREATE POLICY "Public read listing images" ON storage.objects FOR SELECT USING (bucket_id = 'listing-images');
CREATE POLICY "Auth users upload images"   ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'listing-images' AND auth.uid()::text = (storage.foldername(name))[1]);
CREATE POLICY "Users delete own images"    ON storage.objects FOR DELETE USING (bucket_id = 'listing-images' AND auth.uid()::text = (storage.foldername(name))[1]);
```

---

## 📁 Project Structure

```
src/
├── components/
│   ├── layout/         # Navbar, Footer
│   └── ui/             # Button, Input, Select, Avatar, Badge, LazyImage
├── lib/
│   ├── supabase.js     # Supabase client + isSupabaseConfigured guard
│   ├── validators.js   # Zod schemas, hostel list, department list
│   ├── imageUpload.js  # Client-side WebP compression + Storage upload
│   ├── mockData.js     # Fallback demo data (no Supabase needed)
│   └── pushNotifications.js
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
│   ├── authStore.js    # Zustand auth store (signIn, signUp, signOut, profile)
│   └── itemStore.js    # Zustand item store (fetch, create, delete, filter)
└── App.jsx             # Routes + auth guard
```

---

## 🔑 Authentication

- Students sign up using their **CU Student UID** (e.g. `23BCE10055`)
- The email is **auto-generated** as `uid@cuchd.in` — no manual entry needed
- Email format is validated via Zod schema — only `@cuchd.in` addresses are accepted
- Supabase Auth sends a **confirmation email** to the CU inbox before login is permitted
- A database trigger (`handle_new_user`) auto-creates a row in `profiles` on every signup

---

## 🏗️ Available Scripts

| Command | Description |
|---|---|
| `npm run dev` | Start development server with hot reload |
| `npm run build` | Build for production |
| `npm run preview` | Preview the production build locally |

---

## ⚠️ Network Troubleshooting

If you see **"Could not connect to server"** or get `ERR_CERT_AUTHORITY_INVALID` errors when connecting to Supabase, your ISP or campus network may be intercepting `*.supabase.co` DNS queries.

**Fix — switch to Google DNS:**

1. Open **Network Settings → WiFi → DNS**
2. Set Primary DNS to `8.8.8.8` and Secondary to `8.8.4.4`

Or on Windows (run PowerShell as Administrator):

```powershell
Set-DnsClientServerAddress -InterfaceAlias "WiFi" -ServerAddresses ("8.8.8.8","8.8.4.4")
Clear-DnsClientCache
```

---

## 🗺️ Roadmap

- [x] Auth with CU email enforcement
- [x] Marketplace browse & search with filters
- [x] Create listings with client-side image compression (WebP)
- [x] Barter / Trade Dashboard
- [x] Real-time chat (Supabase Realtime)
- [x] Student profiles with ratings
- [x] PWA support (installable, offline-ready)
- [x] Push notifications (messages & trade alerts)
- [x] Full RLS policies & Supabase Storage integration
- [ ] Semester-end featured sales
- [ ] Admin panel for moderation
- [ ] In-app rating system after completed trades

---

## 🤝 Contributing

This project is currently for **Chandigarh University internal use**. Pull requests and suggestions from CU students are welcome!

1. Fork the repo
2. Create a branch: `git checkout -b feature/my-feature`
3. Commit your changes: `git commit -m 'Add feature'`
4. Push and open a Pull Request

---

## 📄 License

MIT © 2026 CU Marketplace — Made with ❤️ by a CU student, for CU students.
