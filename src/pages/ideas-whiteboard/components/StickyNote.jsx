import React, { useState, useRef, useEffect } from 'react';
import { useDrag } from 'react-dnd';
import Icon from '@/src/components/AppIcon';
import Button from '@/src/components/ui/Button';
import { useRouter } from 'next/router';

const StickyNote = ({ 
  note, 
  onUpdate, 
  onDelete, 
  onSelect, 
  isSelected, 
  onConnect,
  onGlobalSearch,
  scale = 1 
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState(note.content);
  const [editTitle, setEditTitle] = useState(note.title);
  const textareaRef = useRef(null);
  const containerRef = useRef(null);
  const router = useRouter();

  const [{ isDragging }, drag] = useDrag({
    type: 'sticky-note',
    item: { id: note.id, type: 'sticky-note' },
    collect: (monitor) => ({ isDragging: monitor.isDragging() }),
  });

  useEffect(() => { if (isEditing && textareaRef.current) textareaRef.current.focus(); }, [isEditing]);

  // Save on outside click when editing
  useEffect(() => {
    const handler = (e) => {
      if (!isEditing) return;
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        handleSave();
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [isEditing, editTitle, editContent]);

  const handleDoubleClick = () => { setIsEditing(true); };

  const handleSave = () => {
    onUpdate(note.id, { title: editTitle.trim() || 'Untitled', content: editContent.trim() || 'No content' });
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditTitle(note.title);
    setEditContent(note.content);
    setIsEditing(false);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && e.ctrlKey) {
      handleSave();
    } else if (e.key === 'Escape') {
      handleCancel();
    }
  };

  const getColorClasses = (color) => {
    // Normalize hex to name mapping (fallback to yellow)
    const hexToName = {
      '#FFFF00': 'yellow',
      '#3B82F6': 'blue',
      '#22C55E': 'green',
      '#EC4899': 'pink',
      '#A855F7': 'purple',
    };
    if (color && color.startsWith('#')) {
      color = hexToName[color.toUpperCase()] || 'yellow';
    }

    const colorMap = {
      yellow: 'bg-yellow-100 border-yellow-400 text-yellow-900',
      blue: 'bg-blue-100 border-blue-400 text-blue-900',
      green: 'bg-green-100 border-green-400 text-green-900',
      pink: 'bg-pink-100 border-pink-400 text-pink-900',
      purple: 'bg-purple-100 border-purple-400 text-purple-900'
    };
    return colorMap[color] || colorMap.yellow;
  };

  const cycleColor = () => {
    // Best 5-color palette (names) mapped to hex for persistence
    const order = ['yellow', 'blue', 'green', 'pink', 'purple'];
    const nameToHex = {
      yellow: '#FFFF00',
      blue: '#3B82F6',
      green: '#22C55E',
      pink: '#EC4899',
      purple: '#A855F7',
    };
    const hexToName = {
      '#FFFF00': 'yellow',
      '#3B82F6': 'blue',
      '#22C55E': 'green',
      '#EC4899': 'pink',
      '#A855F7': 'purple',
    };
    const currentHex = (note.color || '').toUpperCase();
    const currentName = hexToName[currentHex] || 'yellow';
    const idx = order.indexOf(currentName);
    const nextName = order[(idx + 1) % order.length];
    const nextHex = nameToHex[nextName];
    onUpdate(note.id, { color: nextHex });
  };

  return (
    <div
      ref={(el) => { drag(el); containerRef.current = el; }}
      className={`absolute cursor-move select-none transition-all duration-200 ${isDragging ? 'opacity-50 scale-105' : 'opacity-100'} ${isSelected ? 'ring-2 ring-primary ring-offset-2' : ''}`}
      style={{ left: note.position.x, top: note.position.y, transform: `scale(${scale})`, transformOrigin: 'top left', zIndex: isSelected ? 1000 : note.zIndex || 1 }}
      onClick={() => onSelect(note.id)}
      onDoubleClick={handleDoubleClick}
    >
      <div className={`w-64 h-48 p-4 rounded-lg border-2 shadow-lg hover:shadow-xl transition-shadow ${getColorClasses(note.color)} text-current`}>
        <div className="flex items-start justify-between mb-2">
          {isEditing ? (
            <input type="text" value={editTitle} onChange={(e) => setEditTitle(e.target.value)} className="flex-1 text-sm font-semibold bg-transparent border-none outline-none resize-none placeholder:text-gray-500 text-gray-900" placeholder="Note title..." onKeyDown={handleKeyDown} />
          ) : (
            <h3 className="text-sm font-semibold line-clamp-1">{note.title}</h3>
          )}
          {!isEditing && (
            <div className="flex items-center space-x-1 ml-2">
              <Button variant="ghost" size="icon" onClick={(e) => { e.stopPropagation(); setIsEditing(true); }} className="w-6 h-6 hover:bg-white/50 text-current" title="Edit note"><Icon name="Pencil" size={12} /></Button>
              <Button variant="ghost" size="icon" onClick={(e) => { e.stopPropagation(); cycleColor(); }} className="w-6 h-6 hover:bg-white/50 text-current" title="Change color"><Icon name="Palette" size={12} /></Button>
              <Button variant="ghost" size="icon" onClick={(e) => { e.stopPropagation(); router.push(`/search?q=${encodeURIComponent(note.content || '')}`); }} className="w-6 h-6 hover:bg-white/50 text-current" title="Search this idea"><Icon name="Globe" size={14} /></Button>
              {/* <Button variant="ghost" size="icon" onClick={(e) => { e.stopPropagation(); onDelete(note.id); }} className="w-6 h-6 hover:bg-red-100 text-red-600" title="Delete note"><Icon name="Trash2" size={12} /></Button> */}
            </div>
          )}
        </div>
        <div className="flex-1 mb-3">
          {isEditing ? (
            <textarea ref={textareaRef} value={editContent} onChange={(e) => setEditContent(e.target.value)} className="w-full h-20 text-xs bg-transparent border-none outline-none resize-none placeholder:text-gray-500 text-gray-900" placeholder="Write your idea here..." onKeyDown={handleKeyDown} />
          ) : (
            <p className="text-xs line-clamp-4 leading-relaxed">{note.content}</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default StickyNote;