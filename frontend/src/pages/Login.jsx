import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useNavigate, Link } from 'react-router-dom'
import toast from 'react-hot-toast'
import { login } from '../services/authService'
import { loginSchema } from '../validations/schemas'

export default function Login() {
  const navigate = useNavigate()
  const [serverError, setServerError] = useState('')
  const [showPassword, setShowPassword] = useState(false)

  useEffect(() => {
    if (localStorage.getItem('token')) navigate('/', { replace: true })
  }, [navigate])

  const { register, handleSubmit, setFocus, formState: { errors, isSubmitting } } = useForm({
    resolver: zodResolver(loginSchema),
    mode: 'onChange',
  })

  const onSubmit = async (data) => {
    setServerError('')
    try {
      await login(data)
      navigate('/')
    } catch (err) {
      const detail = err.response?.data?.detail
      // Unverified account — OTP already resent by backend
      if (err.response?.status === 403 && detail?.code === 'unverified') {
        toast('Account not verified. OTP sent to your email.', { icon: '📧' })
        navigate('/register', { state: { step: 2, email: detail.email } })
        return
      }
      setServerError(typeof detail === 'string' ? detail : 'Login failed.')
    }
  }

  const onError = (errs) => {
    const first = ['identifier', 'password'].find(f => errs[f])
    if (first) setFocus(first)
  }

  return (
    <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '90vh', background: '#121212' }}>
      <div className="card bg-dark text-white p-4" style={{ width: '100%', maxWidth: 420 }}>
        <h3 className="text-info mb-4 text-center">Login to Medora</h3>

        {serverError && <div className="alert alert-danger py-2">{serverError}</div>}

        <form onSubmit={handleSubmit(onSubmit, onError)} noValidate>
          <div className="mb-3">
            <label className="form-label">Email or Name</label>
            <input type="text" placeholder="you@example.com or username"
              className={`form-control bg-secondary text-white border-0 ${errors.identifier ? 'is-invalid' : ''}`}
              {...register('identifier')} />
            {errors.identifier && <div className="invalid-feedback">{errors.identifier.message}</div>}
          </div>

          <div className="mb-3">
            <label className="form-label">Password</label>
            <div className="input-group">
              <input type={showPassword ? 'text' : 'password'} placeholder="••••••••"
                className={`form-control bg-secondary text-white border-0 ${errors.password ? 'is-invalid' : ''}`}
                {...register('password')} />
              <button type="button" className="btn btn-secondary"
                onClick={() => setShowPassword(p => !p)}>
                {showPassword ? 'Hide' : 'Show'}
              </button>
              {errors.password && <div className="invalid-feedback">{errors.password.message}</div>}
            </div>
          </div>

          <button className="btn btn-info w-100" disabled={isSubmitting}>
            {isSubmitting ? 'Logging in...' : 'Login'}
          </button>

          <Link to="/forgot-password" className="btn btn-outline-secondary w-100 mt-2">
            Forgot Password?
          </Link>
        </form>

        <p className="text-center mt-3 text-light">
      Donot have account? <Link to="/register" className="text-info">Register</Link>
</p>
      </div>
    </div>
  )
}
