import React, { useState } from 'react';
import Icon from '@/src/components/AppIcon';
import Button from '@/src/components/ui/Button';
import Input from '@/src/components/ui/Input';

const ToolbarTop = ({
  scale,
  onZoomIn,
  onZoomOut,
  onResetZoom,
  onSearch,
  searchQuery,
  onClearBoard,
  onSave,
  isCollaborative,
  onToggleCollaboration,
  collaborators
}) => {
  const [showSearchOptions, setShowSearchOptions] = useState(false);

  const zoomLevels = [0.25, 0.5, 0.75, 1, 1.25, 1.5, 2];
  const currentZoomIndex = zoomLevels.findIndex(level => Math.abs(level - scale) < 0.01);

  const handleSaveBoard = () => {
    onSave();
    const button = document.querySelector('[data-save-button]');
    if (button) {
      const originalText = button.textContent;
      button.textContent = 'Saved!';
      setTimeout(() => {
        button.textContent = originalText;
      }, 2000);
    }
  };

  return (
    <div className="h-16 bg-white border-b border-border flex items-center justify-between px-4">
      {/* Left Section - Placeholder for future controls */}
      <div className="flex items-center space-x-4">
        <div className="w-px h-6 bg-border"></div>
      </div>

      {/* Center Section - Search */}
      <div className="flex-1 max-w-md mx-8">
        <div className="relative">
          <Input
            type="search"
            placeholder="Search notes by title, content, or category..."
            value={searchQuery}
            onChange={(e) => onSearch(e.target.value)}
            className="pl-10 pr-10"
          />
          <Icon 
            name="Search" 
            size={16} 
            className="absolute left-3 top-1/2 transform -translate-y-1/2 text-text-secondary" 
          />
          {searchQuery && (
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onSearch('')}
              className="absolute right-1 top-1/2 transform -translate-y-1/2 w-8 h-8"
            >
              <Icon name="X" size={14} />
            </Button>
          )}
        </div>
      </div>

      {/* Right Section - Actions (empty) */}
      <div className="flex items-center space-x-2">     
      </div>
    </div>
  );
};

export default ToolbarTop;