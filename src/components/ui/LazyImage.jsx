import { useState, useRef, useEffect } from 'react'
import { ImageOff } from 'lucide-react'

/**
 * LazyImage — loads images only when they enter the viewport.
 * Shows a shimmer placeholder while loading.
 * Works with Supabase Storage public URLs, base64 data URIs, and any image src.
 */
export default function LazyImage({ src, alt, className = '', ...props }) {
    const [loaded, setLoaded] = useState(false)
    const [error, setError] = useState(false)
    const [inView, setInView] = useState(false)
    const imgRef = useRef(null)

    useEffect(() => {
        if (!imgRef.current) return

        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) {
                    setInView(true)
                    observer.disconnect()
                }
            },
            { rootMargin: '200px' } // Start loading 200px before visible
        )

        observer.observe(imgRef.current)
        return () => observer.disconnect()
    }, [])

    // If src is a base64 data URI, load immediately (legacy support)
    const isBase64 = src?.startsWith('data:')

    return (
        <div ref={imgRef} className={`relative overflow-hidden ${className}`} {...props}>
            {/* Shimmer placeholder */}
            {!loaded && !error && (
                <div className="absolute inset-0 bg-gray-100 animate-pulse">
                    <div className="absolute inset-0 bg-gradient-to-r from-gray-100 via-gray-200 to-gray-100 animate-shimmer" />
                </div>
            )}

            {/* Error state */}
            {error && (
                <div className="absolute inset-0 bg-gray-50 flex items-center justify-center">
                    <ImageOff className="w-8 h-8 text-gray-300" />
                </div>
            )}

            {/* The actual image */}
            {(inView || isBase64) && src && !error && (
                <img
                    src={src}
                    alt={alt || ''}
                    loading="lazy"
                    decoding="async"
                    onLoad={() => setLoaded(true)}
                    onError={() => setError(true)}
                    className={`w-full h-full object-cover transition-opacity duration-300 ${loaded ? 'opacity-100' : 'opacity-0'}`}
                />
            )}
        </div>
    )
}
