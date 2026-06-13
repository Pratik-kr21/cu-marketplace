import { useState, useEffect } from 'react'
import { useNavigate, useSearchParams, Link } from 'react-router-dom'
import { CheckCircle, XCircle, Loader2, Mail } from 'lucide-react'
import { useAuthStore } from '../store/authStore'
import Button from '../components/ui/Button'
import Input from '../components/ui/Input'

export default function VerifyEmail() {
    const [searchParams] = useSearchParams()
    const email = searchParams.get('email')
    const navigate = useNavigate()
    const { verifyEmail, resendVerification } = useAuthStore()

    const [otp, setOtp] = useState('')
    const [status, setStatus] = useState('idle') // idle, verifying, success, error
    const [errorMsg, setErrorMsg] = useState('')
    const [resendStatus, setResendStatus] = useState('idle') // idle, sending, success, error
    const [resendMsg, setResendMsg] = useState('')
    const [cooldown, setCooldown] = useState(0)

    useEffect(() => {
        if (!email) {
            navigate('/login')
        }
    }, [email, navigate])

    useEffect(() => {
        let timer
        if (cooldown > 0) {
            timer = setInterval(() => setCooldown(prev => prev - 1), 1000)
        }
        return () => clearInterval(timer)
    }, [cooldown])

    const handleVerify = async (e) => {
        e.preventDefault()
        if (!otp || otp.length !== 6) {
            setErrorMsg('Please enter a valid 6-digit code.')
            return
        }

        setStatus('verifying')
        setErrorMsg('')
        try {
            await verifyEmail(email, otp)
            setStatus('success')
            // Wait a couple seconds then redirect to app
            setTimeout(() => {
                navigate('/')
            }, 2000)
        } catch (err) {
            setStatus('error')
            setErrorMsg(err.message || 'Invalid or expired OTP.')
        }
    }

    const handleResend = async () => {
        if (cooldown > 0) return

        setResendStatus('sending')
        setResendMsg('')
        try {
            const res = await resendVerification(email)
            setResendStatus('success')
            setResendMsg(res.message || 'A new verification code has been sent.')
            setCooldown(60) // 60 seconds cooldown
        } catch (err) {
            setResendStatus('error')
            setResendMsg(err.message || 'Failed to resend code.')
            // If the backend returns a rate limit error, it might say "Please wait X minutes"
            // We can set a fallback cooldown or just let them read the error.
            if (err.message && err.message.includes('wait')) {
                setCooldown(60)
            }
        }
    }

    if (status === 'success') {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
                <div className="bg-white rounded-2xl border border-gray-200 p-8 max-w-md w-full text-center shadow-sm animate-scale-in">
                    <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <CheckCircle className="w-8 h-8 text-green-600" />
                    </div>
                    <h2 className="text-xl font-bold text-gray-900 mb-2">Email Verified!</h2>
                    <p className="text-sm text-gray-500 mb-6">Your account is now active. You are being redirected...</p>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl border border-gray-200 p-8 max-w-md w-full shadow-sm animate-scale-in">
                <div className="text-center mb-6">
                    <div className="w-14 h-14 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Mail className="w-7 h-7 text-brand-red" />
                    </div>
                    <h2 className="text-xl font-bold text-gray-900 mb-2">Verify your email</h2>
                    <p className="text-sm text-gray-500">
                        We sent a 6-digit code to <br/>
                        <span className="font-semibold text-gray-900">{email}</span>
                    </p>
                </div>

                <form onSubmit={handleVerify} className="space-y-4">
                    <div>
                        <Input
                            label="Verification Code"
                            type="text"
                            placeholder="Enter 6-digit code"
                            value={otp}
                            onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                            maxLength={6}
                            className="text-center text-2xl tracking-[0.5em] font-mono"
                            autoFocus
                        />
                    </div>

                    {(status === 'error' || errorMsg) && (
                        <div className="bg-red-50 text-red-600 text-sm p-3 rounded-lg flex items-start gap-2">
                            <XCircle className="w-5 h-5 flex-shrink-0" />
                            <p>{errorMsg}</p>
                        </div>
                    )}

                    <Button 
                        type="submit" 
                        className="w-full" 
                        loading={status === 'verifying'}
                        disabled={otp.length !== 6 || status === 'verifying'}
                    >
                        Verify Email
                    </Button>
                </form>

                <div className="mt-8 pt-6 border-t border-gray-100 text-center">
                    <p className="text-sm text-gray-500 mb-3">Didn't receive the code?</p>
                    
                    {resendStatus === 'success' && (
                        <p className="text-sm text-green-600 mb-3">{resendMsg}</p>
                    )}
                    {resendStatus === 'error' && (
                        <p className="text-sm text-red-600 mb-3">{resendMsg}</p>
                    )}

                    <Button 
                        variant="outline" 
                        className="w-full" 
                        onClick={handleResend}
                        disabled={cooldown > 0 || resendStatus === 'sending'}
                    >
                        {resendStatus === 'sending' ? (
                            <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Sending...</>
                        ) : cooldown > 0 ? (
                            `Resend Code in ${cooldown}s`
                        ) : (
                            'Resend Code'
                        )}
                    </Button>
                </div>
            </div>
        </div>
    )
}
