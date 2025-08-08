import React, { useState } from 'react';
import { useRouter } from 'next/router';
import Icon from '../AppIcon';
import Button from './Button';

const Sidebar = () => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const router = useRouter();

  const profileStats = [
    { label: 'Connections', value: '1,247', icon: 'Users' },
    { label: 'Ideas Created', value: '89', icon: 'Lightbulb' },
    { label: 'Posts', value: '156', icon: 'FileText' },
  ];

  const quickActions = [
    { label: 'Create Post', icon: 'Plus', action: () => console.log('Create post') },
    { label: 'New Idea', icon: 'Lightbulb', action: () => window.location.href = '/ideas-whiteboard' },
    { label: 'Find Connections', icon: 'UserPlus', action: () => window.location.href = '/connection-network-tree' },
  ];

  const toggleCollapse = () => {
    setIsCollapsed(!isCollapsed);
  };

  return (
    <aside className={`fixed left-0 top-16 h-[calc(100vh-4rem)] bg-background border-r border-border z-1000 transition-all duration-300 ${
      isCollapsed ? 'w-16' : 'w-80'
    } lg:block hidden`}>
      <div className="flex flex-col h-full">
        {/* Collapse Toggle */}
        <div className="p-4 border-b border-border">
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleCollapse}
            className="w-8 h-8"
          >
            <Icon name={isCollapsed ? "ChevronRight" : "ChevronLeft"} size={16} />
          </Button>
        </div>

        {!isCollapsed && (
          <>
            {/* Profile Section */}
            <div className="p-6 border-b border-border">
              <div className="flex items-center space-x-4 mb-4">
                <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center">
                  <Icon name="User" size={32} color="white" />
                </div>
                <div className="flex-1">
                  <h2 className="text-lg font-semibold text-foreground">John Doe</h2>
                  <p className="text-sm text-text-secondary">Product Manager at TechCorp</p>
                  <p className="text-xs text-text-secondary mt-1">San Francisco, CA</p>
                </div>
              </div>
              
              <div className="space-y-2">
                <div className="text-sm text-text-secondary">
                  <span className="font-medium text-foreground">Professional Headline:</span>
                </div>
                <p className="text-sm text-text-secondary leading-relaxed">
                  Driving innovation in product development with 8+ years of experience in tech startups and enterprise solutions.
                </p>
              </div>
            </div>

            {/* Stats Section */}
            <div className="p-6 border-b border-border">
              <h3 className="text-sm font-semibold text-foreground mb-4">Your Activity</h3>
              <div className="space-y-3">
                {profileStats.map((stat, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-muted rounded-lg flex items-center justify-center">
                        <Icon name={stat.icon} size={16} className="text-text-secondary" />
                      </div>
                      <span className="text-sm text-text-secondary">{stat.label}</span>
                    </div>
                    <span className="text-sm font-semibold text-foreground">{stat.value}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Quick Actions */}
            <div className="p-6 border-b border-border">
              <h3 className="text-sm font-semibold text-foreground mb-4">Quick Actions</h3>
              <div className="space-y-2">
                {quickActions.map((action, index) => (
                  <Button
                    key={index}
                    variant="ghost"
                    onClick={action.action}
                    className="w-full justify-start h-10 px-3"
                  >
                    <Icon name={action.icon} size={16} className="mr-3" />
                    <span className="text-sm">{action.label}</span>
                  </Button>
                ))}
              </div>
            </div>

            {/* Recent Activity */}
            <div className="p-6 flex-1">
              <h3 className="text-sm font-semibold text-foreground mb-4">Recent Activity</h3>
              <div className="space-y-4">
                <div className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-success rounded-full mt-2 flex-shrink-0"></div>
                  <div>
                    <p className="text-sm text-foreground">Posted new idea about AI integration</p>
                    <p className="text-xs text-text-secondary">2 hours ago</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0"></div>
                  <div>
                    <p className="text-sm text-foreground">Connected with Sarah Johnson</p>
                    <p className="text-xs text-text-secondary">1 day ago</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-warning rounded-full mt-2 flex-shrink-0"></div>
                  <div>
                    <p className="text-sm text-foreground">Updated product showcase</p>
                    <p className="text-xs text-text-secondary">3 days ago</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="p-6 border-t border-border">
              <div className="flex items-center justify-between">
                <span className="text-xs text-text-secondary">Profile Views</span>
                <span className="text-xs font-semibold text-foreground">127 this week</span>
              </div>
              <div className="mt-2 w-full bg-muted rounded-full h-1">
                <div className="bg-primary h-1 rounded-full" style={{ width: '68%' }}></div>
              </div>
              <p className="text-xs text-text-secondary mt-1">+12% from last week</p>
            </div>
          </>
        )}

        {isCollapsed && (
          <div className="p-2 space-y-2">
            <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center mx-auto">
              <Icon name="User" size={24} color="white" />
            </div>
            {quickActions.map((action, index) => (
              <Button
                key={index}
                variant="ghost"
                size="icon"
                onClick={action.action}
                className="w-12 h-12 mx-auto"
                title={action.label}
              >
                <Icon name={action.icon} size={20} />
              </Button>
            ))}
          </div>
        )}
      </div>
    </aside>
  );
};

export default Sidebar;