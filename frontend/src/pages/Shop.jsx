import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import api from '../services/api'

export default function Shop() {
  const [medicines, setMedicines] = useState([])
  const [query, setQuery] = useState('')
  const navigate = useNavigate()

  useEffect(() => {
    api.get(`/medicines/?query=${encodeURIComponent(query)}`)
      .then(r => setMedicines(r.data))
      .catch(() => toast.error('Failed to load medicines'))
  }, [query])

  const addToCart = (med) => {
    const cart = JSON.parse(localStorage.getItem('cart') || '{}')
    const existing = cart[med.id]
    cart[med.id] = { ...med, qty: (existing?.qty || 0) + 1 }
    localStorage.setItem('cart', JSON.stringify(cart))
    window.dispatchEvent(new Event('cart-updated'))  // instant navbar update
    toast.success(`${med.name} added to cart`)
  }

  return (
    <div className="container my-4">
      <h2 className="text-teal mb-3">💊 Online Pharmacy</h2>
      <input className="form-control mb-4" type="text" placeholder="Search medicines..."
        value={query} onChange={e => setQuery(e.target.value)} />

      <table className="table table-dark table-striped" id="medTable">
        <thead>
          <tr><th>Name</th><th>Category</th><th>Company</th><th>Price</th><th>Description</th><th>Action</th></tr>
        </thead>
        <tbody>
          {medicines.map(med => (
            <tr key={med.id}>
              <td>{med.name}</td>
              <td>{med.category}</td>
              <td>{med.company}</td>
              <td>₹{med.price}</td>
              <td>{med.description}</td>
              <td>
                <button className="btn btn-sm btn-primary" onClick={() => addToCart(med)}>
                  Add to Cart
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <button className="btn btn-warning mt-3 me-2" onClick={() => navigate('/cart')}>🛒 View Cart</button>
      <button className="btn btn-secondary mt-3" onClick={() => navigate('/')}>⬅ Back to Home</button>
    </div>
  )
}
