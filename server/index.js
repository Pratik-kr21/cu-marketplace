import 'dotenv/config'
import express from 'express'
import path from 'path'
import { fileURLToPath } from 'url'
import cors from 'cors'
import { connectDB } from './config/db.js'
import authRoutes from './routes/auth.js'
import itemsRoutes from './routes/items.js'
import tradesRoutes from './routes/trades.js'
import conversationsRoutes from './routes/conversations.js'
import uploadRoutes from './routes/upload.js'
import pushRoutes from './routes/push.js'
import adminRoutes from './routes/admin.js'
import ratingsRoutes from './routes/ratings.js'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
await connectDB()

const app = express()
const PORT = process.env.PORT || 4000

app.use(cors({ origin: true, credentials: true }))
app.use(express.json())

app.use('/api/auth', authRoutes)
app.use('/api/items', itemsRoutes)
app.use('/api/trades', tradesRoutes)
app.use('/api/conversations', conversationsRoutes)
app.use('/api/upload', uploadRoutes)
app.use('/api/push', pushRoutes)
app.use('/api/admin', adminRoutes)
app.use('/api/ratings', ratingsRoutes)

app.use('/uploads', express.static(path.join(__dirname, 'uploads')))

app.get('/api/health', (req, res) => res.json({ ok: true }))

if (process.env.NODE_ENV !== 'production') {
    app.listen(PORT, () => console.log(`[API] http://localhost:${PORT}`))
}

export default app
