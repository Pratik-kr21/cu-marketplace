import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { useEffect } from 'react'
import { useAuthStore } from './store/authStore'
import Navbar from './components/layout/Navbar'
import Footer from './components/layout/Footer'
import ProtectedRoute from './components/auth/ProtectedRoute'

import Home from './pages/Home'
import Marketplace from './pages/Marketplace'
import ItemDetail from './pages/ItemDetail'
import CreateListing from './pages/CreateListing'
import Profile from './pages/Profile'
import TradeDashboard from './pages/TradeDashboard'
import Chat from './pages/Chat'
import Login from './pages/Login'
import Signup from './pages/Signup'

export default function App() {
    const init = useAuthStore(s => s.init)
    useEffect(() => { init() }, [])

    return (
        <BrowserRouter>
            <div className="min-h-screen flex flex-col">
                <Navbar />
                <main className="flex-1">
                    <Routes>
                        <Route path="/" element={<Home />} />
                        <Route path="/marketplace" element={<Marketplace />} />
                        <Route path="/items/:id" element={<ItemDetail />} />
                        <Route path="/login" element={<Login />} />
                        <Route path="/signup" element={<Signup />} />
                        <Route path="/create-listing" element={<ProtectedRoute><CreateListing /></ProtectedRoute>} />
                        <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
                        <Route path="/trades" element={<ProtectedRoute><TradeDashboard /></ProtectedRoute>} />
                        <Route path="/chat" element={<ProtectedRoute><Chat /></ProtectedRoute>} />
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
