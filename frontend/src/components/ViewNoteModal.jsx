import React from 'react';
import { X, Calendar, Pin, Edit3, Trash2 } from 'lucide-react';

const ViewNoteModal = ({ isOpen, onClose, note, onEdit, onDelete, onTogglePin }) => {
  if (!isOpen || !note) return null;

  const categoryClass = (note.category || 'Other').toLowerCase();

  return (
    <div className="modal-backdrop" onClick={onClose} role="dialog" aria-modal="true">
      <div
        className="modal-container"
        style={{ maxWidth: '640px' }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
            <span className={`category-badge ${categoryClass}`}>
              {note.category || 'Personal'}
            </span>
            {note.isPinned && (
              <span
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.3rem',
                  fontSize: '0.75rem',
                  color: 'var(--brand-primary)',
                  fontWeight: 600,
                }}
              >
                <Pin size={13} fill="currentColor" /> Pinned
              </span>
            )}
          </div>
          <button
            className="modal-close-btn"
            onClick={onClose}
            aria-label="Close note preview"
          >
            <X size={20} />
          </button>
        </div>

        <div className="modal-body" style={{ maxHeight: '65vh', overflowY: 'auto' }}>
          <h2 style={{ fontSize: '1.45rem', fontWeight: 800, color: 'var(--text-primary)', lineHeight: 1.3 }}>
            {note.title}
          </h2>

          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.4rem',
              color: 'var(--text-muted)',
              fontSize: '0.8rem',
            }}
          >
            <Calendar size={13} />
            <span>
              Updated {new Date(note.updatedAt || note.createdAt).toLocaleString()}
            </span>
          </div>

          <div
            style={{
              fontSize: '0.96rem',
              lineHeight: 1.7,
              color: 'var(--text-secondary)',
              whiteSpace: 'pre-wrap',
              wordBreak: 'break-word',
              paddingTop: '0.5rem',
            }}
          >
            {note.description}
          </div>
        </div>

        <div className="modal-footer" style={{ justifyContent: 'space-between' }}>
          <button
            type="button"
            className="btn-secondary"
            onClick={() => {
              onClose();
              onTogglePin(note._id);
            }}
          >
            <Pin size={15} />
            <span>{note.isPinned ? 'Unpin' : 'Pin to Top'}</span>
          </button>

          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button
              type="button"
              className="icon-btn delete"
              style={{ padding: '0.6rem 0.8rem', border: '1px solid var(--border-subtle)' }}
              onClick={() => {
                onClose();
                onDelete(note);
              }}
              title="Delete note"
            >
              <Trash2 size={16} />
            </button>
            <button
              type="button"
              className="btn-primary"
              onClick={() => {
                onClose();
                onEdit(note);
              }}
            >
              <Edit3 size={15} />
              <span>Edit Note</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ViewNoteModal;

