import React, { useState, useEffect } from 'react';
import FeedPost from './FeedPost';
import Icon from '@/src/components/AppIcon';
import Button from '@/src/components/ui/Button';

const FeedContainer = ({ newPost }) => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [filter, setFilter] = useState('all');

  // Mock posts data
  const mockPosts = [
    {
      id: 1,
      type: 'thought',
      author: {
        name: 'Sarah Johnson',
        title: 'Senior Product Manager',
        company: 'TechCorp',
        avatar: 'https://randomuser.me/api/portraits/women/32.jpg',
        
      },
      content: `Just published a comprehensive guide on implementing AI-driven product development workflows. After 6 months of testing with our team, we've seen a 40% improvement in feature delivery speed and significantly better user satisfaction scores.`,
      
      timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
      likes: 127,
      comments: 23,
      shares: 15,
      views: 1240,
      isLiked: false,
      hashtags: ['AI', 'ProductDevelopment', 'Innovation'],
      recentComments: [
        {
          author: 'Michael Chen',content: 'This is exactly what we needed! Thanks for sharing the framework.',
          timestamp: new Date(Date.now() - 30 * 60 * 1000)
        }
      ]
    },
    {
      id: 2,
      type: 'thought',
      author: {
        name: 'David Rodriguez',title: 'Engineering Manager',company: 'StartupXYZ',avatar: 'https://randomuser.me/api/portraits/men/45.jpg',
        
      },
      content: `Remote work has fundamentally changed how we approach team collaboration. The key isn't just having the right tools, but creating intentional moments for connection and creativity.\n\nWhat strategies have worked best for your distributed teams?`,
      timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000), // 4 hours ago
      likes: 89,
      comments: 31,
      shares: 8,
      views: 567,
      isLiked: true,
      hashtags: ['RemoteWork', 'TeamCollaboration', 'Leadership'],
      recentComments: [
        {
          author: 'Emily Davis',
          content: 'We do virtual coffee chats every Friday. Game changer!',
          timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000)
        },
        {
          author: 'Alex Kim',
          content: 'Async standups have been crucial for our global team.',
          timestamp: new Date(Date.now() - 1 * 60 * 60 * 1000)
        }
      ]
    },
    {
      id: 3,
      type: 'idea',
      author: {
        name: 'Emily Rodriguez',
        title: 'UX Designer',
        company: 'DesignStudio',
        avatar: 'https://randomuser.me/api/portraits/women/67.jpg',
        
      },
      content: `💡 New idea: What if we created a "Digital Empathy Map" that tracks user emotional states throughout their journey with our products?\n\nImagine being able to identify friction points not just through analytics, but through emotional indicators. This could revolutionize how we approach user experience design.`,
      timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000), // 6 hours ago
      likes: 156,
      comments: 42,
      shares: 28,
      views: 892,
      isLiked: false,
      hashtags: ['UXDesign', 'Innovation', 'UserResearch'],
      media: {
        type: 'link',
        title: 'The Future of Emotional Design',
        description: 'Exploring how emotional intelligence can transform digital product experiences',
        domain: 'uxdesign.com'
      },
      recentComments: [
        {
          author: 'John Smith',
          content: 'This could be huge for accessibility improvements too!',
          timestamp: new Date(Date.now() - 3 * 60 * 60 * 1000)
        }
      ]
    },
    {
      id: 4,
      type: 'update',
      author: {
        name: 'TechCorp Official',
        title: 'Company Updates',
        company: 'TechCorp',
        avatar: null,
        
      },
      content: `🎉 Exciting news! We're thrilled to announce the launch of our new AI-powered collaboration platform. After 18 months of development and testing with over 500 beta users, we're ready to transform how teams work together.\n\nKey features:\n• Real-time AI assistance for project planning\n• Smart meeting summaries and action items\n• Predictive workflow optimization\n• Seamless integration with existing tools`,
      timestamp: new Date(Date.now() - 8 * 60 * 60 * 1000), // 8 hours ago
      likes: 234,
      comments: 67,
      shares: 45,
      views: 2100,
      isLiked: false,
      hashtags: ['ProductLaunch', 'AI', 'Collaboration'],
      media: {
        type: 'image',
        url: 'https://images.unsplash.com/photo-1551434678-e076c223a692?w=800&h=400&fit=crop',
        alt: 'Team collaboration platform interface'
      },
      recentComments: [
        {
          author: 'Lisa Wang',
          content: 'Congratulations on the launch! Can\'t wait to try it out.',
          timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000)
        }
      ]
    },
    {
      id: 5,
      type: 'share',
      author: {
        name: 'Michael Chen',
        title: 'Data Scientist',
        company: 'DataCorp',
        avatar: 'https://randomuser.me/api/portraits/men/23.jpg',
        
      },
      content: `Sharing this insightful article about the future of data privacy. As we build more AI-powered products, it's crucial we prioritize user privacy and transparent data practices.\n\nThe key takeaway: Privacy-first design isn't just ethical—it's becoming a competitive advantage.`,
      timestamp: new Date(Date.now() - 12 * 60 * 60 * 1000), // 12 hours ago
      likes: 78,
      comments: 19,
      shares: 12,
      views: 445,
      isLiked: true,
      hashtags: ['DataPrivacy', 'AI', 'Ethics'],
      media: {
        type: 'link',title: 'Privacy-First AI: Building Trust in the Digital Age',description: 'How companies are balancing innovation with user privacy in AI development',
        domain: 'techreview.com'
      },
      recentComments: []
    }
  ];

  const filterOptions = [
    { value: 'all', label: 'All Posts', icon: 'Grid3X3' },
    { value: 'article', label: 'Articles', icon: 'FileText' },
    { value: 'thought', label: 'Thoughts', icon: 'MessageCircle' },
    { value: 'idea', label: 'Ideas', icon: 'Lightbulb' },
    { value: 'update', label: 'Updates', icon: 'Building' }
  ];

  useEffect(() => {
    // Initial load
    loadPosts();
  }, [filter]);

  useEffect(() => {
    if (newPost) {
      setPosts(prev => [newPost, ...prev]);
    }
  }, [newPost]);

  const loadPosts = () => {
    setLoading(true);
    
    // Simulate API call
    setTimeout(() => {
      const filteredPosts = filter === 'all' 
        ? mockPosts 
        : mockPosts.filter(post => post.type === filter);
      
      setPosts(filteredPosts);
      setLoading(false);
    }, 500);
  };

  const loadMorePosts = () => {
    if (loading || !hasMore) return;
    
    setLoading(true);
    
    // Simulate loading more posts
    setTimeout(() => {
      // For demo, we'll just show that there are no more posts
      setHasMore(false);
      setLoading(false);
    }, 1000);
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