import { useParams, useNavigate } from 'react-router-dom'
import { useItemStore } from '../store/itemStore'
import { useAuthStore } from '../store/authStore'
import { useState, useEffect } from 'react'
import { ArrowLeft, MapPin, Star, ArrowRightLeft, MessageCircle, ShieldCheck, Share2, CheckCircle, Loader2 } from 'lucide-react'
import Badge, { ConditionBadge } from '../components/ui/Badge'
import Avatar from '../components/ui/Avatar'
import Button from '../components/ui/Button'
import Modal from '../components/ui/Modal'
import { supabase, isSupabaseConfigured } from '../lib/supabase'
import { sendPushToUser } from '../lib/pushNotifications'

export default function ItemDetail() {
    const { id } = useParams()
    const navigate = useNavigate()
    const { items } = useItemStore()
    const { user } = useAuthStore()
    const [activeImg, setActiveImg] = useState(0)

    // Trade modal state
    const [tradeModal, setTradeModal] = useState(false)
    const [tradeMsg, setTradeMsg] = useState('')
    const [myItems, setMyItems] = useState([])
    const [selectedOffer, setSelectedOffer] = useState(null)
    const [loadingMyItems, setLoadingMyItems] = useState(false)
    const [tradeSending, setTradeSending] = useState(false)
    const [tradeSuccess, setTradeSuccess] = useState(false)
    const [tradeError, setTradeError] = useState('')

    // Message Seller state
    const [msgSending, setMsgSending] = useState(false)

    const item = items.find(i => i.id === id)
    const isSeller = user?.id === item?.seller_id || user?.id === item?.seller?.id

    // Load seller's own items when trade modal opens
    useEffect(() => {
        if (!tradeModal || !user || !isSupabaseConfigured) return
        setLoadingMyItems(true)
        supabase
            .from('items')
            .select('id, title, images, price, is_barter_only, is_free')
            .eq('seller_id', user.id)
            .eq('is_available', true)
            .order('created_at', { ascending: false })
            .then(({ data }) => {
                setMyItems(data || [])
                setLoadingMyItems(false)
            })
    }, [tradeModal, user])

    // ── Message Seller ────────────────────────────────────────────────────────
    const handleMessageSeller = async () => {
        if (!user) { navigate('/login'); return }
        if (!isSupabaseConfigured) return

        setMsgSending(true)
        try {
            // Upsert conversation (unique per buyer+item)
            const { data: convo, error } = await supabase
                .from('conversations')
                .upsert({
                    item_id: item.id,
                    buyer_id: user.id,
                    seller_id: item.seller_id,
                }, { onConflict: 'item_id,buyer_id' })
                .select('id')
                .single()

            if (error) throw error
            navigate('/chat', { state: { conversationId: convo.id } })
        } catch (err) {
            console.error('Failed to open chat:', err)
        } finally {
            setMsgSending(false)
        }
    }

    // ── Propose Trade ─────────────────────────────────────────────────────────
    const handleSendTrade = async () => {
        if (!tradeMsg.trim() && !selectedOffer) {
            setTradeError('Please select an item to offer or write a message.')
            return
        }
        setTradeSending(true)
        setTradeError('')
        try {
            if (isSupabaseConfigured) {
                const { error } = await supabase.from('trades').insert({
                    item_id: item.id,
                    buyer_id: user.id,
                    seller_id: item.seller_id,
                    type: 'barter',
                    offer_item_desc: selectedOffer
                        ? `${selectedOffer.title} (${selectedOffer.is_free ? 'Free' : selectedOffer.is_barter_only ? 'Barter' : `₹${selectedOffer.price}`})`
                        : 'Open trade offer',
                    message: tradeMsg.trim(),
                    status: 'pending',
                })
                if (error) throw error
                // Notify the seller (fire-and-forget)
                const buyerName = user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'Someone'
                sendPushToUser(
                    item.seller_id,
                    `New trade request for "${item.title}"`,
                    `${buyerName} wants to trade: ${selectedOffer?.title || 'Open offer'}`,
                    '/trades'
                )
            }
            setTradeSuccess(true)
            setTimeout(() => {
                setTradeModal(false)
                setTradeSuccess(false)
                setSelectedOffer(null)
                setTradeMsg('')
            }, 2000)
        } catch (err) {
            setTradeError(err.message || 'Failed to send trade request.')
        } finally {
            setTradeSending(false)
        }
    }

    if (!item) return (
        <div className="max-w-2xl mx-auto py-20 text-center">
            <p className="text-gray-500">Item not found.</p>
            <Button onClick={() => navigate('/marketplace')} className="mt-4">Browse Marketplace</Button>
        </div>
    )

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
                    <div className="flex flex-wrap gap-2">
                        <ConditionBadge condition={item.condition} />
                        {item.is_barter_only && <Badge variant="barter"><ArrowRightLeft className="w-3 h-3 mr-1 inline" />Barter Only</Badge>}
                        {item.accept_hybrid && <Badge variant="outline">Item + Cash OK</Badge>}
                        {item.category && <Badge variant="outline">{item.category}</Badge>}
                    </div>

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

                    <div>
                        <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-1">Description</h3>
                        <p className="text-sm text-gray-700 leading-relaxed">{item.description}</p>
                    </div>

                    {item.hostel_area && (
                        <div className="flex items-center gap-2 text-sm text-gray-500">
                            <MapPin className="w-4 h-4 text-brand-red" />
                            <span>{item.hostel_area} — Chandigarh University</span>
                        </div>
                    )}

                    {/* Seller card */}
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
                                <Button size="lg" className="flex-1" onClick={handleMessageSeller} disabled={msgSending}>
                                    {msgSending
                                        ? <Loader2 className="w-4 h-4 animate-spin" />
                                        : <MessageCircle className="w-4 h-4" />}
                                    {msgSending ? 'Opening…' : 'Message Seller'}
                                </Button>
                            )}
                            <Button variant="outline" size="lg" className="flex-1"
                                onClick={() => user ? setTradeModal(true) : navigate('/login')}>
                                <ArrowRightLeft className="w-4 h-4" /> Propose Trade
                            </Button>
                        </div>
                    )}
                    {isSeller && (
                        <div className="bg-brand-subtle border border-brand-light rounded-lg p-3 text-sm text-gray-700">
                            This is your listing.
                        </div>
                    )}

                    <button
                        onClick={() => { navigator.clipboard.writeText(window.location.href) }}
                        className="flex items-center gap-2 text-sm text-gray-400 hover:text-gray-700 transition-colors">
                        <Share2 className="w-4 h-4" /> Share listing
                    </button>
                </div>
            </div>

            {/* ── Propose Trade Modal ─────────────────────────────────────────── */}
            <Modal isOpen={tradeModal} onClose={() => { setTradeModal(false); setTradeSuccess(false); setTradeError(''); setSelectedOffer(null); setTradeMsg('') }} title="Propose a Trade">
                {tradeSuccess ? (
                    <div className="py-8 text-center">
                        <div className="w-14 h-14 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                            <CheckCircle className="w-7 h-7 text-green-600" />
                        </div>
                        <h3 className="font-bold text-gray-900 text-lg mb-1">Trade Request Sent!</h3>
                        <p className="text-sm text-gray-500">The seller will be notified of your offer.</p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        <p className="text-sm text-gray-600">
                            Offer one of your items in exchange for <strong>{item.title}</strong>.
                        </p>

                        {/* My Items selection */}
                        <div>
                            <label className="text-sm font-medium text-gray-700 block mb-2">
                                Select your item to offer
                            </label>
                            {loadingMyItems ? (
                                <div className="flex items-center justify-center py-6">
                                    <Loader2 className="w-5 h-5 text-gray-400 animate-spin" />
                                </div>
                            ) : myItems.length === 0 ? (
                                <div className="bg-gray-50 border border-dashed border-gray-200 rounded-lg p-4 text-center">
                                    <p className="text-sm text-gray-500 mb-2">You have no active listings to offer.</p>
                                    <button
                                        onClick={() => { setTradeModal(false); navigate('/create-listing') }}
                                        className="text-sm text-brand-red font-semibold hover:underline">
                                        + Post a listing first →
                                    </button>
                                </div>
                            ) : (
                                <div className="grid grid-cols-2 gap-2 max-h-48 overflow-y-auto">
                                    {myItems.map(mi => (
                                        <button
                                            key={mi.id}
                                            onClick={() => setSelectedOffer(selectedOffer?.id === mi.id ? null : mi)}
                                            className={`flex items-center gap-2 p-2.5 rounded-lg border-2 text-left transition-colors ${selectedOffer?.id === mi.id
                                                ? 'border-brand-red bg-brand-subtle'
                                                : 'border-gray-200 hover:border-gray-300'}`}
                                        >
                                            <div className="w-10 h-10 rounded bg-gray-100 flex-shrink-0 overflow-hidden">
                                                {mi.images?.[0]
                                                    ? <img src={mi.images[0]} alt="" className="w-full h-full object-cover" />
                                                    : <div className="w-full h-full bg-gray-200" />}
                                            </div>
                                            <div className="min-w-0">
                                                <p className="text-xs font-semibold text-gray-900 truncate">{mi.title}</p>
                                                <p className="text-xs text-gray-500">
                                                    {mi.is_free ? 'Free' : mi.is_barter_only ? 'Barter' : `₹${mi.price}`}
                                                </p>
                                            </div>
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Message */}
                        <div>
                            <label className="text-sm font-medium text-gray-700 block mb-1">Message to seller</label>
                            <textarea
                                value={tradeMsg}
                                onChange={e => setTradeMsg(e.target.value)}
                                rows={3}
                                placeholder="Hi! I'd like to trade my item for yours..."
                                className="w-full border border-gray-200 rounded-lg p-3 text-sm focus:outline-none focus:ring-2 focus:ring-brand-red resize-none"
                            />
                        </div>

                        {tradeError && (
                            <p className="text-sm text-red-600 bg-red-50 rounded-lg px-3 py-2">⚠️ {tradeError}</p>
                        )}

                        <div className="flex gap-3">
                            <Button variant="secondary" className="flex-1" onClick={() => setTradeModal(false)}>Cancel</Button>
                            <Button className="flex-1" onClick={handleSendTrade} disabled={tradeSending}>
                                {tradeSending ? <Loader2 className="w-4 h-4 animate-spin" /> : <ArrowRightLeft className="w-4 h-4" />}
                                {tradeSending ? 'Sending…' : 'Send Trade Request'}
                            </Button>
                        </div>
                    </div>
                )}
            </Modal>
        </div>
    )
}
