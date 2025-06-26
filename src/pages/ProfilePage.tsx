import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import axios from 'axios';
import {
  User,
  Trophy,
  Target,
  Calendar,
  Star,
  Award,
  BookOpen,
  Edit3,
  Save,
  X,
  Crown,
  Medal,
  TrendingUp
} from 'lucide-react';
import LoadingSpinner from '../components/LoadingSpinner';
import { useAuthStore } from '../store/authStore';
import toast from 'react-hot-toast';

interface UserProfile {
  _id: string;
  username: string;
  avatar: string;
  stats: {
    totalQuizzes: number;
    totalScore: number;
    averageScore: number;
    badges: string[];
  };
  createdQuizzes: number;
  tournaments: number;
  createdAt: string;
}

const ProfilePage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, updateUser } = useAuthStore();
  
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({
    username: '',
    avatar: ''
  });
  const [isSaving, setIsSaving] = useState(false);

  const isOwnProfile = !id || id === user?.id;

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const profileId = id || user?.id;
        if (!profileId) {
          navigate('/login');
          return;
        }

        const response = await axios.get(`http://localhost:5000/api/user/profile/${profileId}`);
        setProfile(response.data);
        
        if (isOwnProfile) {
          setEditData({
            username: response.data.username,
            avatar: response.data.avatar || ''
          });
        }
      } catch (error) {
        console.error('Failed to fetch profile:', error);
        toast.error('Failed to load profile');
        navigate('/dashboard');
      } finally {
        setIsLoading(false);
      }
    };

    fetchProfile();
  }, [id, user?.id, navigate, isOwnProfile]);

  const handleSaveProfile = async () => {
    if (!editData.username.trim()) {
      toast.error('Username is required');
      return;
    }

    setIsSaving(true);
    try {
      const response = await axios.put('http://localhost:5000/api/user/profile', editData);
      setProfile(response.data);
      updateUser(response.data);
      setIsEditing(false);
      toast.success('Profile updated successfully!');
    } catch (error: any) {
      const message = error.response?.data?.message || 'Failed to update profile';
      toast.error(message);
    } finally {
      setIsSaving(false);
    }
  };

  const getBadgeIcon = (badge: string) => {
    switch (badge) {
      case 'Perfect Score':
        return <Crown className="w-4 h-4" />;
      case 'Quiz Master':
        return <Medal className="w-4 h-4" />;
      default:
        return <Star className="w-4 h-4" />;
    }
  };

  const getBadgeColor = (badge: string) => {
    switch (badge) {
      case 'Perfect Score':
        return 'from-yellow-500/20 to-orange-500/20 border-yellow-500/40 text-yellow-400';
      case 'Quiz Master':
        return 'from-purple-500/20 to-pink-500/20 border-purple-500/40 text-purple-400';
      default:
        return 'from-blue-500/20 to-cyan-500/20 border-blue-500/40 text-blue-400';
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-white mb-4">Profile not found</h2>
          <button
            onClick={() => navigate('/dashboard')}
            className="px-6 py-3 bg-gradient-to-r from-purple-500 to-blue-500 text-white rounded-lg hover:shadow-lg transition-all duration-200"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  const stats = [
    {
      icon: BookOpen,
      label: 'Quizzes Taken',
      value: profile.stats.totalQuizzes,
      color: 'from-blue-500 to-cyan-500'
    },
    {
      icon: Trophy,
      label: 'Total Score',
      value: profile.stats.totalScore,
      color: 'from-purple-500 to-pink-500'
    },
    {
      icon: Target,
      label: 'Average Score',
      value: `${Math.round(profile.stats.averageScore || 0)}%`,
      color: 'from-green-500 to-emerald-500'
    },
    {
      icon: Award,
      label: 'Badges Earned',
      value: profile.stats.badges.length,
      color: 'from-yellow-500 to-orange-500'
    }
  ];

  return (
    <div className="min-h-screen p-6">
      <div className="max-w-4xl mx-auto">
        {/* Profile Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white/10 backdrop-blur-md rounded-xl p-8 border border-white/20 mb-8"
        >
          <div className="flex flex-col md:flex-row items-center md:items-start space-y-6 md:space-y-0 md:space-x-8">
            {/* Avatar */}
            <div className="relative">
              <img
                src={profile.avatar || `https://ui-avatars.com/api/?name=${profile.username}&background=6366f1&color=fff&size=120`}
                alt={profile.username}
                className="w-32 h-32 rounded-full border-4 border-white/20"
              />
              {isOwnProfile && (
                <button
                  onClick={() => setIsEditing(!isEditing)}
                  className="absolute bottom-0 right-0 p-2 bg-purple-500 text-white rounded-full hover:bg-purple-600 transition-colors"
                >
                  <Edit3 className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* Profile Info */}
            <div className="flex-1 text-center md:text-left">
              {isEditing ? (
                <div className="space-y-4">
                  <div>
                    <label className="block text-white/80 mb-2">Username</label>
                    <input
                      type="text"
                      value={editData.username}
                      onChange={(e) => setEditData({ ...editData, username: e.target.value })}
                      className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                    />
                  </div>
                  <div>
                    <label className="block text-white/80 mb-2">Avatar URL (optional)</label>
                    <input
                      type="url"
                      value={editData.avatar}
                      onChange={(e) => setEditData({ ...editData, avatar: e.target.value })}
                      className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                      placeholder="https://example.com/avatar.jpg"
                    />
                  </div>
                  <div className="flex space-x-3">
                    <button
                      onClick={handleSaveProfile}
                      disabled={isSaving}
                      className="flex items-center space-x-2 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors disabled:opacity-50"
                    >
                      <Save className="w-4 h-4" />
                      <span>{isSaving ? 'Saving...' : 'Save'}</span>
                    </button>
                    <button
                      onClick={() => {
                        setIsEditing(false);
                        setEditData({
                          username: profile.username,
                          avatar: profile.avatar || ''
                        });
                      }}
                      className="flex items-center space-x-2 px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
                    >
                      <X className="w-4 h-4" />
                      <span>Cancel</span>
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">
                    {profile.username}
                  </h1>
                  <div className="flex items-center justify-center md:justify-start space-x-2 text-white/60 mb-4">
                    <Calendar className="w-4 h-4" />
                    <span>Joined {new Date(profile.createdAt).toLocaleDateString()}</span>
                  </div>
                  
                  <div className="flex items-center justify-center md:justify-start space-x-6 text-white/70">
                    <div className="text-center">
                      <div className="text-xl font-bold text-white">{profile.createdQuizzes}</div>
                      <div className="text-sm">Quizzes Created</div>
                    </div>
                    <div className="text-center">
                      <div className="text-xl font-bold text-white">{profile.tournaments}</div>
                      <div className="text-sm">Tournaments Joined</div>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </motion.div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-8">
          {stats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20 text-center"
              >
                <div className={`w-12 h-12 bg-gradient-to-r ${stat.color} rounded-lg flex items-center justify-center mx-auto mb-4`}>
                  <Icon className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-white mb-1">{stat.value}</h3>
                <p className="text-white/60 text-sm">{stat.label}</p>
              </motion.div>
            );
          })}
        </div>

        {/* Badges */}
        {profile.stats.badges.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20 mb-8"
          >
            <h2 className="text-2xl font-semibold text-white mb-6 flex items-center">
              <Award className="w-6 h-6 mr-2" />
              Achievements
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {profile.stats.badges.map((badge, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: index * 0.1 }}
                  className={`flex items-center space-x-3 p-4 bg-gradient-to-r ${getBadgeColor(badge)} rounded-lg border`}
                >
                  {getBadgeIcon(badge)}
                  <span className="font-medium">{badge}</span>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Performance Chart Placeholder */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20"
        >
          <h2 className="text-2xl font-semibold text-white mb-6 flex items-center">
            <TrendingUp className="w-6 h-6 mr-2" />
            Performance Overview
          </h2>
          
          <div className="grid md:grid-cols-3 gap-6">
            <div className="text-center p-6 bg-white/5 rounded-lg">
              <div className="text-3xl font-bold text-green-400 mb-2">
                {profile.stats.averageScore >= 80 ? 'Excellent' :
                 profile.stats.averageScore >= 60 ? 'Good' :
                 profile.stats.averageScore >= 40 ? 'Average' : 'Needs Work'}
              </div>
              <div className="text-white/60">Overall Performance</div>
            </div>
            
            <div className="text-center p-6 bg-white/5 rounded-lg">
              <div className="text-3xl font-bold text-blue-400 mb-2">
                {profile.stats.totalQuizzes >= 50 ? 'Expert' :
                 profile.stats.totalQuizzes >= 20 ? 'Experienced' :
                 profile.stats.totalQuizzes >= 5 ? 'Beginner' : 'New'}
              </div>
              <div className="text-white/60">Experience Level</div>
            </div>
            
            <div className="text-center p-6 bg-white/5 rounded-lg">
              <div className="text-3xl font-bold text-purple-400 mb-2">
                
                {profile.stats.badges.length >= 5 ? 'Champion' :
                 profile.stats.badges.length >= 3 ? 'Achiever' :
                 profile.stats.badges.length >= 1 ? 'Rising Star' : 'Starter'}
              </div>
              <div className="text-white/60">Achievement Level</div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default ProfilePage;