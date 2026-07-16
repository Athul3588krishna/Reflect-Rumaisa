import React, { useState, useEffect } from 'react';
import { Plus, Trash2, CheckCircle, Circle, RefreshCw, Calendar } from 'lucide-react';

const API_URL = 'http://localhost:5000/api';

export default function TodoModule() {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(false);
  
  // Composer states
  const [title, setTitle] = useState('');
  const [dueDate, setDueDate] = useState('');

  const fetchTasks = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_URL}/todo`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
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

  const handleAddTask = async (e) => {
    e.preventDefault();
    if (!title.trim()) return;

    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_URL}/todo`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ title, dueDate: dueDate || null })
      });

      const data = await res.json();
      if (data.success) {
        setTitle('');
        setDueDate('');
        fetchTasks();
      }
    } catch (err) {
      console.error('Error adding task:', err);
    }
  };

  const handleToggleTask = async (id, currentStatus) => {
    const nextStatus = currentStatus === 'pending' ? 'completed' : 'pending';
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
      if (data.success) {
        fetchTasks();
      }
    } catch (err) {
      console.error('Error toggling task:', err);
    }
  };

  const handleDeleteTask = async (id) => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_URL}/todo/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await res.json();
      if (data.success) {
        fetchTasks();
      }
    } catch (err) {
      console.error('Error deleting task:', err);
    }
  };

  const formatDueDate = (dateStr) => {
    if (!dateStr) return null;
    const options = { month: 'short', day: 'numeric' };
    return new Date(dateStr).toLocaleDateString('en-US', options);
  };

  return (
    <div className="animate-fade-in todo-container">
      <div className="content-header" style={{ justifyContent: 'center', marginBottom: '20px' }}>
        <div className="content-title" style={{ textAlign: 'center' }}>
          <h2>To-Do Planner</h2>
          <p>Organize your goals, actions, and daily plans</p>
        </div>
      </div>

      {/* Task Composer Form */}
      <form onSubmit={handleAddTask} className="glass-panel" style={{ padding: '20px', marginBottom: '24px' }}>
        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', alignItems: 'flex-end' }}>
          <div style={{ flexGrow: 1, minWidth: '240px' }}>
            <label style={{ fontSize: '0.8rem', fontWeight: 500, color: 'var(--text-secondary)', display: 'block', marginBottom: '6px' }}>Task Title</label>
            <input 
              type="text" 
              className="form-control" 
              placeholder="What needs to be done?" 
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
          </div>
          <div style={{ width: '180px' }}>
            <label style={{ fontSize: '0.8rem', fontWeight: 500, color: 'var(--text-secondary)', display: 'block', marginBottom: '6px' }}>Due Date</label>
            <input 
              type="date" 
              className="form-control" 
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
            />
          </div>
          <button type="submit" className="btn btn-primary" style={{ height: '45px', padding: '0 20px' }}>
            <Plus size={18} />
            <span>Add</span>
          </button>
        </div>
      </form>

      {/* Tasks List */}
      {loading && tasks.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-secondary)' }}>
          <RefreshCw size={24} className="animate-spin" style={{ animation: 'spin 1.5s linear infinite' }} />
        </div>
      ) : tasks.length === 0 ? (
        <div className="glass-panel" style={{ textAlign: 'center', padding: '40px', color: 'var(--text-secondary)' }}>
          <CheckCircle size={36} style={{ color: 'var(--text-muted)', marginBottom: '12px' }} />
          <h3>All Tasks Done!</h3>
          <p style={{ fontSize: '0.85rem', marginTop: '4px' }}>Enjoy your day, or create a new task above.</p>
        </div>
      ) : (
        <div className="todo-list">
          {tasks.map((task) => (
            <div key={task._id} className="todo-item glass-panel">
              <div className="todo-item-left">
                <div 
                  className={`todo-checkbox ${task.status === 'completed' ? 'checked' : ''}`}
                  onClick={() => handleToggleTask(task._id, task.status)}
                >
                  {task.status === 'completed' && <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: 'white' }}></div>}
                </div>
                <div>
                  <span className={`todo-title ${task.status === 'completed' ? 'completed' : ''}`}>
                    {task.title}
                  </span>
                  {task.dueDate && (
                    <span className="todo-due-date">
                      due {formatDueDate(task.dueDate)}
                    </span>
                  )}
                </div>
              </div>
              <button 
                className="todo-delete-btn" 
                onClick={() => handleDeleteTask(task._id)}
                title="Delete Task"
              >
                <Trash2 size={16} />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
