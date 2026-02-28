import { useEffect, useState } from 'react'
import { Search, SlidersHorizontal, X, ChevronDown } from 'lucide-react'
import { useItemStore } from '../store/itemStore'
import ItemGrid from '../components/marketplace/ItemGrid'
import FilterPanel from '../components/marketplace/FilterPanel'

const SORTS = [
    { value: 'newest', label: 'Newest First' },
    { value: 'price_asc', label: 'Price: Low to High' },
    { value: 'price_desc', label: 'Price: High to Low' },
]

export default function Marketplace() {
    const { loading, fetchItems, filters, setFilters, sortBy, setSortBy, clearFilters, getFilteredItems } = useItemStore()
    const [showMobileFilter, setShowMobileFilter] = useState(false)
    const [searchInput, setSearchInput] = useState(filters.search)

    useEffect(() => { fetchItems() }, [])

    // Debounced search
    useEffect(() => {
        const t = setTimeout(() => setFilters({ search: searchInput }), 300)
        return () => clearTimeout(t)
    }, [searchInput])

    const items = getFilteredItems()
    const activeFilters = [
        filters.category && { label: filters.category, clear: () => setFilters({ category: '' }) },
        filters.condition && { label: filters.condition.replace('_', ' '), clear: () => setFilters({ condition: '' }) },
        filters.barterOnly && { label: 'Barter Only', clear: () => setFilters({ barterOnly: false }) },
        filters.hostel && { label: filters.hostel, clear: () => setFilters({ hostel: '' }) },
        (filters.minPrice || filters.maxPrice) && { label: `₹${filters.minPrice || '0'}–${filters.maxPrice || '∞'}`, clear: () => setFilters({ minPrice: '', maxPrice: '' }) },
    ].filter(Boolean)

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
            {/* Header */}
            <div className="mb-6">
                <h1 className="text-2xl font-bold text-gray-900 mb-4">Marketplace</h1>
                {/* Search bar */}
                <div className="flex gap-2">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Search items, books, electronics..."
                            value={searchInput}
                            onChange={e => setSearchInput(e.target.value)}
                            className="w-full h-10 pl-9 pr-4 border-2 border-gray-200 rounded-full text-sm focus:outline-none focus:border-brand-red transition-colors"
                        />
                    </div>
                    <button onClick={() => setShowMobileFilter(!showMobileFilter)}
                        className="lg:hidden flex items-center gap-1.5 h-10 px-3 border-2 border-gray-200 rounded-full text-sm font-medium hover:border-brand-red transition-colors">
                        <SlidersHorizontal className="w-4 h-4" /> Filters
                        {activeFilters.length > 0 && <span className="bg-brand-red text-white text-xs w-4 h-4 rounded-full flex items-center justify-center">{activeFilters.length}</span>}
                    </button>
                </div>

                {/* Active filter chips */}
                {activeFilters.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-3">
                        {activeFilters.map((f, i) => (
                            <button key={i} onClick={f.clear}
                                className="flex items-center gap-1 border border-gray-200 hover:border-brand-red hover:text-brand-red rounded-full px-3 py-1 text-xs font-medium transition-colors">
                                {f.label} <X className="w-3 h-3" />
                            </button>
                        ))}
                        <button onClick={clearFilters} className="text-xs font-semibold text-brand-red hover:underline px-2">Clear all</button>
                    </div>
                )}
            </div>

            <div className="flex gap-6">
                {/* Sidebar filter — desktop */}
                <div className="hidden lg:block">
                    <FilterPanel />
                </div>

                {/* Main content */}
                <div className="flex-1 min-w-0">
                    {/* Sort + count bar */}
                    <div className="flex items-center justify-between mb-4">
                        <p className="text-sm text-gray-500">
                            <span className="font-semibold text-gray-900">{items.length}</span> items found
                        </p>
                        <div className="relative">
                            <select value={sortBy} onChange={e => setSortBy(e.target.value)}
                                className="appearance-none h-9 pl-3 pr-8 border border-gray-200 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-brand-red bg-white">
                                {SORTS.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
                            </select>
                            <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                        </div>
                    </div>
                    <ItemGrid items={items} loading={loading} />
                </div>
            </div>

            {/* Mobile filter drawer */}
            {showMobileFilter && (
                <div className="fixed inset-0 z-50 lg:hidden">
                    <div className="absolute inset-0 bg-black/50" onClick={() => setShowMobileFilter(false)} />
                    <div className="absolute bottom-0 left-0 right-0 bg-white rounded-t-2xl p-4 max-h-[80vh] overflow-y-auto animate-slide-up">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="font-semibold text-gray-900">Filters</h3>
                            <button onClick={() => setShowMobileFilter(false)}><X className="w-5 h-5 text-gray-500" /></button>
                        </div>
                        <FilterPanel onClose={() => setShowMobileFilter(false)} />
                    </div>
                </div>
            )}
        </div>
    )
}
