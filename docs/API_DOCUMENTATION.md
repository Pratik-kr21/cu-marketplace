# API Documentation

This document outlines the major REST API endpoints used by the CU Market application, required for Retrofit mappings in the Android App.

*Base URL*: `https://api.yourdomain.com/api` (or `http://localhost:4000/api` locally).
*Authorization*: Bearer Token in headers for protected routes.

## 1. Authentication (`/api/auth`)

### `POST /login`
*   **Request Body**: `{ "email": "user@example.com", "password": "password123" }`
*   **Response**: `{ "token": "jwt...", "user": { "id": "...", "email": "...", ... } }`

### `POST /signup`
*   **Request Body**: `{ "email": "...", "password": "...", "full_name": "...", "department": "...", "hostel": "..." }`
*   **Response**: `{ "token": "jwt...", "user": { ... } }`

### `GET /me` (Protected)
*   **Response**: `{ "id": "...", "email": "...", "full_name": "...", "avatar_url": "..." }`

### `POST /forgot-password` & `POST /reset-password`
*   **Request Body**: `{ "email": "..." }` / `{ "token": "...", "newPassword": "..." }`

## 2. Items (`/api/items`)

### `GET /`
*   **Query Params**: `?category=electronics&search=laptop` (Optional)
*   **Response**: `[ { "id": "...", "title": "...", "price": 500, "images": ["url1"], "seller": { ... } }, ... ]`

### `POST /` (Protected)
*   **Request Body**: Multipart form data with `title`, `description`, `price`, `category`, `condition`, and `images` (files).
*   **Response**: `{ "id": "...", "title": "...", ... }`

### `PATCH /:id` (Protected)
*   **Request Body**: `{ "price": 450, "description": "Updated description" }`

### `DELETE /:id` (Protected)
*   **Response**: `204 No Content`

### `GET /my` (Protected)
*   **Response**: `[ { "id": "...", "title": "...", ... } ]` (Current user's items)

### `GET /saved` (Protected)
*   **Response**: `[ { "id": "...", "title": "...", ... } ]`

### `POST /:id/save` & `DELETE /:id/save` (Protected)
*   **Response**: `{ "saved_items": ["id1", "id2"] }`

## 3. Trades (`/api/trades`)

### `GET /` (Protected)
*   **Query Params**: `?tab=incoming` or `?tab=outgoing`
*   **Response**: `[ { "id": "...", "item": {...}, "buyer": {...}, "seller": {...}, "status": "pending" } ]`

### `POST /` (Protected)
*   **Request Body**: `{ "item_id": "...", "type": "barter", "offer_item_desc": "...", "proposed_cash": 0, "proposed_items": ["itemId1"] }`
*   **Response**: Trade Object

### `PATCH /:id` (Protected)
*   **Request Body**: `{ "status": "accepted|declined|cancelled|completed|counter_offer", "proposed_items": [...], "proposed_cash": ... }`
*   **Response**: Updated Trade Object

## 4. Conversations & Chat (`/api/conversations`)

### `GET /` (Protected)
*   **Response**: `[ { "id": "...", "item": {...}, "buyer": {...}, "seller": {...}, "messages": [{...}], "unread_count": 0 } ]`

### `POST /upsert` (Protected)
*   **Request Body**: `{ "item_id": "...", "seller_id": "..." }`
*   **Response**: Conversation Object

### `GET /:id/messages` (Protected)
*   **Response**: `[ { "id": "...", "content": "Hello", "sender_id": "...", "created_at": "..." } ]`

### `POST /:id/messages` (Protected)
*   **Request Body**: `{ "content": "Hello there" }`
*   **Response**: Message Object

## 5. Other APIs (Brief)

*   **Ratings (`/api/ratings`)**: `POST /` to submit a review for a completed trade.
*   **Requests (`/api/requests`)**: `GET /` and `POST /` to manage item requests.
*   **Push (`/api/push`)**: Used for VAPID subscriptions currently. Will need an endpoint like `POST /device-token` to save FCM tokens for Android users.
