import React, { useState } from 'react';
import Icon from '@/src/components/AppIcon';
import Image from '@/src/components/AppImage';
import Button from '@/src/components/ui/Button';

const ProductCard = ({ product, onViewDetails, onAddToWishlist, onRateProduct }) => {
  const [isWishlisted, setIsWishlisted] = useState(product.isWishlisted || false);
  const [showQuickActions, setShowQuickActions] = useState(false);

  const handleWishlistToggle = (e) => {
    e.stopPropagation();
    setIsWishlisted(!isWishlisted);
    onAddToWishlist(product.id, !isWishlisted);
  };

  const handleRating = (rating) => {
    onRateProduct(product.id, rating);
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(price);
  };

  const renderStars = (rating) => {
    return Array.from({ length: 5 }, (_, index) => (
      <Icon
        key={index}
        name="Star"
        size={14}
        className={`${
          index < Math.floor(rating)
            ? 'text-warning fill-current' :'text-muted'
        }`}
      />
    ));
  };

  return (
    <div 
      className="bg-card border border-border rounded-lg shadow-card hover:shadow-modal transition-all duration-300 cursor-pointer group"
      onMouseEnter={() => setShowQuickActions(true)}
      onMouseLeave={() => setShowQuickActions(false)}
      onClick={() => onViewDetails(product)}
    >
      {/* Product Image */}
      <div className="relative overflow-hidden rounded-t-lg">
        <Image
          src={product.image}
          alt={product.title}
          className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
        />
        
        {/* Product Badge */}
        {product.badge && (
          <div className={`absolute top-3 left-3 px-2 py-1 rounded-md text-xs font-medium ${
            product.badge.type === 'new' ? 'bg-success text-success-foreground' :
            product.badge.type === 'popular' ? 'bg-warning text-warning-foreground' :
            product.badge.type === 'featured' ? 'bg-primary text-primary-foreground' :
            'bg-secondary text-secondary-foreground'
          }`}>
            {product.badge.label}
          </div>
        )}

        {/* Wishlist Button */}
        <button
          onClick={handleWishlistToggle}
          className={`absolute top-3 right-3 w-8 h-8 rounded-full flex items-center justify-center transition-all duration-200 ${
            isWishlisted
              ? 'bg-error text-error-foreground'
              : 'bg-background/80 text-text-secondary hover:bg-background hover:text-error'
          }`}
        >
          <Icon
            name="Heart"
            size={16}
            className={isWishlisted ? 'fill-current' : ''}
          />
        </button>

        {/* Quick Actions Overlay */}
        {showQuickActions && (
          <div className="absolute inset-0 bg-background/80 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <div className="flex space-x-2">
              <Button
                variant="default"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  onViewDetails(product);
                }}
                iconName="Eye"
                iconPosition="left"
                iconSize={14}
              >
                View Details
              </Button>
              {product.demoUrl && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    window.open(product.demoUrl, '_blank');
                  }}
                  iconName="ExternalLink"
                  iconPosition="left"
                  iconSize={14}
                >
                  Demo
                </Button>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Product Content */}
      <div className="p-4">
        {/* Category */}
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs text-text-secondary bg-muted px-2 py-1 rounded-md">
            {product.category}
          </span>
          <div className="flex items-center space-x-1">
            {renderStars(product.rating)}
            <span className="text-xs text-text-secondary ml-1">
              ({product.reviewCount})
            </span>
          </div>
        </div>

        {/* Title */}
        <h3 className="text-lg font-semibold text-foreground mb-2 line-clamp-2">
          {product.title}
        </h3>

        {/* Description */}
        <p className="text-sm text-text-secondary mb-3 line-clamp-2">
          {product.description}
        </p>

        {/* Features */}
        <div className="flex flex-wrap gap-1 mb-3">
          {product.features.slice(0, 3).map((feature, index) => (
            <span
              key={index}
              className="text-xs bg-surface text-text-secondary px-2 py-1 rounded-md"
            >
              {feature}
            </span>
          ))}
          {product.features.length > 3 && (
            <span className="text-xs text-text-secondary">
              +{product.features.length - 3} more
            </span>
          )}
        </div>

        {/* Pricing */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2">
            {product.originalPrice && product.originalPrice > product.price && (
              <span className="text-sm text-text-secondary line-through">
                {formatPrice(product.originalPrice)}
              </span>
            )}
            <span className="text-lg font-bold text-foreground">
              {product.price === 0 ? 'Free' : formatPrice(product.price)}
            </span>
          </div>
          {product.originalPrice && product.originalPrice > product.price && (
            <span className="text-xs bg-success text-success-foreground px-2 py-1 rounded-md">
              {Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)}% OFF
            </span>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex space-x-2">
          <Button
            variant="default"
            size="sm"
            fullWidth
            onClick={(e) => {
              e.stopPropagation();
              window.open(product.productUrl, '_blank');
            }}
            iconName="ExternalLink"
            iconPosition="right"
            iconSize={14}
          >
            View Product
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              onViewDetails(product);
            }}
            iconName="Info"
            iconSize={16}
          />
        </div>
      </div>
    </div>
  );
};

export default ProductCard;