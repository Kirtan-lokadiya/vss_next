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
  scale = 1 
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState(note.content);
  const [editTitle, setEditTitle] = useState(note.title);
  const textareaRef = useRef(null);
  const router = useRouter();
  const navigate = router.push;

  const [{ isDragging }, drag] = useDrag({
    type: 'sticky-note',
    item: { id: note.id, type: 'sticky-note' },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  });

  useEffect(() => {
    if (isEditing && textareaRef.current) {
      textareaRef.current.focus();
    }
  }, [isEditing]);

  const handleDoubleClick = () => {
    setIsEditing(true);
  };

  const handleSave = () => {
    onUpdate(note.id, {
      title: editTitle.trim() || 'Untitled',
      content: editContent.trim() || 'No content'
    });
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
    const colorMap = {
      yellow: 'bg-yellow-200 border-yellow-300',
      blue: 'bg-blue-200 border-blue-300',
      green: 'bg-green-200 border-green-300',
      pink: 'bg-pink-200 border-pink-300',
      purple: 'bg-purple-200 border-purple-300',
      orange: 'bg-orange-200 border-orange-300'
    };
    return colorMap[color] || colorMap.yellow;
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div
      ref={drag}
      className={`absolute cursor-move select-none transition-all duration-200 ${
        isDragging ? 'opacity-50 scale-105' : 'opacity-100'
      } ${isSelected ? 'ring-2 ring-primary ring-offset-2' : ''}`}
      style={{
        left: note.position.x,
        top: note.position.y,
        transform: `scale(${scale})`,
        transformOrigin: 'top left',
        zIndex: isSelected ? 1000 : note.zIndex || 1
      }}
      onClick={() => onSelect(note.id)}
      onDoubleClick={handleDoubleClick}
    >
      <div
        className={`w-64 h-48 p-4 rounded-lg border-2 shadow-lg hover:shadow-xl transition-shadow ${getColorClasses(note.color)}`}
      >
        {/* Note Header */}
        <div className="flex items-start justify-between mb-2">
          {isEditing ? (
            <input
              type="text"
              value={editTitle}
              onChange={(e) => setEditTitle(e.target.value)}
              className="flex-1 text-sm font-semibold bg-transparent border-none outline-none resize-none"
              placeholder="Note title..."
              onKeyDown={handleKeyDown}
            />
          ) : (
            <h3 className="text-sm font-semibold text-gray-800 line-clamp-1">
              {note.title}
            </h3>
          )}
          
          {!isEditing && (
            <div className="flex items-center space-x-1 ml-2">
              <Button
                variant="ghost"
                size="icon"
                onClick={(e) => {
                  e.stopPropagation();
                  onConnect(note.id);
                }}
                className="w-6 h-6 hover:bg-white/50"
                title="Connect to other notes"
              >
                <Icon name="Link" size={12} />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete(note.id);
                }}
                className="w-6 h-6 hover:bg-red-100 text-red-600"
                title="Delete note"
              >
                <Icon name="Trash2" size={12} />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={(e) => {
                  e.stopPropagation();
                  navigate(`/search?q=${encodeURIComponent(note.title || '')}`);
                }}
                className="w-6 h-6 hover:bg-white/50"
                title="Search this idea"
              >
                <Icon name="Globe" size={14} />
              </Button>
            </div>
          )}
        </div>

        {/* Note Content */}
        <div className="flex-1 mb-3">
          {isEditing ? (
            <textarea
              ref={textareaRef}
              value={editContent}
              onChange={(e) => setEditContent(e.target.value)}
              className="w-full h-20 text-xs bg-transparent border-none outline-none resize-none"
              placeholder="Write your idea here..."
              onKeyDown={handleKeyDown}
            />
          ) : (
            <p className="text-xs text-gray-700 line-clamp-4 leading-relaxed">
              {note.content}
            </p>
          )}
        </div>

        {/* Note Footer */}
        {isEditing ? (
          <div className="flex items-center justify-end space-x-2">
            <Button
              variant="ghost"
              size="xs"
              onClick={handleCancel}
              className="h-6 px-2 text-xs"
            >
              Cancel
            </Button>
            <Button
              variant="default"
              size="xs"
              onClick={handleSave}
              className="h-6 px-2 text-xs"
            >
              Save
            </Button>
          </div>
        ) : (
          <div className="flex items-center justify-between text-xs text-gray-600">
            <div className="flex items-center space-x-1">
              <Icon name="User" size={10} />
              <span>{note.author}</span>
            </div>
            <div className="flex items-center space-x-1">
              <Icon name="Clock" size={10} />
              <span>{formatDate(note.createdAt)}</span>
            </div>
          </div>
        )}

        {/* Category Tag */}
        {note.category && (
          <div className="absolute -top-2 -right-2">
            <span className="inline-flex items-center px-2 py-1 text-xs font-medium bg-white border border-gray-300 rounded-full shadow-sm">
              {note.category}
            </span>
          </div>
        )}

        {/* Connection Points */}
        {note.connections && note.connections.length > 0 && (
          <div className="absolute -bottom-1 -right-1">
            <div className="w-4 h-4 bg-primary rounded-full flex items-center justify-center">
              <span className="text-xs text-white font-bold">{note.connections.length}</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default StickyNote;