import React, { useState, useEffect } from 'react';
import Header from '@/src/components/ui/Header';
import NavigationBreadcrumb from '@/src/components/ui/NavigationBreadcrumb';
import NetworkVisualization from './components/NetworkVisualization';
import NetworkFilters from './components/NetworkFilters';
import NetworkStats from './components/NetworkStats';
import ConnectionDetails from './components/ConnectionDetails';

const ConnectionNetworkTree = () => {
  const [selectedNode, setSelectedNode] = useState(null);
  const [viewMode, setViewMode] = useState('tree');
  const [filters, setFilters] = useState({
    industries: [],
    locations: [],
    companies: [],
    connectionDates: []
  });
  const [searchQuery, setSearchQuery] = useState('');

  // Mock connections data
  const mockConnections = [
    {
      id: 1,
      name: "Sarah Johnson",
      title: "Product Designer",
      company: "Google",
      location: "San Francisco, CA",
      industry: "Technology",
      connections: 1200,
      connectedDate: "3 months ago",
      interactions: 67,
      avatar: "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face",
      bio: "Passionate product designer with 8+ years of experience creating user-centered digital experiences. Currently leading design initiatives for Google's cloud platform.",
      skills: ["Product Design", "UX Research", "Prototyping", "Design Systems"],
      mutualConnections: [
        {
          id: 101,
          name: "Mike Chen",
          title: "Engineering Manager",
          company: "Meta",
          avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face"
        },
        {
          id: 102,
          name: "Emily Davis",
          title: "UX Researcher",
          company: "Apple",
          avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face"
        }
      ],
      activityHistory: [
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
        }
      ]
    },
    {
      id: 2,
      name: "David Rodriguez",
      title: "Engineering Manager",
      company: "Meta",
      location: "New York, NY",
      industry: "Technology",
      connections: 890,
      connectedDate: "1 month ago",
      interactions: 34,
      avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face",
      bio: "Engineering leader focused on building scalable systems and mentoring high-performing teams. Passionate about emerging technologies and innovation.",
      skills: ["Engineering Management", "System Design", "Team Leadership", "Agile"],
      mutualConnections: [
        {
          id: 103,
          name: "Alex Kim",
          title: "Software Engineer",
          company: "Netflix",
          avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face"
        }
      ]
    },
    {
      id: 3,
      name: "Lisa Wang",
      title: "Data Scientist",
      company: "Microsoft",
      location: "Seattle, WA",
      industry: "Technology",
      connections: 756,
      connectedDate: "2 weeks ago",
      interactions: 89,
      avatar: "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&h=150&fit=crop&crop=face",
      bio: "Data scientist specializing in machine learning and AI applications. Working on cutting-edge projects in natural language processing and computer vision.",
      skills: ["Machine Learning", "Python", "Data Analysis", "AI Research"],
      mutualConnections: []
    },
    {
      id: 4,
      name: "James Wilson",
      title: "Product Manager",
      company: "Amazon",
      location: "Toronto, ON",
      industry: "Technology",
      connections: 1100,
      connectedDate: "5 months ago",
      interactions: 23,
      avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop&crop=face",
      bio: "Strategic product manager with expertise in e-commerce and marketplace platforms. Leading cross-functional teams to deliver innovative customer experiences.",
      skills: ["Product Strategy", "Market Research", "Analytics", "Leadership"],
      mutualConnections: [
        {
          id: 104,
          name: "Rachel Green",
          title: "Marketing Manager",
          company: "Shopify",
          avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face"
        }
      ]
    },
    {
      id: 5,
      name: "Maria Garcia",
      title: "UX Researcher",
      company: "Apple",
      location: "London, UK",
      industry: "Technology",
      connections: 634,
      connectedDate: "6 months ago",
      interactions: 45,
      avatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&h=150&fit=crop&crop=face",
      bio: "User experience researcher passionate about understanding user behavior and creating inclusive design solutions. Currently working on accessibility initiatives.",
      skills: ["UX Research", "User Testing", "Accessibility", "Design Thinking"],
      mutualConnections: []
    },
    {
      id: 6,
      name: "Robert Kim",
      title: "Software Engineer",
      company: "Netflix",
      location: "Los Angeles, CA",
      industry: "Technology",
      connections: 423,
      connectedDate: "1 year ago",
      interactions: 12,
      avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face",
      bio: "Full-stack software engineer with expertise in distributed systems and streaming technologies. Contributing to Netflix\'s global content delivery platform.",
      skills: ["Software Engineering", "Distributed Systems", "Java", "React"],
      mutualConnections: []
    }
  ];

  // Mock network statistics
  const networkStats = {
    totalConnections: 1247,
    mutualConnections: 89,
    networkReach: 15600,
    activeThisWeek: 34,
    connectionGrowth: 12,
    mutualGrowth: 5,
    reachGrowth: 8,
    activityChange: -2,
    averageConnections: 156,
    topIndustry: 'Technology',
    networkScore: 85,
    networkHealth: 88
  };

  const handleNodeSelect = (node) => {
    if (node.id === 'user') {
      setSelectedNode(null);
      return;
    }
    
    const connection = mockConnections.find(conn => conn.id === node.id) || node;
    setSelectedNode(connection);
  };

  const handleFiltersChange = (newFilters) => {
    setFilters(newFilters);
  };

  const handleSearch = (query) => {
    setSearchQuery(query);
    console.log('Searching for:', query);
  };

  const handleConnect = (connection) => {
    console.log('Connecting with:', connection.name);
    // Implement connection logic
  };

  const handleMessage = (connection) => {
    console.log('Messaging:', connection.name);
    // Implement messaging logic
  };

  const handleExportNetwork = () => {
    console.log('Exporting network data');
    // Implement export functionality
  };

  // Filter connections based on current filters and search
  const filteredConnections = mockConnections.filter(connection => {
    // Search filter
    if (searchQuery) {
      const searchLower = searchQuery.toLowerCase();
      const matchesSearch = 
        connection.name.toLowerCase().includes(searchLower) ||
        connection.title.toLowerCase().includes(searchLower) ||
        connection.company.toLowerCase().includes(searchLower);
      
      if (!matchesSearch) return false;
    }

    // Industry filter
    if (filters.industries?.length > 0) {
      if (!filters.industries.includes(connection.industry?.toLowerCase())) {
        return false;
      }
    }

    // Location filter
    if (filters.locations?.length > 0) {
      const locationMatch = filters.locations.some(loc => 
        connection.location?.toLowerCase().includes(loc.replace('-', ' '))
      );
      if (!locationMatch) return false;
    }

    // Company filter
    if (filters.companies?.length > 0) {
      const companyMatch = filters.companies.some(comp => 
        connection.company?.toLowerCase().includes(comp)
      );
      if (!companyMatch) return false;
    }

    return true;
  });

  useEffect(() => {
    // Set page title
    document.title = 'Connection Network Tree - LinkedBoard Pro';
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="pt-16">
        <div className="max-w-7xl mx-auto px-4 lg:px-6 py-6">
          {/* Breadcrumb Navigation */}
          <NavigationBreadcrumb className="mb-6" />

          {/* Page Header */}
          <div className="mb-6">
            <h1 className="text-3xl font-bold text-foreground mb-2">
              Connection Network Tree
            </h1>
            <p className="text-text-secondary">
              Visualize and explore your professional network through interactive node-based connections
            </p>
          </div>

          {/* Network Statistics */}
          <NetworkStats 
            stats={networkStats}
            className="mb-6"
          />

          {/* Main Content Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* Left Sidebar - Filters */}
            <div className="lg:col-span-1">
              <NetworkFilters
                filters={filters}
                onFiltersChange={handleFiltersChange}
                onSearch={handleSearch}
                className="sticky top-24"
              />
            </div>

            {/* Center - Network Visualization */}
            <div className="lg:col-span-2">
              <NetworkVisualization
                connections={filteredConnections}
                selectedNode={selectedNode}
                onNodeSelect={handleNodeSelect}
                viewMode={viewMode}
                onViewModeChange={setViewMode}
                filters={filters}
                className="h-[600px]"
              />
            </div>

            {/* Right Sidebar - Connection Details */}
            <div className="lg:col-span-1">
              <ConnectionDetails
                selectedConnection={selectedNode}
                onClose={() => setSelectedNode(null)}
                onConnect={handleConnect}
                onMessage={handleMessage}
                className="sticky top-24"
              />
            </div>
          </div>

          {/* Mobile View Adjustments */}
          <div className="lg:hidden mt-6">
            {selectedNode && (
              <ConnectionDetails
                selectedConnection={selectedNode}
                onClose={() => setSelectedNode(null)}
                onConnect={handleConnect}
                onMessage={handleMessage}
              />
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default ConnectionNetworkTree;