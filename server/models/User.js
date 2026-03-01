import mongoose from 'mongoose'
import bcrypt from 'bcryptjs'

const userSchema = new mongoose.Schema({
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    full_name: { type: String, default: '' },
    uid: { type: String, default: '' },
    department: { type: String, default: '' },
    hostel: { type: String, default: '' },
    avatar_url: { type: String, default: null },
    isVerified: { type: Boolean, default: false },
    emailVerificationExpires: { type: Date, default: null },
    resetPasswordToken: { type: String, default: null },
    resetPasswordExpires: { type: Date, default: null },
    verificationRequestCount: { type: Number, default: 0 },
    lastVerificationRequest: { type: Date, default: null },
}, { timestamps: true })

userSchema.index(
    { emailVerificationExpires: 1 },
    {
        expireAfterSeconds: 0,
        partialFilterExpression: { isVerified: false }
    }
)

userSchema.pre('save', async function (next) {
    if (!this.isModified('password')) return next()
    this.password = await bcrypt.hash(this.password, 10)
    next()
})

userSchema.methods.comparePassword = function (candidate) {
    return bcrypt.compare(candidate, this.password)
}

export default mongoose.model('User', userSchema)
