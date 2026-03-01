import { Link } from 'react-router-dom'
import { ArrowRight, ShieldCheck, ArrowRightLeft, MapPin, TrendingUp, BookOpen, Laptop, Shirt, Coffee, Dumbbell, Plus } from 'lucide-react'
import { useItemStore } from '../store/itemStore'
import { useEffect } from 'react'
import ItemCard from '../components/marketplace/ItemCard'
import { useAuthStore } from '../store/authStore'

const categories = [
    { label: 'Textbooks', icon: BookOpen, color: 'bg-blue-50 text-blue-600', link: '?category=Textbooks' },
    { label: 'Electronics', icon: Laptop, color: 'bg-purple-50 text-purple-600', link: '?category=Electronics' },
    { label: 'Fashion', icon: Shirt, color: 'bg-pink-50 text-pink-600', link: '?category=Fashion+%26+Clothing' },
    { label: 'Hostel Essentials', icon: Coffee, color: 'bg-amber-50 text-amber-600', link: '?category=Hostel+Essentials' },
    { label: 'Sports', icon: Dumbbell, color: 'bg-green-50 text-green-600', link: '?category=Sports+%26+Fitness' },
    { label: 'All Items', icon: TrendingUp, color: 'bg-red-50 text-brand-red', link: '/marketplace' },
]

const features = [
    { icon: ShieldCheck, title: 'CU Students Only', desc: 'Access restricted to verified @cuchd.in email addresses — your campus, your community.' },
    { icon: ArrowRightLeft, title: 'Barter System', desc: 'No cash? No problem. Trade items directly with fellow students using our barter system.' },
    { icon: MapPin, title: 'Campus Meetup Points', desc: 'Safe, pre-defined meeting spots on campus for easy and secure item exchanges.' },
]

export default function Home() {
    const { items, fetchItems, loading } = useItemStore()
    const { user } = useAuthStore()

    useEffect(() => { fetchItems() }, [])

    const recent = items.slice(0, 4)

    return (
        <div className="min-h-screen">
            {/* Hero */}
            <section className="bg-gradient-to-r from-gray-800 via-gray-900 to-black text-white relative overflow-hidden">
                <div className="absolute inset-0">
                    <div className="absolute top-0 -left-20 w-[400px] h-[400px] bg-gradient-to-r from-slate-600/20 to-gray-600/10 rounded-full blur-3xl" />
                    <div className="absolute -bottom-20 -right-20 w-[600px] h-[600px] bg-red-500/10 rounded-full blur-3xl" />
                </div>
                <div className="max-w-7xl mx-auto px-4 sm:px-6 py-20 relative z-10">
                    <div className="max-w-2xl animate-slide-up">
                        <span className="inline-flex items-center gap-2 bg-brand-red/10 border border-brand-red/20 text-white text-xs font-semibold px-3 py-1.5 rounded-full mb-4">
                            🎓 Exclusively for Chandigarh University
                        </span>
                        <h1 className="text-4xl sm:text-5xl font-extrabold leading-tight mb-4">
                            Buy, Sell &<br />
                            <span className="text-brand-red">Barter</span> on Campus
                        </h1>
                        <p className="text-lg text-gray-300 mb-8 leading-relaxed">
                            The student marketplace made for CU. List your textbooks, electronics, hostel essentials — or trade directly with other students, no cash required.
                        </p>
                        <div className="flex flex-col sm:flex-row gap-3">
                            <Link to="/marketplace" className="inline-flex items-center justify-center gap-2 bg-brand-red hover:bg-brand-dark text-white font-semibold px-6 py-3 rounded-lg transition-colors shadow-lg">
                                Browse Listings <ArrowRight className="w-4 h-4" />
                            </Link>
                            {user ? (
                                <Link to="/create-listing" className="inline-flex items-center justify-center gap-2 bg-white/10 hover:bg-white/20 text-white font-semibold px-6 py-3 rounded-lg transition-colors border border-white/20">
                                    <Plus className="w-4 h-4" /> Sell / Barter an Item
                                </Link>
                            ) : (
                                <Link to="/signup" className="inline-flex items-center justify-center gap-2 bg-white/10 hover:bg-white/20 text-white font-semibold px-6 py-3 rounded-lg transition-colors border border-white/20">
                                    Join Free — @cuchd.in only
                                </Link>
                            )}
                        </div>
                        <div className="flex items-center gap-6 mt-8 text-sm text-gray-400">
                            <span>✓ 100% free to use</span>
                            <span>✓ Campus verified</span>
                            <span>✓ Barter enabled</span>
                        </div>
                    </div>
                </div>
            </section>

            {/* Categories */}
            <section className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Browse by Category</h2>
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
                    {categories.map(({ label, icon: Icon, color, link }) => (
                        <Link key={label} to={link.startsWith('/') ? link : `/marketplace${link}`}
                            className="flex flex-col items-center gap-2 p-4 bg-white border border-gray-200 rounded-xl hover:border-brand-red hover:shadow-card-hover transition-all duration-150 group">
                            <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${color} group-hover:scale-110 transition-transform`}>
                                <Icon className="w-6 h-6" />
                            </div>
                            <span className="text-xs font-semibold text-gray-700 text-center">{label}</span>
                        </Link>
                    ))}
                </div>
            </section>

            {/* Recent Listings */}
            <section className="max-w-7xl mx-auto px-4 sm:px-6 pb-12">
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-2xl font-bold text-gray-900">Recent Listings</h2>
                    <Link to="/marketplace" className="text-sm font-semibold text-brand-red flex items-center gap-1 hover:underline">
                        View all <ArrowRight className="w-4 h-4" />
                    </Link>
                </div>
                {loading ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                        {[1, 2, 3, 4].map(i => <div key={i} className="bg-white border border-gray-200 rounded-lg aspect-square animate-pulse" />)}
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                        {recent.map(item => <ItemCard key={item.id} item={item} />)}
                    </div>
                )}
            </section>

            {/* Features */}
            <section className="bg-gray-900 py-16">
                <div className="max-w-7xl mx-auto px-4 sm:px-6">
                    <h2 className="text-2xl font-bold text-white text-center mb-10">Why CU Marketplace?</h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {features.map(({ icon: Icon, title, desc }) => (
                            <div key={title} className="bg-gray-800 rounded-xl p-6 border border-gray-700 hover:border-brand-red/50 transition-colors">
                                <div className="w-10 h-10 bg-brand-red/20 rounded-lg flex items-center justify-center mb-4">
                                    <Icon className="w-5 h-5 text-brand-red" />
                                </div>
                                <h3 className="font-bold text-white mb-2">{title}</h3>
                                <p className="text-sm text-gray-400 leading-relaxed">{desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* CTA */}
            <section className="max-w-7xl mx-auto px-4 sm:px-6 py-16 text-center">
                <h2 className="text-3xl font-extrabold text-gray-900 mb-3">Got something to sell or trade?</h2>
                <p className="text-gray-500 mb-6 max-w-md mx-auto">List your item in under 2 minutes. Reach thousands of CU students instantly.</p>
                <Link to="/create-listing" className="inline-flex items-center gap-2 bg-brand-red hover:bg-brand-dark text-white font-semibold px-8 py-3 rounded-lg transition-colors shadow-md">
                    Post a Listing — It's Free <ArrowRight className="w-4 h-4" />
                </Link>
            </section>
        </div>
    )
}
