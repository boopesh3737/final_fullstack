import express from 'express';
import Quiz from '../models/Quiz.js';
import User from '../models/User.js';
import { auth } from '../middleware/auth.js';

const router = express.Router();

// Get all public quizzes
router.get('/', async (req, res) => {
  try {
    const { category, difficulty, search, page = 1, limit = 12 } = req.query;
    
    let query = { isPublic: true };
    
    if (category && category !== 'all') {
      query.category = category;
    }
    
    if (difficulty && difficulty !== 'all') {
      query.difficulty = difficulty;
    }
    
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { tags: { $in: [new RegExp(search, 'i')] } }
      ];
    }

    const quizzes = await Quiz.find(query)
      .populate('creator', 'username avatar')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Quiz.countDocuments(query);

    res.json({
      quizzes,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    });
  } catch (error) {
    console.error('Get quizzes error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get quiz by ID
router.get('/:id', async (req, res) => {
  try {
    const quiz = await Quiz.findById(req.params.id)
      .populate('creator', 'username avatar');
    
    if (!quiz) {
      return res.status(404).json({ message: 'Quiz not found' });
    }

    res.json(quiz);
  } catch (error) {
    console.error('Get quiz error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Create quiz
router.post('/', auth, async (req, res) => {
  try {
    const quizData = {
      ...req.body,
      creator: req.userId
    };

    const quiz = new Quiz(quizData);
    await quiz.save();
    
    await quiz.populate('creator', 'username avatar');

    res.status(201).json({
      message: 'Quiz created successfully',
      quiz
    });
  } catch (error) {
    console.error('Create quiz error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Submit quiz answers
router.post('/:id/submit', auth, async (req, res) => {
  try {
    const { answers } = req.body;
    const quiz = await Quiz.findById(req.params.id);

    if (!quiz) {
      return res.status(404).json({ message: 'Quiz not found' });
    }

    let score = 0;
    const results = quiz.questions.map((question, index) => {
      const userAnswer = answers[index];
      const isCorrect = userAnswer === question.correctAnswer;
      if (isCorrect) score += question.points;

      return {
        questionIndex: index,
        isCorrect,
        correctAnswer: question.correctAnswer,
        userAnswer,
        points: isCorrect ? question.points : 0
      };
    });

    const maxScore = quiz.questions.reduce((sum, q) => sum + q.points, 0);
    const percentage = (score / maxScore) * 100;

    // Store attempt in user profile
    const user = await User.findById(req.userId);
    if (!user.quizAttempts) user.quizAttempts = [];
    user.quizAttempts.push({
      quiz: quiz._id,
      score,
      maxScore,
      percentage,
      date: new Date()
    });
    // Update stats as usual
    user.updateStats(score, maxScore);
    await user.save();

    // Update quiz stats
    quiz.totalAttempts += 1;
    quiz.averageScore = ((quiz.averageScore * (quiz.totalAttempts - 1)) + percentage) / quiz.totalAttempts;
    await quiz.save();

    res.json({
      score,
      maxScore,
      percentage,
      results,
      stats: user.stats
    });
  } catch (error) {
    console.error('Submit quiz error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get user's created quizzes
router.get('/user/created', auth, async (req, res) => {
  try {
    const quizzes = await Quiz.find({ creator: req.userId })
      .populate('creator', 'username avatar')
      .sort({ createdAt: -1 });

    res.json(quizzes);
  } catch (error) {
    console.error('Get user quizzes error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;