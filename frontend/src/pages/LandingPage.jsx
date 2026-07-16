import React from 'react';
import { BookOpen, Calendar, CheckSquare, Shield, Play, Mic, Video, Sparkles, Sun, Moon } from 'lucide-react';

export default function LandingPage({ onStart, theme, toggleTheme }) {
  return (
    <div className="animate-fade-in" style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      
      {/* Header navbar */}
      <header 
        style={{ 
          padding: '20px 40px', 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          borderBottom: '1px solid var(--glass-border)',
          background: 'rgba(11, 15, 25, 0.8)',
          backdropFilter: 'blur(10px)',
          position: 'sticky',
          top: 0,
          zIndex: 1000
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div className="avatar" style={{ background: 'var(--accent)', width: '36px', height: '36px', fontSize: '0.9rem' }}>R</div>
          <span style={{ fontSize: '1.4rem', fontWeight: 800, fontFamily: 'var(--font-display)', letterSpacing: '-0.02em' }}>
            Reflect
          </span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <button 
            onClick={toggleTheme}
            style={{ background: 'none', border: 'none', color: 'var(--text-main)', cursor: 'pointer', display: 'flex', alignItems: 'center', padding: '6px' }}
          >
            {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
          </button>
          <button className="btn btn-secondary" onClick={onStart}>
            Sign In
          </button>
        </div>
      </header>

      {/* Hero Section */}
      <section 
        style={{ 
          flexGrow: 1, 
          display: 'flex', 
          flexDirection: 'column', 
          alignItems: 'center', 
          justifyContent: 'center', 
          padding: '80px 20px', 
          textAlign: 'center',
          background: 'radial-gradient(circle at 50% 30%, rgba(99, 102, 241, 0.18) 0%, transparent 60%)'
        }}
      >
        <div 
          style={{ 
            display: 'inline-flex', 
            alignItems: 'center', 
            gap: '8px', 
            backgroundColor: 'var(--accent-light)', 
            color: 'var(--accent)', 
            padding: '6px 14px', 
            borderRadius: '20px', 
            fontSize: '0.85rem', 
            fontWeight: 600,
            marginBottom: '24px'
          }}
        >
          <Sparkles size={14} />
          <span>Capture Every Memory</span>
        </div>
        <h1 
          style={{ 
            fontSize: '3.6rem', 
            fontWeight: 800, 
            fontFamily: 'var(--font-display)', 
            lineHeight: '1.15', 
            letterSpacing: '-0.03em', 
            maxWidth: '850px',
            marginBottom: '20px',
            background: 'linear-gradient(135deg, var(--text-primary) 30%, var(--text-secondary) 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent'
          }}
        >
          Your Personal Space for Thoughts, Audio, and Video.
        </h1>
        <p 
          style={{ 
            fontSize: '1.15rem', 
            color: 'var(--text-secondary)', 
            maxWidth: '620px', 
            lineHeight: '1.6', 
            marginBottom: '36px' 
          }}
        >
          A secure, modern full-stack diary and planner built to preserve your daily experiences with text, audio recording, and video logs.
        </p>
        <div style={{ display: 'flex', gap: '16px' }}>
          <button className="btn btn-primary" style={{ padding: '14px 28px', fontSize: '1rem' }} onClick={onStart}>
            Get Started Free
          </button>
        </div>
      </section>

      {/* Features Grid Section */}
      <section 
        style={{ 
          padding: '80px 40px', 
          maxWidth: '1200px', 
          margin: '0 auto', 
          width: '100%',
          borderTop: '1px solid var(--glass-border)'
        }}
      >
        <h2 
          style={{ 
            textAlign: 'center', 
            fontSize: '2.2rem', 
            fontWeight: 800, 
            fontFamily: 'var(--font-display)', 
            marginBottom: '50px' 
          }}
        >
          Designed for Modern Journaling
        </h2>
        
        <div 
          style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', 
            gap: '30px' 
          }}
        >
          {/* Card 1 */}
          <div className="glass-panel" style={{ padding: '30px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{ width: '48px', height: '48px', borderRadius: '10px', backgroundColor: 'var(--accent-light)', color: 'var(--accent)', display: 'flex', alignItems: 'center', justify: 'center', alignSelf: 'flex-start', justifyContent: 'center' }}>
              <BookOpen size={22} />
            </div>
            <h3 style={{ fontSize: '1.25rem' }}>Multimedia Diary</h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', lineHeight: '1.6' }}>
              Write traditional journals or record logs using your microphone and webcam. Supports file attachment uploads.
            </p>
          </div>

          {/* Card 2 */}
          <div className="glass-panel" style={{ padding: '30px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{ width: '48px', height: '48px', borderRadius: '10px', backgroundColor: 'rgba(16, 185, 129, 0.15)', color: 'var(--success)', display: 'flex', alignItems: 'center', justify: 'center', alignSelf: 'flex-start', justifyContent: 'center' }}>
              <Calendar size={22} />
            </div>
            <h3 style={{ fontSize: '1.25rem' }}>Calendar Navigation</h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', lineHeight: '1.6' }}>
              Navigate through your diary history with an interactive monthly calendar. Search tags and filter by dates.
            </p>
          </div>

          {/* Card 3 */}
          <div className="glass-panel" style={{ padding: '30px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{ width: '48px', height: '48px', borderRadius: '10px', backgroundColor: 'rgba(245, 158, 11, 0.15)', color: 'var(--warning)', display: 'flex', alignItems: 'center', justify: 'center', alignSelf: 'flex-start', justifyContent: 'center' }}>
              <CheckSquare size={22} />
            </div>
            <h3 style={{ fontSize: '1.25rem' }}>To-Do Planner</h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', lineHeight: '1.6' }}>
              List your actions, set completion deadlines, and manage your daily goals with our integrated task manager.
            </p>
          </div>

          {/* Card 4 */}
          <div className="glass-panel" style={{ padding: '30px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{ width: '48px', height: '48px', borderRadius: '10px', backgroundColor: 'rgba(239, 68, 68, 0.1)', color: 'var(--danger)', display: 'flex', alignItems: 'center', justify: 'center', alignSelf: 'flex-start', justifyContent: 'center' }}>
              <Shield size={22} />
            </div>
            <h3 style={{ fontSize: '1.25rem' }}>Secure Storage</h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', lineHeight: '1.6' }}>
              Your data is completely private. Enjoy secure login sessions and isolated user databases protected by encryption.
            </p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer 
        style={{ 
          padding: '30px 40px', 
          textAlign: 'center', 
          borderTop: '1px solid var(--glass-border)', 
          color: 'var(--text-muted)', 
          fontSize: '0.85rem',
          marginTop: 'auto'
        }}
      >
        © {new Date().getFullYear()} Reflect Diary. All rights reserved. Built with the MERN Stack.
      </footer>

    </div>
  );
}
