import mongoose from 'mongoose'

export async function connectDB() {
    try {
        await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/cu-marketplace')
        console.log('[MongoDB] Connected')
    } catch (err) {
        console.error('[MongoDB] Connection error:', err.message)
        process.exit(1)
    }
}
