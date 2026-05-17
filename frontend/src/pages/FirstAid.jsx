const VIDEOS = [
  { title: 'Basic Life Support',                    src: '/static/videos/Basic Life Support - Animated.mp4' },
  { title: 'Allergies Prevention',                  src: '/static/videos/Allergies - Animated.mp4' },
  { title: 'Bleeding Control',                      src: '/static/videos/Bleeding - Animated.mp4' },
  { title: 'Choking Help',                          src: '/static/videos/choking.mp4' },
  { title: 'Burns and Scalds Treatment',            src: '/static/videos/Burns and Scalds - Animated (1).mp4' },
  { title: 'Head Injuries',                         src: '/static/videos/Head Injuries - Animated.mp4' },
  { title: 'Bites and Stings First Aid',            src: '/static/videos/Bites and Stings - Animated (1).mp4' },
  { title: 'Bone, Muscle and Joint Injuries',       src: '/static/videos/Bone, Muscle and Joint Injuries - Animated.mp4' },
  { title: 'Chest Pain Prevention',                 src: '/static/videos/chestpain.mp4' },
  { title: 'Asthma Help',                           src: '/static/videos/Asthma.mp4' },
]

const pauseOthers = (current) => {
  document.querySelectorAll('video').forEach(v => { if (v !== current) v.pause() })
}

export default function FirstAid() {
  return (
    <>
      <div className="container" style={{ textAlign: 'center', margin: '40px auto 20px' }}>
        <h2 style={{ fontWeight: 'bold', color: '#14b8a6' }}>🩺 Animated First Aid Videos</h2>
        <p style={{ color: '#14b8a6', fontSize: '1.1rem' }}>Learn life-saving first aid with short, easy-to-follow animated guides.</p>
      </div>

      <div className="container">
        <div className="row">
          {VIDEOS.map(v => (
            <div className="col-md-6 col-lg-4 mb-4" key={v.title}>
              <div className="card shadow-sm h-100" style={{ border: 'none', borderRadius: 15, overflow: 'hidden', background: '#121212', transition: 'transform 0.2s' }}
                onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-5px)'}
                onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}>
                <div className="card-body">
                  <h5 style={{ fontWeight: 600, textAlign: 'center', color: '#14b8a6', marginBottom: 10 }}>{v.title}</h5>
                  <video controls preload="none"
                    style={{ width: '100%', height: 220, objectFit: 'cover', borderRadius: 10 }}
                    onPlay={e => pauseOthers(e.target)}>
                    <source src={v.src} type="video/mp4" />
                    Your browser does not support HTML5 video.
                  </video>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  )
}
