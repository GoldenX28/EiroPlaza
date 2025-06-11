import jwt from 'jsonwebtoken';
import User from '../models/User.js';

export const authenticateUser = async (req, res, next) => {
  try {
    // Get token from header
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({ message: 'No authentication token, access denied' });
    }
    
    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Find user by id
    const user = await User.findById(decoded.id).select('-password');
    
    // If user not found but token is valid, create a temporary admin user for admin operations
    if (!user && decoded.role === 'admin') {
      req.user = {
        _id: decoded.id,
        role: 'admin'
      };
      return next();
    }
    
    if (!user) {
      return res.status(401).json({ message: 'User not found, token invalid' });
    }
    
    req.user = user;
    next();
  } catch (error) {
    res.status(401).json({ message: 'Token is not valid', error: error.message });
  }
};

// Middleware to check if user is admin
export const isAdmin = (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    next();
  } else {
    res.status(403).json({ message: 'Access denied: Admin privileges required' });
  }
};

// Export isAdmin as authorizeAdmin for compatibility with existing code
export const authorizeAdmin = isAdmin;