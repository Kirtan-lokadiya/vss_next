import React from 'react';

const ConnectionLine = ({ from, to, color = '#6366f1', strokeWidth = 2 }) => {
  // Calculate the path for a curved connection line
  const calculatePath = () => {
    const dx = to.x - from.x;
    const dy = to.y - from.y;
    
    // Control points for bezier curve
    const cp1x = from.x + dx * 0.5;
    const cp1y = from.y;
    const cp2x = to.x - dx * 0.5;
    const cp2y = to.y;
    
    return `M ${from.x} ${from.y} C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${to.x} ${to.y}`;
  };

  // Calculate arrow head points
  const calculateArrowHead = () => {
    const angle = Math.atan2(to.y - from.y, to.x - from.x);
    const arrowLength = 10;
    const arrowAngle = Math.PI / 6;
    
    const x1 = to.x - arrowLength * Math.cos(angle - arrowAngle);
    const y1 = to.y - arrowLength * Math.sin(angle - arrowAngle);
    const x2 = to.x - arrowLength * Math.cos(angle + arrowAngle);
    const y2 = to.y - arrowLength * Math.sin(angle + arrowAngle);
    
    return `M ${to.x} ${to.y} L ${x1} ${y1} M ${to.x} ${to.y} L ${x2} ${y2}`;
  };

  return (
    <svg
      className="absolute inset-0 pointer-events-none"
      style={{
        width: '100%',
        height: '100%',
        overflow: 'visible'
      }}
    >
      <defs>
        <marker
          id={`arrowhead-${color.replace('#', '')}`}
          markerWidth="10"
          markerHeight="7"
          refX="9"
          refY="3.5"
          orient="auto"
        >
          <polygon
            points="0 0, 10 3.5, 0 7"
            fill={color}
          />
        </marker>
      </defs>
      
      {/* Main connection line */}
      <path
        d={calculatePath()}
        stroke={color}
        strokeWidth={strokeWidth}
        fill="none"
        markerEnd={`url(#arrowhead-${color.replace('#', '')})`}
        className="drop-shadow-sm"
      />
      
      {/* Connection points */}
      <circle
        cx={from.x}
        cy={from.y}
        r="3"
        fill={color}
        className="drop-shadow-sm"
      />
      <circle
        cx={to.x}
        cy={to.y}
        r="3"
        fill={color}
        className="drop-shadow-sm"
      />
    </svg>
  );
};

export default ConnectionLine;