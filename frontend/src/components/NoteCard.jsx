import React from 'react';
import { Pin, Edit3, Trash2, Calendar } from 'lucide-react';

const NoteCard = ({ note, onEdit, onDelete, onTogglePin, onView }) => {
  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const categoryClass = (note.category || 'Other').toLowerCase();

  return (
    <article
      className={`note-card ${note.isPinned ? 'pinned' : ''}`}
      onClick={() => onView(note)}
      style={{ cursor: 'pointer' }}
    >
      <div className="note-card-header">
        <h3 className="note-title">{note.title}</h3>
        <button
          className={`pin-action-btn ${note.isPinned ? 'active' : ''}`}
          onClick={(e) => {
            e.stopPropagation();
            onTogglePin(note._id);
          }}
          title={note.isPinned ? 'Unpin note' : 'Pin note to top'}
          aria-label={note.isPinned ? 'Unpin note' : 'Pin note'}
        >
          <Pin
            size={17}
            fill={note.isPinned ? 'currentColor' : 'none'}
            style={{
              transform: note.isPinned ? 'rotate(35deg)' : 'none',
              transition: 'transform 0.2s ease',
            }}
          />
        </button>
      </div>

      <p className="note-description">{note.description}</p>

      <div className="note-card-footer">
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
          <span className={`category-badge ${categoryClass}`}>
            {note.category || 'Personal'}
          </span>
          <span className="note-date" title={`Last updated: ${new Date(note.updatedAt).toLocaleString()}`}>
            <Calendar size={12} />
            {formatDate(note.updatedAt || note.createdAt)}
          </span>
        </div>

        <div className="card-action-btns">
          <button
            className="icon-btn edit"
            onClick={(e) => {
              e.stopPropagation();
              onEdit(note);
            }}
            title="Edit note"
            aria-label="Edit note"
          >
            <Edit3 size={16} />
          </button>
          <button
            className="icon-btn delete"
            onClick={(e) => {
              e.stopPropagation();
              onDelete(note);
            }}
            title="Delete note"
            aria-label="Delete note"
          >
            <Trash2 size={16} />
          </button>
        </div>
      </div>
    </article>
  );
};

export default NoteCard;

