import mongoose from 'mongoose'

const ratingSchema = new mongoose.Schema({
    trade_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Trade', required: true, unique: true },
    reviewer_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },   // buyer
    seller_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    score: { type: Number, required: true, min: 1, max: 5 },
    comment: { type: String, default: '' },
}, { timestamps: true })

export default mongoose.model('Rating', ratingSchema)
