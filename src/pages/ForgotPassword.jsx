import { useState } from 'react'
import { Link } from 'react-router-dom'
import { ShoppingBag, KeyRound, CheckCircle } from 'lucide-react'
import { api } from '../lib/api'
import Button from '../components/ui/Button'
import Input from '../components/ui/Input'

export default function ForgotPassword() {
    const [email, setEmail] = useState('')
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')
    const [success, setSuccess] = useState(false)

    const onSubmit = async (e) => {
        e.preventDefault()
        if (!email) {
            setError('Please enter your email.')
            return
        }
        setLoading(true)
        setError('')
        try {
            await api.post('/api/auth/forgot-password', { email })
            setSuccess(true)
        } catch (err) {
            setError(err.message || 'Failed to send reset link.')
        } finally {
            setLoading(false)
        }
    }

    if (success) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
                <div className="w-full max-w-md bg-white rounded-2xl border border-gray-200 shadow-card p-8 text-center animate-scale-in">
                    <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <CheckCircle className="w-8 h-8 text-green-600" />
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">Check your email</h2>
                    <p className="text-sm text-gray-500 mb-6">
                        We have sent a password reset link to <strong>{email}</strong>. Please check your inbox and spam folder.
                    </p>
                    <Link to="/login">
                        <Button variant="secondary" className="w-full">Back to Login</Button>
                    </Link>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
            <div className="w-full max-w-md animate-scale-in">
                <div className="bg-white rounded-2xl border border-gray-200 shadow-card p-8">
                    <div className="flex flex-col items-center mb-6">
                        <div className="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center mb-3 shadow-sm border border-gray-200">
                            <KeyRound className="w-6 h-6 text-gray-700" />
                        </div>
                        <h1 className="text-2xl font-bold text-gray-900">Forgot Password</h1>
                        <p className="text-sm text-gray-500 mt-1 text-center">
                            Enter your CU email address and we'll send you a link to reset your password.
                        </p>
                    </div>

                    {error && (
                        <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg p-3 mb-4">{error}</div>
                    )}

                    <form onSubmit={onSubmit} className="space-y-4">
                        <Input
                            label="CU Email"
                            type="email"
                            placeholder="e.g. 23bce10055@cuchd.in"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />
                        <Button type="submit" size="lg" loading={loading} className="w-full">Send Reset Link</Button>
                    </form>

                    <div className="mt-6 text-center">
                        <Link to="/login" className="text-sm text-gray-500 hover:text-gray-900 font-medium">← Back to Login</Link>
                    </div>
                </div>
            </div>
        </div>
    )
}
