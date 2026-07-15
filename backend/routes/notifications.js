const express = require('express');
const router = express.Router();
const Notification = require('../models/Notification');
const { protect } = require('../middleware/auth');

// @desc    Get all notifications for logged-in user (both personal and global broadcasts)
// @route   GET /api/notifications
// @access  Private
router.get('/', protect, async (req, res) => {
  try {
    const userId = req.user.id;

    // Find notifications sent to this specific user OR global broadcasts
    const notifications = await Notification.find({
      $or: [
        { recipient: userId },
        { isGlobal: true }
      ]
    }).sort({ createdAt: -1 });

    // Dynamically format response to show if read by current user
    const formattedNotifications = notifications.map(notif => {
      let isRead = false;
      if (notif.isGlobal) {
        isRead = notif.readBy.includes(userId);
      } else {
        isRead = notif.read;
      }

      return {
        id: notif._id,
        message: notif.message,
        isGlobal: notif.isGlobal,
        read: isRead,
        createdAt: notif.createdAt
      };
    });

    res.status(200).json({ success: true, count: formattedNotifications.length, data: formattedNotifications });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @desc    Mark a notification as read
// @route   PUT /api/notifications/:id/read
// @access  Private
router.put('/:id/read', protect, async (req, res) => {
  try {
    const userId = req.user.id;
    const notif = await Notification.findById(req.params.id);

    if (!notif) {
      return res.status(404).json({ success: false, message: 'Notification not found' });
    }

    if (notif.isGlobal) {
      // For global notifications, add user ID to readBy array if not already there
      if (!notif.readBy.includes(userId)) {
        notif.readBy.push(userId);
        await notif.save();
      }
    } else {
      // For private notifications, check if recipient matches current user
      if (notif.recipient.toString() !== userId) {
        return res.status(401).json({ success: false, message: 'Not authorized to update this notification' });
      }
      notif.read = true;
      await notif.save();
    }

    res.status(200).json({ success: true, message: 'Notification marked as read' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
