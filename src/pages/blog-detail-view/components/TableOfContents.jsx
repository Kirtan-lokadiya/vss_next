import React, { useState, useEffect } from 'react';
import Icon from '@/src/components/AppIcon';

const TableOfContents = ({ headings, className = '' }) => {
  const [activeHeading, setActiveHeading] = useState('');
  const [isSticky, setIsSticky] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      const headingElements = headings.map(heading => 
        document.getElementById(heading.id)
      ).filter(Boolean);

      const scrollPosition = window.scrollY + 100;

      for (let i = headingElements.length - 1; i >= 0; i--) {
        const element = headingElements[i];
        if (element && element.offsetTop <= scrollPosition) {
          setActiveHeading(element.id);
          break;
        }
      }

      // Check if TOC should be sticky
      const tocElement = document.getElementById('table-of-contents');
      if (tocElement) {
        const rect = tocElement.getBoundingClientRect();
        setIsSticky(rect.top <= 100);
      }
    };

    window.addEventListener('scroll', handleScroll);
    handleScroll(); // Initial check

    return () => window.removeEventListener('scroll', handleScroll);
  }, [headings]);

  const scrollToHeading = (headingId) => {
    const element = document.getElementById(headingId);
    if (element) {
      const offset = 80; // Account for fixed header
      const elementPosition = element.offsetTop - offset;
      window.scrollTo({
        top: elementPosition,
        behavior: 'smooth'
      });
    }
  };

  if (!headings || headings.length === 0) {
    return null;
  }

  return (
    <div
      id="table-of-contents"
      className={`bg-card border border-border rounded-lg p-6 ${
        isSticky ? 'sticky top-24' : ''
      } ${className}`}
    >
      <div className="flex items-center space-x-2 mb-4">
        <Icon name="List" size={20} className="text-text-secondary" />
        <h3 className="font-semibold text-foreground">Table of Contents</h3>
      </div>

      <nav>
        <ul className="space-y-2">
          {headings.map((heading, index) => (
            <li key={index}>
              <button
                onClick={() => scrollToHeading(heading.id)}
                className={`w-full text-left py-2 px-3 rounded-md transition-micro text-sm ${
                  activeHeading === heading.id
                    ? 'bg-primary text-primary-foreground'
                    : 'text-text-secondary hover:text-foreground hover:bg-muted'
                } ${
                  heading.level === 3 ? 'ml-4' : 
                  heading.level === 4 ? 'ml-8' : ''
                }`}
              >
                {heading.title}
              </button>
            </li>
          ))}
        </ul>
      </nav>

      {/* Reading Progress */}
      <div className="mt-6 pt-4 border-t border-border">
        <div className="flex items-center justify-between text-xs text-text-secondary mb-2">
          <span>Reading Progress</span>
          <span>68%</span>
        </div>
        <div className="w-full bg-muted rounded-full h-1">
          <div 
            className="bg-primary h-1 rounded-full transition-all duration-300"
            style={{ width: '68%' }}
          ></div>
        </div>
      </div>
    </div>
  );
};

export default TableOfContents;