import { ArrowRightLeft, Clock, CheckCircle, XCircle, RefreshCw, Star, Loader2 } from 'lucide-react'
import { useAuthStore } from '../store/authStore'
import { api, isBackendConfigured } from '../lib/api'
import Button from '../components/ui/Button'
import Modal from '../components/ui/Modal'
import LazyImage from '../components/ui/LazyImage'
import { Link } from 'react-router-dom'
import { useState, useEffect, useCallback } from 'react'

const StatusBadge = ({ status }) => {
    const map = {
        pending: ['bg-amber-50 text-amber-700 border-amber-200', 'Pending'],
        accepted: ['bg-green-50 text-green-700 border-green-200', 'Accepted'],
        declined: ['bg-red-50 text-red-700 border-red-200', 'Declined'],
        cancelled: ['bg-gray-100 text-gray-500 border-gray-200', 'Cancelled'],
        completed: ['bg-blue-50 text-blue-700 border-blue-200', 'Completed'],
    }
    const [cls, label] = map[status] || map.pending
    return (
        <span className={`text-xs font-semibold px-2.5 py-0.5 rounded-full border ${cls}`}>
            {label}
        </span>
    )
}

// ⭐ Star Rating Modal
function RateSellerModal({ trade, onClose, onSubmitted }) {
    const [score, setScore] = useState(0)
    const [hovered, setHovered] = useState(0)
    const [comment, setComment] = useState('')
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')

    const handleSubmit = async () => {
        if (!score) return setError('Please select a star rating.')
        setLoading(true)
        setError('')
        try {
            await api.post('/api/ratings', { trade_id: trade.id, score, comment })
            onSubmitted(trade.id, score)
            onClose()
        } catch (err) {
            setError(err.message || 'Failed to submit rating.')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 animate-fade-in">
            <div className="bg-white rounded-2xl shadow-modal max-w-sm w-full p-6 animate-scale-in">
                <h3 className="text-lg font-bold text-gray-900 text-center mb-1">Rate the Seller</h3>
                <p className="text-sm text-gray-500 text-center mb-5">
                    How was your experience with <strong>{trade.seller?.full_name || 'the seller'}</strong>?
                </p>

                {/* Stars */}
                <div className="flex justify-center gap-2 mb-5">
                    {[1, 2, 3, 4, 5].map(s => (
                        <button
                            key={s}
                            onMouseEnter={() => setHovered(s)}
                            onMouseLeave={() => setHovered(0)}
                            onClick={() => setScore(s)}
                            className="transition-transform hover:scale-110"
                        >
                            <Star
                                className={`w-9 h-9 transition-colors ${s <= (hovered || score)
                                        ? 'fill-amber-400 text-amber-400'
                                        : 'text-gray-200'
                                    }`}
                            />
                        </button>
                    ))}
                </div>
                {score > 0 && (
                    <p className="text-center text-sm font-medium text-amber-600 mb-4">
                        {['', 'Poor', 'Fair', 'Good', 'Great', 'Excellent!'][score]}
                    </p>
                )}

                {/* Comment */}
                <textarea
                    value={comment}
                    onChange={e => setComment(e.target.value)}
                    placeholder="Optional: leave a comment for the seller…"
                    rows={3}
                    maxLength={300}
                    className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-800 resize-none focus:outline-none focus:ring-2 focus:ring-brand-red/20 focus:border-brand-red mb-4"
                />

                {error && <p className="text-xs text-red-600 text-center mb-3">{error}</p>}

                <div className="flex gap-3">
                    <button
                        onClick={onClose}
                        disabled={loading}
                        className="flex-1 px-4 py-2.5 border border-gray-200 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleSubmit}
                        disabled={loading || !score}
                        className="flex-1 px-4 py-2.5 bg-amber-500 hover:bg-amber-600 disabled:opacity-50 text-white rounded-lg text-sm font-semibold transition-colors flex items-center justify-center gap-2"
                    >
                        {loading ? <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <Star className="w-4 h-4" />}
                        Submit Rating
                    </button>
                </div>
            </div>
        </div>
    )
}

function CounterOfferModal({ trade, currentUser, onClose, onSubmitted }) {
    const [theirItems, setTheirItems] = useState([])
    const [loadingItems, setLoadingItems] = useState(true)
    const [selectedOffers, setSelectedOffers] = useState(trade.proposed_items || [])
    const [cashAmount, setCashAmount] = useState(trade.proposed_cash || '')
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')

    const targetUserId = trade.seller_id === currentUser.id ? trade.buyer_id : trade.seller_id

    useEffect(() => {
        api.get(`/api/items/user/${targetUserId}`).then(data => {
            setTheirItems(data || [])
            setLoadingItems(false)
        })
    }, [targetUserId])

    const handleSubmit = async () => {
        if (selectedOffers.length === 0 && !cashAmount) {
             return setError('Please select items or specify a cash amount.')
        }
        setLoading(true)
        setError('')
        try {
            const titles = selectedOffers.map(o => o.title).join(', ')
            const offerDesc = `Counter: ${titles ? titles + ' ' : ''}${cashAmount ? '+ ₹' + cashAmount : ''}`
            
             await api.patch(`/api/trades/${trade.id}`, {
                 status: 'counter_offer',
                 proposed_items: selectedOffers.map(o => o.id),
                 proposed_cash: Number(cashAmount) || 0,
                 offer_item_desc: offerDesc
             })
             onSubmitted()
             onClose()
        } catch(err) {
             setError(err.message || 'Failed to send counter offer')
        } finally {
             setLoading(false)
        }
    }

    return (
        <Modal isOpen={true} onClose={onClose} title="Propose Counter Offer">
            <div className="space-y-4">
                <p className="text-sm text-gray-600">
                    Propose a new deal by selecting items from their inventory or requesting extra cash.
                </p>
                
                <div>
                    <label className="text-sm font-medium text-gray-700 block mb-2">Select items (Multi-select)</label>
                    {loadingItems ? (
                        <div className="flex justify-center py-6">
                            <Loader2 className="w-5 h-5 text-gray-400 animate-spin" />
                        </div>
                    ) : theirItems.length === 0 ? (
                        <div className="bg-gray-50 border border-dashed border-gray-200 rounded-lg p-4 text-center">
                            <p className="text-sm text-gray-500">They have no active listings left to request.</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-2 gap-2 max-h-48 overflow-y-auto pr-1">
                            {theirItems.map(mi => {
                                const isSelected = selectedOffers.some(o => o.id === mi.id)
                                return (
                                    <button
                                        key={mi.id}
                                        onClick={() => {
                                            if (isSelected) setSelectedOffers(selectedOffers.filter(o => o.id !== mi.id))
                                            else setSelectedOffers([...selectedOffers, mi])
                                        }}
                                        className={`flex items-center gap-2 p-2.5 rounded-xl border-2 text-left transition-colors ${isSelected
                                            ? 'border-brand-red bg-brand-subtle'
                                            : 'border-gray-200 hover:border-gray-300'}`}
                                    >
                                        <div className="w-10 h-10 rounded bg-white border border-gray-200 flex-shrink-0 overflow-hidden shadow-sm">
                                            {mi.images?.[0]
                                                ? <LazyImage src={mi.images[0]} alt="" className="w-full h-full" />
                                                : <div className="w-full h-full bg-gray-100" />}
                                        </div>
                                        <div className="min-w-0">
                                            <p className="text-[10px] uppercase font-bold text-gray-400 mb-0.5">
                                                {mi.is_free ? 'Free' : mi.is_barter_only ? 'Barter' : `₹${mi.price}`}
                                            </p>
                                            <p className="text-xs font-semibold text-gray-900 truncate leading-none">{mi.title}</p>
                                        </div>
                                    </button>
                                )
                            })}
                        </div>
                    )}
                </div>

                <div>
                    <label className="text-sm font-medium text-gray-700 block mb-2">Required Cash Amount</label>
                    <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 font-medium">₹</span>
                        <input 
                           type="number" 
                           value={cashAmount} 
                           onChange={e => setCashAmount(e.target.value)}
                           className="w-full border border-gray-200 rounded-lg p-2.5 pl-8 text-sm focus:outline-none focus:ring-2 focus:ring-brand-red"
                           placeholder="Enter amount"
                        />
                    </div>
                </div>

                {error && <p className="text-sm text-red-600 bg-red-50 rounded-lg px-3 py-2">⚠️ {error}</p>}
                
                <div className="flex gap-3 pt-2">
                    <Button variant="secondary" className="flex-1" onClick={onClose}>Cancel</Button>
                    <Button className="flex-1" onClick={handleSubmit} disabled={loading}>
                        {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <ArrowRightLeft className="w-4 h-4" />}
                        {loading ? 'Sending…' : 'Send Counter'}
                    </Button>
                </div>
            </div>
        </Modal>
    )
}

function timeAgo(dateStr) {
    if (!dateStr) return ''
    const diff = (Date.now() - new Date(dateStr).getTime()) / 1000
    if (diff < 60) return 'just now'
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`
    return `${Math.floor(diff / 86400)}d ago`
}

export default function TradeDashboard() {
    const { user } = useAuthStore()
    const [tab, setTab] = useState('incoming')
    const [trades, setTrades] = useState([])
    const [loading, setLoading] = useState(true)
    const [actionLoading, setActionLoading] = useState(null)
    const [error, setError] = useState('')
    const [ratingTrade, setRatingTrade] = useState(null)   // trade being rated
    const [counteringTrade, setCounteringTrade] = useState(null) // trade being countered
    const [ratedTradeIds, setRatedTradeIds] = useState({}) // { tradeId: score }

    const fetchTrades = useCallback(async () => {
        if (!user || !isBackendConfigured) {
            setTrades([])
            setLoading(false)
            return
        }
        setLoading(true)
        setError('')
        try {
            const data = await api.get(`/api/trades?tab=${tab}`)
            setTrades(data || [])

            // For outgoing completed trades, check which ones are already rated
            if (tab === 'outgoing') {
                const completedTrades = (data || []).filter(t => t.status === 'completed')
                const checks = await Promise.all(
                    completedTrades.map(t =>
                        api.get(`/api/ratings/trade/${t.id}`).then(r => ({ id: t.id, rated: r.rated, score: r.rating?.score })).catch(() => ({ id: t.id, rated: false }))
                    )
                )
                const map = {}
                checks.forEach(c => { if (c.rated) map[c.id] = c.score })
                setRatedTradeIds(map)
            }
        } catch (err) {
            console.error('fetchTrades error:', err)
            setError('Could not load trades. ' + (err.message || ''))
            setTrades([])
        } finally {
            setLoading(false)
        }
    }, [user, tab])

    useEffect(() => { fetchTrades() }, [fetchTrades])

    const handleAction = async (tradeId, action) => {
        setActionLoading(tradeId + action)
        try {
            await api.patch(`/api/trades/${tradeId}`, { status: action })
            setTrades(prev => prev.map(t => t.id === tradeId ? { ...t, status: action } : t))
        } catch (err) {
            console.error('Trade action failed:', err)
        } finally {
            setActionLoading(null)
        }
    }

    const pendingIncoming = tab === 'incoming'
        ? trades.filter(t => t.status === 'pending').length
        : 0

    const EmptyState = () => (
        <div className="text-center py-20">
            <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-5">
                <ArrowRightLeft className="w-9 h-9 text-gray-300" />
            </div>
            <h3 className="text-lg font-semibold text-gray-700 mb-2">
                {tab === 'incoming' ? 'No trade requests right now' : "You haven't proposed any trades yet"}
            </h3>
            <p className="text-sm text-gray-400 mb-6 max-w-xs mx-auto leading-relaxed">
                {tab === 'incoming'
                    ? 'When another student proposes a barter on one of your listings, it will show up here.'
                    : 'Find something you like on the marketplace and hit "Propose Trade" to start bartering!'}
            </p>
            <Link to="/marketplace"><Button>🛒 Browse Marketplace</Button></Link>
        </div>
    )

    return (
        <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8 animate-fade-in">
            {ratingTrade && (
                <RateSellerModal
                    trade={ratingTrade}
                    onClose={() => setRatingTrade(null)}
                    onSubmitted={(tradeId, score) => setRatedTradeIds(prev => ({ ...prev, [tradeId]: score }))}
                />
            )}
            {counteringTrade && (
                <CounterOfferModal
                    trade={counteringTrade}
                    currentUser={user}
                    onClose={() => setCounteringTrade(null)}
                    onSubmitted={() => { setTab(tab); fetchTrades() }}
                />
            )}
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                    <div className="w-9 h-9 bg-brand-red/10 rounded-lg flex items-center justify-center">
                        <ArrowRightLeft className="w-5 h-5 text-brand-red" />
                    </div>
                    <div>
                        <h1 className="text-xl font-bold text-gray-900">Trade Dashboard</h1>
                        <p className="text-sm text-gray-500">Manage your barter requests</p>
                    </div>
                </div>
                <button
                    onClick={fetchTrades}
                    className="p-2 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-md transition-colors"
                    title="Refresh"
                >
                    <RefreshCw className="w-4 h-4" />
                </button>
            </div>

            <div className="flex border-b border-gray-200 mb-6">
                {[
                    { key: 'incoming', label: 'Incoming Trades' },
                    { key: 'outgoing', label: 'Outgoing Trades' },
                ].map(({ key, label }) => (
                    <button
                        key={key}
                        onClick={() => setTab(key)}
                        className={`flex items-center gap-2 px-5 py-2.5 text-sm font-medium transition-colors border-b-2 -mb-px
                            ${tab === key ? 'border-brand-red text-brand-red' : 'border-transparent text-gray-500 hover:text-gray-900'}`}
                    >
                        {label}
                        {key === 'incoming' && pendingIncoming > 0 && (
                            <span className="bg-brand-red text-white text-xs w-5 h-5 rounded-full inline-flex items-center justify-center">
                                {pendingIncoming}
                            </span>
                        )}
                    </button>
                ))}
            </div>

            {error && (
                <div className="bg-red-50 border border-red-200 rounded-xl p-3 mb-5 text-sm text-red-700">
                    ⚠️ {error}
                </div>
            )}

            {loading ? (
                <div className="space-y-4">
                    {[1, 2].map(i => (
                        <div key={i} className="bg-white border border-gray-200 rounded-xl p-5 animate-pulse">
                            <div className="h-4 bg-gray-100 rounded w-1/3 mb-3" />
                            <div className="h-16 bg-gray-100 rounded mb-3" />
                            <div className="h-4 bg-gray-100 rounded w-2/3" />
                        </div>
                    ))}
                </div>
            ) : trades.length === 0 ? (
                <EmptyState />
            ) : (
                <div className="space-y-4">
                    {trades.map(trade => {
                        const isIncoming = tab === 'incoming'
                        const otherPerson = isIncoming
                            ? (trade.buyer?.full_name || trade.buyer?.uid || 'Unknown buyer')
                            : (trade.seller?.full_name || trade.seller?.uid || 'Unknown seller')

                        return (
                            <div key={trade.id} className="bg-white border border-gray-200 rounded-xl p-5 hover:border-gray-300 transition-colors">
                                <div className="flex items-start justify-between mb-3">
                                    <div>
                                        <p className="text-xs text-gray-400 mb-1.5">
                                            {isIncoming ? `From: ${otherPerson}` : `To: ${otherPerson}`}
                                            {' · '}
                                            <Clock className="w-3 h-3 inline mb-0.5" /> {timeAgo(trade.created_at)}
                                        </p>
                                        <StatusBadge status={trade.status} />
                                    </div>
                                </div>

                                <div className="flex items-center gap-3 bg-gray-50 rounded-lg p-4 mb-3 border border-gray-100">
                                    <div className="flex-1 text-center">
                                        <p className="text-xs text-gray-500 mb-2">{isIncoming ? 'They offer' : 'You offer'}</p>
                                        <div className="text-sm font-semibold text-gray-900 leading-tight">
                                           {trade.proposed_cash > 0 && <span className="text-green-600 block mb-1">₹{trade.proposed_cash.toLocaleString('en-IN')} Cash</span>}
                                           {trade.proposed_items?.length > 0 ? (
                                                <div className="flex flex-wrap gap-1 justify-center">
                                                    {trade.proposed_items.map(pi => (
                                                        <span key={pi.id} className="bg-white border border-gray-200 text-[10px] px-2 py-0.5 rounded-full truncate max-w-full">
                                                            {pi.title}
                                                        </span>
                                                    ))}
                                                </div>
                                           ) : (
                                              trade.proposed_cash === 0 && <span>{trade.offer_item_desc || 'Open trade offer'}</span>
                                           )}
                                        </div>
                                    </div>
                                    <div className="w-8 h-8 bg-brand-red/10 rounded-full flex items-center justify-center flex-shrink-0">
                                        <ArrowRightLeft className="w-4 h-4 text-brand-red" />
                                    </div>
                                    <div className="flex-1 text-center">
                                        <p className="text-xs text-gray-500 mb-2">{isIncoming ? 'They want' : 'You want'}</p>
                                        <p className="text-sm font-semibold text-gray-900 leading-tight">
                                            {trade.item?.title || '—'} {trade.desired_quantity > 1 ? `(Qty: ${trade.desired_quantity})` : ''}
                                        </p>
                                        {trade.item?.images?.[0] && (
                                            <img src={trade.item.images[0]} alt="" className="w-10 h-10 object-cover rounded mx-auto mt-1.5 border border-gray-200" />
                                        )}
                                    </div>
                                </div>

                                {trade.message && (
                                    <p className="text-sm text-gray-600 italic mb-4 bg-gray-50 border border-gray-100 rounded-lg px-3 py-2">
                                        "{trade.message}"
                                    </p>
                                )}

                                {trade.status === 'pending' && (
                                    (trade.action_required_from === user?.id || (!trade.action_required_from && isIncoming)) ? (
                                        <div className="flex flex-col gap-2">
                                            <div className="flex gap-2">
                                                <Button
                                                    size="sm" className="flex-1 bg-green-600 hover:bg-green-700 border-green-600 focus:ring-green-600"
                                                    loading={actionLoading === trade.id + 'accepted'}
                                                    onClick={() => handleAction(trade.id, 'accepted')}
                                                >
                                                    <CheckCircle className="w-4 h-4 text-white" /> Accept Terms
                                                </Button>
                                                <Button
                                                    size="sm" variant="secondary" className="flex-1"
                                                    loading={actionLoading === trade.id + 'declined'}
                                                    onClick={() => handleAction(trade.id, 'declined')}
                                                >
                                                    <XCircle className="w-4 h-4" /> Decline
                                                </Button>
                                            </div>
                                            <Button
                                                size="sm" variant="outline" className="w-full"
                                                onClick={() => setCounteringTrade(trade)}
                                            >
                                                <ArrowRightLeft className="w-4 h-4" /> Propose Counter Offer
                                            </Button>
                                        </div>
                                    ) : (
                                        <div className="flex flex-col gap-2 text-center text-sm">
                                            <div className="bg-blue-50 text-blue-700 font-medium py-3 rounded-lg border border-blue-100 flex justify-center items-center gap-2">
                                                <Clock className="w-4 h-4" /> Waiting for {otherPerson.split(' ')[0]} to respond...
                                            </div>
                                            <Button
                                                size="sm" variant="secondary"
                                                loading={actionLoading === trade.id + 'cancelled'}
                                                onClick={() => handleAction(trade.id, 'cancelled')}
                                            >
                                                Cancel Trade
                                            </Button>
                                        </div>
                                    )
                                )}

                                {trade.status === 'accepted' && (
                                    <div className="space-y-3">
                                        <div className="bg-green-50 border border-green-200 rounded-lg px-3 py-2 text-xs text-green-700 font-medium flex gap-2">
                                            <CheckCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                                            <div>
                                                Trade accepted! You can now message {isIncoming ? 'the buyer' : 'the seller'} to arrange the exchange.
                                                <div className="mt-1 text-xs opacity-80 italic">
                                                    Note: Messages are automatically deleted from the database after 24 hours for your privacy.
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex gap-2">
                                            <Button
                                                size="sm"
                                                variant="outline"
                                                className="flex-1"
                                                onClick={async () => {
                                                    try {
                                                        const convo = await api.post('/api/conversations/upsert', {
                                                            item_id: trade.item?.id || trade.item_id,
                                                            seller_id: isIncoming ? trade.buyer_id : trade.seller_id,
                                                        });
                                                        window.location.href = `/chat`;
                                                    } catch (err) {
                                                        console.error('Failed to open chat:', err);
                                                        window.location.href = `/chat`;
                                                    }
                                                }}
                                            >
                                                Message {otherPerson}
                                            </Button>
                                            <Button
                                                size="sm"
                                                className="flex-1 bg-green-600 hover:bg-green-700 border border-transparent text-white"
                                                loading={actionLoading === trade.id + 'completed'}
                                                onClick={() => handleAction(trade.id, 'completed')}
                                            >
                                                {isIncoming ? 'Product Delivered!' : 'Got the Product!'}
                                            </Button>
                                        </div>
                                    </div>
                                )}

                                {trade.status === 'completed' && (
                                    <div className="space-y-2">
                                        <div className="bg-blue-50 border border-blue-200 rounded-lg px-3 py-2 text-xs text-blue-700 font-medium flex items-center gap-2">
                                            <CheckCircle className="w-4 h-4 text-blue-600" />
                                            Trade completed successfully! {isIncoming ? 'Product delivered.' : 'You got the product.'}
                                        </div>
                                        {/* Buyer can rate the seller */}
                                        {!isIncoming && (
                                            ratedTradeIds[trade.id] ? (
                                                <div className="flex items-center gap-1.5 text-xs text-amber-600 font-medium">
                                                    <span>Your rating:</span>
                                                    {[1, 2, 3, 4, 5].map(s => (
                                                        <Star key={s} className={`w-4 h-4 ${s <= ratedTradeIds[trade.id] ? 'fill-amber-400 text-amber-400' : 'text-gray-200'}`} />
                                                    ))}
                                                </div>
                                            ) : (
                                                <button
                                                    onClick={() => setRatingTrade(trade)}
                                                    className="flex items-center gap-1.5 text-xs font-semibold text-amber-600 hover:text-amber-700 bg-amber-50 hover:bg-amber-100 border border-amber-200 rounded-lg px-3 py-2 transition-colors"
                                                >
                                                    <Star className="w-3.5 h-3.5" />
                                                    Rate the Seller
                                                </button>
                                            )
                                        )}
                                    </div>
                                )}
                            </div>
                        )
                    })}
                </div>
            )}
        </div>
    )
}
