export default function Avatar({ name = '', src, size = 'md', className = '' }) {
    const initials = name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()
    const sizes = { xs: 'w-6 h-6 text-xs', sm: 'w-8 h-8 text-xs', md: 'w-10 h-10 text-sm', lg: 'w-12 h-12 text-base', xl: 'w-16 h-16 text-xl' }
    return src
        ? <img src={src} alt={name} className={`rounded-full object-cover bg-gray-200 ${sizes[size]} ${className}`} />
        : (
            <div className={`rounded-full bg-brand-red text-white font-bold flex items-center justify-center flex-shrink-0 ${sizes[size]} ${className}`}>
                {initials || '?'}
            </div>
        )
}
