/**
 * API client for Node.js backend (replaces Supabase).
 * Set VITE_API_URL in .env (e.g. http://localhost:4000) to enable backend.
 */

const BASE = import.meta.env.VITE_API_URL || ''

export const isBackendConfigured = Boolean(BASE && BASE.startsWith('http'))

export function getToken() {
    return localStorage.getItem('token') || ''
}

export async function apiFetch(path, options = {}) {
    const url = `${BASE.replace(/\/$/, '')}${path.startsWith('/') ? path : `/${path}`}`
    const headers = {
        'Content-Type': 'application/json',
        ...options.headers,
    }
    const token = getToken()
    if (token) headers.Authorization = `Bearer ${token}`

    const res = await fetch(url, { ...options, headers, credentials: 'include' })
    const data = res.status === 204 ? {} : await res.json().catch(() => ({}))

    if (!res.ok) {
        // If the backend returns a 401 Vercel Protection HTML page instead of JSON, parse it safely
        const errorMessage = data.error || res.statusText || (res.status === 401 ? 'Vercel Authentication Blocked API (Preview Deployment)' : 'Request failed')
        throw new Error(errorMessage)
    }
    return data
}

export const api = {
    get: (path) => apiFetch(path, { method: 'GET' }),
    post: (path, body) => apiFetch(path, { method: 'POST', body: body ? JSON.stringify(body) : undefined }),
    patch: (path, body) => apiFetch(path, { method: 'PATCH', body: body ? JSON.stringify(body) : undefined }),
    delete: (path, body) => apiFetch(path, { method: 'DELETE', body: body ? JSON.stringify(body) : undefined }),
}

export function setToken(token) {
    if (token) localStorage.setItem('token', token)
    else localStorage.removeItem('token')
}

export function getUploadUrl() {
    return `${BASE.replace(/\/$/, '')}/api/upload`
}
