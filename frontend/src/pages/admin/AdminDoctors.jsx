import { useEffect, useState } from 'react'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { getDoctors, createDoctor, updateDoctor, deleteDoctor } from '../../services/adminService'
import Modal from '../../components/Modal'
import { doctorSchema } from '../../validations/schemas'
import AddressAutocomplete from '../../components/AddressAutocomplete'

export default function AdminDoctors() {
  const [doctors, setDoctors] = useState([])
  const [modal, setModal]     = useState(false)
  const [editId, setEditId]   = useState(null)
  const [msg, setMsg]         = useState('')

  const load = () => getDoctors().then(r => setDoctors(r.data))
  useEffect(() => { load() }, [])

  const { register, handleSubmit, reset, setFocus, control,
    formState: { errors, isSubmitting } } = useForm({
    resolver: zodResolver(doctorSchema),
    mode: 'onChange',
  })

  const openAdd = () => {
    reset({ name: '', specialty: '', location: '', experience: 0, fees: 0, description: '' })
    setEditId(null); setModal(true)
  }

  const openEdit = (doc) => {
    reset({ name: doc.name, specialty: doc.specialty, location: doc.location,
      experience: doc.experience, fees: doc.fees, description: doc.description || '' })
    setEditId(doc.id); setModal(true)
  }

  const onSubmit = async (data) => {
    if (editId) await updateDoctor(editId, data)
    else        await createDoctor(data)
    setModal(false); load()
    setMsg(editId ? 'Doctor updated.' : 'Doctor added.')
    setTimeout(() => setMsg(''), 3000)
  }

  const onError = (errs) => {
    const first = ['name', 'specialty', 'location', 'experience', 'fees'].find(f => errs[f])
    if (first) setFocus(first)
  }

  const handleDelete = async (id) => {
    if (!confirm('Delete this doctor?')) return
    await deleteDoctor(id); load()
  }

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h5 className="text-info mb-0">Doctors</h5>
        <button className="btn btn-sm btn-info" onClick={openAdd}>+ Add Doctor</button>
      </div>
      {msg && <div className="alert alert-success py-2">{msg}</div>}

      <div className="table-responsive">
        <table className="table table-dark table-striped table-sm">
          <thead>
            <tr><th>Name</th><th>Specialty</th><th>Location</th><th>Exp</th><th>Fees</th><th>Actions</th></tr>
          </thead>
          <tbody>
            {doctors.map(d => (
              <tr key={d.id}>
                <td>{d.name}</td><td>{d.specialty}</td><td>{d.location}</td>
                <td>{d.experience} yrs</td><td>₹{d.fees}</td>
                <td>
                  <button className="btn btn-sm btn-outline-warning me-1" onClick={() => openEdit(d)}>Edit</button>
                  <button className="btn btn-sm btn-outline-danger" onClick={() => handleDelete(d.id)}>Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {modal && (
        <Modal title={editId ? 'Edit Doctor' : 'Add Doctor'} onClose={() => setModal(false)}>
          <form onSubmit={handleSubmit(onSubmit, onError)} noValidate>

            {/* Name, Specialty, Description — plain inputs */}
            {[['name', 'Name'], ['specialty', 'Specialty'], ['description', 'Description']].map(([f, l]) => (
              <div className="mb-2" key={f}>
                <label className="form-label">{l}</label>
                <input
                  className={`form-control bg-secondary text-white border-0 ${errors[f] ? 'is-invalid' : ''}`}
                  {...register(f)}
                />
                {errors[f] && <div className="invalid-feedback">{errors[f].message}</div>}
              </div>
            ))}

            {/* Location via AddressAutocomplete */}
            <div className="mb-2">
              <label className="form-label">Location</label>
              <Controller name="location" control={control}
                render={({ field }) => (
                  <AddressAutocomplete
                    value={field.value}
                    onChange={field.onChange}
                    hasError={!!errors.location}
                  />
                )}
              />
              {errors.location && <div className="invalid-feedback d-block">{errors.location.message}</div>}
            </div>

            {/* Experience & Fees */}
            <div className="row">
              <div className="col mb-2">
                <label className="form-label">Experience (yrs)</label>
                <input type="number"
                  className={`form-control bg-secondary text-white border-0 ${errors.experience ? 'is-invalid' : ''}`}
                  {...register('experience')}
                />
                {errors.experience && <div className="invalid-feedback">{errors.experience.message}</div>}
              </div>
              <div className="col mb-2">
                <label className="form-label">Fees (₹)</label>
                <input type="number"
                  className={`form-control bg-secondary text-white border-0 ${errors.fees ? 'is-invalid' : ''}`}
                  {...register('fees')}
                />
                {errors.fees && <div className="invalid-feedback">{errors.fees.message}</div>}
              </div>
            </div>

            <button className="btn btn-info w-100 mt-2" disabled={isSubmitting}>
              {isSubmitting ? 'Saving...' : (editId ? 'Update' : 'Add') + ' Doctor'}
            </button>
          </form>
        </Modal>
      )}
    </div>
  )
}