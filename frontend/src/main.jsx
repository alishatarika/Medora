import React from 'react'
import ReactDOM from 'react-dom/client'
import { Toaster } from 'react-hot-toast'
import App from './App'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <Toaster
      position="top-right"
      toastOptions={{
        style: { background: '#1f1f1f', color: '#fff', border: '1px solid #14b8a6' },
        success: { iconTheme: { primary: '#14b8a6', secondary: '#fff' } },
        error:   { iconTheme: { primary: '#ff4444', secondary: '#fff' } },
        duration: 3500,
      }}
    />
    <App />
  </React.StrictMode>
)
