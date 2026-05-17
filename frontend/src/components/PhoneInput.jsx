import { useState } from 'react'

const COUNTRIES = [
  { code: 'IN', dial: '+91',  flag: '🇮🇳', name: 'India',          digits: 10 },
  { code: 'US', dial: '+1',   flag: '🇺🇸', name: 'USA',            digits: 10 },
  { code: 'GB', dial: '+44',  flag: '🇬🇧', name: 'UK',             digits: 10 },
  { code: 'AE', dial: '+971', flag: '🇦🇪', name: 'UAE',            digits: 9  },
  { code: 'SA', dial: '+966', flag: '🇸🇦', name: 'Saudi Arabia',   digits: 9  },
  { code: 'AU', dial: '+61',  flag: '🇦🇺', name: 'Australia',      digits: 9  },
  { code: 'CA', dial: '+1',   flag: '🇨🇦', name: 'Canada',         digits: 10 },
  { code: 'SG', dial: '+65',  flag: '🇸🇬', name: 'Singapore',      digits: 8  },
  { code: 'PK', dial: '+92',  flag: '🇵🇰', name: 'Pakistan',       digits: 10 },
  { code: 'BD', dial: '+880', flag: '🇧🇩', name: 'Bangladesh',     digits: 10 },
  { code: 'NP', dial: '+977', flag: '🇳🇵', name: 'Nepal',          digits: 10 },
  { code: 'LK', dial: '+94',  flag: '🇱🇰', name: 'Sri Lanka',      digits: 9  },
  { code: 'DE', dial: '+49',  flag: '🇩🇪', name: 'Germany',        digits: 11 },
  { code: 'FR', dial: '+33',  flag: '🇫🇷', name: 'France',         digits: 9  },
  { code: 'JP', dial: '+81',  flag: '🇯🇵', name: 'Japan',          digits: 10 },
  { code: 'CN', dial: '+86',  flag: '🇨🇳', name: 'China',          digits: 11 },
]

export default function PhoneInput({ value = '', onChange, hasError, className = '' }) {
  // value is stored as full string e.g. "+91 9876543210"
  const parseValue = (v) => {
    const country = COUNTRIES.find(c => v.startsWith(c.dial + ' ')) || COUNTRIES[0]
    const number  = v.startsWith(country.dial) ? v.slice(country.dial.length).trim() : v
    return { country, number }
  }

  const { country: initCountry, number: initNumber } = parseValue(value)
  const [selected, setSelected] = useState(initCountry)
  const [number, setNumber]     = useState(initNumber)
  const [open, setOpen]         = useState(false)

  const emit = (dial, num) => onChange(`${dial} ${num}`)

  const handleSelect = (c) => {
    setSelected(c)
    setOpen(false)
    emit(c.dial, number)
  }

  const handleNumber = (e) => {
    const raw = e.target.value.replace(/\D/g, '').slice(0, selected.digits)
    setNumber(raw)
    emit(selected.dial, raw)
  }

  const borderColor = hasError ? '#dc3545' : '#495057'

  return (
    <div style={{ display: 'flex', position: 'relative' }}>
      {/* Country selector */}
      <button type="button" onClick={() => setOpen(o => !o)}
        style={{
          display: 'flex', alignItems: 'center', gap: 6,
          padding: '6px 10px', background: '#3a3a3a',
          border: `1px solid ${borderColor}`, borderRight: 'none',
          borderRadius: '4px 0 0 4px', cursor: 'pointer',
          color: '#fff', fontSize: 14, whiteSpace: 'nowrap', flexShrink: 0,
        }}>
        <span>{selected.flag}</span>
        <span>{selected.dial}</span>
        <span style={{ fontSize: 10, color: '#aaa' }}>▼</span>
      </button>

      {/* Number input */}
      <input
        type="tel"
        value={number}
        onChange={handleNumber}
        placeholder={`${selected.digits}-digit number`}
        className={className}
        style={{ borderRadius: '0 4px 4px 0', flex: 1 }}
      />

      {/* Dropdown */}
      {open && (
        <ul style={{
          position: 'absolute', top: '100%', left: 0, zIndex: 1000,
          background: '#2a2a2a', border: '1px solid #444', borderRadius: 6,
          listStyle: 'none', margin: 0, padding: '4px 0',
          maxHeight: 240, overflowY: 'auto', minWidth: 220,
          boxShadow: '0 8px 24px rgba(0,0,0,0.5)',
        }}>
          {COUNTRIES.map(c => (
            <li key={c.code} onMouseDown={() => handleSelect(c)}
              style={{
                padding: '8px 14px', cursor: 'pointer', fontSize: 13,
                color: selected.code === c.code ? '#00bcd4' : '#ccc',
                background: selected.code === c.code ? 'rgba(0,188,212,0.1)' : 'transparent',
                display: 'flex', gap: 10, alignItems: 'center',
              }}
              onMouseEnter={e => e.currentTarget.style.background = '#3a3a3a'}
              onMouseLeave={e => e.currentTarget.style.background = selected.code === c.code ? 'rgba(0,188,212,0.1)' : 'transparent'}
            >
              <span>{c.flag}</span>
              <span style={{ flex: 1 }}>{c.name}</span>
              <span style={{ color: '#888' }}>{c.dial}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
