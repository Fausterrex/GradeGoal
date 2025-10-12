import { apiClient } from './apiClient';

export interface AnalyticsData {
  id: number;
  userId: number;
  courseId: number;
  semester: string;
  currentGrade: number;
  calculatedAt: string;
  dueDate?: string;
  createdAt: string;
}

export class AnalyticsService {
  /**
   * Get analytics data for a specific user and course
   */
  static async getUserCourseAnalytics(userId: number, courseId: number, semester?: string): Promise<AnalyticsData[]> {
    try {
      let url = `/database-calculations/user/${userId}/analytics/${courseId}`;
      if (semester) {
        url += `?semester=${semester}`;
      }
      
      const response = await apiClient.get(url);
      const data = response.data;
      
      // Ensure we return an array
      return Array.isArray(data) ? data as AnalyticsData[] : [data as AnalyticsData];
    } catch (error) {
      console.error('Error fetching user course analytics:', error);
      return [];
    }
  }

  /**
   * Get analytics data for all courses of a user
   */
  static async getAllUserAnalytics(userId: number, semester?: string): Promise<AnalyticsData[]> {
    try {
      // For now, we'll need to get courses first, then fetch analytics for each
      // This is a simplified approach - in a real implementation, you might have a bulk endpoint
      const coursesResponse = await apiClient.get(`/courses/user/id/${userId}`);
      const courses = (coursesResponse.data || []) as any[];
      
      const allAnalytics: AnalyticsData[] = [];
      
      for (const course of courses) {
        try {
          const courseAnalytics = await this.getUserCourseAnalytics(userId, course.id, semester);
          allAnalytics.push(...courseAnalytics);
        } catch (error) {
          console.warn(`Failed to fetch analytics for course ${course.id}:`, error);
        }
      }
      
      return allAnalytics;
    } catch (error) {
      console.error('Error fetching all user analytics:', error);
      return [];
    }
  }

  /**
   * Process analytics data into weekly chart data
   */
  static processAnalyticsToWeeklyData(analytics: AnalyticsData[], viewMode: string, currentGPA: number): any[] {
    if (!analytics || analytics.length === 0) {
      return [];
    }

    // Sort analytics by due_date to get chronological progression
    const sortedAnalytics = [...analytics].sort((a, b) => {
      const dateA = new Date(a.dueDate || a.createdAt);
      const dateB = new Date(b.dueDate || b.createdAt);
      return dateA.getTime() - dateB.getTime();
    });

    // Group analytics by week (Monday start)
    const weeklyGroups: { [key: string]: { weekStart: Date; analytics: AnalyticsData[]; latestCurrentGrade: number; latestTimestamp: string | null } } = {};
    
    sortedAnalytics.forEach((analyticsItem) => {
      const dueDate = new Date(analyticsItem.dueDate || analyticsItem.createdAt);
      if (isNaN(dueDate.getTime())) return;

      const weekStart = new Date(dueDate);
      const dayOfWeek = weekStart.getDay();
      let daysToMonday;
      if (dayOfWeek === 0) {
        daysToMonday = -6;
      } else {
        daysToMonday = -(dayOfWeek - 1);
      }
      weekStart.setDate(weekStart.getDate() + daysToMonday);
      weekStart.setHours(0, 0, 0, 0);
      
      const weekKey = weekStart.toISOString().split('T')[0];
      
      if (!weeklyGroups[weekKey]) {
        weeklyGroups[weekKey] = {
          weekStart: weekStart,
          analytics: [],
          latestCurrentGrade: 0,
          latestTimestamp: null
        };
      }
      
      weeklyGroups[weekKey].analytics.push(analyticsItem);
      
      // Keep track of the latest current_grade for this week (by calculated_at timestamp)
      const currentTimestamp = new Date(analyticsItem.calculatedAt || analyticsItem.createdAt);
      const existingTimestamp = weeklyGroups[weekKey].latestTimestamp ? 
        new Date(weeklyGroups[weekKey].latestTimestamp) : new Date(0);
      
      if (currentTimestamp > existingTimestamp) {
        weeklyGroups[weekKey].latestCurrentGrade = Math.min(4.0, Math.max(0.0, analyticsItem.currentGrade || 0)); // Cap GPA between 0.0 and 4.0
        weeklyGroups[weekKey].latestTimestamp = analyticsItem.calculatedAt || analyticsItem.createdAt;
      }
    });

    const weeklyData: any[] = [];
    Object.values(weeklyGroups).forEach((group, index) => {
      let currentGPAValue = group.latestCurrentGrade;
      
      // For the latest week, use the current GPA to ensure accuracy
      if (index === Object.values(weeklyGroups).length - 1) {
        currentGPAValue = Math.min(4.0, Math.max(0.0, currentGPA)); // Cap GPA between 0.0 and 4.0
      }
      
      const weekData = {
        week: `W${index + 1}`,
        gpa: Math.min(4.0, Math.max(0.0, currentGPAValue)), // Cap GPA between 0.0 and 4.0
        assessmentCount: group.analytics.length,
        weekNumber: index + 1
      };
      
      weeklyData.push(weekData);
    });

    return weeklyData;
  }
}
