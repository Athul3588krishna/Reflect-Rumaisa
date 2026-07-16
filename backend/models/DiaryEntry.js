const mongoose = require('mongoose');

const DiaryEntrySchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  title: {
    type: String,
    required: [true, 'Please add a title'],
    trim: true
  },
  content: {
    type: String,
    default: ''
  },
  audioUrl: {
    type: String,
    default: null
  },
  videoUrl: {
    type: String,
    default: null
  },
  date: {
    type: Date,
    required: [true, 'Please specify a diary entry date'],
    default: Date.now
  },
  tags: {
    type: [String],
    default: []
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Add index for searching content, title, and tags
DiaryEntrySchema.index({ title: 'text', content: 'text', tags: 'text' });

module.exports = mongoose.model('DiaryEntry', DiaryEntrySchema);
