import React, { useState, useEffect } from 'react';
import { ArrowLeft } from 'lucide-react';

const API_URL = 'http://localhost:5000/api';

export default function AuthPage({ onLoginSuccess, onBackToHome, isAdminPortal = false }) {
  const [activeTab, setActiveTab] = useState('login'); // 'login' | 'register'
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Prefill admin credentials when in admin portal mode
  useEffect(() => {
    if (isAdminPortal) {
      setEmail('admin@reflect.com');
      setPassword('adminpassword');
      setActiveTab('login');
      setError('');
    } else {
      setEmail('');
      setPassword('');
      setActiveTab('login');
      setError('');
    }
  }, [isAdminPortal]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const endpoint = activeTab === 'login' ? '/auth/login' : '/auth/register';
    const payload = activeTab === 'login' 
      ? { email, password } 
      : { name, email, password };

    try {
      const response = await fetch(`${API_URL}${endpoint}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Something went wrong');
      }

      // Save credentials in local storage
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      
      // Notify parent app of login success
      onLoginSuccess(data.user);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card glass-panel animate-fade-in">
        <button 
          type="button" 
          onClick={onBackToHome}
          style={{
            background: 'none',
            border: 'none',
            color: 'var(--text-secondary)',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            fontSize: '0.85rem',
            marginBottom: '20px',
            padding: 0
          }}
        >
          <ArrowLeft size={16} />
          <span>Back to Home</span>
        </button>

        <div className="auth-header">
          <div className="auth-logo">Reflect</div>
          <div className="auth-subtitle">
            {isAdminPortal ? 'Administrator Portal Sign In' : 'Personal Multimedia Diary & Planner'}
          </div>
        </div>

        {isAdminPortal && (
          <div style={{
            backgroundColor: 'var(--accent-light)', 
            color: 'var(--accent)', 
            padding: '10px 14px', 
            borderRadius: '6px', 
            fontSize: '0.85rem', 
            marginBottom: '20px',
            textAlign: 'center',
            fontWeight: 600,
            border: '1px solid rgba(99, 102, 241, 0.2)'
          }}>
            🔒 Administrator Portal Session
          </div>
        )}

        {!isAdminPortal && (
          <div className="auth-tabs">
            <div 
              className={`auth-tab ${activeTab === 'login' ? 'active' : ''}`}
              onClick={() => { setActiveTab('login'); setError(''); }}
            >
              Sign In
            </div>
            <div 
              className={`auth-tab ${activeTab === 'register' ? 'active' : ''}`}
              onClick={() => { setActiveTab('register'); setError(''); }}
            >
              Create Account
            </div>
          </div>
        )}

        {error && (
          <div style={{
            backgroundColor: 'var(--danger-light)', 
            color: 'var(--danger)', 
            padding: '10px 14px', 
            borderRadius: '6px', 
            fontSize: '0.85rem', 
            marginBottom: '20px',
            border: '1px solid rgba(239, 68, 68, 0.2)'
          }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          {activeTab === 'register' && (
            <div className="form-group">
              <label>Full Name</label>
              <input 
                type="text" 
                className="form-control" 
                placeholder="Enter your name" 
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>
          )}

          <div className="form-group">
            <label>Email Address</label>
            <input 
              type="email" 
              className="form-control" 
              placeholder="name@example.com" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label>Password</label>
            <input 
              type="password" 
              className="form-control" 
              placeholder="••••••••" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
            />
          </div>

          <button 
            type="submit" 
            className="btn btn-primary" 
            style={{ width: '100%', marginTop: '10px', height: '45px' }}
            disabled={loading}
          >
            {loading ? 'Please wait...' : activeTab === 'login' ? 'Sign In' : 'Create Account'}
          </button>
        </form>

        <div className="auth-footer">
          {activeTab === 'login' ? (
            <p>Don't have an account? <span onClick={() => { setActiveTab('register'); setError(''); }}>Sign up</span></p>
          ) : (
            <p>Already have an account? <span onClick={() => { setActiveTab('login'); setError(''); }}>Sign in</span></p>
          )}
        </div>
      </div>
    </div>
  );
}
