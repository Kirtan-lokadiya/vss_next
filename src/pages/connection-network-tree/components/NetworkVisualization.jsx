import React, { useState, useRef, useEffect } from 'react';
import Icon from '@/src/components/AppIcon';
import Button from '@/src/components/ui/Button';
import { getAuthToken, getConnectionStatus, sendConnectionRequest, cancelConnection, fetchPostGraph } from '@/src/utils/api';
import { extractUserId } from '@/src/utils/jwt';

const NetworkVisualization = ({
  connections,
  selectedNode,
  onNodeSelect,
  viewMode,
  onViewModeChange,
  className = '',
  showControls = true,
  showLegend = true,
  postId = null, // When showing graph for a specific post
  isPostGraph = false, // Whether this is a post graph or user connection graph
}) => {
  const [currentUserId, setCurrentUserId] = useState(null);
  
  useEffect(() => {
    const token = getAuthToken();
    if (token) {
      try {
        const userId = extractUserId(token);
        setCurrentUserId(userId);
      } catch (e) {
        console.error('Failed to extract user ID:', e);
      }
    }
  }, []);
  const containerRef = useRef(null);
  const svgRef = useRef(null);
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [hoveredConnection, setHoveredConnection] = useState(null);
  const [popup, setPopup] = useState(null); // {x,y,connection}
  const [connectionStatusByUser, setConnectionStatusByUser] = useState({});
  const [connecting, setConnecting] = useState(false);
  const [postGraphData, setPostGraphData] = useState(null);
  const [loadingPostGraph, setLoadingPostGraph] = useState(false);

  // Load post graph data if this is a post graph
  useEffect(() => {
    const loadPostGraph = async () => {
      if (!isPostGraph || !postId) return;
      
      try {
        setLoadingPostGraph(true);
        const token = getAuthToken();
        const data = await fetchPostGraph({ postId, token });
        setPostGraphData(data);
      } catch (err) {
        console.error('Failed to load post graph:', err);
      } finally {
        setLoadingPostGraph(false);
      }
    };

    loadPostGraph();
  }, [isPostGraph, postId]);

  // Use post graph data if available, otherwise use connections
  const displayConnections = isPostGraph && postGraphData ? 
    (postGraphData.users || []).map(apiUser => ({
      id: apiUser.id,
      name: apiUser.name,
      avatar: apiUser.picture !== 'NONE' ? apiUser.picture : null,
      title: '',
      company: '',
      interactions: 0
    })) : connections;

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
    const list = displayConnections || [];
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

  // Convert an SVG-space point (node position) to container coordinates
  const mapSvgPointToContainer = (svgPoint) => {
    const container = containerRef.current;
    if (!container) return { left: 0, top: 0 };
    // Calculate position relative to container, accounting for pan and zoom
    const left = (svgPoint.x * zoom) + pan.x;
    const top = (svgPoint.y * zoom) + pan.y;
    return { left, top };
  };

  const setPopupPositionFromSvg = (svgPoint, connection) => {
    const { left, top } = mapSvgPointToContainer(svgPoint);
    const container = containerRef.current;
    if (!container) return;
    
    const containerRect = container.getBoundingClientRect();
    const popupWidth = 200; // Approximate popup width
    const popupHeight = 120; // Approximate popup height
    
    // Adjust position to keep popup within container bounds
    let x = left + 16;
    let y = top - 20;
    
    // Keep popup within container bounds
    if (x + popupWidth > containerRect.width) {
      x = left - popupWidth - 16;
    }
    if (y < 0) {
      y = top + 40;
    }
    if (y + popupHeight > containerRect.height) {
      y = containerRect.height - popupHeight - 10;
    }
    
    setPopup({ x: Math.max(10, x), y: Math.max(10, y), connection });
  };

  const handleNodeClick = (node, position) => {
    onNodeSelect(node);
    if (node && position) {
      // Set popup with proper screen coordinates
      setPopupPositionFromSvg(position, node);
      
      // Only fetch connection status for post graphs, not connection network graphs
      if (isPostGraph && node?.id && node.id !== currentUserId && node.id !== 'user') {
        const token = getAuthToken();
        if (token) {
          getConnectionStatus({ targetUserId: node.id, token }).then((status) => {
            setConnectionStatusByUser(prev => ({ ...prev, [node.id]: status || 'NOT_SEND' }));
          }).catch((err) => {
            console.error('Failed to get connection status:', err);
            setConnectionStatusByUser(prev => ({ ...prev, [node.id]: 'NOT_SEND' }));
          });
        }
      }
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

  // Close popup when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (popup && containerRef.current && !containerRef.current.contains(e.target)) {
        setPopup(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [popup]);

  return (
    <div ref={containerRef} className={`relative bg-white border border-border rounded-lg overflow-hidden ${className}`}>
      {showControls && (
        <div className="absolute top-4 left-4 z-10 flex items-center space-x-2">
          {[{ value: 'tree', label: 'Tree View', icon: 'GitBranch' }, { value: 'force', label: 'Force Graph', icon: 'Zap' }, { value: 'circular', label: 'Circular', icon: 'Circle' }].map((mode) => (
            <Button key={mode.value} variant={viewMode === mode.value ? 'default' : 'outline'} size="sm" onClick={() => onViewModeChange(mode.value)} iconName={mode.icon} iconPosition="left" iconSize={16}>{mode.label}</Button>
          ))}
        </div>
      )}

      <svg ref={svgRef} width="100%" height="600" viewBox="0 0 800 600" className="cursor-grab active:cursor-grabbing" style={{ cursor: isDragging ? 'grabbing' : 'grab' }}>
        <g transform={`translate(${pan.x}, ${pan.y}) scale(${zoom})`}>
          {/* Lines from center to each node */}
          {displayConnections.map((connection) => {
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

          {/* Center user node */}
          {(() => {
            const up = nodePositions.get('user');
            if (!up) return null;
            return (
              <g key="user-node">
                <circle cx={up.x} cy={up.y} r={24} fill="#0A66C2" stroke="#FFFFFF" strokeWidth={3} />
                {isPostGraph ? (
                  <g>
                    {/* Lightbulb body */}
                    <circle cx={up.x} cy={up.y-1} r="8" fill="#FFD700" stroke="#FFA500" strokeWidth="2" />
                    {/* Lightbulb base */}
                    <rect x={up.x-4} y={up.y+7} width="8" height="4" rx="1" fill="#C0C0C0" stroke="#808080" strokeWidth="1" />
                    {/* Filament lines */}
                    <line x1={up.x-4} y1={up.y-4} x2={up.x+4} y2={up.y+2} stroke="#FF8C00" strokeWidth="1.5" />
                    <line x1={up.x-4} y1={up.y+2} x2={up.x+4} y2={up.y-4} stroke="#FF8C00" strokeWidth="1.5" />
                  </g>
                ) : (
                  <text x={up.x} y={up.y + 4} textAnchor="middle" className="text-xs fill-white font-medium">Idea</text>
                )}
              </g>
            );
          })()}

          {displayConnections.map((connection) => {
            const position = nodePositions.get(connection.id);
            if (!position) return null;
            return (
              <g key={connection.id} onClick={() => handleNodeClick({...connection, x: position.x, y: position.y}, position)} onMouseEnter={() => handleConnectionHover(connection.id)} onMouseLeave={() => handleConnectionHover(null)} className="cursor-pointer">
                <defs>
                  <clipPath id={`clip-${connection.id}`}>
                    <circle cx={position.x} cy={position.y} r={20} />
                  </clipPath>
                </defs>
                <circle cx={position.x} cy={position.y} r={20} fill={getNodeColor(connection)} stroke="#FFFFFF" strokeWidth={3} />
                {connection.avatar ? (
                  <image href={connection.avatar} x={position.x - 20} y={position.y - 20} width="40" height="40" preserveAspectRatio="xMidYMid slice" clipPath={`url(#clip-${connection.id})`} />
                ) : (
                  <text x={position.x} y={position.y + 4} textAnchor="middle" className="text-sm fill-white font-semibold">{connection.name?.charAt(0)?.toUpperCase() || 'U'}</text>
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
        <div className="absolute z-50 bg-white border border-border rounded-lg shadow-lg p-3 min-w-48" style={{ left: popup.x, top: popup.y }} onClick={(e) => e.stopPropagation()}>
          <div className="flex items-center space-x-3 mb-3">
            <div className="w-12 h-12 rounded-full overflow-hidden bg-muted flex-shrink-0">
              {popup.connection.avatar ? (
                <img src={popup.connection.avatar} alt={popup.connection.name} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full bg-primary flex items-center justify-center">
                  <span className="text-white font-semibold text-lg">{popup.connection.name?.charAt(0)?.toUpperCase() || 'U'}</span>
                </div>
              )}
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-foreground">{popup.connection.name}</h3>
              <p className="text-sm text-text-secondary">{popup.connection.title || 'User'}</p>
            </div>
          </div>
          <div className="flex items-center justify-between">
            <div className="flex space-x-2">
              <a href={`/user/${popup.connection.id}`} className="text-sm text-primary hover:no-underline">View Profile</a>
              <button className="text-sm bg-primary text-white hover:bg-primary/90 px-3 py-1 rounded flex items-center space-x-1">
                <Icon name="MessageCircle" size={14} />
                <span>Message</span>
              </button>
            </div>
            {(() => {
              if (!isPostGraph || popup.connection.id === currentUserId || popup.connection.id === 'user') {
                return null;
              }
              
              const status = connectionStatusByUser[popup.connection.id] || 'NOT_SEND';
              if (status === 'PENDING') {
                return (
                  <Button size="sm" variant="outline" disabled={connecting} onClick={async () => {
                    try {
                      setConnecting(true);
                      const token = getAuthToken();
                      await cancelConnection({ targetUserId: popup.connection.id, token });
                      setConnectionStatusByUser(prev => ({ ...prev, [popup.connection.id]: 'NOT_SEND' }));
                    } catch (err) {
                      console.error('Failed to cancel connection:', err);
                    } finally { setConnecting(false); }
                  }}>Cancel</Button>
                );
              }
              if (status === 'CONNECT') {
                return <span className="text-xs text-success">Connected</span>;
              }
              if (status === 'REJECTED') {
                return <span className="text-xs text-destructive">Rejected</span>;
              }
              return (
                <Button size="sm" variant="default" disabled={connecting} onClick={async () => {
                  try {
                    setConnecting(true);
                    const token = getAuthToken();
                    const message = `Hello ${popup.connection.name}, I'd like to connect with you!`;
                    await sendConnectionRequest({ targetUserId: popup.connection.id, message, token });
                    setConnectionStatusByUser(prev => ({ ...prev, [popup.connection.id]: 'PENDING' }));
                  } catch (err) {
                    console.error('Failed to send connection request:', err);
                  } finally { setConnecting(false); }
                }}>Connect</Button>
              );
            })()
            }
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