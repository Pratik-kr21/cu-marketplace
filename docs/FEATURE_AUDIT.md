# Feature Audit

This document inventories every feature present in the current web application and assesses its migration to Android.

## 1. Authentication
*   **Purpose**: Secure user access and identity verification.
*   **Frontend Implementation**: `Signup.jsx`, `Login.jsx`, `ForgotPassword.jsx`, `ResetPassword.jsx`, `VerifyEmail.jsx`. Uses Zustand for token storage.
*   **Backend Implementation**: `/api/auth/*` routes, JWT tokens, Bcrypt, Nodemailer.
*   **Android Migration Complexity**: Medium.
*   **Dependencies**: DataStore (for JWT storage), Retrofit, ViewModels.
*   **Risks**: Handling token expiry and refresh flows gracefully on mobile.

## 2. Marketplace Browsing
*   **Purpose**: View available items with filtering/searching.
*   **Frontend Implementation**: `Home.jsx`, `Marketplace.jsx`. Infinite scrolling or pagination.
*   **Backend Implementation**: `/api/items` with query parameters.
*   **Android Migration Complexity**: Medium.
*   **Dependencies**: Paging 3, LazyVerticalGrid, Retrofit.
*   **Risks**: Image loading performance (requires Coil optimization).

## 3. Listing Creation
*   **Purpose**: Allow users to post items for trade/sale.
*   **Frontend Implementation**: `CreateListing.jsx` form with multi-image upload.
*   **Backend Implementation**: `/api/items` (POST), Multer middleware.
*   **Android Migration Complexity**: High.
*   **Dependencies**: PhotoPicker API, multipart/form-data upload via Retrofit.
*   **Risks**: Compressing images before upload to save bandwidth and prevent OOM errors on Android.

## 4. Trade System
*   **Purpose**: Core barter functionality. Proposing trades with items/cash.
*   **Frontend Implementation**: `ItemDetail.jsx` (Trade Modal), `TradeDashboard.jsx`.
*   **Backend Implementation**: `/api/trades` endpoints, State machine for trade status.
*   **Android Migration Complexity**: High.
*   **Dependencies**: Complex UI states, BottomSheets/Dialogs.
*   **Risks**: Ensuring the complex trade state machine is perfectly replicated in Android ViewModels.

## 5. Chat System
*   **Purpose**: Real-time communication between buyer and seller post-trade initiation.
*   **Frontend Implementation**: `Chat.jsx`, `socket.io-client`.
*   **Backend Implementation**: Socket.IO server, `/api/conversations`.
*   **Android Migration Complexity**: High.
*   **Dependencies**: `socket.io-client` for Android, Kotlin Flow for real-time state, Room (optional for offline caching).
*   **Risks**: Managing socket lifecycle with Android Activity/Fragment lifecycles (handling background/foreground transitions).

## 6. Notifications
*   **Purpose**: Alert users of trade updates, new messages.
*   **Frontend Implementation**: Service Worker, Web-Push API.
*   **Backend Implementation**: `web-push` library, VAPID.
*   **Android Migration Complexity**: High.
*   **Dependencies**: Firebase Cloud Messaging (FCM).
*   **Risks**: Backend requires modification to support sending FCM payloads to Android devices alongside web-push.

## 7. Profile & User Ratings
*   **Purpose**: Manage user identity and trust score.
*   **Frontend Implementation**: `Profile.jsx`.
*   **Backend Implementation**: `/api/auth/me`, `/api/ratings`.
*   **Android Migration Complexity**: Low-Medium.
*   **Dependencies**: Coil (avatars), Retrofit.
*   **Risks**: None major.

## 8. Item Requests
*   **Purpose**: Request items not currently listed.
*   **Frontend Implementation**: `Requests.jsx`.
*   **Backend Implementation**: `/api/requests`.
*   **Android Migration Complexity**: Low.
*   **Dependencies**: Simple CRUD UI.
*   **Risks**: None major.

## 9. Admin Dashboard
*   **Purpose**: Moderation and platform metrics.
*   **Frontend Implementation**: `AdminDashboard.jsx`.
*   **Backend Implementation**: `/api/admin` (Role protected).
*   **Android Migration Complexity**: Medium.
*   **Dependencies**: Lots of data visualization if metrics exist.
*   **Risks**: Pushing Admin features to phase 2 might be better if resources are tight, as admins can use the web app.
