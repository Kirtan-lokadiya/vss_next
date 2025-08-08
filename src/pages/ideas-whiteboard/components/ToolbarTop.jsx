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
          <Button
            variant="outline"
            size="icon"
            onClick={onZoomOut}
            disabled={scale <= 0.25}
            title="Zoom out"
          >
            <Icon name="ZoomOut" size={16} />
          </Button>
          
          <div className="relative">
            <select
              value={scale}
              onChange={(e) => handleZoomSelect(parseFloat(e.target.value))}
              className="px-3 py-1 border border-border rounded-md text-sm min-w-20 text-center"
            >
              {zoomLevels.map((zoom) => (
                <option key={zoom} value={zoom}>
                  {Math.round(zoom * 100)}%
                </option>
              ))}
            </select>
          </div>
          
          <Button
            variant="outline"
            size="icon"
            onClick={onZoomIn}
            disabled={scale >= 2}
            title="Zoom in"
          >
            <Icon name="ZoomIn" size={16} />
          </Button>
          
          <Button
            variant="ghost"
            size="sm"
            onClick={onResetZoom}
            title="Reset zoom to 100%"
          >
            <Icon name="RotateCcw" size={14} className="mr-1" />
            Reset
          </Button>
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
        {/* Collaboration Toggle */}
        <Button
          variant={isCollaborative ? 'default' : 'outline'}
          size="sm"
          onClick={onToggleCollaboration}
          className="relative"
        >
          <Icon name="Users" size={14} className="mr-1" />
          {isCollaborative ? 'Live' : 'Solo'}
          {isCollaborative && collaborators.length > 0 && (
            <span className="absolute -top-1 -right-1 w-4 h-4 bg-success text-white text-xs rounded-full flex items-center justify-center">
              {collaborators.length}
            </span>
          )}
        </Button>

        <div className="w-px h-6 bg-border"></div>

        {/* Save Button */}
        <Button
          variant="default"
          size="sm"
          onClick={handleSaveBoard}
          data-save-button
        >
          <Icon name="Save" size={14} className="mr-1" />
          Save
        </Button>

        {/* More Actions */}
        <div className="relative">
          <Button
            variant="outline"
            size="icon"
            onClick={() => setShowSearchOptions(!showSearchOptions)}
            title="More options"
          >
            <Icon name="MoreVertical" size={16} />
          </Button>

          {showSearchOptions && (
            <div className="absolute right-0 mt-2 w-48 bg-popover border border-border rounded-lg shadow-modal z-1010">
              <div className="p-2">
                <Button
                  variant="ghost"
                  onClick={() => {
                    onClearBoard();
                    setShowSearchOptions(false);
                  }}
                  className="w-full justify-start text-sm text-destructive hover:text-destructive"
                >
                  <Icon name="Trash2" size={14} className="mr-2" />
                  Clear Board
                </Button>
                <Button
                  variant="ghost"
                  onClick={() => {
                    window.print();
                    setShowSearchOptions(false);
                  }}
                  className="w-full justify-start text-sm"
                >
                  <Icon name="Printer" size={14} className="mr-2" />
                  Print Board
                </Button>
                <Button
                  variant="ghost"
                  onClick={() => {
                    navigator.share?.({
                      title: 'Ideas Whiteboard',
                      text: 'Check out my ideas whiteboard',
                      url: window.location.href
                    });
                    setShowSearchOptions(false);
                  }}
                  className="w-full justify-start text-sm"
                >
                  <Icon name="Share2" size={14} className="mr-2" />
                  Share Board
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ToolbarTop;