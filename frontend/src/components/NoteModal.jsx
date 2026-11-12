import React, { useState, useEffect } from 'react';
import { X, Pin, Check, Sparkles } from 'lucide-react';

const CATEGORIES = ['Personal', 'College', 'Work', 'Other'];

const NoteModal = ({ isOpen, onClose, onSave, initialNote = null, isSaving = false }) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('Personal');
  const [isPinned, setIsPinned] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (initialNote) {
      setTitle(initialNote.title || '');
      setDescription(initialNote.description || '');
      setCategory(initialNote.category || 'Personal');
      setIsPinned(Boolean(initialNote.isPinned));
    } else {
      setTitle('');
      setDescription('');
      setCategory('Personal');
      setIsPinned(false);
    }
    setError('');
  }, [initialNote, isOpen]);

  // Handle Ctrl+Enter to submit, Esc to close
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (!isOpen) return;
      if (e.key === 'Escape') {
        onClose();
      } else if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
        handleSubmit(e);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, title, description, category, isPinned]);

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    if (e) e.preventDefault();
    if (!title.trim()) {
      setError('Please provide a title for the note');
      return;
    }
    if (!description.trim()) {
      setError('Please provide a description or body content for the note');
      return;
    }

    onSave({
      title: title.trim(),
      description: description.trim(),
      category,
      isPinned,
    });
  };

  return (
    <div className="modal-backdrop" onClick={onClose} role="dialog" aria-modal="true">
      <div
        className="modal-container"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="modal-header">
          <div className="modal-title">
            <Sparkles size={20} color="var(--brand-primary)" />
            <span>{initialNote ? 'Edit Note' : 'Create New Note'}</span>
          </div>
          <button
            className="modal-close-btn"
            onClick={onClose}
            aria-label="Close modal"
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            {error && (
              <div
                style={{
                  padding: '0.65rem 0.9rem',
                  backgroundColor: 'var(--danger-light)',
                  color: 'var(--danger)',
                  borderRadius: 'var(--radius-md)',
                  fontSize: '0.85rem',
                  fontWeight: 500,
                }}
              >
                {error}
              </div>
            )}

            <div className="form-group">
              <label className="form-label" htmlFor="note-title">
                Title
              </label>
              <input
                id="note-title"
                type="text"
                className="form-input"
                placeholder="e.g., Ideas for final year project..."
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                autoFocus
                maxLength={150}
              />
            </div>

            <div className="form-row">
              <div className="form-group" style={{ flex: 1 }}>
                <label className="form-label" htmlFor="note-category">
                  Category
                </label>
                <select
                  id="note-category"
                  className="form-select"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                >
                  {CATEGORIES.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group" style={{ alignSelf: 'flex-end' }}>
                <label className="pin-checkbox-label">
                  <input
                    type="checkbox"
                    checked={isPinned}
                    onChange={(e) => setIsPinned(e.target.checked)}
                    style={{ display: 'none' }}
                  />
                  <span className="custom-checkbox">
                    {isPinned && <Check size={14} strokeWidth={3} />}
                  </span>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                    <Pin size={16} />
                    <span>Pin note to top</span>
                  </span>
                </label>
              </div>
            </div>

            <div className="form-group">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <label className="form-label" htmlFor="note-description">
                  Description / Notes
                </label>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                  Press Ctrl + Enter to save
                </span>
              </div>
              <textarea
                id="note-description"
                className="form-textarea"
                placeholder="Write your thoughts, checklist, meeting summary, or code snippet here..."
                rows={6}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>
          </div>

          <div className="modal-footer">
            <button
              type="button"
              className="btn-secondary"
              onClick={onClose}
              disabled={isSaving}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn-primary"
              disabled={isSaving}
            >
              {isSaving ? 'Saving...' : initialNote ? 'Update Note' : 'Create Note'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default NoteModal;

