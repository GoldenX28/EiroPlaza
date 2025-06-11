import express from 'express';
import mongoose from 'mongoose';
import Country from '../models/Country.js';
import User from '../models/User.js';
import Inquiry from '../models/Inquiry.js';
import Post from '../models/Post.js';

const router = express.Router();

router.get('/', async (req, res) => {
  const dbStatus = {
    main: { connected: mongoose.connection.readyState === 1 },
    countries: { connected: false },
    users: { connected: false },
    inquiries: { connected: false },
    posts: { connected: false }
  };

  try {
    await Country.findOne();
    dbStatus.countries.connected = true;
  } catch (error) {
    dbStatus.countries.error = error.message;
  }

  try {
    await User.findOne();
    dbStatus.users.connected = true;
  } catch (error) {
    dbStatus.users.error = error.message;
  }

  try {
    await Inquiry.findOne();
    dbStatus.inquiries.connected = true;
  } catch (error) {
    dbStatus.inquiries.error = error.message;
  }

  try {
    await Post.findOne();
    dbStatus.posts.connected = true;
  } catch (error) {
    dbStatus.posts.error = error.message;
  }

  res.json(dbStatus);
});

export default router;