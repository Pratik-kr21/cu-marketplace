import { X, SlidersHorizontal } from 'lucide-react'
import { useItemStore } from '../../store/itemStore'
import { CATEGORIES, CONDITIONS, CU_HOSTELS } from '../../lib/validators'

export default function FilterPanel({ onClose }) {
    const { filters, setFilters, clearFilters } = useItemStore()

    const activeCount = [filters.category, filters.condition, filters.minPrice, filters.maxPrice, filters.barterOnly, filters.hostel].filter(Boolean).length

    return (
        <aside className="w-full lg:w-60 flex-shrink-0">
            <div className="bg-white border border-gray-200 rounded-lg p-4 space-y-5 sticky top-20">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <SlidersHorizontal className="w-4 h-4 text-gray-600" />
                        <h3 className="text-sm font-semibold text-gray-900">Filters</h3>
                        {activeCount > 0 && <span className="bg-brand-red text-white text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center">{activeCount}</span>}
                    </div>
                    {activeCount > 0 && <button onClick={clearFilters} className="text-xs text-brand-red font-semibold hover:underline">Clear all</button>}
                </div>

                {/* Barter Only */}
                <div>
                    <label className="flex items-center gap-2 cursor-pointer">
                        <input type="checkbox" className="checkbox-red w-4 h-4 rounded" checked={filters.barterOnly} onChange={e => setFilters({ barterOnly: e.target.checked })} />
                        <span className="text-sm text-gray-700 font-medium">Barter Only</span>
                    </label>
                </div>

                <hr className="border-gray-100" />

                {/* Category */}
                <div>
                    <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Category</h4>
                    <div className="space-y-1">
                        {CATEGORIES.map(cat => (
                            <label key={cat} className="flex items-center gap-2 cursor-pointer group">
                                <input type="radio" name="category" className="checkbox-red" checked={filters.category === cat} onChange={() => setFilters({ category: filters.category === cat ? '' : cat })} />
                                <span className="text-sm text-gray-700 group-hover:text-gray-900 transition-colors">{cat}</span>
                            </label>
                        ))}
                    </div>
                </div>

                <hr className="border-gray-100" />

                {/* Condition */}
                <div>
                    <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Condition</h4>
                    <div className="space-y-1">
                        {CONDITIONS.map(c => (
                            <label key={c.value} className="flex items-center gap-2 cursor-pointer group">
                                <input type="radio" name="condition" className="checkbox-red" checked={filters.condition === c.value} onChange={() => setFilters({ condition: filters.condition === c.value ? '' : c.value })} />
                                <span className="text-sm text-gray-700 group-hover:text-gray-900 transition-colors">{c.label}</span>
                            </label>
                        ))}
                    </div>
                </div>

                <hr className="border-gray-100" />

                {/* Price */}
                <div>
                    <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Price Range (₹)</h4>
                    <div className="flex gap-2">
                        <input type="number" placeholder="Min" value={filters.minPrice} onChange={e => setFilters({ minPrice: e.target.value })}
                            className="w-full h-9 border border-gray-200 rounded-md px-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-red" />
                        <input type="number" placeholder="Max" value={filters.maxPrice} onChange={e => setFilters({ maxPrice: e.target.value })}
                            className="w-full h-9 border border-gray-200 rounded-md px-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-red" />
                    </div>
                    {/* Quick price tags */}
                    <div className="flex flex-wrap gap-1 mt-2">
                        {[['Under ₹500', '', '500'], ['₹500–2K', '500', '2000'], ['₹2K+', '2000', '']].map(([label, min, max]) => (
                            <button key={label} onClick={() => setFilters({ minPrice: min, maxPrice: max })}
                                className="text-xs border border-gray-200 rounded px-2 py-1 hover:border-brand-red hover:text-brand-red transition-colors">
                                {label}
                            </button>
                        ))}
                    </div>
                </div>

                <hr className="border-gray-100" />

                {/* Hostel */}
                <div>
                    <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Hostel Area</h4>
                    <select value={filters.hostel} onChange={e => setFilters({ hostel: e.target.value })}
                        className="w-full h-9 border border-gray-200 rounded-md px-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-red">
                        <option value="">All Areas</option>
                        {CU_HOSTELS.map(h => <option key={h} value={h.split(' ')[0] + ' ' + h.split(' ')[1]}>{h}</option>)}
                    </select>
                </div>
            </div>
        </aside>
    )
}
