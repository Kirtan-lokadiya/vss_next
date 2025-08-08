import React from 'react';
import Icon from '@/src/components/AppIcon';

const NetworkStats = ({ stats, className = '' }) => {
  const statItems = [
    {
      label: 'Total Connections',
      value: stats.totalConnections || 0,
      icon: 'Users',
      color: 'primary',
      change: stats.connectionGrowth || 0,
      changeType: 'percentage'
    },
    {
      label: 'Mutual Connections',
      value: stats.mutualConnections || 0,
      icon: 'UserCheck',
      color: 'success',
      change: stats.mutualGrowth || 0,
      changeType: 'absolute'
    },
    {
      label: 'Network Reach',
      value: stats.networkReach || 0,
      icon: 'Globe',
      color: 'warning',
      change: stats.reachGrowth || 0,
      changeType: 'percentage'
    },
    {
      label: 'Active This Week',
      value: stats.activeThisWeek || 0,
      icon: 'Activity',
      color: 'accent',
      change: stats.activityChange || 0,
      changeType: 'absolute'
    }
  ];

  const getColorClasses = (color) => {
    const colorMap = {
      primary: 'bg-primary/10 text-primary',
      success: 'bg-success/10 text-success',
      warning: 'bg-warning/10 text-warning',
      accent: 'bg-accent/10 text-accent'
    };
    return colorMap[color] || 'bg-muted text-text-secondary';
  };

  const formatValue = (value) => {
    if (value >= 1000000) {
      return `${(value / 1000000).toFixed(1)}M`;
    } else if (value >= 1000) {
      return `${(value / 1000).toFixed(1)}K`;
    }
    return value.toString();
  };

  const formatChange = (change, type) => {
    if (type === 'percentage') {
      return `${change > 0 ? '+' : ''}${change}%`;
    }
    return `${change > 0 ? '+' : ''}${change}`;
  };

  const getChangeColor = (change) => {
    if (change > 0) return 'text-success';
    if (change < 0) return 'text-destructive';
    return 'text-text-secondary';
  };

  return (
    <div className={`bg-card border border-border rounded-lg shadow-card p-6 ${className}`}>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold text-foreground">Network Overview</h2>
        <div className="flex items-center space-x-2 text-sm text-text-secondary">
          <Icon name="Calendar" size={16} />
          <span>Last updated: {new Date().toLocaleDateString()}</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statItems.map((item, index) => (
          <div key={index} className="space-y-3">
            <div className="flex items-center justify-between">
              <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${getColorClasses(item.color)}`}>
                <Icon name={item.icon} size={24} />
              </div>
              {item.change !== 0 && (
                <div className={`flex items-center space-x-1 text-sm ${getChangeColor(item.change)}`}>
                  <Icon 
                    name={item.change > 0 ? "TrendingUp" : "TrendingDown"} 
                    size={14} 
                  />
                  <span>{formatChange(item.change, item.changeType)}</span>
                </div>
              )}
            </div>
            
            <div>
              <div className="text-2xl font-bold text-foreground">
                {formatValue(item.value)}
              </div>
              <div className="text-sm text-text-secondary">
                {item.label}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Additional Insights */}
      <div className="mt-6 pt-6 border-t border-border">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="text-center">
            <div className="text-lg font-semibold text-foreground">
              {stats.averageConnections || 0}
            </div>
            <div className="text-sm text-text-secondary">
              Avg. connections per contact
            </div>
          </div>
          
          <div className="text-center">
            <div className="text-lg font-semibold text-foreground">
              {stats.topIndustry || 'Technology'}
            </div>
            <div className="text-sm text-text-secondary">
              Top industry in network
            </div>
          </div>
          
          <div className="text-center">
            <div className="text-lg font-semibold text-foreground">
              {stats.networkScore || 85}%
            </div>
            <div className="text-sm text-text-secondary">
              Network diversity score
            </div>
          </div>
        </div>
      </div>

      {/* Network Health Indicator */}
      <div className="mt-6 pt-6 border-t border-border">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-foreground">Network Health</span>
          <span className="text-sm text-success font-medium">Excellent</span>
        </div>
        <div className="w-full bg-muted rounded-full h-2">
          <div 
            className="bg-success h-2 rounded-full transition-all duration-300" 
            style={{ width: `${stats.networkHealth || 85}%` }}
          ></div>
        </div>
        <div className="flex justify-between text-xs text-text-secondary mt-1">
          <span>Poor</span>
          <span>Excellent</span>
        </div>
      </div>
    </div>
  );
};

export default NetworkStats;