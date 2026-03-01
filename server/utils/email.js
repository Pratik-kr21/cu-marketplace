import nodemailer from 'nodemailer'

/**
 * Creates a configured Nodemailer transporter instance using Gmail.
 * It strictly uses the EMAIL_USER and EMAIL_PASS environment variables.
 */
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
    },
})

/**
 * Utility function to send an email using Gmail Nodemailer.
 * 
 * @param {Object} options - Email options
 * @param {string} options.to - Recipient email address
 * @param {string} options.subject - Email subject line
 * @param {string} [options.text] - Plain text fallback for the email
 */
export const sendEmail = async ({ to, subject, html, text }) => {
    // Development mockup if env vars are intentionally left blank locally
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
        console.log('\n=============================================')
        console.log('⚠️  MOCK EMAIL (GMAIL CONFIG MISSING) ⚠️')
        console.log(`To: ${to}`)
        console.log(`Subject: ${subject}`)
        console.log('Provide EMAIL_USER and EMAIL_PASS in .env to send real emails.')
        console.log('=============================================\n')
        return null
    }

    try {
        const info = await transporter.sendMail({
            from: `"CU Marketplace" <${process.env.EMAIL_USER}>`,
            replyTo: process.env.EMAIL_USER,
            to,
            subject,
            html,
            text: text || html.replace(/<[^>]+>/g, '\n').replace(/\n+/g, '\n').trim(), // Auto-generate text fallback if not provided
        })
        console.log(`✅ [Email] Successfully sent to ${to}. Message ID: ${info.messageId}`)

        // Log the link for developer testing so you don't need real access to the @cuchd.in inbox
        console.log('\n=============================================')
        console.log('⚠️  DEVELOPER TESTING LINK ⚠️')
        console.log(`To: ${to}`)
        console.log(`Email Sent From: ${process.env.EMAIL_USER}`)
        // Extracts the verify-email link from the raw HTML payload for local testing
        const linkMatch = html.match(/href="([^"]+verify-email\?token=[^"]+)"/)
        if (linkMatch) {
            console.log(`Link: ${linkMatch[1]}`)
        }
        console.log('=============================================\n')

        return info
    } catch (error) {
        // Do not crash the server on failure, just log it properly
        console.error('❌ [Email] Failed to send email via Gmail:', error.message)
        throw new Error('Failed to send verification email. Please try again later.')
    }
}
