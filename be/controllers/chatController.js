const ChatRequest = require('../models/ChatRequest');
const User = require('../models/User');
const Message = require('../models/Message');

const sendRequest = async (req, res) => {
    try {
        const { email } = req.body;
        const receiver = await User.findOne({ email });
        
        if (!receiver) {
            return res.status(404).json({ message: 'User not found' });
        }
        if (receiver._id.toString() === req.user._id.toString()) {
            return res.status(400).json({ message: 'Cannot add yourself' });
        }
        
        const existing = await ChatRequest.findOne({
            $or: [
                { senderId: req.user._id, receiverId: receiver._id },
                { senderId: receiver._id, receiverId: req.user._id }
            ]
        });
        
        if (existing) {
            return res.status(400).json({ message: 'Request already exists or accepted' });
        }
        
        const request = await ChatRequest.create({
            senderId: req.user._id,
            receiverId: receiver._id
        });
        
        res.status(201).json(request);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: err.message });
    }
};

const getRequests = async (req, res) => {
    try {
        const requests = await ChatRequest.find({
            receiverId: req.user._id,
            status: 'pending'
        }).populate('senderId', 'name email');
        
        res.json(requests);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: err.message });
    }
};

const respondRequest = async (req, res) => {
    try {
        const { requestId, status } = req.body;
        if (!['accepted', 'rejected'].includes(status)) {
            return res.status(400).json({ message: 'Invalid status' });
        }
        
        const request = await ChatRequest.findById(requestId);
        if (!request) {
            return res.status(404).json({ message: 'Request not found' });
        }
        if (request.receiverId.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: 'Not authorized' });
        }
        
        request.status = status;
        await request.save();
        
        res.json(request);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: err.message });
    }
};

const getUsers = async (req, res) => {
    try {
        const acceptedRequests = await ChatRequest.find({
            $or: [{ senderId: req.user._id }, { receiverId: req.user._id }],
            status: 'accepted'
        }).populate('senderId', 'name email').populate('receiverId', 'name email');
        
        // Return unique users the current user is friends with
        const users = acceptedRequests.map(r => 
            r.senderId._id.toString() === req.user._id.toString() ? r.receiverId : r.senderId
        );
        
        res.json(users);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: err.message });
    }
};

const getMessages = async (req, res) => {
    try {
        const receiverId = req.params.userId;
        const messages = await Message.find({
            $or: [
                { senderId: req.user._id, receiverId: receiverId },
                { senderId: receiverId, receiverId: req.user._id }
            ]
        }).sort({ timestamp: 1 });
        
        res.json(messages);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: err.message });
    }
};

module.exports = { sendRequest, getRequests, respondRequest, getUsers, getMessages };
