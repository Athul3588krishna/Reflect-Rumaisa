import React, { useState, useEffect } from 'react';
import { BookOpen, Calendar, CheckSquare, Bell, ArrowRight, Quote } from 'lucide-react';

const API_URL = 'http://localhost:5000/api';

export default function HomeModule({ user, setActiveTab, unreadNotificationsCount }) {
  const [diaryCount, setDiaryCount] = useState(0);
  const [pendingTasksCount, setPendingTasksCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardSummary = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) return;

        // Fetch diary count
        const diaryRes = await fetch(`${API_URL}/diary`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const diaryData = await diaryRes.json();
        if (diaryData.success) {
          setDiaryCount(diaryData.count);
        }

        // Fetch todo count
        const todoRes = await fetch(`${API_URL}/todo`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const todoData = await todoRes.json();
        if (todoData.success) {
          const pending = todoData.data.filter(t => t.status === 'pending').length;
          setPendingTasksCount(pending);
        }
      } catch (err) {
        console.error('Error fetching dashboard summary:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardSummary();
  }, []);

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 18) return 'Good Afternoon';
    return 'Good Evening';
  };

  const getQuote = () => {
    const quotes = [
      { text: "Your life is your story. Write it well. Edit often.", author: "Susan Statham" },
      { text: "Journaling is like whispering to one's self and listening at the same time.", author: "Mina Murray" },
      { text: "The secret of getting ahead is getting started.", author: "Mark Twain" },
      { text: "Journal writing is a voyage to the interior.", author: "Christina Baldwin" }
    ];
    // Simple pseudo-random quote based on today's date
    const idx = new Date().getDate() % quotes.length;
    return quotes[idx];
  };

  const quote = getQuote();

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>
      
      {/* Greeting Banner */}
      <div 
        className="glass-panel" 
        style={{ 
          padding: '40px', 
          background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.25) 0%, rgba(16, 185, 129, 0.1) 100%)',
          border: '1px solid rgba(255, 255, 255, 0.08)'
        }}
      >
        <h2 style={{ fontSize: '2.2rem', fontWeight: 800, fontFamily: 'var(--font-display)', marginBottom: '8px' }}>
          {getGreeting()}, {user?.name || (user?.email ? user.email.split('@')[0] : 'User')}!
        </h2>
        <p style={{ color: 'var(--text-secondary)', fontSize: '1rem', maxWidth: '600px' }}>
          Welcome back to Reflect. Today is a brand new page to capture your thoughts, record memories, and organize your tasks.
        </p>
      </div>

      {/* Quote of the Day */}
      <div className="glass-panel" style={{ padding: '24px', display: 'flex', gap: '16px', alignItems: 'flex-start' }}>
        <Quote size={28} style={{ color: 'var(--accent)', flexShrink: 0, marginTop: '4px' }} />
        <div>
          <p style={{ fontStyle: 'italic', fontSize: '1.05rem', color: 'var(--text-primary)', marginBottom: '6px', lineHeight: '1.6' }}>
            "{quote.text}"
          </p>
          <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: 500 }}>— {quote.author}</span>
        </div>
      </div>

      {/* Stats Summary Grid */}
      <div className="admin-stats-grid" style={{ marginBottom: '0px' }}>
        
        <div className="glass-panel stat-card" style={{ cursor: 'pointer' }} onClick={() => setActiveTab('diary')}>
          <div className="stat-icon-wrapper" style={{ backgroundColor: 'rgba(99, 102, 241, 0.15)', color: 'var(--accent)' }}>
            <BookOpen size={24} />
          </div>
          <div>
            <div className="stat-val">{loading ? '...' : diaryCount}</div>
            <div className="stat-lbl">Diary Entries Written</div>
          </div>
        </div>

        <div className="glass-panel stat-card" style={{ cursor: 'pointer' }} onClick={() => setActiveTab('todo')}>
          <div className="stat-icon-wrapper" style={{ backgroundColor: 'rgba(16, 185, 129, 0.15)', color: 'var(--success)' }}>
            <CheckSquare size={24} />
          </div>
          <div>
            <div className="stat-val">{loading ? '...' : pendingTasksCount}</div>
            <div className="stat-lbl">Pending Tasks</div>
          </div>
        </div>

        <div className="glass-panel stat-card" style={{ cursor: 'pointer' }} onClick={() => setActiveTab('notifications')}>
          <div className="stat-icon-wrapper" style={{ backgroundColor: 'rgba(239, 68, 68, 0.1)', color: 'var(--danger)' }}>
            <Bell size={24} />
          </div>
          <div>
            <div className="stat-val">{unreadNotificationsCount}</div>
            <div className="stat-lbl">Unread Notifications</div>
          </div>
        </div>

      </div>

      {/* Quick Action Shortcuts */}
      <div>
        <h3 style={{ fontSize: '1.3rem', marginBottom: '16px' }}>Quick Actions</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px' }}>
          
          <div 
            className="glass-panel" 
            style={{ padding: '24px', cursor: 'pointer', transition: 'var(--transition-smooth)' }}
            onClick={() => setActiveTab('diary')}
            onMouseEnter={(e) => e.currentTarget.style.borderColor = 'var(--accent)'}
            onMouseLeave={(e) => e.currentTarget.style.borderColor = 'var(--glass-border)'}
          >
            <h4 style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
              <span>Write in Diary</span>
              <ArrowRight size={16} style={{ color: 'var(--accent)' }} />
            </h4>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
              Add a new text log, or record direct audio/video journals.
            </p>
          </div>

          <div 
            className="glass-panel" 
            style={{ padding: '24px', cursor: 'pointer', transition: 'var(--transition-smooth)' }}
            onClick={() => setActiveTab('calendar')}
            onMouseEnter={(e) => e.currentTarget.style.borderColor = 'var(--accent)'}
            onMouseLeave={(e) => e.currentTarget.style.borderColor = 'var(--glass-border)'}
          >
            <h4 style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
              <span>Browse Calendar</span>
              <ArrowRight size={16} style={{ color: 'var(--accent)' }} />
            </h4>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
              Browse your timeline history and view entries by date.
            </p>
          </div>

          <div 
            className="glass-panel" 
            style={{ padding: '24px', cursor: 'pointer', transition: 'var(--transition-smooth)' }}
            onClick={() => setActiveTab('todo')}
            onMouseEnter={(e) => e.currentTarget.style.borderColor = 'var(--accent)'}
            onMouseLeave={(e) => e.currentTarget.style.borderColor = 'var(--glass-border)'}
          >
            <h4 style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
              <span>Manage To-Do List</span>
              <ArrowRight size={16} style={{ color: 'var(--accent)' }} />
            </h4>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
              Check your actions for the day or list new goals.
            </p>
          </div>

        </div>
      </div>

    </div>
  );
}
