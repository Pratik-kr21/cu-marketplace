import { useState, useEffect } from 'react'
import { api } from '../lib/api'
import { useAuthStore } from '../store/authStore'
import { Users, Package, ArrowRightLeft, Trash2, ShieldAlert } from 'lucide-react'
import Button from '../components/ui/Button'
import Badge from '../components/ui/Badge'
import Avatar from '../components/ui/Avatar'
import { useNavigate } from 'react-router-dom'

export default function AdminDashboard() {
    const { user } = useAuthStore()
    const navigate = useNavigate()
    const [stats, setStats] = useState(null)
    const [users, setUsers] = useState([])
    const [items, setItems] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState('')
    const [activeTab, setActiveTab] = useState('overview') // overview, users, items

    useEffect(() => {
        if (user?.email !== '24bcs10403@cuchd.in') {
            navigate('/')
            return
        }
        fetchData()
    }, [user, navigate])

    const fetchData = async () => {
        setLoading(true)
        setError('')
        try {
            const [statsRes, usersRes, itemsRes] = await Promise.all([
                api.get('/api/admin/stats'),
                api.get('/api/admin/users'),
                api.get('/api/admin/items')
            ])
            setStats(statsRes)
            setUsers(usersRes)
            setItems(itemsRes)
        } catch (err) {
            setError(err.message || 'Failed to fetch admin data')
        } finally {
            setLoading(false)
        }
    }

    const deleteUser = async (id) => {
        if (!window.confirm('Are you sure you want to delete this user? This will also delete all their items.')) return
        try {
            await api.delete(`/api/admin/users/${id}`)
            setUsers(users.filter(u => u._id !== id))
            setStats(prev => ({ ...prev, users: prev.users - 1 }))
        } catch (err) {
            alert(err.message || 'Failed to delete user')
        }
    }

    const deleteItem = async (id) => {
        if (!window.confirm('Are you sure you want to delete this item?')) return
        try {
            await api.delete(`/api/admin/items/${id}`)
            setItems(items.filter(i => i._id !== id))
            setStats(prev => ({ ...prev, items: prev.items - 1 }))
        } catch (err) {
            alert(err.message || 'Failed to delete item')
        }
    }

    if (loading) return (
        <div className="flex justify-center items-center py-20">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-red"></div>
        </div>
    )

    if (error) return (
        <div className="max-w-4xl mx-auto p-4 text-center mt-10">
            <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center justify-center gap-2">
                <ShieldAlert className="text-red-500 w-8 h-8" /> Admin Access Only
            </h2>
            <p className="text-red-500">{error}</p>
        </div>
    )

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
                        <ShieldAlert className="text-brand-red" /> Admin Dashboard
                    </h1>
                    <p className="text-sm text-gray-500 mt-1">Manage users, items, and view total statistics.</p>
                </div>
            </div>

            {/* Tabs */}
            <div className="flex gap-2 border-b border-gray-200 mb-8">
                {['overview', 'users', 'items'].map(tab => (
                    <button
                        key={tab}
                        onClick={() => setActiveTab(tab)}
                        className={`px-4 py-2 font-medium text-sm capitalize transition-colors border-b-2 ${activeTab === tab ? 'border-brand-red text-brand-red mb-[-1px]' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
                    >
                        {tab}
                    </button>
                ))}
            </div>

            {/* Overview */}
            {activeTab === 'overview' && stats && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4 animate-fade-in">
                    <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm flex flex-col gap-2">
                        <div className="flex items-center gap-2 text-gray-600 font-medium">
                            <Users className="w-5 h-5" /> Total Users
                        </div>
                        <span className="text-3xl font-bold text-gray-900">{stats.users}</span>
                    </div>
                    <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm flex flex-col gap-2">
                        <div className="flex items-center gap-2 text-gray-600 font-medium">
                            <Package className="w-5 h-5" /> Active Items
                        </div>
                        <span className="text-3xl font-bold text-gray-900">{stats.activeItems} <span className="text-sm font-normal text-gray-400">/ {stats.items} Total</span></span>
                    </div>
                    <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm flex flex-col gap-2">
                        <div className="flex items-center gap-2 text-gray-600 font-medium">
                            <ArrowRightLeft className="w-5 h-5 text-green-600" /> Trades Completed
                        </div>
                        <span className="text-3xl font-bold text-gray-900">{stats.completedTrades}</span>
                    </div>
                    <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm flex flex-col gap-2">
                        <div className="flex items-center gap-2 text-gray-600 font-medium">
                            <ArrowRightLeft className="w-5 h-5 text-amber-500" /> Pending Trades
                        </div>
                        <span className="text-3xl font-bold text-gray-900">{stats.pendingTrades} <span className="text-sm font-normal text-gray-400">/ {stats.trades} Total</span></span>
                    </div>
                    <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm flex flex-col gap-2">
                        <div className="flex items-center gap-2 text-gray-600 font-medium">
                            <span className="w-5 h-5 text-green-600 font-bold flex items-center justify-center">₹</span> Cash Trades
                        </div>
                        <span className="text-3xl font-bold text-gray-900">{stats.cashTrades}</span>
                    </div>
                </div>
            )}

            {/* Users */}
            {activeTab === 'users' && (
                <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden animate-fade-in">
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left text-gray-500">
                            <thead className="text-xs text-gray-700 uppercase bg-gray-50 border-b border-gray-200">
                                <tr>
                                    <th className="px-6 py-3">User</th>
                                    <th className="px-6 py-3">Details</th>
                                    <th className="px-6 py-3">Joined</th>
                                    <th className="px-6 py-3 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {users.map(u => (
                                    <tr key={u._id} className="bg-white border-b hover:bg-gray-50 transition-colors">
                                        <td className="px-6 py-4 font-medium text-gray-900 flex items-center gap-3">
                                            <Avatar name={u.full_name || u.email} size="sm" />
                                            <div>
                                                <div>{u.full_name || 'Unnamed'}</div>
                                                <div className="text-xs text-brand-red font-mono">{u.email}</div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-xs">
                                            <div>UID: {u.uid || '-'}</div>
                                            <div>Dept: {u.department || '-'}</div>
                                        </td>
                                        <td className="px-6 py-4">
                                            {new Date(u.createdAt).toLocaleDateString()}
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            {u.email !== '24bcs10403@cuchd.in' && (
                                                <button onClick={() => deleteUser(u._id)} className="text-red-500 hover:text-red-700 bg-red-50 hover:bg-red-100 p-2 rounded transition-colors">
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                        {users.length === 0 && <div className="p-6 text-center text-gray-500">No users found.</div>}
                    </div>
                </div>
            )}

            {/* Items */}
            {activeTab === 'items' && (
                <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden animate-fade-in">
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left text-gray-500">
                            <thead className="text-xs text-gray-700 uppercase bg-gray-50 border-b border-gray-200">
                                <tr>
                                    <th className="px-6 py-3">Item</th>
                                    <th className="px-6 py-3">Seller</th>
                                    <th className="px-6 py-3">Details</th>
                                    <th className="px-6 py-3 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {items.map(i => (
                                    <tr key={i._id} className="bg-white border-b hover:bg-gray-50 transition-colors">
                                        <td className="px-6 py-4 font-medium text-gray-900">
                                            <div className="line-clamp-1">{i.title}</div>
                                            <div className="text-xs flex gap-1 mt-1">
                                                {i.is_barter_only ? <Badge variant="barter">Barter</Badge> : <Badge variant="outline">Sell</Badge>}
                                                {i.is_free && <Badge className="bg-green-100 text-green-700 border-green-200">Free</Badge>}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            {i.userId?.full_name || i.userId?.email || 'Unknown'}
                                        </td>
                                        <td className="px-6 py-4 text-xs">
                                            <div>ID: <span className="font-mono">{i._id}</span></div>
                                            <div>Status: {i.is_available ? 'Active' : 'Sold/Inactive'}</div>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <button onClick={() => deleteItem(i._id)} className="text-red-500 hover:text-red-700 bg-red-50 hover:bg-red-100 p-2 rounded transition-colors">
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                        {items.length === 0 && <div className="p-6 text-center text-gray-500">No items found.</div>}
                    </div>
                </div>
            )}
        </div>
    )
}
