import React, { useState, useEffect } from 'react';
import FeedPost from './FeedPost';
import Icon from '@/src/components/AppIcon';
import Button from '@/src/components/ui/Button';
import { fetchFeed, fetchUserLiked, fetchUserSaved, getAuthToken, mapApiPostToUI } from '@/src/utils/api';

const FeedContainer = ({ newPost, refreshKey }) => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [filter, setFilter] = useState('all');
  const [trending, setTrending] = useState([]);
  const [page, setPage] = useState(1);

  const filterOptions = [
    { value: 'all', label: 'All Posts', icon: 'Grid3X3' },
    { value: 'liked', label: 'Liked', icon: 'ThumbsUp' },
    { value: 'saved', label: 'Saved', icon: 'Bookmark' },
    { value: 'idea', label: 'Ideas', icon: 'Lightbulb' },
    { value: 'thought', label: 'Thoughts', icon: 'MessageCircle' },
  ];

  useEffect(() => {
    loadPosts(true);
  }, [filter, refreshKey]);

  useEffect(() => {
    if (newPost) {
      setPosts(prev => [newPost, ...prev]);
    }
  }, [newPost]);

  const loadPosts = async (reset = false) => {
    setLoading(true);
    try {
      const token = getAuthToken();
      let data = [];
      if (filter === 'liked') {
        data = await fetchUserLiked({ token });
      } else if (filter === 'saved') {
        data = await fetchUserSaved({ token });
      } else {
        data = await fetchFeed({ page: 1, token });
      }
      let mapped = Array.isArray(data) ? data.map(mapApiPostToUI) : [];
      if (filter === 'idea') mapped = mapped.filter(p => p.type === 'idea');
      if (filter === 'thought') mapped = mapped.filter(p => p.type === 'thought');
      setPosts(mapped);
      // compute trending hashtags from current list
      const counts = new Map();
      mapped.forEach(p => (p.hashtags || []).forEach(tag => counts.set(tag, (counts.get(tag) || 0) + 1)));
      const topTags = Array.from(counts.entries()).sort((a,b)=>b[1]-a[1]).slice(0,12).map(([tag])=>tag);
      setTrending(topTags);
      setHasMore(false); // until pagination endpoint defined
      setPage(1);
    } catch (e) {
      console.error(e);
      setPosts([]);
      setHasMore(false);
    } finally {
      setLoading(false);
    }
  };

  const loadMorePosts = () => {
    if (loading || !hasMore) return;
    // Placeholder for future pagination
  };

  const SkeletonPost = () => (
    <div className="bg-card border border-border rounded-lg shadow-card p-6 mb-6 animate-pulse">
      <div className="flex items-start space-x-3 mb-4">
        <div className="w-12 h-12 bg-muted rounded-full"></div>
        <div className="flex-1">
          <div className="h-4 bg-muted rounded w-1/3 mb-2"></div>
          <div className="h-3 bg-muted rounded w-1/2"></div>
        </div>
      </div>
      <div className="space-y-2 mb-4">
        <div className="h-4 bg-muted rounded"></div>
        <div className="h-4 bg-muted rounded w-3/4"></div>
        <div className="h-4 bg-muted rounded w-1/2"></div>
      </div>
      <div className="flex items-center justify-between">
        <div className="flex space-x-4">
          <div className="h-8 bg-muted rounded w-16"></div>
          <div className="h-8 bg-muted rounded w-20"></div>
          <div className="h-8 bg-muted rounded w-16"></div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Trending Tags Bar */}
      <div className="bg-card border border-border rounded-2xl shadow-card p-2 sticky top-16 z-[10]">
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar">
          <Button
            variant={filter === 'all' ? 'default' : 'outline'}
            size="sm"
            className="rounded-full"
            onClick={() => setFilter('all')}
            iconName="Flame"
            iconPosition="left"
            iconSize={16}
          >
            Trending
          </Button>
          {trending.map(tag => (
            <Button
              key={tag}
              variant={filter === `tag:${tag}` ? 'default' : 'outline'}
              size="sm"
              className="rounded-full"
              onClick={() => setFilter(prev => prev === `tag:${tag}` ? 'all' : `tag:${tag}`)}
            >
              #{tag}
            </Button>
          ))}
        </div>
      </div>
      {/* Filter Bar */}
      <div className="bg-card border border-border rounded-2xl shadow-card p-2 flex flex-wrap gap-1">
        {filterOptions.map((opt) => (
          <Button
            key={opt.value}
            variant={filter === opt.value ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setFilter(opt.value)}
            iconName={opt.icon}
            iconPosition="left"
            iconSize={16}
            className="rounded-full"
          >
            {opt.label}
          </Button>
        ))}
      </div>

      {/* Posts Feed */}
      <div>
        {posts.map((post) => (
          <FeedPost key={post.id} post={post} />
        ))}
        
        {loading && (
          <>
            <SkeletonPost />
            <SkeletonPost />
          </>
        )}
        
        {!loading && posts.length === 0 && (
          <div className="bg-card border border-border rounded-lg shadow-card p-12 text-center">
            <Icon name="FileText" size={48} className="text-text-secondary mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-foreground mb-2">No posts found</h3>
            <p className="text-text-secondary mb-4">
              Your feed is empty. Start following people or create your first post!
            </p>
            <Button variant="default" iconName="Plus" iconPosition="left" iconSize={16}>
              Create Post
            </Button>
          </div>
        )}
        
        {!loading && hasMore && posts.length > 0 && (
          <div className="text-center py-6">
            <Button 
              variant="outline" 
              onClick={loadMorePosts}
              iconName="ChevronDown"
              iconPosition="right"
              iconSize={16}
              className="rounded-full"
            >
              Load more posts
            </Button>
          </div>
        )}
        
        {!loading && !hasMore && posts.length > 0 && (
          <div className="text-center py-6">
            <p className="text-text-secondary text-sm">You've reached the end of your feed</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default FeedContainer;