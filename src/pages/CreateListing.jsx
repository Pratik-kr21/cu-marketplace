import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Upload, X, CheckCircle } from 'lucide-react'
import { useAuthStore } from '../store/authStore'
import { useItemStore } from '../store/itemStore'
import { CATEGORIES, CONDITIONS, CU_HOSTELS } from '../lib/validators'
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
    const [images, setImages] = useState([])
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

    // Resize + compress image via canvas before storing as base64
    const compressImage = (file) => new Promise((resolve) => {
        const img = new Image()
        const objectUrl = URL.createObjectURL(file)
        img.onload = () => {
            const MAX = 800
            let { width, height } = img
            if (width > MAX || height > MAX) {
                if (width > height) { height = Math.round(height * MAX / width); width = MAX }
                else { width = Math.round(width * MAX / height); height = MAX }
            }
            const canvas = document.createElement('canvas')
            canvas.width = width
            canvas.height = height
            canvas.getContext('2d').drawImage(img, 0, 0, width, height)
            URL.revokeObjectURL(objectUrl)
            resolve(canvas.toDataURL('image/jpeg', 0.6))  // 60% quality JPEG
        }
        img.src = objectUrl
    })

    const handleImageAdd = async (e) => {
        const files = Array.from(e.target.files)
        for (const file of files) {
            if (images.length >= 5) break
            const compressed = await compressImage(file)
            setImages(prev => prev.length < 5 ? [...prev, { url: compressed, file }] : prev)
        }
    }

    const onSubmit = async (data) => {
        setLoading(true)
        setSubmitError('')
        try {
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
                images: images.map(i => i.url),  // base64 strings
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
                            <label className="text-sm font-medium text-gray-700 block mb-2">Photos (up to 5)</label>
                            <div className="grid grid-cols-3 gap-3">
                                {images.map((img, i) => (
                                    <div key={i} className="relative aspect-square bg-gray-100 rounded-lg overflow-hidden">
                                        <img src={img.url} className="w-full h-full object-cover" />
                                        <button type="button" onClick={() => setImages(prev => prev.filter((_, j) => j !== i))}
                                            className="absolute top-1 right-1 bg-gray-900/70 text-white rounded-full p-0.5">
                                            <X className="w-3 h-3" />
                                        </button>
                                    </div>
                                ))}
                                {images.length < 5 && (
                                    <label className="aspect-square bg-gray-50 border-2 border-dashed border-gray-200 hover:border-brand-red rounded-lg flex flex-col items-center justify-center cursor-pointer transition-colors group">
                                        <Upload className="w-6 h-6 text-gray-300 group-hover:text-brand-red" />
                                        <span className="text-xs text-gray-400 mt-1">Add photo</span>
                                        <input type="file" accept="image/*" multiple className="hidden" onChange={handleImageAdd} />
                                    </label>
                                )}
                            </div>
                            <p className="text-xs text-gray-400 mt-2">Good photos get 3× more responses. JPG, PNG up to 10MB.</p>
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
                                ✓ You can edit or remove your listing at any time.
                            </p>
                        </div>
                        {submitError && (
                            <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg p-3">
                                ⚠️ {submitError}
                            </div>
                        )}
                        <div className="flex gap-3">
                            <Button type="button" variant="secondary" size="lg" className="flex-1" onClick={() => setStep(1)}>← Back</Button>
                            <Button type="submit" size="lg" loading={loading} className="flex-1">Post Listing 🎉</Button>
                        </div>
                    </div>
                )}
            </form>
        </div>
    )
}
