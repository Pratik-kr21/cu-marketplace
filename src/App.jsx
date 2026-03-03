import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom'
import { useEffect } from 'react'
import { useAuthStore } from './store/authStore'
import { ShoppingBag } from 'lucide-react'
import Navbar from './components/layout/Navbar'
import Footer from './components/layout/Footer'
import ProtectedRoute from './components/auth/ProtectedRoute'
import InstallPWA from './components/ui/InstallPWA'
import NotificationPrompt from './components/ui/NotificationPrompt'

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

function AuthSplash() {
    return (
        <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-gray-900">
            <div className="flex items-center gap-3 animate-pulse">
                <div className="w-10 h-10 bg-brand-red rounded-xl flex items-center justify-center shadow-lg">
                    <ShoppingBag className="w-5 h-5 text-white" />
                </div>
                <span className="text-white font-bold text-xl tracking-tight">
                    CU <span className="text-brand-red">Market</span>
                </span>
            </div>
            <div className="mt-6 w-40 h-1 bg-gray-800 rounded-full overflow-hidden">
                <div className="h-full bg-brand-red rounded-full animate-[loading_1s_ease-in-out_infinite]" />
            </div>
        </div>
    )
}

function ScrollToTop() {
    const { pathname } = useLocation()
    useEffect(() => { window.scrollTo(0, 0) }, [pathname])
    return null
}

export default function App() {
    const init = useAuthStore(s => s.init)
    const loading = useAuthStore(s => s.loading)
    useEffect(() => { init() }, [])

    if (loading) return <AuthSplash />

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
            </div>
        </BrowserRouter>
    )
}