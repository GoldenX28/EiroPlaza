import express from 'express';
import mongoose from 'mongoose';
import bcrypt from 'bcrypt';
import User from '../models/User.js';
import Country from '../models/Country.js';
import jwt from 'jsonwebtoken';
import { authenticateUser } from '../middleware/auth.js';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const router = express.Router();

// Set up __dirname equivalent for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Ensure uploads directory exists
const uploadsDir = path.join(__dirname, '..', 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadsDir);
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + '-' + file.originalname);
  }
});

const upload = multer({ storage });

// Register route
router.post('/register', async (req, res) => {
  try {
    const { username, email, password } = req.body;
    console.log('Received registration request:', { username, email });

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }
    // Create new user
    const user = new User({
      username,
      email,
      password
    });

    await user.save();
    console.log('User registered successfully');
    res.status(201).json({ message: 'User registered successfully' });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ message: 'Server error during registration', error: error.message });
  }
});

// Login route
router.post('/login', async (req, res) => {
  if (mongoose.connection.readyState !== 1) {
    console.error('Database not connected');
    return res.status(500).json({ message: 'Database connection error' });
  }
  try {
    const { email, password } = req.body;
    console.log('Login attempt for email:', email);

    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      console.log('User not found');
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    console.log('User found, comparing passwords');
    console.log('Stored hashed password:', user.password);
    console.log('Provided password:', password);

    let isMatch;
    try {
      isMatch = await bcrypt.compare(password, user.password);
      console.log('Password match result:', isMatch);
    } catch (error) {
      console.error('Error during password comparison:', error);
      return res.status(500).json({ message: 'Error comparing passwords', error: error.message });
    }

    if (!isMatch) {
      console.log('Password does not match');
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    console.log('Password matches, generating token');
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_EXPIRES_IN
    });
    res.json({
      token,
      user: {
        _id: user._id,
        username: user.username,
        email: user.email,
        role: user.role,
        favoriteCountries: user.favoriteCountries || []
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Server error during login', error: error.message });
  }
});

// Get user profile
router.get('/profile', authenticateUser, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json({
      username: user.username,
      email: user.email,
      favoriteCountries: user.favoriteCountries || [],
      createdAt: user.createdAt // Include the createdAt field
    });
  } catch (error) {
    console.error('Error fetching user profile:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Update user profile
router.put('/profile', authenticateUser, upload.single('avatar'), async (req, res) => {
  try {
    const { username, email } = req.body;
    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (username) user.username = username;
    if (email) user.email = email;

    if (req.file) {
      // store path relative to server root so static serving works (/uploads/...)
      user.avatar = `/uploads/${req.file.filename}`;
    }

    await user.save();
    res.json({ message: 'Profile updated successfully', user });
  } catch (error) {
    console.error('Error updating user profile:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get current user
router.get('/me', authenticateUser, (req, res) => {
  res.json({
    id: req.user._id,
    username: req.user.username,
    email: req.user.email,
    role: req.user.role,
    favoriteCountries: req.user.favoriteCountries || []
  });
});

router.post('/favorites/:countryId', authenticateUser, async (req, res) => {
  try {
    const { countryId } = req.params;

    const countryExists = await Country.exists({ _id: countryId });
    if (!countryExists) {
      return res.status(404).json({ message: 'Country not found' });
    }

    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const isFavorite = user.favoriteCountries.some((favoriteId) => String(favoriteId) === String(countryId));

    if (isFavorite) {
      user.favoriteCountries = user.favoriteCountries.filter((favoriteId) => String(favoriteId) !== String(countryId));
    } else {
      user.favoriteCountries.push(countryId);
    }

    await user.save();

    res.json({
      message: isFavorite ? 'Removed from favorites' : 'Added to favorites',
      favoriteCountries: user.favoriteCountries
    });
  } catch (error) {
    console.error('Error toggling favorite country:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

router.get('/favorites', authenticateUser, async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('favoriteCountries');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({ favoriteCountries: user.favoriteCountries || [] });
  } catch (error) {
    console.error('Error fetching favorites:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

export default router;