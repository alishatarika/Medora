import { useEffect, useState } from 'react'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useParams, useNavigate } from 'react-router-dom'
import api from '../services/api'
import { appointmentSchema } from '../validations/schemas'
import PhoneInput from '../components/PhoneInput'

const TIME_SLOTS = (() => {
  const slots = []
  for (let h = 8; h <= 22; h++) {
    for (const m of [0, 30]) {
      if (h === 22 && m === 30) break
      const ampm = h < 12 ? 'AM' : 'PM'
      const h12 = h > 12 ? h - 12 : h === 0 ? 12 : h
      slots.push(`${String(h12).padStart(2,'0')}:${String(m).padStart(2,'0')} ${ampm}`)
    }
  }
  return slots
})()

const today = new Date().toISOString().split('T')[0]

export default function DoctorProfile() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [doctor, setDoctor] = useState(null)
  const [serverError, setServerError] = useState('')
  const [success, setSuccess] = useState('')

  useEffect(() => { api.get(`/doctors/${id}`).then(r => setDoctor(r.data)) }, [id])

  const { register, handleSubmit, setFocus, control,
    formState: { errors, isSubmitting } } = useForm({
    resolver: zodResolver(appointmentSchema),
    defaultValues: { date: today, time_slot: TIME_SLOTS[0] },
    mode: 'onChange',
  })

  const onSubmit = async (data) => {
    setServerError('')
    try {
      await api.post(`/doctors/${id}/book`, data)
      setSuccess('✅ Appointment booked successfully!')
    } catch (err) {
      setServerError(err.response?.data?.detail || 'Booking failed.')
    }
  }

  const onError = (errs) => {
    const first = ['user_name','user_email','user_phone','date'].find(f => errs[f])
    if (first) setFocus(first)
  }

  if (!doctor) return <div className="text-center text-white mt-5">Loading...</div>

  return (
    <div className="container my-4">
      <h2 className="text-info mb-3">{doctor.name}</h2>
      <p>Specialty: {doctor.specialty}</p>
      <p>Location: {doctor.location}</p>
      <p>Experience: {doctor.experience} yrs</p>
      <p>Fee: ₹{doctor.fees}</p>

      <h3 className="mt-4">Book Appointment</h3>
      {success      && <div className="alert alert-success mt-3">{success}</div>}
      {serverError  && <div className="alert alert-danger mt-3">{serverError}</div>}

      <form onSubmit={handleSubmit(onSubmit, onError)} className="mt-3" noValidate>
        <div className="mb-3">
          <label className="form-label">Name</label>
          <input type="text" placeholder="Your Name"
            className={`form-control ${errors.user_name ? 'is-invalid' : ''}`}
            {...register('user_name')} />
          {errors.user_name && <div className="invalid-feedback">{errors.user_name.message}</div>}
        </div>

        <div className="mb-3">
          <label className="form-label">Email</label>
          <input type="email" placeholder="Your Email"
            className={`form-control ${errors.user_email ? 'is-invalid' : ''}`}
            {...register('user_email')} />
          {errors.user_email && <div className="invalid-feedback">{errors.user_email.message}</div>}
        </div>

        <div className="mb-3">
          <label className="form-label">Phone Number</label>
          <Controller name="user_phone" control={control}
            render={({ field }) => (
              <PhoneInput
                value={field.value}
                onChange={field.onChange}
                hasError={!!errors.user_phone}
                className={`form-control ${errors.user_phone ? 'is-invalid' : ''}`}
              />
            )} />
          {errors.user_phone && <div className="invalid-feedback d-block">{errors.user_phone.message}</div>}
        </div>

        <div className="mb-3">
          <label className="form-label">Date</label>
          <input type="date" min={today}
            className={`form-control ${errors.date ? 'is-invalid' : ''}`}
            {...register('date')} />
          {errors.date && <div className="invalid-feedback">{errors.date.message}</div>}
        </div>

        <div className="mb-3">
          <label className="form-label">Time Slot</label>
          <select className="form-select" {...register('time_slot')}>
            {TIME_SLOTS.map(s => <option key={s}>{s}</option>)}
          </select>
        </div>

        <button type="submit" className="btn btn-success mt-2 w-100" disabled={isSubmitting}>
          {isSubmitting ? 'Booking...' : 'Book Appointment'}
        </button>
      </form>

      <button className="btn btn-secondary mt-3" onClick={() => navigate('/doctors')}>⬅ Back to Doctors</button>
    </div>
  )
}