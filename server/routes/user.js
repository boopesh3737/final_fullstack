import express from 'express';
import User from '../models/User.js';
import Quiz from '../models/Quiz.js';
import Tournament from '../models/Tournament.js';
import { auth } from '../middleware/auth.js';

const router = express.Router();

// Get global leaderboard
router.get('/leaderboard', async (req, res) => {
  try {
    const users = await User.find({ isActive: true })
      .select('username avatar stats')
      .sort({ 'stats.averageScore': -1, 'stats.totalScore': -1 })
      .limit(50);

    const leaderboard = users.map((user, index) => ({
      rank: index + 1,
      username: user.username,
      avatar: user.avatar,
      totalQuizzes: user.stats.totalQuizzes,
      totalScore: user.stats.totalScore,
      averageScore: user.stats.averageScore,
      badges: user.stats.badges
    }));

    res.json(leaderboard);
  } catch (error) {
    console.error('Get leaderboard error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get user profile
router.get('/profile/:userId', async (req, res) => {
  try {
    const user = await User.findById(req.params.userId)
      .select('-password -email');

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Get user's created quizzes count
    const createdQuizzes = await Quiz.countDocuments({ creator: req.params.userId });
    
    // Get user's tournament participations
    const tournaments = await Tournament.countDocuments({
      'participants.user': req.params.userId
    });

    res.json({
      ...user.toObject(),
      createdQuizzes,
      tournaments
    });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update user profile
router.put('/profile', auth, async (req, res) => {
  try {
    const { username, avatar } = req.body;
    
    const updateData = {};
    if (username) updateData.username = username;
    if (avatar) updateData.avatar = avatar;

    const user = await User.findByIdAndUpdate(
      req.userId,
      updateData,
      { new: true, runValidators: true }
    ).select('-password');

    res.json(user);
  } catch (error) {
    console.error('Update profile error:', error);
    if (error.code === 11000) {
      res.status(400).json({ message: 'Username already taken' });
    } else {
      res.status(500).json({ message: 'Server error' });
    }
  }
});

// Send friend request
router.post('/friend-request/:userId', auth, async (req, res) => {
  try {
    const targetUser = await User.findById(req.params.userId);
    
    if (!targetUser) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (req.params.userId === req.userId) {
      return res.status(400).json({ message: 'Cannot send friend request to yourself' });
    }

    const existingRequest = targetUser.friendRequests.find(
      request => request.from.toString() === req.userId
    );

    if (existingRequest) {
      return res.status(400).json({ message: 'Friend request already sent' });
    }

    targetUser.friendRequests.push({
      from: req.userId,
      status: 'pending'
    });

    await targetUser.save();

    res.json({ message: 'Friend request sent successfully' });
  } catch (error) {
    console.error('Send friend request error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get user dashboard data
router.get('/dashboard', auth, async (req, res) => {
  try {
    const user = await User.findById(req.userId).select('-password');
    
    // Get recent quizzes
    const recentQuizzes = await Quiz.find({ isPublic: true })
      .populate('creator', 'username')
      .sort({ createdAt: -1 })
      .limit(5);

    // Get upcoming tournaments
    const upcomingTournaments = await Tournament.find({
      status: 'upcoming',
      startTime: { $gt: new Date() }
    })
      .populate('quiz', 'title')
      .sort({ startTime: 1 })
      .limit(5);

    // Get user rank
    const userRank = await User.countDocuments({
      'stats.averageScore': { $gt: user.stats.averageScore }
    }) + 1;

    res.json({
      user: {
        ...user.toObject(),
        rank: userRank
      },
      recentQuizzes,
      upcomingTournaments
    });
  } catch (error) {
    console.error('Get dashboard error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;