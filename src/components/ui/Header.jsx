import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import Icon from '../AppIcon';
import Button from './Button';
import Input from './Input';
import { useAuth } from '../../context/AuthContext';
import { extractUserId } from '@/src/utils/jwt';
import { fetchUserBasic, getAuthToken } from '@/src/utils/api';

const Header = () => {
  const [showProfileMenu, setShowProfileMenu] = React.useState(false);
  const [showMobileMenu, setShowMobileMenu] = React.useState(false);
  const router = useRouter();
  const navigate = router.push;
  const profileRef = React.useRef(null);
  const { isAuthenticated, logout, openAuthModal } = useAuth();
  const [userName, setUserName] = React.useState('');
  const [loadingUser, setLoadingUser] = React.useState(false);

  React.useEffect(() => {
    const handleClickOutside = (e) => {
      if (showProfileMenu && profileRef.current && !profileRef.current.contains(e.target)) {
        setShowProfileMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showProfileMenu]);

  const navigationItems = [
    { label: 'Home', path: '/', icon: 'Home' },
    { label: 'Ideas', path: '/ideas-whiteboard', icon: 'Lightbulb' },
    { label: 'Network', path: '/connection-network-tree', icon: 'Users' },
    { label: 'Questions', path: '/questions', icon: 'HelpCircle' },
  ];

  const isActivePath = (path) => router.pathname === path;

  const toggleProfileMenu = () => setShowProfileMenu(!showProfileMenu);
  const toggleMobileMenu = () => setShowMobileMenu(!showMobileMenu);

  const handleSearchFocus = (e) => {
    e.preventDefault();
    navigate('/search');
  };
  const handleSearchSubmit = (e) => {
    e.preventDefault();
    navigate('/search');
  };

  React.useEffect(() => {
    const token = getAuthToken();
    const uid = extractUserId(token);
    if (!token || !uid) {
      setUserName('');
      return;
    }
    let cancelled = false;
    (async () => {
      try {
        setLoadingUser(true);
        const data = await fetchUserBasic({ userId: uid, token });
        if (!cancelled) setUserName(data?.name || '');
      } catch {
        if (!cancelled) setUserName('');
      } finally {
        if (!cancelled) setLoadingUser(false);
      }
    })();
    return () => { cancelled = true; };
  }, [isAuthenticated]);

  return (
    <header className="fixed top-0 left-0 right-0 bg-background border-b border-border z-1000">
      <div className="flex items-center justify-between h-16 px-4 lg:px-6">
        {/* Left: Hamburger + Logo */}
        <div className="flex items-center gap-2">
          <div className="relative">
            <Button variant="ghost" size="icon" onClick={toggleMobileMenu}>
              <Icon name={showMobileMenu ? 'X' : 'Menu'} size={24} />
            </Button>
          </div>
          <Link href="/" className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <Icon name="Zap" size={20} color="white" />
            </div>
            <span className="text-xl font-semibold text-foreground hidden sm:block">LinkedBoard Pro</span>
          </Link>
        </div>

        {/* Search Bar centered */}
        <div className="flex-1 max-w-md mx-4 lg:mx-8">
          <form onSubmit={handleSearchSubmit} className="relative">
            <div className="relative">
              <Icon name="Search" size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-text-secondary" />
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

        {/* Right: Profile */}
        <div className="flex items-center space-x-2">
          {!isAuthenticated && (
            <>
              <Button variant="secondary" onClick={openAuthModal}>Log In</Button>
            </>
          )}
          <div className="relative" ref={profileRef}>
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleProfileMenu}
              className="w-10 h-10 rounded-full bg-muted hover:bg-secondary/20"
            >
              <Icon name="User" size={20} />
            </Button>
            {showProfileMenu && (
              <div className="absolute right-0 mt-2 w-64 bg-popover border border-border rounded-lg shadow-modal z-1010">
                <div className="p-4 border-b border-border">
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center">
                      <Icon name="User" size={24} color="white" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-foreground">{userName || 'User'}</h3>
                      <p className="text-sm text-text-secondary">{loadingUser ? 'Loading...' : ''}</p>
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
                  {isAuthenticated ? (
                    <button className="w-full text-left px-3 py-2 text-sm text-destructive hover:bg-destructive/10 rounded-md transition-micro" onClick={() => { setShowProfileMenu(false); logout(); }}>
                      Sign Out
                    </button>
                  ) : (
                    <div className="flex items-center justify-between px-2 py-1">
                      <Link href="/login"><Button variant="ghost" size="sm">Log In</Button></Link>
                      <Link href="/register"><Button variant="secondary" size="sm">Sign Up</Button></Link>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Left Sidebar Drawer */}
      {showMobileMenu && (
        <div className="fixed inset-0 z-1000" onClick={() => setShowMobileMenu(false)}>
          <div className="absolute inset-0 bg-black/20" />
          <aside className="absolute left-0 top-0 bottom-0 w-72 bg-background border-r border-border shadow-2xl" onClick={(e)=>e.stopPropagation()}>
            <div className="h-16 flex items-center px-4 border-b border-border">
              <span className="text-lg font-semibold text-foreground">Menu</span>
            </div>
            <nav className="p-2">
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
          </aside>
        </div>
      )}
    </header>
  );
};

export default Header;