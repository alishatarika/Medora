import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Html5Qrcode } from 'html5-qrcode'
import toast from 'react-hot-toast'
import api from '../services/api'

const QR_ELEMENT_ID = 'medora-qr-reader'

// Inject CSS once to force html5-qrcode's injected video to fill the container
const styleTag = document.createElement('style')
styleTag.textContent = `
  #medora-qr-reader { position: relative; }
  #medora-qr-reader video {
    width: 100% !important;
    height: 400px !important;
    object-fit: cover !important;
    display: block !important;
  }
  #medora-qr-reader__scan_region {
    width: 100% !important;
    height: 100% !important;
  }
  #medora-qr-reader__scan_region img { display: none !important; }
  #medora-qr-reader__dashboard { display: none !important; }
`
document.head.appendChild(styleTag)

export default function Scan() {
  const [running, setRunning]   = useState(false)
  const [medicine, setMedicine] = useState(null)
  const [loading, setLoading]   = useState(false)
  const [error, setError]       = useState('')
  const scannerRef = useRef(null)
  const navigate   = useNavigate()

  useEffect(() => {
    return () => {
      if (scannerRef.current) {
        scannerRef.current.stop().catch(() => {})
        scannerRef.current = null
      }
    }
  }, [])

  const parseQRText = (raw) => {
    for (const line of raw.split('\n')) {
      const match = line.match(/^(?:name|medicine|drug|product)\s*[:\-]\s*(.+)/i)
      if (match) return match[1].trim()
    }
    return raw.trim()
  }

  const lookupMedicine = async (rawText) => {
    setLoading(true)
    setMedicine(null)
    setError('')
    const searchTerm = parseQRText(rawText)
    try {
      const res = await api.get(`/medicines/scan?q=${encodeURIComponent(searchTerm)}`)
      setMedicine(res.data)
      toast.success('Medicine found!')
    } catch {
      setError(`No medicine found for: "${searchTerm}"`)
      toast.error('Medicine not found.')
    } finally {
      setLoading(false)
    }
  }

  const startScanner = async () => {
    setMedicine(null)
    setError('')

    try {
      const scanner = new Html5Qrcode(QR_ELEMENT_ID)
      scannerRef.current = scanner

      await scanner.start(
        { facingMode: 'environment' },
        { fps: 10, qrbox: { width: 250, height: 250 } },
        async (decodedText) => {
          await scanner.stop().catch(() => {})
          scannerRef.current = null
          setRunning(false)
          await lookupMedicine(decodedText)
        },
        () => {}
      )

      setRunning(true)
    } catch (err) {
      scannerRef.current = null
      const msg = err?.message || String(err)
      if (/permission|notallowed|denied/i.test(msg)) {
        setError('Camera access blocked! Please allow camera permissions in your browser.')
      } else {
        setError('Could not start camera: ' + msg)
      }
    }
  }

  const stopScanner = async () => {
    if (scannerRef.current) {
      await scannerRef.current.stop().catch(() => {})
      scannerRef.current = null
    }
    setRunning(false)
  }

  const handleUpload = async (e) => {
    const file = e.target.files[0]
    if (!file) return

    await stopScanner()
    setMedicine(null)
    setError('')

    try {
      const scanner = new Html5Qrcode(QR_ELEMENT_ID)
      const result  = await scanner.scanFile(file, true)
      await lookupMedicine(result)
    } catch {
      setError('No QR code found in the uploaded image.')
      toast.error('No QR code found.')
    }

    e.target.value = ''
  }

  const addToCart = (med) => {
    const cart = JSON.parse(localStorage.getItem('cart') || '{}')
    const existing = cart[med.id]
    cart[med.id] = { ...med, qty: (existing?.qty || 0) + 1 }
    localStorage.setItem('cart', JSON.stringify(cart))
    window.dispatchEvent(new Event('cart-updated'))
    toast.success(`${med.name} added to cart`)
  }

  return (
    <div style={s.page}>
      <div style={s.container}>
        <h1 style={s.heading}>🔍 Medora QR Scanner</h1>
        <p style={s.sub}>Scan using camera or upload an image</p>

        <div style={s.readerWrapper}>
          <div id={QR_ELEMENT_ID} style={{ width: '100%', height: '100%' }} />
          {!running && (
            <div style={s.placeholder}>Camera preview will appear here</div>
          )}
        </div>

        {error   && <div style={s.error}>⚠️ {error}</div>}
        {loading && <div style={{ marginTop: 12, color: '#aaa' }}>🔄 Looking up medicine…</div>}

        {medicine && (
          <div style={s.card}>
            <h2 style={{ color: '#00bcd4', marginBottom: 12 }}>💊 {medicine.name}</h2>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 15 }}>
              <tbody>
                {[
                  ['Category',    medicine.category    || '—'],
                  ['Company',     medicine.company     || '—'],
                  ['Price',       `₹${medicine.price}`],
                  ['Description', medicine.description || '—'],
                ].map(([label, value]) => (
                  <tr key={label} style={{ borderBottom: '1px solid #333' }}>
                    <td style={{ padding: '8px 4px', color: '#aaa', width: 110 }}>{label}</td>
                    <td style={{ padding: '8px 4px', color: '#e0e0e0' }}>{value}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div style={{ display: 'flex', gap: 10, marginTop: 16 }}>
              <button onClick={() => addToCart(medicine)} style={{ ...s.btn, flex: 1 }}>🛒 Add to Cart</button>
              <button onClick={() => navigate('/cart')}   style={{ ...s.btn, flex: 1, background: '#1e88e5' }}>View Cart</button>
            </div>
          </div>
        )}

        <button style={s.btn} onClick={running ? stopScanner : startScanner}>
          {running ? '⏹ Stop Scanner' : '📷 Start Scanner'}
        </button>

        <button style={s.btn} onClick={() => document.getElementById('qrUpload').click()}>
          📁 Upload QR Image
        </button>
        <input
          id="qrUpload"
          type="file"
          accept="image/*"
          style={{ display: 'none' }}
          onChange={handleUpload}
        />
      </div>
    </div>
  )
}

const s = {
  page: {
    fontFamily: 'Arial, sans-serif',
    background: '#121212',
    color: 'white',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: '100vh',
    flexDirection: 'column',
  },
  container: {
    width: '90%',
    maxWidth: 600,
    border: '2px solid #00bcd4',
    padding: 20,
    borderRadius: 10,
    background: '#222',
    textAlign: 'center',
  },
  heading: { fontSize: 24 },
  sub:     { color: '#aaa', marginTop: 6 },
  readerWrapper: {
    position: 'relative',
    width: '100%',
    height: 400,
    border: '2px solid #00bcd4',
    marginTop: 10,
    borderRadius: 10,
    background: '#111',
    overflow: 'hidden',
  },
  placeholder: {
    position: 'absolute',
    inset: 0,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: '#555',
    fontSize: 14,
    background: '#111',
    pointerEvents: 'none',
  },
  btn: {
    padding: 12,
    background: '#00bcd4',
    border: 'none',
    borderRadius: 8,
    color: 'black',
    fontSize: 16,
    cursor: 'pointer',
    marginTop: 12,
    width: '90%',
    display: 'block',
    marginLeft: 'auto',
    marginRight: 'auto',
    fontWeight: 600,
  },
  card: {
    marginTop: 16,
    padding: 20,
    background: '#1a1a1a',
    border: '1px solid #00bcd4',
    borderRadius: 10,
    textAlign: 'left',
  },
  error: {
    marginTop: 12,
    padding: '10px 14px',
    background: '#2a1a1a',
    border: '1px solid #ff6b6b',
    borderRadius: 8,
    fontSize: 14,
    color: '#ff6b6b',
  },
}