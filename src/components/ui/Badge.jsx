export default function Badge({ children, variant = 'default', className = '' }) {
    const variants = {
        default: 'bg-gray-900 text-white',
        red: 'bg-brand-red text-white',
        outline: 'bg-white border border-gray-200 text-gray-700',
        success: 'bg-green-600 text-white',
        warning: 'bg-amber-500 text-white',
        barter: 'bg-gray-900 text-white',
        new: 'bg-green-600 text-white',
        like_new: 'bg-blue-600 text-white',
        good: 'bg-amber-500 text-white',
        fair: 'bg-gray-500 text-white',
    }
    return (
        <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-semibold ${variants[variant] || variants.default} ${className}`}>
            {children}
        </span>
    )
}

export function ConditionBadge({ condition }) {
    const map = { new: { label: 'New', v: 'new' }, like_new: { label: 'Like New', v: 'like_new' }, good: { label: 'Good', v: 'good' }, fair: { label: 'Fair', v: 'fair' } }
    const c = map[condition] || { label: condition, v: 'default' }
    return <Badge variant={c.v}>{c.label}</Badge>
}
