import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { getMedicines, createMedicine, updateMedicine, deleteMedicine } from '../../services/adminService'
import Modal from '../../components/Modal'
import { medicineSchema } from '../../validations/schemas'

export default function AdminMedicines() {
  const [medicines, setMedicines] = useState([])
  const [modal, setModal]         = useState(false)
  const [editId, setEditId]       = useState(null)
  const [msg, setMsg]             = useState('')

  const load = () => getMedicines().then(r => setMedicines(r.data))
  useEffect(() => { load() }, [])

  const { register, handleSubmit, reset, setFocus,
    formState: { errors, isSubmitting } } = useForm({
    resolver: zodResolver(medicineSchema),
    mode: 'onChange',
  })

  const openAdd = () => {
    reset({ name:'', category:'', company:'', price:0, description:'' })
    setEditId(null); setModal(true)
  }

  const openEdit = (m) => {
    reset({ name: m.name, category: m.category, company: m.company,
      price: m.price, description: m.description || '' })
    setEditId(m.id); setModal(true)
  }

  const onSubmit = async (data) => {
    if (editId) await updateMedicine(editId, data)
    else        await createMedicine(data)
    setModal(false); load()
    setMsg(editId ? 'Medicine updated.' : 'Medicine added.')
    setTimeout(() => setMsg(''), 3000)
  }

  const onError = (errs) => {
    const first = ['name','category','company','price'].find(f => errs[f])
    if (first) setFocus(first)
  }

  const handleDelete = async (id) => {
    if (!confirm('Delete this medicine?')) return
    await deleteMedicine(id); load()
  }

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h5 className="text-info mb-0">Medicines</h5>
        <button className="btn btn-sm btn-info" onClick={openAdd}>+ Add Medicine</button>
      </div>
      {msg && <div className="alert alert-success py-2">{msg}</div>}

      <div className="table-responsive">
        <table className="table table-dark table-striped table-sm">
          <thead><tr><th>Name</th><th>Category</th><th>Company</th><th>Price</th><th>Actions</th></tr></thead>
          <tbody>
            {medicines.map(m => (
              <tr key={m.id}>
                <td>{m.name}</td><td>{m.category}</td><td>{m.company}</td><td>₹{m.price}</td>
                <td>
                  <button className="btn btn-sm btn-outline-warning me-1" onClick={() => openEdit(m)}>Edit</button>
                  <button className="btn btn-sm btn-outline-danger" onClick={() => handleDelete(m.id)}>Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {modal && (
        <Modal title={editId ? 'Edit Medicine' : 'Add Medicine'} onClose={() => setModal(false)}>
          <form onSubmit={handleSubmit(onSubmit, onError)} noValidate>
            {[['name','Name'],['category','Category'],['company','Company'],['description','Description']].map(([f,l]) => (
              <div className="mb-2" key={f}>
                <label className="form-label">{l}</label>
                <input className={`form-control bg-secondary text-white border-0 ${errors[f] ? 'is-invalid' : ''}`}
                  {...register(f)} />
                {errors[f] && <div className="invalid-feedback">{errors[f].message}</div>}
              </div>
            ))}
            <div className="mb-2">
              <label className="form-label">Price (₹)</label>
              <input type="number" step="0.01"
                className={`form-control bg-secondary text-white border-0 ${errors.price ? 'is-invalid' : ''}`}
                {...register('price')} />
              {errors.price && <div className="invalid-feedback">{errors.price.message}</div>}
            </div>
            <button className="btn btn-info w-100 mt-2" disabled={isSubmitting}>
              {isSubmitting ? 'Saving...' : (editId ? 'Update' : 'Add') + ' Medicine'}
            </button>
          </form>
        </Modal>
      )}
    </div>
  )
}
