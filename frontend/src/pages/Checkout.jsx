import { useState } from 'react'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import api from '../services/api'
import { checkoutSchema } from '../validations/schemas'
import AddressAutocomplete from '../components/AddressAutocomplete'
import PhoneInput from '../components/PhoneInput'

export default function Checkout() {
  const navigate = useNavigate()
  const [serverError, setServerError] = useState('')

  const { register, handleSubmit, setFocus, control,
    formState: { errors, isSubmitting } } = useForm({
    resolver: zodResolver(checkoutSchema),
    mode: 'onChange',
  })

  const onSubmit = async (data) => {
    setServerError('')
    const cart = JSON.parse(localStorage.getItem('cart') || '{}')
    const items = Object.values(cart).map(m => ({ medicine_id: m.id, quantity: m.qty }))
    if (!items.length) return setServerError('Your cart is empty.')
    try {
      await api.post('/orders/', { ...data, items })
      localStorage.setItem('cart', '{}')
      toast.success('Order placed! Confirmation email sent.')
      navigate('/')
    } catch (err) {
      const msg = err.response?.data?.detail || 'Order failed.'
      setServerError(msg)
      toast.error(msg)
    }
  }

  const onError = (errs) => {
    const first = ['customer_name','address','phone','email'].find(f => errs[f])
    if (first) setFocus(first)
  }

  return (
    <div className="container my-4">
      <h2 className="mb-3">📝 Please fill the details to get your order</h2>
      {serverError && <div className="alert alert-danger">{serverError}</div>}

      <form onSubmit={handleSubmit(onSubmit, onError)} className="bg-secondary p-4 rounded" noValidate>
        <div className="mb-3">
          <label className="form-label">Full Name</label>
          <input type="text"
            className={`form-control ${errors.customer_name ? 'is-invalid' : ''}`}
            {...register('customer_name')} />
          {errors.customer_name && <div className="invalid-feedback">{errors.customer_name.message}</div>}
        </div>

        <div className="mb-3">
          <label className="form-label">Address</label>
          <Controller name="address" control={control}
            render={({ field }) => (
              <AddressAutocomplete value={field.value} onChange={field.onChange} hasError={!!errors.address} />
            )} />
          {errors.address && <div className="invalid-feedback d-block">{errors.address.message}</div>}
        </div>

        <div className="mb-3">
          <label className="form-label">Phone Number</label>
          <Controller name="phone" control={control}
            render={({ field }) => (
              <PhoneInput
                value={field.value}
                onChange={field.onChange}
                hasError={!!errors.phone}
                className={`form-control ${errors.phone ? 'is-invalid' : ''}`}
              />
            )} />
          {errors.phone && <div className="invalid-feedback d-block">{errors.phone.message}</div>}
        </div>

        <div className="mb-3">
          <label className="form-label">Email</label>
          <input type="email"
            className={`form-control ${errors.email ? 'is-invalid' : ''}`}
            {...register('email')} />
          {errors.email && <div className="invalid-feedback">{errors.email.message}</div>}
        </div>

        <button type="submit" className="btn btn-success" disabled={isSubmitting}>
          {isSubmitting ? 'Placing...' : '✅ Place Order'}
        </button>
        <button type="button" className="btn btn-secondary ms-2" onClick={() => navigate('/cart')}>
          ⬅ Back to Cart
        </button>
      </form>
    </div>
  )
}
