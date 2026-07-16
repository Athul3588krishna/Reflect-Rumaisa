import React, { useState, useEffect } from 'react';
import { User, Mail, ShieldAlert, Key, Check, RefreshCw, Calendar } from 'lucide-react';

const API_URL = 'http://localhost:5000/api';

export default function ProfileModule({ user, onProfileUpdate }) {
  const [name, setName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ text: '', type: '' }); // type: 'success' | 'error'

  useEffect(() => {
    if (user) {
      setName(user.name);
      setEmail(user.email);
    }
  }, [user]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage({ text: '', type: '' });

    if (password && password !== confirmPassword) {
      setMessage({ text: 'Passwords do not match!', type: 'error' });
      return;
    }

    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const payload = { name, email };
      if (password) payload.password = password;

      const res = await fetch(`${API_URL}/auth/profile`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });

      const data = await res.json();
      if (data.success) {
        setMessage({ text: 'Profile updated successfully!', type: 'success' });
        setPassword('');
        setConfirmPassword('');
        
        // Save new user info in localStorage & update App level state
        const updatedUser = { ...user, name: data.user.name, email: data.user.email };
        localStorage.setItem('user', JSON.stringify(updatedUser));
        onProfileUpdate(updatedUser);
      } else {
        setMessage({ text: data.message || 'Failed to update profile.', type: 'error' });
      }
    } catch (err) {
      console.error(err);
      setMessage({ text: 'Server error. Please try again later.', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const getJoinedDate = (dateStr) => {
    if (!dateStr) return 'N/A';
    return new Date(dateStr).toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  };

  return (
    <div className="animate-fade-in" style={{ maxWidth: '600px', margin: '0 auto' }}>
      <div className="content-header" style={{ justifyContent: 'center', marginBottom: '20px' }}>
        <div className="content-title" style={{ textAlign: 'center' }}>
          <h2>Manage Profile</h2>
          <p>Update your personal information and security credentials</p>
        </div>
      </div>

      {message.text && (
        <div 
          className="bento-card"
          style={{
            backgroundColor: message.type === 'success' ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)',
            color: message.type === 'success' ? 'var(--success)' : 'var(--danger)',
            border: `1px solid ${message.type === 'success' ? 'rgba(16, 185, 129, 0.2)' : 'rgba(239, 68, 68, 0.2)'}`,
            padding: '14px 20px',
            borderRadius: '12px',
            fontSize: '0.9rem',
            marginBottom: '24px',
            display: 'flex',
            alignItems: 'center',
            gap: '10px'
          }}
        >
          {message.type === 'success' ? <Check size={18} /> : <ShieldAlert size={18} />}
          <span>{message.text}</span>
        </div>
      )}

      {/* Profile info card */}
      <div className="bento-card" style={{ padding: '30px', marginBottom: '24px' }}>
        <div style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
          <div 
            className="avatar" 
            style={{ 
              width: '64px', 
              height: '64px', 
              fontSize: '1.4rem', 
              background: 'var(--aurora-purple)' 
            }}
          >
            {user?.name ? user.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) : 'U'}
          </div>
          <div>
            <h3 style={{ fontSize: '1.25rem', marginBottom: '4px' }}>{user?.name}</h3>
            <p style={{ color: 'var(--text-sub)', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Calendar size={14} /> Joined {getJoinedDate(user?.createdAt)}
            </p>
          </div>
        </div>
      </div>

      {/* Profile Editor Form */}
      <div className="bento-card" style={{ padding: '30px' }}>
        <form onSubmit={handleSubmit}>
          
          <div className="form-group">
            <label>Name</label>
            <div style={{ position: 'relative' }}>
              <User size={18} style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-sub)' }} />
              <input 
                type="text" 
                className="form-control" 
                style={{ paddingLeft: '48px' }}
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label>Email Address</label>
            <div style={{ position: 'relative' }}>
              <Mail size={18} style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-sub)' }} />
              <input 
                type="email" 
                className="form-control" 
                style={{ paddingLeft: '48px' }}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
          </div>

          <hr style={{ border: 'none', borderTop: '1px solid rgba(255, 255, 255, 0.05)', margin: '30px 0' }} />
          
          <h4 style={{ fontSize: '1rem', marginBottom: '16px', color: 'var(--text-sub)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Change Password
          </h4>

          <div className="form-group">
            <label>New Password (Leave blank to keep current)</label>
            <div style={{ position: 'relative' }}>
              <Key size={18} style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-sub)' }} />
              <input 
                type="password" 
                className="form-control" 
                style={{ paddingLeft: '48px' }}
                placeholder="Enter new password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                minLength={6}
              />
            </div>
          </div>

          <div className="form-group">
            <label>Confirm New Password</label>
            <div style={{ position: 'relative' }}>
              <Key size={18} style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-sub)' }} />
              <input 
                type="password" 
                className="form-control" 
                style={{ paddingLeft: '48px' }}
                placeholder="Confirm new password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                minLength={6}
              />
            </div>
          </div>

          <button 
            type="submit" 
            className="btn btn-primary" 
            style={{ width: '100%', height: '48px', marginTop: '10px' }}
            disabled={loading}
          >
            {loading ? <RefreshCw className="animate-spin" size={18} /> : 'Save Profile Details'}
          </button>

        </form>
      </div>

    </div>
  );
}
