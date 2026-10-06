const mongoose = require('mongoose');

const TaskSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  title: {
    type: String,
    required: [true, 'Please add a task title'],
    trim: true
  },
  details: {
    type: String,
    required: [true, 'Please add task details'],
    trim: true
  },
  status: {
    type: String,
    enum: ['pending', 'completed'],
    default: 'pending'
  },
  taskDate: {
    type: Date,
    required: [true, 'Please provide a task date'],
    default: Date.now
  },
  dueDate: {
    type: Date,
    required: [true, 'Please provide a due date']
  },
  mediaUrl: {
    type: String,
    default: null
  },
  mediaType: {
    type: String,
    enum: ['image', 'video', 'audio', 'document', 'other', null],
    default: null
  },
  mediaOriginalName: {
    type: String,
    default: null
  },
  mediaSize: {
    type: Number,
    default: null
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Task', TaskSchema);
