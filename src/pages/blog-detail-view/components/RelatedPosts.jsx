import React from 'react';
import Link from 'next/link';
import Icon from '@/src/components/AppIcon';
import Image from '@/src/components/AppImage';

const RelatedPosts = ({ posts, className = '' }) => {
  if (!posts || posts.length === 0) {
    return null;
  }

  return (
    <div className={`bg-card border border-border rounded-lg p-6 ${className}`}>
      <div className="flex items-center space-x-2 mb-6">
        <Icon name="BookOpen" size={20} className="text-text-secondary" />
        <h3 className="font-semibold text-foreground">Related Articles</h3>
      </div>

      <div className="space-y-4">
        {posts.map((post, index) => (
          <Link
            key={index}
            href={`/blog-detail-view?id=${post.id}`}
            className="block group"
          >
            <article className="flex space-x-3 p-3 rounded-lg hover:bg-muted transition-micro">
              <div className="w-16 h-16 rounded-lg overflow-hidden flex-shrink-0">
                <Image
                  src={post.thumbnail}
                  alt={post.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
              </div>
              
              <div className="flex-1 min-w-0">
                <h4 className="font-medium text-foreground text-sm leading-tight mb-1 group-hover:text-primary transition-micro line-clamp-2">
                  {post.title}
                </h4>
                
                <div className="flex items-center space-x-2 text-xs text-text-secondary">
                  <span>{post.author}</span>
                  <span>•</span>
                  <span>{post.readingTime} min</span>
                </div>
                
                <div className="flex items-center space-x-3 mt-2 text-xs text-text-secondary">
                  <div className="flex items-center space-x-1">
                    <Icon name="Heart" size={12} />
                    <span>{post.likes}</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Icon name="MessageCircle" size={12} />
                    <span>{post.comments}</span>
                  </div>
                </div>
              </div>
            </article>
          </Link>
        ))}
      </div>

      <Link
                  href="/"
        className="block mt-6 pt-4 border-t border-border"
      >
        <div className="flex items-center justify-center space-x-2 text-sm text-primary hover:text-primary/80 transition-micro">
          <span>View all articles</span>
          <Icon name="ArrowRight" size={14} />
        </div>
      </Link>
    </div>
  );
};

export default RelatedPosts;