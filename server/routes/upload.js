import { Router } from 'express'
import multer from 'multer'
import { CloudinaryStorage } from 'multer-storage-cloudinary'
import cloudinary from '../utils/cloudinary.js'
import { authMiddleware } from '../middleware/auth.js'

const router = Router()

/**
 * Configure multer-storage-cloudinary middleware.
 * Optimized for Free Tier: forces webp conversion, squashes sizes, caps bounds.
 */
const storage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
        folder: 'marketplace-listings',
        format: async (req, file) => 'webp', // Force webp for massive bandwidth savings
        transformation: [
            { width: 800, crop: 'limit' },    // Resize max bounding box
            { fetch_format: 'auto', quality: 'auto' }
        ],
    },
})

const upload = multer({
    storage,
    limits: { fileSize: 500 * 1024 }, // Exact 500KB cap
    fileFilter: (req, file, cb) => {
        const allowed = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
        if (allowed.includes(file.mimetype)) {
            cb(null, true)
        } else {
            cb(new Error('Only JPG, PNG and WebP images are allowed'))
        }
    }
})

// Single image upload
router.post('/', authMiddleware, upload.single('image'), (req, res) => {
    try {
        if (!req.file) return res.status(400).json({ error: 'No file uploaded or size too large.' })
        // Cloudinary returns the secure URL
        return res.json({ url: req.file.path })
    } catch (err) {
        console.error('[Upload] Error processing image:', err)
        return res.status(500).json({ error: 'Failed to upload image.' })
    }
})

// Explicit single image deletion endpoint (called selectively from frontend on cancel)
router.delete('/', authMiddleware, async (req, res) => {
    try {
        const { url } = req.body
        if (!url) return res.status(400).json({ error: 'No url provided' })

        // Extract public ID
        const parts = url.split('/')
        if (parts.length > 0) {
            const fileName = parts[parts.length - 1]
            const publicId = `marketplace-listings/${fileName.split('.')[0]}`
            await cloudinary.uploader.destroy(publicId)
        }
        res.json({ success: true })
    } catch (error) {
        console.error('[Upload] Delete Image Error:', error)
        res.status(500).json({ error: 'Failed to delete image.' })
    }
})

export default router
