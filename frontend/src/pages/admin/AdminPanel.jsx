import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import AdminDoctors      from './AdminDoctors'
import AdminMedicines    from './AdminMedicines'
import AdminOrders       from './AdminOrders'
import AdminAppointments from './AdminAppointments'
import AdminUsers        from './AdminUsers'

const TABS = [
  { key: 'doctors',      label: '👨‍⚕️ Doctors' },
  { key: 'medicines',    label: '💊 Medicines' },
  { key: 'orders',       label: '🛒 Orders' },
  { key: 'appointments', label: '📅 Appointments' },
  { key: 'users',        label: '👥 Users' },
]

export default function AdminPanel() {
  const [tab, setTab] = useState('doctors')
  const navigate = useNavigate()

  const user = JSON.parse(localStorage.getItem('user') || '{}')
  if (!user.is_admin) {
    return (
      <div className="text-center text-white mt-5">
        <h4 className="text-danger">Access Denied</h4>
        <p className="text-muted">You need admin privileges to view this page.</p>
        <button className="btn btn-outline-info" onClick={() => navigate('/')}>Go Home</button>
      </div>
    )
  }

  return (
    <div style={{ minHeight: '100vh', background: '#121212', color: '#fff' }}>
      <div className="container-fluid">
        <div className="row">

          {/* Sidebar */}
          <div className="col-md-2 bg-black min-vh-100 py-4 px-0">
            <div className="text-center mb-4">
              <span className="fw-bold fs-5" style={{ color: '#14b8a6' }}>Admin Panel</span>
            </div>
            <ul className="nav flex-column">
              {TABS.map(t => (
                <li className="nav-item" key={t.key}>
                  <button
                    className={`nav-link w-100 text-start px-4 py-2 border-0 ${tab === t.key ? 'text-info bg-dark' : 'text-secondary'}`}
                    style={{ background: 'none', cursor: 'pointer' }}
                    onClick={() => setTab(t.key)}
                  >
                    {t.label}
                  </button>
                </li>
              ))}
            </ul>
            <div className="px-4 mt-4">
              <button className="btn btn-sm btn-outline-secondary w-100" onClick={() => navigate('/')}>
                ← Back to Site
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="col-md-10 py-4 px-4">
            {tab === 'doctors'      && <AdminDoctors />}
            {tab === 'medicines'    && <AdminMedicines />}
            {tab === 'orders'       && <AdminOrders />}
            {tab === 'appointments' && <AdminAppointments />}
            {tab === 'users'        && <AdminUsers />}
          </div>

        </div>
      </div>
    </div>
  )
}
