import { ArrowRightLeft, Clock, CheckCircle, XCircle, Package, RefreshCw } from 'lucide-react'
import { useAuthStore } from '../store/authStore'
import { supabase, isSupabaseConfigured } from '../lib/supabase'
import Button from '../components/ui/Button'
import { Link } from 'react-router-dom'
import { useState, useEffect, useCallback } from 'react'

const StatusBadge = ({ status }) => {
    const map = {
        pending: ['bg-amber-50 text-amber-700 border-amber-200', 'Pending'],
        accepted: ['bg-green-50 text-green-700 border-green-200', 'Accepted'],
        declined: ['bg-red-50 text-red-700 border-red-200', 'Declined'],
        cancelled: ['bg-gray-100 text-gray-500 border-gray-200', 'Cancelled'],
    }
    const [cls, label] = map[status] || map.pending
    return (
        <span className={`text-xs font-semibold px-2 py-0.5 rounded-full border ${cls}`}>
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

    const fetchTrades = useCallback(async () => {
        if (!user || !isSupabaseConfigured) {
            setTrades([])
            setLoading(false)
            return
        }

        setLoading(true)
        try {
            const isIncoming = tab === 'incoming'

            // Race query against a 5-second timeout so it never hangs forever
            const timeout = new Promise((_, reject) =>
                setTimeout(() => reject(new Error('timeout')), 5000)
            )
            const query = supabase
                .from('trades')
                .select(`
                    id, status, cash_added, message, created_at,
                    offered_item:items!trades_offered_item_id_fkey(id, title, images),
                    requested_item:items!trades_requested_item_id_fkey(id, title, images),
                    requester:profiles!trades_requester_id_fkey(id, full_name, uid),
                    receiver:profiles!trades_receiver_id_fkey(id, full_name, uid)
                `)
                .eq(isIncoming ? 'receiver_id' : 'requester_id', user.id)
                .order('created_at', { ascending: false })

            const { data, error: err } = await Promise.race([query, timeout])
            // Treat any DB error (e.g. table not found) as simply no data
            setTrades(err ? [] : (data || []))
        } catch {
            // Timeout or network error — show empty state silently
            setTrades([])
        } finally {
            setLoading(false)
        }
    }, [user, tab])

    useEffect(() => { fetchTrades() }, [fetchTrades])

    const handleAction = async (tradeId, action) => {
        setActionLoading(tradeId + action)
        try {
            const { error: err } = await supabase
                .from('trades')
                .update({ status: action, updated_at: new Date().toISOString() })
                .eq('id', tradeId)
            if (err) throw err
            // Optimistic update
            setTrades(prev => prev.map(t => t.id === tradeId ? { ...t, status: action } : t))
        } catch (err) {
            console.error('Trade action failed:', err)
        } finally {
            setActionLoading(null)
        }
    }

    const pendingCount = trades.filter(t => t.status === 'pending').length

    const EmptyState = () => (
        <div className="text-center py-20">
            <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-5">
                <ArrowRightLeft className="w-9 h-9 text-gray-300" />
            </div>
            <h3 className="text-lg font-semibold text-gray-700 mb-2">
                {tab === 'incoming'
                    ? 'No trade requests right now'
                    : 'You haven\'t proposed any trades yet'}
            </h3>
            <p className="text-sm text-gray-400 mb-6 max-w-xs mx-auto leading-relaxed">
                {tab === 'incoming'
                    ? 'When another student proposes a barter on one of your listings, it will show up here.'
                    : 'Find something you like on the marketplace and hit "Propose Trade" to start bartering!'}
            </p>
            <Link to="/marketplace">
                <Button>
                    🛒 Browse Marketplace
                </Button>
            </Link>
        </div>
    )

    return (
        <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8 animate-fade-in">
            {/* Header */}
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

            {/* No Supabase banner */}
            {!isSupabaseConfigured && (
                <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-6 text-sm text-amber-800">
                    <strong>Demo mode:</strong> Trades require Supabase to be connected.
                    Configure <code className="bg-amber-100 px-1 rounded">VITE_SUPABASE_URL</code> in{' '}
                    <code className="bg-amber-100 px-1 rounded">.env.local</code> to enable real trade requests.
                </div>
            )}

            {/* Tabs */}
            <div className="flex border-b border-gray-200 mb-6">
                {['incoming', 'outgoing'].map(t => (
                    <button
                        key={t}
                        onClick={() => setTab(t)}
                        className={`flex items-center gap-2 px-5 py-2.5 text-sm font-medium capitalize transition-colors border-b-2 -mb-px
                            ${tab === t ? 'border-brand-red text-brand-red' : 'border-transparent text-gray-500 hover:text-gray-900'}`}
                    >
                        {t} Trades
                        {t === 'incoming' && pendingCount > 0 && (
                            <span className="bg-brand-red text-white text-xs w-5 h-5 rounded-full inline-flex items-center justify-center">
                                {pendingCount}
                            </span>
                        )}
                    </button>
                ))}
            </div>


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
                            ? trade.requester?.full_name || trade.requester?.uid || 'Unknown'
                            : trade.receiver?.full_name || trade.receiver?.uid || 'Unknown'

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

                                {/* Trade exchange visual */}
                                <div className="flex items-center gap-3 bg-gray-50 rounded-lg p-4 mb-3">
                                    <div className="flex-1 text-center">
                                        <p className="text-xs text-gray-500 mb-1">{isIncoming ? 'They offer' : 'You offer'}</p>
                                        <p className="text-sm font-semibold text-gray-900 leading-tight">
                                            {trade.offered_item?.title || '—'}
                                        </p>
                                    </div>
                                    <div className="w-8 h-8 bg-brand-red/10 rounded-full flex items-center justify-center flex-shrink-0">
                                        <ArrowRightLeft className="w-4 h-4 text-brand-red" />
                                    </div>
                                    <div className="flex-1 text-center">
                                        <p className="text-xs text-gray-500 mb-1">{isIncoming ? 'They want' : 'You want'}</p>
                                        <p className="text-sm font-semibold text-gray-900 leading-tight">
                                            {trade.requested_item?.title || '—'}
                                        </p>
                                    </div>
                                </div>

                                {trade.cash_added > 0 && (
                                    <p className="text-xs text-green-600 font-medium mb-2">
                                        + ₹{trade.cash_added} cash top-up included
                                    </p>
                                )}
                                {trade.message && (
                                    <p className="text-sm text-gray-600 italic mb-4 bg-gray-50 rounded-lg px-3 py-2">
                                        "{trade.message}"
                                    </p>
                                )}

                                {/* Actions for pending incoming trades */}
                                {isIncoming && trade.status === 'pending' && (
                                    <div className="flex gap-2">
                                        <Button
                                            size="sm"
                                            className="flex-1"
                                            loading={actionLoading === trade.id + 'accepted'}
                                            onClick={() => handleAction(trade.id, 'accepted')}
                                        >
                                            <CheckCircle className="w-4 h-4" /> Accept
                                        </Button>
                                        <Button
                                            size="sm"
                                            variant="secondary"
                                            className="flex-1"
                                            loading={actionLoading === trade.id + 'declined'}
                                            onClick={() => handleAction(trade.id, 'declined')}
                                        >
                                            <XCircle className="w-4 h-4" /> Decline
                                        </Button>
                                    </div>
                                )}

                                {/* Accepted state — prompt to arrange meetup */}
                                {trade.status === 'accepted' && (
                                    <div className="bg-green-50 border border-green-200 rounded-lg px-3 py-2 text-xs text-green-700 font-medium">
                                        ✓ Trade accepted — message the other party to arrange the exchange!
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
