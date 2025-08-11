import React, { useState } from 'react';
import Icon from '@/src/components/AppIcon';
import Button from '@/src/components/ui/Button';
import Input from '@/src/components/ui/Input';

const ToolbarTop = ({
  scale,
  onZoomIn,
  onZoomOut,
  onResetZoom,
  viewMode,
  onViewModeChange,
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

  const handleZoomSelect = (zoom) => {
    if (zoom > scale) {
      const steps = Math.round((zoom - scale) / 0.25);
      for (let i = 0; i < steps; i++) {
        onZoomIn();
      }
    } else if (zoom < scale) {
      const steps = Math.round((scale - zoom) / 0.25);
      for (let i = 0; i < steps; i++) {
        onZoomOut();
      }
    }
  };

  const handleSaveBoard = () => {
    onSave();
    // Show temporary success message
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
      {/* Left Section - View Controls */}
      <div className="flex items-center space-x-4">
        {/* Zoom Controls */}
        <div className="flex items-center space-x-2">
       
          
          
     
          
        
        </div>

        <div className="w-px h-6 bg-border"></div>

        {/* View Mode Toggle */}
        <div className="flex items-center space-x-1 bg-muted rounded-lg p-1">
          <Button
            variant={viewMode === 'freeform' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => onViewModeChange('freeform')}
            className="h-8"
          >
            <Icon name="Move" size={14} className="mr-1" />
            Freeform
          </Button>
          <Button
            variant={viewMode === 'grid' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => onViewModeChange('grid')}
            className="h-8"
          >
            <Icon name="Grid3X3" size={14} className="mr-1" />
            Grid
          </Button>
        </div>
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

      {/* Right Section - Actions */}
      <div className="flex items-center space-x-2">     
      </div>
    </div>
  );
};

export default ToolbarTop;