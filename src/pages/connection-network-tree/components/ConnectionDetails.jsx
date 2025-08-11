import React, { useState } from 'react';
import Icon from '@/src/components/AppIcon';
import Button from '@/src/components/ui/Button';
import Image from '@/src/components/AppImage';

const ConnectionDetails = ({ 
  selectedConnection, 
  onClose, 
  onConnect, 
  onMessage, 
  className = '' 
}) => {
  const [activeTab, setActiveTab] = useState('profile');

  if (!selectedConnection) {
    return (
      <div className={`bg-card border border-border rounded-lg shadow-card p-6 ${className}`}>
        <div className="text-center text-text-secondary">
          <Icon name="Users" size={48} className="mx-auto mb-4 opacity-50" />
          <h3 className="text-lg font-medium mb-2">Select a Connection</h3>
          <p className="text-sm">
            Click on any node in the network to view connection details and interaction history.
          </p>
        </div>
      </div>
    );
  }

  const tabs = [
    { id: 'profile', label: 'Profile', icon: 'User' },
    { id: 'mutual', label: 'Mutual', icon: 'Users' },
    
  ];

  const mutualConnections = selectedConnection.mutualConnections || [
    {
      id: 1,
      name: "Sarah Johnson",
      title: "Product Designer",
      company: "Google",
      avatar: "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face"
    },
    {
      id: 2,
      name: "Mike Chen",
      title: "Engineering Manager",
      company: "Meta",
      avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face"
    },
    {
      id: 3,
      name: "Emily Davis",
      title: "UX Researcher",
      company: "Apple",
      avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face"
    }
  ];

  const activityHistory = selectedConnection.activityHistory || [
    {
      type: 'connection',
      title: 'Connected with you',
      date: '2024-07-10',
      description: 'Accepted your connection request'
    },
    {
      type: 'post',
      title: 'Liked your post',
      date: '2024-07-08',
      description: 'AI in Product Development: The Future is Now'
    },
    {
      type: 'comment',
      title: 'Commented on your article',
      date: '2024-07-05',
      description: 'Great insights on remote work productivity!'
    },
    {
      type: 'share',
      title: 'Shared your content',
      date: '2024-07-02',
      description: 'Shared your whiteboard idea about sustainable tech'
    }
  ];

  const getActivityIcon = (type) => {
    const iconMap = {
      connection: 'UserPlus',
      post: 'Heart',
      comment: 'MessageCircle',
      share: 'Share2'
    };
    return iconMap[type] || 'Activity';
  };

  const getActivityColor = (type) => {
    const colorMap = {
      connection: 'text-primary',
      post: 'text-destructive',
      comment: 'text-success',
      share: 'text-warning'
    };
    return colorMap[type] || 'text-text-secondary';
  };

  return (
    <div className={`bg-card border border-border rounded-lg shadow-card ${className}`}>
      {/* Header */}
      <div className="p-6 border-b border-border">
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-4">
            <div className="w-16 h-16 rounded-full overflow-hidden bg-muted flex-shrink-0">
              {selectedConnection.avatar ? (
                <Image
                  src={selectedConnection.avatar}
                  alt={selectedConnection.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full bg-primary flex items-center justify-center">
                  <Icon name="User" size={24} color="white" />
                </div>
              )}
            </div>
            <div className="flex-1">
              <h2 className="text-xl font-semibold text-foreground">
                {selectedConnection.name}
              </h2>          
              <div className="flex items-center space-x-4 mt-2">
                <span className="text-sm text-text-secondary">
                  {selectedConnection.connections || 500}+ connections
                </span>
                
              </div>
            </div>
          </div>
          
        </div>

        {/* Action Buttons */}
        <div className="flex items-center space-x-3 mt-4">
          <Button
            variant="default"
            onClick={() => onMessage(selectedConnection)}
            iconName="MessageCircle"
            iconPosition="left"
            iconSize={16}
          >
            Message
          </Button>
          <Button
            variant="outline"
            onClick={() => onConnect(selectedConnection)}
            iconName="UserPlus"
            iconPosition="left"
            iconSize={16}
          >
            Connect
          </Button>
          
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-border">
        <nav className="flex space-x-8 px-6">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center space-x-2 py-4 border-b-2 transition-colors ${
                activeTab === tab.id
                  ? 'border-primary text-primary' :'border-transparent text-text-secondary hover:text-foreground'
              }`}
            >
              <Icon name={tab.icon} size={16} />
              <span className="font-medium">{tab.label}</span>
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      <div className="p-6">
        {activeTab === 'profile' && (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-foreground mb-3">About</h3>
              <p className="text-text-secondary leading-relaxed">
                {selectedConnection.bio || `Experienced ${selectedConnection.title} with a passion for innovation and technology. 
                Currently working at ${selectedConnection.company} on cutting-edge projects that shape the future of digital experiences.`}
              </p>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-foreground mb-3">Experience</h3>
              <div className="space-y-4">
                <div className="flex items-start space-x-3">
                  <div className="w-12 h-12 bg-muted rounded-lg flex items-center justify-center flex-shrink-0">
                    <Icon name="Building" size={20} className="text-text-secondary" />
                  </div>
                  <div>
                    <h4 className="font-medium text-foreground">{selectedConnection.title}</h4>
                    <p className="text-text-secondary">{selectedConnection.company}</p>
                    <p className="text-sm text-text-secondary">2022 - Present</p>
                  </div>
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-foreground mb-3">Skills</h3>
              <div className="flex flex-wrap gap-2">
                {(selectedConnection.skills || ['Product Management', 'Strategy', 'Leadership', 'Analytics']).map((skill, index) => (
                  <span
                    key={index}
                    className="px-3 py-1 bg-muted text-text-secondary text-sm rounded-full"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'mutual' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-foreground">
                Mutual Connections ({mutualConnections.length})
              </h3>
              <Button variant="outline" size="sm">
                View All
              </Button>
            </div>
            
            <div className="space-y-3">
              {mutualConnections.map((mutual) => (
                <div key={mutual.id} className="flex items-center space-x-3 p-3 hover:bg-muted rounded-lg transition-colors">
                  <div className="w-12 h-12 rounded-full overflow-hidden bg-muted flex-shrink-0">
                    <Image
                      src={mutual.avatar}
                      alt={mutual.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-medium text-foreground">{mutual.name}</h4>
                    <p className="text-sm text-text-secondary">
                      {mutual.title} at {mutual.company}
                    </p>
                  </div>
                  <Button variant="outline" size="sm">
                    Connect
                  </Button>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'activity' && (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-foreground">Recent Activity</h3>
            
            <div className="space-y-4">
              {activityHistory.map((activity, index) => (
                <div key={index} className="flex items-start space-x-3 p-3 hover:bg-muted rounded-lg transition-colors">
                  <div className={`w-8 h-8 rounded-full bg-muted flex items-center justify-center flex-shrink-0 ${getActivityColor(activity.type)}`}>
                    <Icon name={getActivityIcon(activity.type)} size={16} />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-medium text-foreground">{activity.title}</h4>
                    <p className="text-sm text-text-secondary">{activity.description}</p>
                    <p className="text-xs text-text-secondary mt-1">
                      {new Date(activity.date).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ConnectionDetails;