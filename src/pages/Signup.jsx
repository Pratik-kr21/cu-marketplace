import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { ShoppingBag, AtSign, Info, CheckCircle } from 'lucide-react'
import { useAuthStore } from '../store/authStore'
import { signupSchema, CU_DEPARTMENTS, BOYS_HOSTELS, GIRLS_HOSTELS } from '../lib/validators'
import { isBackendConfigured } from '../lib/api'
import Button from '../components/ui/Button'
import Input from '../components/ui/Input'
import { Select } from '../components/ui/Input'

export default function Signup() {
    const { signUp } = useAuthStore()
    const navigate = useNavigate()
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')
    const [success, setSuccess] = useState(false)

    const { register, handleSubmit, watch, setValue, formState: { errors } } = useForm({
        resolver: zodResolver(signupSchema),
        defaultValues: { uid: '', email: '', full_name: '', department: '', hostel: '', password: '', confirmPassword: '' },
    })

    const uid = watch('uid')

    // Auto-derive email from UID whenever UID changes
    useEffect(() => {
        const clean = uid?.trim()
        if (clean && clean.length >= 2) {
            setValue('email', `${clean.toLowerCase()}@cuchd.in`, { shouldValidate: false })
        } else {
            setValue('email', '', { shouldValidate: false })
        }
    }, [uid, setValue])

    const derivedEmail = uid?.trim() ? `${uid.trim().toLowerCase()}@cuchd.in` : null

    const onSubmit = async (data) => {
        setLoading(true)
        setError('')
        try {
            await signUp(data)
            setSuccess(true)
        } catch (err) {
            setError(err.message || 'Signup failed. Please try again.')
        } finally {
            setLoading(false)
        }
    }

    if (success) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
                <div className="bg-white rounded-2xl border border-gray-200 p-8 max-w-md w-full text-center animate-scale-in">
                    <div className="w-14 h-14 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <CheckCircle className="w-7 h-7 text-green-600" />
                    </div>
                    <h2 className="text-xl font-bold text-gray-900 mb-2">Check your CU inbox!</h2>
                    <p className="text-sm text-gray-500 mb-1">We've sent a verification link to:</p>
                    <p className="text-sm font-semibold text-brand-red mb-6">{derivedEmail}</p>
                    <p className="text-xs text-gray-400 mb-6">Click it to activate your account, then you can sign in.</p>
                    <Link to="/login"><Button className="w-full">Go to Sign In</Button></Link>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
            <div className="w-full max-w-md animate-scale-in">
                <div className="bg-white rounded-2xl border border-gray-200 shadow-card p-8">
                    <div className="flex flex-col items-center mb-7">
                        <div className="w-12 h-12 bg-brand-red rounded-xl flex items-center justify-center mb-3 shadow-md">
                            <ShoppingBag className="w-6 h-6 text-white" />
                        </div>
                        <h1 className="text-2xl font-bold text-gray-900">Join CU Marketplace</h1>
                        <p className="text-sm text-gray-500 mt-1">Exclusively for Chandigarh University students</p>
                    </div>

                    {error && (
                        <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg p-3 mb-4">
                            {error}
                            {error.includes('already exists') && (
                                <Link to="/login" className="block mt-2 font-semibold text-brand-red hover:underline">
                                    Sign in to your account
                                </Link>
                            )}
                        </div>
                    )}

                    {!isBackendConfigured && (
                        <div className="bg-amber-50 border border-amber-200 text-amber-800 text-sm rounded-lg p-3 mb-4">
                            Backend is not configured. Set <code>VITE_API_URL</code> (e.g. http://localhost:4000) in .env to connect.
                        </div>
                    )}

                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                        <Input
                            label="Full Name *"
                            placeholder="Your full name"
                            error={errors.full_name?.message}
                            {...register('full_name')}
                        />

                        <div className="flex flex-col gap-1">
                            <label className="text-sm font-medium text-gray-700">
                                Student UID *
                                <span className="ml-1 text-xs text-gray-400 font-normal">(your email prefix)</span>
                            </label>
                            <input
                                placeholder="e.g. 23BCE10055"
                                autoCapitalize="characters"
                                className={`w-full h-10 border rounded-md px-3 text-sm uppercase tracking-wide bg-white text-gray-900 placeholder-gray-400
                                    focus:outline-none focus:ring-2 focus:ring-brand-red focus:border-transparent
                                    ${errors.uid ? 'border-red-500' : 'border-gray-200'}`}
                                {...register('uid')}
                            />
                            {errors.uid && <p className="text-xs text-red-500">{errors.uid.message}</p>}

                            {derivedEmail && (
                                <div className="flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-md px-3 py-2 mt-0.5">
                                    <AtSign className="w-4 h-4 text-brand-red flex-shrink-0" />
                                    <span className="text-sm text-gray-700 font-medium">{derivedEmail}</span>
                                    <span className="ml-auto text-xs text-green-600 font-semibold">Your login email</span>
                                </div>
                            )}
                            {errors.email && <p className="text-xs text-red-500">{errors.email.message}</p>}

                            <input type="hidden" {...register('email')} />
                        </div>

                        <Select label="Department *" error={errors.department?.message} {...register('department')}>
                            <option value="">Select your department...</option>
                            {CU_DEPARTMENTS.map(d => <option key={d} value={d}>{d}</option>)}
                        </Select>

                        <div className="flex flex-col gap-1">
                            <label className="text-sm font-medium text-gray-700">
                                Hostel <span className="text-gray-400 font-normal">(optional)</span>
                            </label>
                            <select
                                {...register('hostel')}
                                className="w-full h-10 border border-gray-200 rounded-md px-3 text-sm bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-brand-red focus:border-transparent"
                            >
                                <option value="">Select hostel...</option>
                                <optgroup label="Boys Hostels">
                                    {BOYS_HOSTELS.map(h => <option key={h} value={h}>{h}</option>)}
                                </optgroup>
                                <optgroup label="Girls Hostels">
                                    {GIRLS_HOSTELS.map(h => <option key={h} value={h}>{h}</option>)}
                                </optgroup>
                                <optgroup label="Other">
                                    <option value="Day Scholar">Day Scholar</option>
                                </optgroup>
                            </select>
                        </div>

                        <Input
                            label="Set Password *"
                            type="password"
                            placeholder="At least 8 characters"
                            error={errors.password?.message}
                            {...register('password')}
                        />

                        <Input
                            label="Confirm Password *"
                            type="password"
                            placeholder="Must match password"
                            error={errors.confirmPassword?.message}
                            {...register('confirmPassword')}
                        />

                        <div className="flex items-start gap-2 bg-blue-50 border border-blue-100 rounded-lg p-3">
                            <Info className="w-4 h-4 text-blue-500 flex-shrink-0 mt-0.5" />
                            <p className="text-xs text-blue-700 leading-relaxed">
                                Your login email is automatically set as <strong>UID@cuchd.in</strong>.
                                Make sure you can access this inbox for account verification.
                            </p>
                        </div>

                        <Button type="submit" size="lg" loading={loading} className="w-full">
                            Create Account
                        </Button>
                    </form>

                    <p className="text-center text-sm text-gray-500 mt-6">
                        Already have an account?{' '}
                        <Link to="/login" className="text-brand-red font-semibold hover:underline">Sign In</Link>
                    </p>
                </div>

                <p className="text-center text-xs text-gray-400 mt-4">
                    CU students only - Login with <strong>UID@cuchd.in</strong>
                </p>
            </div>
        </div>
    )
}
