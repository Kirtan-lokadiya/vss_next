import React, { useState } from 'react';
import Icon from '@/src/components/AppIcon';
import Button from '@/src/components/ui/Button';
import Input from '@/src/components/ui/Input';

const ToolbarLeft = ({ onCreateNote, onImportNotes, onExportNotes }) => {
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newNote, setNewNote] = useState({
    title: '',
    content: '',
    color: 'yellow',
    category: ''
  });

  const noteColors = [
    { name: 'yellow', color: '#fef3c7', label: 'Yellow' },
    { name: 'blue', color: '#dbeafe', label: 'Blue' },
    { name: 'green', color: '#d1fae5', label: 'Green' },
    { name: 'pink', color: '#fce7f3', label: 'Pink' },
    { name: 'purple', color: '#e9d5ff', label: 'Purple' },
    { name: 'orange', color: '#fed7aa', label: 'Orange' }
  ];

  const categories = [
    'Ideas',
    'Tasks',
    'Research',
    'Feedback',
    'Questions',
    'Goals'
  ];

  const handleCreateNote = () => {
    if (newNote.title.trim() || newNote.content.trim()) {
      onCreateNote({
        title: newNote.title.trim() || 'Untitled',
        content: newNote.content.trim() || 'No content',
        color: newNote.color,
        category: newNote.category
      });
      
      // Reset form
      setNewNote({
        title: '',
        content: '',
        color: 'yellow',
        category: ''
      });
      setShowCreateForm(false);
    }
  };

  const handleQuickCreate = (color) => {
    onCreateNote({
      title: 'New Idea',
      content: 'Double-click to edit this note',
      color: color,
      category: ''
    });
  };

  return (
    <div className="w-80 h-full bg-white border-r border-border flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-border">
        <h2 className="text-lg font-semibold text-foreground mb-2">Create Notes</h2>
        <p className="text-sm text-text-secondary">
          Add new ideas to your whiteboard
        </p>
      </div>

      {/* Quick Create Buttons */}
      <div className="p-4 border-b border-border">
        <h3 className="text-sm font-medium text-foreground mb-3">Quick Create</h3>
        <div className="grid grid-cols-3 gap-2">
          {noteColors.map((colorOption) => (
            <Button
              key={colorOption.name}
              variant="outline"
              onClick={() => handleQuickCreate(colorOption.name)}
              className="h-12 p-2 border-2"
              style={{ 
                backgroundColor: colorOption.color,
                borderColor: colorOption.color 
              }}
              title={`Create ${colorOption.label} note`}
            >
              <Icon name="Plus" size={16} />
            </Button>
          ))}
        </div>
      </div>

      {/* Detailed Create Form */}
      <div className="p-4 border-b border-border">
        <Button
          variant="default"
          onClick={() => setShowCreateForm(!showCreateForm)}
          className="w-full mb-3"
          iconName={showCreateForm ? "ChevronUp" : "ChevronDown"}
          iconPosition="right"
        >
          Detailed Create
        </Button>

        {showCreateForm && (
          <div className="space-y-4">
            <Input
              label="Note Title"
              type="text"
              placeholder="Enter note title..."
              value={newNote.title}
              onChange={(e) => setNewNote({ ...newNote, title: e.target.value })}
            />

            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Content
              </label>
              <textarea
                placeholder="Write your idea here..."
                value={newNote.content}
                onChange={(e) => setNewNote({ ...newNote, content: e.target.value })}
                className="w-full h-24 px-3 py-2 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent resize-none text-sm"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Color
              </label>
              <div className="flex space-x-2">
                {noteColors.map((colorOption) => (
                  <button
                    key={colorOption.name}
                    onClick={() => setNewNote({ ...newNote, color: colorOption.name })}
                    className={`w-8 h-8 rounded-full border-2 ${
                      newNote.color === colorOption.name 
                        ? 'border-gray-800 ring-2 ring-primary' :'border-gray-300'
                    }`}
                    style={{ backgroundColor: colorOption.color }}
                    title={colorOption.label}
                  />
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Category (Optional)
              </label>
              <select
                value={newNote.category}
                onChange={(e) => setNewNote({ ...newNote, category: e.target.value })}
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
                onClick={() => setShowCreateForm(false)}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                variant="default"
                onClick={handleCreateNote}
                className="flex-1"
                iconName="Plus"
                iconPosition="left"
              >
                Create
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ToolbarLeft;