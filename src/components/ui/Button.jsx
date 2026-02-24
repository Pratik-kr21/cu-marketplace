// UI primitives — Button
export default function Button({ children, variant = 'primary', size = 'md', className = '', loading = false, ...props }) {
    const base = 'inline-flex items-center justify-center font-semibold transition-all duration-150 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-red disabled:opacity-60 disabled:cursor-not-allowed active:scale-95'
    const variants = {
        primary: 'bg-brand-red hover:bg-brand-dark text-white rounded-md shadow-sm',
        secondary: 'bg-white border border-gray-200 hover:border-gray-900 text-gray-900 rounded-md',
        ghost: 'bg-transparent hover:bg-gray-100 text-gray-700 rounded-md',
        danger: 'bg-red-600 hover:bg-red-700 text-white rounded-md',
        outline: 'bg-transparent border border-brand-red text-brand-red hover:bg-brand-subtle rounded-md',
    }
    const sizes = {
        sm: 'text-xs px-3 py-1.5 gap-1.5',
        md: 'text-sm px-4 py-2.5 gap-2',
        lg: 'text-base px-6 py-3 gap-2',
    }
    return (
        <button className={`${base} ${variants[variant]} ${sizes[size]} ${className}`} disabled={loading || props.disabled} {...props}>
            {loading && <span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />}
            {children}
        </button>
    )
}
