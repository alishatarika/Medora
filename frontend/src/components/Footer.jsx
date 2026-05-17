import { Link } from 'react-router-dom'
export default function Footer() {
  return (
    <footer style={{ backgroundColor: '#000', color: '#ccc', marginTop: 'auto' }}>
      <div className="container py-4">
        <div className="row g-4">

          {/* Brand */}
          <div className="col-md-4">
            <h5 className="text-gradient fw-bold fs-4 mb-2">Medora</h5>
            <p style={{ fontSize: 14 }}>Your all-in-one digital healthcare companion. Scan, consult, shop, and stay informed with ease.</p>
          </div>

          {/* Quick Links */}
          <div className="col-md-4">
            <h6 className="text-white mb-3">Quick Links</h6>
            <ul className="list-unstyled" style={{ fontSize: 14 }}>
              {[
                ['/','Home'], ['/about','About'], ['/shop','Shop'],
                ['/doctors','Doctors'], ['/firstaid','First Aid'], ['/chatbot','AI Chat']
              ].map(([path, label]) => (
                <li key={path} className="mb-1">
                  <Link to={path} style={{ color: '#9ca3af', textDecoration: 'none' }}
                    onMouseEnter={e => e.target.style.color = '#14b8a6'}
                    onMouseLeave={e => e.target.style.color = '#9ca3af'}>
                    <i className="fas fa-chevron-right me-1" style={{ fontSize: 10 }}></i>{label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          

        </div>

        
      </div>
    </footer>
  )
}
