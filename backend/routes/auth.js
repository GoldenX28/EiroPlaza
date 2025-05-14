import express from 'express';
import bcrypt from 'bcrypt';
import User from '../models/User.js';
import jwt from 'jsonwebtoken';

const router = express.Router();

// Register route
router.post('/register', async (req, res) => {
  try {
    const { username, email, password } = req.body;
    console.log('Received registration request:', { username, email });

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // Create new user (password will be hashed by the pre-save hook)
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
    res.status(500).json({ message: 'Server error during registration' });
  }
});

// Login route
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    console.log('Login attempt for email:', email);

    const user = await User.findOne({ email });
    if (!user) {
      console.log('User not found');
      return res.status(401).json({ message: 'User not found' });
    }

    console.log('User found, comparing passwords');
    console.log('Stored hashed password:', user.password);
    console.log('Provided password:', password);

    let isMatch;
    try {
      isMatch = await user.correctPassword(password, user.password);
      console.log('Password match result:', isMatch);
    } catch (error) {
      console.error('Error during password comparison:', error);
      return res.status(500).json({ message: 'Error comparing passwords', error: error.message });
    }

    if (!isMatch) {
      console.log('Password does not match');
      return res.status(401).json({ message: 'Incorrect password' });
    }

    console.log('Password matches, generating token');
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_EXPIRES_IN
    });
    res.json({ token });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Server error during login', error: error.message, stack: error.stack });
  }
});

export default router;