const User = require('../models/User');
const jwt = require('jsonwebtoken');

const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET || 'secret123', {
        expiresIn: '30d',
    });
};

const signup = async (req, res) => {
    console.log("Signup body:", req.body);
    try {
        const { name, email, password } = req.body;

        if (!name || !email || !password) {
            return res.status(400).json({ message: 'Please provide name, email, and password' });
        }

        const userExists = await User.findOne({ email });

        if (userExists) {
            return res.status(400).json({ message: 'User already exists' });
        }

        const user = await User.create({
            name,
            email,
            password
        });

        if (user) {
            if (req.app && req.app.get('io')) {
                req.app.get('io').emit('new_user', { email: user.email, name: user.name });
            }
            res.status(201).json({
                user: {
                    _id: user._id,
                    name: user.name,
                    email: user.email,
                    balance: user.balance,
                    role: user.role
                },
                token: generateToken(user._id)
            });
            console.log('User created:', user.email);
        } else {
            res.status(400).json({ message: 'Invalid user data' });
        }
    } catch (error) {
        console.error('Signup error:', error);
        res.status(500).json({ message: error.message });
    }
};

const login = async (req, res) => {
    console.log('Login requested:', req.body);
    try {
        const { email, password } = req.body;

        const user = await User.findOne({ email });

        if (user && (await user.matchPassword(password))) {
            if (user.isBlocked) {
                return res.status(403).json({ message: 'Your account has been blocked' });
            }
            
            user.lastLogin = Date.now();
            user.lastActive = Date.now();
            await user.save();

            res.json({
                user: {
                    _id: user._id,
                    name: user.name,
                    email: user.email,
                    balance: user.balance,
                    role: user.role
                },
                token: generateToken(user._id)
            });
            console.log('User logged in:', user.email);
        } else {
            res.status(401).json({ message: 'Invalid email or password' });
        }
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ message: error.message });
    }
};

module.exports = { signup, login };
