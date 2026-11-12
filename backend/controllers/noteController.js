const { Note, NOTE_CATEGORIES } = require('../models/Note');

const findUserNoteOrFail = async (id, userId, res) => {
  if (!id || typeof id !== 'string' || id.trim() === '') {
    res.status(400).json({ success: false, message: 'Invalid note ID format' });
    return null;
  }

  const note = await Note.findById(id);
  if (!note) {
    res.status(404).json({ success: false, message: 'Note not found' });
    return null;
  }

  if (note.userId.toString() !== userId.toString()) {
    res.status(403).json({
      success: false,
      message: 'You are not authorized to access this note',
    });
    return null;
  }

  return note;
};

// @desc    Get all notes for authenticated user
// @route   GET /api/notes
// @access  Private
const getNotes = async (req, res) => {
  try {
    const { search, category, pinned } = req.query;

    const filter = { userId: req.user._id };

    if (category && category !== 'All') {
      filter.category = category;
    }

    if (pinned !== undefined && pinned !== '') {
      filter.isPinned = pinned === 'true';
    }

    if (search && search.trim() !== '') {
      const regex = new RegExp(search.trim(), 'i');
      filter.$or = [{ title: regex }, { description: regex }];
    }

    // Sort: pinned first, then newest updated
    const notes = await Note.find(filter);

    // Also compute category summary counts for convenient UI badges
    const allUserNotes = await Note.find({ userId: req.user._id });
    const counts = {
      all: allUserNotes.length,
      pinned: allUserNotes.filter((n) => n.isPinned).length,
      Personal: allUserNotes.filter((n) => n.category === 'Personal').length,
      College: allUserNotes.filter((n) => n.category === 'College').length,
      Work: allUserNotes.filter((n) => n.category === 'Work').length,
      Other: allUserNotes.filter((n) => n.category === 'Other').length,
    };

    return res.status(200).json({
      success: true,
      count: notes.length,
      categoryCounts: counts,
      notes,
    });
  } catch (error) {
    console.error('getNotes error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve notes',
      error: error.message,
    });
  }
};

// @desc    Create a new note
// @route   POST /api/notes
// @access  Private
const createNote = async (req, res) => {
  try {
    const { title, description, category = 'Personal', isPinned = false } = req.body;

    if (!title || !description) {
      return res.status(400).json({
        success: false,
        message: 'Both title and description are required',
      });
    }

    if (category && !NOTE_CATEGORIES.includes(category)) {
      return res.status(400).json({
        success: false,
        message: `Category must be one of: ${NOTE_CATEGORIES.join(', ')}`,
      });
    }

    const note = await Note.create({
      userId: req.user._id,
      title: title.trim(),
      description: description.trim(),
      category: category || 'Personal',
      isPinned: Boolean(isPinned),
    });

    return res.status(201).json({
      success: true,
      message: 'Note created successfully',
      note,
    });
  } catch (error) {
    console.error('createNote error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to create note',
      error: error.message,
    });
  }
};

// @desc    Update a note
// @route   PUT /api/notes/:id
// @access  Private
const updateNote = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, category, isPinned } = req.body;

    const note = await findUserNoteOrFail(id, req.user._id, res);
    if (!note) return;

    if (title !== undefined) {
      if (!title.trim()) {
        return res.status(400).json({
          success: false,
          message: 'Title cannot be empty',
        });
      }
      note.title = title.trim();
    }

    if (description !== undefined) {
      if (!description.trim()) {
        return res.status(400).json({
          success: false,
          message: 'Description cannot be empty',
        });
      }
      note.description = description.trim();
    }

    if (category !== undefined) {
      if (!NOTE_CATEGORIES.includes(category)) {
        return res.status(400).json({
          success: false,
          message: `Category must be one of: ${NOTE_CATEGORIES.join(', ')}`,
        });
      }
      note.category = category;
    }

    if (isPinned !== undefined) {
      note.isPinned = Boolean(isPinned);
    }

    const updatedNote = await note.save();

    return res.status(200).json({
      success: true,
      message: 'Note updated successfully',
      note: updatedNote,
    });
  } catch (error) {
    console.error('updateNote error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to update note',
      error: error.message,
    });
  }
};

// @desc    Delete a note
// @route   DELETE /api/notes/:id
// @access  Private
const deleteNote = async (req, res) => {
  try {
    const { id } = req.params;

    const note = await findUserNoteOrFail(id, req.user._id, res);
    if (!note) return;

    await note.deleteOne();

    return res.status(200).json({
      success: true,
      message: 'Note deleted successfully',
      id,
    });
  } catch (error) {
    console.error('deleteNote error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to delete note',
      error: error.message,
    });
  }
};

// @desc    Toggle pin status of a note
// @route   PATCH /api/notes/:id/pin
// @access  Private
const togglePinNote = async (req, res) => {
  try {
    const { id } = req.params;

    const note = await findUserNoteOrFail(id, req.user._id, res);
    if (!note) return;

    note.isPinned = !note.isPinned;
    await note.save();

    return res.status(200).json({
      success: true,
      message: note.isPinned ? 'Note pinned to top' : 'Note unpinned',
      note,
    });
  } catch (error) {
    console.error('togglePinNote error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to toggle pin status',
      error: error.message,
    });
  }
};

module.exports = {
  getNotes,
  createNote,
  updateNote,
  deleteNote,
  togglePinNote,
};
