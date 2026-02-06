import React, { useState, useEffect } from 'react';
import TreeCanvas from './components/TreeCanvas';
import Controls from './components/Controls';
import bstAPI from './utils/api';
import './index.css';

function App() {
  const [tree, setTree] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [traversalResult, setTraversalResult] = useState(null);
  const [searchResult, setSearchResult] = useState(null);
  const [highlightedPath, setHighlightedPath] = useState([]);
  const [error, setError] = useState('');
  const [operationInfo, setOperationInfo] = useState(null);
  const [showControls, setShowControls] = useState(false);
  const [activeOperation, setActiveOperation] = useState(null);

  // Load initial tree state on component mount
  useEffect(() => {
    loadTree();
  }, []);

  const loadTree = async () => {
    try {
      setIsLoading(true);
      const response = await bstAPI.getTree();
      setTree(response.data.tree);
      setError('');
    } catch (err) {
      console.error('Failed to load tree:', err);
      setError('Failed to connect to server. Make sure the backend is running.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleInsert = async (value) => {
    try {
      setIsLoading(true);
      setError('');
      setOperationInfo(null);
      
      const response = await bstAPI.insert(value);
      setTree(response.data.tree);
      
      // Show operation info
      setOperationInfo({
        type: 'success',
        operation: 'Insert',
        message: `Node ${value} successfully inserted`,
        details: response.data.path ? `Insertion path: ${response.data.path.join(' → ')}` : null
      });
      
      // Animate the insertion path
      if (response.data.path) {
        await animatePathHighlight(response.data.path);
      }
      
      // Clear previous results
      setTraversalResult(null);
      setSearchResult(null);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to insert value');
      setOperationInfo({
        type: 'error',
        operation: 'Insert',
        message: `Failed to insert node ${value}`,
        details: err.response?.data?.error || 'Unknown error occurred'
      });
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = async (value) => {
    try {
      setIsLoading(true);
      setError('');
      const response = await bstAPI.search(value);
      setTree(response.data.tree);
      setSearchResult({
        found: response.data.found,
        path: response.data.path,
        value: value
      });
      
      // Animate the search path
      if (response.data.path) {
        await animatePathHighlight(response.data.path);
      }
      
      setTraversalResult(null);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to search value');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const handleRemove = async (value) => {
    try {
      setIsLoading(true);
      setError('');
      setOperationInfo(null);
      
      const response = await bstAPI.remove(value);
      setTree(response.data.tree);
      
      // Show operation info
      if (response.data.found !== false) {
        setOperationInfo({
          type: 'success',
          operation: 'Delete',
          message: response.data.message || `Node ${value} successfully deleted`
        });
      } else {
        setOperationInfo({
          type: 'error',
          operation: 'Delete',
          message: response.data.message || `Node ${value} not found in tree`
        });
      }
      
      // Clear highlights and results
      setHighlightedPath([]);
      setTraversalResult(null);
      setSearchResult(null);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to remove value');
      setOperationInfo({
        type: 'error',
        operation: 'Delete',
        message: `Failed to delete node ${value}`,
        details: err.response?.data?.error || 'Unknown error occurred'
      });
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const handleTraversal = async (type) => {
    try {
      setIsLoading(true);
      setError('');
      setOperationInfo(null);
      let response;
      
      switch (type) {
        case 'inorder':
          response = await bstAPI.inorder();
          break;
        case 'preorder':
          response = await bstAPI.preorder();
          break;
        case 'postorder':
          response = await bstAPI.postorder();
          break;
        default:
          throw new Error('Invalid traversal type');
      }
      
      setTree(response.data.tree);
      const traversalType = type.charAt(0).toUpperCase() + type.slice(1);
      
      setTraversalResult({
        type: traversalType,
        result: response.data.traversal || []
      });
      
      // Show operation info
      const traversalSequence = response.data.traversal || [];
      setOperationInfo({
        type: 'info',
        operation: `${traversalType} Traversal`,
        message: traversalSequence.length > 0 
          ? `Completed successfully with ${traversalSequence.length} nodes`
          : 'Tree is empty - no nodes to traverse',
        details: traversalSequence.length > 0 
          ? `Sequence: ${traversalSequence.join(', ')}`
          : null
      });
      
      // Animate traversal by highlighting nodes in order
      if (response.data.traversal && response.data.traversal.length > 0) {
        await animateTraversalHighlight(response.data.traversal);
      }
      
      setSearchResult(null);
    } catch (err) {
      setError(err.response?.data?.error || `Failed to perform ${type} traversal`);
      setOperationInfo({
        type: 'error',
        operation: `${type.charAt(0).toUpperCase() + type.slice(1)} Traversal`,
        message: `Failed to perform traversal`,
        details: err.response?.data?.error || 'Unknown error occurred'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleClear = async () => {
    try {
      setIsLoading(true);
      setError('');
      await bstAPI.clear();
      setTree(null);
      setHighlightedPath([]);
      setTraversalResult(null);
      setSearchResult(null);
    } catch (err) {
      setError('Failed to clear tree');
    } finally {
      setIsLoading(false);
    }
  };

  const handleClearHighlight = async () => {
    try {
      setIsLoading(true);
      setError('');
      const response = await bstAPI.clearHighlight();
      setTree(response.data.tree);
      setHighlightedPath([]);
    } catch (err) {
      setError('Failed to clear highlights');
    } finally {
      setIsLoading(false);
    }
  };

  // Handle quick operations from compact controls
  const handleQuickOperation = async (operation) => {
    const inputElement = document.getElementById('quickInput');
    const value = inputElement?.value?.trim();
    
    if (!value) {
      setError('Please enter a value');
      return;
    }

    const numValue = parseInt(value);
    if (isNaN(numValue)) {
      setError('Please enter a valid number');
      return;
    }

    try {
      switch (operation) {
        case 'insert':
          await handleInsertWithSteps(numValue);
          break;
        case 'search':
          await handleSearchWithSteps(numValue);
          break;
        case 'delete':
          await handleDeleteWithSteps(numValue);
          break;
      }
      inputElement.value = '';
    } catch (err) {
      // Error already handled in individual functions
    }
  };

  // Enhanced insert with step-by-step explanation
  const handleInsertWithSteps = async (value) => {
    try {
      setIsLoading(true);
      setError('');
      setOperationInfo(null);
      
      const response = await bstAPI.insert(value);
      setTree(response.data.tree);
      
      // Generate step-by-step explanation
      const steps = [];
      if (!tree) {
        steps.push(`Tree is empty, so ${value} becomes the root node`);
      } else {
        steps.push(`Starting at root node`);
        if (response.data.path) {
          for (let i = 0; i < response.data.path.length - 1; i++) {
            const currentNode = response.data.path[i];
            const nextNode = response.data.path[i + 1];
            if (nextNode < currentNode) {
              steps.push(`${nextNode} < ${currentNode}, go to left child`);
            } else if (nextNode > currentNode) {
              steps.push(`${nextNode} > ${currentNode}, go to right child`);
            }
          }
          steps.push(`Found empty position, insert ${value} as new node`);
        }
      }
      
      setOperationInfo({
        type: 'success',
        operation: 'Insert Operation',
        message: `Node ${value} successfully inserted`,
        details: response.data.path ? `Path: ${response.data.path.join(' → ')}` : null,
        steps: steps
      });
      
      // Animate the insertion path
      if (response.data.path) {
        await animatePathHighlight(response.data.path);
      }
      
      setTraversalResult(null);
      setSearchResult(null);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to insert value');
      setOperationInfo({
        type: 'error',
        operation: 'Insert Operation',
        message: `Failed to insert node ${value}`,
        details: err.response?.data?.error || 'Unknown error occurred'
      });
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  // Enhanced search with step-by-step explanation
  const handleSearchWithSteps = async (value) => {
    try {
      setIsLoading(true);
      setError('');
      setOperationInfo(null);
      
      const response = await bstAPI.search(value);
      setTree(response.data.tree);
      
      // Generate step-by-step explanation
      const steps = [];
      if (!tree) {
        steps.push('Tree is empty, value not found');
      } else if (response.data.path) {
        steps.push('Starting search at root node');
        for (let i = 0; i < response.data.path.length; i++) {
          const currentNode = response.data.path[i];
          if (currentNode === value) {
            steps.push(`Found ${value}! Search successful`);
            break;
          } else {
            if (i < response.data.path.length - 1) {
              const nextNode = response.data.path[i + 1];
              if (value < currentNode) {
                steps.push(`${value} < ${currentNode}, search left subtree`);
              } else {
                steps.push(`${value} > ${currentNode}, search right subtree`);
              }
            } else {
              steps.push(`Reached null node, ${value} not found in tree`);
            }
          }
        }
      }
      
      setSearchResult({
        found: response.data.found,
        path: response.data.path,
        value: value
      });
      
      setOperationInfo({
        type: response.data.found ? 'success' : 'error',
        operation: 'Search Operation',
        message: response.data.found ? `Found node ${value}` : `Node ${value} not found`,
        details: response.data.path ? `Search path: ${response.data.path.join(' → ')}` : null,
        steps: steps
      });
      
      // Animate the search path
      if (response.data.path) {
        await animatePathHighlight(response.data.path);
      }
      
      setTraversalResult(null);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to search value');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  // Enhanced delete with step-by-step explanation
  const handleDeleteWithSteps = async (value) => {
    try {
      setIsLoading(true);
      setError('');
      setOperationInfo(null);
      
      // First search for the node to show the path
      const searchResponse = await bstAPI.search(value);
      
      const response = await bstAPI.remove(value);
      setTree(response.data.tree);
      
      // Generate step-by-step explanation
      const steps = [];
      if (!tree) {
        steps.push('Tree is empty, nothing to delete');
      } else {
        steps.push(`Searching for node ${value} to delete`);
        if (response.data.found !== false) {
          steps.push(`Found node ${value}`);
          steps.push('Determining deletion case:');
          steps.push('• Leaf node: Simply remove');
          steps.push('• One child: Replace with child');
          steps.push('• Two children: Replace with inorder successor');
          steps.push('Node successfully deleted and tree restructured');
        } else {
          steps.push(`Node ${value} not found in tree`);
        }
      }
      
      setOperationInfo({
        type: response.data.found !== false ? 'success' : 'error',
        operation: 'Delete Operation',
        message: response.data.message || (response.data.found !== false ? `Node ${value} deleted` : `Node ${value} not found`),
        steps: steps
      });
      
      // Show the search path for the deleted node
      if (searchResponse.data.path && response.data.found !== false) {
        await animatePathHighlight(searchResponse.data.path);
      } else {
        setHighlightedPath([]);
      }
      
      setTraversalResult(null);
      setSearchResult(null);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to remove value');
      setOperationInfo({
        type: 'error',
        operation: 'Delete Operation',
        message: `Failed to delete node ${value}`,
        details: err.response?.data?.error || 'Unknown error occurred'
      });
      setHighlightedPath([]);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  // Animation helper functions
  const animatePathHighlight = async (path) => {
    setHighlightedPath([]);
    
    for (let i = 0; i < path.length; i++) {
      setHighlightedPath(path.slice(0, i + 1));
      await new Promise(resolve => setTimeout(resolve, 500)); // 500ms delay between highlights
    }
    
    // Keep the path highlighted persistently (like VisualGO)
    // Path will remain until next operation or manual clear
  };

  const animateTraversalHighlight = async (traversal) => {
    setHighlightedPath([]);
    
    for (let i = 0; i < traversal.length; i++) {
      setHighlightedPath(traversal.slice(0, i + 1));
      await new Promise(resolve => setTimeout(resolve, 600)); // 600ms delay between highlights
    }
    
    // Keep all traversed nodes highlighted persistently (like VisualGO)
    // This shows the complete traversal sequence visually
  };

  // Helper functions for tree statistics
  const getNodeCount = (node) => {
    if (!node) return 0;
    return 1 + getNodeCount(node.left) + getNodeCount(node.right);
  };

  const getTreeHeight = (node) => {
    if (!node) return 0;
    return 1 + Math.max(getTreeHeight(node.left), getTreeHeight(node.right));
  };

  // Handle operation submission from sidebar
  const handleOperationSubmit = async () => {
    const inputElement = document.getElementById('operationInput');
    const value = inputElement?.value?.trim();
    
    if (!value) {
      setError('Please enter a value');
      return;
    }

    const numValue = parseInt(value);
    if (isNaN(numValue)) {
      setError('Please enter a valid number');
      return;
    }

    try {
      switch (activeOperation) {
        case 'create':
          // Create a new tree with sample values
          await handleClear();
          for (const val of [50, 30, 70, 20, 40, 60, 80]) {
            await handleInsertWithSteps(val);
          }
          break;
        case 'insert':
          await handleInsertWithSteps(numValue);
          break;
        case 'search':
          await handleSearchWithSteps(numValue);
          break;
        case 'remove':
          await handleDeleteWithSteps(numValue);
          break;
        case 'select':
          // For now, just search for the value
          await handleSearchWithSteps(numValue);
          break;
        case 'traverse':
          await handleTraversal('inorder');
          break;
        case 'predecessor':
          // For now, just search for the value
          await handleSearchWithSteps(numValue);
          break;
      }
      inputElement.value = '';
      setError('');
    } catch (err) {
      // Error already handled in individual functions
    }
  };


  return (
    <div className="h-screen bg-gray-100 flex flex-col overflow-hidden">
      {/* Simple Header - Title Only */}
      <header className="bg-gray-900 text-white px-4 py-3 flex items-center justify-center flex-shrink-0">
        <h1 className="text-xl font-bold text-white">BINARY SEARCH TREE VISUALIZER</h1>
      </header>

      {/* Error Display */}
      {error && (
        <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mx-4 mt-4">
          <p className="font-medium">Error: {error}</p>
        </div>
      )}

      {/* Main Layout - Three Columns */}
      <div className="flex-1 flex">
        {/* Left Sidebar - Orange Operations Panel */}
        <div className="w-48 bg-orange-500 text-white p-3 space-y-1">
          {/* Main Operations */}
          <div className="space-y-1">
            <button 
              className={`w-full text-left py-2 px-3 rounded text-sm transition-colors ${
                activeOperation === 'search' ? 'bg-orange-600' : 'hover:bg-orange-600'
              }`}
              onClick={() => setActiveOperation('search')}
            >
              Search(v)
            </button>
            
            <button 
              className={`w-full text-left py-2 px-3 rounded text-sm transition-colors ${
                activeOperation === 'insert' ? 'bg-orange-600' : 'hover:bg-orange-600'
              }`}
              onClick={() => setActiveOperation('insert')}
            >
              Insert(v)
            </button>
            
            <button 
              className={`w-full text-left py-2 px-3 rounded text-sm transition-colors ${
                activeOperation === 'remove' ? 'bg-orange-600' : 'hover:bg-orange-600'
              }`}
              onClick={() => setActiveOperation('remove')}
            >
              Remove(v)
            </button>
            
            <button 
              className={`w-full text-left py-2 px-3 rounded text-sm transition-colors ${
                activeOperation === 'select' ? 'bg-orange-600' : 'hover:bg-orange-600'
              }`}
              onClick={() => setActiveOperation('select')}
            >
              Select(k)
            </button>
            
            <button 
              className={`w-full text-left py-2 px-3 rounded text-sm transition-colors ${
                activeOperation === 'traverse' ? 'bg-orange-600' : 'hover:bg-orange-600'
              }`}
              onClick={() => setActiveOperation('traverse')}
            >
              Traverse(root)
            </button>
          </div>

          {/* Input Section - Better positioned */}
          {activeOperation && (
            <div className="mt-4 p-3 bg-orange-600 rounded-lg border-2 border-orange-700">
              <div className="mb-2">
                <input
                  type="text"
                  placeholder={
                    activeOperation === 'traverse' ? 'Enter starting node' :
                    activeOperation === 'select' ? 'Enter position k' :
                    'Enter value'
                  }
                  className="w-full px-3 py-2 text-black rounded text-sm focus:outline-none focus:ring-2 focus:ring-white"
                  id="operationInput"
                  onKeyPress={(e) => e.key === 'Enter' && handleOperationSubmit()}
                />
              </div>
              <button
                onClick={handleOperationSubmit}
                className="w-full bg-orange-700 hover:bg-orange-800 py-2 rounded text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-white disabled:opacity-50"
                disabled={isLoading}
              >
                {isLoading ? 'Processing...' : 
                 activeOperation === 'search' ? 'Search' :
                 activeOperation === 'insert' ? 'Insert' :
                 activeOperation === 'remove' ? 'Remove' :
                 activeOperation === 'select' ? 'Select' :
                 activeOperation === 'traverse' ? 'Traverse' :
                 'Execute'
                }
              </button>
            </div>
          )}

          {/* Traversal Buttons */}
          <div className="mt-6 space-y-1">
            <div className="text-xs text-orange-200 mb-2 px-2">Quick Traversals:</div>
            <button 
              className="w-full text-left py-2 px-3 hover:bg-orange-600 rounded text-sm"
              onClick={() => handleTraversal('inorder')}
            >
              Inorder
            </button>
            <button 
              className="w-full text-left py-2 px-3 hover:bg-orange-600 rounded text-sm"
              onClick={() => handleTraversal('preorder')}
            >
              Preorder
            </button>
            <button 
              className="w-full text-left py-2 px-3 hover:bg-orange-600 rounded text-sm"
              onClick={() => handleTraversal('postorder')}
            >
              Postorder
            </button>
          </div>

          <button 
            className="w-full text-left py-2 px-3 hover:bg-orange-600 rounded text-sm mt-6 border-t border-orange-400 pt-4"
            onClick={handleClear}
          >
            Clear Tree
          </button>
        </div>

        {/* Main Visualization Area */}
        <div className="flex-1 bg-white relative overflow-hidden">
          {/* Tree Info */}
          <div className="absolute top-4 left-4 text-sm text-gray-600 z-10">
            {tree ? `N=${getNodeCount(tree)}, h=${getTreeHeight(tree)}` : 'N=0, h=0'}
          </div>

          {/* Tree Visualization */}
          <div className="w-full h-full">
            <TreeCanvas 
              tree={tree} 
              highlightedPath={highlightedPath}
            />
          </div>

        </div>

        {/* Right Sidebar - Algorithm Explanation */}
        <div className="w-80 bg-white border-l border-gray-300 flex flex-col">
          {/* Current Operation Header */}
          <div className="bg-gray-100 p-3 border-b">
            <h3 className="font-semibold text-gray-800">
              {activeOperation ? `${activeOperation.charAt(0).toUpperCase() + activeOperation.slice(1)}(${searchResult?.value || traversalResult?.result?.length || 'v'})` : 'Select Operation'}
            </h3>
          </div>

          {/* Algorithm Explanation */}
          <div className="flex-1 p-4 overflow-y-auto">
            {operationInfo && (
              <div className="mb-4">
                <div className={`p-3 rounded ${
                  operationInfo.type === 'success' ? 'bg-green-100 text-green-800' :
                  operationInfo.type === 'error' ? 'bg-red-100 text-red-800' :
                  'bg-blue-100 text-blue-800'
                }`}>
                  <p className="font-medium">{operationInfo.message}</p>
                  {operationInfo.details && (
                    <p className="text-sm mt-1">{operationInfo.details}</p>
                  )}
                </div>
              </div>
            )}

            {/* Algorithm Steps */}
            {operationInfo?.steps && (
              <div className="mb-4">
                <h4 className="font-medium text-gray-700 mb-2">Algorithm Steps:</h4>
                <div className="space-y-2">
                  {operationInfo.steps.map((step, index) => (
                    <div key={index} className="bg-yellow-100 p-2 rounded text-sm">
                      <code className="text-gray-800">{step}</code>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Pseudocode */}
            <div className="space-y-2">
              <h4 className="font-medium text-gray-700">Pseudocode:</h4>
              
              {activeOperation === 'search' && (
                <div className="bg-gray-900 text-green-400 p-3 rounded font-mono text-sm">
                  <div>if this is null, return</div>
                  <div>q = size of left subtree</div>
                  <div className="bg-yellow-600 text-black px-1">if (q+1 == k) return this</div>
                  <div className="bg-yellow-400 text-black px-1">else if (q+1 &gt; k) select k on left</div>
                  <div className="bg-yellow-300 text-black px-1">else if (q+1 &lt; k) select (k-q-1) on right</div>
                </div>
              )}

              {activeOperation === 'insert' && (
                <div className="bg-gray-900 text-green-400 p-3 rounded font-mono text-sm">
                  <div>if this is null</div>
                  <div>&nbsp;&nbsp;create new node with value v</div>
                  <div>else if v &lt; this.value</div>
                  <div>&nbsp;&nbsp;insert v to left subtree</div>
                  <div>else if v &gt; this.value</div>
                  <div>&nbsp;&nbsp;insert v to right subtree</div>
                  <div>else // v == this.value</div>
                  <div>&nbsp;&nbsp;do nothing (no duplicates)</div>
                </div>
              )}

              {activeOperation === 'remove' && (
                <div className="bg-gray-900 text-green-400 p-3 rounded font-mono text-sm">
                  <div>if this is null, return null</div>
                  <div>if v &lt; this.value</div>
                  <div>&nbsp;&nbsp;remove v from left subtree</div>
                  <div>else if v &gt; this.value</div>
                  <div>&nbsp;&nbsp;remove v from right subtree</div>
                  <div>else // v == this.value</div>
                  <div>&nbsp;&nbsp;if no children: return null</div>
                  <div>&nbsp;&nbsp;if one child: return child</div>
                  <div>&nbsp;&nbsp;if two children: replace with successor</div>
                </div>
              )}

              {!activeOperation && (
                <div className="text-gray-500 italic text-sm">
                  Click on an operation from the left panel to see the algorithm explanation and pseudocode.
                </div>
              )}
            </div>

            {/* Traversal Results */}
            {traversalResult && (
              <div className="mt-4">
                <h4 className="font-medium text-gray-700 mb-2">{traversalResult.type} Result:</h4>
                <div className="bg-gray-100 p-3 rounded">
                  <code className="text-lg text-blue-600">
                    {traversalResult.result.join(', ')}
                  </code>
                </div>
                <p className="text-xs text-gray-600 mt-1">
                  {traversalResult.type === 'Inorder' && 'Left → Root → Right (sorted order)'}
                  {traversalResult.type === 'Preorder' && 'Root → Left → Right (tree structure)'}
                  {traversalResult.type === 'Postorder' && 'Left → Right → Root (safe deletion order)'}
                </p>
              </div>
            )}

            {/* Search Results */}
            {searchResult && (
              <div className="mt-4">
                <h4 className="font-medium text-gray-700 mb-2">Search Result:</h4>
                <div className={`p-3 rounded ${searchResult.found ? 'bg-green-100' : 'bg-red-100'}`}>
                  <p className="font-medium">
                    Value {searchResult.value}: {searchResult.found ? 'Found' : 'Not Found'}
                  </p>
                  {searchResult.path && (
                    <p className="text-sm mt-1 font-mono">
                      Path: {searchResult.path.join(' → ')}
                    </p>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
