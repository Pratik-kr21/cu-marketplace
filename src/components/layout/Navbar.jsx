import { useState, useEffect } from 'react'
import { Link, NavLink, useNavigate } from 'react-router-dom'
import { ShoppingBag, MessageCircle, User, Menu, X, Plus, LogOut, Package, ShieldAlert, Github, Linkedin } from 'lucide-react'
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
            <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 relative flex items-center justify-between">
                
                {/* Left Section: Logo & Nav */}
                <div className="flex items-center gap-6">
                    <Link to="/" className="flex items-center gap-2 flex-shrink-0">
                        <div className="w-8 h-8 bg-brand-red rounded-lg flex items-center justify-center shadow-sm">
                            <ShoppingBag className="w-4 h-4 text-white" />
                        </div>
                        <span className="font-bold text-gray-900 text-lg hidden sm:block">
                            CU <span className="text-brand-red">Market</span>
                        </span>
                    </Link>

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
                </div>

                {/* Center Section: Developer Credit (Absolutely Centered) */}
                <div className="hidden xl:flex absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 flex-col items-center justify-center whitespace-nowrap z-10">
                    <span className="text-[10px] font-medium text-gray-400 text-center uppercase tracking-widest leading-none mb-1">Developed by</span>
                    <div className="flex items-center gap-1.5">
                        <span className="text-xs font-semibold text-gray-700">Pratik Kumar</span>
                        <span className="text-gray-300">·</span>
                        <a
                            href="https://www.linkedin.com/in/kumarpratik21/"
                            target="_blank"
                            rel="noopener noreferrer"
                            title="LinkedIn Profile"
                            className="flex items-center gap-0.5 text-[#0077B5] hover:text-[#005885] transition-colors group"
                        >
                            <Linkedin className="w-3.5 h-3.5" />
                        </a>
                        <a
                            href="https://github.com/Pratik-kr21"
                            target="_blank"
                            rel="noopener noreferrer"
                            title="GitHub Profile"
                            className="flex items-center gap-0.5 text-gray-600 hover:text-gray-900 transition-colors"
                        >
                            <Github className="w-3.5 h-3.5" />
                        </a>
                    </div>
                </div>

                {/* Right Section: Actions */}
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

