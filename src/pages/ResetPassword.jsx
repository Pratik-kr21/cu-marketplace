import { useState, useEffect } from 'react'
import { Link, useSearchParams, useNavigate } from 'react-router-dom'
import { ShieldCheck, Eye, EyeOff } from 'lucide-react'
import { api } from '../lib/api'
import Button from '../components/ui/Button'
import Input from '../components/ui/Input'

export default function ResetPassword() {
    const [searchParams] = useSearchParams()
    const token = searchParams.get('token')
    const navigate = useNavigate()

    const [password, setPassword] = useState('')
    const [confirmPassword, setConfirmPassword] = useState('')
    const [showPass, setShowPass] = useState(false)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')
    const [success, setSuccess] = useState(false)

    useEffect(() => {
        if (!token) {
            setError('Invalid or missing reset token.')
        }
    }, [token])

    const onSubmit = async (e) => {
        e.preventDefault()
        if (password.length < 6) {
            setError('Password must be at least 6 characters.')
            return
        }
        if (password !== confirmPassword) {
            setError('Passwords do not match.')
            return
        }
        setLoading(true)
        setError('')
        try {
            await api.post('/api/auth/reset-password', { token, password })
            setSuccess(true)
            setTimeout(() => {
                navigate('/login')
            }, 3000)
        } catch (err) {
            setError(err.message || 'Failed to reset password. The link might be expired.')
        } finally {
            setLoading(false)
        }
    }

    if (success) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
                <div className="w-full max-w-md bg-white rounded-2xl border border-gray-200 shadow-card p-8 text-center animate-scale-in">
                    <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <ShieldCheck className="w-8 h-8 text-green-600" />
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">Password Reset!</h2>
                    <p className="text-sm text-gray-500 mb-6">
                        Your password has been successfully updated. You will be redirected to the login page...
                    </p>
                    <Link to="/login">
                        <Button className="w-full">Go to Login</Button>
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
                            <ShieldCheck className="w-6 h-6 text-gray-700" />
                        </div>
                        <h1 className="text-2xl font-bold text-gray-900">Set New Password</h1>
                        <p className="text-sm text-gray-500 mt-1 text-center">
                            Enter your new secure password below.
                        </p>
                    </div>

                    {error && (
                        <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg p-3 mb-4">{error}</div>
                    )}

                    {!token && (
                        <div className="text-center mt-4">
                            <Link to="/forgot-password">
                                <Button variant="secondary" className="w-full">Request New Link</Button>
                            </Link>
                        </div>
                    )}

                    {token && (
                        <form onSubmit={onSubmit} className="space-y-4">
                            <div>
                                <Input
                                    label="New Password"
                                    type={showPass ? "text" : "password"}
                                    placeholder="••••••••"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                />
                            </div>
                            <div>
                                <Input
                                    label="Confirm New Password"
                                    type={showPass ? "text" : "password"}
                                    placeholder="••••••••"
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    required
                                />
                                <button type="button" onClick={() => setShowPass(!showPass)} className="text-xs text-gray-400 hover:text-gray-700 mt-1.5 transition-colors flex items-center gap-1">
                                    {showPass ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />} {showPass ? 'Hide' : 'Show'} passwords
                                </button>
                            </div>
                            <Button type="submit" size="lg" loading={loading} className="w-full">Update Password</Button>
                        </form>
                    )}
                </div>
            </div>
        </div>
    )
}
