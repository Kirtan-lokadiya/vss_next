import React, { useEffect, useState, useMemo } from 'react';
import { useRouter } from 'next/router';
import Icon from '@/src/components/AppIcon';
import NetworkVisualization from '@/src/pages/connection-network-tree/components/NetworkVisualization';

const GoogleSearch = () => {
  const router = useRouter();
  const [query, setQuery] = useState('');
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === 'Escape') {
        router.back();
      }
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [router]);

  const peopleResults = useMemo(() => {
    // simple mock connections for the mini graph
    return [
      { id: 1, name: 'Alice Sharma', interactions: 10, avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=80&h=80&fit=crop&crop=face', mutualConnections: [] },
      { id: 2, name: 'Rohit Patel', interactions: 8, avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=80&h=80&fit=crop&crop=face', mutualConnections: [] },
      { id: 3, name: 'Nisha Verma', interactions: 15, avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=80&h=80&fit=crop&crop=face', mutualConnections: [] },
      { id: 4, name: 'Karan Singh', interactions: 4, avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=80&h=80&fit=crop&crop=face', mutualConnections: [] },
      { id: 5, name: 'Meera Rao', interactions: 6, avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=80&h=80&fit=crop&crop=face', mutualConnections: [] },
    ];
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!query.trim()) return;
    setSubmitted(true);
  };

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
      <div className={`${submitted ? 'fixed top-0 left-0 right-0 z-20 bg-background/95 backdrop-blur border-b border-border' : 'flex flex-col items-center justify-center'} transition-all`}> 
        {!submitted && (
          <div className="text-center mb-8 pt-24">
            <h1 className="text-5xl font-bold text-primary mb-2">Connect your thoughts</h1>
            <p className="text-lg text-text-secondary">Search across posts, people, ideas, and more</p>
          </div>
        )}
        <div className={`mx-auto ${submitted ? 'max-w-3xl p-3' : 'max-w-xl'}`}>
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

          {/* People - Dummy Graph only */}
          <div className="mt-6">
            <div className="bg-card border border-border rounded-2xl shadow-card p-4">
              <h3 className="text-sm font-semibold text-foreground mb-3">People related to "{query}"</h3>
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
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default GoogleSearch; 