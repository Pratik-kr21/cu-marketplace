import { useState, useEffect, useRef, useCallback } from 'react'
import { Send, MessageCircle, Loader2 } from 'lucide-react'
import { useAuthStore } from '../store/authStore'
import { supabase, isSupabaseConfigured } from '../lib/supabase'
import Avatar from '../components/ui/Avatar'
import { Link } from 'react-router-dom'
import Button from '../components/ui/Button'

function timeAgo(dateStr) {
    if (!dateStr) return ''
    const diff = (Date.now() - new Date(dateStr).getTime()) / 1000
    if (diff < 60) return 'just now'
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`
    const d = new Date(dateStr)
    return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
}

export default function Chat() {
    const { user, profile } = useAuthStore()
    const [conversations, setConversations] = useState([])
    const [activeId, setActiveId] = useState(null)
    const [messages, setMessages] = useState([])
    const [input, setInput] = useState('')
    const [loadingConvos, setLoadingConvos] = useState(true)
    const [loadingMsgs, setLoadingMsgs] = useState(false)
    const [sending, setSending] = useState(false)
    const bottomRef = useRef(null)

    // Display name helper
    const displayName =
        profile?.full_name || user?.user_metadata?.full_name ||
        user?.email?.split('@')[0] || 'Me'

    // Fetch conversations
    const fetchConversations = useCallback(async () => {
        if (!user || !isSupabaseConfigured) { setLoadingConvos(false); return }
        setLoadingConvos(true)
        try {
            const timeout = new Promise((_, reject) =>
                setTimeout(() => reject(new Error('timeout')), 5000)
            )
            const query = supabase
                .from('conversations')
                .select(`
                    id, created_at, item_id,
                    item:items(id, title),
                    buyer:profiles!conversations_buyer_id_fkey(id, full_name, uid),
                    seller:profiles!conversations_seller_id_fkey(id, full_name, uid),
                    messages(content, created_at, sender_id)
                `)
                .or(`buyer_id.eq.${user.id},seller_id.eq.${user.id}`)
                .order('created_at', { ascending: false })

            const { data, error } = await Promise.race([query, timeout])
            const list = error ? [] : (data || [])
            setConversations(list)
            if (list.length > 0 && !activeId) setActiveId(list[0].id)
        } catch {
            setConversations([])
        } finally {
            setLoadingConvos(false)
        }
    }, [user, activeId])

    // Fetch messages for active conversation
    const fetchMessages = useCallback(async () => {
        if (!activeId || !isSupabaseConfigured) return
        setLoadingMsgs(true)
        try {
            const { data, error } = await supabase
                .from('messages')
                .select('id, content, sender_id, created_at')
                .eq('conversation_id', activeId)
                .order('created_at', { ascending: true })

            if (error) throw error
            setMessages(data || [])
        } catch (err) {
            console.error('Error loading messages:', err)
        } finally {
            setLoadingMsgs(false)
        }
    }, [activeId])

    useEffect(() => { fetchConversations() }, [fetchConversations])
    useEffect(() => { fetchMessages() }, [fetchMessages])

    // Scroll to bottom on new messages
    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
    }, [messages])

    // Real-time subscription
    useEffect(() => {
        if (!activeId || !isSupabaseConfigured) return
        const channel = supabase
            .channel(`messages:${activeId}`)
            .on('postgres_changes', {
                event: 'INSERT',
                schema: 'public',
                table: 'messages',
                filter: `conversation_id=eq.${activeId}`,
            }, (payload) => {
                setMessages(prev => [...prev, payload.new])
            })
            .subscribe()
        return () => { supabase.removeChannel(channel) }
    }, [activeId])

    const send = async () => {
        if (!input.trim() || !activeId || !isSupabaseConfigured) return
        setSending(true)
        const text = input.trim()
        setInput('')
        // Optimistic insert
        const optimistic = { id: `opt-${Date.now()}`, content: text, sender_id: user.id, created_at: new Date().toISOString() }
        setMessages(prev => [...prev, optimistic])
        try {
            const { error } = await supabase
                .from('messages')
                .insert({ conversation_id: activeId, sender_id: user.id, content: text })
            if (error) throw error
        } catch (err) {
            console.error('Send failed:', err)
            setMessages(prev => prev.filter(m => m.id !== optimistic.id))
            setInput(text)
        } finally {
            setSending(false)
        }
    }

    const activeConvo = conversations.find(c => c.id === activeId)
    const otherPerson = activeConvo
        ? (activeConvo.buyer?.id === user?.id ? activeConvo.seller : activeConvo.buyer)
        : null

    // ── Not configured ──────────────────────────────────────────────────────────
    if (!isSupabaseConfigured) {
        return (
            <div className="max-w-5xl mx-auto px-4 sm:px-6 py-16 text-center">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <MessageCircle className="w-7 h-7 text-gray-300" />
                </div>
                <h2 className="text-lg font-bold text-gray-800 mb-2">Messaging not available</h2>
                <p className="text-sm text-gray-500 mb-6 max-w-sm mx-auto">
                    Real-time chat requires Supabase to be connected. Add your credentials to{' '}
                    <code className="bg-gray-100 px-1 rounded">.env.local</code> to enable messaging.
                </p>
                <Link to="/marketplace"><Button variant="secondary">Browse Marketplace</Button></Link>
            </div>
        )
    }

    // ── No conversations ────────────────────────────────────────────────────────
    if (!loadingConvos && conversations.length === 0) {
        return (
            <div className="max-w-5xl mx-auto px-4 sm:px-6 py-16 text-center">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <MessageCircle className="w-7 h-7 text-gray-300" />
                </div>
                <h2 className="text-lg font-bold text-gray-800 mb-2">No messages yet</h2>
                <p className="text-sm text-gray-500 mb-6 max-w-sm mx-auto">
                    When you contact a seller or someone messages you about your listing, the conversation will appear here.
                </p>
                <Link to="/marketplace"><Button variant="secondary">Browse Marketplace</Button></Link>
            </div>
        )
    }

    // ── Main chat UI ────────────────────────────────────────────────────────────
    return (
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6 h-[calc(100vh-8rem)]">
            <div className="bg-white border border-gray-200 rounded-xl overflow-hidden flex h-full shadow-card">

                {/* Sidebar — conversation list */}
                <div className="w-64 border-r border-gray-100 flex flex-col hidden sm:flex">
                    <div className="p-4 border-b border-gray-100">
                        <h2 className="font-bold text-gray-900 flex items-center gap-2">
                            <MessageCircle className="w-4 h-4 text-brand-red" /> Messages
                        </h2>
                    </div>
                    <div className="flex-1 overflow-y-auto">
                        {loadingConvos ? (
                            <div className="p-4 space-y-3">
                                {[1, 2, 3].map(i => (
                                    <div key={i} className="flex items-center gap-3 animate-pulse">
                                        <div className="w-8 h-8 bg-gray-200 rounded-full flex-shrink-0" />
                                        <div className="flex-1 space-y-1.5">
                                            <div className="h-3 bg-gray-200 rounded w-2/3" />
                                            <div className="h-2.5 bg-gray-100 rounded w-full" />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : conversations.map(c => {
                            const other = c.buyer?.id === user?.id ? c.seller : c.buyer
                            const lastMsg = c.messages?.slice(-1)[0]
                            return (
                                <button
                                    key={c.id}
                                    onClick={() => setActiveId(c.id)}
                                    className={`w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition-colors text-left
                                        ${activeId === c.id ? 'bg-brand-subtle border-r-2 border-brand-red' : ''}`}
                                >
                                    <Avatar name={other?.full_name || other?.uid || '?'} size="sm" />
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center justify-between">
                                            <p className="text-sm font-semibold text-gray-900 truncate">
                                                {other?.full_name || other?.uid || 'Unknown'}
                                            </p>
                                            <span className="text-xs text-gray-400 flex-shrink-0">
                                                {timeAgo(lastMsg?.created_at || c.created_at)}
                                            </span>
                                        </div>
                                        <p className="text-xs text-gray-500 truncate">{lastMsg?.content || 'No messages yet'}</p>
                                        <p className="text-xs text-brand-red truncate">{c.item?.title}</p>
                                    </div>
                                </button>
                            )
                        })}
                    </div>
                </div>

                {/* Chat window */}
                <div className="flex-1 flex flex-col">
                    {activeConvo ? (
                        <>
                            {/* Header */}
                            <div className="px-4 py-3 border-b border-gray-100 flex items-center gap-3">
                                <Avatar name={otherPerson?.full_name || otherPerson?.uid || '?'} size="sm" />
                                <div>
                                    <p className="text-sm font-semibold text-gray-900">
                                        {otherPerson?.full_name || otherPerson?.uid || 'Unknown'}
                                    </p>
                                    <p className="text-xs text-brand-red">{activeConvo.item?.title}</p>
                                </div>
                            </div>

                            {/* Messages */}
                            <div className="flex-1 overflow-y-auto p-4 space-y-3">
                                {loadingMsgs ? (
                                    <div className="flex items-center justify-center h-full">
                                        <Loader2 className="w-5 h-5 text-gray-300 animate-spin" />
                                    </div>
                                ) : messages.length === 0 ? (
                                    <div className="flex items-center justify-center h-full">
                                        <p className="text-sm text-gray-400">No messages yet — say hello! 👋</p>
                                    </div>
                                ) : messages.map(msg => {
                                    const mine = msg.sender_id === user?.id
                                    return (
                                        <div key={msg.id} className={`flex ${mine ? 'justify-end' : 'justify-start'}`}>
                                            <div className={`max-w-[70%] rounded-2xl px-4 py-2 text-sm
                                                ${mine ? 'bg-brand-red text-white rounded-br-sm' : 'bg-gray-100 text-gray-900 rounded-bl-sm'}`}>
                                                <p>{msg.content}</p>
                                                <p className={`text-xs mt-1 ${mine ? 'text-red-200' : 'text-gray-400'}`}>
                                                    {timeAgo(msg.created_at)}
                                                </p>
                                            </div>
                                        </div>
                                    )
                                })}
                                <div ref={bottomRef} />
                            </div>

                            {/* Input */}
                            <div className="px-4 py-3 border-t border-gray-100 flex gap-2">
                                <input
                                    value={input}
                                    onChange={e => setInput(e.target.value)}
                                    onKeyDown={e => e.key === 'Enter' && !e.shiftKey && send()}
                                    placeholder="Type a message..."
                                    className="flex-1 h-10 border border-gray-200 rounded-full px-4 text-sm focus:outline-none focus:ring-2 focus:ring-brand-red"
                                />
                                <button
                                    onClick={send}
                                    disabled={sending || !input.trim()}
                                    className="w-10 h-10 bg-brand-red hover:bg-brand-dark disabled:opacity-50 text-white rounded-full flex items-center justify-center transition-colors"
                                >
                                    {sending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                                </button>
                            </div>
                        </>
                    ) : (
                        <div className="flex-1 flex items-center justify-center text-gray-400 text-sm">
                            Select a conversation to start chatting
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}
