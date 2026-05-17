import { useEffect, useState } from 'react'
import { getOrders, deleteOrder } from '../../services/adminService'

export default function AdminOrders() {
  const [orders, setOrders]   = useState([])
  const [expand, setExpand]   = useState(null)

  const load = () => getOrders().then(r => setOrders(r.data))
  useEffect(() => { load() }, [])

  const handleDelete = async (id) => {
    if (!confirm('Delete this order?')) return
    await deleteOrder(id); load()
  }

  return (
    <div>
      <h5 className="text-info mb-3">Orders</h5>
      <div className="table-responsive">
        <table className="table table-dark table-striped table-sm">
          <thead>
            <tr><th>#</th><th>Customer</th><th>Phone</th><th>Total</th><th>Date</th><th>Actions</th></tr>
          </thead>
          <tbody>
            {orders.map(o => (
              <>
                <tr key={o.id}>
                  <td>{o.id}</td>
                  <td>{o.customer_name}</td>
                  <td>{o.phone}</td>
                  <td>₹{o.total}</td>
                  <td>{o.order_date?.slice(0,10)}</td>
                  <td>
                    <button className="btn btn-sm btn-outline-info me-1"
                      onClick={() => setExpand(expand === o.id ? null : o.id)}>
                      {expand === o.id ? 'Hide' : 'Items'}
                    </button>
                    <button className="btn btn-sm btn-outline-danger" onClick={() => handleDelete(o.id)}>Delete</button>
                  </td>
                </tr>
                {expand === o.id && (
                  <tr key={`exp-${o.id}`}>
                    <td colSpan={6} className="bg-black">
                      <small>
                        {o.items.map((it, i) => (
                          <span key={i} className="me-3">{it.name} × {it.qty} = ₹{it.subtotal}</span>
                        ))}
                      </small>
                    </td>
                  </tr>
                )}
              </>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
