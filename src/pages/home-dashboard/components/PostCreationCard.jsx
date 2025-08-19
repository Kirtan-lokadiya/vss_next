import React, { useState, useRef } from 'react';
import Icon from '@/src/components/AppIcon';
import Button from '@/src/components/ui/Button';
import Input from '@/src/components/ui/Input';
import { createIdea, getAuthToken } from '@/src/utils/api';
import { extractUserId } from '@/src/utils/jwt';

const PostCreationCard = ({ onPostCreated }) => {
  const [postContent, setPostContent] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [selectedPostType, setSelectedPostType] = useState('idea');
  const [media, setMedia] = useState(null); // { type: 'image'|'video'|'link', url, file }
  const [linkUrl, setLinkUrl] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const photoInputRef = useRef(null);
  const videoInputRef = useRef(null);
  const [showCampaignModal, setShowCampaignModal] = useState(false);
  const [campaignTitle, setCampaignTitle] = useState('');
  const [campaignGoal, setCampaignGoal] = useState('');
  const [campaignDesc, setCampaignDesc] = useState('');

  const postTypes = [
    { value: 'idea', label: 'Share an idea', icon: 'Lightbulb' },
    { value: 'thought', label: 'Share a thought', icon: 'MessageCircle' },
  ];

  const openComposer = (type) => {
    setSelectedPostType(type || 'idea');
    setShowModal(true);
  };

  const resetForm = () => {
    setPostContent('');
    setSelectedPostType('idea');
    setMedia(null);
    setLinkUrl('');
  };

  const handlePost = async () => {
    if (!postContent.trim()) return;
    const token = getAuthToken();
    const userId = extractUserId(token);
    if (!token || !userId) {
      alert('Please login first');
      return;
    }
    try {
      setSubmitting(true);
      if (selectedPostType === 'idea') {
        await createIdea({ userId, idea: postContent.trim(), token });
      } else {
        // For now backend supports idea endpoint. Could extend here for other types.
        await createIdea({ userId, idea: postContent.trim(), token });
      }
      onPostCreated && onPostCreated();
      resetForm();
      setShowModal(false);
    } catch (e) {
      alert(e.message || 'Failed to post');
    } finally {
      setSubmitting(false);
    }
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
    <>
      <div className="bg-card border border-border rounded-lg shadow-card p-6 mb-6">
        {/* User Info */}
        <div className="flex items-center space-x-3 mb-4">
          <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center">
            <Icon name="User" size={24} color="white" />
          </div>
          <div className="flex-1">
            <button
              className="w-full text-left px-4 py-3 border border-border rounded-full text-text-secondary hover:bg-muted"
              onClick={() => openComposer('idea')}
            >
              What do you want to talk about?
            </button>
          </div>
        </div>

        {/* Quick actions like LinkedIn */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {postTypes.map((type) => (
            <Button
              key={type.value}
              variant="ghost"
              onClick={() => openComposer(type.value)}
              className="h-12 justify-start"
              iconName={type.icon}
              iconPosition="left"
              iconSize={20}
            >
              <span className="hidden sm:inline">{type.label}</span>
            </Button>
          ))}
          <Button
            variant="outline"
            onClick={() => setShowCampaignModal(true)}
            className="h-12 justify-start"
            iconName="Megaphone"
            iconPosition="left"
            iconSize={20}
          >
            Create campaign
          </Button>
        </div>
      </div>

      {/* Post Composer Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center" onClick={() => setShowModal(false)}>
          <div className="bg-card border border-border rounded-lg shadow-modal w-full max-w-2xl" onClick={(e)=>e.stopPropagation()}>
            <div className="flex items-center justify-between p-4 border-b border-border">
              <h3 className="text-lg font-semibold text-foreground">Create a post</h3>
              <Button variant="ghost" size="icon" className="w-8 h-8" onClick={() => setShowModal(false)}>
                <Icon name="X" size={16} />
              </Button>
            </div>

            <div className="p-4">
              {/* Post Type Selector */}
              <div className="flex items-center space-x-2 pb-3 border-b border-border mb-4">
                {postTypes.map((type) => (
                  <Button
                    key={type.value}
                    variant={selectedPostType === type.value ? 'default' : 'ghost'}
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
                  placeholder={`What's on your mind?`}
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
              <div className="flex items-center space-x-4 py-3 border-t border-border mt-4">
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
                <div className="border border-border rounded-lg p-3 bg-muted/40 mt-3">
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
            </div>

            {/* Footer */}
            <div className="flex items-center justify-between p-4 border-t border-border">
              <div className="flex items-center space-x-2">
                <Icon name="Globe" size={16} className="text-text-secondary" />
                <span className="text-sm text-text-secondary">Anyone can see this post</span>
              </div>
              <div className="flex items-center space-x-3">
                <Button variant="ghost" onClick={() => { resetForm(); setShowModal(false); }}>
                  Cancel
                </Button>
                <Button 
                  variant="default" 
                  onClick={handlePost}
                  disabled={!postContent.trim() || submitting}
                  iconName="Send"
                  iconPosition="right"
                  iconSize={16}
                >
                  {submitting ? 'Posting...' : 'Post'}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Campaign Modal */}
      {showCampaignModal && (
        <div className="fixed inset-0 bg-black/40 z-[60] flex items-center justify-center" onClick={() => setShowCampaignModal(false)}>
          <div className="bg-card border border-border rounded-lg shadow-modal w-full max-w-3xl" onClick={(e)=>e.stopPropagation()}>
            <div className="flex items-center justify-between p-4 border-b border-border">
              <h3 className="text-lg font-semibold text-foreground">Create Campaign</h3>
              <Button variant="ghost" size="icon" className="w-8 h-8" onClick={() => setShowCampaignModal(false)}>
                <Icon name="X" size={16} />
              </Button>
            </div>
            <div className="p-6 space-y-4">
              <Input label="Title" value={campaignTitle} onChange={(e)=>setCampaignTitle(e.target.value)} placeholder="Campaign title" />
              <Input label="Goal (optional)" type="number" value={campaignGoal} onChange={(e)=>setCampaignGoal(e.target.value)} placeholder="e.g. 500" />
              <div>
                <label className="block text-sm font-medium mb-1">Description</label>
                <textarea className="w-full border border-border rounded-lg px-3 py-2" rows={5} value={campaignDesc} onChange={(e)=>setCampaignDesc(e.target.value)} placeholder="Describe your campaign..." />
              </div>
            </div>
            <div className="flex items-center justify-end gap-2 p-4 border-t border-border">
              <Button variant="ghost" onClick={()=>setShowCampaignModal(false)}>Cancel</Button>
              <Button variant="default" iconName="Megaphone" iconPosition="left" onClick={()=>{ alert('Demo: Campaign created (dummy).'); setShowCampaignModal(false); setCampaignTitle(''); setCampaignGoal(''); setCampaignDesc(''); }}>Create</Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default PostCreationCard;