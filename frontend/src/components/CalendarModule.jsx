import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, BookOpen, Music, Video as VideoIcon } from 'lucide-react';

const API_URL = 'http://localhost:5000/api';

export default function CalendarModule() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [monthEntries, setMonthEntries] = useState([]);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedDayEntries, setSelectedDayEntries] = useState([]);
  const [loading, setLoading] = useState(false);

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth(); // 0-indexed

  // Format month query string (YYYY-MM)
  const formatMonthQuery = (dateObj) => {
    const y = dateObj.getFullYear();
    const m = String(dateObj.getMonth() + 1).padStart(2, '0');
    return `${y}-${m}`;
  };

  // Fetch entries written in this month
  const fetchMonthEntries = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const monthStr = formatMonthQuery(currentDate);
      const res = await fetch(`${API_URL}/diary?month=${monthStr}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await res.json();
      if (data.success) {
        setMonthEntries(data.data);
      }
    } catch (error) {
      console.error('Error fetching calendar data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMonthEntries();
  }, [currentDate]);

  // Update selected day's entries whenever the selected date or month entries change
  useEffect(() => {
    const filtered = monthEntries.filter(entry => {
      const entryDate = new Date(entry.date);
      return (
        entryDate.getFullYear() === selectedDate.getFullYear() &&
        entryDate.getMonth() === selectedDate.getMonth() &&
        entryDate.getDate() === selectedDate.getDate()
      );
    });
    setSelectedDayEntries(filtered);
  }, [selectedDate, monthEntries]);

  // Calendar calculations
  const getDaysInMonth = (y, m) => new Date(y, m + 1, 0).getDate();
  const getFirstDayOffset = (y, m) => new Date(y, m, 1).getDay(); // 0 (Sun) to 6 (Sat)

  const daysInMonth = getDaysInMonth(year, month);
  const firstDayOffset = getFirstDayOffset(year, month);

  // Month names
  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const handlePrevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };

  const handleDayClick = (day) => {
    setSelectedDate(new Date(year, month, day));
  };

  // Check if a day has entries
  const dayHasEntry = (day) => {
    return monthEntries.some(entry => {
      const entryDate = new Date(entry.date);
      return entryDate.getDate() === day;
    });
  };

  // Check if day is selected
  const isSelected = (day) => {
    return (
      selectedDate.getFullYear() === year &&
      selectedDate.getMonth() === month &&
      selectedDate.getDate() === day
    );
  };

  // Check if day is today
  const isToday = (day) => {
    const today = new Date();
    return (
      today.getFullYear() === year &&
      today.getMonth() === month &&
      today.getDate() === day
    );
  };

  // Format month and year label
  const monthYearLabel = `${monthNames[month]} ${year}`;

  // Build grid cells
  const dayCells = [];
  // Offset cells
  for (let i = 0; i < firstDayOffset; i++) {
    dayCells.push(<div key={`offset-${i}`} className="calendar-day empty"></div>);
  }
  // Days of month
  for (let day = 1; day <= daysInMonth; day++) {
    const hasEntry = dayHasEntry(day);
    const active = isSelected(day);
    const today = isToday(day);

    dayCells.push(
      <div 
        key={`day-${day}`} 
        className={`calendar-day ${active ? 'active' : ''} ${today ? 'today' : ''}`}
        onClick={() => handleDayClick(day)}
      >
        <span>{day}</span>
        {hasEntry && <span className="calendar-day-dot"></span>}
      </div>
    );
  }

  return (
    <div className="animate-fade-in">
      <div className="content-header">
        <div className="content-title">
          <h2>Calendar View</h2>
          <p>Organize and browse your diary entries by date</p>
        </div>
      </div>

      <div className="calendar-layout">
        {/* Calendar Widget Card */}
        <div className="glass-panel calendar-card">
          <div className="calendar-header">
            <h3>{monthYearLabel}</h3>
            <div style={{ display: 'flex', gap: '8px' }}>
              <button className="btn btn-secondary" style={{ padding: '8px' }} onClick={handlePrevMonth}>
                <ChevronLeft size={16} />
              </button>
              <button className="btn btn-secondary" style={{ padding: '8px' }} onClick={handleNextMonth}>
                <ChevronRight size={16} />
              </button>
            </div>
          </div>

          <div className="calendar-grid">
            <div className="calendar-day-header">Sun</div>
            <div className="calendar-day-header">Mon</div>
            <div className="calendar-day-header">Tue</div>
            <div className="calendar-day-header">Wed</div>
            <div className="calendar-day-header">Thu</div>
            <div className="calendar-day-header">Fri</div>
            <div className="calendar-day-header">Sat</div>
            {dayCells}
          </div>
        </div>

        {/* Date Detail Sidebar */}
        <div className="glass-panel calendar-day-detail-panel">
          <h3 className="date-details-title">
            {selectedDate.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
          </h3>

          <div className="date-details-list">
            {selectedDayEntries.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '40px 20px', color: 'var(--text-secondary)' }}>
                <BookOpen size={36} style={{ color: 'var(--text-muted)', marginBottom: '12px' }} />
                <p style={{ fontSize: '0.85rem' }}>No diary entries written on this day.</p>
              </div>
            ) : (
              selectedDayEntries.map((entry) => (
                <div key={entry._id} className="date-detail-item">
                  <div className="date-detail-title">{entry.title}</div>
                  {entry.content && (
                    <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '6px', lineHeight: '1.4' }}>
                      {entry.content.slice(0, 100)}{entry.content.length > 100 ? '...' : ''}
                    </p>
                  )}

                  {/* Inline Audio player */}
                  {entry.audioUrl && (
                    <div style={{ marginTop: '12px' }}>
                      <span style={{ fontSize: '0.7rem', color: 'var(--accent)', display: 'flex', alignItems: 'center', gap: '4px', marginBottom: '4px' }}>
                        <Music size={12} /> Audio Attachment
                      </span>
                      <audio 
                        src={`http://localhost:5000/${entry.audioUrl}`} 
                        controls 
                        style={{ width: '100%', height: '32px' }} 
                      />
                    </div>
                  )}

                  {/* Inline Video player */}
                  {entry.videoUrl && (
                    <div style={{ marginTop: '12px' }}>
                      <span style={{ fontSize: '0.7rem', color: 'var(--accent)', display: 'flex', alignItems: 'center', gap: '4px', marginBottom: '4px' }}>
                        <VideoIcon size={12} /> Video Attachment
                      </span>
                      <video 
                        src={`http://localhost:5000/${entry.videoUrl}`} 
                        controls 
                        className="media-player" 
                        style={{ maxHeight: '180px' }} 
                      />
                    </div>
                  )}

                  {entry.tags && entry.tags.length > 0 && (
                    <div style={{ display: 'flex', gap: '4px', marginTop: '10px' }}>
                      {entry.tags.map((tag, idx) => (
                        <span key={idx} className="tag" style={{ fontSize: '0.65rem', padding: '1px 6px' }}>#{tag}</span>
                      ))}
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
