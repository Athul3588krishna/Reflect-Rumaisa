const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const { 
  registerUser, 
  loginUser, 
  getUserProfile, 
  updateUserProfile 
} = require('../controllers/authController');

router.post('/register', registerUser);
router.post('/login', loginUser);

router.route('/profile')
  .get(protect, getUserProfile)
  .put(protect, updateUserProfile);

module.exports = router;
