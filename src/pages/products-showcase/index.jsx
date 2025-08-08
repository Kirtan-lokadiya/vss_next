import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import Header from '@/src/components/ui/Header';
import ProfileSidebar from '@/src/components/ui/ProfileSidebar';
import NavigationBreadcrumb from '@/src/components/ui/NavigationBreadcrumb';
import ProductCard from './components/ProductCard';
import ProductDetailModal from './components/ProductDetailModal';
import ProductFilters from './components/ProductFilters';
import FeedbackSystem from './components/FeedbackSystem';
import Icon from '@/src/components/AppIcon';
import Button from '@/src/components/ui/Button';

const ProductsShowcase = () => {
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [showProductModal, setShowProductModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('newest');
  const [filters, setFilters] = useState({
    category: '',
    priceRange: [0, 1000],
    minRating: 0,
    features: []
  });
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState('grid'); // grid or list
  const [showProfile, setShowProfile] = useState(false);

  // Mock products data
  const mockProducts = [
    {
      id: 1,
      title: "CloudSync Pro",
      description: "Advanced cloud synchronization tool for seamless file management across multiple devices and platforms with real-time collaboration features.",
      category: "Productivity",
      price: 29.99,
      originalPrice: 49.99,
      rating: 4.8,
      reviewCount: 1247,
      image: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=400&h=300&fit=crop",
      features: ["Real-time sync", "Multi-platform", "Team collaboration", "Version control", "Offline access"],
      productUrl: "https://cloudsync-pro.example.com",
      demoUrl: "https://demo.cloudsync-pro.example.com",
      badge: { type: "popular", label: "Popular" },
      isWishlisted: false,
      reviews: [
        {
          author: "Sarah Johnson",
          rating: 5,
          comment: "Excellent tool for team collaboration. The real-time sync works flawlessly across all our devices.",
          date: "2025-07-10"
        },
        {
          author: "Mike Chen",
          rating: 4,
          comment: "Great product overall, but could use better mobile app interface.",
          date: "2025-07-08"
        }
      ]
    },
    {
      id: 2,
      title: "DesignFlow Studio",
      description: "Professional design workflow management platform with integrated asset library, version control, and client feedback system.",
      category: "Design Tools",
      price: 0,
      originalPrice: null,
      rating: 4.6,
      reviewCount: 892,
      image: "https://images.unsplash.com/photo-1558655146-9f40138edfeb?w=400&h=300&fit=crop",
      features: ["Asset management", "Version control", "Client feedback", "Template library", "Export tools"],
      productUrl: "https://designflow-studio.example.com",
      demoUrl: "https://demo.designflow-studio.example.com",
      badge: { type: "new", label: "New" },
      isWishlisted: true,
      reviews: [
        {
          author: "Alex Rodriguez",
          rating: 5,
          comment: "Perfect for managing design projects. The client feedback feature is a game-changer.",
          date: "2025-07-09"
        }
      ]
    },
    {
      id: 3,
      title: "CodeMaster IDE",
      description: "Next-generation integrated development environment with AI-powered code completion, debugging tools, and collaborative coding features.",
      category: "Development",
      price: 99.99,
      originalPrice: 149.99,
      rating: 4.9,
      reviewCount: 2156,
      image: "https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=400&h=300&fit=crop",
      features: ["AI code completion", "Advanced debugging", "Git integration", "Plugin ecosystem", "Multi-language support"],
      productUrl: "https://codemaster-ide.example.com",
      demoUrl: "https://demo.codemaster-ide.example.com",
      badge: { type: "featured", label: "Featured" },
      isWishlisted: false,
      reviews: [
        {
          author: "David Kim",
          rating: 5,
          comment: "Best IDE I\'ve ever used. The AI completion saves hours of development time.",
          date: "2025-07-11"
        },
        {
          author: "Emma Wilson",
          rating: 5,
          comment: "Incredible debugging tools and seamless Git integration.",
          date: "2025-07-07"
        }
      ]
    },
    {
      id: 4,
      title: "DataViz Analytics",
      description: "Powerful data visualization and analytics platform for creating interactive dashboards, reports, and business intelligence insights.",
      category: "Analytics",
      price: 79.99,
      originalPrice: null,
      rating: 4.4,
      reviewCount: 634,
      image: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=400&h=300&fit=crop",
      features: ["Interactive dashboards", "Real-time data", "Custom reports", "API integration", "Export options"],
      productUrl: "https://dataviz-analytics.example.com",
      demoUrl: null,
      badge: null,
      isWishlisted: false,
      reviews: [
        {
          author: "Jennifer Lee",
          rating: 4,
          comment: "Great for creating business reports. Could use more chart types.",
          date: "2025-07-06"
        }
      ]
    },
    {
      id: 5,
      title: "TeamChat Enterprise",
      description: "Secure enterprise communication platform with end-to-end encryption, file sharing, video conferencing, and workflow integration.",
      category: "Communication",
      price: 15.99,
      originalPrice: 25.99,
      rating: 4.7,
      reviewCount: 1893,
      image: "https://images.unsplash.com/photo-1557804506-669a67965ba0?w=400&h=300&fit=crop",
      features: ["End-to-end encryption", "Video conferencing", "File sharing", "Workflow integration", "Mobile apps"],
      productUrl: "https://teamchat-enterprise.example.com",
      demoUrl: "https://demo.teamchat-enterprise.example.com",
      badge: { type: "popular", label: "Popular" },
      isWishlisted: true,
      reviews: [
        {
          author: "Robert Taylor",
          rating: 5,
          comment: "Excellent security features and smooth video calls. Perfect for remote teams.",
          date: "2025-07-12"
        }
      ]
    },
    {
      id: 6,
      title: "MarketBoost Pro",
      description: "Comprehensive digital marketing automation platform with email campaigns, social media management, and analytics tracking.",
      category: "Marketing",
      price: 49.99,
      originalPrice: null,
      rating: 4.3,
      reviewCount: 567,
      image: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=400&h=300&fit=crop",
      features: ["Email automation", "Social media management", "Analytics tracking", "A/B testing", "Lead generation"],
      productUrl: "https://marketboost-pro.example.com",
      demoUrl: "https://demo.marketboost-pro.example.com",
      badge: null,
      isWishlisted: false,
      reviews: [
        {
          author: "Lisa Anderson",
          rating: 4,
          comment: "Good automation features, but the interface could be more intuitive.",
          date: "2025-07-05"
        }
      ]
    }
  ];

  useEffect(() => {
    // Simulate loading
    setTimeout(() => {
      setProducts(mockProducts);
      setFilteredProducts(mockProducts);
      setLoading(false);
    }, 1000);
  }, []);

  useEffect(() => {
    // Apply filters and search
    let filtered = products.filter(product => {
      // Search filter
      const matchesSearch = !searchQuery || 
        product.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.category.toLowerCase().includes(searchQuery.toLowerCase());

      // Category filter
      const matchesCategory = !filters.category || product.category === filters.category;

      // Price filter
      const matchesPrice = product.price >= filters.priceRange[0] && product.price <= filters.priceRange[1];

      // Rating filter
      const matchesRating = product.rating >= filters.minRating;

      // Features filter
      const matchesFeatures = !filters.features?.length || 
        filters.features.some(feature => {
          switch (feature) {
            case 'new': return product.badge?.type === 'new';
            case 'popular': return product.badge?.type === 'popular';
            case 'featured': return product.badge?.type === 'featured';
            case 'sale': return product.originalPrice && product.originalPrice > product.price;
            case 'trial': return product.demoUrl;
            default: return false;
          }
        });

      return matchesSearch && matchesCategory && matchesPrice && matchesRating && matchesFeatures;
    });

    // Apply sorting
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'popular':
          return b.reviewCount - a.reviewCount;
        case 'rating':
          return b.rating - a.rating;
        case 'price-low':
          return a.price - b.price;
        case 'price-high':
          return b.price - a.price;
        case 'name':
          return a.title.localeCompare(b.title);
        case 'newest':
        default:
          return b.id - a.id;
      }
    });

    setFilteredProducts(filtered);
  }, [products, searchQuery, filters, sortBy]);

  const handleViewDetails = (product) => {
    setSelectedProduct(product);
    setShowProductModal(true);
  };

  const handleAddToWishlist = (productId, isWishlisted) => {
    setProducts(prev => prev.map(product => 
      product.id === productId 
        ? { ...product, isWishlisted }
        : product
    ));
  };

  const handleRateProduct = (productId, rating) => {
    console.log(`Rating product ${productId} with ${rating} stars`);
    // In a real app, this would make an API call
  };

  const handleSubmitFeedback = (productId, feedback) => {
    console.log(`Feedback for product ${productId}:`, feedback);
    // In a real app, this would make an API call
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Head>
          <title>Products Showcase - LinkedBoard Pro</title>
          <meta name="description" content="Discover our comprehensive product portfolio with detailed information and user feedback capabilities." />
        </Head>
        <Header>
          <button
            className="fixed top-4 right-8 z-50 bg-primary rounded-full w-12 h-12 flex items-center justify-center shadow-lg border-2 border-white"
            onClick={() => setShowProfile(true)}
            title="View Profile"
          >
            <Icon name="User" size={28} color="white" />
          </button>
        </Header>
        {showProfile && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
            <div className="bg-white dark:bg-background rounded-lg shadow-2xl max-w-md w-full relative">
              <button
                className="absolute top-2 right-2 text-xl p-2 rounded-full hover:bg-muted"
                onClick={() => setShowProfile(false)}
                title="Close"
              >
                <Icon name="X" size={20} />
              </button>
              <ProfileSidebar className="rounded-lg shadow-none border-none" />
            </div>
          </div>
        )}
        <main className="pt-16">
          <div className="p-6">
            <div className="flex items-center justify-center h-64">
              <div className="text-center">
                <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                <p className="text-text-secondary">Loading products...</p>
              </div>
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Head>
        <title>Products Showcase - LinkedBoard Pro</title>
        <meta name="description" content="Discover our comprehensive product portfolio with detailed information and user feedback capabilities." />
        <meta name="keywords" content="products, software, tools, productivity, design, development, analytics" />
      </Head>
      <Header>
        <button
          className="fixed top-4 right-8 z-50 bg-primary rounded-full w-12 h-12 flex items-center justify-center shadow-lg border-2 border-white"
          onClick={() => setShowProfile(true)}
          title="View Profile"
        >
          <Icon name="User" size={28} color="white" />
        </button>
      </Header>
      {showProfile && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white dark:bg-background rounded-lg shadow-2xl max-w-md w-full relative">
            <button
              className="absolute top-2 right-2 text-xl p-2 rounded-full hover:bg-muted"
              onClick={() => setShowProfile(false)}
              title="Close"
            >
              <Icon name="X" size={20} />
            </button>
            <ProfileSidebar className="rounded-lg shadow-none border-none" />
          </div>
        </div>
      )}
      <main className="pt-16">
        <div className="p-6 space-y-6 max-w-5xl mx-auto">
          {/* Breadcrumb */}
          <NavigationBreadcrumb />
          {/* Page Header */}
          <div className="bg-card border border-border rounded-lg shadow-card p-6">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
              <div>
                <h1 className="text-3xl font-bold text-foreground mb-2">Products Showcase</h1>
                <p className="text-text-secondary">
                  Discover our comprehensive product portfolio with detailed information and user feedback capabilities.
                </p>
              </div>
              <div className="flex items-center space-x-3">
                <div className="flex items-center space-x-2 bg-surface px-3 py-2 rounded-lg">
                  <Icon name="Package" size={16} className="text-text-secondary" />
                  <span className="text-sm text-text-secondary">
                    {filteredProducts.length} of {products.length} products
                  </span>
                </div>
                <div className="flex items-center border border-border rounded-lg">
                  <Button
                    variant={viewMode === 'grid' ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => setViewMode('grid')}
                    iconName="Grid3X3"
                    iconSize={16}
                  />
                  <Button
                    variant={viewMode === 'list' ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => setViewMode('list')}
                    iconName="List"
                    iconSize={16}
                  />
                </div>
              </div>
            </div>
          </div>
          {/* Filters */}
          <ProductFilters
            filters={filters}
            onFiltersChange={setFilters}
            onSortChange={setSortBy}
            onSearchChange={setSearchQuery}
            searchQuery={searchQuery}
            totalProducts={products.length}
            filteredCount={filteredProducts.length}
          />
          {/* Products Grid */}
          <div className="space-y-6">
            {filteredProducts.length === 0 ? (
              <div className="bg-card border border-border rounded-lg shadow-card p-12 text-center">
                <Icon name="Package" size={64} className="text-text-secondary mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-foreground mb-2">No products found</h3>
                <p className="text-text-secondary mb-6">
                  Try adjusting your filters or search terms to find what you're looking for.
                </p>
                <Button
                  variant="outline"
                  onClick={() => {
                    setFilters({
                      category: '',
                      priceRange: [0, 1000],
                      minRating: 0,
                      features: []
                    });
                    setSearchQuery('');
                  }}
                  iconName="RotateCcw"
                  iconPosition="left"
                >
                  Clear All Filters
                </Button>
              </div>
            ) : (
              <div className={`${
                viewMode === 'grid' ?'grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6' :'space-y-4'
              }`}>
                {filteredProducts.map((product) => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    onViewDetails={handleViewDetails}
                    onAddToWishlist={handleAddToWishlist}
                    onRateProduct={handleRateProduct}
                  />
                ))}
              </div>
            )}
          </div>
          {/* Feedback System */}
          <FeedbackSystem />
        </div>
      </main>
      {/* Product Detail Modal */}
      <ProductDetailModal
        product={selectedProduct}
        isOpen={showProductModal}
        onClose={() => {
          setShowProductModal(false);
          setSelectedProduct(null);
        }}
        onSubmitFeedback={handleSubmitFeedback}
        onRateProduct={handleRateProduct}
      />
    </div>
  );
};

export default ProductsShowcase;