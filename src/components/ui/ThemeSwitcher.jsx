import React, { useState, useEffect } from 'react';
import Icon from '../AppIcon';
import Button from './Button';

const ThemeSwitcher = ({ className = '' }) => {
  const [theme, setTheme] = useState('system');
  const [showDropdown, setShowDropdown] = useState(false);

  const themes = [
    {
      value: 'light',
      label: 'Light',
      icon: 'Sun',
      description: 'Clean and bright interface'
    },
    {
      value: 'dark',
      label: 'Dark',
      icon: 'Moon',
      description: 'Easy on the eyes'
    },
    {
      value: 'system',
      label: 'System',
      icon: 'Monitor',
      description: 'Follows your device setting'
    }
  ];

  useEffect(() => {
    // Load theme preference from localStorage
    const savedTheme = localStorage.getItem('theme') || 'system';
    setTheme(savedTheme);
    applyTheme(savedTheme);
  }, []);

  const applyTheme = (selectedTheme) => {
    const root = document.documentElement;
    
    if (selectedTheme === 'dark') {
      root.classList.add('dark');
    } else if (selectedTheme === 'light') {
      root.classList.remove('dark');
    } else {
      // System theme
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      if (prefersDark) {
        root.classList.add('dark');
      } else {
        root.classList.remove('dark');
      }
    }
  };

  const handleThemeChange = (selectedTheme) => {
    setTheme(selectedTheme);
    localStorage.setItem('theme', selectedTheme);
    applyTheme(selectedTheme);
    setShowDropdown(false);
  };

  const toggleDropdown = () => {
    setShowDropdown(!showDropdown);
  };

  const getCurrentThemeIcon = () => {
    const currentTheme = themes.find(t => t.value === theme);
    return currentTheme ? currentTheme.icon : 'Monitor';
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (!event.target.closest('.theme-switcher')) {
        setShowDropdown(false);
      }
    };

    if (showDropdown) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [showDropdown]);

  // Listen for system theme changes
  useEffect(() => {
    if (theme === 'system') {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      const handleChange = () => applyTheme('system');
      
      mediaQuery.addEventListener('change', handleChange);
      return () => mediaQuery.removeEventListener('change', handleChange);
    }
  }, [theme]);

  return (
    <div className={`relative theme-switcher ${className}`}>
      <Button
        variant="ghost"
        size="icon"
        onClick={toggleDropdown}
        className="w-10 h-10"
        title="Change theme"
      >
        <Icon name={getCurrentThemeIcon()} size={20} />
      </Button>

      {showDropdown && (
        <div className="absolute right-0 mt-2 w-64 bg-popover border border-border rounded-lg shadow-modal z-1010">
          <div className="p-3">
            <h3 className="text-sm font-semibold text-foreground mb-3">Choose Theme</h3>
            <div className="space-y-1">
              {themes.map((themeOption) => (
                <button
                  key={themeOption.value}
                  onClick={() => handleThemeChange(themeOption.value)}
                  className={`w-full flex items-center space-x-3 px-3 py-3 rounded-lg transition-micro ${
                    theme === themeOption.value
                      ? 'bg-primary text-primary-foreground'
                      : 'hover:bg-muted text-foreground'
                  }`}
                >
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                    theme === themeOption.value
                      ? 'bg-primary-foreground/20'
                      : 'bg-muted'
                  }`}>
                    <Icon 
                      name={themeOption.icon} 
                      size={16} 
                      className={theme === themeOption.value ? 'text-primary-foreground' : 'text-text-secondary'}
                    />
                  </div>
                  <div className="flex-1 text-left">
                    <div className={`text-sm font-medium ${
                      theme === themeOption.value ? 'text-primary-foreground' : 'text-foreground'
                    }`}>
                      {themeOption.label}
                    </div>
                    <div className={`text-xs ${
                      theme === themeOption.value ? 'text-primary-foreground/80' : 'text-text-secondary'
                    }`}>
                      {themeOption.description}
                    </div>
                  </div>
                  {theme === themeOption.value && (
                    <Icon name="Check" size={16} className="text-primary-foreground" />
                  )}
                </button>
              ))}
            </div>
          </div>
          
          <div className="p-3 border-t border-border">
            <div className="flex items-center space-x-2 text-xs text-text-secondary">
              <Icon name="Info" size={12} />
              <span>Theme preference is saved locally</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ThemeSwitcher;