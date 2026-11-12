const express = require('express');
const { body } = require('express-validator');
const {
  getNotes,
  createNote,
  updateNote,
  deleteNote,
  togglePinNote,
} = require('../controllers/noteController');
const { protect } = require('../middleware/auth');
const { validateRequest } = require('../middleware/validateMiddleware');
const { NOTE_CATEGORIES } = require('../models/Note');

const router = express.Router();

// All note routes require authentication
router.use(protect);

const createNoteValidation = [
  body('title').trim().notEmpty().withMessage('Title is required'),
  body('description').trim().notEmpty().withMessage('Description is required'),
  body('category')
    .optional()
    .isIn(NOTE_CATEGORIES)
    .withMessage(`Category must be one of: ${NOTE_CATEGORIES.join(', ')}`),
  body('isPinned')
    .optional()
    .isBoolean()
    .withMessage('isPinned must be a boolean'),
  validateRequest,
];

const updateNoteValidation = [
  body('title').optional().trim().notEmpty().withMessage('Title cannot be empty'),
  body('description').optional().trim().notEmpty().withMessage('Description cannot be empty'),
  body('category')
    .optional()
    .isIn(NOTE_CATEGORIES)
    .withMessage(`Category must be one of: ${NOTE_CATEGORIES.join(', ')}`),
  body('isPinned')
    .optional()
    .isBoolean()
    .withMessage('isPinned must be a boolean'),
  validateRequest,
];

router.route('/')
  .get(getNotes)
  .post(createNoteValidation, createNote);

router.route('/:id')
  .put(updateNoteValidation, updateNote)
  .delete(deleteNote);

router.patch('/:id/pin', togglePinNote);

module.exports = router;

