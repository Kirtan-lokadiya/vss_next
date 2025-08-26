import React, { useState, useEffect, useRef } from 'react';
import FeedPost from './FeedPost';
import Icon from '@/src/components/AppIcon';
import Button from '@/src/components/ui/Button';
import { fetchFeed, fetchUserLiked, fetchUserSaved, getAuthToken, mapApiPostToUI } from '@/src/utils/api';

const FeedContainer = ({ newPost, refreshKey, attachCampaign, onCampaignAttached }) => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [filter, setFilter] = useState('all');
  const [page, setPage] = useState(1);
  const [showModal, setShowModal] = useState(false);


  // Guard against double effects in React 18 StrictMode (dev only)
  const fetchedKeysRef = useRef(new Set());

  useEffect(() => {
    const key = `${filter}|${String(refreshKey)}`;
    if (fetchedKeysRef.current.has(key)) return;
    fetchedKeysRef.current.add(key);
    loadPosts(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filter, refreshKey]);

  useEffect(() => {
    if (newPost) {
      setPosts(prev => [newPost, ...prev]);
    }
  }, [newPost]);

  // Attach a dummy campaign to the first post when provided
  useEffect(() => {
    if (!attachCampaign) return;
    setPosts(prev => {
      if (prev.length === 0) return prev;
      const updated = [...prev];
      const first = { ...updated[0] };
      first.campaign = {
        title: attachCampaign.title || 'Funding Campaign',
        goal: attachCampaign.goal || 630000,
        raised: typeof attachCampaign.raised === 'number' ? attachCampaign.raised : 0,
        description: attachCampaign.description || ''
      };
      updated[0] = first;
      return updated;
    });
    onCampaignAttached && onCampaignAttached();
  }, [attachCampaign, onCampaignAttached]);

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
            <Button variant="default" iconName="Plus" iconPosition="left" iconSize={16} onClick={() => setShowModal(true)}>
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