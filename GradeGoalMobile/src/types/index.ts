// Core Types
export interface User {
  userId: number;
  username?: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  isActive: boolean;
  emailNotificationsEnabled?: boolean;
  pushNotificationsEnabled?: boolean;
  fcmToken?: string;
  profilePictureUrl?: string;
  currentYearLevel: string;
  createdAt: string;
  updatedAt: string;
  lastLoginAt?: string;
}

export interface Course {
  courseId: string;
  userId: string;
  courseName: string;
  courseCode: string;
  credits: number;
  semester: string;
  academicYear: string;
  instructor: string;
  description?: string;
  color: string;
  createdAt: string;
  updatedAt: string;
}

export interface Grade {
  gradeId: string;
  courseId: string;
  assessmentName: string;
  assessmentType: 'quiz' | 'assignment' | 'exam' | 'project' | 'participation' | 'other';
  score: number;
  maxScore: number;
  weight: number;
  date: string;
  description?: string;
  createdAt: string;
  updatedAt: string;
}

export interface AcademicGoal {
  goalId: string;
  userId: string;
  courseId?: string;
  goalType: 'gpa' | 'grade' | 'attendance' | 'study_hours' | 'assignment_completion';
  targetValue: number;
  currentValue: number;
  targetDate: string;
  description: string;
  priority: 'low' | 'medium' | 'high';
  isAchieved: boolean;
  achievedDate?: string;
  semester: string;
  academicYear: string;
  createdAt: string;
  updatedAt: string;
}

export interface Notification {
  notificationId: string;
  userId: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  isRead: boolean;
  createdAt: string;
  actionUrl?: string;
}

export interface Achievement {
  achievementId: string;
  userId: string;
  achievementType: string;
  title: string;
  description: string;
  icon: string;
  points: number;
  unlockedAt: string;
}

export interface AIRecommendation {
  recommendationId: string;
  userId: string;
  courseId?: string;
  title: string;
  description: string;
  type: 'study_tip' | 'time_management' | 'grade_improvement' | 'goal_suggestion';
  priority: 'low' | 'medium' | 'high';
  isRead: boolean;
  createdAt: string;
}

// Context Types
export interface AuthContextType {
  currentUser: User | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (userData: RegisterData) => Promise<void>;
  logout: () => Promise<void>;
  googleLogin: () => Promise<void>;
  facebookLogin: () => Promise<void>;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  yearLevel: string;
  major: string;
}

export interface UserProfile {
  firstName: string;
  lastName: string;
  yearLevel: string;
  major: string;
  profilePicture?: string;
}

// API Types
export interface CourseData {
  courseName: string;
  courseCode: string;
  credits: number;
  semester: string;
  academicYear: string;
  instructor: string;
  description?: string;
  color: string;
}

export interface GradeData {
  courseId: string;
  assessmentName: string;
  assessmentType: string;
  score: number;
  maxScore: number;
  weight: number;
  date: string;
  description?: string;
}

export interface GoalData {
  courseId?: string;
  goalType: string;
  targetValue: number;
  targetDate: string;
  description: string;
  priority: string;
  semester: string;
  academicYear: string;
}

// Response Types
export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

export interface ErrorResponse {
  success: false;
  error: string;
  message: string;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

// Dashboard Types
export interface DashboardStats {
  currentGPA: number;
  totalCourses: number;
  totalGoals: number;
  achievedGoals: number;
  upcomingDeadlines: number;
}

export interface CourseProgress {
  courseId: string;
  courseName: string;
  currentGrade: number;
  targetGrade: number;
  progress: number;
  color: string;
}

export interface GoalProgress {
  goalId: string;
  description: string;
  currentValue: number;
  targetValue: number;
  progress: number;
  isAchieved: boolean;
  priority: string;
}

export interface RecentActivity {
  id: string;
  type: 'grade_added' | 'goal_achieved' | 'course_added' | 'deadline_reminder';
  title: string;
  description: string;
  timestamp: string;
  courseId?: string;
}

export interface Recommendation {
  id: string;
  title: string;
  description: string;
  type: string;
  priority: string;
  courseId?: string;
}
