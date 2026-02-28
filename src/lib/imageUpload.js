import { getUploadUrl, getToken } from './api'

const MAX_WIDTH = 800
const MAX_SIZE_BYTES = 300 * 1024
const REJECT_SIZE_BYTES = 500 * 1024
const MAX_IMAGES_PER_LISTING = 2
const ALLOWED_EXTENSIONS = ['jpg', 'jpeg', 'webp']
const ALLOWED_MIME_TYPES = ['image/jpeg', 'image/webp']
const WEBP_QUALITY = 0.75

export { MAX_IMAGES_PER_LISTING }

export function validateImageFile(file) {
    if (!file || !(file instanceof File)) return 'Invalid file.'
    if (!ALLOWED_MIME_TYPES.includes(file.type) && file.type !== 'image/jpg') {
        return `Invalid file type "${file.type}". Only JPG, JPEG, and WebP are allowed.`
    }
    const ext = file.name.split('.').pop()?.toLowerCase()
    if (!ext || !ALLOWED_EXTENSIONS.includes(ext)) {
        return `Invalid file extension ".${ext}". Allowed: .jpg, .jpeg, .webp`
    }
    if (file.size > 10 * 1024 * 1024) return 'File is too large. Please choose an image under 10MB.'
    return null
}

export function compressImage(file) {
    return new Promise((resolve, reject) => {
        const img = new Image()
        const objectUrl = URL.createObjectURL(file)
        img.onload = () => {
            let { width, height } = img
            if (width > MAX_WIDTH) {
                height = Math.round(height * MAX_WIDTH / width)
                width = MAX_WIDTH
            }
            if (height > MAX_WIDTH) {
                width = Math.round(width * MAX_WIDTH / height)
                height = MAX_WIDTH
            }
            const canvas = document.createElement('canvas')
            canvas.width = width
            canvas.height = height
            const ctx = canvas.getContext('2d')
            ctx.drawImage(img, 0, 0, width, height)
            URL.revokeObjectURL(objectUrl)
            canvas.toBlob(
                (blob) => {
                    if (!blob) { reject(new Error('Failed to compress image')); return }
                    if (blob.size > MAX_SIZE_BYTES) {
                        canvas.toBlob(
                            (smallerBlob) => {
                                if (!smallerBlob) { reject(new Error('Failed to compress image')); return }
                                if (smallerBlob.size > REJECT_SIZE_BYTES) {
                                    reject(new Error(`Image too large after compression (${Math.round(smallerBlob.size / 1024)}KB). Please use a smaller image.`))
                                    return
                                }
                                resolve(smallerBlob)
                            },
                            'image/webp', 0.5
                        )
                        return
                    }
                    resolve(blob)
                },
                'image/webp', WEBP_QUALITY
            )
        }
        img.onerror = () => {
            URL.revokeObjectURL(objectUrl)
            reject(new Error('Failed to load image'))
        }
        img.src = objectUrl
    })
}

/**
 * Upload image to backend. Compresses to WebP, then POST to /api/upload.
 * Returns the public URL of the uploaded image.
 */
export async function uploadImageToStorage(file, userId, onProgress = null) {
    const validationError = validateImageFile(file)
    if (validationError) throw new Error(validationError)
    if (!userId) throw new Error('User ID is required for upload.')

    if (onProgress) onProgress('compressing')
    const compressedBlob = await compressImage(file)
    if (compressedBlob.size > REJECT_SIZE_BYTES) {
        throw new Error(`Image too large (${Math.round(compressedBlob.size / 1024)}KB). Max: ${REJECT_SIZE_BYTES / 1024}KB after compression.`)
    }

    const token = getToken()
    if (!token) throw new Error('You must be logged in to upload images.')

    const formData = new FormData()
    formData.append('image', compressedBlob, `upload.webp`)

    if (onProgress) onProgress('uploading')
    const res = await fetch(getUploadUrl(), {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
    })
    const data = await res.json().catch(() => ({}))
    if (!res.ok) throw new Error(data.error || 'Upload failed')

    if (onProgress) onProgress('done')
    return data.url
}

/**
 * Delete images by URL. Backend can expose DELETE /api/upload?url=... or we no-op for now
 * (backend may not have delete-by-url; optional cleanup can be added later).
 */
export async function deleteImagesFromStorage(imageUrls) {
    if (!imageUrls?.length) return
    // Optional: call backend DELETE if you add an endpoint. For now we no-op.
    // Server could store path per URL and delete file.
}
