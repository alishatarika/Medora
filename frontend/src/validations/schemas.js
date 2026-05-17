import { z } from 'zod'

// ── Reusable field rules ──────────────────────────────────────────────────────
// Accepts plain 10-digit OR dial-code format like "+91 9876543210"
const phone10 = z.string().regex(
  /^(\+\d{1,4}\s)?\d{7,15}$/,
  'Enter a valid phone number'
)

const strongPassword = z
  .string()
  .min(8, 'Password must be at least 8 characters')
  .regex(/[A-Z]/, 'Must contain at least one uppercase letter')
  .regex(/[0-9]/, 'Must contain at least one number')
  .regex(/[^A-Za-z0-9]/, 'Must contain at least one special character')

// ── Auth ──────────────────────────────────────────────────────────────────────
export const loginSchema = z.object({
  identifier: z.string().min(2, 'Enter your name or email'),
  password:   z.string().min(1, 'Password is required'),
})

export const registerSchema = z.object({
  name:     z.string().min(2, 'Name must be at least 2 characters').max(100),
  email:    z.string().email('Enter a valid email address'),
  phone:    z.union([phone10, z.literal('')]).optional(),
  password: strongPassword,
  confirm:  z.string().min(1, 'Please confirm your password'),
}).refine(d => d.password === d.confirm, {
  message: 'Passwords do not match',
  path: ['confirm'],
})

export const otpSchema = z.object({
  otp: z.string().length(6, 'OTP must be exactly 6 digits').regex(/^\d{6}$/, 'OTP must be numeric'),
})

export const changePasswordSchema = z.object({
  otp:         z.string().length(6, 'OTP must be exactly 6 digits').regex(/^\d{6}$/, 'OTP must be numeric'),
  newPassword: strongPassword,
  confirm:     z.string().min(1, 'Please confirm your password'),
}).refine(d => d.newPassword === d.confirm, {
  message: 'Passwords do not match',
  path: ['confirm'],
})

export const forgotPasswordSchema = z.object({
  email: z.string().email('Enter a valid email address'),
})

export const changeEmailSchema = z.object({
  new_email: z.string().email('Enter a valid email address'),
})

export const changeEmailOtpSchema = z.object({
  otp: z.string().length(6, 'OTP must be exactly 6 digits').regex(/^\d{6}$/, 'OTP must be numeric'),
})

export const forgotPasswordResetSchema = z.object({
  otp:         z.string().length(6, 'OTP must be exactly 6 digits').regex(/^\d{6}$/, 'OTP must be numeric'),
  newPassword: strongPassword,
  confirm:     z.string().min(1, 'Please confirm your password'),
}).refine(d => d.newPassword === d.confirm, {
  message: 'Passwords do not match',
  path: ['confirm'],
})

export const profileSchema = z.object({
  name:    z.string().min(2, 'Name must be at least 2 characters').max(100),
  phone:   z.union([phone10, z.literal('')]).optional(),
  address: z.string().min(5, 'Address must be at least 5 characters').or(z.literal('')).optional(),
})

// ── Checkout ──────────────────────────────────────────────────────────────────
export const checkoutSchema = z.object({
  customer_name: z.string().min(2, 'Full name is required'),
  address:       z.string().min(5, 'Please enter a valid address'),
  phone:         phone10,
  email:         z.string().email('Enter a valid email address'),
})

// ── Appointment ───────────────────────────────────────────────────────────────
export const appointmentSchema = z.object({
  user_name:  z.string().min(2, 'Name must be at least 2 characters'),
  user_email: z.string().email('Enter a valid email address'),
  user_phone: phone10,
  date:       z.string().min(1, 'Please select a date'),
  time_slot:  z.string().min(1, 'Please select a time slot'),
})

// ── Admin — Doctor ────────────────────────────────────────────────────────────
export const doctorSchema = z.object({
  name:        z.string().min(2, 'Doctor name is required'),
  specialty:   z.string().min(2, 'Specialty is required'),
  location:    z.string().min(2, 'Location is required'),
  experience:  z.coerce.number().min(0, 'Experience must be 0 or more').max(60, 'Too high'),
  fees:        z.coerce.number().min(0, 'Fees must be 0 or more'),
  description: z.string().optional(),
})

// ── Admin — Medicine ──────────────────────────────────────────────────────────
export const medicineSchema = z.object({
  name:        z.string().min(2, 'Medicine name is required'),
  category:    z.string().min(1, 'Category is required'),
  company:     z.string().min(1, 'Company is required'),
  price:       z.coerce.number().min(0, 'Price must be 0 or more'),
  description: z.string().optional(),
})
