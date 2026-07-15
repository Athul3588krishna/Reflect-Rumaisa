const express = require('express');
const router = express.Router();
const Task = require('../models/Task');
const { protect } = require('../middleware/auth');

// @desc    Get all tasks for the logged-in user
// @route   GET /api/todo
// @access  Private
router.get('/', protect, async (req, res) => {
  try {
    const tasks = await Task.find({ user: req.user.id }).sort({ createdAt: -1 });
    res.status(200).json({ success: true, count: tasks.length, data: tasks });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @desc    Create a new task
// @route   POST /api/todo
// @access  Private
router.post('/', protect, async (req, res) => {
  try {
    const { title, dueDate } = req.body;

    if (!title) {
      return res.status(400).json({ success: false, message: 'Please add a task title' });
    }

    const task = await Task.create({
      user: req.user.id,
      title,
      dueDate: dueDate ? new Date(dueDate) : null
    });

    res.status(201).json({ success: true, data: task });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @desc    Update a task (toggle completion, change title, or change dueDate)
// @route   PUT /api/todo/:id
// @access  Private
router.put('/:id', protect, async (req, res) => {
  try {
    let task = await Task.findOne({ _id: req.params.id, user: req.user.id });

    if (!task) {
      return res.status(404).json({ success: false, message: 'Task not found' });
    }

    const { title, status, dueDate } = req.body;

    if (title) task.title = title;
    if (status) task.status = status;
    if (dueDate !== undefined) task.dueDate = dueDate ? new Date(dueDate) : null;

    await task.save();

    res.status(200).json({ success: true, data: task });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @desc    Delete a task
// @route   DELETE /api/todo/:id
// @access  Private
router.delete('/:id', protect, async (req, res) => {
  try {
    const task = await Task.findOne({ _id: req.params.id, user: req.user.id });

    if (!task) {
      return res.status(404).json({ success: false, message: 'Task not found' });
    }

    await Task.deleteOne({ _id: req.params.id });

    res.status(200).json({ success: true, message: 'Task removed successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
