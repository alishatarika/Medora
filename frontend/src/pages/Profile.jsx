import { useEffect, useState } from 'react'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Link } from 'react-router-dom'
import toast from 'react-hot-toast'
import {
  getMe, profileSendOtp, profileVerifyOtp, profileResendOtp,
  changeEmailSendOtp, changeEmailVerifyOtp
} from '../services/authService'
import { profileSchema, otpSchema } from '../validations/schemas'
import ResendOtpButton from '../components/ResendOtpButton'
import AddressAutocomplete from '../components/AddressAutocomplete'
import PhoneInput from '../components/PhoneInput'
import { z } from 'zod'

const editSchema = profileSchema.extend({
  new_email: z.string().email('Enter a valid email'),
})

export default function Profile() {
  const [user, setUser]             = useState(null)
  const [step, setStep]             = useState(0)
  const [pending, setPending]       = useState({})
  const [changingEmail, setChangingEmail] = useState(false)

  useEffect(() => { getMe().then(r => setUser(r.data)) }, [])

  const { register, handleSubmit, setFocus, reset, watch, control,
    formState: { errors, isSubmitting } } = useForm({
    resolver: zodResolver(editSchema), mode: 'onChange',
  })

  const { register: regOtp, handleSubmit: handleOtp,
    formState: { errors: otpErrors, isSubmitting: otpSubmitting } } = useForm({
    resolver: zodResolver(otpSchema), mode: 'onChange',
  })

  const newEmailValue = watch('new_email')

  const openEdit = () => {
    reset({ name: user.name, phone: user.phone || '', address: user.address || '', new_email: user.email })
    setChangingEmail(false)
    setStep(1)
  }

  const onSendOtp = async (data) => {
    try {
      const emailChanged = data.new_email.trim() !== user.email
      if (emailChanged) {
        await changeEmailSendOtp(data.new_email.trim())
        toast.success(`OTP sent to ${data.new_email}`)
        setChangingEmail(true)
      } else {
        await profileSendOtp()
        toast.success(`OTP sent to ${user.email}`)
        setChangingEmail(false)
      }
      setPending(data)
      setStep(2)
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Failed to send OTP.')
    }
  }

  const onVerifyOtp = async (data) => {
    try {
      if (changingEmail) {
        const res = await changeEmailVerifyOtp(pending.new_email.trim(), data.otp)
        const updated = { ...user, email: res.data.email }
        setUser(updated)
        localStorage.setItem('user', JSON.stringify(updated))
        toast.success('Email changed successfully!')
      } else {
        const res = await profileVerifyOtp(data.otp, pending.name, pending.phone, pending.address)
        setUser(res.data)
        localStorage.setItem('user', JSON.stringify(res.data))
        toast.success('Profile updated!')
      }
      setStep(0)
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Invalid OTP.')
    }
  }

  if (!user) return (
    <div style={{ minHeight: '80vh', background: '#0f0f0f', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div className="spinner-border text-info" />
    </div>
  )

  const initials = user.name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()

  return (
    <div style={{ background: '#0f0f0f', minHeight: '100vh', padding: '40px 16px', fontFamily: 'Inter, Arial, sans-serif' }}>
      <div style={{ maxWidth: 780, margin: '0 auto' }}>

        {/* Hero banner */}
        <div style={{
          borderRadius: 20, marginBottom: 28, padding: '32px 28px',
          background: 'linear-gradient(135deg, #0d2137 0%, #0a3d2e 100%)',
          border: '1px solid #1a3a2a', position: 'relative', overflow: 'hidden'
        }}>
          <div style={{
            position: 'absolute', top: -40, right: -40, width: 200, height: 200,
            borderRadius: '50%', background: 'rgba(0,188,212,0.06)'
          }} />
          <div style={{ display: 'flex', alignItems: 'center', gap: 20, flexWrap: 'wrap' }}>
            <div style={{
              width: 80, height: 80, borderRadius: '50%', flexShrink: 0,
              background: 'linear-gradient(135deg, #00bcd4, #00897b)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 30, fontWeight: 700, color: '#fff',
              boxShadow: '0 0 24px rgba(0,188,212,0.35)'
            }}>{initials}</div>
            <div style={{ flex: 1 }}>
              <h3 style={{ color: '#fff', margin: 0, fontWeight: 700 }}>{user.name}</h3>
              <p style={{ color: '#80cbc4', margin: '4px 0 0', fontSize: 14 }}>{user.email}</p>
              {user.phone && <p style={{ color: '#80cbc4', margin: '2px 0 0', fontSize: 13 }}>{user.phone}</p>}
            </div>
            <span style={{
              padding: '6px 14px', borderRadius: 20, fontSize: 12, fontWeight: 600,
              background: user.is_admin ? 'rgba(255,193,7,0.15)' : 'rgba(0,188,212,0.15)',
              color: user.is_admin ? '#ffc107' : '#00bcd4',
              border: `1px solid ${user.is_admin ? '#ffc10740' : '#00bcd440'}`
            }}>
              {user.is_admin ? '⭐ Admin' : '✓ Verified'}
            </span>
          </div>
        </div>

        {/* View mode */}
        {step === 0 && (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 260px', gap: 20 }}>

            {/* Info card */}
            <div style={card}>
              <p style={sectionLabel}>Personal Information</p>
              {[
                { icon: '👤', label: 'Full Name',    value: user.name },
                { icon: '✉️', label: 'Email',        value: user.email },
                { icon: '📞', label: 'Phone',        value: user.phone || '—' },
                { icon: '📍', label: 'Address',      value: user.address || '—' },
              ].map(f => (
                <div key={f.label} style={{ display: 'flex', alignItems: 'flex-start', gap: 14, padding: '14px 0', borderBottom: '1px solid #1e1e1e' }}>
                  <span style={{ fontSize: 18, marginTop: 1 }}>{f.icon}</span>
                  <div>
                    <div style={{ fontSize: 11, color: '#666', marginBottom: 2, textTransform: 'uppercase', letterSpacing: 1 }}>{f.label}</div>
                    <div style={{ color: '#e0e0e0', fontSize: 15 }}>{f.value}</div>
                  </div>
                </div>
              ))}
            </div>

            {/* Actions card */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div style={card}>
                <p style={sectionLabel}>Account</p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  <button onClick={openEdit} style={actionBtn('#00bcd4', '#003d47')}>
                    ✏️ Edit Profile
                  </button>
                  <Link to="/my-activity" style={{ ...actionBtn('#00897b', '#003328'), textDecoration: 'none', textAlign: 'center' }}>
                    📋 Orders & Appointments
                  </Link>
                  <Link to="/change-password" style={{ ...actionBtn('#455a64', '#1a2a30'), textDecoration: 'none', textAlign: 'center' }}>
                    🔒 Change Password
                  </Link>
                  {user.is_admin && (
                    <Link to="/admin" style={{ ...actionBtn('#f59e0b', '#3d2a00'), textDecoration: 'none', textAlign: 'center' }}>
                      🛡️ Admin Panel
                    </Link>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Edit form */}
        {step === 1 && (
          <div style={card}>
            <p style={sectionLabel}>Edit Profile</p>
            <form onSubmit={handleSubmit(onSendOtp, e => {
              const f = ['name','phone','address','new_email'].find(k => e[k]); if (f) setFocus(f)
            })} noValidate>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                <div style={{ gridColumn: '1/-1' }}>
                  <label style={fieldLabel}>Full Name</label>
                  <input style={{ ...fieldInput, ...(errors.name ? fieldInputErr : {}) }} {...register('name')} />
                  {errors.name && <p style={errText}>{errors.name.message}</p>}
                </div>
                <div>
                  <label style={fieldLabel}>Phone</label>
                  <Controller
                    name="phone"
                    control={control}
                    render={({ field }) => (
                      <PhoneInput
                        value={field.value}
                        onChange={field.onChange}
                        hasError={!!errors.phone}
                        className={`form-control ${errors.phone ? 'is-invalid' : ''}`}
                      />
                    )}
                  />
                  {errors.phone && <p style={errText}>{errors.phone.message}</p>}
                </div>
                <div>
                  <label style={fieldLabel}>Email</label>
                  <input type="email"
                    style={{ ...fieldInput, ...(errors.new_email ? fieldInputErr : {}) }} {...register('new_email')} />
                  {errors.new_email && <p style={errText}>{errors.new_email.message}</p>}
                  {newEmailValue?.trim() && newEmailValue.trim() !== user.email && (
                    <p style={{ color: '#f59e0b', fontSize: 12, marginTop: 4 }}>⚠️ Email changed — OTP will be sent to {newEmailValue}</p>
                  )}
                </div>
                <div style={{ gridColumn: '1/-1' }}>
                  <label style={fieldLabel}>Address</label>
                  <Controller
                    name="address"
                    control={control}
                    render={({ field }) => (
                      <AddressAutocomplete
                        value={field.value}
                        onChange={field.onChange}
                        hasError={!!errors.address}
                      />
                    )}
                  />
                  {errors.address && <p style={errText}>{errors.address.message}</p>}
                </div>
              </div>
              <div style={{ display: 'flex', gap: 12, marginTop: 20 }}>
                <button type="submit" disabled={isSubmitting}
                  style={{ ...actionBtn('#00bcd4', '#003d47'), flex: 1, opacity: isSubmitting ? 0.7 : 1 }}>
                  {isSubmitting ? 'Sending OTP...' : '📨 Send OTP to Confirm'}
                </button>
                <button type="button" onClick={() => setStep(0)}
                  style={{ ...actionBtn('#333', '#1a1a1a'), padding: '12px 20px' }}>
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        {/* OTP step */}
        {step === 2 && (
          <div style={{ ...card, maxWidth: 420, margin: '0 auto', textAlign: 'center' }}>
            <div style={{ fontSize: 52, marginBottom: 12 }}>📧</div>
            <p style={sectionLabel}>Verify Identity</p>
            <p style={{ color: '#888', fontSize: 14, marginBottom: 24 }}>
              Enter the 6-digit OTP sent to{' '}
              <strong style={{ color: '#e0e0e0' }}>
                {changingEmail ? pending.new_email : user.email}
              </strong>
            </p>
            <form onSubmit={handleOtp(onVerifyOtp)} noValidate>
              <input type="text" maxLength={6} placeholder="• • • • • •"
                style={{ ...fieldInput, textAlign: 'center', fontSize: 28, letterSpacing: 14, marginBottom: 8,
                  ...(otpErrors.otp ? fieldInputErr : {}) }}
                {...regOtp('otp')} />
              {otpErrors.otp && <p style={errText}>{otpErrors.otp.message}</p>}
              <button type="submit" disabled={otpSubmitting}
                style={{ ...actionBtn('#00bcd4', '#003d47'), width: '100%', marginTop: 12, opacity: otpSubmitting ? 0.7 : 1 }}>
                {otpSubmitting ? 'Verifying...' : '✅ Verify & Save'}
              </button>
              <div style={{ marginTop: 12 }}>
                <ResendOtpButton onResend={() => changingEmail ? changeEmailSendOtp(pending.new_email) : profileResendOtp()} />
              </div>
              <button type="button" onClick={() => setStep(1)}
                style={{ background: 'none', border: 'none', color: '#666', cursor: 'pointer', marginTop: 8, fontSize: 13 }}>
                ← Back to Edit
              </button>
            </form>
          </div>
        )}

      </div>
    </div>
  )
}

const card = {
  background: '#161616', border: '1px solid #1e1e1e',
  borderRadius: 16, padding: '24px 24px',
}
const sectionLabel = {
  color: '#00bcd4', fontSize: 12, fontWeight: 700,
  textTransform: 'uppercase', letterSpacing: 1.5, marginBottom: 16,
}
const actionBtn = (color, bg) => ({
  padding: '12px 16px', background: bg, border: `1px solid ${color}40`,
  borderRadius: 10, color, fontSize: 14, fontWeight: 600, cursor: 'pointer',
  display: 'block', width: '100%',
})
const fieldLabel = { display: 'block', color: '#888', fontSize: 12, marginBottom: 6, textTransform: 'uppercase', letterSpacing: 0.8 }
const fieldInput = {
  width: '100%', padding: '11px 14px', background: '#1e1e1e',
  border: '1px solid #2a2a2a', borderRadius: 10, color: '#e0e0e0',
  fontSize: 14, outline: 'none', boxSizing: 'border-box',
}
const fieldInputErr = { border: '1px solid #ef4444' }
const errText = { color: '#ef4444', fontSize: 12, marginTop: 4 }
