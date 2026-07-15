const express = require('express');
const router = express.Router();
const User = require('../models/User');
const DiaryEntry = require('../models/DiaryEntry');
const Task = require('../models/Task');
const Notification = require('../models/Notification');
const { protect, authorize } = require('../middleware/auth');

// Apply protection and authorize admin for all admin routes
router.use(protect);
router.use(authorize('admin'));

// @desc    Get Admin Dashboard Stats
// @route   GET /api/admin/dashboard
// @access  Private/Admin
router.get('/dashboard', async (req, res) => {
  try {
    const totalUsers = await User.countDocuments({ role: 'user' });
    const totalEntries = await DiaryEntry.countDocuments();
    
    // Count specific multimedia entries
    const audioEntries = await DiaryEntry.countDocuments({ audioUrl: { $ne: null } });
    const videoEntries = await DiaryEntry.countDocuments({ videoUrl: { $ne: null } });
    
    const recentUsers = await User.find({ role: 'user' })
      .sort({ createdAt: -1 })
      .limit(5)
      .select('-password');

    res.status(200).json({
      success: true,
      data: {
        stats: {
          totalUsers,
          totalEntries,
          audioEntries,
          videoEntries
        },
        recentUsers
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @desc    Get all users
// @route   GET /api/admin/users
// @access  Private/Admin
router.get('/users', async (req, res) => {
  try {
    const users = await User.find({ role: 'user' }).sort({ createdAt: -1 }).select('-password');
    res.status(200).json({ success: true, count: users.length, data: users });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @desc    Delete a user (and all their associated diary entries, tasks, and notifications)
// @route   DELETE /api/admin/users/:id
// @access  Private/Admin
router.delete('/users/:id', async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    if (user.role === 'admin') {
      return res.status(400).json({ success: false, message: 'Cannot delete an Admin account' });
    }

    // Delete user's diary entries, tasks, and notifications
    await DiaryEntry.deleteMany({ user: user._id });
    await Task.deleteMany({ user: user._id });
    await Notification.deleteMany({ recipient: user._id });
    
    // Delete the user itself
    await User.deleteOne({ _id: user._id });

    res.status(200).json({ success: true, message: 'User and all associated data deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @desc    View all diary activities across the platform
// @route   GET /api/admin/activities
// @access  Private/Admin
router.get('/activities', async (req, res) => {
  try {
    // Fetch all diary entries and populate user details
    const activities = await DiaryEntry.find()
      .populate('user', 'name email')
      .sort({ date: -1 });

    res.status(200).json({ success: true, count: activities.length, data: activities });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @desc    Send a notification (global broadcast or targeted to user)
// @route   POST /api/admin/notifications
// @access  Private/Admin
router.post('/notifications', async (req, res) => {
  try {
    const { message, recipientId, isGlobal } = req.body;

    if (!message) {
      return res.status(400).json({ success: false, message: 'Please add a notification message' });
    }

    let notification;

    if (isGlobal || !recipientId) {
      // Send global broadcast
      notification = await Notification.create({
        message,
        isGlobal: true,
        recipient: null
      });
    } else {
      // Send private user notification
      const user = await User.findById(recipientId);
      if (!user) {
        return res.status(404).json({ success: false, message: 'Recipient user not found' });
      }

      notification = await Notification.create({
        message,
        isGlobal: false,
        recipient: recipientId
      });
    }

    res.status(201).json({ success: true, data: notification });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
