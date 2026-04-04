import mongoose from 'mongoose'

const tradeSchema = new mongoose.Schema({
    item_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Item', required: true },
    buyer_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    seller_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    desired_quantity: { type: Number, default: 1 },
    type: { type: String, default: 'barter' },
    offer_item_desc: { type: String, default: '' },
    message: { type: String, default: '' },
    proposed_items: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Item' }],
    proposed_cash: { type: Number, default: 0 },
    action_required_from: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    status: { type: String, enum: ['pending', 'accepted', 'declined', 'cancelled', 'completed'], default: 'pending' },
}, { timestamps: true })

export default mongoose.model('Trade', tradeSchema)
