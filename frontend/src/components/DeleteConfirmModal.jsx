import React from 'react';
import { AlertTriangle, Trash2, X } from 'lucide-react';

const DeleteConfirmModal = ({ isOpen, onClose, onConfirm, noteTitle, isDeleting = false }) => {
  if (!isOpen) return null;

  return (
    <div className="modal-backdrop" onClick={onClose} role="dialog" aria-modal="true">
      <div
        className="modal-container"
        style={{ maxWidth: '440px' }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="modal-header">
          <div className="modal-title" style={{ color: 'var(--danger)' }}>
            <AlertTriangle size={20} />
            <span>Delete Note</span>
          </div>
          <button
            className="modal-close-btn"
            onClick={onClose}
            aria-label="Close dialog"
          >
            <X size={20} />
          </button>
        </div>

        <div className="modal-body" style={{ gap: '0.85rem' }}>
          <p style={{ fontSize: '0.95rem', color: 'var(--text-secondary)' }}>
            Are you sure you want to permanently delete this note? This action cannot be undone.
          </p>
          {noteTitle && (
            <div
              style={{
                padding: '0.75rem 1rem',
                backgroundColor: 'var(--bg-surface-hover)',
                borderRadius: 'var(--radius-md)',
                fontWeight: 600,
                fontSize: '0.9rem',
                color: 'var(--text-primary)',
                border: '1px solid var(--border-subtle)',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
              }}
            >
              "{noteTitle}"
            </div>
          )}
        </div>

        <div className="modal-footer">
          <button
            type="button"
            className="btn-secondary"
            onClick={onClose}
            disabled={isDeleting}
          >
            Cancel
          </button>
          <button
            type="button"
            className="btn-danger"
            onClick={onConfirm}
            disabled={isDeleting}
          >
            <Trash2 size={16} />
            <span>{isDeleting ? 'Deleting...' : 'Delete Note'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default DeleteConfirmModal;

