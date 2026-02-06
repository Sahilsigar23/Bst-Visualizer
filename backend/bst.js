class TreeNode {
  constructor(value) {
    this.value = value;
    this.left = null;
    this.right = null;
    this.highlight = false;
  }
}

class BST {
  constructor() {
    this.root = null;
  }

  // Insert a value and return the updated tree with path
  insertWithPath(value) {
    const path = [];
    this.root = this.insertRecursive(this.root, value, path);
    return { tree: this.serializeTree(), path };
  }

  insertRecursive(node, value, path) {
    if (node === null) {
      const newNode = new TreeNode(value);
      path.push(value);
      return newNode;
    }

    path.push(node.value);

    if (value < node.value) {
      node.left = this.insertRecursive(node.left, value, path);
    } else if (value > node.value) {
      node.right = this.insertRecursive(node.right, value, path);
    }

    return node;
  }

  // Search for a value and return path
  searchWithPath(value) {
    const path = [];
    const found = this.searchRecursive(this.root, value, path);
    return { found, path, tree: this.serializeTree() };
  }

  searchRecursive(node, value, path) {
    if (node === null) {
      return false;
    }

    path.push(node.value);

    if (value === node.value) {
      return true;
    } else if (value < node.value) {
      return this.searchRecursive(node.left, value, path);
    } else {
      return this.searchRecursive(node.right, value, path);
    }
  }

  // Remove a node
  removeNode(value) {
    const nodeExists = this.searchRecursive(this.root, value, []);
    if (!nodeExists) {
      return { tree: this.serializeTree(), found: false, message: `Node ${value} not found in tree` };
    }
    
    this.root = this.removeRecursive(this.root, value);
    return { tree: this.serializeTree(), found: true, message: `Node ${value} successfully deleted` };
  }

  removeRecursive(node, value) {
    if (node === null) {
      return null;
    }

    if (value < node.value) {
      node.left = this.removeRecursive(node.left, value);
    } else if (value > node.value) {
      node.right = this.removeRecursive(node.right, value);
    } else {
      // Node to be deleted found
      if (node.left === null) {
        return node.right;
      } else if (node.right === null) {
        return node.left;
      }

      // Node with two children: Get the inorder successor
      const minValue = this.findMinValue(node.right);
      node.value = minValue;
      node.right = this.removeRecursive(node.right, minValue);
    }

    return node;
  }

  findMinValue(node) {
    while (node.left !== null) {
      node = node.left;
    }
    return node.value;
  }

  // Traversal methods
  inorder() {
    const result = [];
    this.inorderRecursive(this.root, result);
    return { traversal: result, tree: this.serializeTree() };
  }

  inorderRecursive(node, result) {
    if (node !== null) {
      this.inorderRecursive(node.left, result);
      result.push(node.value);
      this.inorderRecursive(node.right, result);
    }
  }

  preorder() {
    const result = [];
    this.preorderRecursive(this.root, result);
    return { traversal: result, tree: this.serializeTree() };
  }

  preorderRecursive(node, result) {
    if (node !== null) {
      result.push(node.value);
      this.preorderRecursive(node.left, result);
      this.preorderRecursive(node.right, result);
    }
  }

  postorder() {
    const result = [];
    this.postorderRecursive(this.root, result);
    return { traversal: result, tree: this.serializeTree() };
  }

  postorderRecursive(node, result) {
    if (node !== null) {
      this.postorderRecursive(node.left, result);
      this.postorderRecursive(node.right, result);
      result.push(node.value);
    }
  }

  // Clear all highlights
  clearHighlight() {
    this.clearHighlightRecursive(this.root);
    return { tree: this.serializeTree() };
  }

  clearHighlightRecursive(node) {
    if (node !== null) {
      node.highlight = false;
      this.clearHighlightRecursive(node.left);
      this.clearHighlightRecursive(node.right);
    }
  }

  // Highlight nodes in path
  highlightPath(path) {
    this.clearHighlightRecursive(this.root);
    path.forEach(value => {
      this.highlightNode(this.root, value);
    });
    return { tree: this.serializeTree() };
  }

  highlightNode(node, value) {
    if (node !== null) {
      if (node.value === value) {
        node.highlight = true;
      }
      this.highlightNode(node.left, value);
      this.highlightNode(node.right, value);
    }
  }

  // Clear entire tree
  clear() {
    this.root = null;
    return { tree: this.serializeTree() };
  }

  // Serialize tree for frontend consumption
  serializeTree() {
    return this.serializeNode(this.root);
  }

  serializeNode(node) {
    if (node === null) {
      return null;
    }

    return {
      value: node.value,
      left: this.serializeNode(node.left),
      right: this.serializeNode(node.right),
      highlight: node.highlight
    };
  }
}

module.exports = BST;
