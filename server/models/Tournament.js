import mongoose from 'mongoose';

const participantSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  score: {
    type: Number,
    default: 0
  },
  completedAt: {
    type: Date
  },
  answers: [{
    questionIndex: Number,
    selectedAnswer: Number,
    timeSpent: Number,
    isCorrect: Boolean
  }]
});

const tournamentSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  quiz: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Quiz',
    required: true
  },
  creator: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  participants: [participantSchema],
  maxParticipants: {
    type: Number,
    default: 50
  },
  startTime: {
    type: Date,
    required: true
  },
  endTime: {
    type: Date,
    required: true
  },
  status: {
    type: String,
    enum: ['upcoming', 'active', 'completed', 'cancelled'],
    default: 'upcoming'
  },
  prizes: [{
    position: Number,
    description: String,
    points: Number
  }],
  entryFee: {
    type: Number,
    default: 0
  },
  isPrivate: {
    type: Boolean,
    default: false
  },
  inviteCode: {
    type: String,
    unique: true,
    sparse: true
  }
}, {
  timestamps: true
});

tournamentSchema.methods.getLeaderboard = function() {
  return this.participants
    .filter(p => p.completedAt)
    .sort((a, b) => {
      if (b.score !== a.score) return b.score - a.score;
      return new Date(a.completedAt) - new Date(b.completedAt);
    })
    .map((participant, index) => ({
      ...participant.toObject(),
      rank: index + 1
    }));
};

export default mongoose.model('Tournament', tournamentSchema);