import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import axios from 'axios';
import {
  Trophy,
  Crown,
  Medal,
  Award,
  Star,
  TrendingUp,
  Users,
  Target,
  Filter,
  Search
} from 'lucide-react';
import LoadingSpinner from '../components/LoadingSpinner';
import { useAuthStore } from '../store/authStore';

interface LeaderboardUser {
  rank: number;
  username: string;
  avatar: string;
  totalQuizzes: number;
  totalScore: number;
  averageScore: number;
  badges: string[];
}

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;

const LeaderboardPage = () => {
  const { user } = useAuthStore();
  const [leaderboard, setLeaderboard] = useState<LeaderboardUser[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredLeaderboard, setFilteredLeaderboard] = useState<LeaderboardUser[]>([]);

  useEffect(() => {
    const fetchLeaderboard = async () => {
      try {
        const response = await axios.get(`${BACKEND_URL}/api/user/leaderboard`);
        setLeaderboard(response.data);
        setFilteredLeaderboard(response.data);
      } catch (error) {
        console.error('Failed to fetch leaderboard:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchLeaderboard();
  }, []);

  useEffect(() => {
    if (searchTerm) {
      const filtered = leaderboard.filter(u =>
        u.username.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredLeaderboard(filtered);
    } else {
      setFilteredLeaderboard(leaderboard);
    }
  }, [searchTerm, leaderboard]);

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <Crown className="w-8 h-8 text-yellow-400" />;
      case 2:
        return <Medal className="w-8 h-8 text-gray-300" />;
      case 3:
        return <Award className="w-8 h-8 text-amber-600" />;
      default:
        return (
          <div className="w-8 h-8 flex items-center justify-center bg-white/20 rounded-full">
            <span className="text-white font-bold text-sm">#{rank}</span>
          </div>
        );
    }
  };

  const getRankBg = (rank: number) => {
    switch (rank) {
      case 1:
        return 'bg-gradient-to-r from-yellow-500/20 to-orange-500/20 border-yellow-500/40';
      case 2:
        return 'bg-gradient-to-r from-gray-400/20 to-gray-500/20 border-gray-400/40';
      case 3:
        return 'bg-gradient-to-r from-amber-600/20 to-amber-700/20 border-amber-600/40';
      default:
        return 'bg-white/10 border-white/20';
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 90) return 'text-green-400';
    if (score >= 70) return 'text-yellow-400';
    if (score >= 50) return 'text-orange-400';
    return 'text-red-400';
  };

  const topStats = [
    {
      icon: Users,
      label: 'Total Users',
      value: leaderboard.length,
      color: 'from-blue-500 to-cyan-500'
    },
    {
      icon: Trophy,
      label: 'Top Score',
      value: leaderboard[0]?.totalScore || 0,
      color: 'from-yellow-500 to-orange-500'
    },
    {
      icon: Target,
      label: 'Avg Performance',
      value: `${Math.round(leaderboard.reduce((acc, user) => acc + user.averageScore, 0) / (leaderboard.length || 1))}%`,
      color: 'from-green-500 to-emerald-500'
    },
    {
      icon: TrendingUp,
      label: 'Active Players',
      value: leaderboard.filter(u => u.totalQuizzes > 0).length,
      color: 'from-purple-500 to-pink-500'
    }
  ];

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner />
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
          className="mb-8"
        >
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
            Global Leaderboard
          </h1>
          <p className="text-xl text-white/70">
            See how you rank against other quiz masters
          </p>
        </motion.div>

        {/* Top Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-8">
          {topStats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20"
              >
                <div className={`w-12 h-12 bg-gradient-to-r ${stat.color} rounded-lg flex items-center justify-center mb-4`}>
                  <Icon className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-white mb-1">{stat.value}</h3>
                <p className="text-white/60">{stat.label}</p>
              </motion.div>
            );
          })}
        </div>

        {/* Search */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="mb-8"
        >
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-white/50" />
            <input
              type="text"
              placeholder="Search players..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>
        </motion.div>

        {/* Top 3 Podium */}
        {leaderboard.length >= 3 && (
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="mb-12"
          >
            <div className="flex items-end justify-center space-x-8">
              {/* Second Place */}
              <motion.div
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.7 }}
                className="text-center"
              >
                <div className="bg-gradient-to-r from-gray-400/20 to-gray-500/20 backdrop-blur-md rounded-xl p-6 border border-gray-400/40 h-32 flex flex-col justify-end">
                  <img
                    src={leaderboard[1].avatar || `https://ui-avatars.com/api/?name=${leaderboard[1].username}&background=6366f1&color=fff`}
                    alt={leaderboard[1].username}
                    className="w-16 h-16 rounded-full mx-auto mb-2 border-4 border-gray-400"
                  />
                  <h3 className="text-white font-semibold">{leaderboard[1].username}</h3>
                  <p className="text-gray-300 text-sm">{leaderboard[1].totalScore} pts</p>
                </div>
                <div className="mt-2">
                  <Medal className="w-8 h-8 text-gray-300 mx-auto" />
                  <p className="text-gray-300 font-bold">#2</p>
                </div>
              </motion.div>

              {/* First Place */}
              <motion.div
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
                className="text-center"
              >
                <div className="bg-gradient-to-r from-yellow-500/20 to-orange-500/20 backdrop-blur-md rounded-xl p-6 border border-yellow-500/40 h-40 flex flex-col justify-end">
                  <img
                    src={leaderboard[0].avatar || `https://ui-avatars.com/api/?name=${leaderboard[0].username}&background=6366f1&color=fff`}
                    alt={leaderboard[0].username}
                    className="w-20 h-20 rounded-full mx-auto mb-2 border-4 border-yellow-400"
                  />
                  <h3 className="text-white font-bold text-lg">{leaderboard[0].username}</h3>
                  <p className="text-yellow-300">{leaderboard[0].totalScore} pts</p>
                </div>
                <div className="mt-2">
                  <Crown className="w-10 h-10 text-yellow-400 mx-auto" />
                  <p className="text-yellow-400 font-bold text-lg">#1</p>
                </div>
              </motion.div>

              {/* Third Place */}
              <motion.div
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.8 }}
                className="text-center"
              >
                <div className="bg-gradient-to-r from-amber-600/20 to-amber-700/20 backdrop-blur-md rounded-xl p-6 border border-amber-600/40 h-28 flex flex-col justify-end">
                  <img
                    src={leaderboard[2].avatar || `https://ui-avatars.com/api/?name=${leaderboard[2].username}&background=6366f1&color=fff`}
                    alt={leaderboard[2].username}
                    className="w-14 h-14 rounded-full mx-auto mb-2 border-4 border-amber-600"
                  />
                  <h3 className="text-white font-semibold text-sm">{leaderboard[2].username}</h3>
                  <p className="text-amber-400 text-sm">{leaderboard[2].totalScore} pts</p>
                </div>
                <div className="mt-2">
                  <Award className="w-7 h-7 text-amber-600 mx-auto" />
                  <p className="text-amber-600 font-bold">#3</p>
                </div>
              </motion.div>
            </div>
          </motion.div>
        )}

        {/* Full Leaderboard */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.9 }}
          className="bg-white/10 backdrop-blur-md rounded-xl border border-white/20 overflow-hidden"
        >
          <div className="p-6 border-b border-white/20">
            <h2 className="text-2xl font-semibold text-white flex items-center">
              <Trophy className="w-6 h-6 mr-2" />
              Full Rankings
            </h2>
          </div>

          <div className="divide-y divide-white/10">
            {filteredLeaderboard.map((userEntry, index) => (
              <motion.div
                key={userEntry.username}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
                className={`p-6 ${getRankBg(userEntry.rank)} ${
                  userEntry.username === user?.username
                    ? 'ring-2 ring-purple-500/50'
                    : 'hover:bg-white/5'
                } transition-all duration-200`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    {getRankIcon(userEntry.rank)}
                    
                    <img
                      src={userEntry.avatar || `https://ui-avatars.com/api/?name=${userEntry.username}&background=6366f1&color=fff`}
                      alt={userEntry.username}
                      className="w-12 h-12 rounded-full border-2 border-white/20"
                    />
                    
                    <div>
                      <div className="flex items-center space-x-2">
                        <h3 className="text-white font-semibold text-lg">
                          {userEntry.username}
                          {userEntry.username === user?.username && (
                            <span className="ml-2 text-purple-400 text-sm">(You)</span>
                          )}
                        </h3>
                      </div>
                      
                      <div className="flex items-center space-x-4 text-white/60 text-sm">
                        <span>{userEntry.totalQuizzes} quizzes</span>
                        <span className={getScoreColor(userEntry.averageScore)}>
                          {Math.round(userEntry.averageScore)}% avg
                        </span>
                      </div>
                      
                      {userEntry.badges.length > 0 && (
                        <div className="flex items-center space-x-1 mt-1">
                          {userEntry.badges.slice(0, 3).map((badge, badgeIndex) => (
                            <div
                              key={badgeIndex}
                              className="flex items-center space-x-1 px-2 py-1 bg-yellow-500/20 text-yellow-400 text-xs rounded-full"
                            >
                              <Star className="w-3 h-3" />
                              <span>{badge}</span>
                            </div>
                          ))}
                          {userEntry.badges.length > 3 && (
                            <span className="text-white/60 text-xs">
                              +{userEntry.badges.length - 3} more
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div className="text-right">
                    <div className="text-2xl font-bold text-white">
                      {userEntry.totalScore}
                    </div>
                    <div className="text-white/60 text-sm">total points</div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Empty State */}
        {filteredLeaderboard.length === 0 && searchTerm && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-12"
          >
            <Users className="w-16 h-16 text-white/50 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-white mb-2">No players found</h3>
            <p className="text-white/70">Try adjusting your search term</p>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default LeaderboardPage;