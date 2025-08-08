import React from 'react';
import Icon from '../AppIcon';

const ProfileSidebar = ({ className = '' }) => {
  const profileData = {
    name: 'John Doe',
    title: 'Senior Product Manager',
    company: 'TechCorp Inc.',
    location: 'San Francisco, CA',
    headline: 'Driving innovation in product development with 8+ years of experience in tech startups and enterprise solutions.',
    avatar: null,
  };

  const activityFeed = [
    {
      type: 'idea',
      title: 'Posted new idea about AI integration',
      time: '2 hours ago',
      color: 'success'
    },
    {
      type: 'connection',
      title: 'Connected with Sarah Johnson',
      time: '1 day ago',
      color: 'primary'
    },
    {
      type: 'update',
      title: 'Updated product showcase',
      time: '3 days ago',
      color: 'warning'
    },
    {
      type: 'post',
      title: 'Shared insights on remote work',
      time: '1 week ago',
      color: 'secondary'
    }
  ];

  const getColorClass = (color) => {
    const colorMap = {
      success: 'bg-success',
      primary: 'bg-primary',
      warning: 'bg-warning',
      secondary: 'bg-secondary'
    };
    return colorMap[color] || 'bg-muted';
  };

  return (
    <div className={`bg-card border border-border rounded-lg shadow-card ${className}`}>
      {/* Profile Header */}
      <div className="p-6 border-b border-border">
        <div className="flex items-start space-x-4 mb-4">
            <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center flex-shrink-0">
              <Icon name="User" size={32} color="white" />
            </div>
            <div className="flex-1 min-w-0">
              <h2 className="text-lg font-semibold text-foreground truncate">
                {profileData.name}
              </h2>
              <p className="text-sm text-text-secondary truncate">
                {profileData.title}
              </p>
              <p className="text-xs text-text-secondary truncate">
                {profileData.company}
              </p>
            <div className="flex items-center text-xs text-text-secondary mt-2">
              <Icon name="MapPin" size={12} className="mr-1" />
              <span>{profileData.location}</span>
            </div>
          </div>
        </div>
            <div className="mb-4">
              <p className="text-sm text-text-secondary leading-relaxed">
                {profileData.headline}
              </p>
            </div>
      </div>
          {/* Recent Activity */}
      <div className="p-6">
            <h3 className="text-sm font-semibold text-foreground mb-4">Recent Activity</h3>
            <div className="space-y-4">
              {activityFeed.map((activity, index) => (
                <div key={index} className="flex items-start space-x-3">
                  <div className={`w-2 h-2 rounded-full mt-2 flex-shrink-0 ${getColorClass(activity.color)}`}></div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-foreground">{activity.title}</p>
                    <p className="text-xs text-text-secondary">{activity.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
    </div>
  );
};

export default ProfileSidebar;