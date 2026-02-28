import { useState, useEffect, useRef, useCallback } from 'react'
import { Send, MessageCircle, Loader2 } from 'lucide-react'
import { useAuthStore } from '../store/authStore'
import { api, isBackendConfigured } from '../lib/api'
import { sendPushToUser } from '../lib/pushNotifications'
import Avatar from '../components/ui/Avatar'
import { Link, useLocation } from 'react-router-dom'
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

const POLL_INTERVAL = 3000

export default function Chat() {
    const { user, profile } = useAuthStore()
    const location = useLocation()
    const [conversations, setConversations] = useState([])
    const [activeId, setActiveId] = useState(location.state?.conversationId || null)
    const [messages, setMessages] = useState([])
    const [input, setInput] = useState('')
    const [loadingConvos, setLoadingConvos] = useState(true)
    const [loadingMsgs, setLoadingMsgs] = useState(false)
    const [sending, setSending] = useState(false)
    const containerRef = useRef(null)

    const displayName =
        profile?.full_name || user?.user_metadata?.full_name ||
        user?.email?.split('@')[0] || 'Me'

    const fetchConversations = useCallback(async () => {
        if (!user || !isBackendConfigured) { setLoadingConvos(false); return }
        setLoadingConvos(true)
        try {
            const list = await api.get('/api/conversations')
            setConversations(list || [])
            if (list?.length > 0 && !activeId) setActiveId(list[0].id)
        } catch {
            setConversations([])
        } finally {
            setLoadingConvos(false)
        }
    }, [user, activeId])

    const fetchMessages = useCallback(async () => {
        if (!activeId || !isBackendConfigured) return
        setLoadingMsgs(true)
        try {
            const data = await api.get(`/api/conversations/${activeId}/messages`)
            setMessages(data || [])
        } catch (err) {
            console.error('Error loading messages:', err)
        } finally {
            setLoadingMsgs(false)
        }
    }, [activeId])

    useEffect(() => { fetchConversations() }, [fetchConversations])
    useEffect(() => { fetchMessages() }, [fetchMessages])

    useEffect(() => {
        if (!activeId || !isBackendConfigured) return
        const interval = setInterval(fetchMessages, POLL_INTERVAL)
        return () => clearInterval(interval)
    }, [activeId, fetchMessages])

    useEffect(() => {
        if (containerRef.current) {
            containerRef.current.scrollTop = containerRef.current.scrollHeight
        }
    }, [messages])

    const send = async () => {
        if (!input.trim() || !activeId || !isBackendConfigured) return
        setSending(true)
        const text = input.trim()
        setInput('')
        const optimistic = { id: `opt-${Date.now()}`, content: text, sender_id: user.id, created_at: new Date().toISOString() }
        setMessages(prev => [...prev, optimistic])
        try {
            const activeConvoData = conversations.find(c => c.id === activeId)
            const receiverId = activeConvoData
                ? (activeConvoData.buyer?.id === user.id ? activeConvoData.seller?.id : activeConvoData.buyer?.id)
                : null
            await api.post(`/api/conversations/${activeId}/messages`, { content: text })
            if (receiverId) {
                const senderName = profile?.full_name || user?.email?.split('@')[0] || 'Someone'
                sendPushToUser(receiverId, `New message from ${senderName}`, text, '/chat')
            }
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

    if (!isBackendConfigured) {
        return (
            <div className="max-w-5xl mx-auto px-4 sm:px-6 py-16 text-center">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <MessageCircle className="w-7 h-7 text-gray-300" />
                </div>
                <h2 className="text-lg font-bold text-gray-800 mb-2">Messaging not available</h2>
                <p className="text-sm text-gray-500 mb-6 max-w-sm mx-auto">
                    Set <code className="bg-gray-100 px-1 rounded">VITE_API_URL</code> to your backend URL to enable messaging.
                </p>
                <Link to="/marketplace"><Button variant="secondary">Browse Marketplace</Button></Link>
            </div>
        )
    }

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

    return (
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6 h-[calc(100vh-8rem)]">
            <div className="bg-white border border-gray-200 rounded-xl overflow-hidden flex h-full shadow-card">
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

                <div className="flex-1 flex flex-col">
                    {activeConvo ? (
                        <>
                            <div className="px-4 py-3 border-b border-gray-100 flex items-center gap-3">
                                <Avatar name={otherPerson?.full_name || otherPerson?.uid || '?'} size="sm" />
                                <div>
                                    <p className="text-sm font-semibold text-gray-900">
                                        {otherPerson?.full_name || otherPerson?.uid || 'Unknown'}
                                    </p>
                                    <p className="text-xs text-brand-red">{activeConvo.item?.title}</p>
                                </div>
                            </div>

                            <div ref={containerRef} className="flex-1 overflow-y-auto p-4 space-y-3">
                                {loadingMsgs ? (
                                    <div className="flex justify-center h-full">
                                        <Loader2 className="w-5 h-5 text-gray-300 animate-spin" />
                                    </div>
                                ) : messages.length === 0 ? (
                                    <div className="flex justify-center h-full">
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
                            </div>

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
