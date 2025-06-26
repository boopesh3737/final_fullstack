import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import axios from 'axios';
import toast from 'react-hot-toast';

const API_URL = `${import.meta.env.VITE_BACKEND_URL}/api`;

interface User {
  id: string;
  username: string;
  email: string;
  avatar: string;
  stats: {
    totalQuizzes: number;
    totalScore: number;
    averageScore: number;
    rank: number;
    badges: string[];
  };
}

interface AuthState {
  user: User | null;
  token: string | null;
  isLoading: boolean;
}

interface AuthActions {
  login: (email: string, password: string) => Promise<boolean>;
  register: (username: string, email: string, password: string) => Promise<boolean>;
  logout: () => void;
  checkAuth: () => Promise<void>;
  updateUser: (userData: Partial<User>) => void;
}

export const useAuthStore = create<AuthState & AuthActions>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isLoading: true,

      login: async (email: string, password: string) => {
        try {
          const response = await axios.post(`${API_URL}/auth/login`, {
            email,
            password
          });

          const { token, user } = response.data;
          
          set({ user, token, isLoading: false });
          
          // Set default authorization header
          axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
          
          toast.success('Welcome back!');
          return true;
        } catch (error: any) {
          const message = error.response?.data?.message || 'Login failed';
          toast.error(message);
          set({ isLoading: false });
          return false;
        }
      },

      register: async (username: string, email: string, password: string) => {
        try {
          const response = await axios.post(`${API_URL}/auth/register`, {
            username,
            email,
            password
          });

          const { token, user } = response.data;
          
          set({ user, token, isLoading: false });
          
          // Set default authorization header
          axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
          
          toast.success('Account created successfully!');
          return true;
        } catch (error: any) {
          const message = error.response?.data?.message || 'Registration failed';
          toast.error(message);
          set({ isLoading: false });
          return false;
        }
      },

      logout: () => {
        set({ user: null, token: null, isLoading: false });
        delete axios.defaults.headers.common['Authorization'];
        toast.success('Logged out successfully');
      },

      checkAuth: async () => {
        try {
          const { token } = get();
          
          if (!token) {
            set({ isLoading: false });
            return;
          }

          axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
          
          const response = await axios.get(`${API_URL}/auth/me`);
          set({ user: response.data, isLoading: false });
        } catch (error) {
          set({ user: null, token: null, isLoading: false });
          delete axios.defaults.headers.common['Authorization'];
        }
      },

      updateUser: (userData: Partial<User>) => {
        const { user } = get();
        if (user) {
          set({ user: { ...user, ...userData } });
        }
      }
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({ 
        token: state.token,
        user: state.user 
      })
    }
  )
);