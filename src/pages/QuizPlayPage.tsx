import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import {
  Clock,
  CheckCircle,
  XCircle,
  ArrowRight,
  ArrowLeft,
  Trophy,
  Target,
  Zap
} from 'lucide-react';
import LoadingSpinner from '../components/LoadingSpinner';
import { useAuthStore } from '../store/authStore';
import toast from 'react-hot-toast';

interface Question {
  _id: string;
  question: string;
  options: string[];
  correctAnswer: number;
  points: number;
  timeLimit: number;
}

interface Quiz {
  _id: string;
  title: string;
  description: string;
  questions: Question[];
  creator: {
    username: string;
    avatar: string;
  };
  category: string;
  difficulty: string;
}

const QuizPlayPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { updateUser } = useAuthStore();
  
  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<number[]>([]);
  const [timeLeft, setTimeLeft] = useState(0);
  const [isQuizCompleted, setIsQuizCompleted] = useState(false);
  const [results, setResults] = useState<any>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const fetchQuiz = async () => {
      try {
        const response = await axios.get(`http://localhost:5000/api/quiz/${id}`);
        setQuiz(response.data);
        setSelectedAnswers(new Array(response.data.questions.length).fill(-1));
        setTimeLeft(response.data.questions[0]?.timeLimit || 30);
      } catch (error) {
        console.error('Failed to fetch quiz:', error);
        toast.error('Failed to load quiz');
        navigate('/quiz');
      } finally {
        setIsLoading(false);
      }
    };

    if (id) {
      fetchQuiz();
    }
  }, [id, navigate]);

  useEffect(() => {
    if (!quiz || isQuizCompleted || timeLeft <= 0) return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          handleNextQuestion();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [currentQuestionIndex, timeLeft, quiz, isQuizCompleted]);

  const handleAnswerSelect = (answerIndex: number) => {
    const newAnswers = [...selectedAnswers];
    newAnswers[currentQuestionIndex] = answerIndex;
    setSelectedAnswers(newAnswers);
  };

  const handleNextQuestion = () => {
    if (currentQuestionIndex < quiz!.questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
      setTimeLeft(quiz!.questions[currentQuestionIndex + 1]?.timeLimit || 30);
    } else {
      handleSubmitQuiz();
    }
  };

  const handlePreviousQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
      setTimeLeft(quiz!.questions[currentQuestionIndex - 1]?.timeLimit || 30);
    }
  };

  const handleSubmitQuiz = async () => {
    if (isSubmitting) return;
    
    setIsSubmitting(true);
    try {
      const response = await axios.post(`http://localhost:5000/api/quiz/${id}/submit`, {
        answers: selectedAnswers
      });
      
      setResults(response.data);
      setIsQuizCompleted(true);
      updateUser({ stats: response.data.stats });
      toast.success('Quiz completed successfully!');
    } catch (error) {
      console.error('Failed to submit quiz:', error);
      toast.error('Failed to submit quiz');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  if (!quiz) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-white mb-4">Quiz not found</h2>
          <button
            onClick={() => navigate('/quiz')}
            className="px-6 py-3 bg-gradient-to-r from-purple-500 to-blue-500 text-white rounded-lg hover:shadow-lg transition-all duration-200"
          >
            Back to Quizzes
          </button>
        </div>
      </div>
    );
  }

  if (isQuizCompleted && results) {
    return (
      <div className="min-h-screen p-6 flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6 }}
          className="max-w-2xl w-full bg-white/10 backdrop-blur-md rounded-2xl p-8 border border-white/20"
        >
          <div className="text-center mb-8">
            <div className="w-20 h-20 bg-gradient-to-r from-yellow-400 to-orange-400 rounded-full flex items-center justify-center mx-auto mb-4">
              <Trophy className="w-10 h-10 text-white" />
            </div>
            <h2 className="text-3xl font-bold text-white mb-2">Quiz Completed!</h2>
            <p className="text-white/70">Great job on completing the quiz</p>
          </div>

          <div className="grid md:grid-cols-3 gap-6 mb-8">
            <div className="text-center p-4 bg-white/10 rounded-xl">
              <Target className="w-8 h-8 text-green-400 mx-auto mb-2" />
              <div className="text-2xl font-bold text-white">{results.score}</div>
              <div className="text-white/60 text-sm">Your Score</div>
            </div>
            <div className="text-center p-4 bg-white/10 rounded-xl">
              <Zap className="w-8 h-8 text-blue-400 mx-auto mb-2" />
              <div className="text-2xl font-bold text-white">{Math.round(results.percentage)}%</div>
              <div className="text-white/60 text-sm">Accuracy</div>
            </div>
            <div className="text-center p-4 bg-white/10 rounded-xl">
              <Trophy className="w-8 h-8 text-purple-400 mx-auto mb-2" />
              <div className="text-2xl font-bold text-white">{results.maxScore}</div>
              <div className="text-white/60 text-sm">Max Score</div>
            </div>
          </div>

          <div className="space-y-4 mb-8">
            <h3 className="text-xl font-semibold text-white mb-4">Question Results</h3>
            {results.results.map((result: any, index: number) => (
              <div
                key={index}
                className={`p-4 rounded-lg border ${
                  result.isCorrect
                    ? 'bg-green-500/20 border-green-500/40'
                    : 'bg-red-500/20 border-red-500/40'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-white font-medium">Question {index + 1}</span>
                  <div className="flex items-center space-x-2">
                    {result.isCorrect ? (
                      <CheckCircle className="w-5 h-5 text-green-400" />
                    ) : (
                      <XCircle className="w-5 h-5 text-red-400" />
                    )}
                    <span className="text-white">{result.points} pts</span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="flex space-x-4">
            <button
              onClick={() => navigate('/quiz')}
              className="flex-1 py-3 bg-white/10 text-white rounded-lg hover:bg-white/20 transition-all duration-200"
            >
              Browse More Quizzes
            </button>
            <button
              onClick={() => navigate('/dashboard')}
              className="flex-1 py-3 bg-gradient-to-r from-purple-500 to-blue-500 text-white rounded-lg hover:shadow-lg transition-all duration-200"
            >
              Back to Dashboard
            </button>
          </div>
        </motion.div>
      </div>
    );
  }

  const currentQuestion = quiz.questions[currentQuestionIndex];
  const progress = ((currentQuestionIndex + 1) / quiz.questions.length) * 100;

  return (
    <div className="min-h-screen p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20 mb-6"
        >
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-2xl font-bold text-white">{quiz.title}</h1>
              <p className="text-white/70">by {quiz.creator.username}</p>
            </div>
            <div className="text-right">
              <div className="flex items-center space-x-2 text-white/60">
                <Clock className="w-5 h-5" />
                <span className="text-2xl font-bold text-white">{timeLeft}s</span>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between text-white/60 text-sm mb-2">
            <span>Question {currentQuestionIndex + 1} of {quiz.questions.length}</span>
            <span>{Math.round(progress)}% Complete</span>
          </div>
          
          <div className="w-full bg-white/20 rounded-full h-2">
            <motion.div
              className="bg-gradient-to-r from-purple-500 to-blue-500 h-2 rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.5 }}
            />
          </div>
        </motion.div>

        {/* Question */}
        <AnimatePresence mode="wait">
          <motion.div
            key={currentQuestionIndex}
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            transition={{ duration: 0.3 }}
            className="bg-white/10 backdrop-blur-md rounded-xl p-8 border border-white/20 mb-6"
          >
            <h2 className="text-2xl font-semibold text-white mb-8">
              {currentQuestion.question}
            </h2>

            <div className="grid gap-4">
              {currentQuestion.options.map((option, index) => (
                <motion.button
                  key={index}
                  onClick={() => handleAnswerSelect(index)}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className={`p-4 rounded-lg border-2 text-left transition-all duration-200 ${
                    selectedAnswers[currentQuestionIndex] === index
                      ? 'bg-purple-500/30 border-purple-400 text-white'
                      : 'bg-white/5 border-white/20 text-white/80 hover:bg-white/10 hover:border-white/40'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                      selectedAnswers[currentQuestionIndex] === index
                        ? 'border-purple-400 bg-purple-500'
                        : 'border-white/40'
                    }`}>
                      {selectedAnswers[currentQuestionIndex] === index && (
                        <div className="w-3 h-3 bg-white rounded-full" />
                      )}
                    </div>
                    <span className="font-medium">{option}</span>
                  </div>
                </motion.button>
              ))}
            </div>
          </motion.div>
        </AnimatePresence>

        {/* Navigation */}
        <div className="flex items-center justify-between">
          <button
            onClick={handlePreviousQuestion}
            disabled={currentQuestionIndex === 0}
            className="flex items-center space-x-2 px-6 py-3 bg-white/10 text-white rounded-lg hover:bg-white/20 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Previous</span>
          </button>

          <div className="text-white/60 text-sm">
            {selectedAnswers[currentQuestionIndex] !== -1 ? (
              <span className="text-green-400">✓ Answered</span>
            ) : (
              <span>Select an answer</span>
            )}
          </div>

          {currentQuestionIndex === quiz.questions.length - 1 ? (
            <motion.button
              onClick={handleSubmitQuiz}
              disabled={isSubmitting}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-lg hover:shadow-lg transition-all duration-200 disabled:opacity-50"
            >
              <Trophy className="w-5 h-5" />
              <span>{isSubmitting ? 'Submitting...' : 'Submit Quiz'}</span>
            </motion.button>
          ) : (
            <button
              onClick={handleNextQuestion}
              className="flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-purple-500 to-blue-500 text-white rounded-lg hover:shadow-lg transition-all duration-200"
            >
              <span>Next</span>
              <ArrowRight className="w-5 h-5" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default QuizPlayPage;