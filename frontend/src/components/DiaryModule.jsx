import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { Search, Plus, Trash2, Edit3, Mic, Video, StopCircle, RefreshCw, Paperclip, Music, Video as VideoIcon, FileText, BookOpen } from 'lucide-react';

const API_URL = 'http://localhost:5000/api';

export default function DiaryModule() {
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterDate, setFilterDate] = useState('');
  
  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingEntry, setEditingEntry] = useState(null);
  
  // Form fields
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [tags, setTags] = useState('');
  
  // Media upload & recording states
  const [audioFile, setAudioFile] = useState(null);
  const [videoFile, setVideoFile] = useState(null);
  const [audioPreview, setAudioPreview] = useState('');
  const [videoPreview, setVideoPreview] = useState('');
  
  // Clear file commands (when editing, to delete old media)
  const [clearAudio, setClearAudio] = useState(false);
  const [clearVideo, setClearVideo] = useState(false);

  // Recorder states
  const [recordingMode, setRecordingMode] = useState(null); // null | 'audio' | 'video'
  const [isRecording, setIsRecording] = useState(false);
  const [recordedChunks, setRecordedChunks] = useState([]);
  const [stream, setStream] = useState(null);
  
  const mediaRecorderRef = useRef(null);
  const videoPreviewRef = useRef(null);

  const renderMarkdown = (text) => {
    if (!text) return '';
    // Escape HTML tags to prevent XSS
    let html = text
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;");
    
    // Bold: **text**
    html = html.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
    // Italic: *text*
    html = html.replace(/\*(.*?)\*/g, '<em>$1</em>');
    // Header 3: ### text
    html = html.replace(/^### (.*?)$/gm, '<h3 style="font-size:1.15rem;margin:10px 0 6px 0;font-weight:700;color:var(--text-main);">$1</h3>');
    // Bullet items: - item
    html = html.replace(/^- (.*?)$/gm, '<li style="margin-left:16px;list-style-type:disc;color:var(--text-sub);">$1</li>');
    // Line breaks
    html = html.replace(/\n/g, '<br/>');
    
    return html;
  };

  const insertMarkdown = (syntax) => {
    const textarea = document.getElementById('diary-content-textarea');
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const text = textarea.value;
    const selectedText = text.substring(start, end);

    let replacement = '';
    if (syntax === 'bold') {
      replacement = `**${selectedText || 'bold text'}**`;
    } else if (syntax === 'italic') {
      replacement = `*${selectedText || 'italic text'}*`;
    } else if (syntax === 'header') {
      replacement = `### ${selectedText || 'Header'}`;
    } else if (syntax === 'list') {
      replacement = `- ${selectedText || 'List item'}`;
    }

    const newContent = text.substring(0, start) + replacement + text.substring(end);
    setContent(newContent);

    setTimeout(() => {
      textarea.focus();
      const newCursorPos = start + replacement.length;
      textarea.setSelectionRange(newCursorPos, newCursorPos);
    }, 50);
  };

  const getPopularTags = () => {
    const tagCounts = {};
    entries.forEach(entry => {
      if (entry.tags) {
        entry.tags.forEach(tag => {
          const cleanTag = tag.trim().toLowerCase();
          if (cleanTag) {
            tagCounts[cleanTag] = (tagCounts[cleanTag] || 0) + 1;
          }
        });
      }
    });
    return Object.keys(tagCounts)
      .sort((a, b) => tagCounts[b] - tagCounts[a])
      .slice(0, 8);
  };

  const popularTags = getPopularTags();

  // Fetch entries
  const fetchEntries = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      let url = `${API_URL}/diary`;
      const params = [];
      if (searchQuery) params.push(`search=${encodeURIComponent(searchQuery)}`);
      if (filterDate) params.push(`date=${filterDate}`);
      
      if (params.length > 0) {
        url += `?${params.join('&')}`;
      }

      const res = await fetch(url, {
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
        setEntries(data.data);
      }
    } catch (error) {
      console.error('Error fetching diary:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEntries();
  }, [searchQuery, filterDate]);

  // Open modal for creating new entry
  const handleNewEntry = () => {
    setEditingEntry(null);
    setTitle('');
    setContent('');
    setDate(new Date().toISOString().split('T')[0]);
    setTags('');
    setAudioFile(null);
    setVideoFile(null);
    setAudioPreview('');
    setVideoPreview('');
    setClearAudio(false);
    setClearVideo(false);
    setIsModalOpen(true);
  };

  // Open modal for editing existing entry
  const handleEditEntry = (entry) => {
    setEditingEntry(entry);
    setTitle(entry.title);
    setContent(entry.content || '');
    setDate(new Date(entry.date).toISOString().split('T')[0]);
    setTags(entry.tags ? entry.tags.join(', ') : '');
    setAudioFile(null);
    setVideoFile(null);
    setAudioPreview(entry.audioUrl ? `http://localhost:5000/${entry.audioUrl}` : '');
    setVideoPreview(entry.videoUrl ? `http://localhost:5000/${entry.videoUrl}` : '');
    setClearAudio(false);
    setClearVideo(false);
    setIsModalOpen(true);
  };

  // Delete Entry
  const handleDeleteEntry = async (id, e) => {
    e.stopPropagation();
    if (!window.confirm('Are you sure you want to delete this diary entry?')) return;
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_URL}/diary/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await res.json();
      if (data.success) {
        fetchEntries();
      }
    } catch (error) {
      console.error('Error deleting entry:', error);
    }
  };

  // Recording functionality
  const startRecording = async (mode) => {
    setRecordingMode(mode);
    setRecordedChunks([]);
    try {
      const constraints = {
        audio: true,
        video: mode === 'video'
      };

      const mediaStream = await navigator.mediaDevices.getUserMedia(constraints);
      setStream(mediaStream);

      if (mode === 'video' && videoPreviewRef.current) {
        videoPreviewRef.current.srcObject = mediaStream;
      }

      const recorder = new MediaRecorder(mediaStream);
      mediaRecorderRef.current = recorder;

      const chunks = [];
      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          chunks.push(e.data);
        }
      };

      recorder.onstop = () => {
        const blob = new Blob(chunks, { type: mode === 'audio' ? 'audio/mp3' : 'video/mp4' });
        const file = new File(
          [blob], 
          `recorded-${Date.now()}.${mode === 'audio' ? 'mp3' : 'mp4'}`, 
          { type: mode === 'audio' ? 'audio/mp3' : 'video/mp4' }
        );

        if (mode === 'audio') {
          setAudioFile(file);
          setAudioPreview(URL.createObjectURL(blob));
          setClearAudio(false);
        } else {
          setVideoFile(file);
          setVideoPreview(URL.createObjectURL(blob));
          setClearVideo(false);
        }

        // Stop stream tracks
        mediaStream.getTracks().forEach(track => track.stop());
        setStream(null);
        setIsRecording(false);
        setRecordingMode(null);
      };

      recorder.start();
      setIsRecording(true);
    } catch (err) {
      console.error('Failed to get media devices:', err);
      alert('Could not access microphone/camera. Please check permissions.');
      setRecordingMode(null);
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
    }
  };

  // Submit Form (Create or Update)
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const formData = new FormData();
    formData.append('title', title);
    formData.append('content', content);
    formData.append('date', date);
    formData.append('tags', tags);

    if (audioFile) {
      formData.append('audio', audioFile);
    }
    if (videoFile) {
      formData.append('video', videoFile);
    }

    if (editingEntry) {
      formData.append('clearAudio', clearAudio);
      formData.append('clearVideo', clearVideo);
    }

    try {
      const token = localStorage.getItem('token');
      const url = editingEntry ? `${API_URL}/diary/${editingEntry._id}` : `${API_URL}/diary`;
      const method = editingEntry ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method: method,
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });

      const data = await res.json();
      if (data.success) {
        setIsModalOpen(false);
        fetchEntries();
      } else {
        alert(data.message || 'Failed to save entry');
      }
    } catch (err) {
      console.error('Error submitting form:', err);
    } finally {
      setLoading(false);
    }
  };

  // Format Date beautifully
  const formatDateString = (dateStr) => {
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateStr).toLocaleDateString('en-US', options);
  };

  return (
    <div className="animate-fade-in">
      <div className="content-header">
        <div className="content-title">
          <h2>Diary Entries</h2>
          <p>Record your thoughts, audios, and video logs</p>
        </div>
        <button className="btn btn-primary" onClick={handleNewEntry}>
          <Plus size={18} />
          <span>New Entry</span>
        </button>
      </div>

      {/* Filters & Search */}
      <div className="diary-controls">
        <div className="search-bar">
          <Search size={18} className="search-icon" />
          <input 
            type="text" 
            placeholder="Search keywords, titles, or tags..." 
            className="form-control search-input"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <div className="date-filter">
          <input 
            type="date" 
            className="form-control" 
            value={filterDate}
            onChange={(e) => setFilterDate(e.target.value)}
          />
        </div>
        {(searchQuery || filterDate) && (
          <button 
            className="btn btn-secondary"
            onClick={() => { setSearchQuery(''); setFilterDate(''); }}
          >
            Reset Filters
          </button>
        )}
      </div>

      {popularTags.length > 0 && (
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', alignItems: 'center', marginBottom: '24px' }}>
          <span style={{ fontSize: '0.85rem', color: 'var(--text-sub)' }}>Filter by Tag:</span>
          {popularTags.map(tag => (
            <span 
              key={tag} 
              className={`tag ${searchQuery.toLowerCase() === tag ? 'active' : ''}`}
              onClick={() => setSearchQuery(searchQuery.toLowerCase() === tag ? '' : tag)}
              style={{ cursor: 'pointer', transition: 'var(--transition-smooth)', border: searchQuery.toLowerCase() === tag ? '1px solid var(--accent)' : '1px solid transparent' }}
            >
              #{tag}
            </span>
          ))}
        </div>
      )}

      {/* Grid of Diary Entries */}
      {loading && entries.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-secondary)' }}>
          <RefreshCw size={24} className="animate-spin" style={{ animation: 'spin 1.5s linear infinite' }} />
          <p style={{ marginTop: '10px' }}>Loading entries...</p>
        </div>
      ) : entries.length === 0 ? (
        <div className="glass-panel" style={{ textAlign: 'center', padding: '60px 40px', color: 'var(--text-secondary)' }}>
          <BookOpen size={48} style={{ marginBottom: '16px', color: 'var(--text-muted)' }} />
          <h3>No Diary Entries Found</h3>
          <p style={{ fontSize: '0.9rem', marginTop: '6px' }}>Click "New Entry" to start recording your personal journey.</p>
        </div>
      ) : (
        <div className="diary-grid">
          {entries.map((entry) => (
            <div 
              key={entry._id} 
              className="glass-panel diary-card"
              onClick={() => handleEditEntry(entry)}
              style={{ cursor: 'pointer' }}
            >
              <div className="diary-card-header">
                <span className="diary-card-date">{formatDateString(entry.date)}</span>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button 
                    className="todo-delete-btn" 
                    onClick={(e) => handleDeleteEntry(entry._id, e)}
                    title="Delete Entry"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>

              <h3 className="diary-card-title">{entry.title}</h3>
              <p className="diary-card-body" dangerouslySetInnerHTML={{ __html: renderMarkdown(entry.content) || '<i>No text content written.</i>' }}></p>

              <div className="diary-card-footer">
                <div className="diary-card-tags">
                  {entry.tags && entry.tags.map((tag, idx) => (
                    <span key={idx} className="tag">#{tag}</span>
                  ))}
                </div>
                <div className="diary-card-media-indicators">
                  {entry.audioUrl && (
                    <Music size={16} className="media-indicator-active" title="Audio included" />
                  )}
                  {entry.videoUrl && (
                    <VideoIcon size={16} className="media-indicator-active" title="Video included" />
                  )}
                  {entry.content && (
                    <FileText size={16} title="Text included" />
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Editor Modal Popup */}
      {isModalOpen && (
        <div className="modal-overlay" onClick={() => setIsModalOpen(false)}>
          <div className="modal-content glass-panel" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close" onClick={() => setIsModalOpen(false)}>×</button>
            <h3 className="modal-title">
              {editingEntry ? 'Edit Diary Entry' : 'Create Diary Entry'}
            </h3>

            <form onSubmit={handleSubmit}>
              <div className="modal-form-grid" style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '20px', marginBottom: '12px' }}>
                
                {/* Left Column (Title & Content) */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label style={{ fontSize: '0.8rem', marginBottom: '4px' }}>Diary Title</label>
                    <input 
                      type="text" 
                      className="form-control" 
                      placeholder="Give a title to your memories..."
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      style={{ height: '36px', padding: '6px 10px', fontSize: '0.85rem' }}
                      required
                    />
                  </div>

                  <div className="form-group" style={{ marginBottom: 0, display: 'flex', flexDirection: 'column', flexGrow: 1 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                      <label style={{ margin: 0, fontSize: '0.8rem' }}>Journal Entry (Text)</label>
                      <div style={{ display: 'flex', gap: '6px' }}>
                        <button 
                          type="button" 
                          onClick={() => insertMarkdown('bold')}
                          style={{ padding: '2px 8px', fontSize: '0.75rem', borderRadius: '4px', border: '1px solid rgba(255,255,255,0.08)', background: 'rgba(255,255,255,0.03)', color: 'var(--text-main)', cursor: 'pointer', fontWeight: 'bold' }}
                          title="Bold Text"
                        >
                          B
                        </button>
                        <button 
                          type="button" 
                          onClick={() => insertMarkdown('italic')}
                          style={{ padding: '2px 8px', fontSize: '0.75rem', borderRadius: '4px', border: '1px solid rgba(255,255,255,0.08)', background: 'rgba(255,255,255,0.03)', color: 'var(--text-main)', cursor: 'pointer', fontStyle: 'italic' }}
                          title="Italic Text"
                        >
                          I
                        </button>
                        <button 
                          type="button" 
                          onClick={() => insertMarkdown('header')}
                          style={{ padding: '2px 8px', fontSize: '0.75rem', borderRadius: '4px', border: '1px solid rgba(255,255,255,0.08)', background: 'rgba(255,255,255,0.03)', color: 'var(--text-main)', cursor: 'pointer' }}
                          title="Insert Heading"
                        >
                          H3
                        </button>
                        <button 
                          type="button" 
                          onClick={() => insertMarkdown('list')}
                          style={{ padding: '2px 8px', fontSize: '0.75rem', borderRadius: '4px', border: '1px solid rgba(255,255,255,0.08)', background: 'rgba(255,255,255,0.03)', color: 'var(--text-main)', cursor: 'pointer' }}
                          title="Insert Bullet List"
                        >
                          • List
                        </button>
                      </div>
                    </div>
                    <textarea 
                      id="diary-content-textarea"
                      className="form-control" 
                      rows={10}
                      placeholder="Start writing details of your day here..."
                      value={content}
                      onChange={(e) => setContent(e.target.value)}
                      style={{ resize: 'none', flexGrow: 1, minHeight: '220px', padding: '12px', fontSize: '0.9rem' }}
                    ></textarea>
                  </div>
                </div>

                {/* Right Column (Date, Tags & Media) */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label style={{ fontSize: '0.8rem', marginBottom: '4px' }}>Journal Date</label>
                    <input 
                      type="date" 
                      className="form-control" 
                      value={date}
                      onChange={(e) => setDate(e.target.value)}
                      style={{ height: '36px', padding: '6px 10px', fontSize: '0.85rem' }}
                      required
                    />
                  </div>

                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label style={{ fontSize: '0.8rem', marginBottom: '4px' }}>Tags (Comma-separated)</label>
                    <input 
                      type="text" 
                      className="form-control" 
                      placeholder="life, workout, study"
                      value={tags}
                      onChange={(e) => setTags(e.target.value)}
                      style={{ height: '36px', padding: '6px 10px', fontSize: '0.85rem' }}
                    />
                  </div>

                  {/* Multimedia section */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', flexGrow: 1, justifyContent: 'flex-end' }}>
                    <label style={{ fontSize: '0.85rem', fontWeight: 500, color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>
                      Multimedia Logs (Audio / Video)
                    </label>

                    {/* Video Preview */}
                    {videoPreview && !clearVideo && (
                      <div className="media-preview-box" style={{ marginBottom: '8px' }}>
                        <div className="media-preview-header">
                          <span>Video Diary Log</span>
                          <button 
                            type="button" 
                            className="btn btn-danger" 
                            style={{ padding: '4px 8px', fontSize: '0.75rem' }}
                            onClick={() => { setVideoPreview(''); setVideoFile(null); setClearVideo(true); }}
                          >
                            Remove
                          </button>
                        </div>
                        <video src={videoPreview} className="media-player" controls style={{ maxHeight: '100px' }} />
                      </div>
                    )}

                    {/* Audio Preview */}
                    {audioPreview && !clearAudio && (
                      <div className="media-preview-box" style={{ marginBottom: '8px' }}>
                        <div className="media-preview-header">
                          <span>Audio Diary Log</span>
                          <button 
                            type="button" 
                            className="btn btn-danger" 
                            style={{ padding: '4px 8px', fontSize: '0.75rem' }}
                            onClick={() => { setAudioPreview(''); setAudioFile(null); setClearAudio(true); }}
                          >
                            Remove
                          </button>
                        </div>
                        <audio src={audioPreview} className="media-player" style={{ height: '40px' }} controls />
                      </div>
                    )}

                    {/* Web Camera Feed for recording */}
                    {recordingMode === 'video' && isRecording && (
                      <div className="media-preview-box" style={{ backgroundColor: '#000000', marginBottom: '8px' }}>
                        <div className="media-preview-header" style={{ marginBottom: '6px' }}>
                          <span style={{ color: 'red', display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: 'red', display: 'inline-block' }}></span>
                            Recording Camera...
                          </span>
                        </div>
                        <video ref={videoPreviewRef} className="media-player" autoPlay muted style={{ maxHeight: '100px' }} />
                      </div>
                    )}

                    {/* Web Microphone layout for recording */}
                    {recordingMode === 'audio' && isRecording && (
                      <div className="media-preview-box" style={{ textAlign: 'center', padding: '12px', marginBottom: '8px' }}>
                        <div className="waveform-container" style={{ height: '32px', margin: '8px auto' }}>
                          <div className="waveform-bar"></div>
                          <div className="waveform-bar"></div>
                          <div className="waveform-bar"></div>
                          <div className="waveform-bar"></div>
                          <div className="waveform-bar"></div>
                          <div className="waveform-bar"></div>
                          <div className="waveform-bar"></div>
                          <div className="waveform-bar"></div>
                        </div>
                        <p style={{ margin: 0, color: '#fb7185', fontSize: '0.8rem', fontWeight: 600 }}>Recording voice log...</p>
                      </div>
                    )}

                    {/* Multimedia Interaction Buttons */}
                    {!isRecording ? (
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '10px' }}>
                        {/* File Attachment Button */}
                        <button 
                          type="button"
                          className="btn btn-secondary"
                          onClick={() => document.getElementById('file-attachment-input').click()}
                          style={{ padding: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px', fontSize: '0.75rem' }}
                        >
                          <Paperclip size={14} />
                          <span>Attach</span>
                        </button>
                        <input 
                          id="file-attachment-input"
                          type="file"
                          className="media-upload-input"
                          accept="image/*,audio/*,video/*"
                          style={{ display: 'none' }}
                          onChange={(e) => {
                            const file = e.target.files[0];
                            if (!file) return;
                            
                            if (file.type.startsWith('audio/')) {
                              setAudioFile(file);
                              setAudioPreview(URL.createObjectURL(file));
                              setClearAudio(false);
                            } else if (file.type.startsWith('video/')) {
                              setVideoFile(file);
                              setVideoPreview(URL.createObjectURL(file));
                              setClearVideo(false);
                            } else {
                              alert('Please select an audio or video file!');
                            }
                          }}
                        />

                        {/* Record Audio Button */}
                        <button 
                          type="button" 
                          className="btn btn-secondary" 
                          onClick={() => startRecording('audio')}
                          style={{ padding: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px', fontSize: '0.75rem' }}
                        >
                          <Mic size={14} />
                          <span>Audio</span>
                        </button>

                        {/* Record Video Button */}
                        <button 
                          type="button" 
                          className="btn btn-secondary" 
                          onClick={() => startRecording('video')}
                          style={{ padding: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px', fontSize: '0.75rem' }}
                        >
                          <Video size={14} />
                          <span>Video</span>
                        </button>
                      </div>
                    ) : (
                      <button 
                        type="button" 
                        className="btn btn-danger" 
                        onClick={stopRecording}
                        style={{ width: '100%', padding: '10px' }}
                      >
                        <StopCircle size={16} />
                        Stop Recording
                      </button>
                    )}
                  </div>
                </div>

              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
                <button 
                  type="button" 
                  className="btn btn-secondary" 
                  onClick={() => setIsModalOpen(false)}
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="btn btn-primary"
                  disabled={loading || isRecording}
                >
                  {loading ? 'Saving...' : editingEntry ? 'Save Changes' : 'Create Entry'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
