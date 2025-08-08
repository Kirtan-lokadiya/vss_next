import React, { useState } from 'react';
import Icon from '@/src/components/AppIcon';
import Button from '@/src/components/ui/Button';
import Input from '@/src/components/ui/Input';
import { Checkbox } from '@/src/components/ui/Checkbox';

const NetworkFilters = ({ 
  filters, 
  onFiltersChange, 
  onSearch, 
  className = '' 
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [isExpanded, setIsExpanded] = useState(true);

  const industries = [
    { id: 'technology', label: 'Technology', count: 156 },
    { id: 'finance', label: 'Finance', count: 89 },
    { id: 'healthcare', label: 'Healthcare', count: 67 },
    { id: 'education', label: 'Education', count: 45 },
    { id: 'marketing', label: 'Marketing', count: 78 },
    { id: 'consulting', label: 'Consulting', count: 34 }
  ];

  const locations = [
    { id: 'san-francisco', label: 'San Francisco', count: 234 },
    { id: 'new-york', label: 'New York', count: 189 },
    { id: 'london', label: 'London', count: 156 },
    { id: 'toronto', label: 'Toronto', count: 98 },
    { id: 'berlin', label: 'Berlin', count: 76 },
    { id: 'singapore', label: 'Singapore', count: 54 }
  ];

  const companies = [
    { id: 'google', label: 'Google', count: 45 },
    { id: 'microsoft', label: 'Microsoft', count: 38 },
    { id: 'apple', label: 'Apple', count: 32 },
    { id: 'meta', label: 'Meta', count: 28 },
    { id: 'amazon', label: 'Amazon', count: 25 },
    { id: 'netflix', label: 'Netflix', count: 18 }
  ];

  const connectionDates = [
    { id: 'this-week', label: 'This Week', count: 12 },
    { id: 'this-month', label: 'This Month', count: 45 },
    { id: 'last-3-months', label: 'Last 3 Months', count: 123 },
    { id: 'last-6-months', label: 'Last 6 Months', count: 234 },
    { id: 'this-year', label: 'This Year', count: 456 },
    { id: 'older', label: 'Older', count: 789 }
  ];

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    onSearch(searchQuery);
  };

  const handleFilterChange = (category, value, checked) => {
    const currentFilters = filters[category] || [];
    const newFilters = checked 
      ? [...currentFilters, value]
      : currentFilters.filter(f => f !== value);
    
    onFiltersChange({
      ...filters,
      [category]: newFilters
    });
  };

  const clearAllFilters = () => {
    onFiltersChange({
      industries: [],
      locations: [],
      companies: [],
      connectionDates: []
    });
    setSearchQuery('');
  };

  const getActiveFilterCount = () => {
    return Object.values(filters).reduce((total, filterArray) => total + filterArray.length, 0);
  };

  const toggleExpanded = () => {
    setIsExpanded(!isExpanded);
  };

  return (
    <div className={`bg-card border border-border rounded-lg shadow-card ${className}`}>
      {/* Header */}
      <div className="p-4 border-b border-border">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Icon name="Filter" size={20} className="text-text-secondary" />
            <h3 className="text-lg font-semibold text-foreground">Filters</h3>
            {getActiveFilterCount() > 0 && (
              <span className="bg-primary text-primary-foreground text-xs px-2 py-1 rounded-full">
                {getActiveFilterCount()}
              </span>
            )}
          </div>
          <div className="flex items-center space-x-2">
            {getActiveFilterCount() > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={clearAllFilters}
                className="text-xs"
              >
                Clear All
              </Button>
            )}
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleExpanded}
              className="w-8 h-8"
            >
              <Icon name={isExpanded ? "ChevronUp" : "ChevronDown"} size={16} />
            </Button>
          </div>
        </div>
      </div>

      {isExpanded && (
        <div className="p-4 space-y-6">
          {/* Search */}
          <div>
            <form onSubmit={handleSearchSubmit}>
              <Input
                type="search"
                placeholder="Search connections..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full"
              />
            </form>
          </div>

          {/* Industry Filter */}
          <div>
            <h4 className="text-sm font-semibold text-foreground mb-3">Industry</h4>
            <div className="space-y-2 max-h-48 overflow-y-auto">
              {industries.map((industry) => (
                <div key={industry.id} className="flex items-center justify-between">
                  <Checkbox
                    label={industry.label}
                    checked={filters.industries?.includes(industry.id) || false}
                    onChange={(e) => handleFilterChange('industries', industry.id, e.target.checked)}
                  />
                  <span className="text-xs text-text-secondary">{industry.count}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Location Filter */}
          <div>
            <h4 className="text-sm font-semibold text-foreground mb-3">Location</h4>
            <div className="space-y-2 max-h-48 overflow-y-auto">
              {locations.map((location) => (
                <div key={location.id} className="flex items-center justify-between">
                  <Checkbox
                    label={location.label}
                    checked={filters.locations?.includes(location.id) || false}
                    onChange={(e) => handleFilterChange('locations', location.id, e.target.checked)}
                  />
                  <span className="text-xs text-text-secondary">{location.count}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Company Filter */}
          <div>
            <h4 className="text-sm font-semibold text-foreground mb-3">Company</h4>
            <div className="space-y-2 max-h-48 overflow-y-auto">
              {companies.map((company) => (
                <div key={company.id} className="flex items-center justify-between">
                  <Checkbox
                    label={company.label}
                    checked={filters.companies?.includes(company.id) || false}
                    onChange={(e) => handleFilterChange('companies', company.id, e.target.checked)}
                  />
                  <span className="text-xs text-text-secondary">{company.count}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Connection Date Filter */}
          <div>
            <h4 className="text-sm font-semibold text-foreground mb-3">Connected</h4>
            <div className="space-y-2">
              {connectionDates.map((date) => (
                <div key={date.id} className="flex items-center justify-between">
                  <Checkbox
                    label={date.label}
                    checked={filters.connectionDates?.includes(date.id) || false}
                    onChange={(e) => handleFilterChange('connectionDates', date.id, e.target.checked)}
                  />
                  <span className="text-xs text-text-secondary">{date.count}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Quick Filters */}
          <div>
            <h4 className="text-sm font-semibold text-foreground mb-3">Quick Filters</h4>
            <div className="flex flex-wrap gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleFilterChange('special', 'mutual-connections', true)}
                className="text-xs"
              >
                Mutual Connections
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleFilterChange('special', 'recent-activity', true)}
                className="text-xs"
              >
                Recent Activity
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleFilterChange('special', 'same-company', true)}
                className="text-xs"
              >
                Same Company
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default NetworkFilters;