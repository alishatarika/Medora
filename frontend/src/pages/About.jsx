import { useNavigate } from 'react-router-dom'

const features = [
  { icon: 'fa-qrcode',            title: 'QR Scanner',         desc: 'Scan health-related QR codes for instant info.' },
  { icon: 'fa-bell',              title: 'SOS Alerts',         desc: 'Send emergency notifications instantly.' },
  { icon: 'fa-briefcase-medical', title: 'First Aid Guide',    desc: 'Learn life-saving first aid with animated videos.' },
  { icon: 'fa-pills',             title: 'Shop Medicines',     desc: 'Order prescribed medicines online quickly.' },
  { icon: 'fa-robot',             title: 'AI Chatbot',         desc: 'Get instant answers to health queries.' },
  { icon: 'fa-user-md',           title: 'Doctor Consultancy', desc: 'Consult with certified doctors online.' },
]

export default function About() {
  const navigate = useNavigate()
  return (
    <>
      <section className="text-center py-5">
        <h1 className="fw-bold text-teal mb-3">About Medora Health App</h1>
        <p className="lead">Your all-in-one digital healthcare companion. Scan, consult, order medicines, and stay informed—anytime, anywhere.</p>
      </section>

      <section className="container my-5">
        <div className="row g-4 text-center">
          <div className="col-md-6">
            <div className="p-4 bg-black rounded shadow-sm h-100">
              <i className="fas fa-bullseye fa-3x text-teal mb-3"></i>
              <h4>Our Mission</h4>
              <p>Empowering individuals with fast, reliable, and accessible digital healthcare solutions. We believe in saving lives by putting the right tools in your hands, anytime and anywhere.</p>
            </div>
          </div>
          <div className="col-md-6">
            <div className="p-4 bg-black rounded shadow-sm h-100">
              <i className="fas fa-eye fa-3x text-teal mb-3"></i>
              <h4>Our Vision</h4>
              <p>To revolutionize healthcare access by combining technology, education, and consultation into one seamless platform that enhances health and wellness globally.</p>
            </div>
          </div>
        </div>
      </section>

      <section className="container my-5">
        <h2 className="text-center text-teal mb-4">Key Features</h2>
        <div className="row g-4 text-center">
          {features.map(f => (
            <div className="col-md-4" key={f.title}>
              <div className="feature-card bg-black rounded shadow-sm p-4 h-100">
                <i className={`fas ${f.icon} fa-3x text-teal mb-3`}></i>
                <h5>{f.title}</h5>
                <p>{f.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="text-center my-5">
        <p className="mb-3">Ready to take control of your health?</p>
        <button className="btn btn-teal btn-lg" onClick={() => navigate('/')}>
          Get Started <i className="fas fa-arrow-right ms-2"></i>
        </button>
      </section>
    </>
  )
}
