import React, { useState } from 'react';
import Icon from '@/src/components/AppIcon';
import Button from '@/src/components/ui/Button';
import { useAuth } from "../../../context/AuthContext";

const EngagementSection = ({ article, className = '' }) => {
  const { isAuthenticated, openAuthModal } = useAuth();
  const [reactions, setReactions] = useState({
    like: { count: article.reactions.like, isActive: false },
    love: { count: article.reactions.love, isActive: false },
    insightful: { count: article.reactions.insightful, isActive: false },
    celebrate: { count: article.reactions.celebrate, isActive: false }
  });

  const [showReactions, setShowReactions] = useState(false);

  const reactionTypes = [
    { key: 'like', icon: 'ThumbsUp', label: 'Like', color: 'text-blue-500' },
    { key: 'love', icon: 'Heart', label: 'Love', color: 'text-red-500' },
    { key: 'insightful', icon: 'Lightbulb', label: 'Insightful', color: 'text-yellow-500' },
    { key: 'celebrate', icon: 'PartyPopper', label: 'Celebrate', color: 'text-green-500' }
  ];

  const handleReaction = (reactionKey) => {
    if (!isAuthenticated) {
      openAuthModal();
      return;
    }
    setReactions(prev => ({
      ...prev,
      [reactionKey]: {
        count: prev[reactionKey].isActive 
          ? prev[reactionKey].count - 1 
          : prev[reactionKey].count + 1,
        isActive: !prev[reactionKey].isActive
      }
    }));
    setShowReactions(false);
  };

  const getTotalReactions = () => {
    return Object.values(reactions).reduce((total, reaction) => total + reaction.count, 0);
  };

  const getTopReactions = () => {
    return Object.entries(reactions)
      .filter(([_, reaction]) => reaction.count > 0)
      .sort(([_, a], [__, b]) => b.count - a.count)
      .slice(0, 3);
  };

  return (
    <div className={`bg-card border border-border rounded-lg p-6 ${className}`}>
      {/* Reaction Summary */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-2">
          {getTopReactions().map(([key, reaction], index) => {
            const reactionType = reactionTypes.find(r => r.key === key);
            return (
              <div key={key} className="flex items-center space-x-1">
                <div className="w-6 h-6 bg-muted rounded-full flex items-center justify-center">
                  <Icon name={reactionType.icon} size={12} className={reactionType.color} />
                </div>
                {index === 0 && (
                  <span className="text-sm text-text-secondary">{getTotalReactions()}</span>
                )}
              </div>
            );
          })}
        </div>
        
        <div className="flex items-center space-x-4 text-sm text-text-secondary">
          <span>{article.comments} comments</span>
          <span>{article.shares} shares</span>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex items-center justify-between border-t border-border pt-4">
        <div className="flex items-center space-x-2">
          {/* Like Button with Reactions */}
          <div className="relative">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowReactions(!showReactions)}
              requireAuth
              onMouseEnter={() => setShowReactions(true)}
              className={`${reactions.like.isActive ? 'text-primary' : 'text-text-secondary'}`}
              iconName="ThumbsUp"
              iconPosition="left"
              iconSize={16}
            >
              Like
            </Button>

            {showReactions && (
              <div 
                className="absolute bottom-full left-0 mb-2 bg-popover border border-border rounded-lg shadow-modal p-2 flex items-center space-x-2 z-1010"
                onMouseLeave={() => setShowReactions(false)}
              >
                {reactionTypes.map((reaction) => (
                  <button
                    key={reaction.key}
                    onClick={() => handleReaction(reaction.key)}
                    className={`w-10 h-10 rounded-full flex items-center justify-center hover:bg-muted transition-micro ${
                      reactions[reaction.key].isActive ? 'bg-muted' : ''
                    }`}
                    title={reaction.label}
                  >
                    <Icon name={reaction.icon} size={20} className={reaction.color} />
                  </button>
                ))}
              </div>
            )}
          </div>

          <Button
            variant="ghost"
            size="sm"
            requireAuth
            iconName="MessageCircle"
            iconPosition="left"
            iconSize={16}
          >
            Comment
          </Button>

          <Button
            variant="ghost"
            size="sm"
            requireAuth
            iconName="Share2"
            iconPosition="left"
            iconSize={16}
          >
            Share
          </Button>
        </div>

        <Button
          variant="ghost"
          size="sm"
          requireAuth
          iconName="Send"
          iconPosition="left"
          iconSize={16}
        >
          Send
        </Button>
      </div>

      {/* Quick Stats */}
      <div className="mt-4 pt-4 border-t border-border">
        <div className="grid grid-cols-3 gap-4 text-center">
          <div>
            <div className="text-lg font-semibold text-foreground">{getTotalReactions()}</div>
            <div className="text-xs text-text-secondary">Reactions</div>
          </div>
          <div>
            <div className="text-lg font-semibold text-foreground">{article.comments}</div>
            <div className="text-xs text-text-secondary">Comments</div>
          </div>
          <div>
            <div className="text-lg font-semibold text-foreground">{article.shares}</div>
            <div className="text-xs text-text-secondary">Shares</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EngagementSection;