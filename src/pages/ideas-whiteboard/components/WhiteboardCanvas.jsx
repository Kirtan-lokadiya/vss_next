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
  scale,
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

  // Note card nominal size (matches StickyNote): 256x192 (w-64 h-48)
  const NOTE_WIDTH = 256;
  const NOTE_HEIGHT = 192;

  const getNoteCenter = (note) => ({
    x: note.position.x + NOTE_WIDTH / 2,
    y: note.position.y + NOTE_HEIGHT / 2,
  });

  // Compute intersection of line from center(source) to center(target) with source rectangle bounds
  const getEdgeIntersectionPoint = (sourceNote, targetCenter) => {
    const sx = sourceNote.position.x;
    const sy = sourceNote.position.y;
    const ex = sx + NOTE_WIDTH;
    const ey = sy + NOTE_HEIGHT;
    const cx = sx + NOTE_WIDTH / 2;
    const cy = sy + NOTE_HEIGHT / 2;

    const dx = targetCenter.x - cx;
    const dy = targetCenter.y - cy;

    // Prevent division by zero
    const EPS = 1e-6;
    const tCandidates = [];

    // Left edge (x = sx)
    if (Math.abs(dx) > EPS) {
      const tLeft = (sx - cx) / dx;
      const yAtLeft = cy + tLeft * dy;
      if (tLeft >= 0 && yAtLeft >= sy && yAtLeft <= ey) tCandidates.push({ t: tLeft, x: sx, y: yAtLeft });
    }
    // Right edge (x = ex)
    if (Math.abs(dx) > EPS) {
      const tRight = (ex - cx) / dx;
      const yAtRight = cy + tRight * dy;
      if (tRight >= 0 && yAtRight >= sy && yAtRight <= ey) tCandidates.push({ t: tRight, x: ex, y: yAtRight });
    }
    // Top edge (y = sy)
    if (Math.abs(dy) > EPS) {
      const tTop = (sy - cy) / dy;
      const xAtTop = cx + tTop * dx;
      if (tTop >= 0 && xAtTop >= sx && xAtTop <= ex) tCandidates.push({ t: tTop, x: xAtTop, y: sy });
    }
    // Bottom edge (y = ey)
    if (Math.abs(dy) > EPS) {
      const tBottom = (ey - cy) / dy;
      const xAtBottom = cx + tBottom * dx;
      if (tBottom >= 0 && xAtBottom >= sx && xAtBottom <= ex) tCandidates.push({ t: tBottom, x: xAtBottom, y: ey });
    }

    if (tCandidates.length === 0) return { x: cx, y: cy };
    // Choose the smallest positive t (closest intersection in the forward direction)
    tCandidates.sort((a, b) => a.t - b.t);
    return { x: tCandidates[0].x, y: tCandidates[0].y };
  };

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

          const isFromIdea = (fromNote.title || '').trim().toLowerCase() === 'idea';
          const toCenter = getNoteCenter(toNote);
          const fromStart = isFromIdea ? getEdgeIntersectionPoint(fromNote, toCenter) : getNoteCenter(fromNote);

          return (
            <ConnectionLine
              key={index}
              from={fromStart}
              to={toCenter}
              color={conn.color}
              showFromCircle={!isFromIdea}
            />
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