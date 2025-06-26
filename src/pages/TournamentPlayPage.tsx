import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import {
  Trophy,
  Users,
  Calendar,
  Clock,
  Play,
  Crown,
  Medal,
  Award,
  User,
  CheckCircle,
  AlertCircle,
  Star,
  Target
} from 'lucide-react';
import LoadingSpinner from '../components/LoadingSpinner';
import { useAuthStore } from '../store/authStore';
import toast from 'react-hot-toast';

interface Tournament {
  _id: string;
  title: string;
  description: string;
  quiz: any;
  creator: {
    username: string;
    avatar: string;
  };
  participants: Array<{
    user: {
      _id: string;
      username: string;
      avatar: string;
    };
    score: number;
    completedAt?: string;
  }>;
  maxParticipants: number;
  startTime: string;
  endTime: string;
  status: 'upcoming' | 'active' | 'completed' | 'cancelled';
  prizes: Array<{
    position: number;
    description: string;
    points: number;
  }>;
}

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;

const TournamentPlayPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuthStore();
  
  const [tournament, setTournament] = useState<Tournament | null>(null);
  const [leaderboard, setLeaderboard] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isJoining, setIsJoining] = useState(false);
  const [hasJoined, setHasJoined] = useState(false);
  const [timeUntilStart, setTimeUntilStart] = useState('');

  useEffect(() => {
    const fetchTournament = async () => {
      try {
        const response = await axios.get(`${BACKEND_URL}/api/tournament/${id}`);
        setTournament(response.data);
        
        // Check if user has joined
        const userParticipant = response.data.participants.find(
          (p: any) => p.user._id === user?.id
        );
        setHasJoined(!!userParticipant);
      } catch (error) {
        console.error('Failed to fetch tournament:', error);
        toast.error('Failed to load tournament');
        navigate('/tournaments');
      } finally {
        setIsLoading(false);
      }
    };

    const fetchLeaderboard = async () => {
      try {
        const response = await axios.get(`${BACKEND_URL}/api/tournament/${id}/leaderboard`);
        setLeaderboard(response.data);
      } catch (error) {
        console.error('Failed to fetch leaderboard:', error);
      }
    };

    if (id) {
      fetchTournament();
      fetchLeaderboard();
    }
  }, [id, navigate, user?.id]);

  useEffect(() => {
    if (!tournament) return;

    const updateTimeUntilStart = () => {
      const now = new Date().getTime();
      const startTime = new Date(tournament.startTime).getTime();
      const endTime = new Date(tournament.endTime).getTime();
      
      if (now < startTime) {
        const timeDiff = startTime - now;
        const days = Math.floor(timeDiff / (1000 * 60 * 60 * 24));
        const hours = Math.floor((timeDiff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((timeDiff % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((timeDiff % (1000 * 60)) / 1000);
        
        if (days > 0) {
          setTimeUntilStart(`${days}d ${hours}h ${minutes}m`);
        } else if (hours > 0) {
          setTimeUntilStart(`${hours}h ${minutes}m ${seconds}s`);
        } else {
          setTimeUntilStart(`${minutes}m ${seconds}s`);
        }
      } else if (now >= startTime && now <= endTime) {
        setTimeUntilStart('Live Now!');
      } else {
        setTimeUntilStart('Tournament Ended');
      }
    };

    updateTimeUntilStart();
    const interval = setInterval(updateTimeUntilStart, 1000);
    
    return () => clearInterval(interval);
  }, [tournament]);

  const handleJoinTournament = async () => {
    if (!tournament || isJoining) return;
    
    setIsJoining(true);
    try {
      await axios.post(`${BACKEND_URL}/api/tournament/${id}/join`);
      setHasJoined(true);
      toast.success('Successfully joined tournament!');
      
      // Refresh tournament data
      const response = await axios.get(`${BACKEND_URL}/api/tournament/${id}`);
      setTournament(response.data);
    } catch (error: any) {
      const message = error.response?.data?.message || 'Failed to join tournament';
      toast.error(message);
    } finally {
      setIsJoining(false);
    }
  };

  const handleStartQuiz = () => {
    if (tournament?.quiz?._id) {
      navigate(`/quiz/${tournament.quiz._id}`);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'upcoming': return 'text-blue-400 bg-blue-400/20';
      case 'active': return 'text-green-400 bg-green-400/20';
      case 'completed': return 'text-gray-400 bg-gray-400/20';
      default: return 'text-gray-400 bg-gray-400/20';
    }
  };

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1: return <Crown className="w-6 h-6 text-yellow-400" />;
      case 2: return <Medal className="w-6 h-6 text-gray-300" />;
      case 3: return <Award className="w-6 h-6 text-amber-600" />;
      default: return <span className="w-6 h-6 flex items-center justify-center text-white/60 font-bold">#{rank}</span>;
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  if (!tournament) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-white mb-4">Tournament not found</h2>
          <button
            onClick={() => navigate('/tournaments')}
            className="px-6 py-3 bg-gradient-to-r from-purple-500 to-blue-500 text-white rounded-lg hover:shadow-lg transition-all duration-200"
          >
            Back to Tournaments
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white/10 backdrop-blur-md rounded-xl p-8 border border-white/20 mb-8"
        >
          <div className="flex items-start justify-between mb-6">
            <div className="flex-1">
              <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">
                {tournament.title}
              </h1>
              <p className="text-white/70 text-lg mb-4">{tournament.description}</p>
              
              <div className="flex items-center space-x-2 mb-4">
                <img
                  src={tournament.creator?.avatar || `https://ui-avatars.com/api/?name=${tournament.creator?.username}&background=6366f1&color=fff`}
                  alt={tournament.creator?.username}
                  className="w-8 h-8 rounded-full"
                />
                <span className="text-white/60">Created by {tournament.creator?.username}</span>
              </div>
            </div>

            <div className={`flex items-center space-x-2 px-4 py-2 rounded-full font-medium ${getStatusColor(tournament.status)}`}>
              <Trophy className="w-5 h-5" />
              <span>{tournament.status.charAt(0).toUpperCase() + tournament.status.slice(1)}</span>
            </div>
          </div>

          {/* Tournament Info */}
          <div className="grid md:grid-cols-4 gap-6">
            <div className="text-center p-4 bg-white/10 rounded-lg">
              <Users className="w-8 h-8 text-blue-400 mx-auto mb-2" />
              <div className="text-2xl font-bold text-white">
                {tournament.participants.length}/{tournament.maxParticipants}
              </div>
              <div className="text-white/60 text-sm">Participants</div>
            </div>

            <div className="text-center p-4 bg-white/10 rounded-lg">
              <Calendar className="w-8 h-8 text-purple-400 mx-auto mb-2" />
              <div className="text-lg font-bold text-white">
                {new Date(tournament.startTime).toLocaleDateString()}
              </div>
              <div className="text-white/60 text-sm">Start Date</div>
            </div>

            <div className="text-center p-4 bg-white/10 rounded-lg">
              <Clock className="w-8 h-8 text-green-400 mx-auto mb-2" />
              <div className="text-lg font-bold text-white">
                {timeUntilStart}
              </div>
              <div className="text-white/60 text-sm">
                {tournament.status === 'upcoming' ? 'Starts In' : 
                 tournament.status === 'active' ? 'Status' : 'Ended'}
              </div>
            </div>

            <div className="text-center p-4 bg-white/10 rounded-lg">
              <Trophy className="w-8 h-8 text-yellow-400 mx-auto mb-2" />
              <div className="text-lg font-bold text-white">
                {tournament.prizes.length > 0 ? tournament.prizes[0]?.points : 'No'}
              </div>
              <div className="text-white/60 text-sm">Top Prize</div>
            </div>
          </div>

          {/* Action Button */}
          <div className="mt-6 flex justify-center">
            {!hasJoined ? (
              <motion.button
                onClick={handleJoinTournament}
                disabled={isJoining || tournament.participants.length >= tournament.maxParticipants}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="flex items-center space-x-2 px-8 py-3 bg-gradient-to-r from-purple-500 to-blue-500 text-white font-semibold rounded-lg hover:shadow-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Users className="w-5 h-5" />
                <span>{isJoining ? 'Joining...' : 'Join Tournament'}</span>
              </motion.button>
            ) : tournament.status === 'active' ? (
              <motion.button
                onClick={handleStartQuiz}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="flex items-center space-x-2 px-8 py-3 bg-gradient-to-r from-green-500 to-emerald-500 text-white font-semibold rounded-lg hover:shadow-lg transition-all duration-200"
              >
                <Play className="w-5 h-5" />
                <span>Start Quiz</span>
              </motion.button>
            ) : (
              <div className="flex items-center space-x-2 px-8 py-3 bg-white/10 text-white rounded-lg">
                <CheckCircle className="w-5 h-5 text-green-400" />
                <span>You're registered!</span>
              </div>
            )}
          </div>
        </motion.div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Quiz Information */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20"
          >
            <h2 className="text-2xl font-semibold text-white mb-4 flex items-center">
              <Target className="w-6 h-6 mr-2" />
              Quiz Details
            </h2>

            {tournament.quiz ? (
              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-semibold text-white">{tournament.quiz.title}</h3>
                  <p className="text-white/70">{tournament.quiz.description}</p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="p-3 bg-white/10 rounded-lg">
                    <div className="text-white/60 text-sm">Category</div>
                    <div className="text-white font-medium">{tournament.quiz.category}</div>
                  </div>
                  <div className="p-3 bg-white/10 rounded-lg">
                    <div className="text-white/60 text-sm">Difficulty</div>
                    <div className="text-white font-medium capitalize">{tournament.quiz.difficulty}</div>
                  </div>
                  <div className="p-3 bg-white/10 rounded-lg">
                    <div className="text-white/60 text-sm">Questions</div>
                    <div className="text-white font-medium">{tournament.quiz.questions?.length || 0}</div>
                  </div>
                  <div className="p-3 bg-white/10 rounded-lg">
                    <div className="text-white/60 text-sm">Max Score</div>
                    <div className="text-white font-medium">
                      {tournament.quiz.questions?.reduce((total: number, q: any) => total + (q.points || 10), 0) || 0}
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-8">
                <AlertCircle className="w-12 h-12 text-white/50 mx-auto mb-2" />
                <p className="text-white/70">Quiz information not available</p>
              </div>
            )}

            {/* Prizes */}
            {tournament.prizes.length > 0 && (
              <div className="mt-6">
                <h3 className="text-lg font-semibold text-white mb-3">Prizes</h3>
                <div className="space-y-2">
                  {tournament.prizes.map((prize, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-3 bg-gradient-to-r from-yellow-500/20 to-orange-500/20 rounded-lg border border-yellow-500/30"
                    >
                      <div className="flex items-center space-x-3">
                        {getRankIcon(prize.position)}
                        <span className="text-white font-medium">
                          Position #{prize.position}
                        </span>
                      </div>
                      <div className="text-right">
                        <div className="text-yellow-400 font-bold">{prize.points} pts</div>
                        {prize.description && (
                          <div className="text-white/60 text-sm">{prize.description}</div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </motion.div>

          {/* Leaderboard */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20"
          >
            <h2 className="text-2xl font-semibold text-white mb-4 flex items-center">
              <Trophy className="w-6 h-6 mr-2" />
              Leaderboard
            </h2>

            {leaderboard.length > 0 ? (
              <div className="space-y-3">
                {leaderboard.slice(0, 10).map((participant, index) => (
                  <motion.div
                    key={participant.user._id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className={`flex items-center justify-between p-3 rounded-lg ${
                      participant.user._id === user?.id
                        ? 'bg-purple-500/30 border border-purple-400/50'
                        : 'bg-white/10'
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      {getRankIcon(participant.rank)}
                      <img
                        src={participant.user.avatar || `https://ui-avatars.com/api/?name=${participant.user.username}&background=6366f1&color=fff`}
                        alt={participant.user.username}
                        className="w-8 h-8 rounded-full"
                      />
                      <div>
                        <div className="text-white font-medium">
                          {participant.user.username}
                          {participant.user._id === user?.id && (
                            <span className="ml-2 text-purple-400 text-sm">(You)</span>
                          )}
                        </div>
                        {participant.completedAt && (
                          <div className="text-white/60 text-xs">
                            Completed {new Date(participant.completedAt).toLocaleTimeString()}
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-white font-bold">{participant.score}</div>
                      {participant.completedAt && (
                        <CheckCircle className="w-4 h-4 text-green-400 ml-auto" />
                      )}
                    </div>
                  </motion.div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <Users className="w-12 h-12 text-white/50 mx-auto mb-2" />
                <p className="text-white/70">No participants yet</p>
              </div>
            )}

            {/* Participants List */}
            {tournament.participants.length > 0 && leaderboard.length === 0 && (
              <div className="space-y-3">
                <h3 className="text-lg font-semibold text-white">Registered Participants</h3>
                {tournament.participants.map((participant, index) => (
                  <div
                    key={participant.user._id}
                    className={`flex items-center space-x-3 p-3 rounded-lg ${
                      participant.user._id === user?.id
                        ? 'bg-purple-500/30 border border-purple-400/50'
                        : 'bg-white/10'
                    }`}
                  >
                    <img
                      src={participant.user.avatar || `https://ui-avatars.com/api/?name=${participant.user.username}&background=6366f1&color=fff`}
                      alt={participant.user.username}
                      className="w-8 h-8 rounded-full"
                    />
                    <div>
                      <div className="text-white font-medium">
                        {participant.user.username}
                        {participant.user._id === user?.id && (
                          <span className="ml-2 text-purple-400 text-sm">(You)</span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default TournamentPlayPage;