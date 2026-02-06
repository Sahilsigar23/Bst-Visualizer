import React, { useState } from 'react';

const Controls = ({
  onInsert,
  onSearch,
  onRemove,
  onTraversal,
  onClear,
  onClearHighlight,
  isLoading = false,
  traversalResult = null,
  searchResult = null,
  operationInfo = null
}) => {
  const [inputValue, setInputValue] = useState('');
  const [error, setError] = useState('');

  const handleInputChange = (e) => {
    setInputValue(e.target.value);
    setError('');
  };

  const validateInput = () => {
    if (inputValue.trim() === '') {
      setError('Please enter a value');
      return false;
    }

    const numValue = parseInt(inputValue);
    if (isNaN(numValue)) {
      setError('Please enter a valid number');
      return false;
    }

    return numValue;
  };

  const handleInsert = async () => {
    const value = validateInput();
    if (value === false) return;

    try {
      await onInsert(value);
      setInputValue('');
      setError('');
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to insert value');
    }
  };

  const handleSearch = async () => {
    const value = validateInput();
    if (value === false) return;

    try {
      await onSearch(value);
      setError('');
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to search value');
    }
  };

  const handleRemove = async () => {
    const value = validateInput();
    if (value === false) return;

    try {
      await onRemove(value);
      setInputValue('');
      setError('');
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to remove value');
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleInsert();
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6 mb-6">
      <h2 className="text-2xl font-bold mb-6 text-center text-gray-800">BST Operations</h2>
      
      {/* Input Section */}
      <div className="mb-6">
        <div className="flex gap-3 mb-3">
          <input
            type="text"
            value={inputValue}
            onChange={handleInputChange}
            onKeyPress={handleKeyPress}
            placeholder="Enter a number"
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            disabled={isLoading}
          />
        </div>
        
        {error && (
          <p className="text-red-500 text-sm mb-3">{error}</p>
        )}

        {/* Primary Action Buttons */}
        <div className="flex gap-2 flex-wrap">
          <button
            onClick={handleInsert}
            disabled={isLoading}
            className="px-4 py-2 bg-green-500 hover:bg-green-600 disabled:bg-gray-400 text-white rounded-lg transition-colors duration-200 font-medium"
          >
            {isLoading ? 'Loading...' : 'Insert'}
          </button>
          
          <button
            onClick={handleSearch}
            disabled={isLoading}
            className="px-4 py-2 bg-blue-500 hover:bg-blue-600 disabled:bg-gray-400 text-white rounded-lg transition-colors duration-200 font-medium"
          >
            Search
          </button>
          
          <button
            onClick={handleRemove}
            disabled={isLoading}
            className="px-4 py-2 bg-red-500 hover:bg-red-600 disabled:bg-gray-400 text-white rounded-lg transition-colors duration-200 font-medium"
          >
            Delete
          </button>
        </div>
      </div>

      {/* Operation Info Display */}
      {operationInfo && (
        <div className={`mb-4 p-3 rounded-lg ${
          operationInfo.type === 'success' 
            ? 'bg-green-100 border border-green-200' 
            : operationInfo.type === 'error'
            ? 'bg-red-100 border border-red-200'
            : 'bg-blue-100 border border-blue-200'
        }`}>
          <div className="flex items-start">
            <div className="flex-shrink-0 mr-2">
              {operationInfo.type === 'success' && (
                <div className="w-2 h-2 rounded-full bg-green-500 mt-2"></div>
              )}
              {operationInfo.type === 'error' && (
                <div className="w-2 h-2 rounded-full bg-red-500 mt-2"></div>
              )}
              {operationInfo.type === 'info' && (
                <div className="w-2 h-2 rounded-full bg-blue-500 mt-2"></div>
              )}
            </div>
            <div className="flex-1">
              <p className={`font-medium ${
                operationInfo.type === 'success' ? 'text-green-800' 
                : operationInfo.type === 'error' ? 'text-red-800'
                : 'text-blue-800'
              }`}>
                {operationInfo.operation}: {operationInfo.message}
              </p>
              {operationInfo.details && (
                <p className={`text-sm mt-1 ${
                  operationInfo.type === 'success' ? 'text-green-700' 
                  : operationInfo.type === 'error' ? 'text-red-700'
                  : 'text-blue-700'
                }`}>
                  {operationInfo.details}
                </p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Search Result Display */}
      {searchResult && (
        <div className="mb-4 p-3 rounded-lg bg-gray-100">
          <p className="font-medium">
            Search Result: 
            <span className={`ml-2 ${searchResult.found ? 'text-green-600' : 'text-red-600'}`}>
              {searchResult.found ? 'Found!' : 'Not Found'}
            </span>
          </p>
          {searchResult.path && searchResult.path.length > 0 && (
            <p className="text-sm text-gray-600 mt-1">
              Path: {searchResult.path.join(' → ')}
            </p>
          )}
        </div>
      )}

      {/* Traversal Section */}
      <div className="border-t pt-4">
        <h3 className="text-lg font-semibold mb-3 text-gray-700">Tree Traversal</h3>
        
        <div className="flex gap-2 flex-wrap mb-4">
          <button
            onClick={() => onTraversal('inorder')}
            disabled={isLoading}
            className="px-4 py-2 bg-purple-500 hover:bg-purple-600 disabled:bg-gray-400 text-white rounded-lg transition-colors duration-200 font-medium"
          >
            Inorder
          </button>
          
          <button
            onClick={() => onTraversal('preorder')}
            disabled={isLoading}
            className="px-4 py-2 bg-indigo-500 hover:bg-indigo-600 disabled:bg-gray-400 text-white rounded-lg transition-colors duration-200 font-medium"
          >
            Preorder
          </button>
          
          <button
            onClick={() => onTraversal('postorder')}
            disabled={isLoading}
            className="px-4 py-2 bg-cyan-500 hover:bg-cyan-600 disabled:bg-gray-400 text-white rounded-lg transition-colors duration-200 font-medium"
          >
            Postorder
          </button>
        </div>

        {/* Traversal Result Display */}
        {traversalResult && (
          <div className="mb-4 p-3 rounded-lg bg-gray-100">
            <p className="font-medium text-gray-700 mb-1">
              {traversalResult.type} Traversal:
            </p>
            <p className="text-lg font-mono text-blue-600">
              {traversalResult.result.length > 0 
                ? traversalResult.result.join(', ')
                : 'Tree is empty'
              }
            </p>
          </div>
        )}
      </div>

      {/* Utility Buttons */}
      <div className="border-t pt-4">
        <div className="flex gap-2 flex-wrap">
          <button
            onClick={onClearHighlight}
            disabled={isLoading}
            className="px-4 py-2 bg-yellow-500 hover:bg-yellow-600 disabled:bg-gray-400 text-white rounded-lg transition-colors duration-200 font-medium"
          >
            Clear Highlight
          </button>
          
          <button
            onClick={onClear}
            disabled={isLoading}
            className="px-4 py-2 bg-gray-600 hover:bg-gray-700 disabled:bg-gray-400 text-white rounded-lg transition-colors duration-200 font-medium"
          >
            Clear Tree
          </button>
        </div>
      </div>
    </div>
  );
};

export default Controls;
