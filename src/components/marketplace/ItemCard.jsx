import { useNavigate } from 'react-router-dom'
import { Star, MapPin, ArrowRightLeft, Tag, Heart } from 'lucide-react'
import Badge, { ConditionBadge } from '../ui/Badge'
import LazyImage from '../ui/LazyImage'
import { useAuthStore } from '../../store/authStore'

export default function ItemCard({ item }) {
    const navigate = useNavigate()
    const img = item.images?.[0]
    const { user, profile, toggleSavedItem } = useAuthStore()
    const isSaved = profile?.saved_items?.includes(item.id)

    const handleSave = (e) => {
        e.stopPropagation()
        if (!user) {
            navigate('/login')
            return
        }
        toggleSavedItem(item.id)
    }

    const priceLabel = item.is_barter_only
        ? null
        : item.price === 0 || item.is_free
            ? 'Free'
            : item.quantity > 1
                ? `₹${item.price?.toLocaleString('en-IN')} / item`
                : `₹${item.price?.toLocaleString('en-IN')}`

    return (
        <div
            onClick={() => navigate(`/items/${item.id}`)}
            className="group bg-white border border-gray-200 rounded-lg shadow-card hover:shadow-card-hover hover:border-brand-red transition-all duration-150 cursor-pointer flex flex-col overflow-hidden"
        >
            {/* Image — Lazy Loaded */}
            <div className="relative aspect-square bg-gray-50 overflow-hidden">
                {img ? (
                    <LazyImage src={img} alt={item.title} className="w-full h-full group-hover:scale-105 transition-transform duration-300" />
                ) : (
                    <div className="w-full h-full flex items-center justify-center">
                        <Tag className="w-10 h-10 text-gray-300" />
                    </div>
                )}
                {/* Overlay badges */}
                <div className="absolute top-2 left-2 flex gap-1 z-10">
                    {item.is_barter_only && (
                        <span className="flex items-center gap-1 bg-gray-900 text-white text-xs font-semibold px-2 py-0.5 rounded-full">
                            <ArrowRightLeft className="w-3 h-3" /> Barter
                        </span>
                    )}
                    {item.is_free && <span className="bg-green-600 text-white text-xs font-semibold px-2 py-0.5 rounded-full">Free</span>}
                </div>
                {/* Save Button */}
                <button
                    onClick={handleSave}
                    className="absolute top-2 right-2 p-1.5 bg-white/80 hover:bg-white rounded-full text-gray-500 hover:text-brand-red transition-colors z-10 shadow-sm"
                    aria-label="Save item"
                >
                    <Heart className={`w-4 h-4 ${isSaved ? 'fill-brand-red text-brand-red' : ''}`} />
                </button>
            </div>

            {/* Body */}
            <div className="p-3 flex flex-col gap-1.5 flex-1">
                {/* Price */}
                {priceLabel && (
                    <p className="text-base font-bold text-gray-900">{priceLabel}</p>
                )}
                {item.is_barter_only && (
                    <p className="text-base font-bold text-gray-900 flex items-center gap-1">
                        <ArrowRightLeft className="w-4 h-4 text-brand-red" /> Open to Barter
                    </p>
                )}

                {/* Title */}
                <p className="text-sm font-medium text-gray-900 line-clamp-2 leading-snug">{item.title}</p>

                {/* Meta row */}
                <div className="flex items-center justify-between mt-auto pt-1">
                    <div className="flex items-center gap-2">
                        <ConditionBadge condition={item.condition} />
                        {item.quantity > 1 && (
                            <span className="text-xs font-semibold text-gray-600 bg-gray-100 px-1.5 py-0.5 rounded">
                                Qty: {item.quantity}
                            </span>
                        )}
                        {item.hostel_area && (
                            <span className="flex items-center gap-0.5 text-xs text-gray-400">
                                <MapPin className="w-3 h-3" />{item.hostel_area}
                            </span>
                        )}
                    </div>
                    {item.rating && (
                        <span className="flex items-center gap-0.5 text-xs font-semibold bg-gray-50 border border-gray-100 px-1.5 py-0.5 rounded">
                            <Star className="w-3 h-3 fill-amber-400 text-amber-400" />{item.rating}
                        </span>
                    )}
                </div>
            </div>
        </div>
    )
}
