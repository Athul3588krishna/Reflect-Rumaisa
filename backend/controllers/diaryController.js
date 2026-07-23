const fs = require('fs');
const path = require('path');
const DiaryEntry = require('../models/DiaryEntry');

// Helper to delete a file
const deleteFile = (filePath) => {
  if (filePath) {
    const fullPath = path.join(__dirname, '..', filePath);
    if (fs.existsSync(fullPath)) {
      fs.unlinkSync(fullPath);
    }
  }
};

// @desc    Get all diary entries for the logged-in user (supports search, date filters)
// @route   GET /api/diary
// @access  Private
exports.getDiaryEntries = async (req, res) => {
  try {
    let query = { user: req.user.id };

    // Filter by search keyword (case-insensitive partial match on title, content, or tags)
    if (req.query.search) {
      query.$or = [
        { title: { $regex: req.query.search, $options: 'i' } },
        { content: { $regex: req.query.search, $options: 'i' } },
        { tags: { $regex: req.query.search, $options: 'i' } }
      ];
    }

    // Filter by specific date
    if (req.query.date) {
      const searchDate = new Date(req.query.date);
      const startOfDay = new Date(searchDate.setHours(0, 0, 0, 0));
      const endOfDay = new Date(searchDate.setHours(23, 59, 59, 999));
      query.date = { $gte: startOfDay, $lte: endOfDay };
    } 
    // Filter by month (for calendar highlights)
    else if (req.query.month) {
      const [year, month] = req.query.month.split('-');
      const startOfMonth = new Date(year, month - 1, 1);
      const endOfMonth = new Date(year, month, 0, 23, 59, 59, 999);
      query.date = { $gte: startOfMonth, $lte: endOfMonth };
    }

    // Sort by date descending
    const entries = await DiaryEntry.find(query).sort({ date: -1 });
    res.status(200).json({ success: true, count: entries.length, data: entries });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get a single diary entry by ID
// @route   GET /api/diary/:id
// @access  Private
exports.getDiaryEntryById = async (req, res) => {
  try {
    const entry = await DiaryEntry.findOne({ _id: req.params.id, user: req.user.id });

    if (!entry) {
      return res.status(404).json({ success: false, message: 'Diary entry not found' });
    }

    res.status(200).json({ success: true, data: entry });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Create a new diary entry (handles audio/video upload)
// @route   POST /api/diary
// @access  Private
exports.createDiaryEntry = async (req, res) => {
  try {
    console.log("CREATE ENTRY FILES:", req.files);
    const { title, content, date, tags } = req.body;

    let audioUrl = null;
    let videoUrl = null;
    let imageUrl = null;

    // Extract uploaded files paths
    if (req.files) {
      if (req.files.audio) {
        audioUrl = `uploads/${req.files.audio[0].filename}`;
      }
      if (req.files.video) {
        videoUrl = `uploads/${req.files.video[0].filename}`;
      }
      if (req.files.image) {
        imageUrl = `uploads/${req.files.image[0].filename}`;
      }
    }

    // Parse tags
    let parsedTags = [];
    if (tags) {
      try {
        parsedTags = JSON.parse(tags);
      } catch (e) {
        parsedTags = tags.split(',').map(tag => tag.trim());
      }
    }

    const entry = await DiaryEntry.create({
      user: req.user.id,
      title,
      content,
      audioUrl,
      videoUrl,
      imageUrl,
      date: date ? new Date(date) : new Date(),
      tags: parsedTags
    });

    res.status(201).json({ success: true, data: entry });
  } catch (error) {
    // Clean up uploaded files if error occurs during creation
    if (req.files) {
      if (req.files.audio) deleteFile(`uploads/${req.files.audio[0].filename}`);
      if (req.files.video) deleteFile(`uploads/${req.files.video[0].filename}`);
      if (req.files.image) deleteFile(`uploads/${req.files.image[0].filename}`);
    }
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update a diary entry
// @route   PUT /api/diary/:id
// @access  Private
exports.updateDiaryEntry = async (req, res) => {
  try {
    console.log("UPDATE ENTRY FILES:", req.files);
    let entry = await DiaryEntry.findOne({ _id: req.params.id, user: req.user.id });

    if (!entry) {
      return res.status(404).json({ success: false, message: 'Diary entry not found' });
    }

    const { title, content, date, tags } = req.body;

    // Set basic fields if sent
    if (title) entry.title = title;
    if (content !== undefined) entry.content = content;
    if (date) entry.date = new Date(date);
    
    if (tags) {
      try {
        entry.tags = JSON.parse(tags);
      } catch (e) {
        entry.tags = tags.split(',').map(tag => tag.trim());
      }
    }

    // If new audio uploaded, delete old one and assign new path
    if (req.files && req.files.audio) {
      if (entry.audioUrl) deleteFile(entry.audioUrl);
      entry.audioUrl = `uploads/${req.files.audio[0].filename}`;
    }

    // If new video uploaded, delete old one and assign new path
    if (req.files && req.files.video) {
      if (entry.videoUrl) deleteFile(entry.videoUrl);
      entry.videoUrl = `uploads/${req.files.video[0].filename}`;
    }

    // If new image uploaded, delete old one and assign new path
    if (req.files && req.files.image) {
      if (entry.imageUrl) deleteFile(entry.imageUrl);
      entry.imageUrl = `uploads/${req.files.image[0].filename}`;
    }

    // Support clearing media files explicitly
    if (req.body.clearAudio === 'true') {
      if (entry.audioUrl) deleteFile(entry.audioUrl);
      entry.audioUrl = null;
    }
    if (req.body.clearVideo === 'true') {
      if (entry.videoUrl) deleteFile(entry.videoUrl);
      entry.videoUrl = null;
    }
    if (req.body.clearImage === 'true') {
      if (entry.imageUrl) deleteFile(entry.imageUrl);
      entry.imageUrl = null;
    }

    await entry.save();
    res.status(200).json({ success: true, data: entry });
  } catch (error) {
    if (req.files) {
      if (req.files.audio) deleteFile(`uploads/${req.files.audio[0].filename}`);
      if (req.files.video) deleteFile(`uploads/${req.files.video[0].filename}`);
      if (req.files.image) deleteFile(`uploads/${req.files.image[0].filename}`);
    }
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Delete a diary entry
// @route   DELETE /api/diary/:id
// @access  Private
// @desc    Delete a diary entry
exports.deleteDiaryEntry = async (req, res) => {
  try {
    const entry = await DiaryEntry.findOne({ _id: req.params.id, user: req.user.id });

    if (!entry) {
      return res.status(404).json({ success: false, message: 'Diary entry not found' });
    }

    // Delete associated media files
    if (entry.audioUrl) deleteFile(entry.audioUrl);
    if (entry.videoUrl) deleteFile(entry.videoUrl);
    if (entry.imageUrl) deleteFile(entry.imageUrl);

    await DiaryEntry.deleteOne({ _id: req.params.id });

    res.status(200).json({ success: true, message: 'Diary entry removed' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
