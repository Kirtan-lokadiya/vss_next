import React, { useState } from 'react';
import Icon from '@/src/components/AppIcon';
import Image from '@/src/components/AppImage';
import Button from '@/src/components/ui/Button';

const BlogHeader = ({ article }) => {
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [showShareMenu, setShowShareMenu] = useState(false);

  const handleBookmark = () => {
    setIsBookmarked(!isBookmarked);
  };

  const handleShare = (platform) => {
    const url = window.location.href;
    const title = article.title;
    
    switch (platform) {
      case 'twitter':
        window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(title)}&url=${encodeURIComponent(url)}`);
        break;
      case 'linkedin':
        window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`);
        break;
      case 'facebook':
        window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`);
        break;
      case 'copy':
        navigator.clipboard.writeText(url);
        break;
    }
    setShowShareMenu(false);
  };

  return (
    <header className="mb-8">
      {/* Article Title */}
      <h1 className="text-4xl lg:text-5xl font-bold text-foreground leading-tight mb-6">
        {article.title}
      </h1>

      {/* Article Subtitle */}
      {article.subtitle && (
        <p className="text-xl text-text-secondary leading-relaxed mb-8">
          {article.subtitle}
        </p>
      )}

      {/* Author and Meta Information */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-6">
        <div className="flex items-center space-x-4 mb-4 lg:mb-0">
          <div className="w-12 h-12 rounded-full overflow-hidden flex-shrink-0">
            <Image
              src={article.author.avatar}
              alt={article.author.name}
              className="w-full h-full object-cover"
            />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h3 className="font-semibold text-foreground">{article.author.name}</h3>
              {article.author.verified && (
                <Icon name="BadgeCheck" size={16} className="text-primary" />
              )}
            </div>
            <p className="text-sm text-text-secondary">{article.author.title}</p>
            <div className="flex items-center space-x-4 text-sm text-text-secondary mt-1">
              <span>{article.publishedDate}</span>
              <span>•</span>
              <span>{article.readingTime} min read</span>
              <span>•</span>
              <span>{article.views} views</span>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleBookmark}
            iconName={isBookmarked ? "Bookmark" : "BookmarkPlus"}
            iconPosition="left"
            iconSize={16}
          >
            {isBookmarked ? "Saved" : "Save"}
          </Button>

          <div className="relative">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowShareMenu(!showShareMenu)}
              iconName="Share2"
              iconPosition="left"
              iconSize={16}
            >
              Share
            </Button>

            {showShareMenu && (
              <div className="absolute top-full right-0 mt-2 w-48 bg-popover border border-border rounded-lg shadow-modal z-1010">
                <div className="p-2">
                  <button
                    onClick={() => handleShare('linkedin')}
                    className="w-full flex items-center space-x-3 px-3 py-2 text-left hover:bg-muted rounded-md transition-micro"
                  >
                    <Icon name="Linkedin" size={16} className="text-primary" />
                    <span className="text-sm text-foreground">LinkedIn</span>
                  </button>
                  <button
                    onClick={() => handleShare('twitter')}
                    className="w-full flex items-center space-x-3 px-3 py-2 text-left hover:bg-muted rounded-md transition-micro"
                  >
                    <Icon name="Twitter" size={16} className="text-blue-500" />
                    <span className="text-sm text-foreground">Twitter</span>
                  </button>
                  <button
                    onClick={() => handleShare('facebook')}
                    className="w-full flex items-center space-x-3 px-3 py-2 text-left hover:bg-muted rounded-md transition-micro"
                  >
                    <Icon name="Facebook" size={16} className="text-blue-600" />
                    <span className="text-sm text-foreground">Facebook</span>
                  </button>
                  <button
                    onClick={() => handleShare('copy')}
                    className="w-full flex items-center space-x-3 px-3 py-2 text-left hover:bg-muted rounded-md transition-micro"
                  >
                    <Icon name="Copy" size={16} className="text-text-secondary" />
                    <span className="text-sm text-foreground">Copy Link</span>
                  </button>
                </div>
              </div>
            )}
          </div>

          <Button
            variant="ghost"
            size="sm"
            iconName="MoreHorizontal"
            iconPosition="left"
            iconSize={16}
          >
            More
          </Button>
        </div>
      </div>

      {/* Featured Image */}
      {article.featuredImage && (
        <div className="w-full h-64 lg:h-96 rounded-lg overflow-hidden mb-8">
          <Image
            src={article.featuredImage}
            alt={article.title}
            className="w-full h-full object-cover"
          />
        </div>
      )}

      {/* Article Tags */}
      {article.tags && article.tags.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-6">
          {article.tags.map((tag, index) => (
            <span
              key={index}
              className="px-3 py-1 bg-muted text-text-secondary text-sm rounded-full hover:bg-secondary/20 transition-micro cursor-pointer"
            >
              #{tag}
            </span>
          ))}
        </div>
      )}
    </header>
  );
};

export default BlogHeader;