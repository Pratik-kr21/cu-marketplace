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
    { icon: ShieldCheck, title: 'CUCHD Email Only', desc: 'Access restricted to verified @cuchd.in email addresses — your campus, your community.' },
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
                            Exclusively for Chandigarh University
                        </span>
                        <h1 className="text-4xl sm:text-5xl font-extrabold leading-tight mb-4">
                            Buy, Sell &<br />
                            <span className="text-brand-red">Barter</span> on Campus
                        </h1>
                        <p className="text-lg text-gray-300 mb-8 leading-relaxed">
                            The student marketplace made for CU. List your textbooks, electronics, hostel essentials — or trade directly with other students. <span className="text-white font-semibold">Zero platform fees, completely free to use.</span>
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
                        <div className="mt-8 flex items-center justify-start">
                            <a href="/cu-market-app.apk" download className="inline-flex items-center gap-2 text-sm text-gray-400 hover:text-white transition-colors border border-gray-700 hover:border-gray-500 rounded-full px-4 py-1.5 bg-gray-900/50 backdrop-blur-sm">
                                <svg className="w-4 h-4 text-green-500" viewBox="0 0 24 24" fill="currentColor">
                                    <path d="M17.523 15.3414C17.523 17.5312 19.2963 18.4239 19.3168 18.4343C19.3005 18.4907 19.0142 19.4673 18.3307 20.4632C17.7397 21.3242 17.1128 22.1809 16.147 22.1981C15.1969 22.2152 14.8812 21.6322 13.8239 21.6322C12.7661 21.6322 12.4173 22.1809 11.5168 22.2152C10.5828 22.25 9.85175 21.2891 9.25593 20.4285C7.99426 18.6019 7.02706 15.2536 7.6833 12.9554C8.01015 11.8105 8.7562 10.8415 9.80807 10.2647C10.7419 9.74232 11.6669 10.1558 12.2144 10.1558C12.7621 10.1558 13.9169 9.63852 15.0211 9.75822C15.4851 9.77884 16.7865 9.94391 17.6253 11.1685C17.5562 11.2123 15.9333 12.1583 15.95 14.0772C15.9678 16.3888 17.9048 17.1353 17.9254 17.1457C17.9254 17.1457 17.523 15.3414 17.523 15.3414ZM14.9298 7.37526C15.4439 6.75386 15.7876 5.88568 15.6888 5C14.9287 5.03154 14.0049 5.50868 13.4735 6.12646C13.0006 6.67406 12.5855 7.5583 12.6997 8.41113C13.5469 8.47702 14.4158 7.99665 14.9298 7.37526Z"/>
                                </svg>
                                Download iOS App
                            </a>
                            <span className="mx-2 text-gray-700">•</span>
                            <a href="/cu-market-app.apk" download className="inline-flex items-center gap-2 text-sm text-gray-400 hover:text-white transition-colors border border-gray-700 hover:border-gray-500 rounded-full px-4 py-1.5 bg-gray-900/50 backdrop-blur-sm">
                                <svg className="w-4 h-4 text-green-500" viewBox="0 0 24 24" fill="currentColor">
                                    <path d="M17.523 15.3214C17.523 17.5112 19.2963 18.4039 19.3168 18.4143C19.3005 18.4707 19.0142 19.4473 18.3307 20.4432C17.7397 21.3042 17.1128 22.1609 16.147 22.1781C15.1969 22.1952 14.8812 21.6122 13.8239 21.6122C12.7661 21.6122 12.4173 22.1609 11.5168 22.1952C10.5828 22.23 9.85175 21.2691 9.25593 20.4085C7.99426 18.5819 7.02706 15.2336 7.6833 12.9354C8.01015 11.7905 8.7562 10.8215 9.80807 10.2447C10.7419 9.72232 11.6669 10.1358 12.2144 10.1358C12.7621 10.1358 13.9169 9.61852 15.0211 9.73822C15.4851 9.75884 16.7865 9.92391 17.6253 11.1485C17.5562 11.1923 15.9333 12.1383 15.95 14.0572C15.9678 16.3688 17.9048 17.1153 17.9254 17.1257C17.9254 17.1257 17.523 15.3214 17.523 15.3214ZM14.9298 7.35526C15.4439 6.73386 15.7876 5.86568 15.6888 4.98C14.9287 5.01154 14.0049 5.48868 13.4735 6.10646C13.0006 6.65406 12.5855 7.5383 12.6997 8.39113C13.5469 8.45702 14.4158 7.97665 14.9298 7.35526Z" className="hidden"/>
                                    <path d="M17.523 15.3414C17.523 17.5312 19.2963 18.4239 19.3168 18.4343C19.3005 18.4907 19.0142 19.4673 18.3307 20.4632C17.7397 21.3242 17.1128 22.1809 16.147 22.1981C15.1969 22.2152 14.8812 21.6322 13.8239 21.6322C12.7661 21.6322 12.4173 22.1809 11.5168 22.2152C10.5828 22.25 9.85175 21.2891 9.25593 20.4285C7.99426 18.6019 7.02706 15.2536 7.6833 12.9554C8.01015 11.8105 8.7562 10.8415 9.80807 10.2647C10.7419 9.74232 11.6669 10.1558 12.2144 10.1558C12.7621 10.1558 13.9169 9.63852 15.0211 9.75822C15.4851 9.77884 16.7865 9.94391 17.6253 11.1685C17.5562 11.2123 15.9333 12.1583 15.95 14.0772C15.9678 16.3888 17.9048 17.1353 17.9254 17.1457C17.9254 17.1457 17.523 15.3414 17.523 15.3414ZM14.9298 7.37526C15.4439 6.75386 15.7876 5.88568 15.6888 5C14.9287 5.03154 14.0049 5.50868 13.4735 6.12646C13.0006 6.67406 12.5855 7.5583 12.6997 8.41113C13.5469 8.47702 14.4158 7.99665 14.9298 7.37526Z" className="hidden"/>
                                    <path d="M17.6001 10L12.0001 15.6L6.4001 10M12.0001 15V2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                    <path d="M5 20H19" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                                </svg>
                                Download Android App
                            </a>
                        </div>
                        <div className="flex items-center gap-6 mt-6 text-sm text-gray-400">
                            <span>✓ 100% free to use</span>
                            <span>✓ Campus verified</span>
                            <span>✓ Barter enabled</span>
                        </div>

                    </div>
                </div>
            </section>

            {/* Recent Listings */}
            <section className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
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

            {/* Categories */}
            <section className="max-w-7xl mx-auto px-4 sm:px-6 pb-12">
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

            {/* Features */}
            <section className="bg-gray-900 py-16">
                <div className="max-w-7xl mx-auto px-4 sm:px-6">
                    <h2 className="text-2xl font-bold text-white text-center mb-10">Why CU Market?</h2>
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
                <p className="text-gray-500 mb-6 max-w-md mx-auto">List your item in under 2 minutes. Reach thousands of cuchd students instantly.</p>
                <Link to="/create-listing" className="inline-flex items-center gap-2 bg-brand-red hover:bg-brand-dark text-white font-semibold px-8 py-3 rounded-lg transition-colors shadow-md">
                    Post a Listing — It's Free <ArrowRight className="w-4 h-4" />
                </Link>
            </section>
        </div>
    )
}
