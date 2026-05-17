import { useState } from 'react'
import toast from 'react-hot-toast'
import api from '../services/api'

export default function SOS() {
  const [status, setStatus] = useState('')
  const [loading, setLoading] = useState(false)

  const sendSOS = () => {
    if (loading) return
    if (!navigator.geolocation) {
      toast.error('Geolocation not supported by your browser.')
      return
    }

    setLoading(true)
    setStatus('📍 Getting your location...')

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const location = `https://www.google.com/maps?q=${pos.coords.latitude},${pos.coords.longitude}`
        try {
          const res = await api.post('/sos/', { location })
          if (res.data.status === 'success') {
            setStatus('✅ SOS alert sent successfully!')
            toast.success('SOS alert sent!')
          } else {
            setStatus('⚠️ Error sending SOS.')
            toast.error('Failed to send SOS.')
          }
        } catch (err) {
          const msg = err.response?.data?.detail || 'Failed to send SOS. Try again.'
          setStatus(`⚠️ ${msg}`)
          toast.error(msg)
        } finally {
          setLoading(false)
        }
      },
      (err) => {
        setLoading(false)
        const msg = err.code === 1
          ? 'Location access denied. Please allow location in browser settings.'
          : 'Unable to get location. Try again.'
        setStatus(`⚠️ ${msg}`)
        toast.error(msg)
      },
      { timeout: 10000 }
    )
  }

  return (
    <section className="text-center my-5">
      <h1 className="fw-bold text-teal mb-3">🚨 Emergency SOS Alert</h1>
      <p className="text-muted mb-4">Press the button to send your location to emergency contacts.</p>
      <button className="sos-btn" onClick={sendSOS} disabled={loading}>
        {loading ? '⏳ Sending...' : '🚨 Send SOS'}
      </button>
      {status && (
        <div className="mt-4" style={{ fontSize: '1.1rem', fontWeight: 'bold' }}>{status}</div>
      )}
    </section>
  )
}
