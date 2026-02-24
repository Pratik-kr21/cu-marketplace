# CU Marketplace — Task Tracker
> Last updated: 2026-02-24

---

## ✅ Phase 1 — Project Setup & Foundation (DONE)
- [x] Vite + React scaffolding
- [x] Tailwind CSS v3 with custom brand colors (red, black, white)
- [x] `package.json` with all dependencies (React Router, Zustand, React Hook Form, Zod, Supabase, Lucide)
- [x] `postcss.config.js`, `vite.config.js`, `tailwind.config.js`
- [x] `index.html` with Inter font
- [x] `src/index.css` with global styles and utility classes
- [x] `src/main.jsx` entry point
- [x] `src/lib/supabase.js` — Supabase client + `isSupabaseConfigured` flag
- [x] `src/lib/validators.js` — Zod schemas + static data (departments, hostels, categories, conditions)
- [x] `src/lib/mockData.js` — mock items + user for demo mode

---

## ✅ Phase 2 — Core UI Components (DONE)
- [x] `src/components/ui/Button.jsx` — variants: primary, secondary, ghost, danger, outline + loading state
- [x] `src/components/ui/Badge.jsx` — condition-aware badge variants
- [x] `src/components/ui/Input.jsx` — Input, Textarea, Select with validation states
- [x] `src/components/ui/Modal.jsx` — accessible modal with backdrop + animation
- [x] `src/components/ui/Avatar.jsx` — image + initials fallback
- [x] `src/components/layout/Navbar.jsx` — sticky nav, user menu dropdown, mobile hamburger
- [x] `src/components/layout/Footer.jsx` — links, branding
- [x] `src/components/auth/ProtectedRoute.jsx` — redirects unauthenticated users
- [x] `src/components/marketplace/ItemCard.jsx` — card with price, condition, barter badge
- [x] `src/components/marketplace/ItemGrid.jsx` — responsive grid + skeleton loader + empty state
- [x] `src/components/marketplace/FilterPanel.jsx` — category, condition, price, hostel, barter filters

---

## ✅ Phase 3 — State Management (DONE)
- [x] `src/store/authStore.js` — Zustand: login, signup, signout, demo mode, profile fetch
- [x] `src/store/itemStore.js` — Zustand: fetch items, filters, sort, createItem (mock + Supabase)

---

## ✅ Phase 4 — Pages (DONE)
- [x] `src/pages/Home.jsx` — Hero, category cards, recent listings, feature highlights, CTA
- [x] `src/pages/Marketplace.jsx` — Search, filter chips, sort, mobile filter drawer
- [x] `src/pages/ItemDetail.jsx` — Image gallery, seller info, condition/price, trade proposal modal
- [x] `src/pages/CreateListing.jsx` — 3-step wizard: photos → details → pricing/type
- [x] `src/pages/Login.jsx` — email/password, demo mode, CU email enforcement
- [x] `src/pages/Signup.jsx` — Full signup with UID, department, **grouped hostel dropdown** ✅
- [x] `src/pages/Profile.jsx` — Avatar, stats, my listings grid
- [x] `src/pages/TradeDashboard.jsx` — Incoming/outgoing trades, accept/decline
- [x] `src/pages/Chat.jsx` — Conversation sidebar + message bubbles + send

---

## ✅ Phase 5 — Routing (DONE)
- [x] `src/App.jsx` — React Router v6 with all routes + protected route wrapper

---

## 🏠 Hostel Data (Updated 2026-02-24)
Sourced from `hostel.txt`:

**Boys Hostels:** Zakir A, Zakir B, Zakir C, Zakir D, NC 1, NC 2, NC 3, NC 4, NC 5, NC 6

**Girls Hostels:** Sukhna, Tagore, LC, Shivalik, Govind

**Other:** Day Scholar

Updated in: `src/lib/validators.js` → `BOYS_HOSTELS`, `GIRLS_HOSTELS`, `CU_HOSTELS`
Signup page uses **grouped `<optgroup>` dropdown** for Boys / Girls / Other sections.

---

## 🔲 Phase 6 — Supabase Integration (TODO)
- [ ] Apply SQL schema to Supabase (profiles, items, trades, conversations, messages, reports)
- [ ] Add RLS policies
- [ ] Set up Storage buckets (`item-images`, `avatars`)
- [ ] Wire up real image upload in `CreateListing.jsx`
- [ ] Set `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` in `.env.local`
- [ ] Test Auth flow with real `@cuchd.in` email
- [ ] Enable email confirmation in Supabase Auth settings

---

## 🔲 Phase 7 — Real-time Chat (TODO)
- [ ] Subscribe to Supabase Realtime on `messages` table
- [ ] Show conversations from DB in `Chat.jsx`
- [ ] Handle unread message counts
- [ ] Optimistic UI updates for sent messages

---

## 🔲 Phase 8 — Barter System (TODO)
- [ ] Wire `TradeDashboard` to `trades` table in Supabase
- [ ] Implement accept/decline RPC calls
- [ ] Trade proposal from `ItemDetail.jsx` → insert trade row
- [ ] Notifications for new trade requests

---

## 🔲 Phase 9 — Polish & Deploy (TODO)
- [ ] PWA manifest + service worker
- [ ] SEO meta tags on all pages
- [ ] Error boundaries
- [ ] Toast notifications system
- [ ] Responsive audit (mobile < 375px)
- [ ] Deploy to Vercel
- [ ] Custom domain (if applicable)

---

## 🐛 Known Issues / Notes
- Demo mode uses mock data from `mockData.js` when Supabase is not configured
- `CreateListing.jsx` image upload uses `URL.createObjectURL` (local preview only — real upload needs Supabase Storage)
- Chat is currently UI-only (demo messages); needs Supabase Realtime for live messaging
- Trades page uses hardcoded demo data; needs Supabase `trades` table integration
