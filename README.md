# BST Visualizer

A minimal and clean Binary Search Tree (BST) Visualizer web application built with React and Node.js, similar in spirit to Visualgo.

## Features

- **Interactive BST Operations**: Insert, Search, Delete nodes
- **Tree Traversals**: Inorder, Preorder, Postorder with animations
- **Real-time Visualization**: SVG-based tree rendering with highlighting
- **Path Animation**: Visual representation of search and insertion paths
- **Clean UI**: Modern interface built with TailwindCSS

## Tech Stack

### Frontend
- React 18 with Vite
- TailwindCSS for styling
- Axios for API calls
- Pure SVG for tree visualization

### Backend
- Node.js with Express
- CORS enabled for cross-origin requests
- RESTful API design
- In-memory BST implementation

## Project Structure

```
BST Visualizer/
├── backend/
│   ├── package.json
│   ├── server.js          # Express server with BST APIs
│   ├── bst.js            # BST data structure and operations
│   └── .env.example      # Environment variables template
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── components/
│   │   │   ├── TreeCanvas.jsx    # SVG tree visualization
│   │   │   └── Controls.jsx      # UI controls and operations
│   │   ├── utils/
│   │   │   └── api.js           # API client setup
│   │   ├── App.jsx              # Main application component
│   │   ├── main.jsx             # React entry point
│   │   └── index.css            # Global styles with Tailwind
│   ├── package.json
│   ├── vite.config.js
│   ├── tailwind.config.js
│   └── .env.example             # Environment variables template
└── README.md
```

## Getting Started

### Prerequisites
- Node.js (version 14 or higher)
- npm or yarn package manager

### Local Development

1. **Clone/Download the project**
   ```bash
   cd "BST Visualizer"
   ```

2. **Set up Backend**
   ```bash
   cd backend
   npm install
   cp .env.example .env
   npm start
   ```
   The backend server will start on `http://localhost:5000`

3. **Set up Frontend** (in a new terminal)
   ```bash
   cd frontend
   npm install
   cp .env.example .env
   npm run dev
   ```
   The frontend will start on `http://localhost:5173`

4. **Open your browser**
   Navigate to `http://localhost:5173` to use the BST Visualizer

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/tree` | Get current tree state |
| POST | `/api/insert` | Insert a value |
| POST | `/api/search` | Search for a value |
| DELETE | `/api/remove` | Remove a value |
| GET | `/api/inorder` | Get inorder traversal |
| GET | `/api/preorder` | Get preorder traversal |
| GET | `/api/postorder` | Get postorder traversal |
| POST | `/api/clear-highlight` | Clear node highlights |
| POST | `/api/highlight` | Highlight nodes by path |
| DELETE | `/api/clear` | Clear entire tree |
| GET | `/api/health` | Health check |

## Usage

1. **Insert Values**: Enter numbers in the input field and click "Insert"
2. **Search**: Enter a number and click "Search" to find it in the tree
3. **Delete**: Enter a number and click "Delete" to remove it
4. **Traversals**: Click on Inorder, Preorder, or Postorder buttons
5. **Clear**: Use "Clear Highlight" to remove highlights or "Clear Tree" to start over

## Deployment

### Render Deployment

**Backend Deployment:**
1. Create a new Web Service on Render
2. Connect your repository
3. Set build command: `cd backend && npm install`
4. Set start command: `cd backend && npm start`
5. Add environment variables:
   - `PORT` (automatically set by Render)
   - `CLIENT_URL` (set to your frontend URL)

**Frontend Deployment:**
1. Create a new Static Site on Render
2. Connect your repository
3. Set build command: `cd frontend && npm install && npm run build`
4. Set publish directory: `frontend/dist`
5. Add environment variables:
   - `VITE_API_BASE_URL` (set to your backend URL)

### Manual Deployment

**Backend:**
```bash
cd backend
npm install
npm start
```

**Frontend:**
```bash
cd frontend
npm install
npm run build
# Serve the dist/ folder using any static file server
```

## Environment Variables

### Backend (.env)
```
PORT=5000
CLIENT_URL=http://localhost:5173
```

### Frontend (.env)
```
VITE_API_BASE_URL=http://localhost:5000
```

## Features Explained

### Tree Visualization
- Nodes are positioned automatically using a recursive algorithm
- Blue circles represent normal nodes
- Orange circles with pulsing rings represent highlighted nodes
- Lines connect parent and child nodes

### Animations
- **Insertion**: Shows the path taken to insert a new node
- **Search**: Highlights the path taken during search operation
- **Traversal**: Sequentially highlights nodes in traversal order

### BST Operations
- **Insert**: Maintains BST property (left < parent < right)
- **Search**: Returns path taken and whether value was found
- **Delete**: Handles all cases (no children, one child, two children)
- **Traversals**: Standard recursive implementations

## Contributing

Feel free to submit issues, fork the repository, and create pull requests for any improvements.

## License

MIT License - feel free to use this project for learning and development purposes.
