import React, { useMemo } from 'react';

const TreeCanvas = ({ tree, highlightedPath = [] }) => {
  const SVG_WIDTH = 700;
  const SVG_HEIGHT = 400;
  const NODE_RADIUS = 14;
  const LEVEL_HEIGHT = 45;
  const MARGIN = 30;

  // Calculate positions for all nodes with better spacing
  const calculatePositions = (node, x, y, level, minX, maxX) => {
    if (!node) return [];

    const positions = [];
    positions.push({ node, x, y, level });

    const spacing = Math.max(40, (maxX - minX) / Math.pow(2, level + 2));

    if (node.left) {
      const leftX = Math.max(MARGIN + NODE_RADIUS, x - spacing);
      positions.push(...calculatePositions(node.left, leftX, y + LEVEL_HEIGHT, level + 1, minX, x));
    }

    if (node.right) {
      const rightX = Math.min(SVG_WIDTH - MARGIN - NODE_RADIUS, x + spacing);
      positions.push(...calculatePositions(node.right, rightX, y + LEVEL_HEIGHT, level + 1, x, maxX));
    }

    return positions;
  };

  const nodePositions = useMemo(() => {
    if (!tree) return [];
    return calculatePositions(tree, SVG_WIDTH / 2, 80, 0, MARGIN, SVG_WIDTH - MARGIN);
  }, [tree]);

  // Generate edges with highlight information
  const edges = useMemo(() => {
    const edgeList = [];
    nodePositions.forEach(({ node, x, y }) => {
      const leftChild = nodePositions.find(pos => pos.node === node.left);
      const rightChild = nodePositions.find(pos => pos.node === node.right);

      if (leftChild) {
        // Check if this edge is part of the highlighted path
        const isHighlighted = highlightedPath.includes(node.value) && highlightedPath.includes(leftChild.node.value);
        edgeList.push({
          x1: x,
          y1: y,
          x2: leftChild.x,
          y2: leftChild.y,
          isHighlighted
        });
      }

      if (rightChild) {
        // Check if this edge is part of the highlighted path
        const isHighlighted = highlightedPath.includes(node.value) && highlightedPath.includes(rightChild.node.value);
        edgeList.push({
          x1: x,
          y1: y,
          x2: rightChild.x,
          y2: rightChild.y,
          isHighlighted
        });
      }
    });
    return edgeList;
  }, [nodePositions, highlightedPath]);

  if (!tree) {
    return (
      <div className="flex items-center justify-center w-full h-96 border-2 border-dashed border-gray-300 rounded-lg">
        <p className="text-gray-500 text-lg">Tree is empty. Insert some values to visualize!</p>
      </div>
    );
  }

  return (
    <svg
      width="100%"
      height="100%"
      viewBox={`0 0 ${SVG_WIDTH} ${SVG_HEIGHT}`}
      className="w-full h-full"
      preserveAspectRatio="xMidYMid meet"
    >
          {/* Render edges first (behind nodes) */}
          {edges.map((edge, index) => (
            <line
              key={`edge-${index}`}
              x1={edge.x1}
              y1={edge.y1}
              x2={edge.x2}
              y2={edge.y2}
              stroke={edge.isHighlighted ? '#f97316' : '#374151'}
              strokeWidth={edge.isHighlighted ? '2.5' : '1.5'}
              className="transition-all duration-300"
            />
          ))}

          {/* Render nodes */}
          {nodePositions.map(({ node, x, y }, index) => {
            const isHighlighted = node.highlight || highlightedPath.includes(node.value);
            
            return (
              <g key={`node-${index}`} className="transition-all duration-300">
                {/* Node circle */}
                <circle
                  cx={x}
                  cy={y}
                  r={NODE_RADIUS}
                  fill={isHighlighted ? '#f97316' : '#3b82f6'}
                  stroke={isHighlighted ? '#ea580c' : '#1d4ed8'}
                  strokeWidth="2"
                  className="transition-all duration-300 hover:scale-110 cursor-pointer"
                />
                
                {/* Node value text */}
                <text
                  x={x}
                  y={y}
                  textAnchor="middle"
                  dominantBaseline="middle"
                  fill="white"
                  fontSize="14"
                  fontWeight="bold"
                  className="pointer-events-none select-none"
                >
                  {node.value}
                </text>

                {/* Highlight ring for animated effects */}
                {isHighlighted && (
                  <circle
                    cx={x}
                    cy={y}
                    r={NODE_RADIUS + 5}
                    fill="none"
                    stroke="#f97316"
                    strokeWidth="2"
                    strokeDasharray="5,5"
                    className="animate-pulse"
                  />
                )}
              </g>
            );
          })}
    </svg>
  );
};

export default TreeCanvas;
