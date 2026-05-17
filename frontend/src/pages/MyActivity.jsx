import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import { getMyOrders, getMyAppointments } from '../services/authService'

const STATUS = {
  Booked:    { color: '#00bcd4', bg: 'rgba(0,188,212,0.12)' },
  Confirmed: { color: '#4caf50', bg: 'rgba(76,175,80,0.12)' },
  Completed: { color: '#9e9e9e', bg: 'rgba(158,158,158,0.12)' },
  Cancelled: { color: '#ef4444', bg: 'rgba(239,68,68,0.12)' },
}

export default function MyActivity() {
  const navigate = useNavigate()
  const [tab, setTab]             = useState('orders')
  const [orders, setOrders]       = useState([])
  const [appointments, setAppts]  = useState([])
  const [loadingO, setLoadingO]   = useState(true)
  const [loadingA, setLoadingA]   = useState(true)
  const [expanded, setExpanded]   = useState(null)

  useEffect(() => {
    getMyOrders()
      .then(r => setOrders(r.data))
      .catch(() => toast.error('Failed to load orders'))
      .finally(() => setLoadingO(false))
    getMyAppointments()
      .then(r => setAppts(r.data))
      .catch(() => toast.error('Failed to load appointments'))
      .finally(() => setLoadingA(false))
  }, [])

  return (
    <div style={{ background: '#0f0f0f', minHeight: '100vh', padding: '40px 16px', fontFamily: 'Inter, Arial, sans-serif' }}>
      <div style={{ maxWidth: 820, margin: '0 auto' }}>

        {/* Header */}
        <div style={{ marginBottom: 28 }}>
          <h3 style={{ color: '#fff', margin: 0, fontWeight: 700 }}>My Activity</h3>
          <p style={{ color: '#666', margin: '4px 0 0', fontSize: 14 }}>Track your orders and appointments</p>
        </div>

        {/* Tab bar */}
        <div style={{ display: 'flex', gap: 8, marginBottom: 24, background: '#161616', padding: 6, borderRadius: 12, border: '1px solid #1e1e1e', width: 'fit-content' }}>
          {[
            { key: 'orders',       label: '🛒 Orders',       count: orders.length },
            { key: 'appointments', label: '📅 Appointments',  count: appointments.length },
          ].map(t => (
            <button key={t.key} onClick={() => setTab(t.key)} style={{
              padding: '9px 20px', borderRadius: 8, border: 'none', cursor: 'pointer',
              fontSize: 14, fontWeight: 600, transition: 'all 0.2s',
              background: tab === t.key ? '#00bcd4' : 'transparent',
              color: tab === t.key ? '#000' : '#888',
            }}>
              {t.label}
              <span style={{
                marginLeft: 8, padding: '2px 8px', borderRadius: 20, fontSize: 11,
                background: tab === t.key ? 'rgba(0,0,0,0.2)' : '#1e1e1e',
                color: tab === t.key ? '#000' : '#666',
              }}>{t.count}</span>
            </button>
          ))}
        </div>

        {/* Orders */}
        {tab === 'orders' && (
          loadingO
            ? <Spinner />
            : orders.length === 0
              ? <Empty icon="🛒" msg="No orders yet" action="Browse Shop" onClick={() => navigate('/shop')} />
              : <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                  {orders.map(o => (
                    <div key={o.id} style={card}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 12 }}>
                        <div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
                            <span style={{ color: '#fff', fontWeight: 700, fontSize: 16 }}>Order #{o.id}</span>
                            <span style={{ padding: '3px 10px', borderRadius: 20, fontSize: 11, fontWeight: 600, background: 'rgba(0,188,212,0.12)', color: '#00bcd4' }}>
                              {o.items?.length} item{o.items?.length !== 1 ? 's' : ''}
                            </span>
                          </div>
                          <p style={{ color: '#666', fontSize: 13, margin: 0 }}>
                            📅 {o.order_date ? new Date(o.order_date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : '—'}
                          </p>
                        </div>
                        <div style={{ textAlign: 'right' }}>
                          <div style={{ color: '#00bcd4', fontWeight: 700, fontSize: 22 }}>₹{o.total?.toFixed(2)}</div>
                        </div>
                      </div>

                      <div style={{ display: 'flex', gap: 20, marginTop: 14, paddingTop: 14, borderTop: '1px solid #1e1e1e', fontSize: 13, color: '#888', flexWrap: 'wrap' }}>
                        {o.address && <span>📍 {o.address}</span>}
                        {o.phone   && <span>📞 {o.phone}</span>}
                      </div>

                      <button onClick={() => setExpanded(expanded === o.id ? null : o.id)}
                        style={{ marginTop: 14, background: 'none', border: '1px solid #2a2a2a', borderRadius: 8, color: '#888', padding: '7px 16px', cursor: 'pointer', fontSize: 13 }}>
                        {expanded === o.id ? '▲ Hide Items' : '▼ View Items'}
                      </button>

                      {expanded === o.id && (
                        <div style={{ marginTop: 14, borderRadius: 10, overflow: 'hidden', border: '1px solid #1e1e1e' }}>
                          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
                            <thead>
                              <tr style={{ background: '#1a1a1a' }}>
                                {['Medicine', 'Qty', 'Price', 'Subtotal'].map(h => (
                                  <th key={h} style={{ padding: '10px 14px', color: '#666', fontWeight: 600, textAlign: 'left' }}>{h}</th>
                                ))}
                              </tr>
                            </thead>
                            <tbody>
                              {o.items?.map((item, i) => (
                                <tr key={i} style={{ borderTop: '1px solid #1e1e1e' }}>
                                  <td style={{ padding: '10px 14px', color: '#e0e0e0' }}>{item.name}</td>
                                  <td style={{ padding: '10px 14px', color: '#e0e0e0' }}>{item.qty}</td>
                                  <td style={{ padding: '10px 14px', color: '#e0e0e0' }}>₹{item.price}</td>
                                  <td style={{ padding: '10px 14px', color: '#00bcd4', fontWeight: 600 }}>₹{item.subtotal?.toFixed(2)}</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
        )}

        {/* Appointments */}
        {tab === 'appointments' && (
          loadingA
            ? <Spinner />
            : appointments.length === 0
              ? <Empty icon="👨‍⚕️" msg="No appointments yet" action="Find a Doctor" onClick={() => navigate('/doctors')} />
              : <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                  {appointments.map(a => {
                    const st = STATUS[a.status] || { color: '#9e9e9e', bg: 'rgba(158,158,158,0.12)' }
                    return (
                      <div key={a.id} style={card}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 12 }}>
                          <div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
                              <span style={{ color: '#fff', fontWeight: 700, fontSize: 16 }}>Dr. {a.doctor}</span>
                            </div>
                            {a.specialty && <p style={{ color: '#888', fontSize: 13, margin: 0 }}>{a.specialty}</p>}
                          </div>
                          <span style={{ padding: '5px 14px', borderRadius: 20, fontSize: 12, fontWeight: 600, background: st.bg, color: st.color }}>
                            {a.status}
                          </span>
                        </div>

                        <div style={{ display: 'flex', gap: 24, marginTop: 14, paddingTop: 14, borderTop: '1px solid #1e1e1e', fontSize: 13, color: '#888', flexWrap: 'wrap' }}>
                          <span>📅 {a.date}</span>
                          <span>🕐 {a.time_slot}</span>
                          <span style={{ color: '#555' }}>Appt #{a.id}</span>
                        </div>
                      </div>
                    )
                  })}
                </div>
        )}

      </div>
    </div>
  )
}

function Spinner() {
  return (
    <div style={{ textAlign: 'center', padding: '60px 0' }}>
      <div className="spinner-border text-info" />
    </div>
  )
}

function Empty({ icon, msg, action, onClick }) {
  return (
    <div style={{ textAlign: 'center', padding: '60px 20px', background: '#161616', borderRadius: 16, border: '1px solid #1e1e1e' }}>
      <div style={{ fontSize: 52, marginBottom: 12 }}>{icon}</div>
      <p style={{ color: '#666', marginBottom: 16 }}>{msg}</p>
      <button onClick={onClick} style={{
        padding: '10px 24px', background: '#00bcd4', border: 'none',
        borderRadius: 10, color: '#000', fontWeight: 600, cursor: 'pointer', fontSize: 14,
      }}>{action}</button>
    </div>
  )
}

const card = {
  background: '#161616', border: '1px solid #1e1e1e',
  borderRadius: 16, padding: '20px 24px',
}
