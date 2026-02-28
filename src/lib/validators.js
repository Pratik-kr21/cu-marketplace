import { z } from 'zod'

// CU email is always UID@cuchd.in (e.g. 23BCE10055@cuchd.in)
// UID pattern: year + branch + roll (e.g. 23BCE10055, 24CSE12345, 22UIE10001)
const UID_REGEX = /^[0-9]{2}[A-Za-z]{2,6}[0-9]{4,6}$/

export const signupSchema = z.object({
    full_name: z.string().min(2, 'Name must be at least 2 characters'),
    uid: z.string()
        .min(8, 'Enter your CU Student UID')
        .regex(UID_REGEX, 'Invalid UID format — e.g. 23BCE10055 or 24CSE12345'),
    // email is auto-derived from UID, but kept as a hidden field for submission
    email: z.string()
        .email('Invalid email')
        .endsWith('@cuchd.in', { message: 'Must be a @cuchd.in email' }),
    password: z.string().min(8, 'Password must be at least 8 characters'),
    department: z.string().min(1, 'Select your department'),
    hostel: z.string().optional(),
}).superRefine((data, ctx) => {
    // Validate that email prefix matches UID (case-insensitive)
    const emailPrefix = data.email.split('@')[0].toLowerCase()
    if (emailPrefix !== data.uid.toLowerCase()) {
        ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: `Email must match your UID — expected ${data.uid.toLowerCase()}@cuchd.in`,
            path: ['email'],
        })
    }
})

export const loginSchema = z.object({
    email: z.string().email('Enter a valid email'),
    password: z.string().min(1, 'Enter your password'),
})

export const listingSchema = z.object({
    title: z.string().min(5, 'Title must be at least 5 characters'),
    description: z.string().min(20, 'Description must be at least 20 characters'),
    price: z.number().min(0, 'Price cannot be negative').optional(),
    category: z.string().min(1, 'Select a category'),
    condition: z.string().min(1, 'Select condition'),
    listing_type: z.enum(['sell', 'barter', 'both']),
    hostel_area: z.string().optional(),
})

export const CU_DEPARTMENTS = [
    'University Institute of Engineering (UIE)',
    'University Institute of Computing (UIC)',
    'University School of Business (USB)',
    'University Institute of Legal Studies (UILS)',
    'Apex Institute of Technology (AIT)',
    'University Institute of Tourism & Hospitality (UITHM)',
    'University Institute of Pharma Sciences',
    'University Institute of Biotechnology',
    'University Institute of Architecture',
    'Department of Education',
    'Other',
]

// Boys Hostels
export const BOYS_HOSTELS = [
    'Zakir A',
    'Zakir B',
    'Zakir C',
    'Zakir D',
    'NC 1',
    'NC 2',
    'NC 3',
    'NC 4',
    'NC 5',
    'NC 6',
]

// Girls Hostels
export const GIRLS_HOSTELS = [
    'Sukhna',
    'Tagore',
    'LC',
    'Shivalik',
    'Govind',
]

// Combined for dropdowns that don't need gender grouping
export const CU_HOSTELS = [
    ...BOYS_HOSTELS,
    ...GIRLS_HOSTELS,
    'Day Scholar',
]

export const CATEGORIES = [
    'Textbooks',
    'Electronics',
    'Lab Equipment',
    'Fashion & Clothing',
    'Hostel Essentials',
    'Sports & Fitness',
    'Stationery',
    'Miscellaneous',
]

export const CONDITIONS = [
    { value: 'new', label: 'New' },
    { value: 'like_new', label: 'Like New' },
    { value: 'good', label: 'Good' },
    { value: 'fair', label: 'Fair' },
]
