import mongoose from 'mongoose';

const questionSchema = new mongoose.Schema({
  question: {
    type: String,
    required: true,
    trim: true
  },
  options: [{
    type: String,
    required: true
  }],
  correctAnswer: {
    type: Number,
    required: true,
    min: 0,
    max: 3
  },
  difficulty: {
    type: String,
    enum: ['easy', 'medium', 'hard'],
    default: 'medium'
  },
  points: {
    type: Number,
    default: 10
  },
  timeLimit: {
    type: Number,
    default: 30 // seconds
  }
});

const quizSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true,
    maxlength: 100
  },
  description: {
    type: String,
    trim: true,
    maxlength: 500
  },
  category: {
    type: String,
    required: true,
    enum: ['General Knowledge', 'Science', 'History', 'Sports', 'Technology', 'Entertainment', 'Literature', 'Geography']
  },
  difficulty: {
    type: String,
    enum: ['easy', 'medium', 'hard'],
    default: 'medium'
  },
  questions: [questionSchema],
  creator: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  isPublic: {
    type: Boolean,
    default: true
  },
  tags: [String],
  totalAttempts: {
    type: Number,
    default: 0
  },
  averageScore: {
    type: Number,
    default: 0
  },
  thumbnail: {
    type: String,
    default: ''
  },
  timeLimit: {
    type: Number,
    default: 0 // 0 means no time limit for entire quiz
  }
}, {
  timestamps: true
});

quizSchema.methods.calculateMaxScore = function() {
  return this.questions.reduce((total, question) => total + question.points, 0);
};

export default mongoose.model('Quiz', quizSchema);