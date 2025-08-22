import React, { useEffect, useState, useMemo } from 'react';
import { useRouter } from 'next/router';
import Icon from '@/src/components/AppIcon';
import NetworkVisualization from '@/src/pages/connection-network-tree/components/NetworkVisualization';
import { getAuthToken } from '@/src/utils/api';

const GoogleSearch = () => {
  const router = useRouter();
  const [query, setQuery] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [searchResults, setSearchResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  // Prefill from query string and auto-submit once mounted
  useEffect(() => {
    if (!router.isReady) return;
    const q = typeof router.query.q === 'string' ? router.query.q : '';
    if (q) {
      setQuery(q);
      // Delay submit to next tick to ensure input renders first
      setTimeout(() => {
        const fakeEvent = { preventDefault: () => {} };
        handleSubmit(fakeEvent);
      }, 0);
    }
  }, [router.isReady, router.query.q]);

  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === 'Escape') {
        router.back();
      }
    };
    if (typeof window !== 'undefined') {
      window.addEventListener('keydown', handleEsc);
      return () => window.removeEventListener('keydown', handleEsc);
    }
  }, [router]);

  const peopleResults = useMemo(() => {
    // Transform API results to graph format
    return searchResults.map((user, index) => ({
      id: user.id,
      name: user.name,
      interactions: Math.floor(Math.random() * 20) + 1, // Random interaction count for demo
      avatar: user.picture && user.picture !== 'None' ? user.picture : null,
      mutualConnections: []
    }));
  }, [searchResults]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!query.trim() || typeof window === 'undefined') return;
    setSubmitted(true);
    setLoading(true);
    
    try {
      const token = getAuthToken();
      const apiUrl = `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:5321'}/api/v1/privates/`;
      
      
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ content: query })
      });
 
      if (!response.ok) {
        const errorText = await response.text();
        
        throw new Error(`Search failed: ${response.status} ${response.statusText}`);
      }
      
      const data = await response.json();
      setSearchResults(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Search error:', error);
      setSearchResults([]);
    } finally {
      setLoading(false);
    }
  };

  if (!isClient) {
    return <div className="min-h-screen bg-background flex items-center justify-center">Loading...</div>;
  }

  return (
    <div className={`min-h-screen bg-background ${submitted ? 'pt-20' : ''} relative`}>
      {/* Back Button */}
      <button
        className="absolute top-6 left-6 flex items-center space-x-2 bg-white dark:bg-background border border-border rounded-full px-4 py-2 shadow hover:bg-muted transition"
        onClick={() => router.back()}
        title="Go back"
      >
        <Icon name="ArrowLeft" size={20} />
        <span className="font-medium text-foreground">Back</span>
      </button>

      {/* Search bar - animates to sticky top on submit */}
       <div className={`${submitted ? 'fixed top-0 left-0 right-0 z-20 bg-background/95 backdrop-blur border-b border-border' : 'flex flex-col items-center justify-center min-h-screen'} transition-all`}>
        {!submitted && (
          <div className="text-center mb-8 pt-24">
            <h1 className="text-5xl font-bold text-primary mb-2">Connect your thoughts</h1>
            <p className="text-lg text-text-secondary">Search across posts, people, ideas, and more</p>
          </div>
        )}
        <div className={`mx-auto w-full ${submitted ? 'px-4 py-3' : 'px-6'}`}>
          <form onSubmit={handleSubmit}>
            <input
              type="search"
              value={query}
              onChange={(e)=>setQuery(e.target.value)}
              className={`w-full border border-border rounded-full px-6 ${submitted ? 'py-3 text-base shadow-none' : 'py-4 text-lg shadow'} focus:ring-2 focus:ring-primary focus:border-transparent transition-all`}
              placeholder="Search in VSS ..."
            />
          </form>
        </div>
      </div>

      {/* Results section */}
      {submitted && (
        <div className="max-w-6xl mx-auto px-4 lg:px-6 mt-6">
          {/* Tabs */}
          <div className="flex items-center space-x-4 border-b border-border">
            <button className="px-2 py-3 text-sm font-medium text-primary border-b-2 border-primary">People</button>
            {/* placeholders for future tabs */}
            <button className="px-2 py-3 text-sm text-text-secondary" disabled>Posts</button>
            <button className="px-2 py-3 text-sm text-text-secondary" disabled>Ideas</button>
          </div>

          {/* People - Real API Graph */}
          <div className="mt-6">
            <div className="bg-card border border-border rounded-2xl shadow-card p-4">
              <h3 className="text-sm font-semibold text-foreground mb-3">
                People related to "{query}" ({peopleResults.length} results)
              </h3>
              {loading ? (
                <div className="h-[420px] flex items-center justify-center">
                  <div className="text-text-secondary">Searching...</div>
                </div>
              ) : peopleResults.length === 0 ? (
                <div className="h-[420px] flex items-center justify-center">
                  <div className="text-text-secondary">No people found for "{query}"</div>
                </div>
              ) : (
                <NetworkVisualization
                  connections={peopleResults}
                  selectedNode={null}
                  onNodeSelect={() => {}}
                  viewMode={'circular'}
                  onViewModeChange={() => {}}
                  className="h-[420px]"
                  showControls={false}
                  showLegend={false}
                />
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default GoogleSearch; 