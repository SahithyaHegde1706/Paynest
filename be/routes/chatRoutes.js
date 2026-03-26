const express = require('express');
const { sendRequest, getRequests, respondRequest, getUsers, getMessages } = require('../controllers/chatController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

router.post('/request', protect, sendRequest);
router.get('/requests', protect, getRequests);
router.post('/respond', protect, respondRequest);
router.get('/users', protect, getUsers);
router.get('/messages/:userId', protect, getMessages);

module.exports = router;
