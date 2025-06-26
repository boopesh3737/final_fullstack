import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import axios from 'axios';
import {
  Trophy,
  Users,
  Calendar,
  Clock,
  Plus,
  Filter,
  Search,
  Star,
  MapPin,
  Award,
  Zap
} from 'lucide-react';
import LoadingSpinner from '../components/LoadingSpinner';

interface Tournament {
  _id: string;
  title: string;
  description: string;
  quiz: {
    title: string;
    category: string;
    difficulty: string;
  };
  creator: {
    username: string;
    avatar: string;
  };
  participants: any[];
  maxParticipants: number;
  startTime: string;
  endTime: string;
  status: 'upcoming' | 'active' | 'completed' | 'cancelled';
  prizes: Array<{
    position: number;
    description: string;
    points: number;
  }>;
  entryFee: number;
  isPrivate: boolean;
}

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;

const TournamentPage = () => {
  const [tournaments, setTournaments] = useState<Tournament[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const statusOptions = [
    { value: 'all', label: 'All Tournaments' },
    { value: 'upcoming', label: 'Upcoming' },
    { value: 'active', label: 'Live' },
    { value: 'completed', label: 'Completed' }
  ];

  const fetchTournaments = async () => {
    try {
      setIsLoading(true);
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: '12'
      });

      if (statusFilter !== 'all') params.append('status', statusFilter);

      const response = await axios.get(`${BACKEND_URL}/api/tournament?${params}`);
      setTournaments(response.data.tournaments);
      setTotalPages(response.data.totalPages);
    } catch (error) {
      console.error('Failed to fetch tournaments:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchTournaments();
  }, [currentPage, statusFilter]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'upcoming': return 'text-blue-400 bg-blue-400/20';
      case 'active': return 'text-green-400 bg-green-400/20';
      case 'completed': return 'text-gray-400 bg-gray-400/20';
      case 'cancelled': return 'text-red-400 bg-red-400/20';
      default: return 'text-gray-400 bg-gray-400/20';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'upcoming': return <Calendar className="w-4 h-4" />;
      case 'active': return <Zap className="w-4 h-4" />;
      case 'completed': return <Award className="w-4 h-4" />;
      default: return <Clock className="w-4 h-4" />;
    }
  };

  const TournamentCard = ({ tournament }: { tournament: Tournament }) => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -5 }}
      className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20 hover:border-white/40 transition-all duration-200 group"
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <h3 className="text-xl font-semibold text-white mb-2 group-hover:text-purple-300 transition-colors">
            {tournament.title}
          </h3>
          <p className="text-white/70 text-sm mb-3 line-clamp-2">
            {tournament.description}
          </p>
        </div>
      </div>

      {/* Quiz Info */}
      <div className="bg-white/5 rounded-lg p-3 mb-4">
        <div className="flex items-center space-x-2 mb-1">
          <Trophy className="w-4 h-4 text-purple-400" />
          <span className="text-white font-medium">{tournament.quiz.title}</span>
        </div>
        <div className="text-white/60 text-sm">
          {tournament.quiz.category} • {tournament.quiz.difficulty}
        </div>
      </div>

      {/* Status and Participants */}
      <div className="flex items-center justify-between mb-4">
        <div className={`flex items-center space-x-2 px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(tournament.status)}`}>
          {getStatusIcon(tournament.status)}
          <span>{tournament.status.charAt(0).toUpperCase() + tournament.status.slice(1)}</span>
        </div>
        
        <div className="flex items-center space-x-2 text-white/60">
          <Users className="w-4 h-4" />
          <span className="text-sm">
            {tournament.participants.length}/{tournament.maxParticipants}
          </span>
        </div>
      </div>

      {/* Time */}
      <div className="flex items-center space-x-4 text-white/60 text-sm mb-4">
        <div className="flex items-center space-x-1">
          <Calendar className="w-4 h-4" />
          <span>{new Date(tournament.startTime).toLocaleDateString()}</span>
        </div>
        <div className="flex items-center space-x-1">
          <Clock className="w-4 h-4" />
          <span>{new Date(tournament.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
        </div>
      </div>

      {/* Prizes */}
      {tournament.prizes.length > 0 && (
        <div className="mb-4">
          <div className="text-white/80 text-sm mb-2">Prizes:</div>
          <div className="flex flex-wrap gap-2">
            {tournament.prizes.slice(0, 3).map((prize, index) => (
              <span
                key={index}
                className="px-2 py-1 bg-yellow-500/20 text-yellow-400 text-xs rounded-full"
              >
                #{prize.position}: {prize.points} pts
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Footer */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <img
            src={tournament.creator?.avatar || `https://ui-avatars.com/api/?name=${tournament.creator?.username}&background=6366f1&color=fff`}
            alt={tournament.creator?.username}
            className="w-6 h-6 rounded-full"
          />
          <span className="text-white/60 text-sm">{tournament.creator?.username}</span>
        </div>

        <Link to={`/tournament/${tournament._id}`}>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
              tournament.status === 'active'
                ? 'bg-gradient-to-r from-green-500 to-emerald-500 text-white hover:shadow-lg'
                : tournament.status === 'upcoming'
                ? 'bg-gradient-to-r from-purple-500 to-blue-500 text-white hover:shadow-lg'
                : 'bg-white/10 text-white/70 hover:bg-white/20'
            }`}
          >
            {tournament.status === 'active' ? 'Join Live' :
             tournament.status === 'upcoming' ? 'View Details' :
             'View Results'}
          </motion.button>
        </Link>
      </div>
    </motion.div>
  );

  return (
    <div className="min-h-screen p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
                Tournaments
              </h1>
              <p className="text-xl text-white/70">
                Compete with others in live quiz tournaments
              </p>
            </div>
            <Link to="/create-tournament">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-purple-500 to-blue-500 text-white font-semibold rounded-lg hover:shadow-lg transition-all duration-200"
              >
                <Plus className="w-5 h-5" />
                <span>Create Tournament</span>
              </motion.button>
            </Link>
          </div>
        </motion.div>

        {/* Filters */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20 mb-8"
        >
          <div className="grid md:grid-cols-3 gap-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-white/50" />
              <input
                type="text"
                placeholder="Search tournaments..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>

            {/* Status Filter */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
            >
              {statusOptions.map(option => (
                <option key={option.value} value={option.value} className="bg-gray-800">
                  {option.label}
                </option>
              ))}
            </select>

            {/* Live Tournaments Counter */}
            <div className="flex items-center justify-center p-3 bg-gradient-to-r from-green-500/20 to-emerald-500/20 rounded-lg border border-green-500/30">
              <Zap className="w-5 h-5 text-green-400 mr-2" />
              <span className="text-white font-medium">
                {tournaments.filter(t => t.status === 'active').length} Live Now
              </span>
            </div>
          </div>
        </motion.div>

        {/* Tournaments Grid */}
        {isLoading ? (
          <div className="flex justify-center py-12">
            <LoadingSpinner />
          </div>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {tournaments.map((tournament, index) => (
              <motion.div
                key={tournament._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <TournamentCard tournament={tournament} />
              </motion.div>
            ))}
          </motion.div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="flex justify-center mt-8"
          >
            <div className="flex space-x-2">
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                <button
                  key={page}
                  onClick={() => setCurrentPage(page)}
                  className={`px-4 py-2 rounded-lg transition-all duration-200 ${
                    currentPage === page
                      ? 'bg-purple-500 text-white'
                      : 'bg-white/10 text-white/70 hover:bg-white/20'
                  }`}
                >
                  {page}
                </button>
              ))}
            </div>
          </motion.div>
        )}

        {/* Empty State */}
        {!isLoading && tournaments.length === 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-12"
          >
            <Trophy className="w-16 h-16 text-white/50 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-white mb-2">No tournaments found</h3>
            <p className="text-white/70 mb-4">Be the first to create a tournament!</p>
            <Link to="/create-tournament">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="px-6 py-3 bg-gradient-to-r from-purple-500 to-blue-500 text-white font-semibold rounded-lg hover:shadow-lg transition-all duration-200"
              >
                Create Tournament
              </motion.button>
            </Link>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default TournamentPage;