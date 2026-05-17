import { useState, useEffect } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { logout } from '../services/authService'

function useCartCount() {
  const [count, setCount] = useState(0)

  const recount = () => {
    const token = localStorage.getItem('token')
    if (!token) { setCount(0); return }
    const cart = JSON.parse(localStorage.getItem('cart') || '{}')
    setCount(Object.values(cart).reduce((s, m) => s + (m.qty || 0), 0))
  }

  useEffect(() => {
    recount()  // run on mount
    window.addEventListener('cart-updated', recount)
    return () => window.removeEventListener('cart-updated', recount)
  }, [])

  return count
}

export default function Navbar() {
  const navigate = useNavigate()
  const token = localStorage.getItem('token')
  const user = JSON.parse(localStorage.getItem('user') || '{}')
  const [open, setOpen] = useState(false)
  const cartCount = useCartCount()

  const handleLogout = () => { logout(); navigate('/login') }

  return (
    <nav className="navbar navbar-expand-lg navbar-dark py-3" style={{ backgroundColor: '#000' }}>
      <div className="container-fluid">
        <Link className="navbar-brand text-gradient fw-bold fs-3" to="/">Medora</Link>

        <button className="navbar-toggler" type="button" onClick={() => setOpen(!open)}>
          <span className="navbar-toggler-icon"></span>
        </button>

        <div className={`collapse navbar-collapse justify-content-end ${open ? 'show' : ''}`}>
          <ul className="navbar-nav align-items-center">
            <li className="nav-item mx-2">
              <Link className="nav-link glow-btn" to="/about">
                <i className="fas fa-info-circle me-1"></i>About
              </Link>
            </li>
            <li className="nav-item mx-2">
              <Link className="nav-link glow-btn" to="/shop">
                <i className="fas fa-pills me-1"></i>Shop
              </Link>
            </li>
            <li className="nav-item mx-2">
              <Link className="nav-link glow-btn" to="/doctors">
                <i className="fas fa-user-md me-1"></i>Doctors
              </Link>
            </li>
            <li className="nav-item mx-2">
              <Link className="nav-link glow-btn" to="/chatbot">
                <i className="fas fa-robot me-1"></i>AI Chat
              </Link>
            </li>

            {/* Cart — only show when logged in */}
            {token && (
              <li className="nav-item mx-2">
                <Link className="nav-link glow-btn position-relative" to="/cart">
                  <i className="fas fa-shopping-cart me-1"></i>Cart
                  {cartCount > 0 && (
                    <span className="position-absolute top-0 start-100 translate-middle badge rounded-pill"
                      style={{ background: '#14b8a6', fontSize: 10 }}>
                      {cartCount}
                    </span>
                  )}
                </Link>
              </li>
            )}

            {token ? (
              <>
                <li className="nav-item mx-2">
                  <span className="nav-link text-white">Hi, {user.name}</span>
                </li>
                {user.is_admin && (
                  <li className="nav-item mx-2">
                    <Link className="btn btn-sm btn-outline-warning" to="/admin">Admin</Link>
                  </li>
                )}
                <li className="nav-item mx-2">
                  <Link className="btn btn-sm btn-outline-info" to="/profile">Profile</Link>
                </li>
                <li className="nav-item mx-2">
                  <Link className="btn btn-sm btn-outline-secondary" to="/my-activity">My Orders</Link>
                </li>
                <li className="nav-item mx-2">
                  <button className="btn btn-sm btn-outline-danger" onClick={handleLogout}>Logout</button>
                </li>
              </>
            ) : (
              <>
                <li className="nav-item mx-2">
                  <Link className="btn btn-sm btn-outline-light" to="/login">Login</Link>
                </li>
                <li className="nav-item mx-2">
                  <Link className="btn btn-sm btn-teal" to="/register">Register</Link>
                </li>
              </>
            )}
          </ul>
        </div>
      </div>
    </nav>
  )
}
