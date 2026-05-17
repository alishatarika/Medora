import api from './api'

// Registration
export const registerSendOtp  = (data)       => api.post('/auth/register/send-otp', data)
export const registerVerifyOtp = (email, otp) => api.post('/auth/register/verify-otp', { email, otp })
export const registerResendOtp = (email)      => api.post('/auth/register/resend-otp', { email })

// Login — cart is kept across sessions intentionally
export const login = async (data) => {
  const res = await api.post('/auth/login', data)
  localStorage.setItem('token', res.data.access_token)
  localStorage.setItem('user', JSON.stringify(res.data.user))
  window.dispatchEvent(new Event('cart-updated'))  // refresh navbar badge immediately
  return res.data
}

export const logout = () => {
  localStorage.removeItem('token')
  localStorage.removeItem('user')
  // cart kept intentionally — user can continue shopping after re-login
  window.dispatchEvent(new Event('cart-updated'))
}

export const getMe             = () => api.get('/auth/me')
export const getMyOrders       = () => api.get('/orders/my')
export const getMyAppointments = () => api.get('/doctors/appointments/my')

// Change password
export const changePasswordSendOtp   = ()                  => api.post('/auth/change-password/send-otp')
export const changePasswordResendOtp = ()                  => api.post('/auth/change-password/resend-otp')
export const changePasswordVerifyOtp = (otp, new_password) => api.post('/auth/change-password/verify-otp', { otp, new_password })

// Forgot password
export const forgotPasswordSendOtp   = (email)                    => api.post('/auth/forgot-password/send-otp', { email })
export const forgotPasswordResendOtp = (email)                    => api.post('/auth/forgot-password/resend-otp', { email })
export const forgotPasswordReset     = (email, otp, new_password) => api.post('/auth/forgot-password/reset', { email, otp, new_password })

// Change email
export const changeEmailSendOtp   = (new_email)       => api.post('/auth/change-email/send-otp', { new_email })
export const changeEmailVerifyOtp = (new_email, otp)  => api.post('/auth/change-email/verify-otp', { new_email, otp })

// Update profile
export const profileSendOtp   = ()                          => api.post('/auth/profile/send-otp')
export const profileResendOtp = ()                          => api.post('/auth/profile/resend-otp')
export const profileVerifyOtp = (otp, name, phone, address) => api.put('/auth/profile/verify-otp', { otp, name, phone, address })
