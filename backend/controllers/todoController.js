const fs = require('fs');
const path = require('path');
const Task = require('../models/Task');

// Helper to safely delete an uploaded file
const deleteFile = (filePath) => {
  if (filePath) {
    const fullPath = path.join(__dirname, '..', filePath);
    if (fs.existsSync(fullPath)) {
      try {
        fs.unlinkSync(fullPath);
      } catch (err) {
        console.error('Failed to unlink file:', err);
      }
    }
  }
};

// Helper to determine media type
const determineMediaType = (file) => {
  if (!file) return null;
  const mime = file.mimetype || '';
  const ext = path.extname(file.originalname).toLowerCase();
  if (mime.startsWith('image/') || /jpeg|jpg|png|gif|webp|jfif|svg|bmp/.test(ext)) {
    return 'image';
  }
  if (mime.startsWith('audio/') || /mp3|wav|ogg|m4a|aac|flac/.test(ext)) {
    return 'audio';
  }
  if (mime.startsWith('video/') || /mp4|webm|mov|avi|mkv|mpeg|3gp/.test(ext)) {
    return 'video';
  }
  return 'document';
};

// @desc    Get all tasks for the logged-in user
// @route   GET /api/todo
// @access  Private
exports.getTasks = async (req, res) => {
  try {
    const tasks = await Task.find({ user: req.user.id }).sort({ createdAt: -1 });
    res.status(200).json({ success: true, count: tasks.length, data: tasks });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Create a new task (Text or Media)
// @route   POST /api/todo
// @access  Private
exports.createTask = async (req, res) => {
  try {
    let { title, details, taskDate, dueDate } = req.body;

    // Helper to cleanup uploaded file on validation failure
    const cleanupUploadedFile = () => {
      if (req.file) {
        deleteFile(`uploads/${req.file.filename}`);
      }
    };

    // Auto-fill title with original file name only if title was not explicitly sent or blank
    if (req.file && (!title || !title.trim())) {
      title = req.file.originalname;
    }

    // 1. Title validation
    if (!title || !title.trim()) {
      cleanupUploadedFile();
      return res.status(400).json({
        success: false,
        message: 'Task title is required'
      });
    }

    // 2. Details validation
    if (!details || !details.trim()) {
      cleanupUploadedFile();
      return res.status(400).json({
        success: false,
        message: 'Task details/notes are required'
      });
    }

    // 3. Task Date validation
    if (!taskDate) {
      cleanupUploadedFile();
      return res.status(400).json({
        success: false,
        message: 'Task date is required'
      });
    }
    const parsedTaskDate = new Date(taskDate);
    if (isNaN(parsedTaskDate.getTime())) {
      cleanupUploadedFile();
      return res.status(400).json({
        success: false,
        message: 'Valid task date is required'
      });
    }

    // 4. Due Date validation
    if (!dueDate) {
      cleanupUploadedFile();
      return res.status(400).json({
        success: false,
        message: 'Due date is required'
      });
    }
    const parsedDueDate = new Date(dueDate);
    if (isNaN(parsedDueDate.getTime())) {
      cleanupUploadedFile();
      return res.status(400).json({
        success: false,
        message: 'Valid due date is required'
      });
    }

    // 5. Logical date check: Due date cannot be earlier than task date
    const tDay = new Date(parsedTaskDate);
    tDay.setHours(0, 0, 0, 0);
    const dDay = new Date(parsedDueDate);
    dDay.setHours(0, 0, 0, 0);

    if (dDay < tDay) {
      cleanupUploadedFile();
      return res.status(400).json({
        success: false,
        message: 'Due date cannot be earlier than task date'
      });
    }

    let mediaUrl = null;
    let mediaType = null;
    let mediaOriginalName = null;
    let mediaSize = null;

    if (req.file) {
      mediaUrl = `uploads/${req.file.filename}`;
      mediaOriginalName = req.file.originalname;
      mediaSize = req.file.size;
      mediaType = determineMediaType(req.file);
    }

    const task = await Task.create({
      user: req.user.id,
      title: title.trim(),
      details: details.trim(),
      taskDate: parsedTaskDate,
      dueDate: parsedDueDate,
      mediaUrl,
      mediaType,
      mediaOriginalName,
      mediaSize
    });

    res.status(201).json({ success: true, data: task });
  } catch (error) {
    if (req.file) {
      deleteFile(`uploads/${req.file.filename}`);
    }
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update a task (toggle completion, edit details/dates, or change media)
// @route   PUT /api/todo/:id
// @access  Private
exports.updateTask = async (req, res) => {
  try {
    let task = await Task.findOne({ _id: req.params.id, user: req.user.id });

    if (!task) {
      if (req.file) deleteFile(`uploads/${req.file.filename}`);
      return res.status(404).json({ success: false, message: 'Task not found' });
    }

    const { title, details, status, taskDate, dueDate, removeMedia } = req.body;

    // Helper to cleanup newly uploaded replacement file on validation error
    const cleanupUploadedFile = () => {
      if (req.file) {
        deleteFile(`uploads/${req.file.filename}`);
      }
    };

    if (title !== undefined) {
      if (!title || !title.trim()) {
        cleanupUploadedFile();
        return res.status(400).json({ success: false, message: 'Task title cannot be empty' });
      }
      task.title = title.trim();
    }

    if (details !== undefined) {
      if (!details || !details.trim()) {
        cleanupUploadedFile();
        return res.status(400).json({ success: false, message: 'Task details cannot be empty' });
      }
      task.details = details.trim();
    }

    if (status !== undefined) {
      if (!['pending', 'completed'].includes(status)) {
        cleanupUploadedFile();
        return res.status(400).json({ success: false, message: 'Invalid status value' });
      }
      task.status = status;
    }

    if (taskDate !== undefined) {
      if (!taskDate) {
        cleanupUploadedFile();
        return res.status(400).json({ success: false, message: 'Task date cannot be empty' });
      }
      const parsedTaskDate = new Date(taskDate);
      if (isNaN(parsedTaskDate.getTime())) {
        cleanupUploadedFile();
        return res.status(400).json({ success: false, message: 'Valid task date is required' });
      }
      task.taskDate = parsedTaskDate;
    }

    if (dueDate !== undefined) {
      if (!dueDate) {
        cleanupUploadedFile();
        return res.status(400).json({ success: false, message: 'Due date cannot be empty' });
      }
      const parsedDueDate = new Date(dueDate);
      if (isNaN(parsedDueDate.getTime())) {
        cleanupUploadedFile();
        return res.status(400).json({ success: false, message: 'Valid due date is required' });
      }
      task.dueDate = parsedDueDate;
    }

    if (task.dueDate && task.taskDate) {
      const tDay = new Date(task.taskDate);
      tDay.setHours(0, 0, 0, 0);
      const dDay = new Date(task.dueDate);
      dDay.setHours(0, 0, 0, 0);
      if (dDay < tDay) {
        cleanupUploadedFile();
        return res.status(400).json({ success: false, message: 'Due date cannot be earlier than task date' });
      }
    }

    // Handle removing existing media
    if (removeMedia === 'true' || removeMedia === true) {
      if (task.mediaUrl) {
        deleteFile(task.mediaUrl);
        task.mediaUrl = null;
        task.mediaType = null;
        task.mediaOriginalName = null;
        task.mediaSize = null;
      }
    }

    // Handle uploading replacement media
    if (req.file) {
      if (task.mediaUrl) {
        deleteFile(task.mediaUrl);
      }
      task.mediaUrl = `uploads/${req.file.filename}`;
      task.mediaOriginalName = req.file.originalname;
      task.mediaSize = req.file.size;
      task.mediaType = determineMediaType(req.file);
    }

    await task.save();

    res.status(200).json({ success: true, data: task });
  } catch (error) {
    if (req.file) deleteFile(`uploads/${req.file.filename}`);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Delete a task
// @route   DELETE /api/todo/:id
// @access  Private
exports.deleteTask = async (req, res) => {
  try {
    const task = await Task.findOne({ _id: req.params.id, user: req.user.id });

    if (!task) {
      return res.status(404).json({ success: false, message: 'Task not found' });
    }

    // Delete uploaded file if present
    if (task.mediaUrl) {
      deleteFile(task.mediaUrl);
    }

    await Task.deleteOne({ _id: req.params.id });

    res.status(200).json({ success: true, message: 'Task removed successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
