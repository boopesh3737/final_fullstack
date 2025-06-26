import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import axios from 'axios';
import {
  BookOpen,
  Trophy,
  Award,
  TrendingUp,
  Calendar,
  Users,
  Star,
  Play,
  Plus,
  Clock
} from 'lucide-react';
import { useAuthStore } from '../store/authStore';
import LoadingSpinner from '../components/LoadingSpinner';

interface DashboardData {
  user: any;
  recentQuizzes: any[];
  upcomingTournaments: any[];
}

const DashboardPage = () => {
  const { user } = useAuthStore();
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const response = await axios.get('http://localhost:5000/api/user/dashboard');
        setDashboardData(response.data);
      } catch (error) {
        console.error('Failed to fetch dashboard data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  const quickStats = [
    {
      icon: BookOpen,
      label: 'Quizzes Taken',
      value: user?.stats?.totalQuizzes || 0,
      color: 'from-blue-500 to-cyan-500'
    },
    {
      icon: Trophy,
      label: 'Total Score',
      value: user?.stats?.totalScore || 0,
      color: 'from-purple-500 to-pink-500'
    },
    {
      icon: Award,
      label: 'Average Score',
      value: `${Math.round(user?.stats?.averageScore || 0)}%`,
      color: 'from-green-500 to-emerald-500'
    },
    {
      icon: TrendingUp,
      label: 'Global Rank',
      value: `#${dashboardData?.user?.rank || 'N/A'}`,
      color: 'from-orange-500 to-red-500'
    }
  ];

  return (
    <div className="min-h-screen p-6">
      <div className="max-w-7xl mx-auto">
        {/* Welcome Section */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-8"
        >
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
            Welcome back, {user?.username}! 🎉
          </h1>
          <p className="text-xl text-white/70">
            Ready to challenge your knowledge today?
          </p>
        </motion.div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {quickStats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20 hover:border-white/40 transition-all duration-200"
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

        {/* Quick Actions */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="mb-8"
        >
          <h2 className="text-2xl font-bold text-white mb-6">Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Link to="/quiz">
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="bg-gradient-to-r from-blue-500 to-cyan-500 rounded-xl p-6 text-white cursor-pointer shadow-lg hover:shadow-xl transition-all duration-200"
              >
                <Play className="w-8 h-8 mb-4" />
                <h3 className="text-xl font-semibold mb-2">Take Quiz</h3>
                <p className="text-white/90">Challenge yourself with a quiz</p>
              </motion.div>
            </Link>

            <Link to="/create-quiz">
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl p-6 text-white cursor-pointer shadow-lg hover:shadow-xl transition-all duration-200"
              >
                <Plus className="w-8 h-8 mb-4" />
                <h3 className="text-xl font-semibold mb-2">Create Quiz</h3>
                <p className="text-white/90">Build your own quiz</p>
              </motion.div>
            </Link>

            <Link to="/tournaments">
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="bg-gradient-to-r from-green-500 to-emerald-500 rounded-xl p-6 text-white cursor-pointer shadow-lg hover:shadow-xl transition-all duration-200"
              >
                <Trophy className="w-8 h-8 mb-4" />
                <h3 className="text-xl font-semibold mb-2">Join Tournament</h3>
                <p className="text-white/90">Compete with others</p>
              </motion.div>
            </Link>
          </div>
        </motion.div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Recent Quizzes */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.6 }}
            className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20"
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-white">Recent Quizzes</h2>
              <Link to="/quiz" className="text-purple-400 hover:text-purple-300 transition-colors">
                View All
              </Link>
            </div>

            <div className="space-y-4">
              {dashboardData?.recentQuizzes?.slice(0, 5).map((quiz, index) => (
                <Link
                  key={quiz._id}
                  to={`/quiz/${quiz._id}`}
                  className="block p-4 bg-white/5 rounded-lg hover:bg-white/10 transition-all duration-200 border border-white/10 hover:border-white/20"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-semibold text-white mb-1">{quiz.title}</h3>
                      <p className="text-white/60 text-sm">by {quiz.creator?.username}</p>
                    </div>
                    <div className="text-right">
                      <div className="flex items-center space-x-2 text-white/60 text-sm">
                        <Users className="w-4 h-4" />
                        <span>{quiz.totalAttempts}</span>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </motion.div>

          {/* Upcoming Tournaments */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.8 }}
            className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20"
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-white">Upcoming Tournaments</h2>
              <Link to="/tournaments" className="text-purple-400 hover:text-purple-300 transition-colors">
                View All
              </Link>
            </div>

            <div className="space-y-4">
              {dashboardData?.upcomingTournaments?.slice(0, 5).map((tournament, index) => (
                <Link
                  key={tournament._id}
                  to={`/tournament/${tournament._id}`}
                  className="block p-4 bg-white/5 rounded-lg hover:bg-white/10 transition-all duration-200 border border-white/10 hover:border-white/20"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-semibold text-white mb-1">{tournament.title}</h3>
                      <p className="text-white/60 text-sm">{tournament.quiz?.title}</p>
                    </div>
                    <div className="text-right">
                      <div className="flex items-center space-x-2 text-white/60 text-sm">
                        <Clock className="w-4 h-4" />
                        <span>{new Date(tournament.startTime).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </motion.div>
        </div>

        {/* Achievements Section */}
        {user?.stats?.badges?.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 1.0 }}
            className="mt-8 bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20"
          >
            <h2 className="text-xl font-bold text-white mb-6">Recent Achievements</h2>
            <div className="flex flex-wrap gap-4">
              {user.stats.badges.map((badge, index) => (
                <div
                  key={index}
                  className="flex items-center space-x-2 bg-gradient-to-r from-yellow-500/20 to-orange-500/20 px-4 py-2 rounded-lg border border-yellow-500/30"
                >
                  <Star className="w-4 h-4 text-yellow-400" />
                  <span className="text-white font-medium">{badge}</span>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default DashboardPage;