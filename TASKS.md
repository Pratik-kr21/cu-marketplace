# CU Marketplace - Task Tracker
> Last updated: 2026-02-28

## Done
- [x] Migrated app runtime from Supabase to Node.js + Express + MongoDB.
- [x] Replaced frontend data access with API client (`src/lib/api.js`).
- [x] Added MongoDB connection via `server/config/db.js`.
- [x] Added Mongoose models and API routes for core entities.
- [x] Removed Supabase env usage from local frontend configuration.
- [x] Updated docs/environment examples for MongoDB Atlas.

## Next
- [ ] Add input validation middleware on all API routes.
- [ ] Add automated API tests.
- [ ] Move image uploads from local disk to cloud object storage (optional).
- [ ] Add production CORS allowlist.
- [ ] Add rate limiting and request logging.
