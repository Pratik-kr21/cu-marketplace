# CU Marketplace - Architecture

## Current Backend Architecture
- API Server: Express (`server/index.js`)
- DB Driver: Mongoose
- Database: MongoDB Atlas via `MONGODB_URI`
- Auth: JWT (`Authorization: Bearer <token>`)
- Uploads: Multer to local disk (`server/uploads`)

## Runtime Flow
1. Frontend calls API using `VITE_API_URL`.
2. Backend validates JWT for protected routes.
3. MongoDB collections store users, items, trades, conversations, messages, and push subscriptions.
4. Uploaded listing images are served from `/uploads/*`.

## Environment
Frontend (`.env.local`):
```env
VITE_API_URL=http://localhost:4000
```

Backend (`server/.env`):
```env
PORT=4000
MONGODB_URI=mongodb+srv://<db_user>:<db_password>@<cluster-name>.mongodb.net/cu-marketplace?retryWrites=true&w=majority&appName=<app-name>
JWT_SECRET=replace-with-a-long-random-secret
```

## MongoDB Atlas Connection Checklist
- Create an Atlas cluster.
- Create a database user and password.
- Add your IP in Atlas Network Access (or `0.0.0.0/0` for quick testing).
- Paste the SRV URI into `server/.env` as `MONGODB_URI`.
- Start backend and check for `[MongoDB] Connected` in logs.
