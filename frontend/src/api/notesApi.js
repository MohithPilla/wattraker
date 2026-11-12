import { request } from './apiClient';

export const notesApi = {
  getNotes: (params = {}) => {
    const query = new URLSearchParams();
    if (params.search) query.append('search', params.search);
    if (params.category && params.category !== 'All') query.append('category', params.category);
    if (params.pinned !== undefined && params.pinned !== '') query.append('pinned', params.pinned);

    const queryString = query.toString() ? `?${query.toString()}` : '';
    return request(`/notes${queryString}`, { method: 'GET' });
  },

  createNote: (noteData) =>
    request('/notes', {
      method: 'POST',
      body: noteData,
    }),

  updateNote: (id, noteData) =>
    request(`/notes/${id}`, {
      method: 'PUT',
      body: noteData,
    }),

  deleteNote: (id) =>
    request(`/notes/${id}`, {
      method: 'DELETE',
    }),

  togglePin: (id) =>
    request(`/notes/${id}/pin`, {
      method: 'PATCH',
    }),
};

