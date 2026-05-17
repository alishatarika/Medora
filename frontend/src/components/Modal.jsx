export default function Modal({ title, onClose, children }) {
  return (
    <div className="modal show d-block" style={{ background: 'rgba(0,0,0,0.7)' }}>
      <div className="modal-dialog modal-dialog-centered">
        <div className="modal-content bg-dark text-white border border-secondary">
          <div className="modal-header border-secondary">
            <h5 className="modal-title text-info">{title}</h5>
            <button className="btn-close btn-close-white" onClick={onClose} />
          </div>
          <div className="modal-body">{children}</div>
        </div>
      </div>
    </div>
  )
}
