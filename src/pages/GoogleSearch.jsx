import React, { useEffect } from 'react';
import { useRouter } from 'next/router';
import Icon from '@/src/components/AppIcon';

const GoogleSearch = () => {
  const router = useRouter();
  const navigate = router.push;

  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === 'Escape') {
        navigate(-1);
      }
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [navigate]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background relative">
      {/* Back Button */}
      <button
        className="absolute top-6 left-6 flex items-center space-x-2 bg-white dark:bg-background border border-border rounded-full px-4 py-2 shadow hover:bg-muted transition"
        onClick={() => navigate(-1)}
        title="Go back"
      >
        <Icon name="ArrowLeft" size={20} />
        <span className="font-medium text-foreground">Back</span>
      </button>
      <div className="mb-8">
        <h1 className="text-5xl font-bold text-primary mb-2">Connect your thoughts</h1>
        <p className="text-lg text-text-secondary text-center">Search across posts, people, ideas, and more</p>
      </div>
      <form className="w-full max-w-xl">
        <input
          type="search"
          className="w-full border border-border rounded-full px-6 py-4 text-lg focus:ring-2 focus:ring-primary focus:border-transparent shadow"
          placeholder="Search LinkedBoard Pro..."
        />
      </form>
    </div>
  );
};

export default GoogleSearch; 