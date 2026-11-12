const { readData, writeData, generateId } = require('../config/db');

const NOTE_CATEGORIES = ['Personal', 'College', 'Work', 'Other'];

class NoteModel {
  constructor(data) {
    Object.assign(this, data);
  }

  async save() {
    const data = readData();
    const index = data.notes.findIndex((n) => n._id === this._id);
    this.updatedAt = new Date().toISOString();

    if (index !== -1) {
      data.notes[index] = { ...this };
    } else {
      data.notes.push({ ...this });
    }

    writeData(data);
    return this;
  }

  async deleteOne() {
    const data = readData();
    data.notes = data.notes.filter((n) => n._id !== this._id);
    writeData(data);
    return { acknowledged: true, deletedCount: 1 };
  }

  static async find(filter = {}) {
    const data = readData();
    let results = [...data.notes];

    if (filter.userId) {
      const targetUserId = filter.userId.toString();
      results = results.filter(
        (n) => n.userId && n.userId.toString() === targetUserId
      );
    }

    if (filter.category && filter.category !== 'All') {
      results = results.filter((n) => n.category === filter.category);
    }

    if (filter.isPinned !== undefined) {
      const boolVal = Boolean(filter.isPinned);
      results = results.filter((n) => Boolean(n.isPinned) === boolVal);
    }

    if (filter.$or && Array.isArray(filter.$or)) {
      const regexMatch = filter.$or[0]?.title;
      if (regexMatch instanceof RegExp) {
        results = results.filter(
          (n) =>
            regexMatch.test(n.title || '') ||
            regexMatch.test(n.description || '') ||
            regexMatch.test(n.category || '')
        );
      }
    }

    // Default sorting: Pinned notes first, then newest updated
    results.sort((a, b) => {
      if (Boolean(a.isPinned) !== Boolean(b.isPinned)) {
        return a.isPinned ? -1 : 1;
      }
      const timeA = new Date(a.updatedAt || a.createdAt || 0).getTime();
      const timeB = new Date(b.updatedAt || b.createdAt || 0).getTime();
      return timeB - timeA;
    });

    return results.map((item) => new NoteModel(item));
  }

  static async findById(id) {
    if (!id) return null;
    const data = readData();
    const found = data.notes.find(
      (n) => n._id && n._id.toString() === id.toString()
    );
    if (!found) return null;
    return new NoteModel(found);
  }

  static async create({
    userId,
    title,
    description,
    category = 'Personal',
    isPinned = false,
  }) {
    const data = readData();
    const now = new Date().toISOString();

    const newNote = {
      _id: generateId(),
      userId: userId.toString(),
      title: title.trim(),
      description: description.trim(),
      category: category || 'Personal',
      isPinned: Boolean(isPinned),
      createdAt: now,
      updatedAt: now,
    };

    data.notes.unshift(newNote);
    writeData(data);

    return new NoteModel(newNote);
  }

  static async deleteMany() {
    const data = readData();
    data.notes = [];
    writeData(data);
    return { deletedCount: 0 };
  }
}

module.exports = { Note: NoteModel, NOTE_CATEGORIES };
