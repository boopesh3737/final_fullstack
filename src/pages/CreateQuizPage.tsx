import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import axios from 'axios';
import {
  Plus,
  Trash2,
  Save,
  BookOpen,
  Clock,
  Target,
  ChevronDown,
  X
} from 'lucide-react';
import toast from 'react-hot-toast';

interface Question {
  question: string;
  options: string[];
  correctAnswer: number;
  difficulty: 'easy' | 'medium' | 'hard';
  points: number;
  timeLimit: number;
}

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;

const CreateQuizPage = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  
  const [quizData, setQuizData] = useState({
    title: '',
    description: '',
    category: 'General Knowledge',
    difficulty: 'medium' as 'easy' | 'medium' | 'hard',
    isPublic: true,
    tags: [] as string[],
    timeLimit: 0
  });

  const [questions, setQuestions] = useState<Question[]>([
    {
      question: '',
      options: ['', '', '', ''],
      correctAnswer: 0,
      difficulty: 'medium',
      points: 10,
      timeLimit: 30
    }
  ]);

  const [tagInput, setTagInput] = useState('');

  const categories = [
    'General Knowledge',
    'Science',
    'History',
    'Sports',
    'Technology',
    'Entertainment',
    'Literature',
    'Geography'
  ];

  const difficulties = ['easy', 'medium', 'hard'];

  const addQuestion = () => {
    setQuestions([
      ...questions,
      {
        question: '',
        options: ['', '', '', ''],
        correctAnswer: 0,
        difficulty: 'medium',
        points: 10,
        timeLimit: 30
      }
    ]);
  };

  const removeQuestion = (index: number) => {
    if (questions.length > 1) {
      setQuestions(questions.filter((_, i) => i !== index));
    }
  };

  const updateQuestion = (index: number, field: keyof Question, value: any) => {
    const updatedQuestions = [...questions];
    updatedQuestions[index] = { ...updatedQuestions[index], [field]: value };
    setQuestions(updatedQuestions);
  };

  const updateQuestionOption = (questionIndex: number, optionIndex: number, value: string) => {
    const updatedQuestions = [...questions];
    updatedQuestions[questionIndex].options[optionIndex] = value;
    setQuestions(updatedQuestions);
  };

  const addTag = () => {
    if (tagInput.trim() && !quizData.tags.includes(tagInput.trim())) {
      setQuizData({
        ...quizData,
        tags: [...quizData.tags, tagInput.trim()]
      });
      setTagInput('');
    }
  };

  const removeTag = (tagToRemove: string) => {
    setQuizData({
      ...quizData,
      tags: quizData.tags.filter(tag => tag !== tagToRemove)
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation
    if (!quizData.title.trim()) {
      toast.error('Quiz title is required');
      return;
    }

    if (questions.some(q => !q.question.trim())) {
      toast.error('All questions must have content');
      return;
    }

    if (questions.some(q => q.options.some(opt => !opt.trim()))) {
      toast.error('All answer options must be filled');
      return;
    }

    setIsLoading(true);
    try {
      const response = await axios.post(`${BACKEND_URL}/api/quiz`, {
        ...quizData,
        questions
      });

      toast.success('Quiz created successfully!');
      navigate(`/quiz/${response.data.quiz._id}`);
    } catch (error: any) {
      const message = error.response?.data?.message || 'Failed to create quiz';
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  };

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
            Create New Quiz
          </h1>
          <p className="text-xl text-white/70">
            Build an engaging quiz to challenge your audience
          </p>
        </motion.div>

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Quiz Details */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20"
          >
            <h2 className="text-2xl font-semibold text-white mb-6 flex items-center">
              <BookOpen className="w-6 h-6 mr-2" />
              Quiz Information
            </h2>

            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="block text-white/80 mb-2 font-medium">Quiz Title</label>
                <input
                  type="text"
                  value={quizData.title}
                  onChange={(e) => setQuizData({ ...quizData, title: e.target.value })}
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  placeholder="Enter quiz title"
                  required
                />
              </div>

              <div>
                <label className="block text-white/80 mb-2 font-medium">Category</label>
                <select
                  value={quizData.category}
                  onChange={(e) => setQuizData({ ...quizData, category: e.target.value })}
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                >
                  {categories.map(category => (
                    <option key={category} value={category} className="bg-gray-800">
                      {category}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-white/80 mb-2 font-medium">Difficulty</label>
                <select
                  value={quizData.difficulty}
                  onChange={(e) => setQuizData({ ...quizData, difficulty: e.target.value as any })}
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                >
                  {difficulties.map(difficulty => (
                    <option key={difficulty} value={difficulty} className="bg-gray-800">
                      {difficulty.charAt(0).toUpperCase() + difficulty.slice(1)}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-white/80 mb-2 font-medium">Time Limit (minutes, 0 = no limit)</label>
                <input
                  type="number"
                  value={quizData.timeLimit}
                  onChange={(e) => setQuizData({ ...quizData, timeLimit: parseInt(e.target.value) || 0 })}
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  min="0"
                  placeholder="0"
                />
              </div>
            </div>

            <div className="mt-6">
              <label className="block text-white/80 mb-2 font-medium">Description</label>
              <textarea
                value={quizData.description}
                onChange={(e) => setQuizData({ ...quizData, description: e.target.value })}
                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none"
                rows={3}
                placeholder="Describe your quiz"
              />
            </div>

            {/* Tags */}
            <div className="mt-6">
              <label className="block text-white/80 mb-2 font-medium">Tags</label>
              <div className="flex flex-wrap gap-2 mb-2">
                {quizData.tags.map((tag, index) => (
                  <span
                    key={index}
                    className="flex items-center space-x-1 px-3 py-1 bg-purple-500/30 text-white rounded-full text-sm"
                  >
                    <span>{tag}</span>
                    <button
                      type="button"
                      onClick={() => removeTag(tag)}
                      className="text-white/70 hover:text-white"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
              </div>
              <div className="flex space-x-2">
                <input
                  type="text"
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                  className="flex-1 px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  placeholder="Add a tag"
                />
                <button
                  type="button"
                  onClick={addTag}
                  className="px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors"
                >
                  Add
                </button>
              </div>
            </div>

            <div className="mt-6 flex items-center space-x-4">
              <label className="flex items-center space-x-2 text-white">
                <input
                  type="checkbox"
                  checked={quizData.isPublic}
                  onChange={(e) => setQuizData({ ...quizData, isPublic: e.target.checked })}
                  className="w-5 h-5 text-purple-500 rounded focus:ring-purple-500"
                />
                <span>Make this quiz public</span>
              </label>
            </div>
          </motion.div>

          {/* Questions */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20"
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-semibold text-white flex items-center">
                <Target className="w-6 h-6 mr-2" />
                Questions ({questions.length})
              </h2>
              <button
                type="button"
                onClick={addQuestion}
                className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-purple-500 to-blue-500 text-white rounded-lg hover:shadow-lg transition-all duration-200"
              >
                <Plus className="w-4 h-4" />
                <span>Add Question</span>
              </button>
            </div>

            <div className="space-y-8">
              {questions.map((question, questionIndex) => (
                <motion.div
                  key={questionIndex}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-white/5 rounded-xl p-6 border border-white/10"
                >
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-white">
                      Question {questionIndex + 1}
                    </h3>
                    {questions.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeQuestion(questionIndex)}
                        className="p-2 text-red-400 hover:text-red-300 hover:bg-red-500/20 rounded-lg transition-all duration-200"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>

                  <div className="space-y-4">
                    <div>
                      <label className="block text-white/80 mb-2">Question Text</label>
                      <textarea
                        value={question.question}
                        onChange={(e) => updateQuestion(questionIndex, 'question', e.target.value)}
                        className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none"
                        rows={2}
                        placeholder="Enter your question"
                        required
                      />
                    </div>

                    <div className="grid md:grid-cols-2 gap-4">
                      {question.options.map((option, optionIndex) => (
                        <div key={optionIndex}>
                          <label className="block text-white/80 mb-2">
                            Option {optionIndex + 1}
                            {question.correctAnswer === optionIndex && (
                              <span className="ml-2 px-2 py-1 bg-green-500/30 text-green-400 text-xs rounded-full">
                                Correct
                              </span>
                            )}
                          </label>
                          <div className="flex space-x-2">
                            <input
                              type="text"
                              value={option}
                              onChange={(e) => updateQuestionOption(questionIndex, optionIndex, e.target.value)}
                              className="flex-1 px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-purple-500"
                              placeholder={`Option ${optionIndex + 1}`}
                              required
                            />
                            <button
                              type="button"
                              onClick={() => updateQuestion(questionIndex, 'correctAnswer', optionIndex)}
                              className={`px-4 py-3 rounded-lg border-2 transition-all duration-200 ${
                                question.correctAnswer === optionIndex
                                  ? 'bg-green-500/30 border-green-400 text-green-400'
                                  : 'border-white/20 text-white/60 hover:border-green-400'
                              }`}
                            >
                              ✓
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className="grid md:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-white/80 mb-2">Difficulty</label>
                        <select
                          value={question.difficulty}
                          onChange={(e) => updateQuestion(questionIndex, 'difficulty', e.target.value)}
                          className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                        >
                          {difficulties.map(diff => (
                            <option key={diff} value={diff} className="bg-gray-800">
                              {diff.charAt(0).toUpperCase() + diff.slice(1)}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="block text-white/80 mb-2">Points</label>
                        <input
                          type="number"
                          value={question.points}
                          onChange={(e) => updateQuestion(questionIndex, 'points', parseInt(e.target.value) || 10)}
                          className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                          min="1"
                          max="100"
                        />
                      </div>

                      <div>
                        <label className="block text-white/80 mb-2">Time Limit (seconds)</label>
                        <input
                          type="number"
                          value={question.timeLimit}
                          onChange={(e) => updateQuestion(questionIndex, 'timeLimit', parseInt(e.target.value) || 30)}
                          className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                          min="10"
                          max="300"
                        />
                      </div>
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
              onClick={() => navigate('/quiz')}
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
              <span>{isLoading ? 'Creating...' : 'Create Quiz'}</span>
            </motion.button>
          </motion.div>
        </form>
      </div>
    </div>
  );
};

export default CreateQuizPage;