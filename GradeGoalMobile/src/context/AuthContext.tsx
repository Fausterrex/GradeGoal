import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User } from '../types';
import { authService } from '../services/authService';
import { StreakService, StreakData } from '../services/streakService';
import { DashboardService } from '../services/dashboardService';

interface AuthContextType {
  currentUser: User | null;
  isLoading: boolean;
  streakData: StreakData | null;
  login: (email: string, password: string) => Promise<void>;
  register: (userData: any) => Promise<void>;
  logout: () => Promise<void>;
  googleLogin: () => Promise<void>;
  facebookLogin: () => Promise<void>;
  updateStreak: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [streakData, setStreakData] = useState<StreakData | null>(null);

  useEffect(() => {
    const unsubscribe = authService.onAuthStateChanged((user) => {
      setCurrentUser(user);
      setIsLoading(false);
      
      // Update streak when user changes
      if (user?.userId) {
        updateStreak();
      } else {
        setStreakData(null);
      }
    });

    // Set a timeout to ensure loading state is cleared even if auth service doesn't respond
    const timeout = setTimeout(() => {
      setIsLoading(false);
    }, 3000);

    return () => {
      unsubscribe();
      clearTimeout(timeout);
    };
  }, []);

  const updateStreak = async () => {
    if (!currentUser?.userId) return;
    
    try {
      // Use the same approach as the web version - just fetch the current streak
      const streak = await DashboardService.getUserLoginStreak(currentUser.userId) as StreakData;
      setStreakData(streak);
    } catch (error) {
      // Set default streak data on error
      setStreakData({
        streakDays: 0,
        lastActivityDate: new Date().toISOString(),
        isStreakActive: false,
      });
    }
  };

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      const user = await authService.login(email, password);
      setCurrentUser(user);
      // Update streak on successful login
      if (user?.userId) {
        await updateStreak();
      }
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (userData: any) => {
    setIsLoading(true);
    try {
      const user = await authService.register(userData);
      setCurrentUser(user);
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    setIsLoading(true);
    try {
      await authService.logout();
      setCurrentUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  const googleLogin = async () => {
    setIsLoading(true);
    try {
      const user = await authService.googleLogin();
      setCurrentUser(user);
      // Update streak on successful login
      if (user?.userId) {
        await updateStreak();
      }
    } finally {
      setIsLoading(false);
    }
  };

  const facebookLogin = async () => {
    setIsLoading(true);
    try {
      const user = await authService.facebookLogin();
      setCurrentUser(user);
      // Update streak on successful login
      if (user?.userId) {
        await updateStreak();
      }
    } finally {
      setIsLoading(false);
    }
  };

  const value: AuthContextType = {
    currentUser,
    isLoading,
    streakData,
    login,
    register,
    logout,
    googleLogin,
    facebookLogin,
    updateStreak,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
