import React, { useRef, useEffect, useState } from 'react';
import { useDrop } from 'react-dnd';
import StickyNote from './StickyNote';
import ConnectionLine from './ConnectionLine';

const WhiteboardCanvas = ({
  notes,
  connections,
  onUpdateNote,
  onDeleteNote,
  onMoveNote,
  selectedNoteId,
  onSelectNote,
  onConnectNotes,
  scale,
  viewMode,
  onCanvasClick
}) => {
  const canvasRef = useRef(null);
  const [isPanning, setIsPanning] = useState(false);
  const [panStart, setPanStart] = useState({ x: 0, y: 0 });
  const [panOffset, setPanOffset] = useState({ x: 0, y: 0 });

  const [, drop] = useDrop({
    accept: 'sticky-note',
    drop: (item, monitor) => {
      const delta = monitor.getDifferenceFromInitialOffset();
      const note = notes.find(n => n.id === item.id);
      
      if (note && delta) {
        const newPosition = {
          x: Math.max(0, note.position.x + delta.x / scale),
          y: Math.max(0, note.position.y + delta.y / scale)
        };
        onMoveNote(item.id, newPosition);
      }
    },
  });

  // Handle mouse events for panning
  const handleMouseDown = (e) => {
    if (e.button === 1 || (e.button === 0 && e.ctrlKey)) { // Middle mouse or Ctrl+click
      setIsPanning(true);
      setPanStart({ x: e.clientX - panOffset.x, y: e.clientY - panOffset.y });
      e.preventDefault();
    }
  };

  const handleMouseMove = (e) => {
    if (isPanning) {
      setPanOffset({
        x: e.clientX - panStart.x,
        y: e.clientY - panStart.y
      });
    }
  };

  const handleMouseUp = () => {
    setIsPanning(false);
  };

  const handleCanvasClick = (e) => {
    if (e.target === canvasRef.current) {
      onCanvasClick();
    }
  };

  useEffect(() => {
    if (isPanning) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isPanning, panStart]);

  // Grid pattern for grid view mode
  const renderGrid = () => {
    if (viewMode !== 'grid') return null;

    const gridSize = 20 * scale;
    const canvasRect = canvasRef.current?.getBoundingClientRect();
    if (!canvasRect) return null;

    const lines = [];
    const width = canvasRect.width;
    const height = canvasRect.height;

    // Vertical lines
    for (let x = (panOffset.x % gridSize); x < width; x += gridSize) {
      lines.push(
        <line
          key={`v-${x}`}
          x1={x}
          y1={0}
          x2={x}
          y2={height}
          stroke="#e5e7eb"
          strokeWidth={0.5}
        />
      );
    }

    // Horizontal lines
    for (let y = (panOffset.y % gridSize); y < height; y += gridSize) {
      lines.push(
        <line
          key={`h-${y}`}
          x1={0}
          y1={y}
          x2={width}
          y2={y}
          stroke="#e5e7eb"
          strokeWidth={0.5}
        />
      );
    }

    return (
      <svg
        className="absolute inset-0 pointer-events-none"
        width="100%"
        height="100%"
      >
        {lines}
      </svg>
    );
  };

  return (
    <div
      ref={(node) => {
        canvasRef.current = node;
        drop(node);
      }}
      className={`relative w-full h-full overflow-hidden bg-white ${
        isPanning ? 'cursor-grabbing' : 'cursor-grab'
      }`}
      onMouseDown={handleMouseDown}
      onClick={handleCanvasClick}
      style={{
        backgroundImage: viewMode === 'grid' ? `radial-gradient(circle, #e5e7eb 1px, transparent 1px)` :'none',
        backgroundSize: viewMode === 'grid' ? `${20 * scale}px ${20 * scale}px` : 'auto',
        backgroundPosition: `${panOffset.x}px ${panOffset.y}px`
      }}
    >
      {/* Grid overlay */}
      {renderGrid()}

      {/* Canvas content container */}
      <div
        className="absolute inset-0"
        style={{
          transform: `translate(${panOffset.x}px, ${panOffset.y}px) scale(${scale})`,
          transformOrigin: '0 0'
        }}
      >
        {/* Connection lines */}
        {connections.map((connection) => {
          const fromNote = notes.find(n => n.id === connection.from);
          const toNote = notes.find(n => n.id === connection.to);
          
          if (!fromNote || !toNote) return null;
          
          return (
            <ConnectionLine
              key={`${connection.from}-${connection.to}`}
              from={{
                x: fromNote.position.x + 128, // Center of note (256/2)
                y: fromNote.position.y + 96   // Center of note (192/2)
              }}
              to={{
                x: toNote.position.x + 128,
                y: toNote.position.y + 96
              }}
              color={connection.color || '#6366f1'}
            />
          );
        })}

        {/* Sticky notes */}
        {notes.map((note) => (
          <StickyNote
            key={note.id}
            note={note}
            onUpdate={onUpdateNote}
            onDelete={onDeleteNote}
            onSelect={onSelectNote}
            isSelected={selectedNoteId === note.id}
            onConnect={onConnectNotes}
            scale={1} // Individual note scaling handled by canvas transform
          />
        ))}
      </div>

      {/* Canvas info overlay */}
      <div className="absolute bottom-4 left-4 bg-white/90 backdrop-blur-sm rounded-lg px-3 py-2 shadow-sm">
        <div className="flex items-center space-x-4 text-xs text-gray-600">
          <span>Notes: {notes.length}</span>
          <span>Zoom: {Math.round(scale * 100)}%</span>
          <span>Mode: {viewMode}</span>
        </div>
      </div>

      {/* Pan instructions */}
      {!isPanning && (
        <div className="absolute bottom-4 right-4 bg-white/90 backdrop-blur-sm rounded-lg px-3 py-2 shadow-sm">
          <p className="text-xs text-gray-600">
            Ctrl+Click or Middle mouse to pan
          </p>
        </div>
      )}
    </div>
  );
};

export default WhiteboardCanvas;