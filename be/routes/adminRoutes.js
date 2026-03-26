const express = require('express');
const router = express.Router();
const { protect, checkAdmin } = require('../middleware/authMiddleware');
const {
    getUsers,
    deleteUser,
    toggleBlockUser,
    getTransactions,
    getStats,
    bulkAction,
    changeRole,
    updateTransactionStatus
} = require('../controllers/adminController');

// All routes are protected and restricted to admin
router.use(protect, checkAdmin);

router.get('/users', getUsers);
router.delete('/user/:id', deleteUser);
router.patch('/block/:id', toggleBlockUser);
router.post('/users/bulk', bulkAction);
router.patch('/role/:id', changeRole);
router.patch('/transaction/:id/status', updateTransactionStatus);
router.get('/transactions', getTransactions);
router.get('/stats', getStats);

module.exports = router;
