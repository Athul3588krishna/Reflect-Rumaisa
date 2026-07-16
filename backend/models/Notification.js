const mongoose = require('mongoose');

const NotificationSchema = new mongoose.Schema({
  recipient: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null // null indicates a global broadcast notification
  },
  isGlobal: {
    type: Boolean,
    default: false
  },
  message: {
    type: String,
    required: [true, 'Please add a notification message']
  },
  read: {
    type: Boolean,
    default: false // Only applicable for individual notifications
  },
  readBy: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }], // Track users who have read a global notification
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Notification', NotificationSchema);
