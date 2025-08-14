import React, { useState, useRef, useEffect } from 'react';
import Icon from '@/src/components/AppIcon';
import Button from '@/src/components/ui/Button';

const NetworkVisualization = ({ 
  connections, 
  selectedNode, 
  onNodeSelect, 
  viewMode, 
  onViewModeChange,
  
  className = '' 
}) => {
  const svgRef = useRef(null);
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [hoveredConnection, setHoveredConnection] = useState(null);
  const [popup, setPopup] = useState(null); // {x,y,connection}

  const viewModes = [
    { value: 'tree', label: 'Tree View', icon: 'GitBranch' },
    { value: 'force', label: 'Force Graph', icon: 'Zap' },
    { value: 'circular', label: 'Circular', icon: 'Circle' }
  ];

  // Calculate node positions based on view mode
  const calculateNodePositions = () => {
    const centerX = 400;
    const centerY = 300;
    const positions = new Map();

    // Central user node
    positions.set('user', { x: centerX, y: centerY });

    if (viewMode === 'tree') {
      // Hierarchical tree layout
      connections.forEach((connection, index) => {
        const angle = (index / connections.length) * 2 * Math.PI;
        const radius = 150;
        positions.set(connection.id, {
          x: centerX + Math.cos(angle) * radius,
          y: centerY + Math.sin(angle) * radius
        });

        // Secondary connections
        connection.mutualConnections?.forEach((mutual, mIndex) => {
          const subAngle = angle + (mIndex - 1) * 0.3;
          const subRadius = 250;
          positions.set(`${connection.id}-${mutual.id}`, {
            x: centerX + Math.cos(subAngle) * subRadius,
            y: centerY + Math.sin(subAngle) * subRadius
          });
        });
      });
    } else if (viewMode === 'circular') {
      // Circular layout
      connections.forEach((connection, index) => {
        const angle = (index / connections.length) * 2 * Math.PI;
        const radius = 200;
        positions.set(connection.id, {
          x: centerX + Math.cos(angle) * radius,
          y: centerY + Math.sin(angle) * radius
        });
      });
    } else {
      // Force-directed layout (simplified)
      connections.forEach((connection, index) => {
        const angle = Math.random() * 2 * Math.PI;
        const radius = 100 + Math.random() * 150;
        positions.set(connection.id, {
          x: centerX + Math.cos(angle) * radius,
          y: centerY + Math.sin(angle) * radius
        });
      });
    }

    return positions;
  };

  const nodePositions = calculateNodePositions();

  const handleMouseDown = (e) => {
    setIsDragging(true);
    setDragStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
  };

  const handleMouseMove = (e) => {
    if (isDragging) {
      setPan({
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y
      });
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };



  const handleNodeClick = (node, position) => {
    onNodeSelect(node);
    if (node && position) {
      setPopup({ x: position.x, y: position.y, connection: node });
    }
  };

  const handleConnectionHover = (connectionId) => {
    setHoveredConnection(connectionId);
  };


  const getConnectionStrength = (connection) => {
    const interactions = connection.interactions || 0;
    if (interactions > 50) return 'strong';
    if (interactions > 20) return 'medium';
    return 'weak';
  };

  const getNodeColor = (connection) => {
    const strength = getConnectionStrength(connection);
    switch (strength) {
      case 'strong': return '#0A66C2';
      case 'medium': return '#42B883';
      default: return '#65676B';
    }
  };

  useEffect(() => {
    const svg = svgRef.current;
    if (svg) {
      svg.addEventListener('mousedown', handleMouseDown);
      svg.addEventListener('mousemove', handleMouseMove);
      svg.addEventListener('mouseup', handleMouseUp);
      svg.addEventListener('mouseleave', handleMouseUp);

      return () => {
        svg.removeEventListener('mousedown', handleMouseDown);
        svg.removeEventListener('mousemove', handleMouseMove);
        svg.removeEventListener('mouseup', handleMouseUp);
        svg.removeEventListener('mouseleave', handleMouseUp);
      };
    }
  }, [isDragging, dragStart, pan]);

  return (
    <div className={`relative bg-white border border-border rounded-lg overflow-hidden ${className}`}>
      {/* View Mode Controls */}
      <div className="absolute top-4 left-4 z-10 flex items-center space-x-2">
        {viewModes.map((mode) => (
          <Button
            key={mode.value}
            variant={viewMode === mode.value ? 'default' : 'outline'}
            size="sm"
            onClick={() => onViewModeChange(mode.value)}
            iconName={mode.icon}
            iconPosition="left"
            iconSize={16}
          >
            {mode.label}
          </Button>
        ))}
      </div>

      

      {/* Network Visualization */}
      <svg
        ref={svgRef}
        width="100%"
        height="600"
        className="cursor-grab active:cursor-grabbing"
        style={{ cursor: isDragging ? 'grabbing' : 'grab' }}
      >
        <g transform={`translate(${pan.x}, ${pan.y}) scale(${zoom})`}>
          {/* Connection Lines */}
          {connections.map((connection) => {
            const userPos = nodePositions.get('user');
            const connectionPos = nodePositions.get(connection.id);
            
            if (!userPos || !connectionPos) return null;

            return (
              <line
                key={`line-${connection.id}`}
                x1={userPos.x}
                y1={userPos.y}
                x2={connectionPos.x}
                y2={connectionPos.y}
                stroke={hoveredConnection === connection.id ? '#0A66C2' : '#E4E6EA'}
                strokeWidth={hoveredConnection === connection.id ? 3 : 2}
                opacity={0.6}
                className="transition-all duration-200"
              />
            );
          })}

          {/* Mutual Connection Lines */}
          {connections.map((connection) => {
            const connectionPos = nodePositions.get(connection.id);
            
            return connection.mutualConnections?.map((mutual) => {
              const mutualPos = nodePositions.get(`${connection.id}-${mutual.id}`);
              
              if (!connectionPos || !mutualPos) return null;

              return (
                <line
                  key={`mutual-line-${connection.id}-${mutual.id}`}
                  x1={connectionPos.x}
                  y1={connectionPos.y}
                  x2={mutualPos.x}
                  y2={mutualPos.y}
                  stroke="#E4E6EA"
                  strokeWidth={1}
                  opacity={0.3}
                  strokeDasharray="5,5"
                />
              );
            });
          })}

          {/* Central User Node */}
          <g>
            <circle
              cx={nodePositions.get('user')?.x}
              cy={nodePositions.get('user')?.y}
              r={30}
              fill="#0A66C2"
              stroke="#FFFFFF"
              strokeWidth={4}
              className="cursor-pointer"
              onClick={() => handleNodeClick({ id: 'user', name: 'You' }, nodePositions.get('user'))}
            />
            <text
              x={nodePositions.get('user')?.x}
              y={nodePositions.get('user')?.y + 45}
              textAnchor="middle"
              className="text-sm font-semibold fill-foreground"
            >
              You
            </text>
          </g>

          {/* Connection Nodes */}
          {connections.map((connection) => {
            const position = nodePositions.get(connection.id);
            if (!position) return null;

            return (
              <g key={connection.id}>
                {/* Node as avatar circle */}
                <defs>
                  <pattern id={`avatar-${connection.id}`} patternUnits="objectBoundingBox" width="1" height="1">
                    <image href={connection.avatar} x="0" y="0" width="40" height="40" preserveAspectRatio="xMidYMid slice" />
                  </pattern>
                </defs>
                <circle
                  cx={position.x}
                  cy={position.y}
                  r={20}
                  fill={connection.avatar ? `url(#avatar-${connection.id})` : getNodeColor(connection)}
                  stroke="#FFFFFF"
                  strokeWidth={3}
                  className="cursor-pointer hover:stroke-primary transition-colors"
                  onClick={() => handleNodeClick(connection, position)}
                  onMouseEnter={() => handleConnectionHover(connection.id)}
                  onMouseLeave={() => handleConnectionHover(null)}
                />
                <text
                  x={position.x}
                  y={position.y + 35}
                  textAnchor="middle"
                  className="text-xs fill-foreground cursor-pointer"
                  onClick={() => handleNodeClick(connection)}
                >
                  {connection.name.split(' ')[0]}
                </text>
                
                {/* Connection strength indicator */}
                <circle
                  cx={position.x + 15}
                  cy={position.y - 15}
                  r={4}
                  fill={getNodeColor(connection)}
                  className="opacity-80"
                />
              </g>
            );
          })}

          {/* Mutual Connection Nodes */}
          {connections.map((connection) => {
            return connection.mutualConnections?.map((mutual) => {
              const position = nodePositions.get(`${connection.id}-${mutual.id}`);
              if (!position) return null;

              return (
                <g key={`mutual-${connection.id}-${mutual.id}`}>
                  <defs>
                    <pattern id={`avatar-${connection.id}-${mutual.id}`} patternUnits="objectBoundingBox" width="1" height="1">
                      <image href={mutual.avatar} x="0" y="0" width="24" height="24" preserveAspectRatio="xMidYMid slice" />
                    </pattern>
                  </defs>
                  <circle
                    cx={position.x}
                    cy={position.y}
                    r={12}
                    fill={mutual.avatar ? `url(#avatar-${connection.id}-${mutual.id})` : '#65676B'}
                    stroke="#FFFFFF"
                    strokeWidth={2}
                    className="cursor-pointer hover:stroke-primary transition-colors opacity-70"
                    onClick={() => handleNodeClick(mutual, position)}
                  />
                  <text
                    x={position.x}
                    y={position.y + 25}
                    textAnchor="middle"
                    className="text-xs fill-text-secondary cursor-pointer"
                    onClick={() => handleNodeClick(mutual)}
                  >
                    {mutual.name.split(' ')[0]}
                  </text>
                </g>
              );
            });
          })}
        </g>
      </svg>

      {/* Small Popup for node info */}
      {popup && (
        <div className="absolute" style={{ left: popup.x + 20, top: popup.y + 20 }}>
          <div className="bg-card border border-border rounded-md shadow-card p-3 w-56">
            <div className="flex items-center gap-2 mb-2">
              <img src={popup.connection.avatar} alt="avatar" className="w-10 h-10 rounded-full object-cover" />
              <div>
                <div className="text-sm font-semibold text-foreground">{popup.connection.name}</div>
              </div>
            </div>
            <div className="flex justify-end">
              <a href="/profile" className="text-sm text-primary hover:underline">View Profile</a>
            </div>
          </div>
        </div>
      )}

      {/* Legend */}
      <div className="absolute bottom-4 left-4 bg-white border border-border rounded-lg p-3 shadow-card">
        <h4 className="text-sm font-semibold text-foreground mb-2">Connection Strength</h4>
        <div className="space-y-2">
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 rounded-full bg-primary"></div>
            <span className="text-xs text-text-secondary">Strong (50+ interactions)</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 rounded-full bg-success"></div>
            <span className="text-xs text-text-secondary">Medium (20-50 interactions)</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 rounded-full bg-secondary"></div>
            <span className="text-xs text-text-secondary">Weak (&lt;20 interactions)</span>
          </div>
        </div>
      </div>

      
    </div>
  );
};

export default NetworkVisualization;