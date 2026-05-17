import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useNavigate, Link } from 'react-router-dom'
import toast from 'react-hot-toast'
import { forgotPasswordSendOtp, forgotPasswordResendOtp, forgotPasswordReset } from '../services/authService'
import { forgotPasswordSchema, forgotPasswordResetSchema } from '../validations/schemas'
import ResendOtpButton from '../components/ResendOtpButton'

export default function ForgotPassword() {
  const navigate = useNavigate()
  const [step, setStep]   = useState(1)   // 1=email, 2=otp+newpass
  const [email, setEmail] = useState('')
  const [showNew, setShowNew]         = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)

  // Step 1 — email form
  const { register: regEmail, handleSubmit: submitEmail,
    formState: { errors: emailErrors, isSubmitting: emailSubmitting } } = useForm({
    resolver: zodResolver(forgotPasswordSchema),
    mode: 'onChange',
  })

  // Step 2 — OTP + new password form
  const { register: regReset, handleSubmit: submitReset, setFocus,
    formState: { errors: resetErrors, isSubmitting: resetSubmitting } } = useForm({
    resolver: zodResolver(forgotPasswordResetSchema),
    mode: 'onChange',
  })

  const onSendOtp = async (data) => {
    try {
      await forgotPasswordSendOtp(data.email)
      setEmail(data.email)
      toast.success(`OTP sent to ${data.email}`)
      setStep(2)
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Failed to send OTP.')
    }
  }

  const onReset = async (data) => {
    try {
      await forgotPasswordReset(email, data.otp, data.newPassword)
      toast.success('Password reset successfully! Please log in.')
      navigate('/login')
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Invalid OTP.')
    }
  }

  const onResetError = (errs) => {
    const first = ['otp', 'newPassword', 'confirm'].find(f => errs[f])
    if (first) setFocus(first)
  }

  return (
    <div className="d-flex justify-content-center align-items-center"
      style={{ minHeight: '90vh', background: '#121212' }}>
      <div className="card bg-dark text-white p-4" style={{ width: '100%', maxWidth: 420 }}>

        <h3 className="text-info mb-1 text-center">Forgot Password</h3>
        <p className="text-center text-muted mb-4" style={{ fontSize: 13 }}>
          Step {step} of 2 — {step === 1 ? 'Enter your email' : 'Verify OTP & set new password'}
        </p>

        {/* ── Step 1: Email ── */}
        {step === 1 && (
          <form onSubmit={submitEmail(onSendOtp)} noValidate>
            <div className="mb-3">
              <label className="form-label">Registered Email</label>
              <input type="email" placeholder="you@example.com"
                className={`form-control bg-secondary text-white border-0 ${emailErrors.email ? 'is-invalid' : ''}`}
                {...regEmail('email')} />
              {emailErrors.email && <div className="invalid-feedback">{emailErrors.email.message}</div>}
            </div>
            <button className="btn btn-info w-100" disabled={emailSubmitting}>
              {emailSubmitting ? 'Sending OTP...' : 'Send OTP'}
            </button>
            <p className="text-center mt-3 text-muted">
              <Link to="/login" className="text-info">← Back to Login</Link>
            </p>
          </form>
        )}

        {/* ── Step 2: OTP + new password ── */}
        {step === 2 && (
          <form onSubmit={submitReset(onReset, onResetError)} noValidate>
            <p className="text-muted mb-3" style={{ fontSize: 14 }}>
              Enter the OTP sent to <strong className="text-white">{email}</strong>
            </p>

            <div className="mb-3">
              <label className="form-label">OTP</label>
              <input type="text" placeholder="123456" maxLength={6}
                className={`form-control bg-secondary text-white border-0 text-center ${resetErrors.otp ? 'is-invalid' : ''}`}
                {...regReset('otp')} />
              {resetErrors.otp && <div className="invalid-feedback text-center">{resetErrors.otp.message}</div>}
            </div>

            <div className="mb-3">
              <label className="form-label">New Password</label>
              <div className="input-group">
                <input type={showNew ? 'text' : 'password'} placeholder="••••••••"
                  className={`form-control bg-secondary text-white border-0 ${resetErrors.newPassword ? 'is-invalid' : ''}`}
                  {...regReset('newPassword')} />
                <button type="button" className="btn btn-secondary"
                  onClick={() => setShowNew(p => !p)}>
                  {showNew ? 'Hide' : 'Show'}
                </button>
                {resetErrors.newPassword && <div className="invalid-feedback">{resetErrors.newPassword.message}</div>}
              </div>
            </div>

            <div className="mb-3">
              <label className="form-label">Confirm New Password</label>
              <div className="input-group">
                <input type={showConfirm ? 'text' : 'password'} placeholder="••••••••"
                  className={`form-control bg-secondary text-white border-0 ${resetErrors.confirm ? 'is-invalid' : ''}`}
                  {...regReset('confirm')} />
                <button type="button" className="btn btn-secondary"
                  onClick={() => setShowConfirm(p => !p)}>
                  {showConfirm ? 'Hide' : 'Show'}
                </button>
                {resetErrors.confirm && <div className="invalid-feedback">{resetErrors.confirm.message}</div>}
              </div>
            </div>

            <button className="btn btn-info w-100" disabled={resetSubmitting}>
              {resetSubmitting ? 'Resetting...' : 'Reset Password'}
            </button>
            <ResendOtpButton onResend={() => forgotPasswordResendOtp(email)} />
            <button type="button" className="btn btn-link text-muted w-100 mt-1"
              onClick={() => setStep(1)}>← Back</button>
          </form>
        )}
      </div>
    </div>
  )
}
