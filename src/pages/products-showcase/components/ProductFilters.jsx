import React, { useState } from 'react';
import Icon from '@/src/components/AppIcon';
import Button from '@/src/components/ui/Button';
import Input from '@/src/components/ui/Input';

const ProductFilters = ({ 
  filters, 
  onFiltersChange, 
  onSortChange, 
  onSearchChange, 
  searchQuery,
  totalProducts,
  filteredCount 
}) => {
  const [showFilters, setShowFilters] = useState(false);
  const [priceRange, setPriceRange] = useState(filters.priceRange || [0, 1000]);

  const categories = [
    'All Categories',
    'Productivity',
    'Design Tools',
    'Development',
    'Analytics',
    'Communication',
    'Marketing',
    'Security',
    'Education'
  ];

  const sortOptions = [
    { value: 'newest', label: 'Newest First', icon: 'Calendar' },
    { value: 'popular', label: 'Most Popular', icon: 'TrendingUp' },
    { value: 'rating', label: 'Highest Rated', icon: 'Star' },
    { value: 'price-low', label: 'Price: Low to High', icon: 'ArrowUp' },
    { value: 'price-high', label: 'Price: High to Low', icon: 'ArrowDown' },
    { value: 'name', label: 'Name A-Z', icon: 'AlphabeticalOrder' }
  ];

  const handleCategoryChange = (category) => {
    const selectedCategory = category === 'All Categories' ? '' : category;
    onFiltersChange({
      ...filters,
      category: selectedCategory
    });
  };

  const handlePriceRangeChange = (newRange) => {
    setPriceRange(newRange);
    onFiltersChange({
      ...filters,
      priceRange: newRange
    });
  };

  const handleRatingFilter = (minRating) => {
    onFiltersChange({
      ...filters,
      minRating: filters.minRating === minRating ? 0 : minRating
    });
  };

  const clearFilters = () => {
    const clearedFilters = {
      category: '',
      priceRange: [0, 1000],
      minRating: 0,
      features: []
    };
    setPriceRange([0, 1000]);
    onFiltersChange(clearedFilters);
  };

  const hasActiveFilters = filters.category || 
                          filters.minRating > 0 || 
                          (filters.priceRange && (filters.priceRange[0] > 0 || filters.priceRange[1] < 1000)) ||
                          (filters.features && filters.features.length > 0);

  return (
    <div className="bg-card border border-border rounded-lg shadow-card">
      {/* Search and Sort Bar */}
      <div className="p-4 border-b border-border">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
          {/* Search */}
          <div className="flex-1 max-w-md">
            <div className="relative">
              <Icon 
                name="Search" 
                size={20} 
                className="absolute left-3 top-1/2 transform -translate-y-1/2 text-text-secondary" 
              />
              <Input
                type="search"
                placeholder="Search products..."
                value={searchQuery}
                onChange={(e) => onSearchChange(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          {/* Results Count and Actions */}
          <div className="flex items-center space-x-4">
            <span className="text-sm text-text-secondary">
              {filteredCount} of {totalProducts} products
            </span>
            
            {/* Sort Dropdown */}
            <div className="relative">
              <select
                onChange={(e) => onSortChange(e.target.value)}
                className="appearance-none bg-background border border-border rounded-lg px-4 py-2 pr-8 text-sm focus:ring-2 focus:ring-primary focus:border-transparent"
              >
                {sortOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
              <Icon 
                name="ChevronDown" 
                size={16} 
                className="absolute right-2 top-1/2 transform -translate-y-1/2 text-text-secondary pointer-events-none" 
              />
            </div>

            {/* Filter Toggle */}
            <Button
              variant="outline"
              onClick={() => setShowFilters(!showFilters)}
              iconName="Filter"
              iconPosition="left"
              iconSize={16}
            >
              Filters
              {hasActiveFilters && (
                <span className="ml-2 w-2 h-2 bg-primary rounded-full"></span>
              )}
            </Button>
          </div>
        </div>
      </div>

      {/* Filters Panel */}
      {showFilters && (
        <div className="p-4 border-b border-border bg-surface">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Category Filter */}
            <div>
              <h4 className="text-sm font-semibold text-foreground mb-3">Category</h4>
              <div className="space-y-2">
                {categories.map((category) => (
                  <button
                    key={category}
                    onClick={() => handleCategoryChange(category)}
                    className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                      (category === 'All Categories' && !filters.category) || 
                      filters.category === category
                        ? 'bg-primary text-primary-foreground'
                        : 'text-text-secondary hover:text-foreground hover:bg-muted'
                    }`}
                  >
                    {category}
                  </button>
                ))}
              </div>
            </div>

            {/* Price Range Filter */}
            <div>
              <h4 className="text-sm font-semibold text-foreground mb-3">Price Range</h4>
              <div className="space-y-3">
                <div className="flex items-center space-x-2">
                  <Input
                    type="number"
                    placeholder="Min"
                    value={priceRange[0]}
                    onChange={(e) => handlePriceRangeChange([parseInt(e.target.value) || 0, priceRange[1]])}
                    className="text-sm"
                  />
                  <span className="text-text-secondary">-</span>
                  <Input
                    type="number"
                    placeholder="Max"
                    value={priceRange[1]}
                    onChange={(e) => handlePriceRangeChange([priceRange[0], parseInt(e.target.value) || 1000])}
                    className="text-sm"
                  />
                </div>
                <div className="flex flex-wrap gap-2">
                  {[
                    { label: 'Free', range: [0, 0] },
                    { label: 'Under $50', range: [0, 50] },
                    { label: '$50-$200', range: [50, 200] },
                    { label: '$200+', range: [200, 1000] }
                  ].map((preset) => (
                    <button
                      key={preset.label}
                      onClick={() => handlePriceRangeChange(preset.range)}
                      className="px-3 py-1 text-xs bg-muted text-text-secondary rounded-md hover:bg-primary hover:text-primary-foreground transition-colors"
                    >
                      {preset.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Rating Filter */}
            <div>
              <h4 className="text-sm font-semibold text-foreground mb-3">Minimum Rating</h4>
              <div className="space-y-2">
                {[5, 4, 3, 2, 1].map((rating) => (
                  <button
                    key={rating}
                    onClick={() => handleRatingFilter(rating)}
                    className={`flex items-center space-x-2 w-full px-3 py-2 rounded-lg transition-colors ${
                      filters.minRating === rating
                        ? 'bg-primary text-primary-foreground'
                        : 'text-text-secondary hover:text-foreground hover:bg-muted'
                    }`}
                  >
                    <div className="flex">
                      {Array.from({ length: 5 }, (_, index) => (
                        <Icon
                          key={index}
                          name="Star"
                          size={14}
                          className={`${
                            index < rating
                              ? 'text-warning fill-current' :'text-muted'
                          }`}
                        />
                      ))}
                    </div>
                    <span className="text-sm">& up</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Quick Filters */}
            <div>
              <h4 className="text-sm font-semibold text-foreground mb-3">Quick Filters</h4>
              <div className="space-y-2">
                {[
                  { label: 'New Products', key: 'new' },
                  { label: 'Popular', key: 'popular' },
                  { label: 'Featured', key: 'featured' },
                  { label: 'On Sale', key: 'sale' },
                  { label: 'Free Trial', key: 'trial' }
                ].map((filter) => (
                  <button
                    key={filter.key}
                    onClick={() => {
                      const features = filters.features || [];
                      const newFeatures = features.includes(filter.key)
                        ? features.filter(f => f !== filter.key)
                        : [...features, filter.key];
                      onFiltersChange({
                        ...filters,
                        features: newFeatures
                      });
                    }}
                    className={`flex items-center space-x-2 w-full px-3 py-2 rounded-lg text-sm transition-colors ${
                      filters.features?.includes(filter.key)
                        ? 'bg-primary text-primary-foreground'
                        : 'text-text-secondary hover:text-foreground hover:bg-muted'
                    }`}
                  >
                    <Icon
                      name={filters.features?.includes(filter.key) ? "CheckSquare" : "Square"}
                      size={16}
                    />
                    <span>{filter.label}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Filter Actions */}
          <div className="flex items-center justify-between mt-6 pt-4 border-t border-border">
            <span className="text-sm text-text-secondary">
              {hasActiveFilters ? `${filteredCount} products match your filters` : 'No filters applied'}
            </span>
            <div className="flex space-x-2">
              {hasActiveFilters && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={clearFilters}
                  iconName="X"
                  iconPosition="left"
                  iconSize={14}
                >
                  Clear Filters
                </Button>
              )}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowFilters(false)}
                iconName="ChevronUp"
                iconPosition="left"
                iconSize={14}
              >
                Hide Filters
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductFilters;