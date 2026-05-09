import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Plus, Bell, Clock, Search, X, MessageCircle, ArrowRightLeft, CheckCircle, Loader2 } from 'lucide-react'
import { useAuthStore } from '../store/authStore'
import { Link, useNavigate } from 'react-router-dom'
import { api } from '../lib/api'
import Modal from '../components/ui/Modal'
import Button from '../components/ui/Button'
import LazyImage from '../components/ui/LazyImage'
import Avatar from '../components/ui/Avatar'

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
    const navigate = useNavigate()
    const [requests, setRequests] = useState([])
    const [loading, setLoading] = useState(true)
    const [showModal, setShowModal] = useState(false)
    const [formData, setFormData] = useState({ title: '', description: '', category: CATEGORIES[0] })
    const [submitting, setSubmitting] = useState(false)

    // Offer Modal State
    const [offerModal, setOfferModal] = useState(false)
    const [selectedRequest, setSelectedRequest] = useState(null)
    const [myItems, setMyItems] = useState([])
    const [loadingMyItems, setLoadingMyItems] = useState(false)
    const [selectedItem, setSelectedItem] = useState(null)
    const [offerType, setOfferType] = useState('cash')
    const [cashAmount, setCashAmount] = useState('')
    const [offerMsg, setOfferMsg] = useState('')
    const [offerSending, setOfferSending] = useState(false)
    const [offerSuccess, setOfferSuccess] = useState(false)
    const [offerError, setOfferError] = useState('')

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
        if (!user) return navigate('/login')
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

    const handleOpenOfferModal = (req) => {
        if (!user) return navigate('/login')
        setSelectedRequest(req)
        setOfferModal(true)
        setLoadingMyItems(true)
        api.get('/api/items/my').then(data => {
            setMyItems(data || [])
        }).finally(() => setLoadingMyItems(false))
    }

    const handleSendOffer = async () => {
        if (!selectedItem) {
            setOfferError('Please select an item you have to offer.')
            return
        }
        if (offerType === 'cash' && !cashAmount) {
            setOfferError('Please enter the price you want for this item.')
            return
        }
        setOfferSending(true)
        setOfferError('')
        try {
            let offerDesc = `Responding to request: ${selectedRequest.title}`
            if (offerType === 'cash') offerDesc = `Offering ${selectedItem.title} for ₹${cashAmount}`
            else offerDesc = `Offering ${selectedItem.title} for Barter`

            await api.post('/api/trades', {
                item_id: selectedItem.id,
                buyer_id: selectedRequest.userId._id, // Requester is the buyer
                seller_id: user.id, // Me
                offer_item_desc: offerDesc,
                message: offerMsg.trim(),
                type: offerType,
                proposed_cash: offerType === 'cash' ? Number(cashAmount) : 0
            })
            setOfferSuccess(true)
            setTimeout(() => {
                setOfferModal(false)
                setOfferSuccess(false)
                setSelectedItem(null)
                setCashAmount('')
                setOfferMsg('')
            }, 2000)
        } catch (err) {
            setOfferError(err.message || 'Failed to send offer.')
        } finally {
            setOfferSending(false)
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
                                <Avatar 
                                    name={req.userId?.full_name} 
                                    src={req.userId?.avatar_url} 
                                    size="md" 
                                />
                                <div>
                                    <p className="font-semibold text-gray-900 leading-tight">{req.userId?.full_name}</p>
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
                            
                            {(!user || req.userId?._id !== user.id) && (
                                <button
                                    onClick={() => handleOpenOfferModal(req)}
                                    className="w-full block text-center py-2.5 bg-gray-900 text-white text-sm font-semibold rounded-xl hover:bg-gray-800 transition-colors"
                                >
                                    I have this item
                                </button>
                            )}
                        </motion.div>
                    ))}
                </div>
            )}

            {/* Request Modal */}
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

            {/* Offer Modal */}
            <Modal isOpen={offerModal} onClose={() => setOfferModal(false)} title="Make an Offer">
                {offerSuccess ? (
                    <div className="py-8 text-center">
                        <div className="w-14 h-14 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                            <CheckCircle className="w-7 h-7 text-green-600" />
                        </div>
                        <h3 className="font-bold text-gray-900 text-lg mb-1">Offer Sent!</h3>
                        <p className="text-sm text-gray-500">The requester will be notified of your offer.</p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        <p className="text-sm text-gray-600">
                            Select one of your items to offer to <strong>{selectedRequest?.userId?.full_name || 'User'}</strong>.
                        </p>

                        <div className="flex gap-2 p-1 bg-gray-100 rounded-lg">
                            <button
                                onClick={() => setOfferType('cash')}
                                className={`flex-1 text-sm font-medium py-1.5 rounded-md transition-colors ${offerType === 'cash' ? 'bg-white shadow-sm text-gray-900' : 'text-gray-500'}`}
                            >
                                Sell for Cash
                            </button>
                            <button
                                onClick={() => setOfferType('barter')}
                                className={`flex-1 text-sm font-medium py-1.5 rounded-md transition-colors ${offerType === 'barter' ? 'bg-white shadow-sm text-gray-900' : 'text-gray-500'}`}
                            >
                                Open to Barter
                            </button>
                        </div>

                        <div>
                            <label className="text-sm font-medium text-gray-700 block mb-2">Pick your item</label>
                            {loadingMyItems ? (
                                <div className="flex justify-center py-6">
                                    <Loader2 className="w-5 h-5 text-brand-red animate-spin" />
                                </div>
                            ) : myItems.length === 0 ? (
                                <div className="bg-gray-50 border border-dashed border-gray-200 rounded-xl p-4 text-center">
                                    <p className="text-sm text-gray-500 mb-2">You have no active listings to offer.</p>
                                    <Link to="/create-listing" className="text-sm text-brand-red font-semibold hover:underline">
                                        + Create a listing first
                                    </Link>
                                </div>
                            ) : (
                                <div className="grid grid-cols-2 gap-2 max-h-48 overflow-y-auto pr-1">
                                    {myItems.map(item => (
                                        <button
                                            key={item.id}
                                            onClick={() => setSelectedItem(item)}
                                            className={`flex items-center gap-2 p-2 rounded-xl border-2 text-left transition-all ${selectedItem?.id === item.id ? 'border-brand-red bg-brand-subtle' : 'border-gray-100 hover:border-gray-200'}`}
                                        >
                                            <div className="w-10 h-10 rounded bg-gray-50 overflow-hidden flex-shrink-0">
                                                {item.images?.[0] ? <LazyImage src={item.images[0]} alt="" /> : <div className="w-full h-full bg-gray-200" />}
                                            </div>
                                            <div className="min-w-0">
                                                <p className="text-[11px] font-bold text-gray-900 truncate">{item.title}</p>
                                                <p className="text-[9px] text-gray-500 uppercase">{item.is_free ? 'Free' : `₹${item.price}`}</p>
                                            </div>
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>

                        {offerType === 'cash' && (
                            <div>
                                <label className="text-sm font-medium text-gray-700 block mb-1">Your Price (₹)</label>
                                <input
                                    type="number"
                                    value={cashAmount}
                                    onChange={e => setCashAmount(e.target.value)}
                                    placeholder="How much do you want for it?"
                                    className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-brand-red/20"
                                />
                            </div>
                        )}

                        <div>
                            <label className="text-sm font-medium text-gray-700 block mb-1">Message (Optional)</label>
                            <textarea
                                value={offerMsg}
                                onChange={e => setOfferMsg(e.target.value)}
                                rows={2}
                                placeholder="I have this in great condition..."
                                className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-brand-red/20 resize-none"
                            />
                        </div>

                        {offerError && <p className="text-xs text-red-500">{offerError}</p>}

                        <div className="flex gap-3">
                            <Button variant="secondary" className="flex-1" onClick={() => setOfferModal(false)}>Cancel</Button>
                            <Button className="flex-1" onClick={handleSendOffer} disabled={offerSending || !selectedItem}>
                                {offerSending ? 'Sending...' : 'Send Offer'}
                            </Button>
                        </div>
                    </div>
                )}
            </Modal>
        </div>
    )
}
