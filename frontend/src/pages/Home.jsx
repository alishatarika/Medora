import { useNavigate } from 'react-router-dom'

const features = [
  { icon: 'fa-qrcode',            title: 'QR Scanner',         desc: 'Scan health-related QR codes seamlessly.',   path: '/scan' },
  { icon: 'fa-bell',              title: 'SOS Alerts',         desc: 'Send emergency alerts instantly.',           path: '/sos' },
  { icon: 'fa-briefcase-medical', title: 'First Aid Guide',    desc: 'Learn life-saving first aid with videos.',   path: '/firstaid' },
  { icon: 'fa-pills',             title: 'Shop Medicine',      desc: 'Order medicines online with ease.',          path: '/shop' },
  { icon: 'fa-robot',             title: 'AI Chatbot',         desc: 'Get instant answers to health queries.',     path: '/chatbot' },
  { icon: 'fa-user-md',           title: 'Doctor Consultancy', desc: 'Consult certified doctors online.',          path: '/doctors' },
]

export default function Home() {
  const navigate = useNavigate()

  return (
    <>
      {/* Hero */}
      <section className="text-center my-5">
        <h1 className="fw-bold text-teal mb-3">Welcome to Medora</h1>
        <p className="lead">Your all-in-one digital healthcare companion. Scan, consult, shop, and stay informed with ease.</p>
      </section>

      {/* Features */}
      <main className="container my-5">
        <section className="row g-4">
          {features.map(f => (
            <div className="col-md-4" key={f.title}>
              <div className="feature-block bg-black text-center p-4 rounded shadow-sm"
                onClick={() => navigate(f.path)}>
                <i className={`fas ${f.icon} fa-3x mb-3 text-teal`}></i>
                <h5>{f.title}</h5>
                <p>{f.desc}</p>
              </div>
            </div>
          ))}
        </section>

        {/* Health Reels */}
        <section className="mt-5">
          <h4 className="text-center text-teal mb-4">Health Reels &amp; Tips</h4>
          <div className="row g-4">
            <div className="col-md-6">
              <div className="reel bg-black text-white p-3 rounded shadow-sm">
                <video className="w-100 rounded" controls
                  onPlay={e => document.querySelectorAll('video').forEach(v => v !== e.target && v.pause())}>
                  <source src="/static/videos/drinking water benefits.mp4" type="video/mp4" />
                </video>
                <p className="mt-2">Stay hydrated! Learn the benefits of drinking water.</p>
              </div>
            </div>
            <div className="col-md-6">
              <div className="reel bg-black text-white p-3 rounded shadow-sm">
                <video className="w-100 rounded" controls
                  onPlay={e => document.querySelectorAll('video').forEach(v => v !== e.target && v.pause())}>
                  <source src="/static/videos/health tip.mp4" type="video/mp4" />
                </video>
                <p className="mt-2">Types of Workout - Why is it important to workout?</p>
              </div>
            </div>
          </div>
        </section>
      </main>
    </>
  )
}
