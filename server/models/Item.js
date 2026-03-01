import mongoose from 'mongoose'

const itemSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    title: { type: String, required: true },
    description: { type: String, required: true },
    price: { type: Number, default: null },
    is_barter_only: { type: Boolean, default: false },
    is_free: { type: Boolean, default: false },
    accept_hybrid: { type: Boolean, default: false },
    category: { type: String, required: true },
    condition: { type: String, required: true },
    imageUrls: [{ type: String }],
    hostel_area: { type: String, default: '' },
    quantity: { type: Number, default: 1 },
    is_available: { type: Boolean, default: true },
}, { timestamps: true })

export default mongoose.model('Item', itemSchema)
