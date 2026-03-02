import mongoose from 'mongoose'

const messageSchema = new mongoose.Schema({
    conversation_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Conversation', required: true },
    sender_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    receiver_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    content: { type: String, required: true },
    read: { type: Boolean, default: false },
}, { timestamps: true })

// Create a TTL index to automatically delete messages 24 hours after they are created
// 86400 seconds = 24 hours
messageSchema.index({ createdAt: 1 }, { expireAfterSeconds: 86400 })

export default mongoose.model('Message', messageSchema)
