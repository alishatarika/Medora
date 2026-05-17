export default function FieldError({ msg }) {
  if (!msg) return null
  return <div style={{ color: '#ff6b6b', fontSize: '0.85em', marginTop: 4 }}>⚠️ {msg}</div>
}
