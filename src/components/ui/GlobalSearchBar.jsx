import React, { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/router';
import Icon from '../AppIcon';
import Input from './Input';

const GlobalSearchBar = ({ className = '' }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [suggestions, setSuggestions] = useState([]);
  const [recentSearches, setRecentSearches] = useState([]);
  const searchRef = useRef(null);
  const router = useRouter();
  const navigate = router.push;

  // Handle escape key
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape') {
        handleBack();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, []);

  const handleBack = () => {
    setShowSuggestions(false);
    setSearchQuery('');
    navigate(-1); // Go back to previous page
  };

  // Mock suggestions data
  const mockSuggestions = [
    { type: 'user', title: 'Sarah Johnson', subtitle: 'Product Designer at Google', icon: 'User' },
    { type: 'post', title: 'AI in Product Development', subtitle: 'Posted by Mike Chen • 2 days ago', icon: 'FileText' },
    { type: 'idea', title: 'Sustainable Tech Solutions', subtitle: 'Whiteboard by Alex Kim', icon: 'Lightbulb' },
    { type: 'product', title: 'CloudSync Pro', subtitle: 'Enterprise collaboration tool', icon: 'Package' },
    { type: 'user', title: 'David Rodriguez', subtitle: 'Engineering Manager at Meta', icon: 'User' },
  ];

  useEffect(() => {
    // Load recent searches from localStorage
    const saved = localStorage.getItem('recentSearches');
    if (saved) {
      setRecentSearches(JSON.parse(saved));
    }
  }, []);

  useEffect(() => {
    // Filter suggestions based on search query
    if (searchQuery.trim()) {
      const filtered = mockSuggestions.filter(item =>
        item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.subtitle.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setSuggestions(filtered.slice(0, 5));
    } else {
      setSuggestions([]);
    }
  }, [searchQuery]);

  const handleSearch = (query = searchQuery) => {
    if (query.trim()) {
      // Save to recent searches
      const newRecentSearches = [query, ...recentSearches.filter(s => s !== query)].slice(0, 5);
      setRecentSearches(newRecentSearches);
      localStorage.setItem('recentSearches', JSON.stringify(newRecentSearches));
      
      // Navigate to search results
      navigate(`/search-results?q=${encodeURIComponent(query)}`);
      setShowSuggestions(false);
      setSearchQuery('');
    }
  };

  const handleInputChange = (e) => {
    setSearchQuery(e.target.value);
    setShowSuggestions(true);
  };

  const handleInputFocus = () => {
    setShowSuggestions(true);
  };

  const handleSuggestionClick = (suggestion) => {
    if (suggestion.type === 'user') {
      navigate('/connection-network-tree');
    } else if (suggestion.type === 'post') {
      navigate('/blog-detail-view');
    } else if (suggestion.type === 'idea') {
      navigate('/ideas-whiteboard');
    } else if (suggestion.type === 'product') {
      navigate('/products-showcase');
    }
    setShowSuggestions(false);
    setSearchQuery('');
  };

  const handleRecentSearchClick = (query) => {
    setSearchQuery(query);
    handleSearch(query);
  };

  const clearRecentSearches = () => {
    setRecentSearches([]);
    localStorage.removeItem('recentSearches');
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    handleSearch();
  };

  // Close suggestions when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div ref={searchRef} className={`relative ${className}`}>
      <form onSubmit={handleSubmit}>
        <div className="relative flex items-center space-x-2">
          <button
            type="button"
            onClick={handleBack}
            className="p-2 hover:bg-muted rounded-full transition-micro"
            title="Go back"
          >
            <Icon name="ArrowLeft" size={20} className="text-text-secondary" />
          </button>
          <div className="relative flex-1">
            <Icon 
              name="Search" 
              size={20} 
              className="absolute left-3 top-1/2 transform -translate-y-1/2 text-text-secondary z-10" 
            />
            <Input
              type="search"
              placeholder="Search posts, people, ideas, products..."
              value={searchQuery}
              onChange={handleInputChange}
              onFocus={handleInputFocus}
              className="pl-10 pr-4 py-2 w-full border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
            />
          </div>
        </div>
      </form>

      {/* Search Suggestions Dropdown */}
      {showSuggestions && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-popover border border-border rounded-lg shadow-modal z-1010 max-h-96 overflow-y-auto">
          {/* Recent Searches */}
          {recentSearches.length > 0 && !searchQuery && (
            <div className="p-3 border-b border-border">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-semibold text-text-secondary uppercase tracking-wide">
                  Recent Searches
                </span>
                <button
                  onClick={clearRecentSearches}
                  className="text-xs text-text-secondary hover:text-foreground transition-micro"
                >
                  Clear
                </button>
              </div>
              <div className="space-y-1">
                {recentSearches.map((query, index) => (
                  <button
                    key={index}
                    onClick={() => handleRecentSearchClick(query)}
                    className="flex items-center space-x-3 w-full px-2 py-2 text-left hover:bg-muted rounded-md transition-micro"
                  >
                    <Icon name="Clock" size={16} className="text-text-secondary" />
                    <span className="text-sm text-foreground">{query}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Search Suggestions */}
          {suggestions.length > 0 && (
            <div className="p-3">
              <span className="text-xs font-semibold text-text-secondary uppercase tracking-wide mb-2 block">
                Suggestions
              </span>
              <div className="space-y-1">
                {suggestions.map((suggestion, index) => (
                  <button
                    key={index}
                    onClick={() => handleSuggestionClick(suggestion)}
                    className="flex items-center space-x-3 w-full px-2 py-3 text-left hover:bg-muted rounded-md transition-micro"
                  >
                    <div className="w-8 h-8 bg-muted rounded-lg flex items-center justify-center flex-shrink-0">
                      <Icon name={suggestion.icon} size={16} className="text-text-secondary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground truncate">
                        {suggestion.title}
                      </p>
                      <p className="text-xs text-text-secondary truncate">
                        {suggestion.subtitle}
                      </p>
                    </div>
                    <Icon name="ArrowUpRight" size={14} className="text-text-secondary" />
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* No Results */}
          {searchQuery && suggestions.length === 0 && (
            <div className="p-6 text-center">
              <Icon name="Search" size={24} className="text-text-secondary mx-auto mb-2" />
              <p className="text-sm text-text-secondary">No results found for "{searchQuery}"</p>
              <button
                onClick={() => handleSearch()}
                className="text-sm text-primary hover:text-primary/80 mt-2 transition-micro"
              >
                Search anyway
              </button>
            </div>
          )}

          {/* Quick Actions */}
          {!searchQuery && recentSearches.length === 0 && (
            <div className="p-3">
              <span className="text-xs font-semibold text-text-secondary uppercase tracking-wide mb-2 block">
                Quick Actions
              </span>
              <div className="space-y-1">
                <button
                  onClick={() => navigate('/ideas-whiteboard')}
                  className="flex items-center space-x-3 w-full px-2 py-2 text-left hover:bg-muted rounded-md transition-micro"
                >
                  <Icon name="Plus" size={16} className="text-text-secondary" />
                  <span className="text-sm text-foreground">Create new idea</span>
                </button>
                <button
                  onClick={() => navigate('/connection-network-tree')}
                  className="flex items-center space-x-3 w-full px-2 py-2 text-left hover:bg-muted rounded-md transition-micro"
                >
                  <Icon name="UserPlus" size={16} className="text-text-secondary" />
                  <span className="text-sm text-foreground">Find connections</span>
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default GlobalSearchBar;