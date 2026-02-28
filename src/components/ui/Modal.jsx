import { useEffect } from 'react'
import { X } from 'lucide-react'

export default function Modal({ isOpen, onClose, title, children, size = 'md' }) {
    useEffect(() => {
        if (isOpen) document.body.style.overflow = 'hidden'
        else document.body.style.overflow = ''
        return () => { document.body.style.overflow = '' }
    }, [isOpen])

    if (!isOpen) return null

    const sizes = { sm: 'max-w-sm', md: 'max-w-lg', lg: 'max-w-2xl', xl: 'max-w-4xl' }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={onClose}>
            <div className="absolute inset-0 bg-black/50 backdrop-blur-sm animate-fade-in" />
            <div
                className={`relative bg-white rounded-xl shadow-modal w-full ${sizes[size]} max-h-[90vh] overflow-y-auto animate-scale-in`}
                onClick={e => e.stopPropagation()}
            >
                {title && (
                    <div className="flex items-center justify-between p-6 border-b border-gray-100">
                        <h2 className="text-lg font-semibold text-gray-900">{title}</h2>
                        <button onClick={onClose} className="p-1 rounded-md hover:bg-gray-100 transition-colors">
                            <X className="w-5 h-5 text-gray-500" />
                        </button>
                    </div>
                )}
                <div className="p-6">{children}</div>
            </div>
        </div>
    )
}
