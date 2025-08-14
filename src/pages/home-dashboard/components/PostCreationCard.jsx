import React, { useState, useRef } from 'react';
import Icon from '@/src/components/AppIcon';
import Button from '@/src/components/ui/Button';
import Input from '@/src/components/ui/Input';

const PostCreationCard = ({ onPostCreated }) => {
  const [postContent, setPostContent] = useState('');
  const [showExpanded, setShowExpanded] = useState(false);
  const [selectedPostType, setSelectedPostType] = useState('thought');
  const [media, setMedia] = useState(null); // { type: 'image'|'video'|'link', url, file }
  const [linkUrl, setLinkUrl] = useState('');
  const photoInputRef = useRef(null);
  const videoInputRef = useRef(null);

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
      const payload = { 
        id: Date.now(),
        type: selectedPostType, 
        content: postContent,
        author: { name: 'John Doe', title: 'Member', company: 'LinkedBoard', avatar: null },
        timestamp: new Date(),
        likes: 0, comments: 0, shares: 0, views: 0,
        hashtags: []
      };
      if (media) {
        if (media.type === 'link') {
          payload.media = { type: 'link', url: media.url };
        } else if (media.type === 'image') {
          payload.media = { type: 'image', url: media.url };
        } else if (media.type === 'video') {
          payload.media = { type: 'video', url: media.url };
        }
      }
      onPostCreated && onPostCreated(payload);
      setPostContent('');
      setShowExpanded(false);
      setSelectedPostType('thought');
      setMedia(null);
      setLinkUrl('');
    }
  };

  const handleCancel = () => {
    setPostContent('');
    setShowExpanded(false);
    setSelectedPostType('thought');
    setMedia(null);
    setLinkUrl('');
  };

  const handlePickPhoto = () => photoInputRef.current?.click();
  const handlePickVideo = () => videoInputRef.current?.click();
  const handlePhotoChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setMedia({ type: 'image', file, url });
    }
  };
  const handleVideoChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setMedia({ type: 'video', file, url });
    }
  };
  const applyLink = () => {
    if (linkUrl.trim()) {
      setMedia({ type: 'link', url: linkUrl.trim() });
    }
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
          {/* Create Campaign placed next to share buttons */}
          <Button
            variant="outline"
            onClick={() => (window.location.href = '/campaigns/new')}
            className="h-12 justify-start"
            iconName="Megaphone"
            iconPosition="left"
            iconSize={20}
          >
            Create campaign
          </Button>
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
            <input ref={photoInputRef} type="file" accept="image/*" className="hidden" onChange={handlePhotoChange} />
            <input ref={videoInputRef} type="file" accept="video/*" className="hidden" onChange={handleVideoChange} />
            <Button variant="ghost" size="sm" iconName="Image" iconPosition="left" iconSize={16} onClick={handlePickPhoto}>
              Photo
            </Button>
            <Button variant="ghost" size="sm" iconName="Video" iconPosition="left" iconSize={16} onClick={handlePickVideo}>
              Video
            </Button>
            <div className="flex items-center space-x-2">
              <Input type="url" placeholder="Paste link URL" value={linkUrl} onChange={(e) => setLinkUrl(e.target.value)} className="h-9 w-48" />
              <Button variant="outline" size="sm" onClick={applyLink}>Attach</Button>
            </div>
          </div>

          {/* Media Preview */}
          {media && (
            <div className="border border-border rounded-lg p-3 bg-muted/40">
              {media.type === 'image' && (
                <img src={media.url} alt="Selected" className="max-h-48 rounded" />
              )}
              {media.type === 'video' && (
                <video src={media.url} controls className="max-h-48 rounded" />
              )}
              {media.type === 'link' && (
                <div className="text-sm text-text-secondary break-all">{media.url}</div>
              )}
            </div>
          )}

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