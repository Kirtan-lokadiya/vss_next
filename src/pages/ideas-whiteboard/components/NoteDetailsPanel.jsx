import React, { useState } from 'react';
import Icon from '@/src/components/AppIcon';
import Button from '@/src/components/ui/Button';
import Input from '@/src/components/ui/Input';
import { useRouter } from 'next/router';

const NoteDetailsPanel = ({ 
  note, 
  onUpdateNote, 
    onClose,
  connections,
  allNotes,
  onDeleteConnection
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({
    title: note?.title || '',
    content: note?.content || '',
    category: note?.category || ''
  });
  const [newComment, setNewComment] = useState('');
  const router = useRouter();
  const navigate = router.push;

  if (!note) return null;

  const categories = [
    'Ideas',
    'Tasks', 
    'Research',
    'Feedback',
    'Questions',
    'Goals'
  ];

  const noteConnections = connections.filter(
    conn => conn.from === note.id || conn.to === note.id
  );

  const connectedNotes = noteConnections.map(conn => {
    const connectedId = conn.from === note.id ? conn.to : conn.from;
    return allNotes.find(n => n.id === connectedId);
  }).filter(Boolean);

  const handleSave = () => {
    onUpdateNote(note.id, editData);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditData({
      title: note.title,
      content: note.content,
      category: note.category
    });
    setIsEditing(false);
  };



  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getColorClasses = (color) => {
    // Handle hex colors by converting them to a default color
    if (color && color.startsWith('#')) {
      color = 'yellow'; // Default fallback for hex colors
    }
    
    const colorMap = {
      yellow: 'bg-yellow-100 border-yellow-400 text-yellow-900',
      blue: 'bg-blue-100 border-blue-400 text-blue-900',
      green: 'bg-green-100 border-green-400 text-green-900',
      pink: 'bg-pink-100 border-pink-400 text-pink-900',
      purple: 'bg-purple-100 border-purple-400 text-purple-900',
      orange: 'bg-orange-100 border-orange-400 text-orange-900'
    };
    return colorMap[color] || colorMap.yellow;
  };

  return (
    <div className="w-96 h-full bg-white border-l border-border flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-border flex items-center justify-between">
        <h2 className="text-lg font-semibold text-foreground">Note Details</h2>
        <Button
          variant="ghost"
          size="icon"
          onClick={onClose}
        >
          <Icon name="X" size={20} />
        </Button>
      </div>

      {/* Note Preview */}
      <div className="p-4 border-b border-border">
        <div className={`p-4 rounded-lg border-2 ${getColorClasses(note.color)} text-current`}>
          <div className="flex items-center justify-between mb-2">
            <h3 className="font-semibold">{note.title}</h3>
            <div className="flex items-center space-x-1">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsEditing(true)}
              className="w-6 h-6"
            >
              <Icon name="Edit2" size={12} />
            </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => navigate(`/search?q=${encodeURIComponent(note.title || '')}`)}
                className="w-6 h-6"
                title="Search this idea"
              >
                <Icon name="Globe" size={14} />
              </Button>
            </div>
          </div>
          <p className="text-sm mb-3">{note.content}</p>
          <div className="flex items-center justify-between text-xs">
            <span>{note.author}</span>
            <span>{formatDate(note.createdAt)}</span>
          </div>
        </div>
      </div>

      {/* Edit Form */}
      {isEditing && (
        <div className="p-4 border-b border-border bg-muted">
          <h3 className="text-sm font-semibold text-foreground mb-3">Edit Note</h3>
          <div className="space-y-3">
            <Input
              label="Title"
              type="text"
              value={editData.title}
              onChange={(e) => setEditData({ ...editData, title: e.target.value })}
            />
            
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">
                Content
              </label>
              <textarea
                value={editData.content}
                onChange={(e) => setEditData({ ...editData, content: e.target.value })}
                className="w-full h-20 px-3 py-2 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent resize-none text-sm"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-1">
                Category
              </label>
              <select
                value={editData.category}
                onChange={(e) => setEditData({ ...editData, category: e.target.value })}
                className="w-full px-3 py-2 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent text-sm"
              >
                <option value="">No category</option>
                {categories.map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleCancel}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                variant="default"
                size="sm"
                onClick={handleSave}
                className="flex-1"
              >
                Save
              </Button>
            </div>
          </div>
        </div>
      )}  
    </div>
  );
};

export default NoteDetailsPanel;