import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useNavigate } from 'react-router-dom'
import { changePasswordSendOtp, changePasswordResendOtp, changePasswordVerifyOtp } from '../services/authService'
import { changePasswordSchema } from '../validations/schemas'
import ResendOtpButton from '../components/ResendOtpButton'

export default function ChangePassword() {
  const navigate = useNavigate()
  const [step, setStep]           = useState(1)
  const [serverError, setServerError] = useState('')
  const [showNew, setShowNew]     = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [sending, setSending]     = useState(false)
  const user = JSON.parse(localStorage.getItem('user') || '{}')

  const { register, handleSubmit, setFocus, watch,
    formState: { errors, isSubmitting } } = useForm({
    resolver: zodResolver(changePasswordSchema),
    mode: 'onChange',
  })

  const newPwd = watch('newPassword', '')

  const handleSendOtp = async () => {
    setServerError('')
    setSending(true)
    try {
      await changePasswordSendOtp()
      setStep(2)
    } catch (err) {
      setServerError(err.response?.data?.detail || 'Failed to send OTP.')
    } finally {
      setSending(false)
    }
  }

  const onVerify = async (data) => {
    setServerError('')
    try {
      await changePasswordVerifyOtp(data.otp, data.newPassword)
      navigate('/profile')
    } catch (err) {
      setServerError(err.response?.data?.detail || 'Invalid OTP.')
    }
  }

  // Password strength
  const strength = !newPwd ? 0
    : newPwd.length < 6 ? 1
    : newPwd.length < 8 ? 2
    : /[A-Z]/.test(newPwd) && /[0-9]/.test(newPwd) && /[^A-Za-z0-9]/.test(newPwd) ? 4
    : 3

  const strengthLabel = ['', 'Weak', 'Fair', 'Good', 'Strong']
  const strengthColor = ['', '#ef4444', '#f59e0b', '#3b82f6', '#22c55e']

  return (
    <div style={{
      minHeight: '100vh', background: '#0f0f0f',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: '24px 16px', fontFamily: 'Inter, Arial, sans-serif'
    }}>
      <div style={{ width: '100%', maxWidth: 440 }}>

        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <div style={{
            width: 64, height: 64, borderRadius: '50%', margin: '0 auto 16px',
            background: 'linear-gradient(135deg, #003d47, #00bcd4)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 28,
            boxShadow: '0 0 24px rgba(0,188,212,0.25)'
          }}>🔒</div>
          <h3 style={{ color: '#fff', margin: 0, fontWeight: 700 }}>Change Password</h3>
          <p style={{ color: '#666', margin: '6px 0 0', fontSize: 14 }}>Keep your account secure</p>
        </div>

        <div style={{ background: '#161616', border: '1px solid #1e1e1e', borderRadius: 20, padding: '32px 28px' }}>

          {serverError && (
            <div style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: 10, padding: '10px 14px', color: '#ef4444', fontSize: 14, marginBottom: 20 }}>
              ⚠️ {serverError}
            </div>
          )}

          {/* Step 1 — Request OTP */}
          {step === 1 && (
            <div style={{ textAlign: 'center' }}>
              <div style={{ background: '#1e1e1e', borderRadius: 12, padding: '16px 20px', marginBottom: 24 }}>
                <p style={{ color: '#888', fontSize: 13, margin: '0 0 4px' }}>OTP will be sent to</p>
                <p style={{ color: '#e0e0e0', fontWeight: 600, margin: 0 }}>{user.email}</p>
              </div>
              <p style={{ color: '#666', fontSize: 13, marginBottom: 24 }}>
                We'll verify it's you before allowing a password change.
              </p>
              <button onClick={handleSendOtp} disabled={sending} style={{ ...btn('#00bcd4', '#003d47'), width: '100%', opacity: sending ? 0.7 : 1 }}>
                {sending ? 'Sending...' : '📨 Send OTP'}
              </button>
              <button onClick={() => navigate('/profile')} style={ghostBtn}>
                ← Back to Profile
              </button>
            </div>
          )}

          {/* Step 2 — OTP + new password */}
          {step === 2 && (
            <form onSubmit={handleSubmit(onVerify, e => {
              const f = ['otp','newPassword','confirm'].find(k => e[k]); if (f) setFocus(f)
            })} noValidate>

              <p style={{ color: '#888', fontSize: 13, marginBottom: 20, textAlign: 'center' }}>
                OTP sent to <strong style={{ color: '#e0e0e0' }}>{user.email}</strong>
              </p>

              {/* OTP */}
              <div style={{ marginBottom: 20 }}>
                <label style={label}>OTP Code</label>
                <input type="text" maxLength={6} placeholder="• • • • • •"
                  style={{ ...input, textAlign: 'center', fontSize: 24, letterSpacing: 12, ...(errors.otp ? inputErr : {}) }}
                  {...register('otp')} />
                {errors.otp && <p style={err}>{errors.otp.message}</p>}
              </div>

              {/* New password */}
              <div style={{ marginBottom: 20 }}>
                <label style={label}>New Password</label>
                <div style={{ position: 'relative' }}>
                  <input type={showNew ? 'text' : 'password'} placeholder="Enter new password"
                    style={{ ...input, paddingRight: 48, ...(errors.newPassword ? inputErr : {}) }}
                    {...register('newPassword')} />
                  <button type="button" onClick={() => setShowNew(p => !p)}
                    style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: '#666', cursor: 'pointer', fontSize: 16 }}>
                    {showNew ? '🙈' : '👁️'}
                  </button>
                </div>
                {errors.newPassword && <p style={err}>{errors.newPassword.message}</p>}

                {/* Strength bar */}
                {newPwd && (
                  <div style={{ marginTop: 8 }}>
                    <div style={{ display: 'flex', gap: 4, marginBottom: 4 }}>
                      {[1,2,3,4].map(i => (
                        <div key={i} style={{
                          flex: 1, height: 4, borderRadius: 4,
                          background: i <= strength ? strengthColor[strength] : '#2a2a2a',
                          transition: 'background 0.3s'
                        }} />
                      ))}
                    </div>
                    <p style={{ fontSize: 11, color: strengthColor[strength], margin: 0 }}>
                      {strengthLabel[strength]}
                    </p>
                  </div>
                )}
              </div>

              {/* Confirm password */}
              <div style={{ marginBottom: 24 }}>
                <label style={label}>Confirm Password</label>
                <div style={{ position: 'relative' }}>
                  <input type={showConfirm ? 'text' : 'password'} placeholder="Repeat new password"
                    style={{ ...input, paddingRight: 48, ...(errors.confirm ? inputErr : {}) }}
                    {...register('confirm')} />
                  <button type="button" onClick={() => setShowConfirm(p => !p)}
                    style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: '#666', cursor: 'pointer', fontSize: 16 }}>
                    {showConfirm ? '🙈' : '👁️'}
                  </button>
                </div>
                {errors.confirm && <p style={err}>{errors.confirm.message}</p>}
              </div>

              <button type="submit" disabled={isSubmitting}
                style={{ ...btn('#00bcd4', '#003d47'), width: '100%', opacity: isSubmitting ? 0.7 : 1 }}>
                {isSubmitting ? 'Verifying...' : '✅ Verify & Change Password'}
              </button>

              <div style={{ marginTop: 12 }}>
                <ResendOtpButton onResend={changePasswordResendOtp} />
              </div>

              <button type="button" onClick={() => { setStep(1); setServerError('') }} style={ghostBtn}>
                ← Back
              </button>
            </form>
          )}

        </div>
      </div>
    </div>
  )
}

const btn = (color, bg) => ({
  padding: '13px 20px', background: bg, border: `1px solid ${color}50`,
  borderRadius: 12, color, fontSize: 15, fontWeight: 600, cursor: 'pointer',
})
const ghostBtn = {
  display: 'block', width: '100%', marginTop: 12, background: 'none',
  border: 'none', color: '#555', cursor: 'pointer', fontSize: 13, padding: '8px 0',
}
const label = { display: 'block', color: '#888', fontSize: 12, marginBottom: 6, textTransform: 'uppercase', letterSpacing: 0.8 }
const input = {
  width: '100%', padding: '12px 14px', background: '#1e1e1e',
  border: '1px solid #2a2a2a', borderRadius: 10, color: '#e0e0e0',
  fontSize: 14, outline: 'none', boxSizing: 'border-box',
}
const inputErr = { border: '1px solid #ef4444' }
const err = { color: '#ef4444', fontSize: 12, marginTop: 4 }
