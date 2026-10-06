import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import {
  Plus,
  Trash2,
  CheckCircle2,
  Circle,
  RefreshCw,
  Calendar,
  Clock,
  Image as ImageIcon,
  Video as VideoIcon,
  Music,
  FileText,
  Paperclip,
  X,
  Eye,
  Download,
  Edit3,
  AlertCircle,
  Search,
  Filter,
  Check,
  ExternalLink
} from 'lucide-react';

const API_URL = 'http://localhost:5000/api';
const BACKEND_BASE = 'http://localhost:5000';

export default function TodoModule() {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Composer mode: 'text' or 'media'
  const [activeTab, setActiveTab] = useState('text'); // 'text' | 'media'

  // Composer fields
  const [title, setTitle] = useState('');
  const [details, setDetails] = useState('');
  const [taskDate, setTaskDate] = useState(new Date().toISOString().split('T')[0]);
  const [dueDate, setDueDate] = useState('');

  // Media upload in composer
  const [mediaFile, setMediaFile] = useState(null);
  const [mediaPreview, setMediaPreview] = useState(null);
  const [mediaType, setMediaType] = useState(null);
  const fileInputRef = useRef(null);

  // Filter & Search states
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all'); // 'all' | 'pending' | 'completed' | 'media' | 'text'

  // Edit Modal states
  const [editingTask, setEditingTask] = useState(null);
  const [editTitle, setEditTitle] = useState('');
  const [editDetails, setEditDetails] = useState('');
  const [editTaskDate, setEditTaskDate] = useState('');
  const [editDueDate, setEditDueDate] = useState('');
  const [editMediaFile, setEditMediaFile] = useState(null);
  const [editMediaPreview, setEditMediaPreview] = useState(null);
  const [removeExistingMedia, setRemoveExistingMedia] = useState(false);
  const editFileInputRef = useRef(null);

  // Lightbox Modal state for full image preview
  const [lightboxImage, setLightboxImage] = useState(null);

  // Fetch tasks
  const fetchTasks = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_URL}/todo`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (res.status === 401) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.reload();
        return;
      }
      const data = await res.json();
      if (data.success) {
        setTasks(data.data);
      }
    } catch (err) {
      console.error('Error fetching tasks:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, []);

  // Handle media selection in composer
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setMediaFile(file);

    // Determine type
    const mime = file.type || '';
    let type = 'document';
    if (mime.startsWith('image/')) type = 'image';
    else if (mime.startsWith('audio/')) type = 'audio';
    else if (mime.startsWith('video/')) type = 'video';
    setMediaType(type);

    // Create preview
    if (type === 'image' || type === 'video' || type === 'audio') {
      setMediaPreview(URL.createObjectURL(file));
    } else {
      setMediaPreview(null);
    }

    // Auto-fill title if currently empty
    if (!title.trim()) {
      setTitle(file.name);
    }
  };

  const handleClearMedia = () => {
    setMediaFile(null);
    setMediaPreview(null);
    setMediaType(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Add task handler
  const handleAddTask = async (e) => {
    e.preventDefault();

    if (!title.trim()) {
      alert('Please enter a task title');
      return;
    }

    if (!details.trim()) {
      alert('Please enter task details and notes');
      return;
    }

    if (!taskDate) {
      alert('Please select a task date');
      return;
    }

    if (!dueDate) {
      alert('Please select a due date');
      return;
    }

    const tDate = new Date(taskDate);
    const dDate = new Date(dueDate);
    tDate.setHours(0, 0, 0, 0);
    dDate.setHours(0, 0, 0, 0);

    if (dDate < tDate) {
      alert('Due date cannot be earlier than task date');
      return;
    }

    if (activeTab === 'media' && !mediaFile) {
      alert('Please attach a media file for Media Task');
      return;
    }

    setSubmitting(true);
    try {
      const token = localStorage.getItem('token');
      const formData = new FormData();
      formData.append('title', title.trim());
      formData.append('details', details.trim());
      formData.append('taskDate', taskDate);
      formData.append('dueDate', dueDate);
      if (mediaFile) {
        formData.append('media', mediaFile);
      }

      const res = await fetch(`${API_URL}/todo`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });

      const data = await res.json();
      if (data.success) {
        setTitle('');
        setDetails('');
        setDueDate('');
        setTaskDate(new Date().toISOString().split('T')[0]);
        handleClearMedia();
        fetchTasks();
      } else {
        alert(data.message || 'Failed to create task');
      }
    } catch (err) {
      console.error('Error adding task:', err);
      alert('Network error while adding task.');
    } finally {
      setSubmitting(false);
    }
  };

  // Toggle task status
  const handleToggleTask = async (id, currentStatus) => {
    const nextStatus = currentStatus === 'pending' ? 'completed' : 'pending';
    // Optimistic UI update
    setTasks(prev => prev.map(t => t._id === id ? { ...t, status: nextStatus } : t));

    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_URL}/todo/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ status: nextStatus })
      });

      const data = await res.json();
      if (!data.success) {
        fetchTasks();
      }
    } catch (err) {
      console.error('Error toggling task:', err);
      fetchTasks();
    }
  };

  // Delete task
  const handleDeleteTask = async (id) => {
    if (!window.confirm('Are you sure you want to delete this task?')) return;
    setTasks(prev => prev.filter(t => t._id !== id));

    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_URL}/todo/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await res.json();
      if (!data.success) {
        fetchTasks();
      }
    } catch (err) {
      console.error('Error deleting task:', err);
      fetchTasks();
    }
  };

  // Open Edit Modal
  const handleOpenEdit = (task) => {
    setEditingTask(task);
    setEditTitle(task.title || '');
    setEditDetails(task.details || '');
    setEditTaskDate(task.taskDate ? new Date(task.taskDate).toISOString().split('T')[0] : '');
    setEditDueDate(task.dueDate ? new Date(task.dueDate).toISOString().split('T')[0] : '');
    setEditMediaFile(null);
    setEditMediaPreview(null);
    setRemoveExistingMedia(false);
  };

  // Submit Edit Modal
  const handleSaveEdit = async (e) => {
    e.preventDefault();
    if (!editingTask) return;

    if (!editTitle.trim()) {
      alert('Please enter a task title');
      return;
    }

    if (!editDetails.trim()) {
      alert('Please enter task details and notes');
      return;
    }

    if (!editTaskDate) {
      alert('Please select a task date');
      return;
    }

    if (!editDueDate) {
      alert('Please select a due date');
      return;
    }

    const tDate = new Date(editTaskDate);
    const dDate = new Date(editDueDate);
    tDate.setHours(0, 0, 0, 0);
    dDate.setHours(0, 0, 0, 0);

    if (dDate < tDate) {
      alert('Due date cannot be earlier than task date');
      return;
    }

    setSubmitting(true);
    try {
      const token = localStorage.getItem('token');
      const formData = new FormData();
      formData.append('title', editTitle.trim());
      formData.append('details', editDetails.trim());
      formData.append('taskDate', editTaskDate);
      formData.append('dueDate', editDueDate);
      if (removeExistingMedia) {
        formData.append('removeMedia', 'true');
      }
      if (editMediaFile) {
        formData.append('media', editMediaFile);
      }

      const res = await fetch(`${API_URL}/todo/${editingTask._id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });

      const data = await res.json();
      if (data.success) {
        setEditingTask(null);
        fetchTasks();
      } else {
        alert(data.message || 'Failed to update task');
      }
    } catch (err) {
      console.error('Error updating task:', err);
      alert('Failed to update task.');
    } finally {
      setSubmitting(false);
    }
  };

  // Helper to format media URL
  const formatMediaUrl = (path) => {
    if (!path) return '';
    if (path.startsWith('http://') || path.startsWith('https://')) return path;
    return `${BACKEND_BASE}/${path.replace(/^\/+/, '')}`;
  };

  // Helper to format Date
  const formatTaskDate = (dateStr) => {
    if (!dateStr) return null;
    const dateObj = new Date(dateStr);
    return dateObj.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  // Helper to format Created Time
  const formatCreatedTime = (dateStr) => {
    if (!dateStr) return '';
    const dateObj = new Date(dateStr);
    return dateObj.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Helper to evaluate due date status
  const evaluateDueDate = (dueDateStr, status) => {
    if (!dueDateStr) return null;
    const due = new Date(dueDateStr);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const dueDay = new Date(due);
    dueDay.setHours(0, 0, 0, 0);

    const formatted = due.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });

    const isPending = status === 'pending';
    const isOverdue = isPending && dueDay < today;
    const isToday = isPending && dueDay.getTime() === today.getTime();

    return {
      text: formatted,
      isOverdue,
      isToday,
      className: isOverdue ? 'overdue' : isToday ? 'today' : 'normal'
    };
  };

  // Helper to format file size
  const formatFileSize = (bytes) => {
    if (!bytes) return '';
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  // Stats
  const totalCount = tasks.length;
  const pendingCount = tasks.filter(t => t.status === 'pending').length;
  const completedCount = tasks.filter(t => t.status === 'completed').length;
  const mediaCount = tasks.filter(t => t.mediaUrl).length;

  // Filter tasks
  const filteredTasks = tasks.filter(task => {
    // Search query match (in title, details, or original media name)
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchTitle = task.title && task.title.toLowerCase().includes(q);
      const matchDetails = task.details && task.details.toLowerCase().includes(q);
      const matchFile = task.mediaOriginalName && task.mediaOriginalName.toLowerCase().includes(q);
      if (!matchTitle && !matchDetails && !matchFile) return false;
    }

    // Status / Type filter
    if (statusFilter === 'pending') return task.status === 'pending';
    if (statusFilter === 'completed') return task.status === 'completed';
    if (statusFilter === 'media') return Boolean(task.mediaUrl);
    if (statusFilter === 'text') return !task.mediaUrl;

    return true;
  });

  return (
    <div className="animate-fade-in todo-container">
      {/* Header */}
      <div className="content-header" style={{ justifyContent: 'center', marginBottom: '18px' }}>
        <div className="content-title" style={{ textAlign: 'center' }}>
          <h2>Tasks & To-Do Planner</h2>
          <p>Organize your goals, multimedia tasks, detailed notes, and schedules</p>
        </div>
      </div>

      {/* Stats Counter Bar */}
      <div className="todo-stats-bar">
        <div className="todo-stat-pill">
          <div className="todo-stat-icon" style={{ background: 'rgba(124, 58, 237, 0.15)', color: '#c084fc' }}>
            <Calendar size={18} />
          </div>
          <div>
            <div className="todo-stat-number">{totalCount}</div>
            <div className="todo-stat-label">Total Tasks</div>
          </div>
        </div>

        <div className="todo-stat-pill">
          <div className="todo-stat-icon" style={{ background: 'rgba(245, 158, 11, 0.15)', color: '#fbbf24' }}>
            <Clock size={18} />
          </div>
          <div>
            <div className="todo-stat-number">{pendingCount}</div>
            <div className="todo-stat-label">Pending</div>
          </div>
        </div>

        <div className="todo-stat-pill">
          <div className="todo-stat-icon" style={{ background: 'rgba(16, 185, 129, 0.15)', color: '#34d399' }}>
            <CheckCircle2 size={18} />
          </div>
          <div>
            <div className="todo-stat-number">{completedCount}</div>
            <div className="todo-stat-label">Completed</div>
          </div>
        </div>

        <div className="todo-stat-pill">
          <div className="todo-stat-icon" style={{ background: 'rgba(6, 182, 212, 0.15)', color: '#67e8f9' }}>
            <Paperclip size={18} />
          </div>
          <div>
            <div className="todo-stat-number">{mediaCount}</div>
            <div className="todo-stat-label">Media Files</div>
          </div>
        </div>
      </div>

      {/* Task Composer */}
      <div className="glass-panel todo-composer">
        {/* Mode Tabs */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '10px', marginBottom: '16px' }}>
          <div className="todo-mode-tabs">
            <button
              type="button"
              className={`todo-mode-tab ${activeTab === 'text' ? 'active' : ''}`}
              onClick={() => setActiveTab('text')}
            >
              <FileText size={16} />
              <span>Text Task</span>
            </button>
            <button
              type="button"
              className={`todo-mode-tab ${activeTab === 'media' ? 'active' : ''}`}
              onClick={() => setActiveTab('media')}
            >
              <Paperclip size={16} />
              <span>Media Task</span>
            </button>
          </div>
          <span style={{ fontSize: '0.8rem', color: 'var(--text-sub)' }}>
            {activeTab === 'media' ? 'Upload audio, video, image, or document' : 'Create standard task with notes'}
          </span>
        </div>

        <form onSubmit={handleAddTask}>
          {/* File Upload Box (Shown in Media Mode or if file attached) */}
          {(activeTab === 'media' || mediaFile) && (
            <div>
              {!mediaFile ? (
                <div
                  className="todo-media-dropzone"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <Paperclip size={28} style={{ color: 'var(--accent)', margin: '0 auto 8px auto' }} />
                  <h4 style={{ fontSize: '0.95rem', fontWeight: 600, marginBottom: '4px' }}>
                    Choose Any Media or File to Upload
                  </h4>
                  <p style={{ fontSize: '0.8rem', color: 'var(--text-sub)' }}>
                    Supports Images (JPG, PNG, WebP), Audio (MP3, WAV), Videos (MP4, WebM), and Documents (PDF, TXT, DOCX)
                  </p>
                </div>
              ) : (
                <div className="todo-media-preview-card">
                  <div className="todo-media-preview-header">
                    <span style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-sub)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <Paperclip size={14} />
                      Attached File: <strong style={{ color: 'var(--text-main)' }}>{mediaFile.name}</strong> ({formatFileSize(mediaFile.size)})
                    </span>
                    <button
                      type="button"
                      className="btn btn-danger"
                      style={{ padding: '3px 8px', fontSize: '0.72rem' }}
                      onClick={handleClearMedia}
                    >
                      <X size={13} style={{ marginRight: '4px' }} />
                      Remove
                    </button>
                  </div>

                  {/* Preview based on file type */}
                  {mediaType === 'image' && mediaPreview && (
                    <div style={{ maxHeight: '180px', overflow: 'hidden', borderRadius: '8px', background: '#000000', textAlign: 'center' }}>
                      <img src={mediaPreview} alt="Preview" style={{ maxHeight: '180px', maxWidth: '100%', objectFit: 'contain' }} />
                    </div>
                  )}

                  {mediaType === 'audio' && mediaPreview && (
                    <audio src={mediaPreview} controls style={{ width: '100%', height: '40px' }} />
                  )}

                  {mediaType === 'video' && mediaPreview && (
                    <video src={mediaPreview} controls style={{ maxHeight: '180px', width: '100%', borderRadius: '6px', background: '#000000' }} />
                  )}
                </div>
              )}

              <input
                ref={fileInputRef}
                type="file"
                style={{ display: 'none' }}
                accept="image/*,audio/*,video/*,.pdf,.doc,.docx,.txt,.rtf,.xlsx,.zip"
                onChange={handleFileChange}
              />
            </div>
          )}

          {/* Title & Dates Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '14px', marginBottom: '14px' }}>
            {/* Title */}
            <div style={{ gridColumn: 'span 2' }}>
              <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: '6px' }}>
                Task Title <span style={{ color: '#ef4444' }}>*</span>
              </label>
              <input
                type="text"
                className="form-control"
                placeholder={activeTab === 'media' ? "Title for this media task" : "What needs to be done?"}
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
              />
            </div>

            {/* Task Date */}
            <div>
              <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: '6px' }}>
                Task Date <span style={{ color: '#ef4444' }}>*</span>
              </label>
              <input
                type="date"
                className="form-control"
                value={taskDate}
                onChange={(e) => setTaskDate(e.target.value)}
                required
              />
            </div>

            {/* Due Date */}
            <div>
              <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: '6px' }}>
                Due Date <span style={{ color: '#ef4444' }}>*</span>
              </label>
              <input
                type="date"
                className="form-control"
                value={dueDate}
                min={taskDate || undefined}
                onChange={(e) => setDueDate(e.target.value)}
                required
              />
            </div>
          </div>

          {/* Details / Notes Textarea */}
          <div style={{ marginBottom: '18px' }}>
            <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: '6px' }}>
              Task Details & Notes <span style={{ color: '#ef4444' }}>*</span>
            </label>
            <textarea
              className="form-control"
              rows={3}
              placeholder={activeTab === 'media' ? "Add details, notes, instructions, or transcription for this uploaded media..." : "Add details, notes, steps, or important reminders..."}
              value={details}
              onChange={(e) => setDetails(e.target.value)}
              required
              style={{ resize: 'vertical', minHeight: '80px', padding: '10px 14px', fontSize: '0.9rem' }}
            />
          </div>

          {/* Composer Footer Actions */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
            {activeTab === 'text' && !mediaFile && (
              <button
                type="button"
                className="btn btn-secondary"
                style={{ padding: '8px 14px', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '6px' }}
                onClick={() => fileInputRef.current?.click()}
              >
                <Paperclip size={15} />
                <span>Attach Media File</span>
              </button>
            )}

            <div style={{ marginLeft: 'auto', display: 'flex', gap: '10px' }}>
              {(title || details || mediaFile || dueDate) && (
                <button
                  type="button"
                  className="btn btn-secondary"
                  style={{ padding: '8px 16px', fontSize: '0.85rem' }}
                  onClick={() => {
                    setTitle('');
                    setDetails('');
                    setDueDate('');
                    handleClearMedia();
                  }}
                >
                  Clear
                </button>
              )}
              <button
                type="submit"
                className="btn btn-primary"
                disabled={submitting}
                style={{ padding: '8px 24px', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '8px' }}
              >
                {submitting ? (
                  <>
                    <RefreshCw size={16} className="animate-spin" style={{ animation: 'spin 1s linear infinite' }} />
                    <span>Saving...</span>
                  </>
                ) : (
                  <>
                    <Plus size={18} />
                    <span>Add Task</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </form>
      </div>

      {/* Filter and Search Bar */}
      <div className="todo-filter-bar">
        {/* Search */}
        <div className="search-bar" style={{ flexGrow: 1, minWidth: '240px', maxWidth: '400px' }}>
          <Search size={16} className="search-icon" />
          <input
            type="text"
            className="form-control search-input"
            placeholder="Search tasks, details, files..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              style={{ background: 'transparent', border: 'none', color: 'var(--text-sub)', cursor: 'pointer', padding: '4px' }}
            >
              <X size={14} />
            </button>
          )}
        </div>

        {/* Filter Pills */}
        <div className="todo-filter-pills">
          <button
            type="button"
            className={`todo-filter-pill ${statusFilter === 'all' ? 'active' : ''}`}
            onClick={() => setStatusFilter('all')}
          >
            All ({totalCount})
          </button>
          <button
            type="button"
            className={`todo-filter-pill ${statusFilter === 'pending' ? 'active' : ''}`}
            onClick={() => setStatusFilter('pending')}
          >
            Pending ({pendingCount})
          </button>
          <button
            type="button"
            className={`todo-filter-pill ${statusFilter === 'completed' ? 'active' : ''}`}
            onClick={() => setStatusFilter('completed')}
          >
            Completed ({completedCount})
          </button>
          <button
            type="button"
            className={`todo-filter-pill ${statusFilter === 'media' ? 'active' : ''}`}
            onClick={() => setStatusFilter('media')}
          >
            With Media ({mediaCount})
          </button>
          <button
            type="button"
            className={`todo-filter-pill ${statusFilter === 'text' ? 'active' : ''}`}
            onClick={() => setStatusFilter('text')}
          >
            Text Only ({totalCount - mediaCount})
          </button>
        </div>
      </div>

      {/* Tasks List */}
      {loading && tasks.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '60px', color: 'var(--text-secondary)' }}>
          <RefreshCw size={28} className="animate-spin" style={{ animation: 'spin 1.5s linear infinite', margin: '0 auto 12px auto', display: 'block' }} />
          <p>Loading your tasks...</p>
        </div>
      ) : filteredTasks.length === 0 ? (
        <div className="glass-panel" style={{ textAlign: 'center', padding: '50px 30px', color: 'var(--text-secondary)' }}>
          <CheckCircle2 size={44} style={{ color: 'var(--text-muted)', marginBottom: '14px' }} />
          <h3>No Tasks Found</h3>
          <p style={{ fontSize: '0.88rem', marginTop: '6px' }}>
            {searchQuery || statusFilter !== 'all'
              ? 'No tasks matched your search or filter criteria.'
              : 'You have no tasks scheduled. Use the form above to add a new text or media task!'}
          </p>
          {(searchQuery || statusFilter !== 'all') && (
            <button
              className="btn btn-secondary"
              style={{ marginTop: '14px', padding: '6px 16px', fontSize: '0.8rem' }}
              onClick={() => {
                setSearchQuery('');
                setStatusFilter('all');
              }}
            >
              Reset Filters
            </button>
          )}
        </div>
      ) : (
        <div className="todo-list">
          {filteredTasks.map((task) => {
            const dueInfo = evaluateDueDate(task.dueDate, task.status);
            const isCompleted = task.status === 'completed';

            return (
              <div
                key={task._id}
                className={`todo-card ${isCompleted ? 'completed' : 'pending'}`}
              >
                {/* Top Row: Checkbox, Title, Badges & Actions */}
                <div className="todo-card-top">
                  <div className="todo-card-title-group">
                    {/* Status Checkbox */}
                    <div
                      className={`todo-checkbox ${isCompleted ? 'checked' : ''}`}
                      onClick={() => handleToggleTask(task._id, task.status)}
                      title={isCompleted ? "Mark as pending" : "Mark as completed"}
                    >
                      {isCompleted && <Check size={14} color="#ffffff" strokeWidth={3} />}
                    </div>

                    <div style={{ flexGrow: 1 }}>
                      {/* Title */}
                      <div className={`todo-title ${isCompleted ? 'completed' : ''}`}>
                        {task.title}
                      </div>

                      {/* Badges Row */}
                      <div className="todo-badges-row">
                        {/* Task Type Badge */}
                        {task.mediaUrl ? (
                          <>
                            {task.mediaType === 'image' && (
                              <span className="todo-type-badge image">
                                <ImageIcon size={12} /> Image Task
                              </span>
                            )}
                            {task.mediaType === 'audio' && (
                              <span className="todo-type-badge audio">
                                <Music size={12} /> Audio Task
                              </span>
                            )}
                            {task.mediaType === 'video' && (
                              <span className="todo-type-badge video">
                                <VideoIcon size={12} /> Video Task
                              </span>
                            )}
                            {task.mediaType === 'document' && (
                              <span className="todo-type-badge document">
                                <FileText size={12} /> Document Task
                              </span>
                            )}
                          </>
                        ) : (
                          <span className="todo-type-badge text">
                            <FileText size={12} /> Text Task
                          </span>
                        )}

                        {/* Status Badge */}
                        <span className={`todo-status-badge ${isCompleted ? 'completed' : 'pending'}`}>
                          {isCompleted ? 'Completed' : 'Pending'}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="todo-card-actions">
                    <button
                      type="button"
                      className="todo-action-btn"
                      onClick={() => handleOpenEdit(task)}
                      title="Edit Task Details"
                    >
                      <Edit3 size={16} />
                    </button>
                    <button
                      type="button"
                      className="todo-action-btn delete"
                      onClick={() => handleDeleteTask(task._id)}
                      title="Delete Task"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>

                {/* Details Section (Shown for both Media and Text tasks if present) */}
                {task.details && (
                  <div className="todo-details-box">
                    <div className="todo-details-label">
                      <FileText size={12} />
                      <span>Details & Notes</span>
                    </div>
                    <div className="todo-details-text">
                      {task.details}
                    </div>
                  </div>
                )}

                {/* Media Section (Shown if media file attached) */}
                {task.mediaUrl && (
                  <div className="todo-media-container">
                    {/* Image Display */}
                    {task.mediaType === 'image' && (
                      <div>
                        <div
                          className="todo-image-wrapper"
                          onClick={() => setLightboxImage(formatMediaUrl(task.mediaUrl))}
                          title="Click to view full image"
                        >
                          <img
                            src={formatMediaUrl(task.mediaUrl)}
                            alt={task.title}
                            loading="lazy"
                          />
                          <div className="todo-image-overlay">
                            <Eye size={12} />
                            <span>Click to enlarge</span>
                          </div>
                        </div>
                        {task.mediaOriginalName && (
                          <div style={{ fontSize: '0.75rem', color: 'var(--text-sub)', marginTop: '6px', display: 'flex', justifyContent: 'space-between' }}>
                            <span>{task.mediaOriginalName}</span>
                            <span>{formatFileSize(task.mediaSize)}</span>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Audio Display */}
                    {task.mediaType === 'audio' && (
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                          <Music size={16} style={{ color: '#fda4af' }} />
                          <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>{task.mediaOriginalName || 'Audio Recording'}</span>
                          {task.mediaSize && (
                            <span style={{ fontSize: '0.75rem', color: 'var(--text-sub)', marginLeft: 'auto' }}>
                              {formatFileSize(task.mediaSize)}
                            </span>
                          )}
                        </div>
                        <audio
                          src={formatMediaUrl(task.mediaUrl)}
                          controls
                          className="todo-audio-player"
                        />
                      </div>
                    )}

                    {/* Video Display */}
                    {task.mediaType === 'video' && (
                      <div>
                        <video
                          src={formatMediaUrl(task.mediaUrl)}
                          controls
                          className="todo-video-player"
                        />
                        {task.mediaOriginalName && (
                          <div style={{ fontSize: '0.75rem', color: 'var(--text-sub)', marginTop: '6px', display: 'flex', justifyContent: 'space-between' }}>
                            <span>{task.mediaOriginalName}</span>
                            <span>{formatFileSize(task.mediaSize)}</span>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Document / Other file Display */}
                    {task.mediaType === 'document' && (
                      <div className="todo-file-card">
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', overflow: 'hidden' }}>
                          <FileText size={22} style={{ color: '#34d399', flexShrink: 0 }} />
                          <div style={{ overflow: 'hidden' }}>
                            <div style={{ fontSize: '0.88rem', fontWeight: 600, textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>
                              {task.mediaOriginalName || 'Document Attachment'}
                            </div>
                            <div style={{ fontSize: '0.72rem', color: 'var(--text-sub)' }}>
                              {formatFileSize(task.mediaSize) || 'Document File'}
                            </div>
                          </div>
                        </div>

                        <a
                          href={formatMediaUrl(task.mediaUrl)}
                          target="_blank"
                          rel="noopener noreferrer"
                          download={task.mediaOriginalName || true}
                          className="btn btn-secondary"
                          style={{ padding: '6px 12px', fontSize: '0.78rem', display: 'flex', alignItems: 'center', gap: '6px', flexShrink: 0 }}
                        >
                          <Download size={14} />
                          <span>Download</span>
                        </a>
                      </div>
                    )}
                  </div>
                )}

                {/* Date Details Row (ALWAYS shown for both Media and Text tasks) */}
                <div className="todo-date-row">
                  {/* Task Date */}
                  <div className="todo-date-item" title="Task scheduled date">
                    <Calendar size={14} style={{ color: 'var(--accent)' }} />
                    <span>Date: <strong>{formatTaskDate(task.taskDate || task.createdAt)}</strong></span>
                  </div>

                  {/* Creation Time */}
                  {task.createdAt && (
                    <div className="todo-date-item" style={{ color: 'var(--text-muted)' }} title="Task added timestamp">
                      <Clock size={13} />
                      <span>Added at {formatCreatedTime(task.createdAt)}</span>
                    </div>
                  )}

                  {/* Due Date */}
                  {dueInfo && (
                    <div
                      className={`todo-date-item due ${dueInfo.className}`}
                      title={dueInfo.isOverdue ? "This task is past its due date!" : "Task due deadline"}
                      style={{ marginLeft: 'auto' }}
                    >
                      <AlertCircle size={14} />
                      <span>
                        Due: {dueInfo.text}
                        {dueInfo.isOverdue && ' (Overdue!)'}
                        {dueInfo.isToday && ' (Due Today)'}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Edit Task Modal */}
      {editingTask && (
        <div className="modal-backdrop" onClick={() => setEditingTask(null)}>
          <div
            className="modal-content glass-panel"
            style={{ maxWidth: '600px', width: '90%' }}
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              className="modal-close"
              onClick={() => setEditingTask(null)}
            >
              <X size={20} />
            </button>

            <h3 className="modal-title" style={{ marginBottom: '20px' }}>
              Edit Task Details
            </h3>

            <form onSubmit={handleSaveEdit}>
              {/* Title */}
              <div className="form-group">
                <label>Task Title <span style={{ color: '#ef4444' }}>*</span></label>
                <input
                  type="text"
                  className="form-control"
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  required
                />
              </div>

              {/* Details */}
              <div className="form-group">
                <label>Details & Notes <span style={{ color: '#ef4444' }}>*</span></label>
                <textarea
                  className="form-control"
                  rows={4}
                  placeholder="Task details and instructions..."
                  value={editDetails}
                  onChange={(e) => setEditDetails(e.target.value)}
                  required
                />
              </div>

              {/* Dates */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', marginBottom: '16px' }}>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label>Task Date <span style={{ color: '#ef4444' }}>*</span></label>
                  <input
                    type="date"
                    className="form-control"
                    value={editTaskDate}
                    onChange={(e) => setEditTaskDate(e.target.value)}
                    required
                  />
                </div>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label>Due Date <span style={{ color: '#ef4444' }}>*</span></label>
                  <input
                    type="date"
                    className="form-control"
                    value={editDueDate}
                    min={editTaskDate || undefined}
                    onChange={(e) => setEditDueDate(e.target.value)}
                    required
                  />
                </div>
              </div>

              {/* Media management in Edit */}
              <div className="form-group">
                <label>Media Attachment</label>
                {editingTask.mediaUrl && !removeExistingMedia && (
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 14px', background: 'rgba(0,0,0,0.25)', borderRadius: '8px', marginBottom: '8px' }}>
                    <span style={{ fontSize: '0.85rem' }}>
                      Current: <strong>{editingTask.mediaOriginalName || 'Uploaded File'}</strong>
                    </span>
                    <button
                      type="button"
                      className="btn btn-danger"
                      style={{ padding: '4px 8px', fontSize: '0.72rem' }}
                      onClick={() => setRemoveExistingMedia(true)}
                    >
                      Remove File
                    </button>
                  </div>
                )}

                {editMediaFile && (
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 14px', background: 'rgba(124,58,237,0.15)', borderRadius: '8px', marginBottom: '8px' }}>
                    <span style={{ fontSize: '0.85rem' }}>
                      New File: <strong>{editMediaFile.name}</strong>
                    </span>
                    <button
                      type="button"
                      className="btn btn-secondary"
                      style={{ padding: '4px 8px', fontSize: '0.72rem' }}
                      onClick={() => setEditMediaFile(null)}
                    >
                      Cancel
                    </button>
                  </div>
                )}

                <div>
                  <button
                    type="button"
                    className="btn btn-secondary"
                    style={{ fontSize: '0.8rem', padding: '6px 14px', display: 'flex', alignItems: 'center', gap: '6px' }}
                    onClick={() => editFileInputRef.current?.click()}
                  >
                    <Paperclip size={14} />
                    <span>{editingTask.mediaUrl ? 'Replace File' : 'Attach File'}</span>
                  </button>
                  <input
                    ref={editFileInputRef}
                    type="file"
                    style={{ display: 'none' }}
                    accept="image/*,audio/*,video/*,.pdf,.doc,.docx,.txt"
                    onChange={(e) => {
                      if (e.target.files[0]) {
                        setEditMediaFile(e.target.files[0]);
                        setRemoveExistingMedia(false);
                      }
                    }}
                  />
                </div>
              </div>

              {/* Modal buttons */}
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '20px' }}>
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setEditingTask(null)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={submitting}
                >
                  {submitting ? 'Saving Changes...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Lightbox Modal for Full Image View */}
      {lightboxImage && createPortal(
        <div
          className="todo-lightbox-backdrop"
          onClick={() => setLightboxImage(null)}
        >
          <div className="todo-lightbox-content" onClick={(e) => e.stopPropagation()}>
            <button
              type="button"
              className="modal-close"
              style={{ position: 'absolute', top: '-40px', right: 0 }}
              onClick={() => setLightboxImage(null)}
            >
              <X size={20} />
            </button>
            <img src={lightboxImage} alt="Full view" />
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}
