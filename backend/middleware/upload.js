const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Ensure upload directory exists
const uploadDir = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Set storage engine
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const ext = path.extname(file.originalname);
    const base = path.basename(file.originalname, ext).replace(/[^a-zA-Z0-9_-]/g, '_');
    cb(null, `${file.fieldname || 'media'}-${Date.now()}-${base}${ext}`);
  }
});

// Check file type
function checkFileType(file, cb) {
  // Allowed file types (Images, Audio, Video, Documents)
  const filetypes = /jpeg|jpg|png|gif|webp|jfif|svg|bmp|mp3|wav|ogg|m4a|aac|flac|mp4|webm|mov|avi|mkv|mpeg|3gp|pdf|doc|docx|txt|rtf|xls|xlsx|ppt|pptx|zip|csv/i;
  // Check extension
  const extname = filetypes.test(path.extname(file.originalname).toLowerCase());

  if (extname) {
    return cb(null, true);
  } else {
    // Fallback mime check for generic streams or recognized types
    if (
      file.mimetype.startsWith('image/') ||
      file.mimetype.startsWith('audio/') ||
      file.mimetype.startsWith('video/') ||
      file.mimetype.startsWith('text/') ||
      file.mimetype.includes('pdf') ||
      file.mimetype.includes('document')
    ) {
      return cb(null, true);
    }
    cb(new Error('Error: Only media files (images, audio, video) and documents are allowed!'));
  }
}

// Init upload
const upload = multer({
  storage: storage,
  limits: { fileSize: 50 * 1024 * 1024 }, // 50MB limit for video/audio
  fileFilter: function (req, file, cb) {
    checkFileType(file, cb);
  }
});

module.exports = upload;
