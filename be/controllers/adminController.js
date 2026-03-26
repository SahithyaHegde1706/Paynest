const User = require('../models/User');
const Transaction = require('../models/Transaction');

// @desc    Get all users
// @route   GET /api/admin/users
// @access  Private/Admin
const getUsers = async (req, res) => {
    try {
        let query = {};
        if (req.query.search) {
            query.$or = [
                { name: { $regex: req.query.search, $options: 'i' } },
                { email: { $regex: req.query.search, $options: 'i' } }
            ];
        }
        if (req.query.status === 'blocked') query.isBlocked = true;
        if (req.query.status === 'active') query.isBlocked = false;
        
        if (req.query.minBalance || req.query.maxBalance) {
            query.balance = {};
            if (req.query.minBalance) query.balance.$gte = Number(req.query.minBalance);
            if (req.query.maxBalance) query.balance.$lte = Number(req.query.maxBalance);
        }

        const users = await User.find(query).select('-password').sort('-lastActive');
        res.json(users);
    } catch (error) {
        console.error('Get users error:', error);
        res.status(500).json({ message: error.message });
    }
};

// @desc    Delete user
// @route   DELETE /api/admin/user/:id
// @access  Private/Admin
const deleteUser = async (req, res) => {
    try {
        const user = await User.findById(req.params.id);
        if (user) {
            if (user.role === 'admin') {
                return res.status(400).json({ message: 'Cannot delete admin user' });
            }
            await user.deleteOne();
            res.json({ message: 'User removed' });
        } else {
            res.status(404).json({ message: 'User not found' });
        }
    } catch (error) {
        console.error('Delete user error:', error);
        res.status(500).json({ message: error.message });
    }
};

// @desc    Block or Unblock user
// @route   PATCH /api/admin/block/:id
// @access  Private/Admin
const toggleBlockUser = async (req, res) => {
    try {
        const user = await User.findById(req.params.id);
        if (user) {
            if (user.role === 'admin') {
                return res.status(400).json({ message: 'Cannot block admin user' });
            }
            user.isBlocked = !user.isBlocked;
            await user.save();
            res.json({ message: `User ${user.isBlocked ? 'blocked' : 'unblocked'} successfully`, isBlocked: user.isBlocked });
        } else {
            res.status(404).json({ message: 'User not found' });
        }
    } catch (error) {
        console.error('Toggle block user error:', error);
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get all transactions
// @route   GET /api/admin/transactions
// @access  Private/Admin
const getTransactions = async (req, res) => {
    try {
        // Find transactions, conditionally filter by query.userId and query.date if provided
        let query = {};
        
        if (req.query.userId) {
            query.$or = [{ senderId: req.query.userId }, { receiverId: req.query.userId }];
        }
        if (req.query.date) {
            const dateStr = req.query.date; // Example '2023-10-01'
            const startDate = new Date(dateStr);
            const endDate = new Date(dateStr);
            endDate.setDate(endDate.getDate() + 1);
            query.date = { $gte: startDate, $lt: endDate };
        }

        const transactions = await Transaction.find(query)
            .populate('senderId', 'name email')
            .populate('receiverId', 'name email')
            .sort('-date');
        res.json(transactions);
    } catch (error) {
        console.error('Get transactions error:', error);
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get admin statistics
// @route   GET /api/admin/stats
// @access  Private/Admin
const getStats = async (req, res) => {
    try {
        const totalUsers = await User.countDocuments({ role: { $ne: 'admin' } });
        const totalTransactions = await Transaction.countDocuments();
        
        const transactions = await Transaction.find();
        const totalMoneyFlow = transactions.reduce((acc, curr) => acc + curr.amount, 0);

        // Calculate users growth (e.g. by month or day)
        const recentUsers = await User.aggregate([
            {
                $group: {
                    _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
                    count: { $sum: 1 }
                }
            },
            { $sort: { _id: 1 } },
            { $limit: 30 }
        ]);

        // Calculate transactions per day
        const recentTransactions = await Transaction.aggregate([
            {
                $group: {
                    _id: { $dateToString: { format: "%Y-%m-%d", date: "$date" } },
                    count: { $sum: 1 },
                    amount: { $sum: "$amount" }
                }
            },
            { $sort: { _id: 1 } },
            { $limit: 30 }
        ]);

        res.json({
            totalUsers,
            totalTransactions,
            totalMoneyFlow,
            recentUsers,
            recentTransactions
        });
    } catch (error) {
        console.error('Get stats error:', error);
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    getUsers,
    deleteUser,
    toggleBlockUser,
    getTransactions,
    getStats,
    bulkAction: async (req, res) => {
        try {
            const { userIds, action } = req.body;
            if (!userIds || !Array.isArray(userIds) || userIds.length === 0) {
                return res.status(400).json({ message: 'No users selected' });
            }

            if (action === 'block') {
                await User.updateMany({ _id: { $in: userIds }, role: 'user' }, { $set: { isBlocked: true } });
            } else if (action === 'unblock') {
                await User.updateMany({ _id: { $in: userIds }, role: 'user' }, { $set: { isBlocked: false } });
            } else if (action === 'delete') {
                await User.deleteMany({ _id: { $in: userIds }, role: 'user' });
            } else {
                return res.status(400).json({ message: 'Invalid action' });
            }

            res.json({ message: `Bulk ${action} successful` });
        } catch (error) {
            console.error('Bulk action error:', error);
            res.status(500).json({ message: error.message });
        }
    },
    changeRole: async (req, res) => {
        try {
            const user = await User.findById(req.params.id);
            const { role } = req.body;
            
            if (!user) return res.status(404).json({ message: 'User not found' });
            if (user._id.toString() === req.user._id.toString()) {
                return res.status(400).json({ message: 'Cannot demote yourself' });
            }

            user.role = role === 'admin' ? 'admin' : 'user';
            await user.save();
            res.json({ message: `User role updated to ${user.role}` });
        } catch (error) {
            console.error('Change role error:', error);
            res.status(500).json({ message: error.message });
        }
    },
    updateTransactionStatus: async (req, res) => {
        try {
            const tx = await Transaction.findById(req.params.id);
            const { status } = req.body; 

            if (!tx) return res.status(404).json({ message: 'Transaction not found' });
            if (tx.status !== 'pending') return res.status(400).json({ message: 'Only pending transactions can be updated' });

            if (status === 'approved') {
                const recipient = await User.findById(tx.receiverId);
                if (recipient) {
                    recipient.balance += tx.amount;
                    await recipient.save();
                }
                tx.status = 'approved';
            } else if (status === 'rejected') {
                const sender = await User.findById(tx.senderId);
                if (sender) {
                    sender.balance += tx.amount; 
                    await sender.save();
                }
                tx.status = 'rejected';
            } else {
                return res.status(400).json({ message: 'Invalid status' });
            }

            await tx.save();
            res.json({ message: `Transaction ${status}`, transaction: tx });
        } catch (error) {
            console.error('Update transaction status error:', error);
            res.status(500).json({ message: error.message });
        }
    }
};
