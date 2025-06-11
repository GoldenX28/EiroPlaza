import express from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import Post from '../models/Post.js';
import { authenticateUser } from '../middleware/auth.js';

const router = express.Router();

// Set up __dirname equivalent for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Create uploads directory if it doesn't exist
const uploadsDir = path.join(__dirname, '..', 'uploads');
if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
}

// Configure multer for file upload
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadsDir)
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + '-' + file.originalname)
  }
});

const upload = multer({ storage: storage });

// Get all posts
router.get('/', async (req, res) => {
  try {
    const posts = await Post.find()
      .populate('user', 'username') // Populate user data, selecting only the username field
      .populate('country', 'name')
      .sort({ createdAt: -1 }); // Sort by creation date, newest first
    res.json(posts);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching posts', error: error.message });
  }
});

// Create a new post with image upload
router.post('/', authenticateUser, upload.array('images', 5), async (req, res) => {
  try {
    const { title, country, content, rating } = req.body;
    const images = req.files ? req.files.map(file => `/uploads/${file.filename}`) : [];

    const newPost = new Post({
      user: req.user._id,
      country,
      title,
      content,
      images,
      rating: Number(rating)
    });

    await newPost.save();
    res.status(201).json(newPost);
  } catch (error) {
    console.error('Error creating post:', error);
    res.status(400).json({ message: 'Error creating post', error: error.message });
  }
});

// Get a specific post
router.get('/:id', async (req, res) => {
  try {
    const post = await Post.findById(req.params.id)
      .populate('user', 'username')
      .populate('country', 'name')
      .populate('comments.user', 'username');
    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }
    res.json(post);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching post', error: error.message });
  }
});

// Delete a post (admin can delete any post, users can only delete their own posts)
router.delete('/:id', authenticateUser, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    
    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }
    
    // Check if user is admin or the post owner
    // If the post's user is null/undefined (deleted user), allow admins to delete it
    if (req.user.role === 'admin' || 
        (post.user && post.user.toString() === req.user._id.toString())) {
      // Delete associated images from the filesystem
      if (post.images && post.images.length > 0) {
        post.images.forEach(imagePath => {
          // Remove the leading slash from the path if it exists
          const relativePath = imagePath.startsWith('/') ? imagePath.substring(1) : imagePath;
          const fullPath = path.join(__dirname, '..', imagePath);
          if (fs.existsSync(fullPath)) {
            fs.unlinkSync(fullPath);
          }
        });
      }
      
      await Post.findByIdAndDelete(req.params.id);
      return res.status(200).json({ message: 'Post deleted successfully' });
    } else {
      return res.status(403).json({ message: 'Not authorized to delete this post' });
    }
  } catch (error) {
    console.error('Error deleting post:', error);
    res.status(500).json({ message: 'Error deleting post', error: error.message });
  }
});

// Add a comment to a post
router.post('/:id/comments', authenticateUser, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }
    const newComment = {
      user: req.user._id,
      content: req.body.content
    };
    post.comments.push(newComment);
    await post.save();
    
    // Fetch the updated post with populated fields to return
    const updatedPost = await Post.findById(req.params.id)
      .populate('user', 'username')
      .populate('country', 'name')
      .populate('comments.user', 'username');
      
    res.status(201).json(updatedPost);
  } catch (error) {
    res.status(400).json({ message: 'Error adding comment', error: error.message });
  }
});

export default router;