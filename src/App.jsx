import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { useAuthStore } from './store/authStore'
import { ShoppingBag } from 'lucide-react'
import Navbar from './components/layout/Navbar'
import Footer from './components/layout/Footer'
import ProtectedRoute from './components/auth/ProtectedRoute'
import InstallPWA from './components/ui/InstallPWA'
import NotificationPrompt from './components/ui/NotificationPrompt'
import { connectSocket, disconnectSocket } from './lib/socket'
import { SpeedInsights } from '@vercel/speed-insights/react'

import Home from './pages/Home'
import Marketplace from './pages/Marketplace'
import ItemDetail from './pages/ItemDetail'
import CreateListing from './pages/CreateListing'
import Profile from './pages/Profile'
import TradeDashboard from './pages/TradeDashboard'
import Chat from './pages/Chat'
import Login from './pages/Login'
import Signup from './pages/Signup'
import VerifyEmail from './pages/VerifyEmail'
import ForgotPassword from './pages/ForgotPassword'
import ResetPassword from './pages/ResetPassword'
import AdminDashboard from './pages/AdminDashboard'
import DeveloperContact from './pages/DeveloperContact'
import Requests from './pages/Requests'

function AuthSplash() {
    return (
        <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-gray-900">
            <div className="flex flex-col items-center gap-4 animate-pulse">
                <img 
                    src="/Logo%20background.svg" 
                    alt="CU Market Logo" 
                    className="w-24 h-24 rounded-3xl object-contain shadow-2xl" 
                />
                <span className="text-white font-bold text-2xl tracking-tight">
                    CU <span className="text-brand-red">Market</span>
                </span>
            </div>
            <div className="mt-8 w-48 h-1 bg-gray-800 rounded-full overflow-hidden">
                <div className="h-full bg-brand-red rounded-full animate-[loading_1s_ease-in-out_infinite]" />
            </div>
        </div>
    )
}

function ScrollToTop() {
    const { pathname } = useLocation()
    useEffect(() => {
        window.scrollTo({
            top: 0,
            left: 0,
            behavior: 'instant'
        })
    }, [pathname])
    return null
}

export default function App() {
    const init = useAuthStore(s => s.init)
    const loading = useAuthStore(s => s.loading)
    const user = useAuthStore(s => s.user)
    const [logoLoaded, setLogoLoaded] = useState(false)
    
    useEffect(() => { init() }, [])

    useEffect(() => {
        const img = new Image()
        img.src = '/Logo.svg'
        img.onload = () => setLogoLoaded(true)
        img.onerror = () => setLogoLoaded(true) // fallback to prevent infinite load
    }, [])

    useEffect(() => {
        if (user && user.id) {
            connectSocket(user.id)
        } else {
            disconnectSocket()
        }
        
        return () => {
            disconnectSocket()
        }
    }, [user])

    if (loading || !logoLoaded) return <AuthSplash />

    return (
        <BrowserRouter>
            <div className="min-h-screen flex flex-col">
                <ScrollToTop />
                <InstallPWA />
                <NotificationPrompt />
                <Navbar />
                <main className="flex-1">
                    <Routes>
                        <Route path="/" element={<Home />} />
                        <Route path="/marketplace" element={<Marketplace />} />
                        <Route path="/requests" element={<Requests />} />
                        <Route path="/items/:id" element={<ItemDetail />} />
                        <Route path="/login" element={<Login />} />
                        <Route path="/signup" element={<Signup />} />
                        <Route path="/verify-email" element={<VerifyEmail />} />
                        <Route path="/forgot-password" element={<ForgotPassword />} />
                        <Route path="/reset-password" element={<ResetPassword />} />
                        <Route path="/create-listing" element={<ProtectedRoute><CreateListing /></ProtectedRoute>} />
                        <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
                        <Route path="/trades" element={<ProtectedRoute><TradeDashboard /></ProtectedRoute>} />
                        <Route path="/chat" element={<ProtectedRoute><Chat /></ProtectedRoute>} />
                        <Route path="/admin" element={<ProtectedRoute><AdminDashboard /></ProtectedRoute>} />
                        <Route path="/contact" element={<ProtectedRoute><DeveloperContact /></ProtectedRoute>} />
                        <Route path="*" element={
                            <div className="flex flex-col items-center justify-center py-24 gap-4">
                                <h1 className="text-6xl font-extrabold text-gray-200">404</h1>
                                <p className="text-gray-500">Page not found</p>
                                <a href="/" className="text-brand-red font-semibold hover:underline">Go Home</a>
                            </div>
                        } />
                    </Routes>
                </main>
                <Footer />
                <SpeedInsights />
            </div>
        </BrowserRouter>
    )
}