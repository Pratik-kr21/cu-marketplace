import mongoose from 'mongoose'

const itemRequestSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    title: { type: String, required: true },
    description: { type: String, required: true },
    category: { type: String, required: true },
    status: { type: String, enum: ['active', 'fulfilled'], default: 'active' },
}, { timestamps: true })

export default mongoose.model('ItemRequest', itemRequestSchema)
