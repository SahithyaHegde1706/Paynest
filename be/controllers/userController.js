const User = require('../models/User');
const Transaction = require('../models/Transaction');

const getUserDetails = async (req, res) => {
    console.log('Get details requested for:', req.user._id);
    try {
        const user = await User.findById(req.user._id).select('-password');
        if (user) {
            res.json(user);
        } else {
            res.status(404).json({ message: 'User not found' });
        }
    } catch (error) {
        console.error('Get details error:', error);
        res.status(500).json({ message: error.message });
    }
};

const sendMoney = async (req, res) => {
    console.log('Send money requested:', req.body);
    try {
        const { recipientEmail, amount } = req.body;
        const sender = await User.findById(req.user._id);

        if (!sender) {
            return res.status(404).json({ message: 'Sender not found' });
        }

        if (sender.email === recipientEmail) {
            return res.status(400).json({ message: 'Cannot send money to yourself' });
        }

        const transferAmount = Number(amount);
        if (isNaN(transferAmount) || transferAmount <= 0) {
            return res.status(400).json({ message: 'Invalid amount' });
        }

        if (sender.balance < transferAmount) {
            return res.status(400).json({ message: 'Insufficient balance' });
        }

        const recipient = await User.findOne({ email: recipientEmail });

        if (!recipient) {
            return res.status(404).json({ message: 'Recipient not found' });
        }

        const recentTxCount = await Transaction.countDocuments({
            senderId: sender._id,
            date: { $gte: new Date(Date.now() - 5 * 60 * 1000) }
        });

        let isSuspicious = false;
        let txStatus = 'completed';

        if (transferAmount > 50000 || recentTxCount >= 5) {
            isSuspicious = true;
            txStatus = 'pending';
        }

        // Perform transfer logic
        sender.balance -= transferAmount;
        if (txStatus === 'completed') {
            recipient.balance += transferAmount;
        }

        sender.lastActive = Date.now();
        sender.transactionsCount = (sender.transactionsCount || 0) + 1;
        recipient.transactionsCount = (recipient.transactionsCount || 0) + 1;

        await sender.save();
        await recipient.save();

        const tx = await Transaction.create({
            senderId: sender._id,
            receiverId: recipient._id,
            amount: transferAmount,
            status: txStatus,
            isSuspicious
        });

        if (req.app && req.app.get('io')) {
            req.app.get('io').emit('new_transaction', { 
                sender: sender.name, 
                receiver: recipient.name, 
                amount: transferAmount, 
                isSuspicious 
            });
        }

        console.log(`Money sent: ${transferAmount} from ${sender.email} to ${recipient.email}`);

        res.json({ 
            message: txStatus === 'pending' ? 'Transfer under review' : 'Transfer successful', 
            newBalance: sender.balance, 
            status: txStatus 
        });
    } catch (error) {
        console.error('Send money error:', error);
        res.status(500).json({ message: error.message });
    }
};

const getTransactions = async (req, res) => {
    try {
        const transactions = await Transaction.find({ 
            $or: [{ senderId: req.user._id }, { receiverId: req.user._id }] 
        }).populate('senderId receiverId', 'name email').sort({ date: -1 });
        res.json(transactions);
    } catch (error) {
        console.error('Get transactions error:', error);
        res.status(500).json({ message: error.message });
    }
};

module.exports = { getUserDetails, sendMoney, getTransactions };
