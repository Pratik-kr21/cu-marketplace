# CU Marketplace — Architecture Guide

## 📋 Overview

This document covers the storage and scalability architecture of CU Marketplace, using **Supabase Storage** (public bucket) for image hosting — optimized for the Supabase free tier.

---

## 🏗️ Folder Structure

```
cu-marketplace/
├── .env.local                          # Supabase URL + Anon Key (only env vars needed)
├── src/
│   ├── lib/
│   │   ├── supabase.js                 # Supabase client
│   │   ├── imageUpload.js              # Image compression, upload, delete (Supabase Storage)
│   │   ├── validators.js               # Zod schemas + constants
│   │   ├── mockData.js                 # Demo data
│   │   └── pushNotifications.js        # Push notification utilities
│   ├── components/
│   │   ├── ui/
│   │   │   ├── LazyImage.jsx           # IntersectionObserver lazy loading + shimmer
│   │   │   ├── Button.jsx
│   │   │   ├── Input.jsx
│   │   │   ├── Modal.jsx
│   │   │   ├── Avatar.jsx
│   │   │   ├── Badge.jsx
│   │   │   └── NotificationBell.jsx
│   │   ├── marketplace/
│   │   │   ├── ItemCard.jsx            # Uses LazyImage
│   │   │   ├── ItemGrid.jsx
│   │   │   └── FilterPanel.jsx
│   │   ├── auth/
│   │   │   └── ProtectedRoute.jsx
│   │   └── layout/
│   │       ├── Navbar.jsx
│   │       └── Footer.jsx
│   ├── store/
│   │   ├── authStore.js
│   │   └── itemStore.js                # Image cleanup on delete
│   ├── pages/
│   │   ├── CreateListing.jsx           # Upload via Supabase Storage
│   │   ├── ItemDetail.jsx              # LazyImage display
│   │   ├── Profile.jsx                 # LazyImage + delete flow
│   │   ├── Marketplace.jsx
│   │   ├── Home.jsx
│   │   ├── Chat.jsx
│   │   ├── TradeDashboard.jsx
│   │   ├── Login.jsx
│   │   └── Signup.jsx
│   ├── App.jsx
│   ├── main.jsx
│   └── index.css                       # Shimmer animation
├── vite.config.js                      # PWA + Supabase Storage caching rules
└── package.json
```

### Supabase Edge Functions (deployed remotely)
```
cleanup-expired    → Cron job: auto-expires listings after 30 days, deletes images from Supabase Storage
send-push          → Sends push notifications to users
```

---

## 🔐 Required Environment Variables

### Client-side (`.env.local`)
```env
VITE_SUPABASE_URL=https://seirlnfmzqjrhvnutvdn.supabase.co
VITE_SUPABASE_ANON_KEY=<your-anon-key>
```

> **That's it!** Supabase Storage uses the same client and credentials as Auth/Postgres.
> No additional API keys, no external services, no edge function secrets for storage.

### Supabase Edge Function Secrets (only for cron job)
```env
CRON_SECRET=<random-secret-for-cron-auth>
```

---

## 🪣 Supabase Storage Bucket Setup

### Step-by-Step (Dashboard)

1. Go to [Supabase Dashboard](https://supabase.com/dashboard) → your project
2. Navigate to **Storage** in the left sidebar
3. Click **New Bucket**
4. Settings:
   - **Name**: `listing-images`
   - **Public bucket**: ✅ ON (images need to be viewable by anyone)
   - **File size limit**: `512 KB` (500KB + overhead)
   - **Allowed MIME types**: `image/jpeg, image/webp`
5. Click **Create Bucket**

> ⚠️ **Already done via SQL migration** — The bucket was created automatically.
> You should see it in the Storage dashboard.

### Storage RLS Policies (already applied)

| Policy | Operation | Who | Rule |
|--------|-----------|-----|------|
| Public read | SELECT | Everyone | `bucket_id = 'listing-images'` |
| Upload own | INSERT | Authenticated | Folder must match `auth.uid()` |
| Delete own | DELETE | Authenticated | Folder must match `auth.uid()` |
| Update own | UPDATE | Authenticated | Folder must match `auth.uid()` |

**Path structure**: `{user_id}/{timestamp}-{random}.webp`
This ensures users can only upload/delete files in their own folder.

---

## 📊 Database Schema

### `items` Table
| Column | Type | Notes |
|--------|------|-------|
| id | uuid | Primary key, auto-generated |
| seller_id | uuid | FK → profiles.id |
| title | text | Listing title |
| description | text | Listing description |
| category | text | Category enum |
| condition | text | Condition enum |
| price | numeric | Nullable (barter-only items) |
| is_barter_only | boolean | Default false |
| accept_hybrid | boolean | Default false |
| is_free | boolean | Default false |
| hostel_area | text | Seller's hostel area |
| **images** | **text[]** | **Array of Supabase Storage public URLs** |
| is_available | boolean | Default true |
| views | integer | Default 0 |
| created_at | timestamptz | Default now() |
| updated_at | timestamptz | Default now() |
| expires_at | timestamptz | Default now() + 30 days |

### Existing RLS Policies on `items`
| Policy | Command | Check |
|--------|---------|-------|
| Items viewable by everyone | SELECT | true |
| Authenticated users can create | INSERT | auth.uid() = seller_id |
| Sellers can update own items | UPDATE | auth.uid() = seller_id |
| Sellers can delete own items | DELETE | auth.uid() = seller_id |

---

## 🔄 Upload Flow

```
User selects image
       ↓
[Client] Validate file type + extension + size
       ↓
[Client] Compress to WebP (max 800px, target <300KB)
       ↓
[Client] supabase.storage.from('listing-images').upload(path, blob)
       ↓
[Supabase Storage] Validates MIME type + file size (server-side)
       ↓
[Client] supabase.storage.from('listing-images').getPublicUrl(path)
       ↓
[Client] Store public URL in items.images[] column
       ↓
[Supabase CDN] Images served via Supabase's built-in CDN
```

### Image Optimization Pipeline (client-side)
1. **Validate**: MIME type (jpeg/webp), extension (.jpg/.jpeg/.webp), raw size (<10MB)
2. **Resize**: Max 800px width, proportional height
3. **Compress**: WebP at 75% quality → target <300KB
4. **Fallback**: If still >300KB, re-compress at 50% quality
5. **Reject**: If still >500KB after compression, reject entirely

---

## 🗑️ Delete Flow

```
User clicks Delete Listing
       ↓
[Client] Extract storage paths from public URLs
       ↓
[Client] supabase.storage.from('listing-images').remove(paths)
       ↓
[Supabase Storage] Validates RLS (folder matches user ID)
       ↓
[Client] Delete item row from Supabase database
       ↓
No orphan images ✓
```

---

## ⏰ Auto-Expiry Flow (Cron)

```
[pg_cron] Daily at 2 AM UTC
       ↓
[HTTP POST] → cleanup-expired Edge Function
       ↓
[Edge Function] Query expired items → Delete from Storage → Mark unavailable
       ↓
Stale listings automatically cleaned up ✓
```

---

## ⚡ Performance Features

| Feature | Implementation |
|---------|----------------|
| **Lazy Loading** | `LazyImage` component with IntersectionObserver (200px preload) |
| **Shimmer Placeholder** | Gradient animation while images load |
| **Error State** | Graceful fallback with `ImageOff` icon |
| **PWA Caching** | Service worker caches storage images for 30 days |
| **Immutable URLs** | Timestamps in paths = perfect cache hit rates |
| **Cache-Control** | `31536000` (1 year) set on upload |

---

## 💰 Free Tier Budget

| Resource | Supabase Free Tier | Our Usage (estimated) |
|----------|--------------------|-----------------------|
| **Database** | 500 MB | ~10 MB (metadata only, no blobs) |
| **Storage** | 1 GB | ~500 MB (2 images × 300KB × ~800 listings) |
| **Bandwidth** | 2 GB / month | ~1 GB (depends on traffic) |
| **Auth Users** | 50,000 MAU | Well within limits |
| **Edge Functions** | 500K invocations | 1/day (cron) + on-demand |
| **API Requests** | Unlimited | ✅ |

### Storage Budget Math
- Max 2 images per listing × ~300KB each = **~600KB per listing**
- 1 GB free tier ÷ 600KB = **~1,700 listings** before hitting limits
- With auto-expiry (30 days), active storage stays well under 1 GB

---

## ✅ Security Checklist

- [x] File type validation — client-side (MIME + extension)
- [x] File type validation — server-side (Supabase bucket `allowed_mime_types`)
- [x] File size validation — client-side (500KB reject limit)
- [x] File size validation — server-side (Supabase bucket `file_size_limit: 512KB`)
- [x] Upload path scoped to user ID (`{userId}/{file}`)
- [x] Storage RLS: only owner can upload to their folder
- [x] Storage RLS: only owner can delete from their folder
- [x] Storage RLS: public read access for all images
- [x] Database RLS: only owner can CRUD their listings
- [x] No external API keys needed client-side
- [x] No presigned URLs needed (Supabase handles auth via JWT)
- [x] Auto-expiry prevents stale data accumulation
- [x] Soft deletes (is_available = false) preserve history

---

## 🚫 Removed (R2 Rollback)

The following have been **completely removed**:
- ~~Cloudflare R2 integration~~
- ~~S3 SDK / AWS4 signature code~~
- ~~Presigned URL Edge Functions (`r2-presign`, `r2-delete`)~~
- ~~`R2_ACCOUNT_ID`, `R2_ACCESS_KEY_ID`, `R2_SECRET_ACCESS_KEY` env vars~~
- ~~`VITE_R2_PUBLIC_URL` client-side env var~~
- ~~R2 CDN caching rules in service worker~~

> The `r2-presign` and `r2-delete` Edge Functions still exist in Supabase but are no longer called.
> They can be safely deleted from the Supabase Dashboard → Edge Functions.
