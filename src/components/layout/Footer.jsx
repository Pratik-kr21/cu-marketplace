import { Link } from 'react-router-dom'
import { ShoppingBag, Heart, CheckCircle } from 'lucide-react'
import { useAuthStore } from '../../store/authStore'

function CommunityLink() {
    const { user } = useAuthStore()

    if (user) {
        return (
            <span className="inline-flex items-center gap-1.5 text-green-400 font-medium">
                <CheckCircle className="w-3.5 h-3.5 flex-shrink-0" />
                You&apos;re part of our community! 🎓
            </span>
        )
    }

    return (
        <Link to="/signup" className="hover:text-white transition-colors">
            Join the community
        </Link>
    )
}

export default function Footer() {
    return (
        <footer className="bg-gray-900 text-gray-300 mt-auto">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
                    <div>
                        <div className="flex items-center gap-2 mb-3">
                            <img src="/Logo.svg" alt="CU Market Logo" className="h-12 w-auto object-contain rounded-xl" />
                            <span className="font-bold text-white text-base">CU Market</span>
                        </div>
                        <p className="text-sm text-gray-400 leading-relaxed max-w-xs mb-4">
                            The exclusive second-hand marketplace and barter platform for Chandigarh University students.
                        </p>
                        <Link to="/contact" className="inline-flex items-center gap-2 bg-gray-800 hover:bg-gray-700 text-gray-200 text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors border border-gray-700 w-fit">
                            👨‍💻 Contact Developers
                        </Link>
                    </div>
                    <div>
                        <h4 className="text-sm font-semibold text-white mb-3">Platform</h4>
                        <ul className="space-y-2 text-sm">
                            <li><Link to="/marketplace" className="hover:text-white transition-colors">Browse Items</Link></li>
                            <li><Link to="/create-listing" className="hover:text-white transition-colors">Sell an Item</Link></li>
                            <li><Link to="/trades" className="hover:text-white transition-colors">My Trades</Link></li>
                            <li><Link to="/chat" className="hover:text-white transition-colors">Messages</Link></li>
                        </ul>
                    </div>
                    <div>
                        <h4 className="text-sm font-semibold text-white mb-3">About</h4>
                        <ul className="space-y-2 text-sm">
                            <li><span className="text-gray-400">For CU Students only</span></li>
                            <li><span className="text-gray-400">Requires @cuchd.in email</span></li>
                            <li><CommunityLink /></li>
                        </ul>
                    </div>
                </div>
                <div className="border-t border-gray-800 mt-8 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
                    <p className="text-xs text-gray-400">
                        © {new Date().getFullYear()} CU Market. Made with <Heart className="w-3 h-3 inline text-brand-red" /> for CU students.
                    </p>
                    <p className="text-xs text-gray-400 text-center sm:text-right">
                        Designed &amp; Developed by <a href="https://linkedin.com/in/pratikkumar21" target="_blank" rel="noreferrer" className="text-white font-semibold hover:text-blue-400 transition-colors">Pratik Kumar</a> · All Rights Reserved. Unauthorized use or claiming of this project is strictly prohibited.
                    </p>
                </div>
            </div>
        </footer>
    )
}
