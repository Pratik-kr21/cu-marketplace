import { Github, Linkedin, Mail, Send, Loader2, ArrowLeft } from 'lucide-react'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Button from '../components/ui/Button'
import Input, { Textarea } from '../components/ui/Input'
import { api } from '../lib/api'
import { useAuthStore } from '../store/authStore'

export default function DeveloperContact() {
    const navigate = useNavigate()
    const { user } = useAuthStore()
    const [form, setForm] = useState({ message: '' })
    const [loading, setLoading] = useState(false)
    const [status, setStatus] = useState(null) // 'success' | 'error' | null
    const [errorMsg, setErrorMsg] = useState('')

    const handleSubmit = async (e) => {
        e.preventDefault()
        setLoading(true)
        setStatus(null)
        try {
            await api.post('/api/contact', form)
            setStatus('success')
            setForm({ message: '' })
        } catch (err) {
            setStatus('error')
            setErrorMsg(err.message || 'Failed to send message.')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-12 animate-fade-in">
            <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-900 mb-8 transition-colors">
                <ArrowLeft className="w-4 h-4" /> Back
            </button>

            <div className="text-center mb-12">
                <h1 className="text-3xl font-extrabold text-gray-900 mb-4">Get in Touch with the Developer</h1>
                <p className="text-gray-500 max-w-2xl mx-auto">
                    Have feedback, found a bug, or just want to say hi? Feel free to reach out using the form below or connect through social channels.
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-12 bg-white rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100 overflow-hidden">
                {/* Left Side: Static Info */}
                <div className="bg-gray-900 text-white p-10 flex flex-col justify-between">
                    <div>
                        <h2 className="text-2xl font-bold mb-6">Contact Information</h2>
                        <p className="text-gray-400 mb-8 leading-relaxed">
                            I'm Pratik, the developer behind CU Marketplace. I'm actively improving the platform and would love to hear your thoughts!
                        </p>
                        
                        <div className="space-y-6">
                            <a href="mailto:kumarpratik21@outlook.com" className="flex items-center gap-4 text-gray-300 hover:text-white transition-colors group">
                                <div className="w-12 h-12 flex-shrink-0 bg-gray-800 rounded-xl flex items-center justify-center group-hover:bg-brand-red transition-colors">
                                    <Mail className="w-5 h-5" />
                                </div>
                                <div className="min-w-0 flex-1">
                                    <p className="text-sm text-gray-500 font-medium">Email Me</p>
                                    <p className="font-semibold break-all">kumarpratik21@outlook.com</p>
                                </div>
                            </a>
                            <a href="https://linkedin.com/in/pratikkumar21" target="_blank" rel="noreferrer" className="flex items-center gap-4 text-gray-300 hover:text-white transition-colors group">
                                <div className="w-12 h-12 flex-shrink-0 bg-gray-800 rounded-xl flex items-center justify-center group-hover:bg-blue-600 transition-colors">
                                    <Linkedin className="w-5 h-5" />
                                </div>
                                <div className="min-w-0 flex-1">
                                    <p className="text-sm text-gray-500 font-medium">Connect on LinkedIn</p>
                                    <p className="font-semibold truncate">Let's connect</p>
                                </div>
                            </a>
                            <a href="https://github.com/Pratik-kr21" target="_blank" rel="noreferrer" className="flex items-center gap-4 text-gray-300 hover:text-white transition-colors group">
                                <div className="w-12 h-12 flex-shrink-0 bg-gray-800 rounded-xl flex items-center justify-center group-hover:bg-gray-700 transition-colors">
                                    <Github className="w-5 h-5" />
                                </div>
                                <div className="min-w-0 flex-1">
                                    <p className="text-sm text-gray-500 font-medium">Check my GitHub</p>
                                    <p className="font-semibold truncate">@Pratik-kr21</p>
                                </div>
                            </a>
                        </div>
                    </div>
                </div>

                {/* Right Side: Contact Form */}
                <div className="p-10">
                    <h3 className="text-xl font-bold text-gray-900 mb-6">Send a Message</h3>
                    
                    {status === 'success' ? (
                        <div className="bg-green-50 border border-green-200 rounded-xl p-6 text-center animate-fade-in">
                            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                <Send className="w-8 h-8 text-green-600" />
                            </div>
                            <h4 className="text-lg font-bold text-gray-900 mb-2">Message Sent!</h4>
                            <p className="text-gray-600 text-sm">Thanks for reaching out! I'll read your message as soon as possible.</p>
                            <Button className="mt-6" onClick={() => setStatus(null)} variant="outline">Send another</Button>
                        </div>
                    ) : (
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <Textarea 
                                label="Message" 
                                placeholder="What's on your mind?" 
                                rows={5} 
                                value={form.message} 
                                onChange={e => setForm({...form, message: e.target.value})} 
                                required 
                            />
                            
                            {status === 'error' && (
                                <p className="text-sm text-red-600 bg-red-50 p-3 rounded-lg">⚠️ {errorMsg}</p>
                            )}

                            <Button type="submit" className="w-full" size="lg" disabled={loading}>
                                {loading ? <Loader2 className="w-5 h-5 animate-spin mr-2" /> : <Send className="w-5 h-5 mr-2" />}
                                {loading ? 'Sending...' : 'Send Message'}
                            </Button>
                        </form>
                    )}
                </div>
            </div>
        </div>
    )
}
