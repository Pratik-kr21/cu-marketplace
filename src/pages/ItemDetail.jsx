import { useParams, useNavigate } from 'react-router-dom'
import { useItemStore } from '../store/itemStore'
import { useAuthStore } from '../store/authStore'
import { useState } from 'react'
import { ArrowLeft, MapPin, Star, ArrowRightLeft, MessageCircle, ShieldCheck, Share2 } from 'lucide-react'
import Badge, { ConditionBadge } from '../components/ui/Badge'
import Avatar from '../components/ui/Avatar'
import Button from '../components/ui/Button'
import Modal from '../components/ui/Modal'

export default function ItemDetail() {
    const { id } = useParams()
    const navigate = useNavigate()
    const { items } = useItemStore()
    const { user } = useAuthStore()
    const [activeImg, setActiveImg] = useState(0)
    const [tradeModal, setTradeModal] = useState(false)
    const [tradeMsg, setTradeMsg] = useState('')

    const item = items.find(i => i.id === id)
    if (!item) return (
        <div className="max-w-2xl mx-auto py-20 text-center">
            <p className="text-gray-500">Item not found.</p>
            <Button onClick={() => navigate('/marketplace')} className="mt-4">Browse Marketplace</Button>
        </div>
    )

    const isSeller = user?.id === item.seller_id || user?.id === item.seller?.id

    return (
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 animate-fade-in">
            <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-900 mb-6 transition-colors">
                <ArrowLeft className="w-4 h-4" /> Back
            </button>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Images */}
                <div className="space-y-3">
                    <div className="aspect-square bg-gray-50 rounded-xl overflow-hidden border border-gray-200">
                        {item.images?.[activeImg] ? (
                            <img src={item.images[activeImg]} alt={item.title} className="w-full h-full object-cover" />
                        ) : (
                            <div className="w-full h-full flex items-center justify-center text-gray-300">No Image</div>
                        )}
                    </div>
                    {item.images?.length > 1 && (
                        <div className="flex gap-2">
                            {item.images.map((img, i) => (
                                <button key={i} onClick={() => setActiveImg(i)}
                                    className={`w-16 h-16 rounded-lg overflow-hidden border-2 transition-colors ${i === activeImg ? 'border-brand-red' : 'border-gray-200'}`}>
                                    <img src={img} alt="" className="w-full h-full object-cover" />
                                </button>
                            ))}
                        </div>
                    )}
                </div>

                {/* Details */}
                <div className="space-y-5">
                    {/* Badges */}
                    <div className="flex flex-wrap gap-2">
                        <ConditionBadge condition={item.condition} />
                        {item.is_barter_only && <Badge variant="barter"><ArrowRightLeft className="w-3 h-3 mr-1 inline" />Barter Only</Badge>}
                        {item.accept_hybrid && <Badge variant="outline">Item + Cash OK</Badge>}
                        {item.category && <Badge variant="outline">{item.category}</Badge>}
                    </div>

                    {/* Title & Price */}
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900 mb-2">{item.title}</h1>
                        {item.is_barter_only ? (
                            <p className="text-xl font-bold text-gray-900 flex items-center gap-2">
                                <ArrowRightLeft className="w-5 h-5 text-brand-red" /> Open to Barter
                            </p>
                        ) : (
                            <p className="text-3xl font-extrabold text-brand-red">
                                {item.is_free ? 'FREE' : `₹${item.price?.toLocaleString('en-IN')}`}
                            </p>
                        )}
                    </div>

                    {/* Description */}
                    <div>
                        <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-1">Description</h3>
                        <p className="text-sm text-gray-700 leading-relaxed">{item.description}</p>
                    </div>

                    {/* Location */}
                    {item.hostel_area && (
                        <div className="flex items-center gap-2 text-sm text-gray-500">
                            <MapPin className="w-4 h-4 text-brand-red" />
                            <span>{item.hostel_area} — Chandigarh University</span>
                        </div>
                    )}

                    {/* Seller */}
                    <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
                        <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">Seller</h3>
                        <div className="flex items-center gap-3">
                            <Avatar name={item.seller?.full_name} src={item.seller?.avatar_url} size="md" />
                            <div>
                                <p className="font-semibold text-gray-900">{item.seller?.full_name || 'CU Student'}</p>
                                <p className="text-xs text-gray-500">{item.seller?.department}</p>
                                {item.rating && (
                                    <span className="flex items-center gap-1 text-xs text-amber-600 font-semibold">
                                        <Star className="w-3 h-3 fill-amber-400 text-amber-400" /> {item.rating} rating
                                    </span>
                                )}
                            </div>
                        </div>
                        <div className="flex items-center gap-1 mt-3 text-xs text-green-600">
                            <ShieldCheck className="w-3.5 h-3.5" /> Verified CU Student (@cuchd.in)
                        </div>
                    </div>

                    {/* Action buttons */}
                    {!isSeller && (
                        <div className="flex flex-col sm:flex-row gap-3">
                            {!item.is_barter_only && (
                                <Button size="lg" className="flex-1" onClick={() => user ? alert('Message feature — connect Supabase to enable') : navigate('/login')}>
                                    <MessageCircle className="w-4 h-4" /> Message Seller
                                </Button>
                            )}
                            <Button variant="outline" size="lg" className="flex-1" onClick={() => user ? setTradeModal(true) : navigate('/login')}>
                                <ArrowRightLeft className="w-4 h-4" /> Propose Trade
                            </Button>
                        </div>
                    )}
                    {isSeller && (
                        <div className="bg-brand-subtle border border-brand-light rounded-lg p-3 text-sm text-gray-700">
                            This is your listing. <button className="text-brand-red font-semibold hover:underline">Edit it</button>
                        </div>
                    )}

                    <button className="flex items-center gap-2 text-sm text-gray-400 hover:text-gray-700 transition-colors">
                        <Share2 className="w-4 h-4" /> Share listing
                    </button>
                </div>
            </div>

            {/* Propose Trade Modal */}
            <Modal isOpen={tradeModal} onClose={() => setTradeModal(false)} title="Propose a Trade">
                <div className="space-y-4">
                    <p className="text-sm text-gray-600">Offer one of your items in exchange for <strong>{item.title}</strong>.</p>
                    <div className="bg-gray-50 rounded-lg p-3 text-sm text-gray-500 text-center">
                        Connect Supabase to enable full barter functionality. Your listings will appear here.
                    </div>
                    <div>
                        <label className="text-sm font-medium text-gray-700 block mb-1">Message to seller</label>
                        <textarea value={tradeMsg} onChange={e => setTradeMsg(e.target.value)} rows={3}
                            placeholder="Hi! I'd like to trade my [item] for yours..."
                            className="w-full border border-gray-200 rounded-md p-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-red resize-none" />
                    </div>
                    <div className="flex gap-3">
                        <Button variant="secondary" className="flex-1" onClick={() => setTradeModal(false)}>Cancel</Button>
                        <Button className="flex-1" onClick={() => { alert('Trade request sent! (connect Supabase for full functionality)'); setTradeModal(false) }}>
                            Send Trade Request
                        </Button>
                    </div>
                </div>
            </Modal>
        </div>
    )
}
