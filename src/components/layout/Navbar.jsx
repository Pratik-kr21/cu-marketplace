import { useState, useEffect } from 'react'
import { Link, NavLink, useNavigate } from 'react-router-dom'
import { ShoppingBag, MessageCircle, User, Menu, X, Plus, LogOut, Package, ShieldAlert } from 'lucide-react'
import { useAuthStore } from '../../store/authStore'
import Avatar from '../ui/Avatar'
import NotificationBell from '../ui/NotificationBell'
import { api, isBackendConfigured } from '../../lib/api'

export default function Navbar() {
    const { user, profile, signOut, demoLogin } = useAuthStore()
    const [mobileOpen, setMobileOpen] = useState(false)
    const [userMenuOpen, setUserMenuOpen] = useState(false)
    const [unreadCount, setUnreadCount] = useState(0)
    const navigate = useNavigate()

    useEffect(() => {
        if (!user || !isBackendConfigured) return
        const fetchUnread = async () => {
            try {
                const res = await api.get('/api/conversations/unread-count')
                setUnreadCount(res.count || 0)
            } catch (err) { }
        }
        fetchUnread()
        const interval = setInterval(fetchUnread, 15000) // Poll every 15s
        return () => clearInterval(interval)
    }, [user])

    // Same fallback chain as Profile page
    const displayName =
        profile?.full_name ||
        user?.user_metadata?.full_name ||
        user?.email?.split('@')[0] ||
        'Student'

    const handleSignOut = async () => {
        await signOut()
        navigate('/')
    }

    const navLinks = [
        { to: '/marketplace', label: 'Browse' },
        { to: '/trades', label: 'My Trades' },
        { to: '/chat', label: 'Messages', badge: unreadCount },
    ]

    return (
        <header className="sticky top-0 z-40 bg-white border-b border-gray-200 shadow-sm">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
                {/* Logo */}
                <Link to="/" className="flex items-center gap-2 flex-shrink-0">
                        <img src="/Logo.svg" alt="CU Market Logo" className="h-12 w-auto object-contain rounded-xl" />
                        <span className="font-bold text-gray-900 text-lg hidden sm:block">
                            CU <span className="text-brand-red">Market</span>
                        </span>
                    </Link>

                {/* Desktop Nav */}
                <nav className="hidden md:flex items-center gap-1">
                        {navLinks.map(({ to, label, badge }) => (
                            <NavLink
                                key={to} to={to}
                                className={({ isActive }) =>
                                    `px-3 py-2 rounded-md text-sm font-medium transition-colors flex items-center gap-1.5 ${isActive ? 'text-brand-red bg-brand-subtle' : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'}`
                                }
                            >
                                {label}
                                {badge > 0 && <span className="bg-brand-red text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">{badge}</span>}
                            </NavLink>
                        ))}
                </nav>

                {/* Actions */}
                <div className="flex items-center gap-2">
                    {user ? (
                        <>
                            <Link to="/create-listing">
                                <button className="hidden sm:flex items-center gap-1.5 bg-brand-red hover:bg-brand-dark text-white text-sm font-semibold px-3 py-2 rounded-md transition-colors">
                                    <Plus className="w-4 h-4" /> Sell / Barter
                                </button>
                            </Link>
                            <Link to="/chat" className="p-2 text-gray-500 hover:text-gray-900 hover:bg-gray-100 rounded-md transition-colors relative">
                                <MessageCircle className="w-5 h-5" />
                                {unreadCount > 0 && (
                                    <span className="absolute top-1 right-1 w-2 h-2 bg-brand-red rounded-full"></span>
                                )}
                            </Link>
                            <NotificationBell />
                            {user.email === '24bcs10403@cuchd.in' && (
                                <Link to="/admin" className="p-2 text-brand-red hover:bg-red-50 rounded-md transition-colors relative" title="Admin Dashboard">
                                    <ShieldAlert className="w-5 h-5" />
                                </Link>
                            )}
                            {/* User menu */}
                            <div className="relative">
                                <button onClick={() => setUserMenuOpen(!userMenuOpen)} className="flex items-center gap-2 p-1 rounded-full hover:bg-gray-100 transition-colors">
                                    <Avatar name={displayName} src={profile?.avatar_url} size="sm" />
                                </button>
                                {userMenuOpen && (
                                    <div className="absolute right-0 top-full mt-1 w-56 bg-white rounded-lg shadow-dropdown border border-gray-100 py-1 animate-fade-in">
                                        <div className="px-4 py-2 border-b border-gray-100">
                                            <p className="text-sm font-semibold text-gray-900">{displayName}</p>
                                            <p className="text-xs text-gray-500 truncate">{profile?.email || user.email}</p>
                                        </div>
                                        <Link to="/profile" onClick={() => setUserMenuOpen(false)} className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors">
                                            <User className="w-4 h-4" /> My Profile
                                        </Link>
                                        <Link to="/profile" onClick={() => setUserMenuOpen(false)} className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors">
                                            <Package className="w-4 h-4" /> My Listings
                                        </Link>
                                        <button onClick={handleSignOut} className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors">
                                            <LogOut className="w-4 h-4" /> Sign Out
                                        </button>
                                    </div>
                                )}
                            </div>
                        </>
                    ) : (
                        <div className="flex items-center gap-2">
                            {!isBackendConfigured && (
                                <button onClick={demoLogin} className="text-sm text-gray-500 hover:text-brand-red transition-colors hidden sm:block">
                                    Demo Mode
                                </button>
                            )}
                            <Link to="/login" className="text-sm font-medium text-gray-700 hover:text-gray-900 px-3 py-2 hover:bg-gray-50 rounded-md transition-colors">Sign In</Link>
                            <Link to="/signup" className="text-sm font-semibold bg-brand-red hover:bg-brand-dark text-white px-3 py-2 rounded-md transition-colors">Join Free</Link>
                        </div>
                    )}
                    {/* Mobile toggle */}
                    <button onClick={() => setMobileOpen(!mobileOpen)} className="md:hidden p-2 text-gray-500 hover:bg-gray-100 rounded-md">
                        {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
                    </button>
                </div>
            </div>

            {/* Mobile Nav */}
            {mobileOpen && (
                <div className="md:hidden bg-white border-t border-gray-100 px-4 py-3 space-y-1 animate-fade-in">
                    {navLinks.map(({ to, label, badge }) => (
                        <NavLink key={to} to={to} onClick={() => setMobileOpen(false)}
                            className={({ isActive }) =>
                                `flex items-center justify-between px-3 py-2 rounded-md text-sm font-medium ${isActive ? 'text-brand-red bg-brand-subtle' : 'text-gray-700 hover:bg-gray-50'}`
                            }
                        >
                            <span>{label}</span>
                            {badge > 0 && <span className="bg-brand-red text-white text-[10px] font-bold px-2 py-0.5 rounded-full">{badge}</span>}
                        </NavLink>
                    ))}
                    {user && (
                        <Link to="/create-listing" onClick={() => setMobileOpen(false)} className="flex items-center gap-1.5 px-3 py-2 text-sm font-semibold text-brand-red">
                            <Plus className="w-4 h-4" /> Sell / Barter Item
                        </Link>
                    )}
                </div>
            )}
        </header>
    )
}

