import React, { useState } from 'react';
import Icon from '@/src/components/AppIcon';
import Image from '@/src/components/AppImage';
import Button from '@/src/components/ui/Button';
import Input from '@/src/components/ui/Input';

const ProductDetailModal = ({ product, isOpen, onClose, onSubmitFeedback, onRateProduct }) => {
  const [activeTab, setActiveTab] = useState('overview');
  const [userRating, setUserRating] = useState(0);
  const [feedbackForm, setFeedbackForm] = useState({
    type: 'feature',
    title: '',
    description: '',
    email: ''
  });

  if (!isOpen || !product) return null;

  const tabs = [
    { id: 'overview', label: 'Overview', icon: 'Info' },
    { id: 'features', label: 'Features', icon: 'List' },
    { id: 'reviews', label: 'Reviews', icon: 'Star' },
    { id: 'feedback', label: 'Feedback', icon: 'MessageSquare' }
  ];

  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(price);
  };

  const renderStars = (rating, interactive = false, onStarClick = null) => {
    return Array.from({ length: 5 }, (_, index) => (
      <button
        key={index}
        onClick={() => interactive && onStarClick && onStarClick(index + 1)}
        className={`${interactive ? 'cursor-pointer hover:scale-110' : 'cursor-default'} transition-transform`}
        disabled={!interactive}
      >
        <Icon
          name="Star"
          size={20}
          className={`${
            index < Math.floor(rating)
              ? 'text-warning fill-current' :'text-muted'
          }`}
        />
      </button>
    ));
  };

  const handleFeedbackSubmit = (e) => {
    e.preventDefault();
    onSubmitFeedback(product.id, feedbackForm);
    setFeedbackForm({
      type: 'feature',
      title: '',
      description: '',
      email: ''
    });
  };

  const handleRatingSubmit = () => {
    if (userRating > 0) {
      onRateProduct(product.id, userRating);
      setUserRating(0);
    }
  };

  return (
    <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-1020 flex items-center justify-center p-4">
      <div className="bg-card border border-border rounded-lg shadow-modal max-w-4xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-border">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-muted rounded-lg overflow-hidden">
              <Image
                src={product.image}
                alt={product.title}
                className="w-full h-full object-cover"
              />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-foreground">{product.title}</h2>
              <p className="text-sm text-text-secondary">{product.category}</p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
          >
            <Icon name="X" size={24} />
          </Button>
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

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[60vh]">
          {activeTab === 'overview' && (
            <div className="space-y-6">
              {/* Product Images */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Image
                    src={product.image}
                    alt={product.title}
                    className="w-full h-64 object-cover rounded-lg"
                  />
                </div>
                <div className="space-y-4">
                  <div>
                    <h3 className="text-lg font-semibold text-foreground mb-2">Description</h3>
                    <p className="text-text-secondary leading-relaxed">{product.description}</p>
                  </div>
                  <div>
                    <h4 className="font-medium text-foreground mb-2">Pricing</h4>
                    <div className="flex items-center space-x-2">
                      {product.originalPrice && product.originalPrice > product.price && (
                        <span className="text-text-secondary line-through">
                          {formatPrice(product.originalPrice)}
                        </span>
                      )}
                      <span className="text-2xl font-bold text-foreground">
                        {product.price === 0 ? 'Free' : formatPrice(product.price)}
                      </span>
                    </div>
                  </div>
                  <div className="flex space-x-3">
                    <Button
                      variant="default"
                      onClick={() => window.open(product.productUrl, '_blank')}
                      iconName="ExternalLink"
                      iconPosition="right"
                    >
                      Visit Product
                    </Button>
                    {product.demoUrl && (
                      <Button
                        variant="outline"
                        onClick={() => window.open(product.demoUrl, '_blank')}
                        iconName="Play"
                        iconPosition="left"
                      >
                        Try Demo
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'features' && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-foreground">Key Features</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {product.features.map((feature, index) => (
                  <div key={index} className="flex items-center space-x-3 p-3 bg-surface rounded-lg">
                    <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                      <Icon name="Check" size={16} color="white" />
                    </div>
                    <span className="text-foreground">{feature}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'reviews' && (
            <div className="space-y-6">
              {/* Rating Summary */}
              <div className="bg-surface p-4 rounded-lg">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <div className="flex items-center space-x-2 mb-1">
                      <span className="text-3xl font-bold text-foreground">{product.rating}</span>
                      <div className="flex">
                        {renderStars(product.rating)}
                      </div>
                    </div>
                    <p className="text-sm text-text-secondary">{product.reviewCount} reviews</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-text-secondary mb-2">Rate this product</p>
                    <div className="flex items-center space-x-2">
                      <div className="flex">
                        {renderStars(userRating, true, setUserRating)}
                      </div>
                      {userRating > 0 && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={handleRatingSubmit}
                        >
                          Submit
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Reviews List */}
              <div className="space-y-4">
                {product.reviews?.map((review, index) => (
                  <div key={index} className="border border-border p-4 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
                          <Icon name="User" size={16} color="white" />
                        </div>
                        <div>
                          <p className="font-medium text-foreground">{review.author}</p>
                          <div className="flex items-center space-x-2">
                            <div className="flex">
                              {renderStars(review.rating)}
                            </div>
                            <span className="text-xs text-text-secondary">{review.date}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                    <p className="text-text-secondary">{review.comment}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'feedback' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-foreground mb-2">Submit Feedback</h3>
                <p className="text-text-secondary">Help us improve this product by sharing your thoughts and suggestions.</p>
              </div>

              <form onSubmit={handleFeedbackSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      Feedback Type
                    </label>
                    <select
                      value={feedbackForm.type}
                      onChange={(e) => setFeedbackForm({...feedbackForm, type: e.target.value})}
                      className="w-full px-3 py-2 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                    >
                      <option value="feature">Feature Request</option>
                      <option value="bug">Bug Report</option>
                      <option value="improvement">Improvement</option>
                      <option value="general">General Feedback</option>
                    </select>
                  </div>
                  <Input
                    label="Your Email"
                    type="email"
                    value={feedbackForm.email}
                    onChange={(e) => setFeedbackForm({...feedbackForm, email: e.target.value})}
                    placeholder="your.email@example.com"
                    required
                  />
                </div>

                <Input
                  label="Title"
                  type="text"
                  value={feedbackForm.title}
                  onChange={(e) => setFeedbackForm({...feedbackForm, title: e.target.value})}
                  placeholder="Brief title for your feedback"
                  required
                />

                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Description
                  </label>
                  <textarea
                    value={feedbackForm.description}
                    onChange={(e) => setFeedbackForm({...feedbackForm, description: e.target.value})}
                    placeholder="Provide detailed feedback..."
                    rows={4}
                    className="w-full px-3 py-2 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent resize-none"
                    required
                  />
                </div>

                <Button
                  type="submit"
                  variant="default"
                  iconName="Send"
                  iconPosition="right"
                >
                  Submit Feedback
                </Button>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductDetailModal;