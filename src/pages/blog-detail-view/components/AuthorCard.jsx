import React, { useState } from 'react';
import Link from 'next/link';
import Icon from '@/src/components/AppIcon';
import Image from '@/src/components/AppImage';
import Button from '@/src/components/ui/Button';

const AuthorCard = ({ author, className = '' }) => {
  const [isFollowing, setIsFollowing] = useState(false);

  const handleFollow = () => {
    setIsFollowing(!isFollowing);
  };

  return (
    <div className={`bg-card border border-border rounded-lg p-6 ${className}`}>
      <div className="flex items-start space-x-4">
        <div className="w-16 h-16 rounded-full overflow-hidden flex-shrink-0">
          <Image
            src={author.avatar}
            alt={author.name}
            className="w-full h-full object-cover"
          />
        </div>
        
        <div className="flex-1 min-w-0">
          <div className="flex items-center space-x-2 mb-1">
            <h3 className="font-semibold text-foreground">{author.name}</h3>
            {author.verified && (
              <Icon name="BadgeCheck" size={16} className="text-primary" />
            )}
          </div>
          
          <p className="text-sm text-text-secondary mb-2">{author.title}</p>
          
          <p className="text-sm text-foreground leading-relaxed mb-4">
            {author.bio}
          </p>
          
          {/* Author Stats */}
          <div className="flex items-center space-x-6 mb-4 text-sm">
            <div className="text-center">
              <div className="font-semibold text-foreground">{author.stats.followers}</div>
              <div className="text-xs text-text-secondary">Followers</div>
            </div>
            <div className="text-center">
              <div className="font-semibold text-foreground">{author.stats.articles}</div>
              <div className="text-xs text-text-secondary">Articles</div>
            </div>
            <div className="text-center">
              <div className="font-semibold text-foreground">{author.stats.likes}</div>
              <div className="text-xs text-text-secondary">Likes</div>
            </div>
          </div>
          
          {/* Action Buttons */}
          <div className="flex items-center space-x-3">
            <Button
              variant={isFollowing ? "outline" : "default"}
              size="sm"
              onClick={handleFollow}
              iconName={isFollowing ? "UserCheck" : "UserPlus"}
              iconPosition="left"
              iconSize={16}
            >
              {isFollowing ? "Following" : "Follow"}
            </Button>
            
            <Button
              variant="outline"
              size="sm"
              iconName="MessageCircle"
              iconPosition="left"
              iconSize={16}
            >
              Message
            </Button>
          </div>
        </div>
      </div>
      
      {/* Author's Recent Articles */}
      {author.recentArticles && author.recentArticles.length > 0 && (
        <div className="mt-6 pt-6 border-t border-border">
          <h4 className="font-medium text-foreground mb-4">More from {author.name}</h4>
          <div className="space-y-3">
            {author.recentArticles.slice(0, 3).map((article, index) => (
              <Link
                key={index}
                href={`/blog-detail-view?id=${article.id}`}
                className="block group"
              >
                <div className="flex items-start space-x-3 p-2 rounded-md hover:bg-muted transition-micro">
                  <div className="w-12 h-12 rounded-md overflow-hidden flex-shrink-0">
                    <Image
                      src={article.thumbnail}
                      alt={article.title}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h5 className="text-sm font-medium text-foreground group-hover:text-primary transition-micro line-clamp-2 mb-1">
                      {article.title}
                    </h5>
                    <div className="flex items-center space-x-2 text-xs text-text-secondary">
                      <span>{article.publishedDate}</span>
                      <span>•</span>
                      <span>{article.readingTime} min read</span>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
          
          <Link
            href="/"
            className="block mt-4 text-center"
          >
            <span className="text-sm text-primary hover:text-primary/80 transition-micro">
              View all articles by {author.name}
            </span>
          </Link>
        </div>
      )}
    </div>
  );
};

export default AuthorCard;