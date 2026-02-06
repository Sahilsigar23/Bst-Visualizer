require('dotenv').config();
const express = require('express');
const cors = require('cors');
const BST = require('./bst');

const app = express();
const PORT = process.env.PORT || 5000;
const CLIENT_URL = process.env.CLIENT_URL || 'http://localhost:5173';

// Create a single BST instance for this session
let bst = new BST();

// Middleware
app.use(express.json());
app.use(cors({
  origin: [CLIENT_URL, 'http://localhost:5173', 'http://localhost:3000'],
  credentials: true
}));

// Routes

// Get current tree state
app.get('/api/tree', (req, res) => {
  try {
    res.json({ tree: bst.serializeTree() });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Insert a value
app.post('/api/insert', (req, res) => {
  try {
    const { value } = req.body;
    
    if (value === undefined || value === null) {
      return res.status(400).json({ error: 'Value is required' });
    }

    const numValue = parseInt(value);
    if (isNaN(numValue)) {
      return res.status(400).json({ error: 'Value must be a number' });
    }

    const result = bst.insertWithPath(numValue);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Search for a value
app.post('/api/search', (req, res) => {
  try {
    const { value } = req.body;
    
    if (value === undefined || value === null) {
      return res.status(400).json({ error: 'Value is required' });
    }

    const numValue = parseInt(value);
    if (isNaN(numValue)) {
      return res.status(400).json({ error: 'Value must be a number' });
    }

    const result = bst.searchWithPath(numValue);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Remove a value
app.delete('/api/remove', (req, res) => {
  try {
    const { value } = req.body;
    
    if (value === undefined || value === null) {
      return res.status(400).json({ error: 'Value is required' });
    }

    const numValue = parseInt(value);
    if (isNaN(numValue)) {
      return res.status(400).json({ error: 'Value must be a number' });
    }

    const result = bst.removeNode(numValue);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Inorder traversal
app.get('/api/inorder', (req, res) => {
  try {
    const result = bst.inorder();
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Preorder traversal
app.get('/api/preorder', (req, res) => {
  try {
    const result = bst.preorder();
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Postorder traversal
app.get('/api/postorder', (req, res) => {
  try {
    const result = bst.postorder();
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Clear highlights
app.post('/api/clear-highlight', (req, res) => {
  try {
    const result = bst.clearHighlight();
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Highlight path
app.post('/api/highlight', (req, res) => {
  try {
    const { path } = req.body;
    
    if (!Array.isArray(path)) {
      return res.status(400).json({ error: 'Path must be an array' });
    }

    const result = bst.highlightPath(path);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Clear entire tree
app.delete('/api/clear', (req, res) => {
  try {
    bst = new BST(); // Create new instance
    res.json({ tree: null });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Start server
app.listen(PORT, () => {
  console.log(`BST Visualizer Backend running on port ${PORT}`);
  console.log(`Accepting requests from: ${CLIENT_URL}`);
});
