/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                brand: {
                    red: '#E02020',
                    dark: '#C01010',
                    light: '#FDEAEA',
                    subtle: '#FFF5F5',
                },
            },
            fontFamily: {
                sans: ['Inter', 'Segoe UI', 'system-ui', 'sans-serif'],
            },
            boxShadow: {
                card: '0 1px 3px rgba(0,0,0,0.08), 0 1px 2px rgba(0,0,0,0.04)',
                'card-hover': '0 4px 12px rgba(0,0,0,0.12), 0 2px 4px rgba(0,0,0,0.06)',
                dropdown: '0 8px 24px rgba(0,0,0,0.12)',
                modal: '0 20px 60px rgba(0,0,0,0.20)',
            },
            keyframes: {
                fadeIn: { '0%': { opacity: 0, transform: 'translateY(8px)' }, '100%': { opacity: 1, transform: 'translateY(0)' } },
                slideUp: { '0%': { opacity: 0, transform: 'translateY(20px)' }, '100%': { opacity: 1, transform: 'translateY(0)' } },
                scaleIn: { '0%': { opacity: 0, transform: 'scale(0.95)' }, '100%': { opacity: 1, transform: 'scale(1)' } },
            },
            animation: {
                'fade-in': 'fadeIn 0.3s ease-out',
                'slide-up': 'slideUp 0.4s ease-out',
                'scale-in': 'scaleIn 0.2s ease-out',
            },
        },
    },
    plugins: [],
}
