import React, { useState, useEffect } from 'react';
import { Users, FileText, Music, Video, Send, Trash2, LogOut, RefreshCw, Sun, Moon } from 'lucide-react';

const API_URL = 'http://localhost:5000/api';

export default function AdminPage({ user, onLogout, theme, toggleTheme }) {
  const [stats, setStats] = useState({ totalUsers: 0, totalEntries: 0, audioEntries: 0, videoEntries: 0 });
  const [users, setUsers] = useState([]);
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(false);

  // Send Notification States
  const [notifMessage, setNotifMessage] = useState('');
  const [isGlobal, setIsGlobal] = useState(true);
  const [targetUserId, setTargetUserId] = useState('');
  const [sendingNotif, setSendingNotif] = useState(false);

  const fetchAdminData = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      
      // Fetch Dashboard Stats
      const statsRes = await fetch(`${API_URL}/admin/dashboard`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const statsData = await statsRes.json();
      if (statsData.success) {
        setStats(statsData.data.stats);
      }

      // Fetch User List
      const usersRes = await fetch(`${API_URL}/admin/users`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const usersData = await usersRes.json();
      if (usersData.success) {
        setUsers(usersData.data);
      }

      // Fetch Activities Audit Logs
      const actsRes = await fetch(`${API_URL}/admin/activities`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const actsData = await actsRes.json();
      if (actsData.success) {
        setActivities(actsData.data);
      }
    } catch (err) {
      console.error('Error fetching admin data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdminData();
  }, []);

  const handleDeleteUser = async (id) => {
    if (!window.confirm('WARNING: Deleting this user will remove all their diary entries, todo tasks, and profile. Continue?')) return;
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_URL}/admin/users/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        alert('User removed successfully.');
        fetchAdminData();
      }
    } catch (err) {
      console.error('Error deleting user:', err);
    }
  };

  const handleSendNotification = async (e) => {
    e.preventDefault();
    if (!notifMessage.trim()) return;

    setSendingNotif(true);
    try {
      const token = localStorage.getItem('token');
      const payload = {
        message: notifMessage,
        isGlobal,
        recipientId: isGlobal ? null : targetUserId
      };

      const res = await fetch(`${API_URL}/admin/notifications`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });

      const data = await res.json();
      if (data.success) {
        alert('Notification dispatched successfully!');
        setNotifMessage('');
        setIsGlobal(true);
        setTargetUserId('');
      } else {
        alert(data.message || 'Failed to send');
      }
    } catch (err) {
      console.error('Error sending notification:', err);
    } finally {
      setSendingNotif(false);
    }
  };

  return (
    <div className="animate-fade-in" style={{ padding: '40px', maxWidth: '1400px', margin: '0 auto' }}>
      
      {/* Header */}
      <div className="content-header" style={{ borderBottom: '1px solid var(--glass-border)', paddingBottom: '20px', marginBottom: '30px' }}>
        <div>
          <h1 style={{ fontSize: '2.2rem', fontFamily: 'var(--font-display)', fontWeight: 800 }}>
            Admin Control Center
          </h1>
          <p style={{ color: 'var(--text-secondary)' }}>Welcome back, administrator {user?.name}</p>
        </div>
        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
          <button 
            className="btn btn-secondary" 
            onClick={toggleTheme}
            style={{ padding: '10px' }}
            title="Toggle Theme"
          >
            {theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
          </button>
          <button className="btn btn-secondary" onClick={fetchAdminData} title="Reload stats">
            <RefreshCw size={16} />
          </button>
          <button className="btn btn-danger" onClick={onLogout}>
            <LogOut size={16} />
            <span>Log Out</span>
          </button>
        </div>
      </div>

      {/* Analytics stats cards */}
      <div className="admin-stats-grid">
        <div className="glass-panel stat-card animate-fade-in" style={{ animationDelay: '0.05s' }}>
          <div className="stat-icon-wrapper" style={{ backgroundColor: 'rgba(99, 102, 241, 0.15)', color: 'var(--accent)' }}>
            <Users size={24} />
          </div>
          <div>
            <div className="stat-val">{stats.totalUsers}</div>
            <div className="stat-lbl">Active Users</div>
          </div>
        </div>

        <div className="glass-panel stat-card animate-fade-in" style={{ animationDelay: '0.1s' }}>
          <div className="stat-icon-wrapper" style={{ backgroundColor: 'rgba(16, 185, 129, 0.15)', color: 'var(--success)' }}>
            <FileText size={24} />
          </div>
          <div>
            <div className="stat-val">{stats.totalEntries}</div>
            <div className="stat-lbl">Diary Entries</div>
          </div>
        </div>

        <div className="glass-panel stat-card animate-fade-in" style={{ animationDelay: '0.15s' }}>
          <div className="stat-icon-wrapper" style={{ backgroundColor: 'rgba(236, 72, 153, 0.15)', color: '#ec4899' }}>
            <Music size={24} />
          </div>
          <div>
            <div className="stat-val">{stats.audioEntries}</div>
            <div className="stat-lbl">Audio Logs</div>
          </div>
        </div>

        <div className="glass-panel stat-card animate-fade-in" style={{ animationDelay: '0.2s' }}>
          <div className="stat-icon-wrapper" style={{ backgroundColor: 'rgba(245, 158, 11, 0.15)', color: 'var(--warning)' }}>
            <Video size={24} />
          </div>
          <div>
            <div className="stat-val">{stats.videoEntries}</div>
            <div className="stat-lbl">Video Logs</div>
          </div>
        </div>
      </div>

      {/* Layout panels split */}
      <div className="admin-layout-columns">
        
        {/* User Management and Logs */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>
          
          {/* User management list */}
          <div className="glass-panel admin-table-card">
            <h3>Registered User Accounts</h3>
            {loading && users.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '20px' }}><RefreshCw className="animate-spin" /></div>
            ) : users.length === 0 ? (
              <p style={{ color: 'var(--text-secondary)', fontStyle: 'italic' }}>No users registered yet.</p>
            ) : (
              <div className="admin-table-wrapper">
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>Name</th>
                      <th>Email</th>
                      <th>Registered Date</th>
                      <th style={{ textAlign: 'right' }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map(u => (
                      <tr key={u._id}>
                        <td style={{ fontWeight: 600 }}>{u.name}</td>
                        <td style={{ color: 'var(--text-secondary)' }}>{u.email}</td>
                        <td style={{ color: 'var(--text-muted)' }}>{new Date(u.createdAt).toLocaleDateString()}</td>
                        <td style={{ textAlign: 'right' }}>
                          <button 
                            className="btn btn-danger" 
                            style={{ padding: '6px 12px', fontSize: '0.75rem' }}
                            onClick={() => handleDeleteUser(u._id)}
                          >
                            <Trash2 size={12} />
                            <span>Delete</span>
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Activities Logs audit */}
          <div className="glass-panel admin-table-card">
            <h3>Recent Diary Activities</h3>
            {activities.length === 0 ? (
              <p style={{ color: 'var(--text-secondary)', fontStyle: 'italic' }}>No diary logs recorded on the platform.</p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', maxHeight: '400px', overflowY: 'auto' }}>
                {activities.map(act => (
                  <div key={act._id} className="admin-log-item">
                    <div className="admin-log-header">
                      <span className="admin-log-user">{act.user?.name || 'Deleted User'} ({act.user?.email || 'N/A'})</span>
                      <span>{new Date(act.createdAt).toLocaleString()}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '6px' }}>
                      <span className="admin-log-action">Created journal entry: <b>{act.title}</b></span>
                      <div style={{ display: 'flex', gap: '8px', color: 'var(--text-muted)' }}>
                        {act.audioUrl && <Music size={14} style={{ color: 'var(--accent)' }} />}
                        {act.videoUrl && <Video size={14} style={{ color: 'var(--warning)' }} />}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>

        {/* Compose Notification sidebar card */}
        <div>
          <div className="glass-panel admin-compose-card">
            <h3>Compose Notification</h3>
            <form onSubmit={handleSendNotification}>
              
              <div className="form-group">
                <label>Dispatch Scope</label>
                <div style={{ display: 'flex', gap: '16px', marginTop: '8px' }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                    <input 
                      type="radio" 
                      name="scope" 
                      checked={isGlobal} 
                      onChange={() => setIsGlobal(true)}
                    />
                    <span>Broadcast (All Users)</span>
                  </label>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                    <input 
                      type="radio" 
                      name="scope" 
                      checked={!isGlobal} 
                      onChange={() => setIsGlobal(false)}
                    />
                    <span>Targeted User</span>
                  </label>
                </div>
              </div>

              {!isGlobal && (
                <div className="form-group animate-fade-in">
                  <label>Select Target Recipient</label>
                  <select 
                    className="form-control" 
                    value={targetUserId}
                    onChange={(e) => setTargetUserId(e.target.value)}
                    required={!isGlobal}
                  >
                    <option value="">-- Choose User --</option>
                    {users.map(u => (
                      <option key={u._id} value={u._id}>{u.name} ({u.email})</option>
                    ))}
                  </select>
                </div>
              )}

              <div className="form-group">
                <label>Notification Message</label>
                <textarea 
                  className="form-control" 
                  rows={4}
                  placeholder="Type updates or alert logs here..."
                  value={notifMessage}
                  onChange={(e) => setNotifMessage(e.target.value)}
                  required
                ></textarea>
              </div>

              <button 
                type="submit" 
                className="btn btn-primary" 
                style={{ width: '100%', display: 'flex', gap: '8px' }}
                disabled={sendingNotif}
              >
                <Send size={16} />
                <span>{sendingNotif ? 'Sending...' : 'Send Message'}</span>
              </button>

            </form>
          </div>
        </div>

      </div>

    </div>
  );
}
