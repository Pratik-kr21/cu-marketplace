import { useEffect, useState } from 'react'
import { useNavigate, useSearchParams, Link } from 'react-router-dom'
import { CheckCircle, XCircle, Loader2 } from 'lucide-react'
import { useAuthStore } from '../store/authStore'
import Button from '../components/ui/Button'

export default function VerifyEmail() {
    const [searchParams] = useSearchParams()
    const token = searchParams.get('token')
    const navigate = useNavigate()
    const { verifyEmail } = useAuthStore()

    const [status, setStatus] = useState('verifying') // verifying, success, error
    const [errorMsg, setErrorMsg] = useState('')

    useEffect(() => {
        if (!token) {
            setStatus('error')
            setErrorMsg('Verification token is missing from the URL.')
            return
        }

        verifyEmail(token)
            .then(() => {
                setStatus('success')
                // Wait a couple seconds then redirect to app
                setTimeout(() => {
                    navigate('/')
                }, 3000)
            })
            .catch(err => {
                setStatus('error')
                setErrorMsg(err.message || 'The verification link is invalid or has expired.')
            })
    }, [token, verifyEmail, navigate])

    return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl border border-gray-200 p-8 max-w-md w-full text-center shadow-sm animate-scale-in">
                {status === 'verifying' && (
                    <div className="flex flex-col items-center">
                        <Loader2 className="w-12 h-12 text-brand-red animate-spin mb-4" />
                        <h2 className="text-xl font-bold text-gray-900 mb-2">Verifying your email...</h2>
                        <p className="text-sm text-gray-500">Please wait while we confirm your email address.</p>
                    </div>
                )}

                {status === 'success' && (
                    <div className="flex flex-col items-center animate-slide-up">
                        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
                            <CheckCircle className="w-8 h-8 text-green-600" />
                        </div>
                        <h2 className="text-xl font-bold text-gray-900 mb-2">Email Verified!</h2>
                        <p className="text-sm text-gray-500 mb-6">Your account is now active. You are being redirected...</p>
                        <Button onClick={() => navigate('/')} className="w-full">Go to Marketplace Now</Button>
                    </div>
                )}

                {status === 'error' && (
                    <div className="flex flex-col items-center animate-slide-up">
                        <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
                            <XCircle className="w-8 h-8 text-red-600" />
                        </div>
                        <h2 className="text-xl font-bold text-gray-900 mb-2">Verification Failed</h2>
                        <p className="text-sm text-red-500 mb-6">{errorMsg}</p>
                        <Link to="/signup" className="w-full"><Button variant="outline" className="w-full">Back to Sign Up</Button></Link>
                    </div>
                )}
            </div>
        </div>
    )
}
