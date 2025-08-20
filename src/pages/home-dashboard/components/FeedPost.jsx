import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import Icon from '@/src/components/AppIcon';
import Image from '@/src/components/AppImage';
import Button from '@/src/components/ui/Button';
import { useAuth } from "../../../context/AuthContext";
import { toggleLikePost, toggleSavePost, getAuthToken, fetchPostGraph } from '@/src/utils/api';
import { useToast } from '@/src/context/ToastContext';
import NetworkVisualization from '@/src/pages/connection-network-tree/components/NetworkVisualization';

const FeedPost = ({ post }) => {
  const { isAuthenticated, openAuthModal } = useAuth();
  const { showToast } = useToast();
  const [isLiked, setIsLiked] = useState(post.isLiked || false);
  const [isSaved, setIsSaved] = useState(post.isSaved || false);
  const [likeCount, setLikeCount] = useState(post.likes || 0);
  const [showComments, setShowComments] = useState(false);
  const [commentText, setCommentText] = useState('');
  const [donationPool, setDonationPool] = useState(post?.campaign?.raised || post.donationPool || 0);
  const [showDonate, setShowDonate] = useState(false);
  const [donationAmount, setDonationAmount] = useState(5);
  const [mutating, setMutating] = useState(false);
  const goal = post?.campaign?.goal || 630000; // default goal if campaign exists or not

  const handleLike = async () => {
    if (!isAuthenticated) {
      openAuthModal();
      return;
    }
    if (mutating) return;
    const nextLiked = !isLiked;
    setIsLiked(nextLiked);
    setLikeCount(prev => (nextLiked ? prev + 1 : Math.max(0, prev - 1)));
    if (nextLiked) setShowDonate(true);
    try {
      setMutating(true);
      const token = getAuthToken();
      await toggleLikePost({ postId: post.id, token });
    } catch (e) {
      // rollback on failure
      setIsLiked(!nextLiked);
      setLikeCount(prev => (!nextLiked ? prev + 1 : Math.max(0, prev - 1)));
      console.error(e);
      showToast(e.message || 'Failed to update like', 'error');
    } finally {
      setMutating(false);
    }
  };

  const handleSave = async () => {
    if (!isAuthenticated) {
      openAuthModal();
      return;
    }
    if (mutating) return;
    const nextSaved = !isSaved;
    setIsSaved(nextSaved);
    try {
      setMutating(true);
      const token = getAuthToken();
      await toggleSavePost({ postId: post.id, token });
    } catch (e) {
      setIsSaved(!nextSaved);
      console.error(e);
      showToast(e.message || 'Failed to update save', 'error');
    } finally {
      setMutating(false);
    }
  };

  const handleShare = async () => {
    const shareData = {
      title: `Post by ${post.author.name}`,
      text: post.content.slice(0, 120),
      url: typeof window !== 'undefined' ? window.location.href : ''
    };
    try {
      if (navigator.share) {
        await navigator.share(shareData);
      } else {
        await navigator.clipboard.writeText(shareData.url);
        alert('Link copied to clipboard');
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleDonate = (amount) => {
    if (!isAuthenticated) {
      openAuthModal();
      return;
    }
    const parsed = Number(amount);
    if (!isNaN(parsed) && parsed > 0) {
      setDonationPool(prev => prev + parsed);
      setShowDonate(false);
    }
  };

  const handleComment = () => {
    if (!isAuthenticated) {
      openAuthModal();
      return;
    }
    if (commentText.trim()) {
      console.log('Adding comment:', commentText);
      setCommentText('');
    }
  };

  const formatTimeAgo = (timestamp) => {
    const now = new Date();
    const postTime = new Date(timestamp);
    const diffInHours = Math.floor((now - postTime) / (1000 * 60 * 60));
    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${diffInHours}h ago`;
    if (diffInHours < 168) return `${Math.floor(diffInHours / 24)}d ago`;
    return `${Math.floor(diffInHours / 168)}w ago`;
  };

  const getPostTypeIcon = (type) => {
    const iconMap = { article: 'FileText', thought: 'MessageCircle', idea: 'Lightbulb', update: 'Building', share: 'Share2' };
    return iconMap[type] || 'MessageCircle';
  };

  return (
    <div className="bg-card border border-border rounded-2xl shadow-card mb-6">
      {/* Post Header */}
      <div className="p-6 pb-4">
        <div className="flex items-start justify-between">
          <div className="flex items-start space-x-3">
            <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center flex-shrink-0">
              {post.author.avatar ? (
                <Image src={post.author.avatar} alt={post.author.name} className="w-12 h-12 rounded-full object-cover" />
              ) : (
                <Icon name="User" size={24} color="white" />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center space-x-2">
                <h3 className="font-semibold text-foreground truncate">{post.author.name}</h3>
              </div>
              <p className="text-sm text-text-secondary truncate">{post.author.title} at {post.author.company}</p>
              <div className="flex items-center space-x-2 mt-1">
                <span className="text-xs text-text-secondary">{formatTimeAgo(post.timestamp)}</span>
                <span className="text-xs text-text-secondary">•</span>
                <div className="flex items-center space-x-1">
                  <Icon name={getPostTypeIcon(post.type)} size={12} className="text-text-secondary" />
                  <span className="text-xs text-text-secondary capitalize">{post.type}</span>
                </div>
              </div>
            </div>
          </div>
          <div className="relative">
            <MoreMenu post={post} onShare={handleShare} onSave={handleSave} isSaved={isSaved} />
          </div>
        </div>
      </div>

      {/* Post Content */}
      <div className="px-6 pb-4">
        <div className="prose prose-sm max-w-none">
          <p className="text-foreground leading-relaxed mb-3">{post.content}</p>
        </div>

        {/* Campaign Block (dummy/local) */}
        {post.campaign && (
          <div className="mt-3 border border-border rounded-xl p-4 bg-muted/20">
            <div className="flex items-center mb-2 text-foreground font-medium">
              <Icon name="CurrencyDollar" size={16} className="mr-2 text-primary" />
              {post.campaign.title || 'Funding Campaign'}
            </div>
            <div className="h-2 bg-muted rounded-full overflow-hidden">
              <div
                className="h-full bg-blue-500 rounded-full transition-all"
                style={{ width: `${Math.min(100, Math.round(((donationPool) / (goal || 1)) * 100))}%` }}
              />
            </div>
            <div className="flex items-center justify-between mt-2 text-xs text-text-secondary">
              <span>₹{(donationPool).toLocaleString('en-IN')} raised</span>
              <span>{Math.min(100, Math.round(((donationPool) / (goal || 1)) * 100))}% funded</span>
              <span>Goal: ₹{(goal).toLocaleString('en-IN')}</span>
            </div>
            <div className="flex justify-end mt-3">
              <Button variant="outline" size="sm" onClick={() => setShowDonate(!showDonate)}>Donate</Button>
            </div>
            {showDonate && (
              <div className="mt-3 p-3 border border-border rounded-lg bg-card">
                <div className="flex flex-wrap gap-2 mb-2">
                  {[50,100,500,1000].map(v => (
                    <Button key={v} variant="secondary" size="sm" onClick={() => handleDonate(v)}>₹{v}</Button>
                  ))}
                </div>
                <div className="flex items-center gap-2">
                  <input type="number" value={donationAmount} onChange={(e)=>setDonationAmount(e.target.value)} className="w-28 px-3 py-2 border border-border rounded-lg text-sm"/>
                  <Button variant="default" size="sm" onClick={()=>handleDonate(donationAmount)}>Add</Button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Engagement Stats */}
      <div className="px-6 py-3 border-t border-border">
        <div className="flex items-center justify-between text-sm text-text-secondary">
          <div className="flex items-center space-x-4">
            <span>{likeCount} likes</span>
            <span>{post.comments || 0} comments</span>
            <span>{post.shares || 0} shares</span>
          </div>
          <div className="flex items-center gap-4">
            <span>{post.views || 0} views</span>
            {post.campaign && (
              <button className="text-primary hover:underline" onClick={() => setShowDonate(true)}>Donate</button>
            )}
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="px-6 py-3 border-t border-border">
        <div className="flex items-center justify-between">
          <Button variant="ghost" onClick={handleLike} requireAuth className={`flex-1 rounded-full ${isLiked ? 'text-primary' : 'text-text-secondary'}`} iconName="ThumbsUp" iconPosition="left" iconSize={16}>Like</Button>
          <Button variant="ghost" onClick={() => setShowComments(!showComments)} requireAuth className="flex-1 text-text-secondary rounded-full" iconName="MessageCircle" iconPosition="left" iconSize={16}>Comment</Button>
          <Button variant="ghost" className="flex-1 text-text-secondary rounded-full" iconName={isSaved ? 'BookmarkCheck' : 'Bookmark'} requireAuth onClick={handleSave} iconPosition="left" iconSize={16}>{isSaved ? 'Saved' : 'Save'}</Button>
          <OpenGraphButton post={post} />
        </div>
      </div>

      {/* Comments Section */}
      {showComments && (
        <div className="px-6 py-4 border-t border-border bg-muted/30">
          <div className="flex items-start space-x-3 mb-4">
            <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center flex-shrink-0">
              <Icon name="User" size={16} color="white" />
            </div>
            <div className="flex-1">
              <textarea value={commentText} onChange={(e) => setCommentText(e.target.value)} placeholder="Add a comment..." className="w-full p-3 border border-border rounded-2xl resize-none text-sm focus:ring-2 focus:ring-primary focus:border-transparent" rows={2} />
              <div className="flex justify-end mt-2">
                <Button variant="default" size="sm" onClick={handleComment} requireAuth disabled={!commentText.trim()} className="rounded-full">Comment</Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FeedPost;

const MoreMenu = ({ onShare, onSave, isSaved }) => {
  const [open, setOpen] = React.useState(false);
  const menuRef = React.useRef(null);
  React.useEffect(() => {
    const onDoc = (e) => { if (open && menuRef.current && !menuRef.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', onDoc);
    return () => document.removeEventListener('mousedown', onDoc);
  }, [open]);
  return (
    <div className="relative" ref={menuRef}>
      <Button variant="ghost" size="icon" className="w-8 h-8" onClick={() => setOpen(!open)}>
        <Icon name="MoreHorizontal" size={16} />
      </Button>
      {open && (
        <div className="absolute right-0 mt-2 w-40 bg-card border border-border rounded-md shadow-card z-10">
          <button className="w-full text-left px-3 py-2 text-sm hover:bg-muted" onClick={() => { setOpen(false); onShare(); }}>Share</button>
          <button className="w-full text-left px-3 py-2 text-sm hover:bg-muted" onClick={() => { setOpen(false); onSave && onSave(); }}>{isSaved ? 'Unsave' : 'Save'}</button>
        </div>
      )}
    </div>
  );
};

const OpenGraphButton = ({ post }) => {
  const [open, setOpen] = React.useState(false);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState(null);
  const [connections, setConnections] = React.useState([]);
  const [viewMode, setViewMode] = React.useState('tree');
  const [selectedNode, setSelectedNode] = React.useState(null);
  const panelRef = useRef(null);

  useEffect(() => {
    const handler = (e) => {
      if (!open) return;
      if (panelRef.current && !panelRef.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open]);

  // Shift main content to the left while panel is open (desktop only)
  useEffect(() => {
    const main = typeof window !== 'undefined' ? document.querySelector('main') : null;
    if (!main) return;
    if (open && window.innerWidth >= 768) {
      main.style.marginRight = '40%';
    } else {
      main.style.marginRight = '';
    }
    return () => { if (main) main.style.marginRight = ''; };
  }, [open]);

  const openAndLoad = async () => {
    setOpen(true);
    setLoading(true);
    setError(null);
    try {
      const token = getAuthToken();
      const data = await fetchPostGraph({ postId: post.id, token });
      const users = Array.isArray(data?.users) ? data.users : [];
      const mapped = users.map(u => ({
        id: u.id,
        name: u.name,
        title: '',
        company: '',
        location: '',
        industry: '',
        connections: 0,
        connectedDate: '',
        interactions: 0,
        avatar: u.picture && u.picture !== 'None' ? u.picture : undefined,
        bio: '',
        skills: [],
        mutualConnections: [],
      }));
      setConnections(mapped);
    } catch (e) {
      console.error(e);
      setError(e?.message || 'Failed to load graph');
      setConnections([]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Button variant="ghost" className="flex-1 text-text-secondary" iconName="ChartBar" onClick={openAndLoad} iconPosition="left" iconSize={16}>Graph</Button>
      {open && (
        <div ref={panelRef} className="fixed top-16 right-0 h-[calc(100vh-4rem)] w-full md:w-[40%] bg-card border-l border-border shadow-2xl z-[900]">
          <div className="p-4 border-b border-border flex items-center justify-between">
            <h3 className="text-sm font-semibold text-foreground">Post Graph</h3>
            <Button variant="ghost" size="icon" onClick={() => setOpen(false)}><Icon name="X" size={16} /></Button>
          </div>
          <div className="p-4">
            {loading && <div className="h-72 bg-muted rounded-lg animate-pulse" />}
            {error && <div className="text-sm text-error mb-3">{error}</div>}
            {!loading && !error && (
              connections.length === 0 ? (
                <div className="h-72 bg-muted rounded-lg flex items-center justify-center"><span className="text-text-secondary text-sm">No users to display</span></div>
              ) : (
                <div className="border border-border rounded-2xl overflow-hidden">
                  <NetworkVisualization
                    connections={connections}
                    selectedNode={selectedNode}
                    onNodeSelect={setSelectedNode}
                    viewMode={viewMode}
                    onViewModeChange={setViewMode}
                    className="h-[480px]"
                    showControls={false}
                    showLegend={false}
                  />
                </div>
              )
            )}
          </div>
        </div>
      )}
    </>
  );
};