import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Upload, X, CheckCircle, Loader2, AlertCircle } from 'lucide-react'
import { useAuthStore } from '../store/authStore'
import { useItemStore } from '../store/itemStore'
import { CATEGORIES, CONDITIONS, CU_HOSTELS } from '../lib/validators'
import { uploadImageToStorage, validateImageFile, deleteImagesFromStorage, MAX_IMAGES_PER_LISTING } from '../lib/imageUpload'
import { isSupabaseConfigured } from '../lib/supabase'
import Button from '../components/ui/Button'
import Input, { Textarea, Select } from '../components/ui/Input'

const steps = ['Photos', 'Details', 'Pricing']

const schema = z.object({
    title: z.string().min(5, 'At least 5 characters'),
    description: z.string().min(20, 'At least 20 characters'),
    category: z.string().min(1, 'Pick a category'),
    condition: z.string().min(1, 'Pick a condition'),
    listing_type: z.enum(['sell', 'barter', 'both']),
    price: z.string().optional(),
    hostel_area: z.string().optional(),
})

export default function CreateListing() {
    const navigate = useNavigate()
    const { user, profile } = useAuthStore()
    const { createItem } = useItemStore()
    const [step, setStep] = useState(0)
    const [images, setImages] = useState([])  // { localPreview, uploadStatus, publicUrl, file }
    const [loading, setLoading] = useState(false)
    const [success, setSuccess] = useState(false)

    const { register, handleSubmit, watch, formState: { errors } } = useForm({ resolver: zodResolver(schema), defaultValues: { listing_type: 'sell' } })
    const listingType = watch('listing_type')
    const [imageError, setImageError] = useState('')
    const [submitError, setSubmitError] = useState('')
    const [detailErrors, setDetailErrors] = useState({})

    // Watch all detail fields live so we can validate them manually
    const watchedTitle = watch('title')
    const watchedDesc = watch('description')
    const watchedCat = watch('category')
    const watchedCond = watch('condition')

    const validateDetails = () => {
        const errs = {}
        if (!watchedTitle || watchedTitle.trim().length < 5)
            errs.title = 'Title must be at least 5 characters.'
        if (!watchedDesc || watchedDesc.trim().length < 20)
            errs.description = 'Description must be at least 20 characters.'
        if (!watchedCat)
            errs.category = 'Please select a category.'
        if (!watchedCond)
            errs.condition = 'Please select a condition.'
        setDetailErrors(errs)
        return Object.keys(errs).length === 0
    }

    // Handle image selection — validate, create local preview
    const handleImageAdd = async (e) => {
        const files = Array.from(e.target.files)
        setImageError('')

        for (const file of files) {
            if (images.length >= MAX_IMAGES_PER_LISTING) {
                setImageError(`Maximum ${MAX_IMAGES_PER_LISTING} images allowed.`)
                break
            }

            // Client-side validation
            const error = validateImageFile(file)
            if (error) {
                setImageError(error)
                continue
            }

            // Create local preview
            const localPreview = URL.createObjectURL(file)
            setImages(prev => {
                if (prev.length >= MAX_IMAGES_PER_LISTING) return prev
                return [...prev, {
                    localPreview,
                    file,
                    uploadStatus: 'pending', // pending | compressing | uploading | done | error
                    publicUrl: null,
                    error: null,
                }]
            })
        }

        // Reset input
        e.target.value = ''
    }

    const removeImage = (index) => {
        setImages(prev => {
            const removed = prev[index]
            if (removed?.localPreview) URL.revokeObjectURL(removed.localPreview)
            // If already uploaded to Supabase Storage, delete (fire-and-forget)
            if (removed?.publicUrl) {
                deleteImagesFromStorage([removed.publicUrl]).catch(() => { })
            }
            return prev.filter((_, i) => i !== index)
        })
    }

    // Upload all pending images to Supabase Storage
    const uploadAllImages = async () => {
        const uploadPromises = images.map(async (img, index) => {
            if (img.publicUrl) return img // Already uploaded

            try {
                setImages(prev => prev.map((im, i) =>
                    i === index ? { ...im, uploadStatus: 'compressing' } : im
                ))

                const publicUrl = await uploadImageToStorage(img.file, user.id, (status) => {
                    setImages(prev => prev.map((im, i) =>
                        i === index ? { ...im, uploadStatus: status } : im
                    ))
                })

                setImages(prev => prev.map((im, i) =>
                    i === index ? { ...im, publicUrl, uploadStatus: 'done' } : im
                ))

                return { ...img, publicUrl, uploadStatus: 'done' }
            } catch (err) {
                setImages(prev => prev.map((im, i) =>
                    i === index ? { ...im, uploadStatus: 'error', error: err.message } : im
                ))
                throw err
            }
        })

        return Promise.all(uploadPromises)
    }

    const onSubmit = async (data) => {
        setLoading(true)
        setSubmitError('')
        try {
            // Upload images to Supabase Storage first
            let uploadedImages
            if (isSupabaseConfigured) {
                uploadedImages = await uploadAllImages()
            } else {
                // Demo mode — use local previews
                uploadedImages = images
            }

            const imageUrls = uploadedImages.map(img => img.publicUrl || img.localPreview)

            const itemData = {
                title: data.title,
                description: data.description,
                category: data.category,
                condition: data.condition,
                price: data.listing_type !== 'barter' ? Number(data.price) || 0 : null,
                is_barter_only: data.listing_type === 'barter',
                accept_hybrid: data.listing_type === 'both',
                is_free: Number(data.price) === 0 && data.listing_type !== 'barter',
                hostel_area: data.hostel_area || profile?.hostel || '',
                images: imageUrls,  // Supabase Storage public URLs
            }
            await createItem(itemData, user.id)
            setSuccess(true)
            setTimeout(() => navigate('/marketplace'), 2000)
        } catch (err) {
            setSubmitError(err.message || 'Failed to post listing. Please try again.')
        } finally {
            setLoading(false)
        }
    }

    if (success) return (
        <div className="max-w-lg mx-auto py-20 text-center animate-scale-in">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Listing Posted!</h2>
            <p className="text-gray-500">Your item is now live on CU Marketplace. Redirecting...</p>
        </div>
    )

    return (
        <div className="max-w-2xl mx-auto px-4 sm:px-6 py-8">
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Post a Listing</h1>
            <p className="text-sm text-gray-500 mb-6">Fill in the details to list your item for sale or barter.</p>

            {/* Steps */}
            <div className="flex items-center gap-2 mb-8">
                {steps.map((s, i) => (
                    <div key={s} className="flex items-center gap-2">
                        <button onClick={() => i < step + 1 && setStep(i)}
                            className={`w-7 h-7 rounded-full text-xs font-bold flex items-center justify-center transition-colors ${i === step ? 'bg-brand-red text-white' : i < step ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-400'}`}>
                            {i < step ? '✓' : i + 1}
                        </button>
                        <span className={`text-sm ${i === step ? 'font-semibold text-gray-900' : 'text-gray-400'}`}>{s}</span>
                        {i < steps.length - 1 && <div className={`flex-1 h-0.5 w-8 ${i < step ? 'bg-gray-900' : 'bg-gray-200'}`} />}
                    </div>
                ))}
            </div>

            <form onSubmit={handleSubmit(onSubmit)}>
                {/* Step 0: Photos */}
                {step === 0 && (
                    <div className="space-y-4 animate-fade-in">
                        <div>
                            <label className="text-sm font-medium text-gray-700 block mb-2">Photos (up to {MAX_IMAGES_PER_LISTING})</label>
                            <div className="grid grid-cols-3 gap-3">
                                {images.map((img, i) => (
                                    <div key={i} className="relative aspect-square bg-gray-100 rounded-lg overflow-hidden">
                                        <img src={img.localPreview} className="w-full h-full object-cover" alt="" />

                                        {/* Upload status overlay */}
                                        {img.uploadStatus === 'compressing' && (
                                            <div className="absolute inset-0 bg-black/40 flex flex-col items-center justify-center">
                                                <Loader2 className="w-5 h-5 text-white animate-spin" />
                                                <span className="text-xs text-white mt-1">Compressing...</span>
                                            </div>
                                        )}
                                        {img.uploadStatus === 'uploading' && (
                                            <div className="absolute inset-0 bg-black/40 flex flex-col items-center justify-center">
                                                <Loader2 className="w-5 h-5 text-white animate-spin" />
                                                <span className="text-xs text-white mt-1">Uploading...</span>
                                            </div>
                                        )}
                                        {img.uploadStatus === 'done' && (
                                            <div className="absolute top-1 left-1">
                                                <CheckCircle className="w-5 h-5 text-green-400 drop-shadow" />
                                            </div>
                                        )}
                                        {img.uploadStatus === 'error' && (
                                            <div className="absolute inset-0 bg-red-900/30 flex flex-col items-center justify-center">
                                                <AlertCircle className="w-5 h-5 text-red-400" />
                                                <span className="text-xs text-red-200 mt-1 px-2 text-center">{img.error}</span>
                                            </div>
                                        )}

                                        <button type="button" onClick={() => removeImage(i)}
                                            className="absolute top-1 right-1 bg-gray-900/70 text-white rounded-full p-0.5">
                                            <X className="w-3 h-3" />
                                        </button>
                                    </div>
                                ))}
                                {images.length < MAX_IMAGES_PER_LISTING && (
                                    <label className="aspect-square bg-gray-50 border-2 border-dashed border-gray-200 hover:border-brand-red rounded-lg flex flex-col items-center justify-center cursor-pointer transition-colors group">
                                        <Upload className="w-6 h-6 text-gray-300 group-hover:text-brand-red" />
                                        <span className="text-xs text-gray-400 mt-1">Add photo</span>
                                        <input type="file" accept=".jpg,.jpeg,.webp" multiple className="hidden" onChange={handleImageAdd} />
                                    </label>
                                )}
                            </div>
                            <p className="text-xs text-gray-400 mt-2">
                                Images auto-compressed to WebP · Max {MAX_IMAGES_PER_LISTING} photos · JPG, WebP only
                            </p>
                        </div>
                        {imageError && (
                            <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
                                📷 {imageError}
                            </p>
                        )}
                        <Button type="button" size="lg" className="w-full" onClick={() => {
                            if (images.length === 0) {
                                setImageError('Please upload at least one photo of your item.')
                                return
                            }
                            setImageError('')
                            setStep(1)
                        }}>Continue →</Button>
                    </div>
                )}

                {/* Step 1: Details */}
                {step === 1 && (
                    <div className="space-y-4 animate-fade-in">
                        <div>
                            <Input label="Title *" placeholder="e.g. RD Sharma Maths Textbook 3rd Sem" {...register('title')} />
                            {detailErrors.title && <p className="text-xs text-red-500 mt-1">{detailErrors.title}</p>}
                        </div>
                        <div>
                            <Textarea label="Description *" placeholder="Describe your item — condition details, how old it is, any issues..." rows={4} {...register('description')} />
                            {detailErrors.description && <p className="text-xs text-red-500 mt-1">{detailErrors.description}</p>}
                        </div>
                        <div>
                            <Select label="Category *" {...register('category')}>
                                <option value="">Select category...</option>
                                {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                            </Select>
                            {detailErrors.category && <p className="text-xs text-red-500 mt-1">{detailErrors.category}</p>}
                        </div>
                        <div>
                            <Select label="Condition *" {...register('condition')}>
                                <option value="">Select condition...</option>
                                {CONDITIONS.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
                            </Select>
                            {detailErrors.condition && <p className="text-xs text-red-500 mt-1">{detailErrors.condition}</p>}
                        </div>
                        <Select label="Your Hostel Area" {...register('hostel_area')}>
                            <option value="">Select hostel...</option>
                            {CU_HOSTELS.map(h => <option key={h} value={h}>{h}</option>)}
                        </Select>
                        <div className="flex gap-3">
                            <Button type="button" variant="secondary" size="lg" className="flex-1" onClick={() => setStep(0)}>← Back</Button>
                            <Button type="button" size="lg" className="flex-1" onClick={() => {
                                if (validateDetails()) setStep(2)
                            }}>Continue →</Button>
                        </div>
                    </div>
                )}

                {/* Step 2: Pricing */}
                {step === 2 && (
                    <div className="space-y-4 animate-fade-in">
                        <div>
                            <label className="text-sm font-medium text-gray-700 block mb-2">Listing Type *</label>
                            <div className="grid grid-cols-3 gap-2">
                                {[['sell', 'Sell for Cash'], ['barter', 'Barter Only'], ['both', 'Sell & Barter']].map(([val, label]) => (
                                    <label key={val} className={`flex flex-col items-center p-3 border-2 rounded-lg cursor-pointer transition-colors text-center ${listingType === val ? 'border-brand-red bg-brand-subtle' : 'border-gray-200 hover:border-gray-300'}`}>
                                        <input type="radio" value={val} {...register('listing_type')} className="hidden" />
                                        <span className="text-sm font-medium text-gray-900">{label}</span>
                                    </label>
                                ))}
                            </div>
                        </div>
                        {listingType !== 'barter' && (
                            <Input label="Price (₹) *" type="number" placeholder="0 for free" prefix="₹" error={errors.price?.message} {...register('price')} />
                        )}
                        <div className="bg-gray-50 rounded-lg p-4 border border-gray-100">
                            <p className="text-xs text-gray-500 leading-relaxed">
                                ✓ Your item will be visible to all verified CU students.<br />
                                ✓ All exchanges happen on campus at safe meeting points.<br />
                                ✓ You can edit or remove your listing at any time.<br />
                                ✓ Listings auto-expire after 30 days.
                            </p>
                        </div>
                        {submitError && (
                            <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg p-3">
                                ⚠️ {submitError}
                            </div>
                        )}
                        <div className="flex gap-3">
                            <Button type="button" variant="secondary" size="lg" className="flex-1" onClick={() => setStep(1)}>← Back</Button>
                            <Button type="submit" size="lg" loading={loading} className="flex-1">
                                {loading ? 'Uploading & Posting...' : 'Post Listing 🎉'}
                            </Button>
                        </div>
                    </div>
                )}
            </form>
        </div>
    )
}
