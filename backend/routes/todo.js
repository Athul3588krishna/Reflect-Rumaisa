const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const upload = require('../middleware/upload');
const {
  getTasks,
  createTask,
  updateTask,
  deleteTask
} = require('../controllers/todoController');

router.use(protect);

router.route('/')
  .get(getTasks)
  .post(upload.single('media'), createTask);

router.route('/:id')
  .put(upload.single('media'), updateTask)
  .delete(deleteTask);

module.exports = router;
