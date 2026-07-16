import React from 'react';
import { Home, BookOpen, Calendar, CheckSquare, Bell, LogOut, Sun, Moon } from 'lucide-react';

export default function Sidebar({ user, activeTab, setActiveTab, unreadNotificationsCount, onLogout, theme, toggleTheme }) {
  // Get user initials for avatar
  const getInitials = (name) => {
    if (!name) return 'U';
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  return (
    <aside className="sidebar">
      <div className="sidebar-brand">
        <div className="avatar" style={{ background: 'var(--accent)' }}>R</div>
        <span className="sidebar-logo">Reflect</span>
      </div>

      <div 
        className="sidebar-profile"
        onClick={() => setActiveTab('profile')}
        style={{ 
          cursor: 'pointer', 
          transition: 'var(--transition-smooth)',
          backgroundColor: activeTab === 'profile' ? 'rgba(124, 58, 237, 0.1)' : 'transparent'
        }}
      >
        <div className="avatar">{getInitials(user?.name)}</div>
        <div className="profile-info">
          <div className="profile-name" title={user?.name}>{user?.name}</div>
          <div className="profile-role" style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <span>{user?.role}</span>
            <span style={{ fontSize: '0.65rem', opacity: 0.6 }}>(Edit)</span>
          </div>
        </div>
      </div>

      <nav className="sidebar-menu">
        <div 
          className={`menu-item ${activeTab === 'home' ? 'active' : ''}`}
          onClick={() => setActiveTab('home')}
        >
          <div className="menu-item-left">
            <Home size={18} />
            <span>Home Summary</span>
          </div>
        </div>

        <div 
          className={`menu-item ${activeTab === 'diary' ? 'active' : ''}`}
          onClick={() => setActiveTab('diary')}
        >
          <div className="menu-item-left">
            <BookOpen size={18} />
            <span>Diary Journal</span>
          </div>
        </div>

        <div 
          className={`menu-item ${activeTab === 'calendar' ? 'active' : ''}`}
          onClick={() => setActiveTab('calendar')}
        >
          <div className="menu-item-left">
            <Calendar size={18} />
            <span>Calendar View</span>
          </div>
        </div>

        <div 
          className={`menu-item ${activeTab === 'todo' ? 'active' : ''}`}
          onClick={() => setActiveTab('todo')}
        >
          <div className="menu-item-left">
            <CheckSquare size={18} />
            <span>To-Do Planner</span>
          </div>
        </div>

        <div 
          className={`menu-item ${activeTab === 'notifications' ? 'active' : ''}`}
          onClick={() => setActiveTab('notifications')}
        >
          <div className="menu-item-left">
            <Bell size={18} />
            <span>Notifications</span>
          </div>
          {unreadNotificationsCount > 0 && (
            <span className="badge">{unreadNotificationsCount}</span>
          )}
        </div>
      </nav>

      <div className="sidebar-footer">
        <div 
          className="menu-item" 
          onClick={toggleTheme}
          style={{ marginBottom: '6px', padding: '10px 16px' }}
        >
          <div className="menu-item-left">
            {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
            <span>{theme === 'dark' ? 'Light Mode' : 'Dark Mode'}</span>
          </div>
        </div>

        <div 
          className="menu-item" 
          onClick={onLogout}
          style={{ color: 'var(--danger)', padding: '10px 16px' }}
        >
          <div className="menu-item-left">
            <LogOut size={18} />
            <span>Log Out</span>
          </div>
        </div>
      </div>
    </aside>
  );
}
