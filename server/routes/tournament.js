import express from 'express';
import Tournament from '../models/Tournament.js';
import { auth } from '../middleware/auth.js';
import { io } from '../index.js';

const router = express.Router();

// Get all tournaments
router.get('/', async (req, res) => {
  try {
    const { status = 'all', page = 1, limit = 10 } = req.query;
    
    let query = { isPrivate: false };
    
    if (status !== 'all') {
      query.status = status;
    }

    const tournaments = await Tournament.find(query)
      .populate('creator', 'username avatar')
      .populate('quiz', 'title category difficulty')
      .sort({ startTime: 1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Tournament.countDocuments(query);

    res.json({
      tournaments,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    });
  } catch (error) {
    console.error('Get tournaments error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get tournament by ID
router.get('/:id', async (req, res) => {
  try {
    const tournament = await Tournament.findById(req.params.id)
      .populate('creator', 'username avatar')
      .populate('quiz')
      .populate('participants.user', 'username avatar');

    if (!tournament) {
      return res.status(404).json({ message: 'Tournament not found' });
    }

    res.json(tournament);
  } catch (error) {
    console.error('Get tournament error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Create tournament
router.post('/', auth, async (req, res) => {
  try {
    const tournamentData = {
      ...req.body,
      creator: req.userId
    };

    if (tournamentData.isPrivate) {
      tournamentData.inviteCode = Math.random().toString(36).substring(2, 8).toUpperCase();
    }

    const tournament = new Tournament(tournamentData);
    await tournament.save();
    
    await tournament.populate('creator', 'username avatar');
    await tournament.populate('quiz', 'title category difficulty');

    res.status(201).json({
      message: 'Tournament created successfully',
      tournament
    });
  } catch (error) {
    console.error('Create tournament error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Join tournament
router.post('/:id/join', auth, async (req, res) => {
  try {
    const tournament = await Tournament.findById(req.params.id);
    
    if (!tournament) {
      return res.status(404).json({ message: 'Tournament not found' });
    }

    if (tournament.participants.length >= tournament.maxParticipants) {
      return res.status(400).json({ message: 'Tournament is full' });
    }

    if (tournament.status !== 'upcoming') {
      return res.status(400).json({ message: 'Tournament is not accepting participants' });
    }

    const alreadyJoined = tournament.participants.some(
      p => p.user.toString() === req.userId
    );

    if (alreadyJoined) {
      return res.status(400).json({ message: 'Already joined this tournament' });
    }

    tournament.participants.push({ user: req.userId });
    await tournament.save();

    // Notify other participants
    io.to(req.params.id).emit('participant-joined', {
      participantCount: tournament.participants.length
    });

    res.json({ message: 'Successfully joined tournament' });
  } catch (error) {
    console.error('Join tournament error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Submit tournament answers
router.post('/:id/submit', auth, async (req, res) => {
  try {
    const { answers } = req.body;
    const tournament = await Tournament.findById(req.params.id)
      .populate('quiz');
    
    if (!tournament) {
      return res.status(404).json({ message: 'Tournament not found' });
    }

    if (tournament.status !== 'active') {
      return res.status(400).json({ message: 'Tournament is not active' });
    }

    const participant = tournament.participants.find(
      p => p.user.toString() === req.userId
    );

    if (!participant) {
      return res.status(400).json({ message: 'Not registered for this tournament' });
    }

    let score = 0;
    const answersData = tournament.quiz.questions.map((question, index) => {
      const userAnswer = answers[index];
      const isCorrect = userAnswer?.selectedAnswer === question.correctAnswer;
      if (isCorrect) score += question.points;
      
      return {
        questionIndex: index,
        selectedAnswer: userAnswer?.selectedAnswer,
        timeSpent: userAnswer?.timeSpent || 0,
        isCorrect
      };
    });

    participant.score = score;
    participant.completedAt = new Date();
    participant.answers = answersData;

    await tournament.save();

    // Emit real-time update
    io.to(req.params.id).emit('participant-finished', {
      participantId: req.userId,
      score,
      leaderboard: tournament.getLeaderboard()
    });

    res.json({
      score,
      maxScore: tournament.quiz.calculateMaxScore(),
      rank: tournament.getLeaderboard().find(p => p.user.toString() === req.userId)?.rank || 0
    });
  } catch (error) {
    console.error('Submit tournament error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get tournament leaderboard
router.get('/:id/leaderboard', async (req, res) => {
  try {
    const tournament = await Tournament.findById(req.params.id)
      .populate('participants.user', 'username avatar');

    if (!tournament) {
      return res.status(404).json({ message: 'Tournament not found' });
    }

    const leaderboard = tournament.getLeaderboard();

    res.json(leaderboard);
  } catch (error) {
    console.error('Get leaderboard error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;