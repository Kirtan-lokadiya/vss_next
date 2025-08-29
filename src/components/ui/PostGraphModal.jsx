import React, { useState } from 'react';
import Button from './Button';
import NetworkVisualization from '@/src/pages/connection-network-tree/components/NetworkVisualization';

const PostGraphModal = ({ isOpen, onClose, postId, postTitle }) => {
  const [viewMode, setViewMode] = useState('circular');

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-border">
          <div>
            <h2 className="text-lg font-semibold text-foreground">Post Network Graph</h2>
            {postTitle && (
              <p className="text-sm text-text-secondary mt-1 truncate max-w-md">
                {postTitle}
              </p>
            )}
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            iconName="X"
            iconSize={20}
          />
        </div>

        {/* Graph Content */}
        <div className="p-4">
          <NetworkVisualization
            connections={[]} // Will be loaded by the component based on postId
            selectedNode={null}
            onNodeSelect={() => {}} // Handle node selection if needed
            viewMode={viewMode}
            onViewModeChange={setViewMode}
            className="h-[500px] w-full"
            showControls={true}
            showLegend={false}
            postId={postId}
            isPostGraph={true}
          />
        </div>

        {/* Footer */}
        <div className="flex justify-end p-4 border-t border-border">
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
        </div>
      </div>
    </div>
  );
};

export default PostGraphModal;