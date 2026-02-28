import mongoose from 'mongoose'

const pushSubscriptionSchema = new mongoose.Schema({
    user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    endpoint: { type: String, required: true },
    p256dh: { type: String, required: true },
    auth: { type: String, required: true },
}, { timestamps: true })

pushSubscriptionSchema.index({ user_id: 1, endpoint: 1 }, { unique: true })

export default mongoose.model('PushSubscription', pushSubscriptionSchema)
