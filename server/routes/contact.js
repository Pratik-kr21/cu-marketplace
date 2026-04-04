import express from 'express'
import nodemailer from 'nodemailer'
import { authMiddleware } from '../middleware/auth.js'

const router = express.Router()

router.post('/', authMiddleware, async (req, res) => {
    try {
        const { name, message } = req.body
        
        if (!message) {
            return res.status(400).json({ message: 'Message is required.' })
        }
        
        // Ensure credentials are provided
        if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
            console.error('SMTP Credentials missing.')
            return res.status(500).json({ message: 'SMTP credentials missing on server.' })
        }

        // Setting up standard SMTP to send directly from cumarketplace.use@gmail.com
        const transporter = nodemailer.createTransport({
            host: 'smtp.gmail.com',
            port: 465,
            secure: true,
            auth: {
                user: process.env.EMAIL_USER, // This MUST be cumarketplace.use@gmail.com
                pass: process.env.EMAIL_PASS  // This MUST be the 16-character App Password
            }
        })

        const html = `
            <h2>New Message from Developer Contact Form</h2>
            <div style="background:#f0f9ff; padding:15px; border-radius:8px; margin-bottom:20px; border-left: 4px solid #3b82f6;">
                <p style="margin:0 0 8px 0"><strong>Student Name:</strong> ${req.user.full_name}</p>
                <p style="margin:0 0 8px 0"><strong>Student UID:</strong> ${req.user.uid}</p>
                <p style="margin:0 0 8px 0"><strong>Student Email:</strong> ${req.user.email}</p>
                <p style="margin:0"><strong>Provided Name:</strong> ${name || req.user.full_name}</p>
            </div>
            <p><strong>Message:</strong></p>
            <p style="white-space: pre-wrap; background: #fdfdfd; padding: 15px; border-left: 4px solid #ef4444; color: #333;">${message}</p>
            <br />
            <hr />
            <p><small>Sent via CU Marketplace SMTP</small></p>
        `
        
        // Mail comes TO your Outlook, FROM the site's Gmail
        await transporter.sendMail({
            from: `"CU Marketplace" <${process.env.EMAIL_USER}>`,
            to: 'kumarpratik21@outlook.com',
            subject: `Website Alert: Message from ${req.user.full_name} (${req.user.uid})`,
            html: html
        })
        
        res.status(200).json({ message: 'Message sent successfully!' })
    } catch (err) {
        console.error('SMTP Contact Form Error:', err)
        res.status(500).json({ message: 'Failed to send message via SMTP.' })
    }
})

export default router
