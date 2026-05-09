import mongoose from 'mongoose'

const messageSchema = new mongoose.Schema({
    conversation_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Conversation', required: true },
    sender_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    receiver_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    content: { type: String, required: true },
    read: { type: Boolean, default: false },
}, { timestamps: true })

// Create a TTL index to automatically delete messages 1 week after they are created
// 604800 seconds = 1 week
messageSchema.index({ createdAt: 1 }, { expireAfterSeconds: 604800 })

export default mongoose.model('Message', messageSchema)
