const User = require('../models/User');
const jwt = require('jsonwebtoken');

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || 'zhagaram_super_secret_architect_key_2026', {
    expiresIn: '30d',
  });
};

// @desc    Architect Login
// @route   POST /api/auth/login
const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Please provide email and password' });
    }

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    res.json({
      success: true,
      data: {
        _id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone || '8489904344',
        role: user.role,
        designation: user.designation,
        isCheckedIn: user.isCheckedIn,
        token: generateToken(user._id),
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Architect Register
// @route   POST /api/auth/register
const registerUser = async (req, res) => {
  try {
    const { name, email, password, designation, phone } = req.body;
    const userExists = await User.findOne({ email: email.toLowerCase() });
    if (userExists) {
      return res.status(400).json({ success: false, message: 'User already exists' });
    }

    const user = await User.create({
      name,
      email: email.toLowerCase(),
      password,
      designation: designation || 'Architect',
      phone: phone || '+91 98765 43210',
    });

    res.status(201).json({
      success: true,
      data: {
        _id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone || '8489904344',
        role: user.role,
        designation: user.designation,
        isCheckedIn: user.isCheckedIn,
        token: generateToken(user._id),
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get current architect profile
// @route   GET /api/auth/me
const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-password');
    res.json({ success: true, data: user });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Toggle check-in status (matches top-bar check in button from screenshot)
// @route   POST /api/auth/toggle-checkin
const toggleCheckIn = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    user.isCheckedIn = !user.isCheckedIn;
    await user.save();
    res.json({ success: true, isCheckedIn: user.isCheckedIn });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  loginUser,
  registerUser,
  getMe,
  toggleCheckIn,
};
