import mongoose from 'mongoose'

const conversationSchema = new mongoose.Schema({
    item_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Item', required: true },
    buyer_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    seller_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
}, { timestamps: true })

// Unique compound index: one conversation per buyer+item
conversationSchema.index({ item_id: 1, buyer_id: 1 }, { unique: true })

export default mongoose.model('Conversation', conversationSchema)
