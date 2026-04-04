import { useState } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { ShoppingBag, Eye, EyeOff } from 'lucide-react'
import { useAuthStore } from '../store/authStore'
import { loginSchema } from '../lib/validators'
import { isBackendConfigured } from '../lib/api'
import Button from '../components/ui/Button'
import Input from '../components/ui/Input'

export default function Login() {
    const { signIn } = useAuthStore()
    const navigate = useNavigate()
    const location = useLocation()
    const from = location.state?.from?.pathname || '/marketplace'
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')
    const [showPass, setShowPass] = useState(false)

    const { register, handleSubmit, formState: { errors } } = useForm({ resolver: zodResolver(loginSchema) })

    const onSubmit = async (data) => {
        setLoading(true); setError('')
        try {
            await signIn(data)
            navigate(from, { replace: true })
        } catch (err) {
            setError(err.message || 'Login failed. Check your credentials.')
        } finally {
            setLoading(false)
        }
    }


    return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
            <div className="w-full max-w-md animate-scale-in">
                {/* Card */}
                <div className="bg-white rounded-2xl border border-gray-200 shadow-card p-8">
                    {/* Logo */}
                    <div className="flex flex-col items-center mb-8">
                        <img src="/Logo.svg" alt="CU Market Logo" className="h-24 w-auto object-contain mb-4" />
                        <h1 className="text-2xl font-bold text-gray-900">Welcome back</h1>
                        <p className="text-sm text-gray-500 mt-1">Sign in to your CU Marketplace account</p>
                    </div>

                    {error && (
                        <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg p-3 mb-4">{error}</div>
                    )}
                    {!isBackendConfigured && (
                        <div className="bg-amber-50 border border-amber-200 text-amber-800 text-sm rounded-lg p-3 mb-4">
                            Backend is not configured. Set <code>VITE_API_URL</code> (e.g. http://localhost:4000) in .env to connect.
                        </div>
                    )}

                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                        <Input label="CU Email" type="email" placeholder="23bce10055@cuchd.in" error={errors.email?.message} {...register('email')} />
                        <div>
                            <Input label="Password" type={showPass ? 'text' : 'password'} placeholder="••••••••" error={errors.password?.message} {...register('password')} />
                            <div className="flex items-center justify-between mt-1.5">
                                <button type="button" onClick={() => setShowPass(!showPass)} className="text-xs text-gray-400 hover:text-gray-700 transition-colors flex items-center gap-1">
                                    {showPass ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />} {showPass ? 'Hide' : 'Show'} password
                                </button>
                                <Link to="/forgot-password" className="text-xs text-brand-red hover:underline font-medium">Forgot Password?</Link>
                            </div>
                        </div>
                        <Button type="submit" size="lg" loading={loading} className="w-full">Sign In</Button>
                    </form>

                    <p className="text-center text-sm text-gray-500 mt-6">
                        Don't have an account?{' '}
                        <Link to="/signup" className="text-brand-red font-semibold hover:underline">Join Free</Link>
                    </p>
                </div>

                <p className="text-center text-xs text-gray-400 mt-4">
                    Sign in with your <strong>UID@cuchd.in</strong> — e.g. 23bce10055@cuchd.in
                </p>
            </div>
        </div>
    )
}
