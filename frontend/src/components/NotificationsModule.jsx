import React, { useState, useEffect } from 'react';
import { Bell, Check, RefreshCw } from 'lucide-react';

const API_URL = 'http://localhost:5000/api';

export default function NotificationsModule({ onUpdateUnreadCount }) {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchNotifications = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_URL}/notifications`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await res.json();
      if (data.success) {
        setNotifications(data.data);
        
        // Count unread and send up to parent
        const unreadCount = data.data.filter(n => !n.read).length;
        onUpdateUnreadCount(unreadCount);
      }
    } catch (err) {
      console.error('Error fetching notifications:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  const handleMarkAsRead = async (id) => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_URL}/notifications/${id}/read`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await res.json();
      if (data.success) {
        // Optimistically update local state or re-fetch
        fetchNotifications();
      }
    } catch (err) {
      console.error('Error marking read:', err);
    }
  };

  const formatDate = (dateStr) => {
    const options = { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' };
    return new Date(dateStr).toLocaleDateString('en-US', options);
  };

  return (
    <div className="animate-fade-in notifications-panel">
      <div className="content-header" style={{ justifyContent: 'center', marginBottom: '20px' }}>
        <div className="content-title" style={{ textAlign: 'center' }}>
          <h2>Notifications</h2>
          <p>Important system updates, logs, and broadcasts</p>
        </div>
      </div>

      {loading && notifications.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-secondary)' }}>
          <RefreshCw size={24} className="animate-spin" style={{ animation: 'spin 1.5s linear infinite' }} />
        </div>
      ) : notifications.length === 0 ? (
        <div className="glass-panel" style={{ textAlign: 'center', padding: '40px', color: 'var(--text-secondary)' }}>
          <Bell size={36} style={{ color: 'var(--text-muted)', marginBottom: '12px' }} />
          <h3>No Notifications Yet</h3>
          <p style={{ fontSize: '0.85rem', marginTop: '4px' }}>We'll notify you when there's an update.</p>
        </div>
      ) : (
        <div className="notifications-list">
          {notifications.map((notif) => (
            <div 
              key={notif.id} 
              className={`notification-item glass-panel ${!notif.read ? 'unread' : ''} ${notif.isGlobal ? 'global' : ''}`}
            >
              <div className="notification-item-header">
                <span className={`notification-item-tag ${notif.isGlobal ? 'global' : 'personal'}`}>
                  {notif.isGlobal ? 'Broadcast' : 'Personal'}
                </span>
                <span className="notification-item-date">{formatDate(notif.createdAt)}</span>
              </div>
              
              <div className="notification-item-message">
                {notif.message}
              </div>

              {!notif.read && (
                <div className="notification-item-actions">
                  <button 
                    className="btn btn-secondary"
                    style={{ padding: '4px 10px', fontSize: '0.75rem', display: 'flex', gap: '4px' }}
                    onClick={() => handleMarkAsRead(notif.id)}
                  >
                    <Check size={12} />
                    <span>Mark as Read</span>
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
