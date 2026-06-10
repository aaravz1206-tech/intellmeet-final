import jwt from 'jsonwebtoken';
import User from '../models/User.js';

export const protect = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    try {
      // Get token from header
      token = req.headers.authorization.split(' ')[1];

      // Verify token
      if (!process.env.JWT_SECRET && process.env.NODE_ENV === 'production') {
        throw new Error('FATAL: JWT_SECRET environment variable is strictly required in production.');
      }
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'dev_local_secret');

      // Get user from token (MongoDB or Mock In-Memory DB)
      if (global.isMockDB) {
        const mockUser = global.mockDb.users.find(u => u._id.toString() === decoded.id);
        if (!mockUser) {
          return res.status(401).json({ message: 'Not authorized, user not found in mock store' });
        }
        // Exclude password
        const { passwordHash, ...userWithoutPassword } = mockUser;
        req.user = userWithoutPassword;
      } else {
        req.user = await User.findById(decoded.id).select('-passwordHash');
      }

      if (!req.user) {
        return res.status(401).json({ message: 'Not authorized, user not found' });
      }

      next();
    } catch (error) {
      console.error('Auth verification error:', error.message);
      return res.status(401).json({ message: 'Not authorized, token failed' });
    }
  }

  if (!token) {
    return res.status(401).json({ message: 'Not authorized, no token' });
  }
};
