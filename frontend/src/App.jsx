import React, { useState, useEffect } from 'react';
import { Home, BookOpen, Calendar, CheckSquare, Bell, Sun, Moon } from 'lucide-react';
import LandingPage from './pages/LandingPage';
import AuthPage from './pages/AuthPage';
import AdminPage from './pages/AdminPage';
import Sidebar from './components/Sidebar';
import HomeModule from './components/HomeModule';
import DiaryModule from './components/DiaryModule';
import CalendarModule from './components/CalendarModule';
import TodoModule from './components/TodoModule';
import NotificationsModule from './components/NotificationsModule';
import ProfileModule from './components/ProfileModule';
import './App.css';

const API_URL = 'http://localhost:5000/api';

export default function App() {
  const [user, setUser] = useState(null);
  const [showAuth, setShowAuth] = useState(false);
  const [activeTab, setActiveTab] = useState('home'); // 'home' | 'diary' | 'calendar' | 'todo' | 'notifications'
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [hash, setHash] = useState(window.location.hash);
  const [theme, setTheme] = useState(localStorage.getItem('theme') || 'dark');

  // Monitor URL Hash changes
  useEffect(() => {
    const handleHashChange = () => {
      setHash(window.location.hash);
    };
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  // Load session from local storage on startup
  useEffect(() => {
    const token = localStorage.getItem('token');
    const storedUser = localStorage.getItem('user');

    if (token && storedUser) {
      setUser(JSON.parse(storedUser));
      fetchUnreadNotificationsCount();
    }
    setLoading(false);
  }, []);

  // Fetch count of unread notifications for regular users
  const fetchUnreadNotificationsCount = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      const res = await fetch(`${API_URL}/notifications`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await res.json();
      if (data.success) {
        const count = data.data.filter(n => !n.read).length;
        setUnreadCount(count);
      }
    } catch (err) {
      console.error('Error getting unread count:', err);
    }
  };

  // Set up periodic notifications check for logged in users
  useEffect(() => {
    if (user && user.role === 'user') {
      fetchUnreadNotificationsCount();
      const interval = setInterval(fetchUnreadNotificationsCount, 20000); // Check every 20s
      return () => clearInterval(interval);
    }
  }, [user]);

  const handleLoginSuccess = (loggedInUser) => {
    setUser(loggedInUser);
    setActiveTab('home');
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    setShowAuth(false);
    window.location.hash = '';
  };

  const handleUpdateUnreadCount = (count) => {
    setUnreadCount(count);
  };

  const toggleTheme = () => {
    const nextTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(nextTheme);
    localStorage.setItem('theme', nextTheme);
  };

  // Synchronize theme state with document.body class
  useEffect(() => {
    if (theme === 'light') {
      document.body.classList.add('light-theme');
    } else {
      document.body.classList.remove('light-theme');
    }
  }, [theme]);

  const renderBackground = () => (
    <div className="aurora-bg">
      <div className="aurora-blob blob-1"></div>
      <div className="aurora-blob blob-2"></div>
      <div className="aurora-blob blob-3"></div>
    </div>
  );

  const themeClass = theme === 'light' ? 'light-theme' : '';

  if (loading) {
    return (
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100vh',
        backgroundColor: 'var(--bg-main)',
        color: 'var(--text-sub)'
      }}>
        <h2>Loading session...</h2>
      </div>
    );
  }

  // Access control check: user logged in but tries to access #admin URL
  if (user && user.role !== 'admin' && hash === '#admin') {
    return (
      <div className={themeClass} style={{ minHeight: '100vh' }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '100vh',
          padding: '20px'
        }}>
          {renderBackground()}
          <div className="bento-card animate-fade-in" style={{ padding: '40px', maxWidth: '450px', textAlign: 'center' }}>
            <h2 style={{ color: '#fb7185', marginBottom: '16px' }}>Access Denied</h2>
            <p style={{ color: 'var(--text-sub)', marginBottom: '24px', fontSize: '0.95rem', lineHeight: '1.5' }}>
              You are currently logged in as a regular user account (**{user.email}**). You do not have permissions to access the Admin Control Center.
            </p>
            <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
              <button className="btn btn-secondary" onClick={() => { window.location.hash = ''; }}>
                Go back to Dashboard
              </button>
              <button className="btn btn-danger" onClick={handleLogout}>
                Switch Account
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Auth/Landing flow redirect
  if (!user) {
    return (
      <div className={themeClass} style={{ minHeight: '100vh' }}>
        {renderBackground()}
        {hash === '#admin' ? (
          <AuthPage 
            onLoginSuccess={handleLoginSuccess} 
            onBackToHome={() => { window.location.hash = ''; }} 
            isAdminPortal={true}
          />
        ) : showAuth ? (
          <AuthPage 
            onLoginSuccess={handleLoginSuccess} 
            onBackToHome={() => setShowAuth(false)} 
          />
        ) : (
          <LandingPage onStart={() => setShowAuth(true)} theme={theme} toggleTheme={toggleTheme} />
        )}
      </div>
    );
  }

  // Admin flow redirect
  if (user.role === 'admin') {
    return (
      <div className={themeClass} style={{ minHeight: '100vh' }}>
        {renderBackground()}
        <AdminPage user={user} onLogout={handleLogout} theme={theme} toggleTheme={toggleTheme} />
      </div>
    );
  }

  // Regular user app workspace
  return (
    <div className={themeClass} style={{ minHeight: '100vh' }}>
      <div className="dashboard-container">
        {renderBackground()}
        
        {/* Mobile top navigation header */}
        <header className="mobile-top-nav">
          <span className="mobile-top-nav-logo" onClick={() => setActiveTab('home')} style={{ cursor: 'pointer' }}>Reflect</span>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            {/* Clickable Mobile Avatar */}
            <div 
              className="avatar" 
              style={{ 
                width: '28px', 
                height: '28px', 
                fontSize: '0.75rem', 
                cursor: 'pointer', 
                border: activeTab === 'profile' ? '2px solid var(--accent)' : '1px solid rgba(255,255,255,0.1)' 
              }}
              onClick={() => setActiveTab('profile')}
            >
              {user?.name ? user.name[0].toUpperCase() : 'U'}
            </div>
            <button 
              onClick={toggleTheme}
              style={{ background: 'none', border: 'none', color: 'var(--text-main)', cursor: 'pointer', display: 'flex', alignItems: 'center' }}
            >
              {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
            </button>
            <button 
              onClick={handleLogout} 
              style={{ background: 'none', border: 'none', color: '#fb7185', cursor: 'pointer', fontSize: '0.85rem', fontWeight: 700 }}
            >
              Log Out
            </button>
          </div>
        </header>

        <Sidebar 
          user={user} 
          activeTab={activeTab} 
          setActiveTab={setActiveTab} 
          unreadNotificationsCount={unreadCount}
          onLogout={handleLogout}
          theme={theme}
          toggleTheme={toggleTheme}
        />

        {/* Mobile bottom navigation bar dock */}
        <nav className="mobile-bottom-dock">
          <div 
            className={`mobile-dock-item ${activeTab === 'home' ? 'active' : ''}`}
            onClick={() => setActiveTab('home')}
          >
            <Home size={20} />
          </div>
          <div 
            className={`mobile-dock-item ${activeTab === 'diary' ? 'active' : ''}`}
            onClick={() => setActiveTab('diary')}
          >
            <BookOpen size={20} />
          </div>
          <div 
            className={`mobile-dock-item ${activeTab === 'calendar' ? 'active' : ''}`}
            onClick={() => setActiveTab('calendar')}
          >
            <Calendar size={20} />
          </div>
          <div 
            className={`mobile-dock-item ${activeTab === 'todo' ? 'active' : ''}`}
            onClick={() => setActiveTab('todo')}
          >
            <CheckSquare size={20} />
          </div>
          <div 
            className={`mobile-dock-item ${activeTab === 'notifications' ? 'active' : ''}`}
            onClick={() => setActiveTab('notifications')}
          >
            <Bell size={20} />
            {unreadCount > 0 && <span className="mobile-badge">{unreadCount}</span>}
          </div>
        </nav>
        
        <main className="main-content">
          {activeTab === 'home' && (
            <HomeModule 
              user={user} 
              setActiveTab={setActiveTab} 
              unreadNotificationsCount={unreadCount} 
            />
          )}
          {activeTab === 'diary' && <DiaryModule />}
          {activeTab === 'calendar' && <CalendarModule />}
          {activeTab === 'todo' && <TodoModule />}
          {activeTab === 'notifications' && (
            <NotificationsModule onUpdateUnreadCount={handleUpdateUnreadCount} />
          )}
          {activeTab === 'profile' && (
            <ProfileModule 
              user={user} 
              onProfileUpdate={(updatedUser) => setUser(updatedUser)} 
            />
          )}
        </main>
      </div>
    </div>
  );
}
