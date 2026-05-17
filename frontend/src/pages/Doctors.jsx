import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../services/api'

export default function Doctors() {
  const [doctors, setDoctors] = useState([])
  const [query, setQuery] = useState('')
  const navigate = useNavigate()

  useEffect(() => {
    api.get(`/doctors/?query=${encodeURIComponent(query)}`).then(r => setDoctors(r.data))
  }, [query])

  return (
    <div className="container my-4">
      <h2 className="text-info mb-3">👨‍⚕️ Online Doctor Consultancy</h2>
      <input className="form-control mb-4" type="text" placeholder="Search doctors..."
        value={query} onChange={e => setQuery(e.target.value)} />

      <table className="table table-dark table-striped" id="docTable">
        <thead>
          <tr><th>Name</th><th>Specialty</th><th>Location</th><th>Experience</th><th>Fees</th><th>Action</th></tr>
        </thead>
        <tbody>
          {doctors.map(doc => (
            <tr key={doc.id}>
              <td>
                <strong>{doc.name}</strong><br />
                <small className="text-muted">
                  {doc.description ? doc.description.slice(0, 100) + (doc.description.length > 100 ? '...' : '') : ''}
                </small>
              </td>
              <td>{doc.specialty}</td>
              <td>{doc.location}</td>
              <td>{doc.experience} yrs</td>
              <td>₹{doc.fees}</td>
              <td>
                <button className="btn btn-sm btn-info" onClick={() => navigate(`/doctors/${doc.id}`)}>
                  View &amp; Book
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <button className="btn btn-secondary mt-3" onClick={() => navigate('/')}>⬅ Back to Home</button>
    </div>
  )
}
