import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Plus, Bell, Clock, Search, X } from 'lucide-react'
import { useAuthStore } from '../store/authStore'
import { Link } from 'react-router-dom'
import { api } from '../lib/api'

const CATEGORIES = [
    'Textbooks',
    'Electronics',
    'Dorm Essentials',
    'Lab Equipment',
    'Bicycles',
    'Clothing/Uniforms',
    'Others'
]

export default function Requests() {
    const user = useAuthStore(s => s.user)
    const [requests, setRequests] = useState([])
    const [loading, setLoading] = useState(true)
    const [showModal, setShowModal] = useState(false)
    const [formData, setFormData] = useState({ title: '', description: '', category: CATEGORIES[0] })
    const [submitting, setSubmitting] = useState(false)

    useEffect(() => {
        fetchRequests()
    }, [])

    const fetchRequests = async () => {
        try {
            const data = await api.get('/api/requests')
            setRequests(data)
        } catch (err) {
            console.error('Failed to fetch requests', err)
        } finally {
            setLoading(false)
        }
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        if (!user) return alert('Please login to request an item.')
        setSubmitting(true)
        try {
            await api.post('/api/requests', formData)
            setFormData({ title: '', description: '', category: CATEGORIES[0] })
            setShowModal(false)
            fetchRequests()
        } catch (err) {
            console.error(err)
            alert(err.message || 'An error occurred.')
        } finally {
            setSubmitting(false)
        }
    }

    const handleDelete = async (id) => {
        if (!confirm('Are you sure you want to delete this request?')) return
        try {
            await api.delete(`/api/requests/${id}`)
            setRequests(requests.filter(r => r._id !== id))
        } catch (err) {
            console.error(err)
            alert(err.message || 'Failed to delete request')
        }
    }

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                <div>
                    <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight">Item Requests</h1>
                    <p className="text-gray-500 mt-2 text-lg">Looking for something specific? Ask the community!</p>
                </div>
                {user ? (
                    <button
                        onClick={() => setShowModal(true)}
                        className="flex items-center justify-center gap-2 px-6 py-3 bg-brand-red text-white font-semibold rounded-full hover:bg-brand-red/90 shadow-lg hover:shadow-brand-red/25 transition-all"
                    >
                        <Plus size={20} />
                        Request an Item
                    </button>
                ) : (
                    <Link
                        to="/login"
                        className="flex items-center justify-center gap-2 px-6 py-3 bg-gray-900 text-white font-semibold rounded-full hover:bg-gray-800 transition-all"
                    >
                        Login to Request
                    </Link>
                )}
            </div>

            {loading ? (
                <div className="flex justify-center py-20">
                    <div className="animate-spin rounded-full h-12 w-12 border-4 border-brand-red border-t-transparent"></div>
                </div>
            ) : requests.length === 0 ? (
                <div className="text-center py-24 bg-white rounded-3xl border border-gray-100 shadow-sm">
                    <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Search className="text-gray-400" size={32} />
                    </div>
                    <h3 className="text-xl font-bold text-gray-900">No requests right now</h3>
                    <p className="text-gray-500 mt-2">Be the first to request an item you need.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {requests.map(req => (
                        <motion.div
                            key={req._id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm hover:shadow-md transition-shadow relative"
                        >
                            {user && req.userId?._id === user._id && (
                                <button
                                    onClick={() => handleDelete(req._id)}
                                    className="absolute top-4 right-4 text-gray-400 hover:text-red-500 bg-gray-50 hover:bg-red-50 rounded-full p-2 transition-colors"
                                >
                                    <X size={16} />
                                </button>
                            )}
                            <div className="flex items-center gap-3 mb-4">
                                <img
                                    src={req.userId?.profilePic || `https://ui-avatars.com/api/?name=${encodeURIComponent(req.userId?.name || 'User')}&background=random`}
                                    alt="User"
                                    className="w-10 h-10 rounded-full bg-gray-100 object-cover"
                                />
                                <div>
                                    <p className="font-semibold text-gray-900 leading-tight">{req.userId?.name}</p>
                                    <p className="text-xs text-gray-500 flex items-center gap-1">
                                        <Clock size={12} />
                                        {new Date(req.createdAt).toLocaleDateString()}
                                    </p>
                                </div>
                            </div>
                            <span className="inline-block px-3 py-1 bg-gray-100 text-gray-700 text-xs font-semibold rounded-full mb-3">
                                {req.category}
                            </span>
                            <h3 className="text-lg font-bold text-gray-900 mb-2">{req.title}</h3>
                            <p className="text-gray-600 text-sm mb-6">{req.description}</p>
                            
                            {(!user || req.userId?._id !== user._id) && (
                                <Link
                                    to={`/chat?userId=${req.userId?._id}`}
                                    className="w-full block text-center py-2.5 bg-gray-900 text-white text-sm font-semibold rounded-xl hover:bg-gray-800 transition-colors"
                                >
                                    I have this item
                                </Link>
                            )}
                        </motion.div>
                    ))}
                </div>
            )}

            {/* Modal */}
            {showModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/40 backdrop-blur-sm">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="bg-white rounded-3xl w-full max-w-lg p-6 shadow-2xl relative"
                    >
                        <button
                            onClick={() => setShowModal(false)}
                            className="absolute top-4 right-4 text-gray-400 hover:text-gray-900"
                        >
                            <X size={24} />
                        </button>
                        <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                            <Bell className="text-brand-red" />
                            Request an Item
                        </h2>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">What do you need?</label>
                                <input
                                    type="text"
                                    required
                                    value={formData.title}
                                    onChange={e => setFormData({ ...formData, title: e.target.value })}
                                    placeholder="e.g., Engineering Graphics Drafter"
                                    className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-brand-red/20 focus:border-brand-red outline-none transition-all"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                                <select
                                    value={formData.category}
                                    onChange={e => setFormData({ ...formData, category: e.target.value })}
                                    className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-brand-red/20 focus:border-brand-red outline-none transition-all appearance-none"
                                >
                                    {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">More details</label>
                                <textarea
                                    required
                                    rows="3"
                                    value={formData.description}
                                    onChange={e => setFormData({ ...formData, description: e.target.value })}
                                    placeholder="Any specific brand, condition, or edition?"
                                    className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-brand-red/20 focus:border-brand-red outline-none transition-all resize-none"
                                />
                            </div>
                            <button
                                type="submit"
                                disabled={submitting}
                                className="w-full py-3 bg-brand-red text-white font-semibold rounded-xl hover:bg-brand-red/90 transition-colors disabled:opacity-50"
                            >
                                {submitting ? 'Broadcasting...' : 'Broadcast Request'}
                            </button>
                        </form>
                    </motion.div>
                </div>
            )}
        </div>
    )
}
