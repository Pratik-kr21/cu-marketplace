import { Link } from 'react-router-dom'
import { ShoppingBag, Github, Heart } from 'lucide-react'

export default function Footer() {
    return (
        <footer className="bg-gray-900 text-gray-300 mt-auto">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
                    <div>
                        <div className="flex items-center gap-2 mb-3">
                            <div className="w-7 h-7 bg-brand-red rounded-lg flex items-center justify-center">
                                <ShoppingBag className="w-4 h-4 text-white" />
                            </div>
                            <span className="font-bold text-white text-base">CU Market</span>
                        </div>
                        <p className="text-sm text-gray-400 leading-relaxed">
                            The exclusive second-hand marketplace and barter platform for Chandigarh University students.
                        </p>
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
                            <li><Link to="/signup" className="hover:text-white transition-colors">Join the community</Link></li>
                        </ul>
                    </div>
                </div>
                <div className="border-t border-gray-800 mt-8 pt-6 flex flex-col sm:flex-row items-center justify-between gap-3">
                    <p className="text-xs text-gray-500">© 2026 CU Marketplace. Made with <Heart className="w-3 h-3 inline text-brand-red" /> for CU students.</p>
                    <p className="text-xs text-gray-500">Developed by <a href="https://github.com/Pratik-kr21" className="hover:text-white transition-colors">Pratik kumar</a></p>
                </div>
            </div>
        </footer>
    )
}
