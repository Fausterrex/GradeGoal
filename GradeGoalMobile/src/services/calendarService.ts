import { apiClient } from './apiClient';

// Calendar service for mobile app
export class CalendarService {
  
  // Get assessments by user ID
  static async getAssessmentsByUserId(userId: number) {
    try {
      const response = await apiClient.get(`/assessments/user/${userId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching assessments:', error);
      throw error;
    }
  }

  // Get custom events by user ID
  static async getCustomEventsByUserId(userId: number) {
    try {
      const response = await apiClient.get(`/custom-events/user/${userId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching custom events:', error);
      throw error;
    }
  }

  // Create a new custom event
  static async createCustomEvent(eventData: any) {
    try {
      const response = await apiClient.post('/custom-events', eventData);
      return response.data;
    } catch (error) {
      console.error('Error creating custom event:', error);
      throw error;
    }
  }

  // Update an existing custom event
  static async updateCustomEvent(eventId: number, eventData: any) {
    try {
      const response = await apiClient.put(`/custom-events/${eventId}`, eventData);
      return response.data;
    } catch (error) {
      console.error('Error updating custom event:', error);
      throw error;
    }
  }

  // Delete a custom event
  static async deleteCustomEvent(eventId: number) {
    try {
      const response = await apiClient.delete(`/custom-events/${eventId}`);
      return response.data;
    } catch (error) {
      console.error('Error deleting custom event:', error);
      throw error;
    }
  }

  // Get all calendar events (assessments + custom events) for a user
  static async getAllCalendarEvents(userId: number) {
    try {
      const [assessments, customEvents] = await Promise.all([
        this.getAssessmentsByUserId(userId),
        this.getCustomEventsByUserId(userId)
      ]);

      // Format assessments for calendar
      const assessmentEvents = assessments.map((item: any) => {
        const now = new Date();
        const dueDate = new Date(item.dueDate);
        const diffDays = Math.ceil((dueDate - now) / (1000 * 60 * 60 * 24));
        
        // Determine status - prioritize backend status, fallback to date logic
        let status = "UPCOMING";
        if (item.status && (item.status === "OVERDUE" || item.status === "UPCOMING" || item.status === "COMPLETED")) {
          status = item.status;
        } else {
          // Fallback to date-based logic
          if (diffDays < 0) {
            status = "OVERDUE";
          } else {
            status = "UPCOMING";
          }
        }

        return {
          id: item.assessmentId,
          title: item.assessmentName,
          courseName: item.courseName,
          start: new Date(item.dueDate),
          end: new Date(item.dueDate),
          status: status,
          description: item.description,
          categoryName: item.categoryName,
          maxPoints: item.maxPoints,
          type: 'assessment'
        };
      });

      // Format custom events for calendar
      const customEventsFormatted = customEvents.map((item: any) => {
        return {
          id: `custom-${item.eventId}`,
          title: item.eventTitle,
          courseName: 'Custom Event',
          start: new Date(item.eventStart),
          end: new Date(item.eventEnd),
          status: 'CUSTOM',
          description: item.eventDescription,
          categoryName: 'Personal',
          maxPoints: null,
          type: 'custom',
          isCustomEvent: true
        };
      });

      return [...assessmentEvents, ...customEventsFormatted];
    } catch (error) {
      console.error('Error fetching calendar events:', error);
      throw error;
    }
  }
}

// Types for calendar events
export interface CalendarEvent {
  id: string | number;
  title: string;
  courseName: string;
  start: Date;
  end: Date;
  status: 'OVERDUE' | 'UPCOMING' | 'COMPLETED' | 'CUSTOM';
  description?: string;
  categoryName?: string;
  maxPoints?: number;
  type: 'assessment' | 'custom';
  isCustomEvent?: boolean;
}

export interface CustomEventData {
  userId: number;
  eventTitle: string;
  eventDescription: string;
  eventStart: string;
  eventEnd: string;
  reminderEnabled: boolean;
  reminderDays: number;
  eventType: string;
  assessmentId?: number | null;
  isNotified: boolean;
}
