import React, { useState } from 'react';
import Icon from '@/src/components/AppIcon';
import Image from '@/src/components/AppImage';
import Button from '@/src/components/ui/Button';
import Input from '@/src/components/ui/Input';
import { useAuth } from "../../../context/AuthContext";

const CommentSection = ({ comments: initialComments, className = '' }) => {
  const { isAuthenticated, openAuthModal } = useAuth();
  const [comments, setComments] = useState(initialComments);
  const [newComment, setNewComment] = useState('');
  const [replyingTo, setReplyingTo] = useState(null);
  const [replyText, setReplyText] = useState('');
  const [sortBy, setSortBy] = useState('newest');

  const handleAddComment = () => {
    if (!isAuthenticated) {
      openAuthModal();
      return;
    }
    if (newComment.trim()) {
      const comment = {
        id: Date.now(),
        author: {
          name: 'Current User',
          avatar: '',
          title: '',
        },
        content: newComment,
        timestamp: 'Just now',
        likes: 0,
        isLiked: false,
        replies: [],
      };
      setComments([comment, ...comments]);
      setNewComment('');
    }
  };

  const handleAddReply = (commentId) => {
    if (!isAuthenticated) {
      openAuthModal();
      return;
    }
    if (replyText.trim()) {
      const reply = {
        id: Date.now(),
        author: {
          name: 'John Doe',
          avatar: 'https://randomuser.me/api/portraits/men/1.jpg',
          title: 'Product Manager'
        },
        content: replyText,
        timestamp: 'Just now',
        likes: 0,
        isLiked: false
      };

      setComments(comments.map(comment => 
        comment.id === commentId 
          ? { ...comment, replies: [...comment.replies, reply] }
          : comment
      ));
      
      setReplyText('');
      setReplyingTo(null);
    }
  };

  const handleLikeComment = (commentId, isReply = false, parentId = null) => {
    if (!isAuthenticated) {
      openAuthModal();
      return;
    }
    if (isReply) {
      setComments(comments.map(comment => 
        comment.id === parentId 
          ? {
              ...comment,
              replies: comment.replies.map(reply =>
                reply.id === commentId
                  ? {
                      ...reply,
                      likes: reply.isLiked ? reply.likes - 1 : reply.likes + 1,
                      isLiked: !reply.isLiked
                    }
                  : reply
              )
            }
          : comment
      ));
    } else {
      setComments(comments.map(comment => 
        comment.id === commentId 
          ? {
              ...comment,
              likes: comment.isLiked ? comment.likes - 1 : comment.likes + 1,
              isLiked: !comment.isLiked
            }
          : comment
      ));
    }
  };

  const sortedComments = [...comments].sort((a, b) => {
    if (sortBy === 'newest') {
      return new Date(b.timestamp) - new Date(a.timestamp);
    } else if (sortBy === 'oldest') {
      return new Date(a.timestamp) - new Date(b.timestamp);
    } else if (sortBy === 'popular') {
      return b.likes - a.likes;
    }
    return 0;
  });

  const CommentItem = ({ comment, isReply = false, parentId = null }) => (
    <div className={`${isReply ? 'ml-12' : ''}`}>
      <div className="flex space-x-3">
        <div className="w-10 h-10 rounded-full overflow-hidden flex-shrink-0">
          <Image
            src={comment.author.avatar}
            alt={comment.author.name}
            className="w-full h-full object-cover"
          />
        </div>
        
        <div className="flex-1 min-w-0">
          <div className="bg-muted rounded-lg p-3">
            <div className="flex items-center space-x-2 mb-1">
              <h4 className="font-medium text-foreground text-sm">{comment.author.name}</h4>
              <span className="text-xs text-text-secondary">{comment.author.title}</span>
            </div>
            <p className="text-sm text-foreground leading-relaxed">{comment.content}</p>
          </div>
          
          <div className="flex items-center space-x-4 mt-2 text-xs text-text-secondary">
            <span>{comment.timestamp}</span>
            
            <button
              onClick={() => handleLikeComment(comment.id, isReply, parentId)}
              className={`flex items-center space-x-1 hover:text-foreground transition-micro ${
                comment.isLiked ? 'text-primary' : ''
              }`}
            >
              <Icon name="ThumbsUp" size={12} />
              <span>{comment.likes > 0 ? comment.likes : 'Like'}</span>
            </button>
            
            {!isReply && (
              <button
                onClick={() => setReplyingTo(replyingTo === comment.id ? null : comment.id)}
                className="hover:text-foreground transition-micro"
              >
                Reply
              </button>
            )}
            
            <button className="hover:text-foreground transition-micro">
              <Icon name="MoreHorizontal" size={12} />
            </button>
          </div>
          
          {/* Reply Input */}
          {replyingTo === comment.id && (
            <div className="mt-3 flex space-x-2">
              <div className="w-8 h-8 rounded-full overflow-hidden flex-shrink-0">
                <Image
                  src="https://randomuser.me/api/portraits/men/1.jpg"
                  alt="Your avatar"
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="flex-1">
                <Input
                  type="text"
                  placeholder={`Reply to ${comment.author.name}...`}
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  className="mb-2"
                />
                <div className="flex items-center space-x-2">
                  <Button
                    size="sm"
                    onClick={() => handleAddReply(comment.id)}
                    disabled={!replyText.trim()}
                  >
                    Reply
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setReplyingTo(null);
                      setReplyText('');
                    }}
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            </div>
          )}
          
          {/* Replies */}
          {comment.replies && comment.replies.length > 0 && (
            <div className="mt-4 space-y-4">
              {comment.replies.map((reply) => (
                <CommentItem
                  key={reply.id}
                  comment={reply}
                  isReply={true}
                  parentId={comment.id}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );

  return (
    <div className={`bg-card border border-border rounded-lg p-6 ${className}`}>
      {/* Comments Header */}
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-foreground">
          Comments ({comments.length})
        </h3>
        
        <div className="flex items-center space-x-2">
          <span className="text-sm text-text-secondary">Sort by:</span>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="text-sm border border-border rounded-md px-2 py-1 bg-background text-foreground"
          >
            <option value="newest">Newest</option>
            <option value="oldest">Oldest</option>
            <option value="popular">Most Popular</option>
          </select>
        </div>
      </div>

      {/* Add Comment */}
      <div className="mb-6">
        <div className="flex space-x-3">
          <div className="w-10 h-10 rounded-full overflow-hidden flex-shrink-0">
            <Image
              src="https://randomuser.me/api/portraits/men/1.jpg"
              alt="Your avatar"
              className="w-full h-full object-cover"
            />
          </div>
          <div className="flex-1">
            <Input
              type="text"
              placeholder="Add a comment..."
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              className="mb-3"
            />
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2 text-sm text-text-secondary">
                <Icon name="Image" size={16} className="cursor-pointer hover:text-foreground" />
                <Icon name="Smile" size={16} className="cursor-pointer hover:text-foreground" />
                <Icon name="AtSign" size={16} className="cursor-pointer hover:text-foreground" />
              </div>
              <Button
                variant="default"
                size="sm"
                onClick={handleAddComment}
                requireAuth
                disabled={!newComment.trim()}
              >
                Comment
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Comments List */}
      <div className="space-y-6">
        {sortedComments.length > 0 ? (
          sortedComments.map((comment) => (
            <CommentItem key={comment.id} comment={comment} />
          ))
        ) : (
          <div className="text-center py-8">
            <Icon name="MessageCircle" size={48} className="text-text-secondary mx-auto mb-4" />
            <p className="text-text-secondary">No comments yet. Be the first to share your thoughts!</p>
          </div>
        )}
      </div>

      {/* Load More Comments */}
      {comments.length > 5 && (
        <div className="mt-6 text-center">
          <Button variant="outline">
            Load more comments
          </Button>
        </div>
      )}
    </div>
  );
};

export default CommentSection;