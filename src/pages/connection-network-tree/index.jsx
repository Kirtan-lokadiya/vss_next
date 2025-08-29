import React, { useState, useEffect } from 'react';
import Header from '@/src/components/ui/Header';
import NetworkVisualization from './components/NetworkVisualization';
import ConnectionDetails from './components/ConnectionDetails';
import { fetchConnectionNetwork, getAuthToken } from '@/src/utils/api';
import { extractUserId } from '@/src/utils/jwt';

const ConnectionNetworkTree = () => {
  const [currentUserId, setCurrentUserId] = useState(null);
  const [selectedNode, setSelectedNode] = useState(null);
  const [viewMode, setViewMode] = useState('tree');
  const [connections, setConnections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({
    industries: [],
    locations: [],
    companies: [],
    connectionDates: []
  });
  const [searchQuery, setSearchQuery] = useState('');

  // Load connections from API
  useEffect(() => {
    const loadConnections = async () => {
      const token = getAuthToken();
      if (!token) return;
      
      let userId;
      try {
        userId = extractUserId(token);
        setCurrentUserId(userId);
      } catch (e) {
        console.error('Failed to extract user ID:', e);
        return;
      }
      
      try {
        setLoading(true);
        const data = await fetchConnectionNetwork({ userId, token });
        
        // Transform API data to component format
        const transformedConnections = (data?.users || []).map(apiUser => ({
          id: apiUser.id,
          name: apiUser.name,
          title: '', // API doesn't provide title
          company: '', // API doesn't provide company
          location: '', // API doesn't provide location
          industry: 'Technology', // Default
          connections: 0, // API doesn't provide this
          connectedDate: '', // API doesn't provide this
          interactions: 0, // API doesn't provide this
          avatar: apiUser.picture !== 'NONE' ? apiUser.picture : null,
          bio: '', // API doesn't provide bio
          skills: [], // API doesn't provide skills
          mutualConnections: [], // API doesn't provide mutual connections
          activityHistory: [] // API doesn't provide activity history
        }));
        
        setConnections(transformedConnections);
      } catch (err) {
        setError(err.message);
        console.error('Failed to load connections:', err);
      } finally {
        setLoading(false);
      }
    };

    loadConnections();
  }, []);

  // Mock connections data (fallback)
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
      connectedDate: "",
      interactions: 12,
      avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face",
      bio: "Full-stack software engineer with expertise in distributed systems and streaming technologies. Contributing to Netflix\'s global content delivery platform.",
      skills: ["Software Engineering", "Distributed Systems", "Java", "React"],
      mutualConnections: []
    }
  ];

  // Network statistics based on actual data
  const networkStats = {
    totalConnections: connections.length,
    mutualConnections: 0, // API doesn't provide this
    networkReach: connections.length * 10, // Estimated
    activeThisWeek: Math.floor(connections.length * 0.3), // Estimated
    connectionGrowth: 0, // API doesn't provide this
    mutualGrowth: 0,
    reachGrowth: 0,
    activityChange: 0,
    averageConnections: 156,
    topIndustry: 'Technology',
    networkScore: Math.min(85, connections.length * 2),
    networkHealth: Math.min(88, connections.length * 2)
  };

  const handleNodeSelect = (node) => {
    if (node.id === 'user') {
      setSelectedNode(null);
      return;
    }
    
    const connection = connections.find(conn => conn.id === node.id) || node;
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
  const filteredConnections = connections.filter(connection => {
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
    document.title = 'Connection Network Tree - VSS';
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="pt-16">
        <div className="w-full px-4 lg:px-6 py-6">
          {/* Network Visualization - Full Width */}
          {loading ? (
            <div className="h-[600px] w-full flex items-center justify-center bg-white border border-border rounded-lg">
              <div className="text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2"></div>
                <p className="text-text-secondary">Loading your network...</p>
              </div>
            </div>
          ) : error ? (
            <div className="h-[600px] w-full flex items-center justify-center bg-white border border-border rounded-lg">
              <div className="text-center">
                <p className="text-destructive mb-2">Failed to load network</p>
                <p className="text-text-secondary text-sm">{error}</p>
              </div>
            </div>
          ) : (
            <NetworkVisualization
              connections={filteredConnections}
              selectedNode={selectedNode}
              onNodeSelect={handleNodeSelect}
              viewMode={viewMode}
              onViewModeChange={setViewMode}
              filters={filters}
              className="h-[600px] w-full"
            />
          )}

        </div>
      </main>
    </div>
  );
};

export default ConnectionNetworkTree;