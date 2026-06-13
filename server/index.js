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
import contactRoutes from './routes/contact.js'
import requestsRoutes from './routes/requests.js'

import { createServer } from 'http'
import { Server } from 'socket.io'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
await connectDB()

const app = express()
const PORT = process.env.PORT || 4000

const ALLOWED_ORIGINS = [
    'http://localhost:5173',
    'http://localhost:4173',
    'https://cumarketplace.vercel.app',
]

const corsOptions = {
    origin: (origin, callback) => {
        // Allow server-to-server requests (no origin) or whitelisted origins
        if (!origin || ALLOWED_ORIGINS.includes(origin)) {
            callback(null, true)
        } else {
            callback(new Error('Not allowed by CORS'))
        }
    },
    credentials: true,
}

const httpServer = createServer(app)
const io = new Server(httpServer, {
    cors: corsOptions
})

// Track connected users: Map<userId, socketId>
const connectedUsers = new Map()

io.on('connection', (socket) => {
    console.log('🔌 Socket connected:', socket.id)

    socket.on('register', (userId) => {
        if (userId) {
            connectedUsers.set(userId, socket.id)
            console.log(`👤 User ${userId} registered to socket ${socket.id}`)
        }
    })

    socket.on('disconnect', () => {
        for (const [userId, socketId] of connectedUsers.entries()) {
            if (socketId === socket.id) {
                connectedUsers.delete(userId)
                console.log(`🔌 User ${userId} disconnected`)
                break
            }
        }
    })
})

// Export for use in routes
export { io, connectedUsers }

app.use(cors(corsOptions))
app.use(express.json())

app.use('/api/auth', authRoutes)
app.use('/api/items', itemsRoutes)
app.use('/api/trades', tradesRoutes)
app.use('/api/conversations', conversationsRoutes)
app.use('/api/upload', uploadRoutes)
app.use('/api/push', pushRoutes)
app.use('/api/admin', adminRoutes)
app.use('/api/ratings', ratingsRoutes)
app.use('/api/contact', contactRoutes)
app.use('/api/requests', requestsRoutes)

app.use('/uploads', express.static(path.join(__dirname, 'uploads')))

app.get('/api/health', (req, res) => res.json({ ok: true }))

if (process.env.NODE_ENV !== 'production') {
    httpServer.listen(PORT, () => console.log(`[API] Server & Socket.io running at http://localhost:${PORT}`))
}

export default app
