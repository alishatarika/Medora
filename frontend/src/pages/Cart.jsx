import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'

export default function Cart() {
  const navigate = useNavigate()
  const [cart, setCart] = useState({})

  useEffect(() => {
    setCart(JSON.parse(localStorage.getItem('cart') || '{}'))
  }, [])

  const items  = Object.values(cart)
  const total  = items.reduce((s, m) => s + m.price * m.qty, 0)
  const count  = items.reduce((s, m) => s + m.qty, 0)

  const save = (updated) => {
    setCart(updated)
    localStorage.setItem('cart', JSON.stringify(updated))
    window.dispatchEvent(new Event('cart-updated'))
  }

  const update = (id, qty) => {
    const updated = { ...cart }
    if (qty <= 0) { delete updated[id]; toast('Item removed', { icon: '🗑️' }) }
    else updated[id] = { ...updated[id], qty }
    save(updated)
  }

  if (items.length === 0) return (
    <div className="container my-5 text-center">
      <div style={{ fontSize: 64 }}>🛒</div>
      <h4 className="text-white mt-3">Your cart is empty</h4>
      <p className="text-muted">Add medicines to get started</p>
      <button className="btn btn-info mt-2" onClick={() => navigate('/shop')}>
        Browse Medicines
      </button>
    </div>
  )

  return (
    <div style={{ background: '#121212', minHeight: '80vh', padding: '30px 16px' }}>
      <div className="container">
        <h4 className="text-white mb-4">
          🛒 Shopping Cart
          <span className="text-muted ms-2" style={{ fontSize: 16 }}>({count} item{count !== 1 ? 's' : ''})</span>
        </h4>

        <div className="row g-4">
          {/* ── Cart Items ── */}
          <div className="col-lg-8">
            {items.map((med, idx) => (
              <div key={med.id} className="card bg-dark text-white border-0 mb-3"
                style={{ borderRadius: 12, borderBottom: idx < items.length - 1 ? '1px solid #2a2a2a' : 'none' }}>
                <div className="card-body p-4">
                  <div className="row align-items-center g-3">

                    {/* Medicine icon placeholder */}
                    <div className="col-auto">
                      <div style={{
                        width: 80, height: 80, borderRadius: 8,
                        background: 'linear-gradient(135deg, #1a3a3a, #0f2a2a)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: 32, border: '1px solid #2a4a4a'
                      }}>💊</div>
                    </div>

                    {/* Details */}
                    <div className="col">
                      <h6 className="mb-1 fw-bold">{med.name}</h6>
                      <small className="text-muted d-block">{med.category} · {med.company}</small>
                      <span className="text-teal fw-bold mt-1 d-block">₹{med.price}</span>
                      <button className="btn btn-link text-danger p-0 mt-1" style={{ fontSize: 13 }}
                        onClick={() => update(med.id, 0)}>
                        <i className="fas fa-trash-alt me-1"></i>Remove
                      </button>
                    </div>

                    {/* Qty controls */}
                    <div className="col-auto">
                      <div className="d-flex align-items-center gap-2">
                        <button className="btn btn-outline-secondary btn-sm"
                          style={{ width: 32, height: 32, padding: 0 }}
                          onClick={() => update(med.id, med.qty - 1)}>−</button>
                        <span className="text-white fw-bold" style={{ minWidth: 24, textAlign: 'center' }}>
                          {med.qty}
                        </span>
                        <button className="btn btn-outline-secondary btn-sm"
                          style={{ width: 32, height: 32, padding: 0 }}
                          onClick={() => update(med.id, med.qty + 1)}>+</button>
                      </div>
                    </div>

                    {/* Subtotal */}
                    <div className="col-auto text-end">
                      <div className="fw-bold text-white">₹{(med.price * med.qty).toFixed(2)}</div>
                      {med.qty > 1 && (
                        <small className="text-muted">₹{med.price} each</small>
                      )}
                    </div>

                  </div>
                </div>
              </div>
            ))}

            <button className="btn btn-outline-secondary mt-2" onClick={() => navigate('/shop')}>
              <i className="fas fa-arrow-left me-2"></i>Continue Shopping
            </button>
          </div>

          {/* ── Order Summary ── */}
          <div className="col-lg-4">
            <div className="card bg-dark text-white border-0 sticky-top" style={{ borderRadius: 12, top: 20 }}>
              <div className="card-body p-4">
                <h6 className="text-info mb-3">Order Summary</h6>

                <div className="d-flex justify-content-between mb-2" style={{ fontSize: 14 }}>
                  <span className="text-muted">Subtotal ({count} items)</span>
                  <span>₹{total.toFixed(2)}</span>
                </div>
                <div className="d-flex justify-content-between mb-2" style={{ fontSize: 14 }}>
                  <span className="text-muted">Delivery</span>
                  <span className="text-success">FREE</span>
                </div>

                <hr style={{ borderColor: '#2a2a2a' }} />

                <div className="d-flex justify-content-between mb-4 fw-bold fs-5">
                  <span>Total</span>
                  <span className="text-teal">₹{total.toFixed(2)}</span>
                </div>

                <button className="btn btn-success w-100 py-2 fw-bold"
                  onClick={() => navigate('/checkout')}>
                  <i className="fas fa-lock me-2"></i>Proceed to Checkout
                </button>

                <div className="text-center mt-3" style={{ fontSize: 12, color: '#666' }}>
                  <i className="fas fa-shield-alt me-1"></i>Secure checkout
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
