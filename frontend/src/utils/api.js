import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';

// Create axios instance with base configuration
const api = axios.create({
  baseURL: `${API_BASE_URL}/api`,
  headers: {
    'Content-Type': 'application/json',
  },
});

// API methods
export const bstAPI = {
  // Get current tree state
  getTree: () => api.get('/tree'),
  
  // Insert a value
  insert: (value) => api.post('/insert', { value }),
  
  // Search for a value
  search: (value) => api.post('/search', { value }),
  
  // Remove a value
  remove: (value) => api.delete('/remove', { data: { value } }),
  
  // Traversal methods
  inorder: () => api.get('/inorder'),
  preorder: () => api.get('/preorder'),
  postorder: () => api.get('/postorder'),
  
  // Clear highlights
  clearHighlight: () => api.post('/clear-highlight'),
  
  // Highlight path
  highlightPath: (path) => api.post('/highlight', { path }),
  
  // Clear entire tree
  clear: () => api.delete('/clear'),
  
  // Health check
  health: () => api.get('/health'),
};

export default bstAPI;
