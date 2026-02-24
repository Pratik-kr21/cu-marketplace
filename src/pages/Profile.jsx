import { useAuthStore } from '../store/authStore'
import { useItemStore } from '../store/itemStore'
import { useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Package, Plus, ArrowRightLeft, Star } from 'lucide-react'
import Avatar from '../components/ui/Avatar'
import Button from '../components/ui/Button'
import ItemCard from '../components/marketplace/ItemCard'

export default function Profile() {
    const { profile, user } = useAuthStore()
    const { items, fetchItems } = useItemStore()

    useEffect(() => { fetchItems() }, [])

    const myItems = items.filter(i => i.seller_id === user?.id || i.seller?.id === user?.id)

    // Resolve display name: profile DB row → Supabase signup metadata → email prefix → fallback
    const displayName =
        profile?.full_name ||
        user?.user_metadata?.full_name ||
        user?.email?.split('@')[0] ||
        'Student'

    // Only show rating if we have a real value stored on the profile
    const rating = profile?.rating ?? null

    const department = profile?.department || user?.user_metadata?.department
    const hostel = profile?.hostel || user?.user_metadata?.hostel
    const uid = profile?.uid || user?.user_metadata?.uid

    return (
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 animate-fade-in">
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

                    {/* Rating — only shown when there's a real value */}
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
                <h2 className="text-lg font-bold text-gray-900">My Listings</h2>
                <Link to="/create-listing"><Button size="sm"><Plus className="w-4 h-4" /> Add Listing</Button></Link>
            </div>

            {myItems.length === 0 ? (
                <div className="bg-white rounded-xl border border-dashed border-gray-200 p-12 text-center">
                    <Package className="w-10 h-10 text-gray-300 mx-auto mb-3" />
                    <h3 className="font-semibold text-gray-700 mb-1">No listings yet</h3>
                    <p className="text-sm text-gray-400 mb-4">List your first item and start trading!</p>
                    <Link to="/create-listing"><Button>Post Your First Item</Button></Link>
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {myItems.map(item => <ItemCard key={item.id} item={item} />)}
                </div>
            )}
        </div>
    )
}
