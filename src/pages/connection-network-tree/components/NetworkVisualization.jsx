import React, { useState, useRef, useEffect } from 'react';
import Icon from '@/src/components/AppIcon';
import Button from '@/src/components/ui/Button';

const NetworkVisualization = ({
  connections,
  selectedNode,
  onNodeSelect,
  viewMode,
  onViewModeChange,
  className = '',
  showControls = true,
  showLegend = true,
}) => {
  const containerRef = useRef(null);
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

  const calculateNodePositions = () => {
    const centerX = 400;
    const centerY = 300;
    const positions = new Map();
    positions.set('user', { x: centerX, y: centerY });
    const list = connections || [];
    list.forEach((connection, index) => {
      const angle = (index / Math.max(1, list.length)) * 2 * Math.PI;
      const radius = viewMode === 'circular' ? 200 : 150;
      positions.set(connection.id, { x: centerX + Math.cos(angle) * radius, y: centerY + Math.sin(angle) * radius });
      connection.mutualConnections?.forEach((mutual, mIndex) => {
        const subAngle = angle + (mIndex - 1) * 0.3;
        const subRadius = 250;
        positions.set(`${connection.id}-${mutual.id}`, { x: centerX + Math.cos(subAngle) * subRadius, y: centerY + Math.sin(subAngle) * subRadius });
      });
    });
    return positions;
  };

  const nodePositions = calculateNodePositions();

  const handleMouseDown = (e) => {
    setIsDragging(true);
    setDragStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
  };

  const handleMouseMove = (e) => {
    if (isDragging) {
      setPan({ x: e.clientX - dragStart.x, y: e.clientY - dragStart.y });
      // move popup along with pan
      if (popup?.connection) {
        const pos = nodePositions.get(popup.connection.id === 'user' ? 'user' : popup.connection.id);
        if (pos) setPopupPositionFromSvg(pos, popup.connection);
      }
    }
  };

  const handleMouseUp = () => { setIsDragging(false); };

  // Convert an SVG-space point (node position) to container-local CSS left/top
  const mapSvgPointToContainer = (svgPoint) => {
    const container = containerRef.current;
    const svg = svgRef.current;
    if (!container || !svg) return { left: 0, top: 0 };
    const containerRect = container.getBoundingClientRect();
    const svgRect = svg.getBoundingClientRect();
    const left = (svgRect.left - containerRect.left) + pan.x + svgPoint.x * zoom;
    const top = (svgRect.top - containerRect.top) + pan.y + svgPoint.y * zoom;
    return { left, top };
  };

  const setPopupPositionFromSvg = (svgPoint, connection) => {
    const { left, top } = mapSvgPointToContainer(svgPoint);
    setPopup({ x: left + 16, y: top - 20, connection });
  };

  const handleNodeClick = (node, position) => {
    onNodeSelect(node);
    if (node && position) {
      setPopupPositionFromSvg(position, node);
    }
  };

  const handleConnectionHover = (connectionId) => { setHoveredConnection(connectionId); };

  const getConnectionStrength = (connection) => {
    const interactions = connection.interactions || 0;
    if (interactions > 50) return 'strong';
    if (interactions > 20) return 'medium';
    return 'weak';
  };

  const getNodeColor = (connection) => {
    const strength = getConnectionStrength(connection);
    switch (strength) { case 'strong': return '#0A66C2'; case 'medium': return '#42B883'; default: return '#65676B'; }
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
  }, [isDragging, dragStart, pan, popup, zoom]);

  return (
    <div ref={containerRef} className={`relative bg-white border border-border rounded-lg overflow-hidden ${className}`}>
      {showControls && (
        <div className="absolute top-4 left-4 z-10 flex items-center space-x-2">
          {[{ value: 'tree', label: 'Tree View', icon: 'GitBranch' }, { value: 'force', label: 'Force Graph', icon: 'Zap' }, { value: 'circular', label: 'Circular', icon: 'Circle' }].map((mode) => (
            <Button key={mode.value} variant={viewMode === mode.value ? 'default' : 'outline'} size="sm" onClick={() => onViewModeChange(mode.value)} iconName={mode.icon} iconPosition="left" iconSize={16}>{mode.label}</Button>
          ))}
        </div>
      )}

      <svg ref={svgRef} width="100%" height="600" className="cursor-grab active:cursor-grabbing" style={{ cursor: isDragging ? 'grabbing' : 'grab' }}>
        <g transform={`translate(${pan.x}, ${pan.y}) scale(${zoom})`}>
          {/* Center user node */}
          {(() => {
            const up = nodePositions.get('user');
            if (!up) return null;
            return (
              <g key="user-node">
                <circle cx={up.x} cy={up.y} r={24} fill="#0A66C2" stroke="#FFFFFF" strokeWidth={3} />
                <text x={up.x} y={up.y + 40} textAnchor="middle" className="text-xs fill-foreground">Idea</text>
              </g>
            );
          })()}

          {/* Lines from center to each node */}
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

          {connections.map((connection) => {
            const position = nodePositions.get(connection.id);
            if (!position) return null;
            return (
              <g key={connection.id} onClick={() => handleNodeClick(connection, position)} onMouseEnter={() => handleConnectionHover(connection.id)} onMouseLeave={() => handleConnectionHover(null)} className="cursor-pointer">
                <defs>
                  <clipPath id={`clip-${connection.id}`}>
                    <circle cx={position.x} cy={position.y} r={20} />
                  </clipPath>
                </defs>
                <circle cx={position.x} cy={position.y} r={20} fill={getNodeColor(connection)} stroke="#FFFFFF" strokeWidth={3} />
                {connection.avatar && (
                  <image href={connection.avatar} x={position.x - 20} y={position.y - 20} width="40" height="40" preserveAspectRatio="xMidYMid slice" clipPath={`url(#clip-${connection.id})`} />
                )}
                <circle cx={position.x} cy={position.y} r={20} fill="none" stroke="#FFFFFF" strokeWidth={3} />
                <text x={position.x} y={position.y + 35} textAnchor="middle" className="text-xs fill-foreground">{connection.name.split(' ')[0]}</text>
                <circle cx={position.x + 15} cy={position.y - 15} r={4} fill={getNodeColor(connection)} className="opacity-80" />
              </g>
            );
          })}
        </g>
      </svg>

      {popup && (
        <div className="absolute" style={{ left: popup.x + 'px', top: popup.y + 'px' }}>
          <div className="bg-card border border-border rounded-md shadow-card p-3 w-56">
            <div className="flex items-center gap-2 mb-2">
              {popup.connection.avatar ? <img src={popup.connection.avatar} alt="avatar" className="w-10 h-10 rounded-full object-cover" /> : <div className="w-10 h-10 rounded-full bg-primary" />}
              <div><div className="text-sm font-semibold text-foreground">{popup.connection.name}</div></div>
            </div>
            <div className="flex justify-end"><a href="/profile" className="text-sm text-primary hover:underline">View Profile</a></div>
          </div>
        </div>
      )}

      {showLegend && (
        <div className="absolute bottom-4 left-4 bg-white border border-border rounded-lg p-3 shadow-card">
          <h4 className="text-sm font-semibold text-foreground mb-2">Connection Strength</h4>
          <div className="space-y-2">
            <div className="flex items-center space-x-2"><div className="w-3 h-3 rounded-full bg-primary"></div><span className="text-xs text-text-secondary">Strong (50+ interactions)</span></div>
            <div className="flex items-center space-x-2"><div className="w-3 h-3 rounded-full bg-success"></div><span className="text-xs text-text-secondary">Medium (20-50 interactions)</span></div>
            <div className="flex items-center space-x-2"><div className="w-3 h-3 rounded-full bg-secondary"></div><span className="text-xs text-text-secondary">Weak (&lt;20 interactions)</span></div>
          </div>
        </div>
      )}
    </div>
  );
};

export default NetworkVisualization;