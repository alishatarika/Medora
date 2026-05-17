import { useEffect, useState } from 'react'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useNavigate, Link, useLocation } from 'react-router-dom'
import toast from 'react-hot-toast'
import { registerSendOtp, registerVerifyOtp, registerResendOtp } from '../services/authService'
import { registerSchema, otpSchema } from '../validations/schemas'
import ResendOtpButton from '../components/ResendOtpButton'
import PhoneInput from '../components/PhoneInput'

export default function Register() {
  const navigate = useNavigate()
  const location = useLocation()
  const [step, setStep] = useState(location.state?.step || 1)
  const [pendingEmail, setPendingEmail] = useState(location.state?.email || '')
  const [serverError, setServerError] = useState('')
  const [info, setInfo] = useState('')
  const [showPass, setShowPass] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)

  useEffect(() => {
    if (localStorage.getItem('token')) navigate('/', { replace: true })
  }, [navigate])

  const { register, handleSubmit, setFocus, control,
    formState: { errors, isSubmitting } } = useForm({
    resolver: zodResolver(registerSchema),
    mode: 'onChange',
  })

  const { register: regOtp, handleSubmit: handleOtp, setFocus: focusOtp,
    formState: { errors: otpErrors, isSubmitting: otpSubmitting } } = useForm({
    resolver: zodResolver(otpSchema),
    mode: 'onChange',
  })

  const onSendOtp = async (data) => {
    setServerError(''); setInfo('')
    try {
      await registerSendOtp({ name: data.name, email: data.email, phone: data.phone || '', password: data.password })
      setPendingEmail(data.email)
      setInfo(`OTP sent to ${data.email}. Check your inbox.`)
      setStep(2)
    } catch (err) {
      setServerError(err.response?.data?.detail || 'Failed to send OTP.')
    }
  }

  const onVerifyOtp = async (data) => {
    setServerError('')
    try {
      await registerVerifyOtp(pendingEmail, data.otp)
      toast.success('Account verified! Please log in.')
      navigate('/login')
    } catch (err) {
      setServerError(err.response?.data?.detail || 'Invalid OTP.')
    }
  }

  const onError = (errs) => {
    const first = ['name', 'email', 'phone', 'password', 'confirm'].find(f => errs[f])
    if (first) setFocus(first)
  }

  return (
    <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '90vh', background: '#121212' }}>
      <div className="card bg-dark text-white p-4" style={{ width: '100%', maxWidth: 460 }}>
        <h3 className="text-info mb-1 text-center">Create Account</h3>
        <p className="text-center text-muted mb-4" style={{ fontSize: 13 }}>
          Step {step} of 2 — {step === 1 ? 'Your details' : 'Verify email'}
        </p>

        {serverError && <div className="alert alert-danger py-2">{serverError}</div>}
        {info        && <div className="alert alert-info py-2">{info}</div>}

        {/* ── Step 1 ── */}
        {step === 1 && (
          <form onSubmit={handleSubmit(onSendOtp, onError)} noValidate>
            <div className="mb-3">
              <label className="form-label">Full Name</label>
              <input type="text" placeholder="John Doe"
                className={`form-control bg-secondary text-white border-0 ${errors.name ? 'is-invalid' : ''}`}
                {...register('name')} />
              {errors.name && <div className="invalid-feedback">{errors.name.message}</div>}
            </div>

            <div className="mb-3">
              <label className="form-label">Email</label>
              <input type="email" placeholder="you@example.com"
                className={`form-control bg-secondary text-white border-0 ${errors.email ? 'is-invalid' : ''}`}
                {...register('email')} />
              {errors.email && <div className="invalid-feedback">{errors.email.message}</div>}
            </div>

            <div className="mb-3">
              <label className="form-label">
                Phone <span className="text-muted">(optional)</span>
              </label>
              <Controller name="phone" control={control}
                render={({ field }) => (
                  <PhoneInput
                    value={field.value}
                    onChange={field.onChange}
                    hasError={!!errors.phone}
                    className={`form-control bg-secondary text-white border-0 ${errors.phone ? 'is-invalid' : ''}`}
                  />
                )}
              />
              {errors.phone && <div className="invalid-feedback d-block">{errors.phone.message}</div>}
            </div>

            <div className="mb-3">
              <label className="form-label">Password</label>
              <div className="input-group">
                <input type={showPass ? 'text' : 'password'} placeholder="••••••••"
                  className={`form-control bg-secondary text-white border-0 ${errors.password ? 'is-invalid' : ''}`}
                  {...register('password')} />
                <button type="button" className="btn btn-secondary" onClick={() => setShowPass(p => !p)}>
                  {showPass ? 'Hide' : 'Show'}
                </button>
                {errors.password && <div className="invalid-feedback">{errors.password.message}</div>}
              </div>
            </div>

            <div className="mb-3">
              <label className="form-label">Confirm Password</label>
              <div className="input-group">
                <input type={showConfirm ? 'text' : 'password'} placeholder="••••••••"
                  className={`form-control bg-secondary text-white border-0 ${errors.confirm ? 'is-invalid' : ''}`}
                  {...register('confirm')} />
                <button type="button" className="btn btn-secondary" onClick={() => setShowConfirm(p => !p)}>
                  {showConfirm ? 'Hide' : 'Show'}
                </button>
                {errors.confirm && <div className="invalid-feedback">{errors.confirm.message}</div>}
              </div>
            </div>

            <button className="btn btn-info w-100" disabled={isSubmitting}>
              {isSubmitting ? 'Sending OTP...' : 'Send OTP'}
            </button>
          </form>
        )}

        {/* ── Step 2 ── */}
        {step === 2 && (
          <form onSubmit={handleOtp(onVerifyOtp, (e) => { if (e.otp) focusOtp('otp') })} noValidate>
            <p className="text-muted mb-3" style={{ fontSize: 14 }}>
              Enter the 6-digit OTP sent to <strong className="text-white">{pendingEmail}</strong>
            </p>
            <div className="mb-3">
              <label className="form-label">OTP</label>
              <input type="text" placeholder="123456" maxLength={6}
                className={`form-control bg-secondary text-white border-0 text-center ${otpErrors.otp ? 'is-invalid' : ''}`}
                {...regOtp('otp')} />
              {otpErrors.otp && <div className="invalid-feedback text-center">{otpErrors.otp.message}</div>}
            </div>
            <button className="btn btn-info w-100" disabled={otpSubmitting}>
              {otpSubmitting ? 'Verifying...' : 'Verify & Create Account'}
            </button>
            <ResendOtpButton onResend={() => registerResendOtp(pendingEmail)} />
            <button type="button" className="btn btn-link text-muted w-100 mt-1"
              onClick={() => { setStep(1); setServerError(''); setInfo('') }}>← Back</button>
          </form>
        )}

        <p>
          Already have an account? <Link to="/login" className="text-info">Login</Link>
        </p>
      </div>
    </div>
  )
}