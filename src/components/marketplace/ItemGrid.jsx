import ItemCard from './ItemCard'
import { PackageOpen } from 'lucide-react'

export default function ItemGrid({ items, loading }) {
    if (loading) {
        return (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {Array.from({ length: 8 }).map((_, i) => (
                    <div key={i} className="bg-white border border-gray-200 rounded-lg overflow-hidden animate-pulse">
                        <div className="aspect-square bg-gray-100" />
                        <div className="p-3 space-y-2">
                            <div className="h-5 bg-gray-100 rounded w-1/3" />
                            <div className="h-4 bg-gray-100 rounded w-3/4" />
                            <div className="h-4 bg-gray-100 rounded w-1/2" />
                        </div>
                    </div>
                ))}
            </div>
        )
    }

    if (!items.length) {
        return (
            <div className="flex flex-col items-center justify-center py-20 text-center">
                <PackageOpen className="w-14 h-14 text-gray-300 mb-4" />
                <h3 className="text-lg font-semibold text-gray-700">No items found</h3>
                <p className="text-sm text-gray-400 mt-1">Try adjusting your filters or search query.</p>
            </div>
        )
    }

    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {items.map(item => (
                <div key={item.id} className="animate-fade-in">
                    <ItemCard item={item} />
                </div>
            ))}
        </div>
    )
}
