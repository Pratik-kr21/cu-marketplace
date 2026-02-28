import { v2 as cloudinary } from 'cloudinary'

// Configure Cloudinary using environment variables
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
})

/**
 * Extracts the public_id from a secure_url and destroys the asset on Cloudinary.
 * @param {string} imageUrl The full secure_url
 */
export const deleteImageFromCloudinary = async (imageUrl) => {
    try {
        if (!imageUrl || !imageUrl.includes('res.cloudinary.com')) return

        // Extract folder and file from "https://res.cloudinary.com/demo/image/upload/v1234/marketplace-listings/xyz.webp"
        const parts = imageUrl.split('/')
        const fileName = parts[parts.length - 1]

        // Remove the extension (e.g. .jpg, .webp) to isolate the public_id
        const publicId = `marketplace-listings/${fileName.split('.')[0]}`

        await cloudinary.uploader.destroy(publicId)
        console.log(`[Cloudinary] Successfully deleted orphaned asset: ${publicId}`)
    } catch (error) {
        console.error('[Cloudinary] Failed to delete image asset:', error.message)
    }
}

export default cloudinary
