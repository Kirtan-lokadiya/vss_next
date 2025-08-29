import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import Icon from '../AppIcon';
import Button from './Button';
import Input from './Input';
import { useAuth } from '../../context/AuthContext';
import { extractUserId } from '@/src/utils/jwt';
import { fetchUserBasic, getAuthToken } from '@/src/utils/api';
import { fetchNotifications, acceptConnection, rejectConnection, getConnectionCount } from '@/src/utils/api';
import { useToast } from '@/src/context/ToastContext';

const USER_BASIC_CACHE_KEY = 'user_basic_v1';

const Header = () => {
  const [showProfileMenu, setShowProfileMenu] = React.useState(false);
  const [showMobileMenu, setShowMobileMenu] = React.useState(false);
  const router = useRouter();
  const navigate = router.push;
  const profileRef = React.useRef(null);
  const { isAuthenticated, logout, openAuthModal } = useAuth();
  const [userName, setUserName] = React.useState('');
  const [userPicture, setUserPicture] = React.useState('');
  const [loadingUser, setLoadingUser] = React.useState(false);
  const [showNotifs, setShowNotifs] = React.useState(false);
  const [notifications, setNotifications] = React.useState([]);
  const [unreadIds, setUnreadIds] = React.useState(new Set());
  const [connectionCount, setConnectionCount] = React.useState(0);
  const { showToast } = useToast();
  const notifRef = React.useRef(null);

  React.useEffect(() => {
    const handleClickOutside = (e) => {
      if (showProfileMenu && profileRef.current && !profileRef.current.contains(e.target)) {
        setShowProfileMenu(false);
      }
      if (showNotifs && notifRef.current && !notifRef.current.contains(e.target)) {
        setShowNotifs(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showProfileMenu, showNotifs]);

  // Poll notifications every 5 minutes
  React.useEffect(() => {
    let timer;
    const load = async () => {
      try {
        const token = getAuthToken();
        if (!token) return;
        const list = await fetchNotifications({ token });
        setNotifications(list);
        // update unread by adding new ids
        setUnreadIds((prev) => {
          const s = new Set(prev);
          for (const n of list) if (!s.has(n.id)) s.add(n.id);
          return s;
        });
      } catch {}
    };
    load();
    timer = window.setInterval(load, 5 * 60 * 1000);
    return () => timer && window.clearInterval(timer);
  }, [isAuthenticated]);

  const navigationItems = [
    { label: 'Home', path: '/', icon: 'Home' },
    { label: 'Ideas', path: '/ideas-whiteboard', icon: 'Lightbulb' },
    { label: 'Network', path: '/connection-network-tree', icon: 'Users' },
    { label: 'Messages', path: '/messages', icon: 'MessageCircle' },
    { label: 'Questions', path: '/questions', icon: 'HelpCircle' },
    { label: 'Liked', path: '/?filter=liked', icon: 'ThumbsUp' },
    { label: 'Saved', path: '/?filter=saved', icon: 'Bookmark' },
  ];

  const isActiveFilter = (filterName) => {
    return router.pathname === '/' && router.query.filter === filterName;
  };

  const isActivePath = (path) => {
    if (path === '/') return router.pathname === '/' && !router.query.filter;
    return router.pathname === path;
  };

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
      setConnectionCount(0);
      return;
    }

    let cancelled = false;

    const updateConnectionCount = async () => {
      try {
        const cnt = await getConnectionCount({ userId: uid, token });
        if (!cancelled) setConnectionCount(cnt || 0);
      } catch {}
    };

    // Try cache first to avoid fetch on every page navigation
    try {
      const cached = typeof window !== 'undefined' ? sessionStorage.getItem(USER_BASIC_CACHE_KEY) : null;
      if (cached) {
        const parsed = JSON.parse(cached);
        if (parsed && parsed.userId === uid && parsed.name) {
          setUserName(parsed.name);
          setUserPicture(parsed.picture && parsed.picture !== 'None' ? parsed.picture : '');
          // fetch count in background
          updateConnectionCount();
          return; // cache hit; skip fetch
        }
      }
    } catch {}

    (async () => {
      try {
        setLoadingUser(true);
        const data = await fetchUserBasic({ userId: uid, token });
        if (!cancelled) {
          setUserName(data?.name || '');
          setUserPicture(data?.picture && data.picture !== 'None' ? data.picture : '');
          try {
            sessionStorage.setItem(USER_BASIC_CACHE_KEY, JSON.stringify({ userId: uid, name: data?.name || '', picture: data?.picture || '' }));
          } catch {}
          // update count after setting name
          await updateConnectionCount();
        }
      } catch {
        if (!cancelled) setUserName('');
      } finally {
        if (!cancelled) setLoadingUser(false);
      }
    })();
    return () => { cancelled = true; };
  }, [isAuthenticated]);

  return (
    <header className="fixed top-0 left-0 right-0 bg-background border-b border-border z-[9999]">
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
            <span className="text-xl font-semibold text-foreground hidden sm:block">VSS</span>
          </Link>
        </div>

        {/* Search Bar centered */}
        <div className="flex-1 flex justify-center max-w-2xl mx-auto">
          <div className="relative w-full max-w-lg">
            <input
              type="text"
              placeholder="Search"
              className="w-full h-10 pl-4 pr-12 bg-muted border border-gray-600 hover:border-gray-400 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-colors"
              onFocus={() => navigate('/search')}
            />
            <button
              className="absolute right-3 top-1/2 -translate-y-1/2 p-1 hover:bg-gray-200 rounded-full transition-colors"
              onClick={() => navigate('/search')}
            >
              <Icon name="Search" size={16} className="text-text-secondary" />
            </button>
          </div>
        </div>

        {/* Right: Profile */}
        <div className="flex items-center space-x-2">
          <div className="relative" ref={notifRef}>
            <button 
              className="w-10 h-10 rounded-full bg-gray-400 border-2 border-gray-400 hover:bg-gray-600 hover:border-blue-300 flex items-center justify-center transition-colors group"
              onClick={async () => {
                setShowNotifs((s)=>!s);
                if (!showNotifs) {
                  try {
                    const token = getAuthToken();
                    const list = await fetchNotifications({ token });
                    setNotifications(Array.isArray(list) ? list : []);
                    // Mark as read when opening
                    setUnreadIds(new Set());
                  } catch {}
                }
              }}
            >
              <Icon name="Bell" size={20} className="text-gray-600 group-hover:text-white" />
            </button>
            {unreadIds.size > 0 && (
              <span className="absolute -top-1 -right-1 bg-destructive text-white text-[10px] leading-none px-1.5 py-0.5 rounded-full">
                {unreadIds.size}
              </span>
            )}
            {showNotifs && (
              <div className="absolute right-0 mt-2 w-80 bg-card border border-border rounded-lg shadow-modal z-[10000]">
                <div className="p-3 border-b border-border font-semibold text-sm">Notifications</div>
                <div className="max-h-80 overflow-auto">
                  {notifications.length === 0 ? (
                    <div className="p-4 text-sm text-text-secondary">No notifications</div>
                  ) : notifications.map((n) => (
                    <div key={n.id} className="p-3 border-b border-border text-sm flex items-start gap-2">
                      <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center">
                        <Icon name="User" size={14} />
                      </div>
                      <div>
                        <div className="font-medium">{n.username}</div>
                        <div className="text-text-secondary">{n.type === 'CONNECTION_REQUEST' ? 'Connection request' : n.type}</div>
                        {n.content && <div className="text-xs mt-1">{n.content}</div>}
                        {n.type === 'CONNECTION_REQUEST' && (
                          <div className="flex gap-2 mt-2">
                            <Button size="sm" variant="default" onClick={async ()=>{
                              try {
                                const token = getAuthToken();
                                await acceptConnection({ targetUserId: n.userId, token });
                                setNotifications(prev => prev.filter(x => x.id !== n.id));
                                showToast('Connection accepted', 'success');
                              } catch (e) { showToast(e?.message || 'Failed to accept', 'error'); }
                            }}>Accept</Button>
                            <Button size="sm" variant="outline" onClick={async ()=>{
                              try {
                                const token = getAuthToken();
                                await rejectConnection({ targetUserId: n.userId, token });
                                setNotifications(prev => prev.filter(x => x.id !== n.id));
                                showToast('Connection rejected', 'success');
                              } catch (e) { showToast(e?.message || 'Failed to reject', 'error'); }
                            }}>Reject</Button>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
          {!isAuthenticated && (
            <>
              <Button variant="secondary" onClick={openAuthModal}>Log In</Button>
            </>
          )}
          <div className="relative" ref={profileRef}>
            <button
              onClick={toggleProfileMenu}
              className="w-10 h-10 rounded-full border-2 border-transparent hover:border-gray-600 transition-colors"
            >
              <div className={`w-full h-full rounded-full flex items-center justify-center text-white font-semibold ${
                (userName?.charCodeAt(0) || 0) % 2 === 0 ? 'bg-indigo-500' : 'bg-teal-500'
              }`}>
                {userName ? userName.charAt(0).toUpperCase() : 'U'}
              </div>
            </button>
            {showProfileMenu && (
              <div className="absolute right-0 mt-2 w-64 bg-popover border border-border rounded-lg shadow-modal z-[10000]">
                <div className="p-4 border-b border-border">
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center">
                      <Icon name="User" size={24} color="white" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-foreground">{userName || 'User'}</h3>
                      <p className="text-sm text-text-secondary">{loadingUser ? 'Loading...' : `${connectionCount} connections`}</p>
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
                    (item.path.includes('filter=') ? isActiveFilter(item.path.split('=')[1]) : isActivePath(item.path))
                      ? 'bg-primary text-primary-foreground'
                      : 'text-text-secondary hover:text-foreground hover:bg-muted'
                  }`}
                >
                  <Icon name={item.icon} size={20} />
                  <span className="font-medium">{item.label}</span>
                </Link>
              ))}
              <button
                onClick={() => { setShowMobileMenu(false); navigate('/search'); }}
                className="flex items-center space-x-3 px-4 py-3 rounded-lg transition-micro text-text-secondary hover:text-foreground hover:bg-muted w-full"
              >
                <Icon name="Search" size={20} />
                <span className="font-medium">Private search</span>
              </button>
            </nav>
          </aside>
        </div>
      )}
    </header>
  );
};

export default Header;