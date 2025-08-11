import React, { useState } from 'react';
import Icon from '@/src/components/AppIcon';
import Button from '@/src/components/ui/Button';
import Input from '@/src/components/ui/Input';

const PostCreationCard = () => {
  const [postContent, setPostContent] = useState('');
  const [showExpanded, setShowExpanded] = useState(false);
  const [selectedPostType, setSelectedPostType] = useState('thought');

  const postTypes = [
    { value: 'thought', label: 'Share a thought', icon: 'MessageCircle' },
    { value: 'idea', label: 'Share an idea', icon: 'Lightbulb' },
  ];

  const handlePostTypeChange = (type) => {
    setSelectedPostType(type);
    setShowExpanded(true);
  };

  const handlePost = () => {
    if (postContent.trim()) {
      console.log('Posting:', { type: selectedPostType, content: postContent });
      setPostContent('');
      setShowExpanded(false);
      setSelectedPostType('thought');
    }
  };

  const handleCancel = () => {
    setPostContent('');
    setShowExpanded(false);
    setSelectedPostType('thought');
  };

  return (
    <div className="bg-card border border-border rounded-lg shadow-card p-6 mb-6">
      {/* User Info */}
      <div className="flex items-center space-x-3 mb-4">
        <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center">
          <Icon name="User" size={24} color="white" />
        </div>
        <div>
          <h3 className="font-semibold text-foreground">John Doe</h3>
          <p className="text-sm text-text-secondary">Share your thoughts with your network</p>
        </div>
      </div>

      {!showExpanded ? (
        /* Quick Post Options */
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {postTypes.map((type) => (
            <Button
              key={type.value}
              variant="ghost"
              onClick={() => handlePostTypeChange(type.value)}
              className="h-12 justify-start"
              iconName={type.icon}
              iconPosition="left"
              iconSize={20}
            >
              <span className="hidden sm:inline">{type.label}</span>
            </Button>
          ))}
        </div>
      ) : (
        /* Expanded Post Creation */
        <div className="space-y-4">
          {/* Post Type Selector */}
          <div className="flex items-center space-x-2 pb-3 border-b border-border">
            {postTypes.map((type) => (
              <Button
                key={type.value}
                variant={selectedPostType === type.value ? "default" : "ghost"}
                size="sm"
                onClick={() => setSelectedPostType(type.value)}
                iconName={type.icon}
                iconPosition="left"
                iconSize={16}
              >
                {type.label}
              </Button>
            ))}
          </div>

          {/* Content Input */}
          <div>
            <textarea
              value={postContent}
              onChange={(e) => setPostContent(e.target.value)}
              placeholder={`What's on your mind, John?`}
              className="w-full min-h-32 p-4 border border-border rounded-lg resize-none focus:ring-2 focus:ring-primary focus:border-transparent"
              maxLength={3000}
            />
            <div className="flex justify-between items-center mt-2">
              <span className="text-xs text-text-secondary">
                {postContent.length}/3000 characters
              </span>
            </div>
          </div>

          {/* Media Options */}
          <div className="flex items-center space-x-4 py-3 border-t border-border">
            <Button variant="ghost" size="sm" iconName="Image" iconPosition="left" iconSize={16}>
              Photo
            </Button>
            <Button variant="ghost" size="sm" iconName="Video" iconPosition="left" iconSize={16}>
              Video
            </Button>
            <Button variant="ghost" size="sm" iconName="Link" iconPosition="left" iconSize={16}>
              Link
            </Button>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-between pt-3 border-t border-border">
            <div className="flex items-center space-x-2">
              <Icon name="Globe" size={16} className="text-text-secondary" />
              <span className="text-sm text-text-secondary">Anyone can see this post</span>
            </div>
            <div className="flex items-center space-x-3">
              <Button variant="ghost" onClick={handleCancel}>
                Cancel
              </Button>
              <Button 
                variant="default" 
                onClick={handlePost}
                disabled={!postContent.trim()}
                iconName="Send"
                iconPosition="right"
                iconSize={16}
              >
                Post
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PostCreationCard;