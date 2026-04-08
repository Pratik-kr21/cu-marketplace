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

import imageCompression from 'browser-image-compression'

export async function compressImage(file) {
    const options = {
        maxSizeMB: 0.4, // Max size around 400KB to stay safely under 500KB reject size
        maxWidthOrHeight: MAX_WIDTH,
        useWebWorker: true,
        fileType: 'image/webp',
        initialQuality: WEBP_QUALITY,
    }

    try {
        const compressedBlob = await imageCompression(file, options)
        if (compressedBlob.size > REJECT_SIZE_BYTES) {
            throw new Error(`Image too large after compression (${Math.round(compressedBlob.size / 1024)}KB). Please use a smaller image.`)
        }
        return compressedBlob
    } catch (error) {
        throw new Error(error.message || 'Failed to compress image')
    }
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
