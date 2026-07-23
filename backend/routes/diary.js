const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const upload = require('../middleware/upload');
const {
  getDiaryEntries,
  getDiaryEntryById,
  createDiaryEntry,
  updateDiaryEntry,
  deleteDiaryEntry
} = require('../controllers/diaryController');

router.use(protect);

router.route('/')
  .get(getDiaryEntries)
  .post(
    upload.fields([
      { name: 'audio', maxCount: 1 },
      { name: 'video', maxCount: 1 },
      { name: 'image', maxCount: 1 }
    ]),
    createDiaryEntry
  );

router.route('/:id')
  .get(getDiaryEntryById)
  .put(
    upload.fields([
      { name: 'audio', maxCount: 1 },
      { name: 'video', maxCount: 1 },
      { name: 'image', maxCount: 1 }
    ]),
    updateDiaryEntry
  )
  .delete(deleteDiaryEntry);

module.exports = router;
