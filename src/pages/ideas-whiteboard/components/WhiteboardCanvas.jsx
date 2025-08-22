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
  onCanvasClick,
  onGlobalSearch
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

  const handleMouseDown = (e) => {
    if (e.button === 1 || (e.button === 0 && e.ctrlKey)) {
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
      document.body.style.cursor = 'grabbing';
    } else {
      document.body.style.cursor = 'default';
    }
    return () => {
      document.body.style.cursor = 'default';
    };
  }, [isPanning]);

  return (
    <div
      ref={canvasRef}
      className="absolute inset-0 overflow-hidden"
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onClick={handleCanvasClick}
      style={{
        backgroundImage: `radial-gradient(circle, #e5e7eb 1px, transparent 1px)`,
        backgroundSize: `${20 * scale}px ${20 * scale}px`,
        backgroundPosition: `${panOffset.x}px ${panOffset.y}px`
      }}
    >
      <div
        ref={drop}
        className="absolute inset-0"
        style={{
          transform: `translate(${panOffset.x}px, ${panOffset.y}px) scale(${scale})`,
          transformOrigin: '0 0'
        }}
      >
        {/* Connections */}
        {connections.map((conn, index) => {
          const fromNote = notes.find(n => n.id === conn.from);
          const toNote = notes.find(n => n.id === conn.to);
          if (!fromNote || !toNote) return null;
          const from = { x: fromNote.position.x + 128, y: fromNote.position.y + 96 };
          const to = { x: toNote.position.x + 128, y: toNote.position.y + 96 };
          return (
            <ConnectionLine key={index} from={from} to={to} color={conn.color} />
          );
        })}

        {/* Notes */}
        {notes.map(note => (
          <StickyNote
            key={note.id}
            note={note}
            onUpdate={onUpdateNote}
            onDelete={onDeleteNote}
            onSelect={onSelectNote}
            isSelected={selectedNoteId === note.id}
            onGlobalSearch={onGlobalSearch}
            onConnect={() => {}}
          />
        ))}
      </div>
    </div>
  );
};

export default WhiteboardCanvas;