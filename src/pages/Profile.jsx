import { useAuthStore } from '../store/authStore'
import { useItemStore } from '../store/itemStore'
import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Package, Plus, ArrowRightLeft, Star, Trash2, Tag, MapPin, AlertTriangle, X } from 'lucide-react'
import Avatar from '../components/ui/Avatar'
import Button from '../components/ui/Button'
import LazyImage from '../components/ui/LazyImage'
import { ConditionBadge } from '../components/ui/Badge'

// Inline mini listing card with delete button
function MyListingCard({ item, onDelete }) {
    const img = item.images?.[0]

    const priceLabel = item.is_barter_only
        ? 'Barter Only'
        : item.price === 0 || item.is_free
            ? 'Free'
            : `₹${item.price?.toLocaleString('en-IN')}`

    return (
        <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-card hover:shadow-card-hover transition-all group">
            {/* Image */}
            <div className="relative aspect-video bg-gray-50 overflow-hidden">
                {img ? (
                    <LazyImage src={img} alt={item.title} className="w-full h-full group-hover:scale-105 transition-transform duration-300" />
                ) : (
                    <div className="w-full h-full flex items-center justify-center">
                        <Tag className="w-8 h-8 text-gray-300" />
                    </div>
                )}
                {/* Delete button overlaid on image */}
                <button
                    onClick={() => onDelete(item)}
                    title="Delete this listing"
                    className="absolute top-2 right-2 bg-red-600 hover:bg-red-700 text-white rounded-full p-1.5 shadow-md transition-all opacity-0 group-hover:opacity-100 scale-90 group-hover:scale-100"
                >
                    <Trash2 className="w-3.5 h-3.5" />
                </button>
                {item.is_barter_only && (
                    <span className="absolute top-2 left-2 flex items-center gap-1 bg-gray-900 text-white text-xs font-semibold px-2 py-0.5 rounded-full">
                        <ArrowRightLeft className="w-3 h-3" /> Barter
                    </span>
                )}
            </div>

            {/* Body */}
            <div className="p-3 space-y-1.5">
                <p className="text-sm font-semibold text-gray-900 line-clamp-2 leading-snug">{item.title}</p>
                <div className="flex items-center justify-between">
                    <p className="text-sm font-bold text-brand-red">{priceLabel}</p>
                    <ConditionBadge condition={item.condition} />
                </div>
                {item.hostel_area && (
                    <p className="text-xs text-gray-400 flex items-center gap-1">
                        <MapPin className="w-3 h-3" />{item.hostel_area}
                    </p>
                )}
            </div>
        </div>
    )
}

// Confirmation modal
function DeleteModal({ item, onConfirm, onCancel, loading }) {
    if (!item) return null
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 animate-fade-in">
            <div className="bg-white rounded-2xl shadow-modal max-w-sm w-full p-6 animate-scale-in">
                <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <AlertTriangle className="w-6 h-6 text-red-600" />
                </div>
                <h3 className="text-lg font-bold text-gray-900 text-center mb-1">Delete Listing?</h3>
                <p className="text-sm text-gray-500 text-center mb-1">
                    Are you sure you want to delete:
                </p>
                <p className="text-sm font-semibold text-gray-800 text-center mb-6 line-clamp-2">
                    "{item.title}"
                </p>
                <p className="text-xs text-red-600 bg-red-50 rounded-lg px-3 py-2 text-center mb-5">
                    This action cannot be undone.
                </p>
                <div className="flex gap-3">
                    <button
                        onClick={onCancel}
                        disabled={loading}
                        className="flex-1 px-4 py-2.5 border border-gray-200 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={onConfirm}
                        disabled={loading}
                        className="flex-1 px-4 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm font-semibold transition-colors flex items-center justify-center gap-2"
                    >
                        {loading ? (
                            <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        ) : (
                            <Trash2 className="w-4 h-4" />
                        )}
                        {loading ? 'Deleting…' : 'Yes, Delete'}
                    </button>
                </div>
            </div>
        </div>
    )
}

export default function Profile() {
    const { profile, user } = useAuthStore()
    const { items, fetchItems, deleteItem } = useItemStore()
    const [pendingDelete, setPendingDelete] = useState(null)   // item to confirm delete
    const [deleteLoading, setDeleteLoading] = useState(false)
    const [deleteError, setDeleteError] = useState('')

    useEffect(() => { fetchItems() }, [])

    const myItems = items.filter(i => i.seller_id === user?.id || i.seller?.id === user?.id)

    const displayName =
        profile?.full_name ||
        user?.user_metadata?.full_name ||
        user?.email?.split('@')[0] ||
        'Student'

    const rating = profile?.rating ?? null
    const department = profile?.department || user?.user_metadata?.department
    const hostel = profile?.hostel || user?.user_metadata?.hostel
    const uid = profile?.uid || user?.user_metadata?.uid

    const handleDeleteConfirm = async () => {
        if (!pendingDelete) return
        setDeleteLoading(true)
        setDeleteError('')
        try {
            await deleteItem(pendingDelete.id)
            setPendingDelete(null)
        } catch (err) {
            setDeleteError(err.message || 'Failed to delete. Please try again.')
        } finally {
            setDeleteLoading(false)
        }
    }

    return (
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 animate-fade-in">
            {/* Delete confirmation modal */}
            <DeleteModal
                item={pendingDelete}
                onConfirm={handleDeleteConfirm}
                onCancel={() => { setPendingDelete(null); setDeleteError('') }}
                loading={deleteLoading}
            />

            {/* Profile header */}
            <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5">
                    <Avatar name={displayName} src={profile?.avatar_url} size="xl" />
                    <div className="flex-1">
                        <h1 className="text-2xl font-bold text-gray-900">{displayName}</h1>
                        <p className="text-sm text-gray-500">{profile?.email || user?.email}</p>
                        <div className="flex flex-wrap gap-2 mt-2">
                            {department && (
                                <span className="text-xs bg-gray-100 text-gray-600 rounded-full px-3 py-1">
                                    {department}
                                </span>
                            )}
                            {hostel && (
                                <span className="text-xs bg-gray-100 text-gray-600 rounded-full px-3 py-1">
                                    {hostel}
                                </span>
                            )}
                            {uid && (
                                <span className="text-xs bg-brand-subtle text-brand-red rounded-full px-3 py-1">
                                    UID: {uid}
                                </span>
                            )}
                        </div>
                    </div>

                    {rating !== null ? (
                        <div className="flex items-center gap-1.5 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2">
                            <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                            <span className="text-sm font-bold text-amber-700">{rating.toFixed(1)}</span>
                            <span className="text-xs text-amber-600 ml-1">Seller rating</span>
                        </div>
                    ) : (
                        <div className="flex items-center gap-1.5 bg-gray-50 border border-gray-200 rounded-lg px-3 py-2">
                            <Star className="w-4 h-4 text-gray-300" />
                            <span className="text-xs text-gray-400">No ratings yet</span>
                        </div>
                    )}
                </div>

                <div className="grid grid-cols-3 gap-4 mt-6 pt-5 border-t border-gray-100">
                    {[
                        ['My Listings', myItems.length, Package],
                        ['Trades', profile?.trade_count ?? 0, ArrowRightLeft],
                        ['Sold', profile?.sold_count ?? 0, Star],
                    ].map(([label, count, Icon]) => (
                        <div key={label} className="text-center">
                            <Icon className="w-5 h-5 text-gray-400 mx-auto mb-1" />
                            <p className="text-xl font-bold text-gray-900">{count}</p>
                            <p className="text-xs text-gray-500">{label}</p>
                        </div>
                    ))}
                </div>
            </div>

            {/* My Listings */}
            <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-bold text-gray-900">
                    My Listings
                    {myItems.length > 0 && (
                        <span className="ml-2 text-sm font-normal text-gray-400">({myItems.length})</span>
                    )}
                </h2>
                <Link to="/create-listing">
                    <Button size="sm"><Plus className="w-4 h-4" /> Add Listing</Button>
                </Link>
            </div>

            {deleteError && (
                <div className="mb-4 bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg p-3 flex items-center justify-between">
                    <span>⚠️ {deleteError}</span>
                    <button onClick={() => setDeleteError('')}><X className="w-4 h-4" /></button>
                </div>
            )}

            {myItems.length === 0 ? (
                <div className="bg-white rounded-xl border border-dashed border-gray-200 p-12 text-center">
                    <Package className="w-10 h-10 text-gray-300 mx-auto mb-3" />
                    <h3 className="font-semibold text-gray-700 mb-1">No listings yet</h3>
                    <p className="text-sm text-gray-400 mb-4">List your first item and start trading!</p>
                    <Link to="/create-listing"><Button>Post Your First Item</Button></Link>
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {myItems.map(item => (
                        <MyListingCard
                            key={item.id}
                            item={item}
                            onDelete={(item) => { setPendingDelete(item); setDeleteError('') }}
                        />
                    ))}
                </div>
            )}
        </div>
    )
}
