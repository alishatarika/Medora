import { useEffect, useState } from 'react'
import { getAppointments, updateAppointmentStatus, deleteAppointment } from '../../services/adminService'

const STATUS_OPTIONS = ['Booked', 'Confirmed', 'Completed', 'Cancelled']

export default function AdminAppointments() {
  const [appts, setAppts] = useState([])

  const load = () => getAppointments().then(r => setAppts(r.data))
  useEffect(() => { load() }, [])

  const handleStatus = async (id, status) => {
    await updateAppointmentStatus(id, status); load()
  }

  const handleDelete = async (id) => {
    if (!confirm('Delete this appointment?')) return
    await deleteAppointment(id); load()
  }

  return (
    <div>
      <h5 className="text-info mb-3">Appointments</h5>
      <div className="table-responsive">
        <table className="table table-dark table-striped table-sm">
          <thead>
            <tr><th>#</th><th>Doctor</th><th>Patient</th><th>Date</th><th>Time</th><th>Status</th><th>Actions</th></tr>
          </thead>
          <tbody>
            {appts.map(a => (
              <tr key={a.id}>
                <td>{a.id}</td>
                <td>{a.doctor}</td>
                <td>{a.patient}</td>
                <td>{a.date}</td>
                <td>{a.time_slot}</td>
                <td>
                  <select className="form-select form-select-sm bg-secondary text-white border-0"
                    value={a.status} onChange={e => handleStatus(a.id, e.target.value)}>
                    {STATUS_OPTIONS.map(s => <option key={s}>{s}</option>)}
                  </select>
                </td>
                <td>
                  <button className="btn btn-sm btn-outline-danger" onClick={() => handleDelete(a.id)}>Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
