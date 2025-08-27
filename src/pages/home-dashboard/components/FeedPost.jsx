import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import Icon from '@/src/components/AppIcon';
import Image from '@/src/components/AppImage';
import Button from '@/src/components/ui/Button';
import { useAuth } from "../../../context/AuthContext";
import { toggleLikePost, toggleSavePost, getAuthToken, fetchPostGraph, donateToFund, createComment, fetchComments, fetchChildComments } from '@/src/utils/api';
import { extractUserId } from '@/src/utils/jwt';
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
  const [comments, setComments] = useState([]);
  const [loadingComments, setLoadingComments] = useState(false);
  const [donationPool, setDonationPool] = useState(post?.campaign?.raised || post.donationPool || 0);
  const [showDonate, setShowDonate] = useState(false);
  const [donationAmount, setDonationAmount] = useState(5);
  const [showCustom, setShowCustom] = useState(false);
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

  const handleDonate = async (amount) => {
    if (!isAuthenticated) {
      openAuthModal();
      return;
    }
    const parsed = Number(amount);
    if (!isNaN(parsed) && parsed > 0) {
      if (post.type === 'open_fund') {
        try {
          setMutating(true);
          const token = getAuthToken();
          await donateToFund({ postId: post.id, amount: parsed, token });
          showToast(`Donated ₹${parsed} successfully!`, 'success');
          // Update local state - in real app you'd refetch the post
          if (post.fields) {
            post.fields.collectedAmount = (post.fields.collectedAmount || 0) + parsed;
          }
        } catch (e) {
          showToast(e.message || 'Failed to donate', 'error');
        } finally {
          setMutating(false);
        }
      } else {
        setDonationPool(prev => prev + parsed);
      }
      setShowDonate(false);
    }
  };

  const loadComments = async () => {
    if (loadingComments) return;
    const token = getAuthToken();
    if (!token) {
      openAuthModal();
      return;
    }
    setLoadingComments(true);
    try {
      const data = await fetchComments({ postId: post.id, token });
      // Sort comments by timestamp descending (latest first)
      const sortedData = data.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
      setComments(sortedData);
    } catch (e) {
      console.error('Failed to load comments:', e);
      showToast('Failed to load comments', 'error');
    } finally {
      setLoadingComments(false);
    }
  };

  const handleComment = async () => {
    if (!isAuthenticated) {
      openAuthModal();
      return;
    }
    if (!commentText.trim()) return;
    
    const token = getAuthToken();
    if (!token) {
      openAuthModal();
      return;
    }
    
    try {
      const userId = extractUserId(token);
      const newComment = await createComment({
        postId: post.id,
        parentId: null,
        userId,
        content: commentText.trim(),
        token
      });
      setComments(prev => [newComment, ...prev]);
      setCommentText('');
      // Update post comment count
      post.comments = (post.comments || 0) + 1;
      showToast('Comment added successfully!', 'success');
    } catch (e) {
      showToast(e.message || 'Failed to add comment', 'error');
    }
  };

  const toggleComments = () => {
    const newShow = !showComments;
    setShowComments(newShow);
    if (newShow && comments.length === 0) {
      loadComments();
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
              {post.author.avatar || `https://i.pravatar.cc/48?u=${post.author.name || Math.random()}` ? (
                <Image src={post.author.avatar || `https://i.pravatar.cc/48?u=${post.author.name || Math.random()}`} alt={post.author.name} className="w-12 h-12 rounded-full object-cover" />
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
                <div className="flex items-center space-x-1">
                  <Icon name={getPostTypeIcon(post.type)} size={12} className="text-text-secondary" />
                  <span className="text-xs text-text-secondary capitalize">{post.type.replace('_', ' ')}</span>
                </div>
                <span className="text-xs text-text-secondary">•</span>
                <span className="text-xs text-text-secondary">At {formatTimeAgo(post.timestamp)}</span>
              </div>
            </div>
          </div>
          <div className="relative">
            <MoreMenu post={post} onShare={handleShare} onSave={handleSave} isSaved={isSaved} />
          </div>
        </div>
      </div>

      {/* Post Title */}
      {(post.type === 'open_fund' || post.campaign) && (
        <div className="px-6 pb-2">
          <h2 className="text-lg font-semibold text-foreground">
            {post.fields?.title || post.campaign?.title || 'Funding Campaign'}
          </h2>
        </div>
      )}

      {/* Post Content */}
      <div className="px-6 pb-4">
        <div className="prose prose-sm max-w-none">
          <p className="text-foreground leading-relaxed mb-3">{post.content}</p>
        </div>

        {/* Open Fund Progress Bar */}
        {post.type === 'open_fund' && post.fields && (
          <div className="mt-3 rounded-xl p-4 bg-muted/20">
            <div className="h-3 bg-muted rounded-full overflow-hidden">
              <div
                className="h-full bg-green-500 rounded-full transition-all"
                style={{ width: `${Math.min(100, Math.round(((post.fields.collectedAmount || 0) / (post.fields.totalAmount || 1)) * 100))}%` }}
              />
            </div>
            <div className="flex items-center justify-between mt-2 text-xs text-text-secondary">
              <span>₹{(post.fields.collectedAmount || 0).toLocaleString('en-IN')} raised</span>
              <span>
                {Math.round(((post.fields.collectedAmount || 0) / (post.fields.totalAmount || 1)) * 100) >= 100 
                  ? 'Completed' 
                  : `${Math.min(100, Math.round(((post.fields.collectedAmount || 0) / (post.fields.totalAmount || 1)) * 100))}% funded`
                }
              </span>
              <span>Goal: ₹{(post.fields.totalAmount || 0).toLocaleString('en-IN')}</span>
            </div>
            <div className="flex justify-center mt-3">
              <Button variant="default" size="sm" onClick={() => setShowDonate(!showDonate)} className="bg-green-500 hover:bg-green-600 text-white">Donate</Button>
            </div>
            {showDonate && (
              <div className="mt-3 p-3 rounded-lg bg-card">
                <div className="flex flex-wrap gap-2 mb-2">
                  {[50,100,500,1000].map(v => (
                    <Button key={v} variant="secondary" size="sm" onClick={() => handleDonate(v)}>₹{v}</Button>
                  ))}
                  <Button variant="secondary" size="sm" onClick={() => setShowCustom(!showCustom)}>Custom</Button>
                </div>
                {showCustom && (
                  <div className="flex items-center gap-2 mt-2">
                    <input type="number" value={donationAmount} onChange={(e)=>setDonationAmount(e.target.value)} className="w-28 px-3 py-2 border border-border rounded-lg text-sm"/>
                    <Button variant="default" size="sm" onClick={()=>handleDonate(donationAmount)}>Add</Button>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* Campaign Block (dummy/local) */}
        {post.campaign && (
          <div className="mt-3 rounded-xl p-4 bg-muted/20">
            <div className="h-3 bg-muted rounded-full overflow-hidden">
              <div
                className="h-full bg-green-500 rounded-full transition-all"
                style={{ width: `${Math.min(100, Math.round(((donationPool) / (goal || 1)) * 100))}%` }}
              />
            </div>
            <div className="flex items-center justify-between mt-2 text-xs text-text-secondary">
              <span>₹{(donationPool).toLocaleString('en-IN')} raised</span>
              <span>
                {Math.round(((donationPool) / (goal || 1)) * 100) >= 100 
                  ? 'Completed' 
                  : `${Math.min(100, Math.round(((donationPool) / (goal || 1)) * 100))}% funded`
                }
              </span>
              <span>Goal: ₹{(goal).toLocaleString('en-IN')}</span>
            </div>
            <div className="flex justify-center mt-3">
              <Button variant="default" size="sm" onClick={() => setShowDonate(!showDonate)} className="bg-green-500 hover:bg-green-600 text-white">Donate</Button>
            </div>
            {showDonate && (
              <div className="mt-3 p-3 rounded-lg bg-card">
                <div className="flex flex-wrap gap-2 mb-2">
                  {[50,100,500,1000].map(v => (
                    <Button key={v} variant="secondary" size="sm" onClick={() => handleDonate(v)}>₹{v}</Button>
                  ))}
                  <Button variant="secondary" size="sm" onClick={() => setShowCustom(!showCustom)}>Custom</Button>
                </div>
                {showCustom && (
                  <div className="flex items-center gap-2 mt-2">
                    <input type="number" value={donationAmount} onChange={(e)=>setDonationAmount(e.target.value)} className="w-28 px-3 py-2 border border-border rounded-lg text-sm"/>
                    <Button variant="default" size="sm" onClick={()=>handleDonate(donationAmount)}>Add</Button>
                  </div>
                )}
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
          <Button 
            variant="ghost" 
            onClick={handleLike} 
            requireAuth 
            className={`flex-1 rounded-full hover:bg-gray-100 transition-all duration-200 ${
              isLiked ? 'text-blue-500 scale-105' : 'text-text-secondary'
            }`} 
            iconName="ThumbsUp" 
            iconPosition="left" 
            iconSize={16}
          >
            Like
          </Button>
          <Button 
            variant="ghost" 
            onClick={toggleComments} 
            requireAuth 
            className={`flex-1 rounded-full hover:bg-gray-100 transition-all duration-200 ${
              showComments ? 'bg-gray-200 text-gray-700' : 'text-text-secondary'
            }`} 
            iconName="MessageCircle" 
            iconPosition="left" 
            iconSize={16}
          >
            Comment
          </Button>
          <Button 
            variant="ghost" 
            className="flex-1 text-text-secondary rounded-full hover:bg-gray-100 transition-all duration-200" 
            iconName={isSaved ? 'BookmarkCheck' : 'Bookmark'} 
            requireAuth 
            onClick={handleSave} 
            iconPosition="left" 
            iconSize={16}
          >
            {isSaved ? 'Saved' : 'Save'}
          </Button>
          <OpenGraphButton post={post} showComments={showComments} />
        </div>
      </div>

      {/* Comments Section */}
      {showComments && (
        <div className="px-6 py-4 border-t border-border bg-muted/30">
          {/* Add Comment */}
          <div className="flex items-start space-x-3 mb-4">
            <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center flex-shrink-0">
              <img src={`https://i.pravatar.cc/32?u=current-user`} alt="User" className="w-8 h-8 rounded-full object-cover" />
            </div>
            <div className="flex-1">
              <textarea value={commentText} onChange={(e) => setCommentText(e.target.value)} placeholder="Add a comment..." className="w-full p-3 border border-border rounded-2xl resize-none text-sm focus:ring-2 focus:ring-primary focus:border-transparent" rows={2} />
              <div className="flex justify-end mt-2">
                <Button variant="default" size="sm" onClick={handleComment} requireAuth disabled={!commentText.trim()} className="rounded-full">Comment</Button>
              </div>
            </div>
          </div>
          
          {/* Comments List */}
          {loadingComments ? (
            <div className="text-center py-4 text-text-secondary">Loading comments...</div>
          ) : (
            <div className="space-y-3">
              {comments.map((comment) => (
                <CommentItem key={comment.commentId} comment={comment} postId={post.id} onReply={(newComment) => setComments(prev => [...prev, newComment])} />
              ))}
              {comments.length === 0 && (
                <div className="text-center py-4 text-text-secondary text-sm">No comments yet. Be the first to comment!</div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

const CommentItem = ({ comment, postId, onReply }) => {
  const { isAuthenticated, openAuthModal } = useAuth();
  const { showToast } = useToast();
  const [showReplies, setShowReplies] = useState(false);
  const [replies, setReplies] = useState([]);
  const [replyText, setReplyText] = useState('');
  const [showReplyBox, setShowReplyBox] = useState(false);
  const [loadingReplies, setLoadingReplies] = useState(false);

  const loadReplies = async () => {
    if (loadingReplies) return;
    const token = getAuthToken();
    if (!token) {
      openAuthModal();
      return;
    }
    setLoadingReplies(true);
    try {
      const data = await fetchChildComments({ parentId: comment.commentId, token });
      setReplies(data);
    } catch (e) {
      console.error('Failed to load replies:', e);
      showToast('Failed to load replies', 'error');
    } finally {
      setLoadingReplies(false);
    }
  };

  const handleReply = async () => {
    if (!isAuthenticated) {
      openAuthModal();
      return;
    }
    if (!replyText.trim()) return;
    
    const token = getAuthToken();
    if (!token) {
      openAuthModal();
      return;
    }
    
    try {
      const userId = extractUserId(token);
      const newReply = await createComment({
        postId,
        parentId: comment.commentId,
        userId,
        content: replyText.trim(),
        token
      });
      setReplies(prev => [newReply, ...prev]);
      setReplyText('');
      setShowReplyBox(false);
      showToast('Reply added successfully!', 'success');
    } catch (e) {
      showToast(e.message || 'Failed to add reply', 'error');
    }
  };

  const toggleReplies = () => {
    const newShow = !showReplies;
    setShowReplies(newShow);
    if (newShow && replies.length === 0) {
      loadReplies();
    }
  };

  const formatTimeAgo = (timestamp) => {
    const now = new Date();
    const time = new Date(timestamp);
    const diffInHours = Math.floor((now - time) / (1000 * 60 * 60));
    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${diffInHours}h ago`;
    return `${Math.floor(diffInHours / 24)}d ago`;
  };

  return (
    <div className="border-l-2 border-border pl-4">
      <div className="flex items-start space-x-3">
        <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center flex-shrink-0">
          <img src={comment.picture && comment.picture !== 'None' ? comment.picture : `https://i.pravatar.cc/32?u=${comment.name || Math.random()}`} alt={comment.name} className="w-8 h-8 rounded-full object-cover" />
        </div>
        <div className="flex-1">
          <div className="bg-muted rounded-lg p-3">
            <div className="flex items-center space-x-2 mb-1">
              <span className="font-medium text-sm">{comment.name}</span>
              <span className="text-xs text-text-secondary">{formatTimeAgo(comment.timestamp)}</span>
            </div>
            <p className="text-sm">{comment.content}</p>
          </div>
          <div className="flex items-center space-x-4 mt-2 text-xs text-text-secondary">
            <button onClick={() => setShowReplyBox(!showReplyBox)} className="hover:text-primary">Reply</button>
            <button onClick={toggleReplies} className="hover:text-primary">
              {showReplies ? 'Hide replies' : 'Show replies'}
            </button>
          </div>
          
          {/* Reply Box */}
          {showReplyBox && (
            <div className="mt-3 flex items-start space-x-2">
              <div className="w-6 h-6 bg-primary rounded-full flex items-center justify-center flex-shrink-0">
                <Icon name="User" size={12} color="white" />
              </div>
              <div className="flex-1">
                <textarea value={replyText} onChange={(e) => setReplyText(e.target.value)} placeholder="Write a reply..." className="w-full p-2 border border-border rounded-lg resize-none text-sm" rows={2} />
                <div className="flex justify-end space-x-2 mt-2">
                  <Button variant="ghost" size="sm" onClick={() => setShowReplyBox(false)}>Cancel</Button>
                  <Button variant="default" size="sm" onClick={handleReply} disabled={!replyText.trim()}>Reply</Button>
                </div>
              </div>
            </div>
          )}
          
          {/* Replies */}
          {showReplies && (
            <div className="mt-3 space-y-2">
              {loadingReplies ? (
                <div className="text-xs text-text-secondary">Loading replies...</div>
              ) : (
                replies.map((reply) => (
                  <ChildCommentItem key={reply.commentId} comment={reply} postId={postId} onReply={(newReply) => setReplies(prev => [...prev, newReply])} />
                ))
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const ChildCommentItem = ({ comment, postId, onReply }) => {
  const { isAuthenticated, openAuthModal } = useAuth();
  const { showToast } = useToast();
  const [replyText, setReplyText] = useState('');
  const [showReplyBox, setShowReplyBox] = useState(false);
  const [showReplies, setShowReplies] = useState(false);
  const [replies, setReplies] = useState([]);
  const [loadingReplies, setLoadingReplies] = useState(false);

  const loadReplies = async () => {
    if (loadingReplies) return;
    const token = getAuthToken();
    if (!token) {
      openAuthModal();
      return;
    }
    setLoadingReplies(true);
    try {
      const data = await fetchChildComments({ parentId: comment.commentId, token });
      setReplies(data);
    } catch (e) {
      console.error('Failed to load replies:', e);
      showToast('Failed to load replies', 'error');
    } finally {
      setLoadingReplies(false);
    }
  };

  const toggleReplies = () => {
    const newShow = !showReplies;
    setShowReplies(newShow);
    if (newShow && replies.length === 0) {
      loadReplies();
    }
  };

  const handleReply = async () => {
    if (!isAuthenticated) {
      openAuthModal();
      return;
    }
    if (!replyText.trim()) return;
    
    const token = getAuthToken();
    if (!token) {
      openAuthModal();
      return;
    }
    
    try {
      const userId = extractUserId(token);
      const newReply = await createComment({
        postId,
        parentId: comment.commentId,
        userId,
        content: replyText.trim(),
        token
      });
      setReplies(prev => [newReply, ...prev]);
      setReplyText('');
      setShowReplyBox(false);
      showToast('Reply added successfully!', 'success');
    } catch (e) {
      showToast(e.message || 'Failed to add reply', 'error');
    }
  };

  const formatTimeAgo = (timestamp) => {
    const now = new Date();
    const time = new Date(timestamp);
    const diffInHours = Math.floor((now - time) / (1000 * 60 * 60));
    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${diffInHours}h ago`;
    return `${Math.floor(diffInHours / 24)}d ago`;
  };

  return (
    <div className="flex items-start space-x-2">
      <div className="w-6 h-6 bg-primary rounded-full flex items-center justify-center flex-shrink-0">
        <img src={comment.picture && comment.picture !== 'None' ? comment.picture : `https://i.pravatar.cc/24?u=${comment.name || Math.random()}`} alt={comment.name} className="w-6 h-6 rounded-full object-cover" />
      </div>
      <div className="flex-1">
        <div className="bg-card border border-border rounded-lg p-2">
          <div className="flex items-center space-x-2 mb-1">
            <span className="font-medium text-xs">{comment.name}</span>
            <span className="text-xs text-text-secondary">{formatTimeAgo(comment.timestamp)}</span>
          </div>
          <p className="text-xs">{comment.content}</p>
        </div>
        <div className="flex items-center space-x-4 mt-1 text-xs text-text-secondary">
          <button onClick={() => setShowReplyBox(!showReplyBox)} className="hover:text-primary">Reply</button>
          <button onClick={toggleReplies} className="hover:text-primary">
            {showReplies ? 'Hide replies' : 'Show replies'}
          </button>
        </div>
        
        {/* Reply Box */}
        {showReplyBox && (
          <div className="mt-2 flex items-start space-x-2">
            <div className="w-5 h-5 bg-primary rounded-full flex items-center justify-center flex-shrink-0">
              <Icon name="User" size={10} color="white" />
            </div>
            <div className="flex-1">
              <textarea value={replyText} onChange={(e) => setReplyText(e.target.value)} placeholder="Write a reply..." className="w-full p-2 border border-border rounded-lg resize-none text-xs" rows={2} />
              <div className="flex justify-end space-x-2 mt-1">
                <Button variant="ghost" size="sm" onClick={() => setShowReplyBox(false)}>Cancel</Button>
                <Button variant="default" size="sm" onClick={handleReply} disabled={!replyText.trim()}>Reply</Button>
              </div>
            </div>
          </div>
        )}
        
        {/* Child Replies */}
        {showReplies && (
          <div className="mt-2 ml-4 space-y-2">
            {loadingReplies ? (
              <div className="text-xs text-text-secondary">Loading replies...</div>
            ) : (
              replies.map((reply) => (
                <ChildCommentItem key={reply.commentId} comment={reply} postId={postId} onReply={(newReply) => setReplies(prev => [...prev, newReply])} />
              ))
            )}
          </div>
        )}
      </div>
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

const OpenGraphButton = ({ post, showComments }) => {
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
      <Button 
        variant="ghost" 
        className="flex-1 text-text-secondary hover:bg-gray-100 transition-all duration-200 rounded-full" 
        iconName="ChartBar" 
        onClick={openAndLoad} 
        iconPosition="left" 
        iconSize={16}
      >
        Graph
      </Button>
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