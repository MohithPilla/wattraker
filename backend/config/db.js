const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const DATA_DIR = path.join(__dirname, '..', 'data');
const DB_FILE = process.env.DB_FILE_PATH || path.join(DATA_DIR, 'db.json');

// Ensure directory and db file exist
function initDB() {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }

    if (!fs.existsSync(DB_FILE)) {
      const initialData = {
        users: [],
        notes: [],
      };
      fs.writeFileSync(DB_FILE, JSON.stringify(initialData, null, 2), 'utf-8');
      console.log(` Created local storage database file at ${DB_FILE}`);
    } else {
      const content = fs.readFileSync(DB_FILE, 'utf-8');
      JSON.parse(content);
    }
  } catch (err) {
    console.error('initDB warning:', err.message);
    try {
      fs.writeFileSync(DB_FILE, JSON.stringify({ users: [], notes: [] }, null, 2), 'utf-8');
    } catch {}
  }

  console.log(` Local JSON database active: ${DB_FILE}`);
}

function readData() {
  try {
    if (!fs.existsSync(DB_FILE)) {
      initDB();
    }
    const raw = fs.readFileSync(DB_FILE, 'utf-8');
    const parsed = JSON.parse(raw);
    return {
      users: Array.isArray(parsed.users) ? parsed.users : [],
      notes: Array.isArray(parsed.notes) ? parsed.notes : [],
    };
  } catch (err) {
    console.error('Error reading db file:', err.message);
    return { users: [], notes: [] };
  }
}

function writeData(data) {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    const cleanData = {
      users: Array.isArray(data.users) ? data.users : [],
      notes: Array.isArray(data.notes) ? data.notes : [],
    };
    fs.writeFileSync(DB_FILE, JSON.stringify(cleanData, null, 2), 'utf-8');
  } catch (err) {
    console.error('Error writing db file:', err.message);
  }
}

// Generate MongoDB-compatible 24-character hexadecimal IDs
function generateId() {
  return crypto.randomBytes(12).toString('hex');
}

module.exports = {
  initDB,
  readData,
  writeData,
  generateId,
  DB_FILE,
};
