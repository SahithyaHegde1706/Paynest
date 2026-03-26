const express = require('express');
const { getUserDetails, sendMoney, getTransactions } = require('../controllers/userController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

router.get('/details', protect, getUserDetails);
router.post('/send-money', protect, sendMoney);
router.get('/transactions', protect, getTransactions);

module.exports = router;
