import React from 'react';
import Link from 'next/link';
import Icon from '@/src/components/AppIcon';
import Button from '@/src/components/ui/Button';

const TrendingSidebar = () => {
  const trendingTopics = [
    {
      id: 1,
      title: "AI in Product Development",
      posts: 1247,
      trend: "up",
      category: "Technology"
    },
    {
      id: 2,
      title: "Remote Work Best Practices",
      posts: 892,
      trend: "up",
      category: "Workplace"
    },
    {
      id: 3,
      title: "Sustainable Business Models",
      posts: 634,
      trend: "stable",
      category: "Business"
    },
    {
      id: 4,
      title: "Digital Transformation",
      posts: 521,
      trend: "down",
      category: "Technology"
    },
    {
      id: 5,
      title: "Leadership in Crisis",
      posts: 445,
      trend: "up",
      category: "Leadership"
    }
  ];

  const featuredProducts = [
    {
      id: 1,
      name: "CloudSync Pro",
      description: "Enterprise collaboration platform for distributed teams",
      category: "Productivity",
      rating: 4.8,
      users: "10K+"
    },
    {
      id: 2,
      name: "DataViz Studio",
      description: "Advanced data visualization and analytics tool",
      category: "Analytics",
      rating: 4.6,
      users: "5K+"
    }
  ];

  const getTrendIcon = (trend) => {
    switch (trend) {
      case 'up': return 'TrendingUp';
      case 'down': return 'TrendingDown';
      default: return 'Minus';
    }
  };

  const getTrendColor = (trend) => {
    switch (trend) {
      case 'up': return 'text-success';
      case 'down': return 'text-destructive';
      default: return 'text-text-secondary';
    }
  };

  return (
    <div className="space-y-6">
      {/* Trending Topics */}
      <div className="bg-card border border-border rounded-lg shadow-card">
        <div className="p-4 border-b border-border">
          <h3 className="font-semibold text-foreground">Trending Topics</h3>
        </div>
        <div className="p-4 space-y-3">
          {trendingTopics.map((topic, index) => (
            <div key={topic.id} className="flex items-center justify-between hover:bg-muted/50 p-2 rounded-lg transition-micro cursor-pointer">
              <div className="flex-1 min-w-0">
                <div className="flex items-center space-x-2">
                  <span className="text-xs font-medium text-text-secondary">#{index + 1}</span>
                  <h4 className="text-sm font-medium text-foreground truncate">{topic.title}</h4>
                </div>
                <div className="flex items-center space-x-2 mt-1">
                  <span className="text-xs text-text-secondary">{topic.posts} posts</span>
                  <span className="text-xs text-text-secondary">•</span>
                  <span className="text-xs text-text-secondary">{topic.category}</span>
                </div>
              </div>
              <Icon 
                name={getTrendIcon(topic.trend)} 
                size={16} 
                className={getTrendColor(topic.trend)}
              />
            </div>
          ))}
        </div>
        <div className="p-4 border-t border-border">
          <Button variant="ghost" className="w-full text-sm" iconName="ArrowRight" iconPosition="right" iconSize={14}>
            View all trends
          </Button>
        </div>
      </div>
      {/* Footer */}
      <div className="bg-card border border-border rounded-lg shadow-card p-4">
        <div className="text-center">
          <p className="text-xs text-text-secondary mb-2">
            © {new Date().getFullYear()} LinkedBoard Pro
          </p>
          <div className="flex justify-center space-x-3 text-xs text-text-secondary">
            <button className="hover:text-foreground transition-micro">Privacy</button>
            <button className="hover:text-foreground transition-micro">Terms</button>
            <button className="hover:text-foreground transition-micro">Help</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TrendingSidebar;