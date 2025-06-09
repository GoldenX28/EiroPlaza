import express from 'express';
import Inquiry from '../models/Inquiry.js';
import { authenticateUser } from '../middleware/auth.js';

const router = express.Router();

router.post('/', authenticateUser, async (req, res) => {
  try {
    const newInquiry = new Inquiry({
      userId: req.user._id,
      message: req.body.message
    });

    await newInquiry.save();
    res.status(201).json({ message: 'Inquiry submitted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error submitting inquiry', error: error.message });
  }
});

router.get('/', authenticateUser, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied' });
    }
    const inquiries = await Inquiry.find().populate('userId', 'username email');
    res.json(inquiries);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching inquiries', error: error.message });
  }
});

export default router;