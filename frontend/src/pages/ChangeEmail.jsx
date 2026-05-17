import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import { changeEmailSendOtp, changeEmailVerifyOtp } from '../services/authService'
import { changeEmailSchema, changeEmailOtpSchema } from '../validations/schemas'
import ResendOtpButton from '../components/ResendOtpButton'

export default function ChangeEmail() {
  const navigate = useNavigate()
  const [step, setStep]         = useState(1)
  const [newEmail, setNewEmail] = useState('')
  const user = JSON.parse(localStorage.getItem('user') || '{}')

  // Step 1 — new email form
  const { register: regEmail, handleSubmit: submitEmail,
    formState: { errors: emailErrors, isSubmitting: emailSubmitting } } = useForm({
    resolver: zodResolver(changeEmailSchema), mode: 'onChange',
  })

  // Step 2 — OTP form
  const { register: regOtp, handleSubmit: submitOtp,
    formState: { errors: otpErrors, isSubmitting: otpSubmitting } } = useForm({
    resolver: zodResolver(changeEmailOtpSchema), mode: 'onChange',
  })

  const onSendOtp = async (data) => {
    try {
      await changeEmailSendOtp(data.new_email)
      setNewEmail(data.new_email)
      toast.success(`OTP sent to ${data.new_email}`)
      setStep(2)
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Failed to send OTP.')
    }
  }

  const onVerify = async (data) => {
    try {
      const res = await changeEmailVerifyOtp(newEmail, data.otp)
      // Update localStorage with new email
      const updated = { ...user, email: res.data.email }
      localStorage.setItem('user', JSON.stringify(updated))
      toast.success('Email changed successfully!')
      navigate('/profile')
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Invalid OTP.')
    }
  }

  return (
    <div style={{ background: '#121212', minHeight: '80vh', padding: '40px 16px' }}>
      <div className="container" style={{ maxWidth: 460 }}>
        <div className="card bg-dark text-white border-0" style={{ borderRadius: 16 }}>
          <div className="card-body p-4">

            <h5 className="text-info mb-1 text-center">
              <i className="fas fa-envelope me-2"></i>Change Email
            </h5>
            <p className="text-center text-muted mb-4" style={{ fontSize: 13 }}>
              Step {step} of 2 — {step === 1 ? 'Enter new email' : 'Verify new email'}
            </p>

            {/* ── Step 1 ── */}
            {step === 1 && (
              <form onSubmit={submitEmail(onSendOtp)} noValidate>
                <div className="mb-3">
                  <label className="form-label">Current Email</label>
                  <input type="email" className="form-control bg-secondary text-white border-0"
                    value={user.email} disabled />
                </div>
                <div className="mb-3">
                  <label className="form-label">New Email</label>
                  <input type="email" placeholder="newemail@example.com"
                    className={`form-control bg-secondary text-white border-0 ${emailErrors.new_email ? 'is-invalid' : ''}`}
                    {...regEmail('new_email')} />
                  {emailErrors.new_email && <div className="invalid-feedback">{emailErrors.new_email.message}</div>}
                </div>
                <p className="text-muted mb-3" style={{ fontSize: 12 }}>
                  <i className="fas fa-info-circle me-1"></i>
                  An OTP will be sent to your <strong>new email</strong> to verify it.
                </p>
                <button className="btn btn-info w-100" disabled={emailSubmitting}>
                  {emailSubmitting ? 'Sending OTP...' : 'Send OTP to New Email'}
                </button>
                <button type="button" className="btn btn-link text-muted w-100 mt-1"
                  onClick={() => navigate('/profile')}>← Back to Profile</button>
              </form>
            )}

            {/* ── Step 2 ── */}
            {step === 2 && (
              <form onSubmit={submitOtp(onVerify)} noValidate>
                <div className="text-center mb-4">
                  <div style={{ fontSize: 40 }}>📧</div>
                  <p className="text-muted mt-2" style={{ fontSize: 14 }}>
                    Enter the OTP sent to <strong className="text-white">{newEmail}</strong>
                  </p>
                </div>
                <div className="mb-3">
                  <input type="text" placeholder="123456" maxLength={6}
                    className={`form-control bg-secondary text-white border-0 text-center ${otpErrors.otp ? 'is-invalid' : ''}`}
                    style={{ fontSize: 24, letterSpacing: 12 }}
                    {...regOtp('otp')} />
                  {otpErrors.otp && <div className="invalid-feedback text-center">{otpErrors.otp.message}</div>}
                </div>
                <button className="btn btn-info w-100" disabled={otpSubmitting}>
                  {otpSubmitting ? 'Verifying...' : '✅ Verify & Change Email'}
                </button>
                <ResendOtpButton onResend={() => changeEmailSendOtp(newEmail)} />
                <button type="button" className="btn btn-link text-muted w-100 mt-1"
                  onClick={() => setStep(1)}>← Back</button>
              </form>
            )}

          </div>
        </div>
      </div>
    </div>
  )
}
