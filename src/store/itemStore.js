import { create } from 'zustand'
import { supabase, isSupabaseConfigured } from '../lib/supabase'
import { MOCK_ITEMS } from '../lib/mockData'

export const useItemStore = create((set, get) => ({
    items: [],
    loading: false,
    filters: { category: '', condition: '', minPrice: '', maxPrice: '', barterOnly: false, hostel: '', search: '' },
    sortBy: 'newest',

    setFilters: (filters) => set(state => ({ filters: { ...state.filters, ...filters } })),
    setSortBy: (sortBy) => set({ sortBy }),
    clearFilters: () => set({ filters: { category: '', condition: '', minPrice: '', maxPrice: '', barterOnly: false, hostel: '', search: '' } }),

    fetchItems: async () => {
        set({ loading: true })
        if (!isSupabaseConfigured) {
            set({ items: MOCK_ITEMS, loading: false })
            return
        }
        const { data, error } = await supabase.from('items').select('*, seller:profiles(*)').eq('is_available', true).order('created_at', { ascending: false })
        if (!error) set({ items: data || [] })
        set({ loading: false })
    },

    getFilteredItems: () => {
        const { items, filters, sortBy } = get()
        let results = [...items]
        if (filters.search) results = results.filter(i => i.title.toLowerCase().includes(filters.search.toLowerCase()) || i.description.toLowerCase().includes(filters.search.toLowerCase()))
        if (filters.category) results = results.filter(i => i.category === filters.category)
        if (filters.condition) results = results.filter(i => i.condition === filters.condition)
        if (filters.barterOnly) results = results.filter(i => i.is_barter_only)
        if (filters.hostel) results = results.filter(i => i.hostel_area === filters.hostel)
        if (filters.minPrice) results = results.filter(i => (i.price || 0) >= Number(filters.minPrice))
        if (filters.maxPrice) results = results.filter(i => (i.price || 0) <= Number(filters.maxPrice))
        if (sortBy === 'price_asc') results.sort((a, b) => (a.price || 0) - (b.price || 0))
        else if (sortBy === 'price_desc') results.sort((a, b) => (b.price || 0) - (a.price || 0))
        else results.sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
        return results
    },

    createItem: async (itemData, userId) => {
        if (!isSupabaseConfigured) {
            const newItem = { id: Date.now().toString(), ...itemData, seller_id: userId, is_available: true, created_at: new Date().toISOString(), seller: { full_name: 'You', department: '', hostel: '' }, rating: 5.0 }
            set(state => ({ items: [newItem, ...state.items] }))
            return newItem
        }
        const { data, error } = await supabase.from('items').insert([{ ...itemData, seller_id: userId }]).select().single()
        if (error) throw error
        set(state => ({ items: [data, ...state.items] }))
        return data
    },

    deleteItem: async (itemId) => {
        if (!isSupabaseConfigured) {
            set(state => ({ items: state.items.filter(i => i.id !== itemId) }))
            return
        }
        const { error } = await supabase.from('items').delete().eq('id', itemId)
        if (error) throw error
        set(state => ({ items: state.items.filter(i => i.id !== itemId) }))
    },
}))
