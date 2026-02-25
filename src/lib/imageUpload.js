import { supabase } from './supabase'

// ─── Constants ──────────────────────────────────────────────────────────────
const MAX_WIDTH = 800
const MAX_SIZE_BYTES = 300 * 1024       // 300KB target after compression
const REJECT_SIZE_BYTES = 500 * 1024    // 500KB hard reject limit
const MAX_IMAGES_PER_LISTING = 2
const ALLOWED_EXTENSIONS = ['jpg', 'jpeg', 'webp']
const ALLOWED_MIME_TYPES = ['image/jpeg', 'image/webp']
const WEBP_QUALITY = 0.75
const BUCKET_NAME = 'listing-images'

export { MAX_IMAGES_PER_LISTING }

// ─── Validation ─────────────────────────────────────────────────────────────

/**
 * Validate a file before upload. Returns an error string or null if valid.
 */
export function validateImageFile(file) {
    if (!file || !(file instanceof File)) {
        return 'Invalid file.'
    }

    // Check MIME type
    if (!ALLOWED_MIME_TYPES.includes(file.type) && file.type !== 'image/jpg') {
        return `Invalid file type "${file.type}". Only JPG, JPEG, and WebP are allowed.`
    }

    // Check extension
    const ext = file.name.split('.').pop()?.toLowerCase()
    if (!ext || !ALLOWED_EXTENSIONS.includes(ext)) {
        return `Invalid file extension ".${ext}". Allowed: .jpg, .jpeg, .webp`
    }

    // Check initial size (before compression) — generous limit since we'll compress
    if (file.size > 10 * 1024 * 1024) { // 10MB raw limit
        return 'File is too large. Please choose an image under 10MB.'
    }

    return null
}

// ─── Client-Side Image Compression ──────────────────────────────────────────

/**
 * Compress and convert an image file to WebP, resize to max 800px width.
 * Returns a Blob (WebP) that is under 300KB.
 */
export function compressImage(file) {
    return new Promise((resolve, reject) => {
        const img = new Image()
        const objectUrl = URL.createObjectURL(file)

        img.onload = () => {
            let { width, height } = img

            // Resize if larger than MAX_WIDTH
            if (width > MAX_WIDTH) {
                height = Math.round(height * MAX_WIDTH / width)
                width = MAX_WIDTH
            }
            // Also cap height
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

            // Convert to WebP blob
            canvas.toBlob(
                (blob) => {
                    if (!blob) {
                        reject(new Error('Failed to compress image'))
                        return
                    }

                    // If still too large, try lower quality
                    if (blob.size > MAX_SIZE_BYTES) {
                        canvas.toBlob(
                            (smallerBlob) => {
                                if (!smallerBlob) {
                                    reject(new Error('Failed to compress image'))
                                    return
                                }
                                if (smallerBlob.size > REJECT_SIZE_BYTES) {
                                    reject(new Error(`Image too large after compression (${Math.round(smallerBlob.size / 1024)}KB). Please use a smaller image.`))
                                    return
                                }
                                resolve(smallerBlob)
                            },
                            'image/webp',
                            0.5 // lower quality fallback
                        )
                        return
                    }
                    resolve(blob)
                },
                'image/webp',
                WEBP_QUALITY
            )
        }

        img.onerror = () => {
            URL.revokeObjectURL(objectUrl)
            reject(new Error('Failed to load image'))
        }

        img.src = objectUrl
    })
}

// ─── Supabase Storage Upload ────────────────────────────────────────────────

/**
 * Upload an image to Supabase Storage bucket.
 * - Validates the file
 * - Compresses to WebP (max 800px, target <300KB)
 * - Uploads to listing-images/{userId}/{timestamp}-{random}.webp
 * - Returns the public URL
 *
 * @param {File} file - The image file to upload
 * @param {string|null} userId - The authenticated user's ID (required)
 * @param {function|null} onProgress - Status callback: 'compressing' | 'uploading' | 'done'
 * @returns {Promise<string>} The public URL of the uploaded image
 */
export async function uploadImageToStorage(file, userId, onProgress = null) {
    // 1. Validate
    const validationError = validateImageFile(file)
    if (validationError) throw new Error(validationError)

    if (!userId) throw new Error('User ID is required for upload.')

    // 2. Compress to WebP
    if (onProgress) onProgress('compressing')
    const compressedBlob = await compressImage(file)

    // 3. Final size check
    if (compressedBlob.size > REJECT_SIZE_BYTES) {
        throw new Error(`Image too large (${Math.round(compressedBlob.size / 1024)}KB). Max: ${REJECT_SIZE_BYTES / 1024}KB after compression.`)
    }

    // 4. Generate unique file path: {userId}/{timestamp}-{random}.webp
    const timestamp = Date.now()
    const random = Math.random().toString(36).substring(2, 8)
    const filePath = `${userId}/${timestamp}-${random}.webp`

    // 5. Upload to Supabase Storage
    if (onProgress) onProgress('uploading')
    const { data, error } = await supabase.storage
        .from(BUCKET_NAME)
        .upload(filePath, compressedBlob, {
            contentType: 'image/webp',
            cacheControl: '31536000', // 1 year (immutable since unique filename)
            upsert: false,
        })

    if (error) {
        throw new Error(`Upload failed: ${error.message}`)
    }

    // 6. Get the public URL
    const { data: urlData } = supabase.storage
        .from(BUCKET_NAME)
        .getPublicUrl(data.path)

    if (onProgress) onProgress('done')
    return urlData.publicUrl
}

// ─── Delete Images from Supabase Storage ────────────────────────────────────

/**
 * Extract the storage file path from a Supabase Storage public URL.
 * Public URLs look like: https://{project}.supabase.co/storage/v1/object/public/listing-images/{userId}/{file}
 */
function extractStoragePath(publicUrl) {
    if (!publicUrl || typeof publicUrl !== 'string') return null
    // Skip base64 data URIs
    if (publicUrl.startsWith('data:')) return null

    const marker = `/storage/v1/object/public/${BUCKET_NAME}/`
    const idx = publicUrl.indexOf(marker)
    if (idx === -1) return null

    return publicUrl.substring(idx + marker.length)
}

/**
 * Delete images from Supabase Storage.
 * Extracts file paths from public URLs and removes them from the bucket.
 *
 * @param {string[]} imageUrls - Array of public image URLs to delete
 * @returns {Promise<void>}
 */
export async function deleteImagesFromStorage(imageUrls) {
    if (!imageUrls || imageUrls.length === 0) return

    // Extract storage paths from public URLs
    const filePaths = imageUrls
        .map(extractStoragePath)
        .filter(Boolean)

    if (filePaths.length === 0) return

    const { error } = await supabase.storage
        .from(BUCKET_NAME)
        .remove(filePaths)

    if (error) {
        console.warn('Failed to delete images from storage:', error.message)
    }
}
