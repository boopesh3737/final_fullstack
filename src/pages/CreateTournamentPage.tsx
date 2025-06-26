import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import axios from 'axios';
import {
  Trophy,
  Calendar,
  Users,
  Gift,
  Plus,
  Trash2,
  Save,
  BookOpen,
  Lock,
  Globe
} from 'lucide-react';
import toast from 'react-hot-toast';
import LoadingSpinner from '../components/LoadingSpinner';

interface Quiz {
  _id: string;
  title: string;
  category: string;
  difficulty: string;
  questions: any[];
}

interface Prize {
  position: number;
  description: string;
  points: number;
}

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;

const CreateTournamentPage = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [quizzesLoading, setQuizzesLoading] = useState(true);
  const [availableQuizzes, setAvailableQuizzes] = useState<Quiz[]>([]);
  
  const [tournamentData, setTournamentData] = useState({
    title: '',
    description: '',
    quizId: '',
    maxParticipants: 50,
    startTime: '',
    endTime: '',
    entryFee: 0,
    isPrivate: false
  });

  const [prizes, setPrizes] = useState<Prize[]>([
    { position: 1, description: 'First Place', points: 100 },
    { position: 2, description: 'Second Place', points: 50 },
    { position: 3, description: 'Third Place', points: 25 }
  ]);

  useEffect(() => {
    const fetchUserQuizzes = async () => {
      try {
        const response = await axios.get(`${BACKEND_URL}/api/quiz/user/created`);
        setAvailableQuizzes(response.data);
      } catch (error) {
        console.error('Failed to fetch quizzes:', error);
        toast.error('Failed to load your quizzes');
      } finally {
        setQuizzesLoading(false);
      }
    };

    fetchUserQuizzes();
  }, []);

  const addPrize = () => {
    const nextPosition = Math.max(...prizes.map(p => p.position)) + 1;
    setPrizes([...prizes, {
      position: nextPosition,
      description: `Position ${nextPosition}`,
      points: 10
    }]);
  };

  const removePrize = (index: number) => {
    if (prizes.length > 1) {
      setPrizes(prizes.filter((_, i) => i !== index));
    }
  };

  const updatePrize = (index: number, field: keyof Prize, value: any) => {
    const updatedPrizes = [...prizes];
    updatedPrizes[index] = { ...updatedPrizes[index], [field]: value };
    setPrizes(updatedPrizes);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation
    if (!tournamentData.title.trim()) {
      toast.error('Tournament title is required');
      return;
    }

    if (!tournamentData.quizId) {
      toast.error('Please select a quiz for the tournament');
      return;
    }

    if (!tournamentData.startTime || !tournamentData.endTime) {
      toast.error('Start and end times are required');
      return;
    }

    if (new Date(tournamentData.startTime) >= new Date(tournamentData.endTime)) {
      toast.error('End time must be after start time');
      return;
    }

    if (new Date(tournamentData.startTime) <= new Date()) {
      toast.error('Start time must be in the future');
      return;
    }

    setIsLoading(true);
    try {
      const response = await axios.post(`${BACKEND_URL}/api/tournament`, {
        ...tournamentData,
        quiz: tournamentData.quizId,
        prizes: prizes.sort((a, b) => a.position - b.position)
      });

      toast.success('Tournament created successfully!');
      navigate(`/tournament/${response.data.tournament._id}`);
    } catch (error: any) {
      const message = error.response?.data?.message || 'Failed to create tournament';
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  };

  const getMinDateTime = () => {
    const now = new Date();
    now.setMinutes(now.getMinutes() + 30); // Minimum 30 minutes from now
    return now.toISOString().slice(0, 16);
  };

  if (quizzesLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="min-h-screen p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
            Create Tournament
          </h1>
          <p className="text-xl text-white/70">
            Host a competitive quiz tournament for the community
          </p>
        </motion.div>

        {availableQuizzes.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white/10 backdrop-blur-md rounded-xl p-8 border border-white/20 text-center"
          >
            <BookOpen className="w-16 h-16 text-white/50 mx-auto mb-4" />
            <h2 className="text-2xl font-semibold text-white mb-2">No Quizzes Available</h2>
            <p className="text-white/70 mb-6">
              You need to create at least one quiz before hosting a tournament.
            </p>
            <button
              onClick={() => navigate('/create-quiz')}
              className="px-6 py-3 bg-gradient-to-r from-purple-500 to-blue-500 text-white font-semibold rounded-lg hover:shadow-lg transition-all duration-200"
            >
              Create Your First Quiz
            </button>
          </motion.div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Tournament Details */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20"
            >
              <h2 className="text-2xl font-semibold text-white mb-6 flex items-center">
                <Trophy className="w-6 h-6 mr-2" />
                Tournament Information
              </h2>

              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-white/80 mb-2 font-medium">Tournament Title</label>
                  <input
                    type="text"
                    value={tournamentData.title}
                    onChange={(e) => setTournamentData({ ...tournamentData, title: e.target.value })}
                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-purple-500"
                    placeholder="Enter tournament title"
                    required
                  />
                </div>

                <div>
                  <label className="block text-white/80 mb-2 font-medium">Quiz</label>
                  <select
                    value={tournamentData.quizId}
                    onChange={(e) => setTournamentData({ ...tournamentData, quizId: e.target.value })}
                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                    required
                  >
                    <option value="" className="bg-gray-800">Select a quiz</option>
                    {availableQuizzes.map(quiz => (
                      <option key={quiz._id} value={quiz._id} className="bg-gray-800">
                        {quiz.title} ({quiz.questions?.length || 0} questions)
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-white/80 mb-2 font-medium">Max Participants</label>
                  <input
                    type="number"
                    value={tournamentData.maxParticipants}
                    onChange={(e) => setTournamentData({ ...tournamentData, maxParticipants: parseInt(e.target.value) || 50 })}
                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-purple-500"
                    min="2"
                    max="1000"
                    required
                  />
                </div>

                <div>
                  <label className="block text-white/80 mb-2 font-medium">Entry Fee (Points)</label>
                  <input
                    type="number"
                    value={tournamentData.entryFee}
                    onChange={(e) => setTournamentData({ ...tournamentData, entryFee: parseInt(e.target.value) || 0 })}
                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-purple-500"
                    min="0"
                    placeholder="0 for free tournament"
                  />
                </div>

                <div>
                  <label className="block text-white/80 mb-2 font-medium">Start Time</label>
                  <input
                    type="datetime-local"
                    value={tournamentData.startTime}
                    onChange={(e) => setTournamentData({ ...tournamentData, startTime: e.target.value })}
                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                    min={getMinDateTime()}
                    required
                  />
                </div>

                <div>
                  <label className="block text-white/80 mb-2 font-medium">End Time</label>
                  <input
                    type="datetime-local"
                    value={tournamentData.endTime}
                    onChange={(e) => setTournamentData({ ...tournamentData, endTime: e.target.value })}
                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                    min={tournamentData.startTime || getMinDateTime()}
                    required
                  />
                </div>
              </div>

              <div className="mt-6">
                <label className="block text-white/80 mb-2 font-medium">Description</label>
                <textarea
                  value={tournamentData.description}
                  onChange={(e) => setTournamentData({ ...tournamentData, description: e.target.value })}
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none"
                  rows={3}
                  placeholder="Describe your tournament"
                />
              </div>

              <div className="mt-6">
                <label className="flex items-center space-x-3 text-white">
                  <input
                    type="checkbox"
                    checked={tournamentData.isPrivate}
                    onChange={(e) => setTournamentData({ ...tournamentData, isPrivate: e.target.checked })}
                    className="w-5 h-5 text-purple-500 rounded focus:ring-purple-500"
                  />
                  <div className="flex items-center space-x-2">
                    {tournamentData.isPrivate ? <Lock className="w-4 h-4" /> : <Globe className="w-4 h-4" />}
                    <span>Make tournament private (invite only)</span>
                  </div>
                </label>
              </div>
            </motion.div>

            {/* Prizes */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20"
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-semibold text-white flex items-center">
                  <Gift className="w-6 h-6 mr-2" />
                  Prizes ({prizes.length})
                </h2>
                <button
                  type="button"
                  onClick={addPrize}
                  className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-purple-500 to-blue-500 text-white rounded-lg hover:shadow-lg transition-all duration-200"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add Prize</span>
                </button>
              </div>

              <div className="space-y-4">
                {prizes.map((prize, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-white/5 rounded-xl p-4 border border-white/10"
                  >
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-semibold text-white">
                        Prize #{prize.position}
                      </h3>
                      {prizes.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removePrize(index)}
                          className="p-2 text-red-400 hover:text-red-300 hover:bg-red-500/20 rounded-lg transition-all duration-200"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>

                    <div className="grid md:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-white/80 mb-2">Position</label>
                        <input
                          type="number"
                          value={prize.position}
                          onChange={(e) => updatePrize(index, 'position', parseInt(e.target.value) || 1)}
                          className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                          min="1"
                          required
                        />
                      </div>

                      <div>
                        <label className="block text-white/80 mb-2">Description</label>
                        <input
                          type="text"
                          value={prize.description}
                          onChange={(e) => updatePrize(index, 'description', e.target.value)}
                          className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-purple-500"
                          placeholder="Prize description"
                          required
                        />
                      </div>

                      <div>
                        <label className="block text-white/80 mb-2">Points</label>
                        <input
                          type="number"
                          value={prize.points}
                          onChange={(e) => updatePrize(index, 'points', parseInt(e.target.value) || 0)}
                          className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                          min="0"
                          required
                        />
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>

            {/* Submit Button */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="flex justify-end space-x-4"
            >
              <button
                type="button"
                onClick={() => navigate('/tournaments')}
                className="px-8 py-3 bg-white/10 text-white rounded-lg hover:bg-white/20 transition-all duration-200"
              >
                Cancel
              </button>
              <motion.button
                type="submit"
                disabled={isLoading}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="flex items-center space-x-2 px-8 py-3 bg-gradient-to-r from-purple-500 to-blue-500 text-white rounded-lg hover:shadow-lg transition-all duration-200 disabled:opacity-50"
              >
                <Save className="w-5 h-5" />
                <span>{isLoading ? 'Creating...' : 'Create Tournament'}</span>
              </motion.button>
            </motion.div>
          </form>
        )}
      </div>
    </div>
  );
};

export default CreateTournamentPage;