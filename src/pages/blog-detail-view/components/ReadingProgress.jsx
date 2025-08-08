import React, { useState, useEffect } from 'react';

const ReadingProgress = ({ className = '' }) => {
  const [progress, setProgress] = useState(0);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const calculateProgress = () => {
      const article = document.querySelector('article');
      if (!article) return;

      const articleTop = article.offsetTop;
      const articleHeight = article.offsetHeight;
      const windowHeight = window.innerHeight;
      const scrollTop = window.scrollY;

      // Start showing progress when article comes into view
      if (scrollTop > articleTop - windowHeight) {
        setIsVisible(true);
        
        // Calculate reading progress
        const articleStart = articleTop - windowHeight;
        const articleEnd = articleTop + articleHeight;
        const currentProgress = Math.min(
          Math.max((scrollTop - articleStart) / (articleEnd - articleStart), 0),
          1
        );
        
        setProgress(currentProgress * 100);
      } else {
        setIsVisible(false);
      }
    };

    const handleScroll = () => {
      requestAnimationFrame(calculateProgress);
    };

    window.addEventListener('scroll', handleScroll);
    calculateProgress(); // Initial calculation

    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  if (!isVisible) return null;

  return (
    <div className={`fixed top-0 left-0 right-0 z-1000 ${className}`}>
      <div 
        className="h-1 bg-primary transition-all duration-150 ease-out"
        style={{ width: `${progress}%` }}
      />
    </div>
  );
};

export default ReadingProgress;