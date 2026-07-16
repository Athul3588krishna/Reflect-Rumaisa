const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const {
  getDashboardStats,
  getAllUsers,
  deleteUser,
  getAllActivities,
  sendNotification
} = require('../controllers/adminController');

router.use(protect);
router.use(authorize('admin'));

router.get('/dashboard', getDashboardStats);
router.get('/users', getAllUsers);
router.delete('/users/:id', deleteUser);
router.get('/activities', getAllActivities);
router.post('/notifications', sendNotification);

module.exports = router;
