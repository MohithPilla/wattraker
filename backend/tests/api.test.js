const test = require('node:test');
const assert = require('node:assert/strict');
const path = require('path');
const fs = require('fs');

// Point DB to test file
const TEST_DB = path.join(__dirname, '..', 'data', 'test_db.json');
process.env.DB_FILE_PATH = TEST_DB;

const { initDB } = require('../config/db');
initDB();

const app = require('../app');
const User = require('../models/User');
const { Note } = require('../models/Note');

let server;
let baseUrl;

test.before(async () => {
  await User.deleteMany();
  await Note.deleteMany();

  await new Promise((resolve) => {
    server = app.listen(0, '127.0.0.1', () => {
      const { port } = server.address();
      baseUrl = `http://127.0.0.1:${port}`;
      resolve();
    });
  });
});

test.after(async () => {
  await User.deleteMany();
  await Note.deleteMany();
  if (server) {
    await new Promise((resolve) => server.close(resolve));
  }
  // Clean up test file
  if (fs.existsSync(TEST_DB)) {
    try {
      fs.unlinkSync(TEST_DB);
    } catch {}
  }
});

const jsonRequest = async (path, options = {}) => {
  const res = await fetch(`${baseUrl}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    body: options.body ? JSON.stringify(options.body) : undefined,
  });
  const data = await res.json();
  return { status: res.status, data };
};

test('Health check reports database connected without MongoDB', async () => {
  const { status, data } = await jsonRequest('/api/health');
  assert.equal(status, 200);
  assert.equal(data.success, true);
  assert.ok(data.database.includes('connected'));
});

test('Full Auth and Notes CRUD lifecycle on local database', async () => {
  // 1. Validation error on short password
  const badReg = await jsonRequest('/api/auth/register', {
    method: 'POST',
    body: { name: 'Alice', email: 'alice@example.com', password: '123' },
  });
  assert.equal(badReg.status, 400);
  assert.equal(badReg.data.success, false);

  // 2. Register user 1
  const reg1 = await jsonRequest('/api/auth/register', {
    method: 'POST',
    body: { name: 'Alice', email: 'alice@example.com', password: 'password123' },
  });
  assert.equal(reg1.status, 201);
  assert.equal(reg1.data.success, true);
  assert.ok(reg1.data.token);
  assert.equal(reg1.data.user.email, 'alice@example.com');
  assert.equal(reg1.data.user.password, undefined);

  // 3. Duplicate registration blocked
  const dupReg = await jsonRequest('/api/auth/register', {
    method: 'POST',
    body: { name: 'Alice', email: 'alice@example.com', password: 'password123' },
  });
  assert.equal(dupReg.status, 409);

  // 4. Invalid login blocked
  const badLogin = await jsonRequest('/api/auth/login', {
    method: 'POST',
    body: { email: 'alice@example.com', password: 'wrongpassword' },
  });
  assert.equal(badLogin.status, 401);

  // 5. Valid login returns JWT token
  const login1 = await jsonRequest('/api/auth/login', {
    method: 'POST',
    body: { email: 'alice@example.com', password: 'password123' },
  });
  assert.equal(login1.status, 200);
  assert.ok(login1.data.token);
  const token1 = login1.data.token;
  const authHeader1 = { Authorization: `Bearer ${token1}` };

  // 6. Protected route blocks unauthenticated requests
  const unauthNotes = await jsonRequest('/api/notes');
  assert.equal(unauthNotes.status, 401);

  // 7. Create notes across categories
  const note1 = await jsonRequest('/api/notes', {
    method: 'POST',
    headers: authHeader1,
    body: {
      title: 'Algorithms Lecture',
      description: 'Review dynamic programming and graph traversal.',
      category: 'College',
      isPinned: false,
    },
  });
  assert.equal(note1.status, 201);
  assert.equal(note1.data.note.category, 'College');

  const note2 = await jsonRequest('/api/notes', {
    method: 'POST',
    headers: authHeader1,
    body: {
      title: 'Sprint Planning',
      description: 'Finalize Q4 deliverables and API contract.',
      category: 'Work',
      isPinned: true,
    },
  });
  assert.equal(note2.status, 201);
  assert.equal(note2.data.note.isPinned, true);

  // 8. List notes: pinned comes first + counts accurate
  const listAll = await jsonRequest('/api/notes', { headers: authHeader1 });
  assert.equal(listAll.status, 200);
  assert.equal(listAll.data.notes.length, 2);
  assert.equal(listAll.data.notes[0]._id, note2.data.note._id);
  assert.equal(listAll.data.categoryCounts.all, 2);
  assert.equal(listAll.data.categoryCounts.pinned, 1);
  assert.equal(listAll.data.categoryCounts.College, 1);
  assert.equal(listAll.data.categoryCounts.Work, 1);

  // 9. Search notes by keyword
  const searchRes = await jsonRequest('/api/notes?search=dynamic', { headers: authHeader1 });
  assert.equal(searchRes.status, 200);
  assert.equal(searchRes.data.notes.length, 1);
  assert.equal(searchRes.data.notes[0]._id, note1.data.note._id);

  // 10. Filter by category
  const catRes = await jsonRequest('/api/notes?category=Work', { headers: authHeader1 });
  assert.equal(catRes.status, 200);
  assert.equal(catRes.data.notes.length, 1);
  assert.equal(catRes.data.notes[0]._id, note2.data.note._id);

  // 11. Update note
  const updateRes = await jsonRequest(`/api/notes/${note1.data.note._id}`, {
    method: 'PUT',
    headers: authHeader1,
    body: {
      title: 'Algorithms Lecture Updated',
      category: 'Personal',
      isPinned: true,
    },
  });
  assert.equal(updateRes.status, 200);
  assert.equal(updateRes.data.note.title, 'Algorithms Lecture Updated');
  assert.equal(updateRes.data.note.category, 'Personal');
  assert.equal(updateRes.data.note.isPinned, true);

  // 12. Toggle pin
  const pinRes = await jsonRequest(`/api/notes/${note1.data.note._id}/pin`, {
    method: 'PATCH',
    headers: authHeader1,
  });
  assert.equal(pinRes.status, 200);
  assert.equal(pinRes.data.note.isPinned, false);

  // 13. Another user cannot access or delete Alice's note
  const reg2 = await jsonRequest('/api/auth/register', {
    method: 'POST',
    body: { name: 'Bob', email: 'bob@example.com', password: 'password123' },
  });
  const authHeader2 = { Authorization: `Bearer ${reg2.data.token}` };

  const bobDelete = await jsonRequest(`/api/notes/${note1.data.note._id}`, {
    method: 'DELETE',
    headers: authHeader2,
  });
  assert.equal(bobDelete.status, 403);

  // 14. Alice deletes note
  const delRes = await jsonRequest(`/api/notes/${note1.data.note._id}`, {
    method: 'DELETE',
    headers: authHeader1,
  });
  assert.equal(delRes.status, 200);

  const afterDel = await jsonRequest('/api/notes', { headers: authHeader1 });
  assert.equal(afterDel.data.notes.length, 1);
});
