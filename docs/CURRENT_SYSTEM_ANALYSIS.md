# Current System Analysis

## 1. Frontend Architecture (PWA)
*   **Framework**: React 18, bootstrapped with Vite.
*   **Styling**: Tailwind CSS, lucide-react for icons, framer-motion for animations.
*   **State Management**: Zustand for global state, React Hook Form for form handling.
*   **Routing**: React Router DOM (v6).
*   **Realtime**: Socket.IO Client for real-time chat.
*   **PWA Features**: `vite-plugin-pwa` for manifest and service worker, with a Bubblewrap/TWA configuration (`twa-manifest.json`, `@bubblewrap/cli`).
*   **Current Status**: Fully functioning web application with complex flows for trading, bartering, chatting, and push notifications.

## 2. Backend Architecture
*   **Runtime/Framework**: Node.js with Express.js.
*   **Database**: MongoDB (via Mongoose).
*   **Authentication**: JWT-based authentication (Bcrypt for hashing passwords).
*   **Realtime**: Socket.IO server configured with CORS for real-time messaging.
*   **File Uploads**: Cloudinary integration via Multer for image uploads (items, avatars).
*   **Push Notifications**: `web-push` library for sending VAPID-based push notifications.
*   **Structure**: MVC-like structure with `controllers`, `models`, `routes`, `middleware`, and `utils`.

## 3. Android Project Status
*   **Project Path**: `/CU_MARKET_APP`
*   **Build System**: Gradle with Kotlin DSL (`build.gradle.kts`).
*   **Architecture**: Barebones Android project. Uses Jetpack Compose.
*   **Current Dependencies**: Basic Jetpack Compose libraries, AndroidX Core.
*   **Missing Infrastructure**: No Dependency Injection (Hilt), no networking (Retrofit/OkHttp), no local storage (DataStore/Room), no structured navigation (Navigation Compose), no image loading (Coil).
*   **Verdict**: Needs a complete architectural setup before feature implementation can begin.

## 4. Existing Features
*   User Authentication (Signup, Login, Forgot/Reset Password, Email Verification)
*   Marketplace Browsing & Searching
*   Item Listing Creation & Management
*   Trade/Barter System (Propose trades, counter-offers, accept/decline)
*   Real-time Chat / Conversations
*   Item Requests
*   User Profiles & Ratings
*   Admin Dashboard
*   Push Notifications

## 5. Existing User Flows
*   **Onboarding**: Signup -> Email Verification -> Login -> Profile Setup.
*   **Listing**: Home -> Create Listing -> Fill Form (Upload Images) -> Submit -> Item Details.
*   **Trading**: Browse -> Item Details -> Propose Trade (Select own items/cash) -> Pending Trade -> Seller Accepts/Declines -> Chat Opens -> Complete Trade -> Rate User.

## 6. Existing Data Flows
*   **Client -> Server (REST)**: Standard CRUD operations via HTTP endpoints with JWT Bearer tokens in Authorization headers.
*   **Client <-> Server (Realtime)**: Socket.IO connection established post-login. User registers socket ID with their UID. Messages emitted and broadcasted to specific receiver sockets.

## 7. Existing Security Flows
*   **Auth**: JWT tokens (Access Tokens).
*   **Passwords**: Bcrypt hashing before DB save.
*   **CORS**: Strict CORS origin whitelisting on the backend (localhost + vercel domain).
*   **Rate Limiting**: `express-rate-limit` likely used on auth routes.

## 8. Existing API Architecture
*   RESTful JSON API.
*   Routes separated by domain: `/api/auth`, `/api/items`, `/api/trades`, `/api/conversations`, etc.
*   Standard HTTP methods used appropriately.

## 9. Existing Realtime Architecture
*   Socket.IO server attached to Node HTTP server.
*   Custom `connectedUsers` Map tracks active socket IDs per User ID.
*   Events: `register`, `disconnect` (standard). Chat specific events handled in conversation flow.

## 10. Existing Notification Architecture
*   Current implementation relies on `web-push` (VAPID keys) sending payloads to browser Service Workers.
*   For Android Migration, this MUST be replaced/augmented with Firebase Cloud Messaging (FCM) using Device Tokens.
