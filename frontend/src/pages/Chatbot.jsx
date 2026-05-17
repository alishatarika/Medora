import { useState, useRef, useEffect } from 'react'
import toast from 'react-hot-toast'
import api from '../services/api'

export default function Chatbot() {
  const [messages, setMessages] = useState([
    { role: 'bot', text: '👋 Hello! I\'m your AI Doctor. Please describe your symptoms and I\'ll ask some questions to better understand your condition.' }
  ])
  const [query, setQuery] = useState('')
  const [loading, setLoading] = useState(false)
  const bottomRef = useRef(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!query.trim()) return
    const userMsg = query.trim()
    setMessages(m => [...m, { role: 'user', text: userMsg }])
    setQuery('')
    setLoading(true)
    try {
      const res = await api.post('/chatbot/', { query: userMsg })
      setMessages(m => [...m, { role: 'bot', text: res.data.response }])
    } catch (err) {
      const msg = err.response?.status === 401
        ? '⚠️ Please log in to use the AI chatbot.'
        : '⚠️ Error contacting AI. Make sure Ollama is running.'
      setMessages(m => [...m, { role: 'bot', text: msg }])
    } finally {
      setLoading(false)
    }
  }

  const handleClear = async () => {
    try {
      await api.post('/chatbot/clear')
      setMessages([
        { role: 'bot', text: '👋 Hello! I\'m your AI Doctor. Please describe your symptoms and I\'ll ask some questions to better understand your condition.' }
      ])
      toast.success('Conversation cleared.')
    } catch {
      toast.error('Failed to clear conversation.')
    }
  }

  return (
    <div style={{ minHeight: '100vh', background: 'radial-gradient(circle at top, #1b1b1b, #0d0d0d)', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
      <div className="chat-container">

        <div className="chat-header text-center mb-3">
          <h2 style={{ color: '#14b8a6', fontWeight: 700, letterSpacing: 1 }}>Doctor AI Chatbot</h2>
          <p style={{ color: '#9be3d6', fontSize: '0.95rem' }}>Your friendly health assistant 🤖</p>
        </div>

        <div className="chat-messages">
          {messages.map((m, i) => (
            <div key={i} className={`chat-message ${m.role}`}
              style={{ whiteSpace: 'pre-wrap', lineHeight: 1.6 }}>
              {m.text}
            </div>
          ))}
          {loading && (
            <div className="chat-message bot" style={{ fontStyle: 'italic', opacity: 0.7 }}>
              Doctor is thinking...
            </div>
          )}
          <div ref={bottomRef} />
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', gap: 8, marginTop: 8 }}>
          <input
            type="text"
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Describe your symptoms..."
            disabled={loading}
            style={{
              flex: 1, padding: '12px 15px',
              border: '2px solid #14b8a6', borderRadius: 10,
              background: 'rgba(255,255,255,0.1)', color: '#e0e0e0',
              fontSize: '1rem', outline: 'none'
            }}
          />
          <button type="submit" disabled={loading}
            style={{ padding: '12px 18px', borderRadius: 10, border: 'none', background: '#14b8a6', color: '#fff', fontWeight: 600, cursor: 'pointer' }}>
            Send
          </button>
        </form>

        <button onClick={handleClear}
          style={{ marginTop: 10, width: '100%', padding: 8, borderRadius: 8, border: '1px solid #444', background: 'transparent', color: '#888', cursor: 'pointer', fontSize: 13 }}>
          🔄 New Conversation
        </button>

      </div>
    </div>
  )
}
