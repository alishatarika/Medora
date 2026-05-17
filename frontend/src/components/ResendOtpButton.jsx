import { useState, useEffect } from 'react'
import toast from 'react-hot-toast'

/**
 * Shows "Resend OTP" button immediately.
 * After clicking, starts a 30s cooldown before allowing another resend.
 */
export default function ResendOtpButton({ onResend, cooldown = 30 }) {
  const [seconds, setSeconds] = useState(0)   // 0 = no timer, button visible
  const [loading, setLoading] = useState(false)

  // Countdown only runs after a resend
  useEffect(() => {
    if (seconds <= 0) return
    const t = setTimeout(() => setSeconds(s => s - 1), 1000)
    return () => clearTimeout(t)
  }, [seconds])

  const handleResend = async () => {
    setLoading(true)
    try {
      await onResend()
      toast.success('New OTP sent! Check your inbox.')
      setSeconds(cooldown)   // start countdown only after successful resend
    } catch (err) {
      const detail = err.response?.data?.detail
      toast.error(typeof detail === 'string' ? detail : 'Failed to resend OTP.')
    } finally {
      setLoading(false)
    }
  }

  if (seconds > 0) {
    return (
      <p className="text-center text-muted mt-2" style={{ fontSize: 13 }}>
        Resend OTP in <span className="text-info">{seconds}s</span>
      </p>
    )
  }

  return (
    <button
      type="button"
      className="btn btn-link text-info w-100 mt-1 p-0"
      style={{ fontSize: 13 }}
      onClick={handleResend}
      disabled={loading}
    >
      {loading ? 'Sending...' : 'Resend OTP'}
    </button>
  )
}
