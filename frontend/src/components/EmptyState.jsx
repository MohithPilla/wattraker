import React from 'react';
import { FileQuestion, Plus, Search } from 'lucide-react';

const EmptyState = ({ isSearch, activeFilter, onAddNote, onClearSearch }) => {
  if (isSearch) {
    return (
      <div className="empty-state">
        <div className="empty-icon-wrap">
          <Search size={32} />
        </div>
        <h3 className="empty-title">No matching notes found</h3>
        <p className="empty-description">
          We couldn't find any notes matching your search keywords. Try adjusting your query or filters.
        </p>
        <button className="btn-secondary" onClick={onClearSearch}>
          Clear search query
        </button>
      </div>
    );
  }

  return (
    <div className="empty-state">
      <div className="empty-icon-wrap">
        <FileQuestion size={32} />
      </div>
      <h3 className="empty-title">
        {activeFilter === 'Pinned'
          ? 'No pinned notes yet'
          : activeFilter !== 'All'
          ? `No notes in "${activeFilter}"`
          : 'Your workspace is empty'}
      </h3>
      <p className="empty-description">
        {activeFilter === 'Pinned'
          ? 'Pin important notes so they stay conveniently pinned at the top of your workspace.'
          : 'Capture your thoughts, ideas, work projects, or college lecture notes anytime.'}
      </p>
      <button className="btn-primary" onClick={onAddNote}>
        <Plus size={18} />
        <span>Create your first note</span>
      </button>
    </div>
  );
};

export default EmptyState;

