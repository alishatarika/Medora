import { useState, useRef, useEffect } from 'react'

export default function AddressAutocomplete({ value, onChange, hasError }) {
  const [query, setQuery]           = useState(value || '')
  const [suggestions, setSuggestions] = useState([])
  const [open, setOpen]             = useState(false)
  const debounceRef = useRef(null)
  const wrapperRef  = useRef(null)

  // Close dropdown on outside click
  useEffect(() => {
    const handler = (e) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target)) setOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  // Sync if parent resets value
  useEffect(() => { setQuery(value || '') }, [value])

  const handleInput = (e) => {
    const val = e.target.value
    setQuery(val)
    onChange(val)

    clearTimeout(debounceRef.current)
    if (val.length < 3) { setSuggestions([]); setOpen(false); return }

    debounceRef.current = setTimeout(async () => {
      try {
        const res = await fetch(
          `https://nominatim.openstreetmap.org/search?format=json&addressdetails=1&limit=6&q=${encodeURIComponent(val)}`,
          { headers: { 'Accept-Language': 'en' } }
        )
        const data = await res.json()
        setSuggestions(data)
        setOpen(data.length > 0)
      } catch {
        setSuggestions([])
      }
    }, 400)
  }

  const select = (item) => {
    const formatted = item.display_name
    setQuery(formatted)
    onChange(formatted)
    setSuggestions([])
    setOpen(false)
  }

  return (
    <div ref={wrapperRef} style={{ position: 'relative' }}>
      <div style={{ position: 'relative' }}>
        <input
          type="text"
          value={query}
          onChange={handleInput}
          onFocus={() => suggestions.length > 0 && setOpen(true)}
          placeholder="Start typing your address..."
          autoComplete="off"
          style={{
            width: '100%', padding: '11px 38px 11px 14px',
            background: '#1e1e1e', border: `1px solid ${hasError ? '#ef4444' : '#2a2a2a'}`,
            borderRadius: 10, color: '#e0e0e0', fontSize: 14,
            outline: 'none', boxSizing: 'border-box',
          }}
        />
        <span style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', fontSize: 16, pointerEvents: 'none' }}>
          📍
        </span>
      </div>

      {open && (
        <ul style={{
          position: 'absolute', top: 'calc(100% + 4px)', left: 0, right: 0,
          background: '#1e1e1e', border: '1px solid #2a2a2a', borderRadius: 10,
          listStyle: 'none', margin: 0, padding: '4px 0',
          zIndex: 999, maxHeight: 260, overflowY: 'auto',
          boxShadow: '0 8px 24px rgba(0,0,0,0.5)',
        }}>
          {suggestions.map((item) => (
            <li
              key={item.place_id}
              onMouseDown={() => select(item)}
              style={{
                padding: '10px 14px', cursor: 'pointer', fontSize: 13,
                color: '#ccc', borderBottom: '1px solid #2a2a2a',
                display: 'flex', gap: 10, alignItems: 'flex-start',
              }}
              onMouseEnter={e => e.currentTarget.style.background = '#2a2a2a'}
              onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
            >
              <span style={{ flexShrink: 0, marginTop: 1 }}>📍</span>
              <span style={{ lineHeight: 1.4 }}>{item.display_name}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
