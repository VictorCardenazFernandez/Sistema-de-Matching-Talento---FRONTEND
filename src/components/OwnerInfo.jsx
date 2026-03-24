import './OwnerInfo.css'

export default function OwnerInfo({ ownerInfo }) {
  if (!ownerInfo) return null

  return (
    <div className="owner-info">
      <h2 className="owner-info__title">Información del titular</h2>

      <div className="form-grid">
        <div className="form-field">
          <label className="form-label">Nombre del titular</label>
          <input className="form-input owner-info__input" disabled
            value={`${ownerInfo.owner_first_name || ''} ${ownerInfo.owner_last_name || ''}`.trim()} />
        </div>
        <div className="form-field">
          <label className="form-label">Teléfono de contacto</label>
          <input className="form-input owner-info__input" disabled
            value={ownerInfo.contact_phone || ''} />
        </div>
      </div>

      <div className="form-grid">
        <div className="form-field">
          <label className="form-label">RUC</label>
          <input className="form-input owner-info__input" disabled
            value={ownerInfo.ruc || ''} />
        </div>
        <div className="form-field">
          <label className="form-label">Razón social</label>
          <input className="form-input owner-info__input" disabled
            value={ownerInfo.razon_social || ''} />
        </div>
      </div>

      <div className="form-grid">
        <div className="form-field">
          <label className="form-label">Tipo de empresa</label>
          <input className="form-input owner-info__input" disabled
            value={ownerInfo.company_type || ''} />
        </div>
        <div className="form-field">
          <label className="form-label">Estado</label>
          <div className={`owner-info__status owner-info__status--${ownerInfo.status}`}>
            {ownerInfo.status === 'accepted' ? '✓ Aprobada'
              : ownerInfo.status === 'pending' ? '⏳ En revisión'
                : ownerInfo.status === 'rejected' ? '✗ Rechazada'
                  : ownerInfo.status}
          </div>
        </div>
      </div>

      <p className="owner-info__note">
        Para modificar estos datos contacta a soporte.
      </p>
    </div>
  )
}