import { forwardRef } from 'react'

const Input = forwardRef(({ label, error, className = '', prefix, ...props }, ref) => (
    <div className="flex flex-col gap-1">
        {label && <label className="text-sm font-medium text-gray-700">{label}</label>}
        <div className="relative">
            {prefix && <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">{prefix}</span>}
            <input
                ref={ref}
                className={`w-full h-10 border rounded-md px-3 text-sm bg-white text-gray-900 placeholder-gray-400
          focus:outline-none focus:ring-2 focus:ring-brand-red focus:border-transparent
          ${error ? 'border-red-500' : 'border-gray-200'}
          ${prefix ? 'pl-8' : ''}
          ${className}`}
                {...props}
            />
        </div>
        {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
))
Input.displayName = 'Input'
export default Input

export const Textarea = forwardRef(({ label, error, className = '', ...props }, ref) => (
    <div className="flex flex-col gap-1">
        {label && <label className="text-sm font-medium text-gray-700">{label}</label>}
        <textarea
            ref={ref}
            className={`w-full border rounded-md px-3 py-2 text-sm bg-white text-gray-900 placeholder-gray-400
          focus:outline-none focus:ring-2 focus:ring-brand-red focus:border-transparent resize-none
          ${error ? 'border-red-500' : 'border-gray-200'} ${className}`}
            {...props}
        />
        {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
))
Textarea.displayName = 'Textarea'

export const Select = forwardRef(({ label, error, children, className = '', ...props }, ref) => (
    <div className="flex flex-col gap-1">
        {label && <label className="text-sm font-medium text-gray-700">{label}</label>}
        <select
            ref={ref}
            className={`w-full h-10 border rounded-md px-3 text-sm bg-white text-gray-900
          focus:outline-none focus:ring-2 focus:ring-brand-red focus:border-transparent
          ${error ? 'border-red-500' : 'border-gray-200'} ${className}`}
            {...props}
        >
            {children}
        </select>
        {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
))
Select.displayName = 'Select'
