import api from './api'

// Doctors
export const getDoctors    = ()           => api.get('/admin/doctors')
export const createDoctor  = (data)       => api.post('/admin/doctors', data)
export const updateDoctor  = (id, data)   => api.put(`/admin/doctors/${id}`, data)
export const deleteDoctor  = (id)         => api.delete(`/admin/doctors/${id}`)

// Medicines
export const getMedicines   = ()          => api.get('/admin/medicines')
export const createMedicine = (data)      => api.post('/admin/medicines', data)
export const updateMedicine = (id, data)  => api.put(`/admin/medicines/${id}`, data)
export const deleteMedicine = (id)        => api.delete(`/admin/medicines/${id}`)

// Orders
export const getOrders    = ()   => api.get('/admin/orders')
export const deleteOrder  = (id) => api.delete(`/admin/orders/${id}`)

// Appointments
export const getAppointments          = ()             => api.get('/admin/appointments')
export const updateAppointmentStatus  = (id, status)   => api.put(`/admin/appointments/${id}/status?status=${status}`)
export const deleteAppointment        = (id)           => api.delete(`/admin/appointments/${id}`)

// Users
export const getUsers       = ()   => api.get('/admin/users')
export const toggleAdmin    = (id) => api.put(`/admin/users/${id}/toggle-admin`)
export const deleteUser     = (id) => api.delete(`/admin/users/${id}`)
