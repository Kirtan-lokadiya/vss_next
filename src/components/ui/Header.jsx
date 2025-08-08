import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import Icon from '../AppIcon';
import Button from './Button';
import Input from './Input';
import ThemeSwitcher from './ThemeSwitcher';

const Header = () => {
  const [showProfileMenu, setShowProfileMenu] = React.useState(false);
  const [showMobileMenu, setShowMobileMenu] = React.useState(false);
  const router = useRouter();
  const navigate = router.push;

  const navigationItems = [
    { label: 'Home', path: '/', icon: 'Home' },
    { label: 'Ideas', path: '/ideas-whiteboard', icon: 'Lightbulb' },
    { label: 'Network', path: '/connection-network-tree', icon: 'Users' },
    { label: 'Products', path: '/products-showcase', icon: 'Package' },
  ];

  const isActivePath = (path) => router.pathname === path;

  const toggleProfileMenu = () => setShowProfileMenu(!showProfileMenu);
  const toggleMobileMenu = () => setShowMobileMenu(!showMobileMenu);

  // Refactored search bar: always navigates to /search on focus or submit
  const handleSearchFocus = (e) => {
    e.preventDefault();
    navigate('/search');
  };
  const handleSearchSubmit = (e) => {
    e.preventDefault();
    navigate('/search');
  };

  return (
    <header className="fixed top-0 left-0 right-0 bg-background border-b border-border z-1000">
      <div className="flex items-center justify-between h-16 px-4 lg:px-6">
        {/* Logo */}
        <div className="flex items-center">
          <Link href="/" className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <Icon name="Zap" size={20} color="white" />
            </div>
            <span className="text-xl font-semibold text-foreground hidden sm:block">
              LinkedBoard Pro
            </span>
          </Link>
        </div>
        {/* Desktop Navigation */}
        <nav className="hidden lg:flex items-center space-x-1">
          {navigationItems.map((item) => (
            <Link
              key={item.path}
              href={item.path}
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-micro ${
                isActivePath(item.path)
                  ? 'bg-primary text-primary-foreground'
                  : 'text-text-secondary hover:text-foreground hover:bg-muted'
              }`}
            >
              <Icon name={item.icon} size={20} />
              <span className="font-medium">{item.label}</span>
            </Link>
          ))}
        </nav>
        {/* Search Bar */}
        <div className="flex-1 max-w-md mx-4 lg:mx-8">
          <form onSubmit={handleSearchSubmit} className="relative">
            <div className="relative">
              <Icon 
                name="Search" 
                size={20} 
                className="absolute left-3 top-1/2 transform -translate-y-1/2 text-text-secondary" 
              />
              <Input
                type="search"
                placeholder="Search posts, people, ideas..."
                onFocus={handleSearchFocus}
                className="pl-10 pr-4 py-2 w-full border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent cursor-pointer"
                readOnly
              />
            </div>
          </form>
        </div>
        {/* Right Section */}
        <div className="flex items-center space-x-2">
          {/* Theme Switcher */}
          <ThemeSwitcher />
          {/* Mobile Menu Button */}
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleMobileMenu}
            className="lg:hidden"
          >
            <Icon name={showMobileMenu ? "X" : "Menu"} size={24} />
          </Button>
          {/* Profile Menu */}
          <div className="relative">
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleProfileMenu}
              className="w-10 h-10 rounded-full bg-muted hover:bg-secondary/20"
            >
              <Icon name="User" size={20} />
            </Button>
            {/* Profile Dropdown */}
            {showProfileMenu && (
              <div className="absolute right-0 mt-2 w-64 bg-popover border border-border rounded-lg shadow-modal z-1010">
                <div className="p-4 border-b border-border">
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center">
                      <Icon name="User" size={24} color="white" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-foreground">John Doe</h3>
                      <p className="text-sm text-text-secondary">Product Manager</p>
                    </div>
                  </div>
                </div>
                <div className="p-2">
                  <button className="w-full text-left px-3 py-2 text-sm text-foreground hover:bg-muted rounded-md transition-micro" onClick={() => { setShowProfileMenu(false); navigate('/profile'); }}>
                    View Profile
                  </button>
                  <button className="w-full text-left px-3 py-2 text-sm text-foreground hover:bg-muted rounded-md transition-micro" onClick={() => { setShowProfileMenu(false); navigate('/settings'); }}>
                    Settings
                  </button>
                  <hr className="my-2 border-border" />
                  <button className="w-full text-left px-3 py-2 text-sm text-destructive hover:bg-destructive/10 rounded-md transition-micro">
                    Sign Out
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
      {/* Mobile Navigation Menu */}
      {showMobileMenu && (
        <div className="lg:hidden bg-background border-t border-border">
          <nav className="p-4 space-y-2">
            {navigationItems.map((item) => (
              <Link
                key={item.path}
                href={item.path}
                onClick={() => setShowMobileMenu(false)}
                className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-micro ${
                  isActivePath(item.path)
                    ? 'bg-primary text-primary-foreground'
                    : 'text-text-secondary hover:text-foreground hover:bg-muted'
                }`}
              >
                <Icon name={item.icon} size={20} />
                <span className="font-medium">{item.label}</span>
              </Link>
            ))}
          </nav>
        </div>
      )}
    </header>
  );
};

export default Header;