import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import Navbar         from './components/Navbar'
import Footer         from './components/Footer'
import Home           from './pages/Home'
import About          from './pages/About'
import Login          from './pages/Login'
import Register       from './pages/Register'
import Profile        from './pages/Profile'
import ChangePassword from './pages/ChangePassword'
import ForgotPassword from './pages/ForgotPassword'
import Shop           from './pages/Shop'
import Cart           from './pages/Cart'
import Checkout       from './pages/Checkout'
import Doctors        from './pages/Doctors'
import DoctorProfile  from './pages/DoctorProfile'
import Chatbot        from './pages/Chatbot'
import FirstAid       from './pages/FirstAid'
import SOS            from './pages/SOS'
import Scan           from './pages/Scan'
import AdminPanel     from './pages/admin/AdminPanel'
import MyActivity     from './pages/MyActivity'

// Clear expired token on every app load
;(function checkTokenExpiry() {
  const token = localStorage.getItem('token')
  if (!token) return
  try {
    const { exp } = JSON.parse(atob(token.split('.')[1]))
    if (exp && Date.now() > exp * 1000) {
      localStorage.removeItem('token')
      localStorage.removeItem('user')
    }
  } catch {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
  }
})()

const PrivateRoute = ({ children }) => {
  const token = localStorage.getItem('token')
  return token ? children : <Navigate to="/login" replace />
}

// Admin-only guard
const AdminRoute = ({ children }) => {
  const token = localStorage.getItem('token')
  const user  = JSON.parse(localStorage.getItem('user') || '{}')
  if (!token) return <Navigate to="/login" replace />
  if (!user.is_admin) return <Navigate to="/" replace />
  return children
}

export default function App() {
  return (
    <BrowserRouter>
      <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: '#121212' }}>
        <Navbar />
        <div style={{ flex: 1 }}>
          <Routes>
        {/* Public */}
        <Route path="/"            element={<Home />} />
        <Route path="/about"       element={<About />} />
        <Route path="/login"       element={<Login />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/register"    element={<Register />} />
        <Route path="/shop"        element={<Shop />} />
        <Route path="/doctors"     element={<Doctors />} />
        <Route path="/firstaid"    element={<FirstAid />} />

        {/* Requires login */}
        <Route path="/cart"            element={<PrivateRoute><Cart /></PrivateRoute>} />
        <Route path="/checkout"        element={<PrivateRoute><Checkout /></PrivateRoute>} />
        <Route path="/doctors/:id"     element={<PrivateRoute><DoctorProfile /></PrivateRoute>} />
        <Route path="/chatbot"         element={<PrivateRoute><Chatbot /></PrivateRoute>} />
        <Route path="/sos"             element={<PrivateRoute><SOS /></PrivateRoute>} />
        <Route path="/scan"            element={<PrivateRoute><Scan /></PrivateRoute>} />
        <Route path="/profile"         element={<PrivateRoute><Profile /></PrivateRoute>} />
        <Route path="/my-activity"     element={<PrivateRoute><MyActivity /></PrivateRoute>} />
        <Route path="/change-password" element={<PrivateRoute><ChangePassword /></PrivateRoute>} />

        {/* Admin only */}
        <Route path="/admin" element={<AdminRoute><AdminPanel /></AdminRoute>} />

        <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </div>
        <Footer />
      </div>
    </BrowserRouter>
  )
}
