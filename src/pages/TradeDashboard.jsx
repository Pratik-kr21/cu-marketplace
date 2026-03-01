import { ArrowRightLeft, Clock, CheckCircle, XCircle, RefreshCw } from 'lucide-react'
import { useAuthStore } from '../store/authStore'
import { api, isBackendConfigured } from '../lib/api'
import Button from '../components/ui/Button'
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

                                <div className="flex items-center gap-3 bg-gray-50 rounded-lg p-4 mb-3">
                                    <div className="flex-1 text-center">
                                        <p className="text-xs text-gray-500 mb-1">{isIncoming ? 'They offer' : 'You offer'}</p>
                                        <p className="text-sm font-semibold text-gray-900 leading-tight">
                                            {trade.offer_item_desc || 'Open trade offer'}
                                        </p>
                                    </div>
                                    <div className="w-8 h-8 bg-brand-red/10 rounded-full flex items-center justify-center flex-shrink-0">
                                        <ArrowRightLeft className="w-4 h-4 text-brand-red" />
                                    </div>
                                    <div className="flex-1 text-center">
                                        <p className="text-xs text-gray-500 mb-1">{isIncoming ? 'They want' : 'You want'}</p>
                                        <p className="text-sm font-semibold text-gray-900 leading-tight">
                                            {trade.item?.title || '—'}
                                        </p>
                                        {trade.item?.images?.[0] && (
                                            <img src={trade.item.images[0]} alt="" className="w-10 h-10 object-cover rounded mx-auto mt-1" />
                                        )}
                                    </div>
                                </div>

                                {trade.message && (
                                    <p className="text-sm text-gray-600 italic mb-4 bg-gray-50 rounded-lg px-3 py-2">
                                        "{trade.message}"
                                    </p>
                                )}

                                {isIncoming && trade.status === 'pending' && (
                                    <div className="flex gap-2">
                                        <Button
                                            size="sm" className="flex-1"
                                            loading={actionLoading === trade.id + 'accepted'}
                                            onClick={() => handleAction(trade.id, 'accepted')}
                                        >
                                            <CheckCircle className="w-4 h-4" /> Accept
                                        </Button>
                                        <Button
                                            size="sm" variant="secondary" className="flex-1"
                                            loading={actionLoading === trade.id + 'declined'}
                                            onClick={() => handleAction(trade.id, 'declined')}
                                        >
                                            <XCircle className="w-4 h-4" /> Decline
                                        </Button>
                                    </div>
                                )}

                                {!isIncoming && trade.status === 'pending' && (
                                    <Button
                                        size="sm" variant="secondary"
                                        loading={actionLoading === trade.id + 'cancelled'}
                                        onClick={() => handleAction(trade.id, 'cancelled')}
                                    >
                                        Cancel Request
                                    </Button>
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
                                                Got the Product!
                                            </Button>
                                        </div>
                                    </div>
                                )}

                                {trade.status === 'completed' && (
                                    <div className="bg-blue-50 border border-blue-200 rounded-lg px-3 py-2 text-xs text-blue-700 font-medium flex items-center gap-2">
                                        <CheckCircle className="w-4 h-4 text-blue-600" />
                                        Trade completed successfully! You got the product.
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
