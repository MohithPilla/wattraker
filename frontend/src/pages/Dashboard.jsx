import React, { useState, useEffect, useMemo, useCallback } from 'react';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import NoteCard from '../components/NoteCard';
import NoteModal from '../components/NoteModal';
import DeleteConfirmModal from '../components/DeleteConfirmModal';
import ViewNoteModal from '../components/ViewNoteModal';
import EmptyState from '../components/EmptyState';
import { notesApi } from '../api/notesApi';
import { useToast } from '../context/ToastContext';
import { Pin, Sparkles, Loader2, Search, X } from 'lucide-react';

const FILTER_PILLS = ['All', 'Pinned', 'Personal', 'College', 'Work', 'Other'];

const Dashboard = () => {
  const toast = useToast();

  const [notes, setNotes] = useState([]);
  const [categoryCounts, setCategoryCounts] = useState({
    all: 0,
    pinned: 0,
    Personal: 0,
    College: 0,
    Work: 0,
    Other: 0,
  });
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Modals state
  const [noteModalOpen, setNoteModalOpen] = useState(false);
  const [editingNote, setEditingNote] = useState(null);
  const [isSaving, setIsSaving] = useState(false);

  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [deletingNote, setDeletingNote] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [viewingNote, setViewingNote] = useState(null);

  // Fetch notes from server
  const fetchNotes = useCallback(async () => {
    try {
      setLoading(true);
      const params = {};
      if (activeFilter === 'Pinned') {
        params.pinned = 'true';
      } else if (activeFilter !== 'All') {
        params.category = activeFilter;
      }
      if (searchQuery.trim()) {
        params.search = searchQuery.trim();
      }

      const res = await notesApi.getNotes(params);
      if (res.success) {
        setNotes(res.notes || []);
        if (res.categoryCounts) {
          setCategoryCounts(res.categoryCounts);
        }
      }
    } catch (err) {
      console.error('Error fetching notes:', err);
      toast.error(err.message || 'Failed to load notes');
    } finally {
      setLoading(false);
    }
  }, [activeFilter, searchQuery, toast]);

  // Debounce search / fetch on filter changes
  useEffect(() => {
    const handler = setTimeout(() => {
      fetchNotes();
    }, 250);

    return () => clearTimeout(handler);
  }, [fetchNotes]);

  // Split into pinned and other notes when viewing All notes
  const { pinnedNotes, otherNotes } = useMemo(() => {
    if (activeFilter === 'Pinned') {
      return { pinnedNotes: notes, otherNotes: [] };
    }
    const pinned = [];
    const others = [];
    notes.forEach((n) => {
      if (n.isPinned) pinned.push(n);
      else others.push(n);
    });
    return { pinnedNotes: pinned, otherNotes: others };
  }, [notes, activeFilter]);

  // Create or Update Note handler
  const handleSaveNote = async (noteData) => {
    try {
      setIsSaving(true);
      if (editingNote) {
        // Update existing note
        const res = await notesApi.updateNote(editingNote._id, noteData);
        if (res.success) {
          toast.success('Note updated successfully!');
          setNoteModalOpen(false);
          setEditingNote(null);
          fetchNotes();
        }
      } else {
        // Create new note
        const res = await notesApi.createNote(noteData);
        if (res.success) {
          toast.success('New note added successfully!');
          setNoteModalOpen(false);
          fetchNotes();
        }
      }
    } catch (err) {
      toast.error(err.message || 'Failed to save note');
    } finally {
      setIsSaving(false);
    }
  };

  // Toggle Pin status
  const handleTogglePin = async (id) => {
    try {
      const res = await notesApi.togglePin(id);
      if (res.success) {
        toast.info(res.note.isPinned ? 'Note pinned to top' : 'Note unpinned');
        fetchNotes();
      }
    } catch (err) {
      toast.error(err.message || 'Failed to update pin status');
    }
  };

  // Delete note confirmed
  const handleConfirmDelete = async () => {
    if (!deletingNote) return;
    try {
      setIsDeleting(true);
      const res = await notesApi.deleteNote(deletingNote._id);
      if (res.success) {
        toast.success('Note deleted successfully');
        setDeleteModalOpen(false);
        setDeletingNote(null);
        fetchNotes();
      }
    } catch (err) {
      toast.error(err.message || 'Failed to delete note');
    } finally {
      setIsDeleting(false);
    }
  };

  // Open Edit modal
  const handleOpenEdit = (note) => {
    setEditingNote(note);
    setNoteModalOpen(true);
  };

  // Open Delete confirmation modal
  const handleOpenDelete = (note) => {
    setDeletingNote(note);
    setDeleteModalOpen(true);
  };

  // Open Preview reader modal
  const handleOpenView = (note) => {
    setViewingNote(note);
    setViewModalOpen(true);
  };

  return (
    <div className="app-layout">
      <Sidebar
        activeFilter={activeFilter}
        setActiveFilter={setActiveFilter}
        categoryCounts={categoryCounts}
        isOpen={sidebarOpen}
        closeSidebar={() => setSidebarOpen(false)}
      />

      <div className="main-content">
        <Navbar
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          onOpenCreateModal={() => {
            setEditingNote(null);
            setNoteModalOpen(true);
          }}
          toggleSidebar={() => setSidebarOpen((prev) => !prev)}
        />

        <main className="content-container">
          <div className="mobile-search-wrapper">
            <div className="search-input-wrapper">
              <Search size={18} className="search-icon" />
              <input
                type="text"
                className="search-input"
                placeholder="Search notes by title or content..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              {searchQuery && (
                <button
                  className="search-clear-btn"
                  onClick={() => setSearchQuery('')}
                  aria-label="Clear search"
                >
                  <X size={16} />
                </button>
              )}
            </div>
          </div>

          <div className="page-header">
            <div className="page-title-group">
              <h1>
                {activeFilter === 'All'
                  ? 'All Notes'
                  : activeFilter === 'Pinned'
                  ? 'Pinned Notes'
                  : `${activeFilter} Notes`}
              </h1>
              <p className="page-subtitle">
                {searchQuery
                  ? `Showing search results for "${searchQuery}"`
                  : activeFilter === 'All'
                  ? 'Organize, search, and manage your thoughts effortlessly'
                  : `Filtered by ${activeFilter}`}
              </p>
            </div>

            <div className="filter-pills">
              {FILTER_PILLS.map((pill) => (
                <button
                  key={pill}
                  className={`filter-pill ${activeFilter === pill ? 'active' : ''}`}
                  onClick={() => setActiveFilter(pill)}
                >
                  {pill}
                  {pill === 'Pinned' && categoryCounts.pinned > 0 && (
                    <span style={{ marginLeft: '4px', opacity: 0.8 }}>
                      ({categoryCounts.pinned})
                    </span>
                  )}
                </button>
              ))}
            </div>
          </div>

          {loading ? (
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '4rem 1rem',
                color: 'var(--text-muted)',
                gap: '0.65rem',
              }}
            >
              <Loader2 className="animate-spin" size={24} color="var(--brand-primary)" />
              <span>Loading your notes...</span>
            </div>
          ) : notes.length === 0 ? (
            <EmptyState
              isSearch={Boolean(searchQuery.trim())}
              activeFilter={activeFilter}
              onAddNote={() => {
                setEditingNote(null);
                setNoteModalOpen(true);
              }}
              onClearSearch={() => setSearchQuery('')}
            />
          ) : (
            <>
              {/* If viewing All and has pinned notes, display distinct sections */}
              {activeFilter === 'All' && pinnedNotes.length > 0 && (
                <section className="notes-section">
                  <div className="section-header">
                    <Pin size={16} className="section-icon" />
                    <span>PINNED ({pinnedNotes.length})</span>
                  </div>
                  <div className="notes-grid">
                    {pinnedNotes.map((note) => (
                      <NoteCard
                        key={note._id}
                        note={note}
                        onEdit={handleOpenEdit}
                        onDelete={handleOpenDelete}
                        onTogglePin={handleTogglePin}
                        onView={handleOpenView}
                      />
                    ))}
                  </div>
                </section>
              )}

              {/* Other notes section */}
              <section className="notes-section">
                {activeFilter === 'All' && pinnedNotes.length > 0 && (
                  <div className="section-header">
                    <Sparkles size={16} className="section-icon" />
                    <span>OTHER NOTES ({otherNotes.length})</span>
                  </div>
                )}
                <div className="notes-grid">
                  {(activeFilter === 'All' && pinnedNotes.length > 0 ? otherNotes : notes).map(
                    (note) => (
                      <NoteCard
                        key={note._id}
                        note={note}
                        onEdit={handleOpenEdit}
                        onDelete={handleOpenDelete}
                        onTogglePin={handleTogglePin}
                        onView={handleOpenView}
                      />
                    )
                  )}
                </div>
              </section>
            </>
          )}
        </main>
      </div>

      {/* Note Creation / Edit Modal */}
      <NoteModal
        isOpen={noteModalOpen}
        onClose={() => {
          setNoteModalOpen(false);
          setEditingNote(null);
        }}
        onSave={handleSaveNote}
        initialNote={editingNote}
        isSaving={isSaving}
      />

      {/* Delete Confirmation Modal */}
      <DeleteConfirmModal
        isOpen={deleteModalOpen}
        onClose={() => {
          setDeleteModalOpen(false);
          setDeletingNote(null);
        }}
        onConfirm={handleConfirmDelete}
        noteTitle={deletingNote?.title}
        isDeleting={isDeleting}
      />

      {/* Full Note View / Preview Modal */}
      <ViewNoteModal
        isOpen={viewModalOpen}
        onClose={() => {
          setViewModalOpen(false);
          setViewingNote(null);
        }}
        note={viewingNote}
        onEdit={(n) => {
          setViewModalOpen(false);
          handleOpenEdit(n);
        }}
        onDelete={(n) => {
          setViewModalOpen(false);
          handleOpenDelete(n);
        }}
        onTogglePin={handleTogglePin}
      />
    </div>
  );
};

export default Dashboard;
