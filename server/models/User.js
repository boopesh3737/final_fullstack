import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    minlength: 3,
    maxlength: 20
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  password: {
    type: String,
    required: true,
    minlength: 6
  },
  avatar: {
    type: String,
    default: ''
  },
  stats: {
    totalQuizzes: { type: Number, default: 0 },
    totalScore: { type: Number, default: 0 },
    averageScore: { type: Number, default: 0 },
    rank: { type: Number, default: 0 },
    badges: [String]
  },
  friends: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  friendRequests: [{
    from: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    status: { type: String, enum: ['pending', 'accepted', 'declined'], default: 'pending' }
  }],
  isActive: {
    type: Boolean,
    default: true
  },
  lastLogin: {
    type: Date,
    default: Date.now
  },
  quizAttempts: [
    {
      quiz: { type: mongoose.Schema.Types.ObjectId, ref: 'Quiz' },
      score: Number,
      maxScore: Number,
      percentage: Number,
      date: Date
    }
  ]
}, {
  timestamps: true
});

userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  try {
    const salt = await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

userSchema.methods.comparePassword = async function(candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

userSchema.methods.updateStats = function(score, maxScore) {
  this.stats.totalQuizzes += 1;
  this.stats.totalScore += score;
  this.stats.averageScore = this.stats.totalScore / this.stats.totalQuizzes;
  
  // Award badges based on performance
  const percentage = (score / maxScore) * 100;
  if (percentage === 100 && !this.stats.badges.includes('Perfect Score')) {
    this.stats.badges.push('Perfect Score');
  }
  if (this.stats.totalQuizzes >= 10 && !this.stats.badges.includes('Quiz Master')) {
    this.stats.badges.push('Quiz Master');
  }
};

export default mongoose.model('User', userSchema);