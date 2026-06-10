import express from 'express';
import User from '../models/User.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

// Helper to sanitize user objects before sending to frontend
const sanitizeUser = (user) => {
  return {
    _id: user._id,
    name: user.name,
    email: user.email,
    avatar: user.avatar,
    role: user.role
  };
};

// @desc    Search for users to add as friends
// @route   GET /api/friends/search?q=query
// @access  Private
router.get('/search', protect, async (req, res) => {
  const query = req.query.q;
  if (!query || query.length < 2) {
    return res.json([]);
  }

  try {
    const searchRegex = new RegExp(query, 'i');
    let users = [];

    if (global.isMockDB) {
      users = global.mockDb.users.filter(u => 
        u._id.toString() !== req.user._id.toString() && 
        (searchRegex.test(u.name) || searchRegex.test(u.email))
      );
    } else {
      users = await User.find({
        _id: { $ne: req.user._id },
        $or: [{ name: searchRegex }, { email: searchRegex }]
      }).select('-passwordHash -friends -friendRequests');
    }

    res.json(users.map(sanitizeUser));
  } catch (error) {
    console.error('Search users error:', error);
    res.status(500).json({ message: 'Server error during user search' });
  }
});

// @desc    Get current user's friends
// @route   GET /api/friends
// @access  Private
router.get('/', protect, async (req, res) => {
  try {
    let friends = [];
    if (global.isMockDB) {
      const user = global.mockDb.users.find(u => u._id.toString() === req.user._id.toString());
      if (user && user.friends) {
        friends = user.friends.map(friendId => 
          global.mockDb.users.find(u => u._id.toString() === friendId.toString())
        ).filter(Boolean);
      }
    } else {
      const user = await User.findById(req.user._id).populate('friends', '-passwordHash -friends -friendRequests');
      friends = user.friends;
    }
    
    res.json(friends.map(sanitizeUser));
  } catch (error) {
    console.error('Get friends error:', error);
    res.status(500).json({ message: 'Server error retrieving friends' });
  }
});

// @desc    Get pending incoming friend requests
// @route   GET /api/friends/requests
// @access  Private
router.get('/requests', protect, async (req, res) => {
  try {
    let requests = [];
    if (global.isMockDB) {
      const user = global.mockDb.users.find(u => u._id.toString() === req.user._id.toString());
      if (user && user.friendRequests) {
        requests = user.friendRequests.map(reqId => 
          global.mockDb.users.find(u => u._id.toString() === reqId.toString())
        ).filter(Boolean);
      }
    } else {
      const user = await User.findById(req.user._id).populate('friendRequests', '-passwordHash -friends -friendRequests');
      requests = user.friendRequests;
    }
    
    res.json(requests.map(sanitizeUser));
  } catch (error) {
    console.error('Get friend requests error:', error);
    res.status(500).json({ message: 'Server error retrieving friend requests' });
  }
});

// @desc    Send a friend request
// @route   POST /api/friends/request/:id
// @access  Private
router.post('/request/:id', protect, async (req, res) => {
  const targetUserId = req.params.id;
  const currentUserId = req.user._id.toString();

  if (targetUserId === currentUserId) {
    return res.status(400).json({ message: 'You cannot send a friend request to yourself' });
  }

  try {
    if (global.isMockDB) {
      const targetUser = global.mockDb.users.find(u => u._id.toString() === targetUserId);
      if (!targetUser) return res.status(404).json({ message: 'User not found' });
      
      targetUser.friendRequests = targetUser.friendRequests || [];
      targetUser.friends = targetUser.friends || [];
      
      if (targetUser.friends.includes(currentUserId)) {
        return res.status(400).json({ message: 'You are already friends with this user' });
      }
      if (targetUser.friendRequests.includes(currentUserId)) {
        return res.status(400).json({ message: 'Friend request already sent' });
      }
      
      targetUser.friendRequests.push(currentUserId);
    } else {
      const targetUser = await User.findById(targetUserId);
      if (!targetUser) return res.status(404).json({ message: 'User not found' });
      
      if (targetUser.friends.includes(req.user._id)) {
        return res.status(400).json({ message: 'You are already friends with this user' });
      }
      if (targetUser.friendRequests.includes(req.user._id)) {
        return res.status(400).json({ message: 'Friend request already sent' });
      }
      
      targetUser.friendRequests.push(req.user._id);
      await targetUser.save();
    }
    
    res.json({ message: 'Friend request sent successfully' });
  } catch (error) {
    console.error('Send friend request error:', error);
    res.status(500).json({ message: 'Server error sending friend request' });
  }
});

// @desc    Accept a friend request
// @route   POST /api/friends/accept/:id
// @access  Private
router.post('/accept/:id', protect, async (req, res) => {
  const requesterId = req.params.id;
  const currentUserId = req.user._id.toString();

  try {
    if (global.isMockDB) {
      const currentUser = global.mockDb.users.find(u => u._id.toString() === currentUserId);
      const requesterUser = global.mockDb.users.find(u => u._id.toString() === requesterId);
      
      if (!currentUser || !requesterUser) return res.status(404).json({ message: 'User not found' });
      
      currentUser.friendRequests = currentUser.friendRequests || [];
      currentUser.friends = currentUser.friends || [];
      requesterUser.friends = requesterUser.friends || [];
      
      if (!currentUser.friendRequests.includes(requesterId)) {
        return res.status(400).json({ message: 'No friend request from this user' });
      }
      
      // Remove request and add to friends
      currentUser.friendRequests = currentUser.friendRequests.filter(id => id !== requesterId);
      if (!currentUser.friends.includes(requesterId)) currentUser.friends.push(requesterId);
      if (!requesterUser.friends.includes(currentUserId)) requesterUser.friends.push(currentUserId);
      
    } else {
      const currentUser = await User.findById(req.user._id);
      const requesterUser = await User.findById(requesterId);
      
      if (!currentUser || !requesterUser) return res.status(404).json({ message: 'User not found' });
      
      if (!currentUser.friendRequests.includes(requesterId)) {
        return res.status(400).json({ message: 'No friend request from this user' });
      }
      
      currentUser.friendRequests.pull(requesterId);
      if (!currentUser.friends.includes(requesterId)) currentUser.friends.push(requesterId);
      if (!requesterUser.friends.includes(req.user._id)) requesterUser.friends.push(req.user._id);
      
      await currentUser.save();
      await requesterUser.save();
    }
    
    res.json({ message: 'Friend request accepted' });
  } catch (error) {
    console.error('Accept friend request error:', error);
    res.status(500).json({ message: 'Server error accepting friend request' });
  }
});

// @desc    Reject a friend request
// @route   POST /api/friends/reject/:id
// @access  Private
router.post('/reject/:id', protect, async (req, res) => {
  const requesterId = req.params.id;
  const currentUserId = req.user._id.toString();

  try {
    if (global.isMockDB) {
      const currentUser = global.mockDb.users.find(u => u._id.toString() === currentUserId);
      if (!currentUser) return res.status(404).json({ message: 'User not found' });
      
      currentUser.friendRequests = currentUser.friendRequests || [];
      currentUser.friendRequests = currentUser.friendRequests.filter(id => id !== requesterId);
    } else {
      const currentUser = await User.findById(req.user._id);
      if (!currentUser) return res.status(404).json({ message: 'User not found' });
      
      currentUser.friendRequests.pull(requesterId);
      await currentUser.save();
    }
    
    res.json({ message: 'Friend request rejected' });
  } catch (error) {
    console.error('Reject friend request error:', error);
    res.status(500).json({ message: 'Server error rejecting friend request' });
  }
});

// @desc    Remove a friend
// @route   DELETE /api/friends/:id
// @access  Private
router.delete('/:id', protect, async (req, res) => {
  const friendId = req.params.id;
  const currentUserId = req.user._id.toString();

  try {
    if (global.isMockDB) {
      const currentUser = global.mockDb.users.find(u => u._id.toString() === currentUserId);
      const friendUser = global.mockDb.users.find(u => u._id.toString() === friendId);
      
      if (currentUser && currentUser.friends) {
        currentUser.friends = currentUser.friends.filter(id => id !== friendId);
      }
      if (friendUser && friendUser.friends) {
        friendUser.friends = friendUser.friends.filter(id => id !== currentUserId);
      }
    } else {
      const currentUser = await User.findById(req.user._id);
      const friendUser = await User.findById(friendId);
      
      if (currentUser) {
        currentUser.friends.pull(friendId);
        await currentUser.save();
      }
      if (friendUser) {
        friendUser.friends.pull(req.user._id);
        await friendUser.save();
      }
    }
    
    res.json({ message: 'Friend removed successfully' });
  } catch (error) {
    console.error('Remove friend error:', error);
    res.status(500).json({ message: 'Server error removing friend' });
  }
});

export default router;
