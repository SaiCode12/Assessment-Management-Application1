import React from 'react';

const ConfirmModal = ({
  open, onConfirm, onCancel,
  icon, title, message,
  confirmLabel = 'Confirm', cancelLabel = 'Cancel',
  confirmClass = 'btn-danger',
}) => {
  if (!open) return null;
  return (
    <div className="modal-overlay" onClick={onCancel}>
      <div className="modal confirm-modal" onClick={e => e.stopPropagation()}>
        {icon && <div className="confirm-icon">{icon}</div>}
        <div className="confirm-title">{title}</div>
        <div className="confirm-msg">{message}</div>
        <div className="confirm-btns">
          <button className="btn btn-secondary" onClick={onCancel}>{cancelLabel}</button>
          <button className={`btn ${confirmClass}`} onClick={onConfirm}>{confirmLabel}</button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmModal;