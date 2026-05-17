import { useEffect, useState } from 'react'
import { getUsers, toggleAdmin, deleteUser } from '../../services/adminService'

export default function AdminUsers() {
  const [users, setUsers] = useState([])
  const me = JSON.parse(localStorage.getItem('user') || '{}')

  const load = () => getUsers().then(r => setUsers(r.data))
  useEffect(() => { load() }, [])

  const handleToggle = async (id) => {
    await toggleAdmin(id); load()
  }

  const handleDelete = async (id) => {
    if (!confirm('Delete this user?')) return
    await deleteUser(id); load()
  }

  return (
    <div>
      <h5 className="text-info mb-3">Users</h5>
      <div className="table-responsive">
        <table className="table table-dark table-striped table-sm">
          <thead>
            <tr><th>#</th><th>Name</th><th>Email</th><th>Phone</th><th>Admin</th><th>Actions</th></tr>
          </thead>
          <tbody>
            {users.map(u => (
              <tr key={u.id}>
                <td>{u.id}</td>
                <td>{u.name}</td>
                <td>{u.email}</td>
                <td>{u.phone || '—'}</td>
                <td>
                  <span className={`badge ${u.is_admin ? 'bg-success' : 'bg-secondary'}`}>
                    {u.is_admin ? 'Admin' : 'User'}
                  </span>
                </td>
                <td>
                  {u.id !== me.id && (
                    <>
                      <button className="btn btn-sm btn-outline-warning me-1"
                        onClick={() => handleToggle(u.id)}>
                        {u.is_admin ? 'Revoke Admin' : 'Make Admin'}
                      </button>
                      <button className="btn btn-sm btn-outline-danger"
                        onClick={() => handleDelete(u.id)}>Delete</button>
                    </>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
