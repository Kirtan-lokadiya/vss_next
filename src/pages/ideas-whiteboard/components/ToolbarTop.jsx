import React, { useState } from 'react';
import Icon from '@/src/components/AppIcon';
import Button from '@/src/components/ui/Button';
import Input from '@/src/components/ui/Input';
import { useWhiteboard } from '@/src/context/WhiteboardContext';

const ToolbarTop = ({
  scale,
  onSearch,
  searchQuery,
  onGlobalSearch
}) => {
  const [showSearchOptions, setShowSearchOptions] = useState(false);
  const { syncStatus, forceSync } = useWhiteboard();

  const zoomLevels = [0.25, 0.5, 0.75, 1, 1.25, 1.5, 2];
  const currentZoomIndex = zoomLevels.findIndex(level => Math.abs(level - scale) < 0.01);


  const handleGlobalSearch = async () => {
    if (searchQuery.trim() && onGlobalSearch) {
      await onGlobalSearch(searchQuery.trim());
    }
  };

  const handleForceSync = async () => {
    try {
      await forceSync();
    } catch (error) {
      console.error('Force sync failed:', error);
    }
  };

  return (
    <div className="h-16 bg-background dark:bg-[#23272f] border-b border-border flex items-center justify-between px-4">
      {/* Left Section - Placeholder for future controls */}
      <div className="flex items-center space-x-4">
        <div className="w-px h-6 bg-border"></div>
      </div>

      {/* Center Section - Search */}
      <div className="flex-1 max-w-md mx-8">
        <div className="relative">
          <Input
            type="search"
            placeholder="Search notes by content..."
            value={searchQuery}
            onChange={(e) => onSearch(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleGlobalSearch()}
            className="pl-10 pr-20 bg-white dark:bg-[#23272f] text-foreground dark:text-white border border-input dark:border-[#3a3f4b] focus:bg-white focus:dark:bg-[#23272f]"
          />
          <Icon
            name="Search"
            size={16}
            className="absolute left-3 top-1/2 transform -translate-y-1/2 text-text-secondary"
          />
          <div className="absolute right-1 top-1/2 transform -translate-y-1/2 flex items-center space-x-1">
            {searchQuery && (
              <Button
                variant="ghost"
                size="icon"
                onClick={handleGlobalSearch}
                className="w-8 h-8"
                title="Global Search"
              >
                <Icon name="Globe" size={14} />
              </Button>
            )}
            {searchQuery && (
              <Button
                variant="ghost"
                size="icon"
                onClick={() => onSearch('')}
                className="w-8 h-8"
              >
                <Icon name="X" size={14} />
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Right Section - Sync Status */}
      <div className="flex items-center space-x-2">
        {syncStatus === 'syncing' && (
          <div className="flex items-center space-x-2 text-sm text-blue-600">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
            <span>Syncing...</span>
          </div>
        )}
        {syncStatus === 'error' && (
          <Button
            variant="ghost"
            size="sm"
            onClick={handleForceSync}
            className="text-red-600 hover:text-red-700"
            title="Sync failed - click to retry"
          >
            <Icon name="AlertCircle" size={16} className="mr-1" />
            Retry Sync
          </Button>
        )}
        {syncStatus === 'idle' && (
          <Button
            variant="ghost"
            size="sm"
            onClick={handleForceSync}
            className="text-green-600"
            title="Force sync now"
          >
            <Icon name="RefreshCw" size={16} />
          </Button>
        )}
      </div>
    </div>
  );
};

export default ToolbarTop;