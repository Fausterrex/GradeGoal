import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  RefreshControl,
  Dimensions,
} from 'react-native';
import { useAuth } from '../../context/AuthContext';
import { CalendarService, CalendarEvent } from '../../services/calendarService';
import { colors } from '../../styles/colors';
// Using native JavaScript date methods instead of date-fns

interface CalendarProps {
  onEventPress?: (event: CalendarEvent) => void;
  onAddEvent?: () => void;
  onRefresh?: () => void;
}

export const Calendar: React.FC<CalendarProps> = ({
  onEventPress,
  onAddEvent,
  onRefresh,
}) => {
  const { currentUser } = useAuth();
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [isLoading, setIsLoading] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  useEffect(() => {
    if (currentUser?.userId) {
      loadEvents();
    }
  }, [currentUser?.userId]);

  const loadEvents = async () => {
    if (!currentUser?.userId) return;

    try {
      setIsLoading(true);
      const calendarEvents = await CalendarService.getAllCalendarEvents(currentUser.userId);
      setEvents(calendarEvents);
    } catch (error) {
      console.error('Error loading calendar events:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await loadEvents();
    setIsRefreshing(false);
    if (onRefresh) {
      onRefresh();
    }
  };

  const handleAddEvent = () => {
    if (onAddEvent) {
      onAddEvent();
    }
  };

  const handleEventPress = (event: CalendarEvent) => {
    if (onEventPress) {
      onEventPress(event);
    }
  };

  // Get events for selected date
  const getEventsForDate = (date: Date) => {
    const dateString = date.toISOString().split('T')[0];
    return events.filter(event => {
      const eventDate = event.start.toISOString().split('T')[0];
      return eventDate === dateString;
    });
  };

  // Get events for a specific date
  const getEventsForDateString = (dateString: string) => {
    return events.filter(event => {
      const eventDate = event.start.toISOString().split('T')[0];
      return eventDate === dateString;
    });
  };

  // Generate calendar days for current month
  const generateCalendarDays = () => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const startDate = new Date(firstDay);
    startDate.setDate(startDate.getDate() - firstDay.getDay());
    
    const days = [];
    const currentDate = new Date(startDate);
    
    // Generate 42 days (6 weeks)
    for (let i = 0; i < 42; i++) {
      days.push(new Date(currentDate));
      currentDate.setDate(currentDate.getDate() + 1);
    }
    
    return days;
  };

  // Check if date has events
  const hasEvents = (date: Date) => {
    return getEventsForDate(date).length > 0;
  };

  // Get event status color for date
  const getDateEventColor = (date: Date) => {
    const dateEvents = getEventsForDate(date);
    if (dateEvents.length === 0) return null;
    
    // Check for overdue events first
    if (dateEvents.some(e => e.status === 'OVERDUE')) return colors.red[500];
    if (dateEvents.some(e => e.status === 'COMPLETED')) return colors.green[500];
    if (dateEvents.some(e => e.status === 'CUSTOM')) return colors.purple[500];
    return colors.blue[500];
  };

  // Navigate months
  const goToPreviousMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1));
  };

  const goToNextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1));
  };

  // Get event status color
  const getEventStatusColor = (status: string) => {
    switch (status) {
      case 'OVERDUE':
        return colors.red[500];
      case 'COMPLETED':
        return colors.green[500];
      case 'CUSTOM':
        return colors.purple[500];
      case 'UPCOMING':
      default:
        return colors.blue[500];
    }
  };

  // Get event status text
  const getEventStatusText = (status: string) => {
    switch (status) {
      case 'OVERDUE':
        return 'Overdue';
      case 'COMPLETED':
        return 'Completed';
      case 'CUSTOM':
        return 'Custom Event';
      case 'UPCOMING':
      default:
        return 'Upcoming';
    }
  };

  const selectedDateEvents = getEventsForDate(selectedDate);
  const calendarDays = generateCalendarDays();
  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];
  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Academic Calendar</Text>
        <TouchableOpacity style={styles.addButton} onPress={handleAddEvent}>
          <Text style={styles.addButtonText}>+ Add Event</Text>
        </TouchableOpacity>
      </View>

      {/* Quick Stats */}
      <View style={styles.statsContainer}>
        <View style={styles.statItem}>
          <Text style={styles.statNumber}>
            {events.filter(e => e.status === 'OVERDUE').length}
          </Text>
          <Text style={styles.statLabel}>Overdue</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statNumber}>
            {events.filter(e => e.status === 'UPCOMING').length}
          </Text>
          <Text style={styles.statLabel}>Upcoming</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statNumber}>
            {events.filter(e => e.status === 'COMPLETED').length}
          </Text>
          <Text style={styles.statLabel}>Completed</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statNumber}>
            {events.filter(e => e.status === 'CUSTOM').length}
          </Text>
          <Text style={styles.statLabel}>Custom</Text>
        </View>
      </View>

      {/* Calendar */}
      <View style={styles.calendarContainer}>
        {/* Month Header */}
        <View style={styles.monthHeader}>
          <TouchableOpacity onPress={goToPreviousMonth} style={styles.monthButton}>
            <Text style={styles.monthButtonText}>‹</Text>
          </TouchableOpacity>
          <Text style={styles.monthTitle}>
            {monthNames[currentMonth.getMonth()]} {currentMonth.getFullYear()}
          </Text>
          <TouchableOpacity onPress={goToNextMonth} style={styles.monthButton}>
            <Text style={styles.monthButtonText}>›</Text>
          </TouchableOpacity>
        </View>

        {/* Day Names */}
        <View style={styles.dayNamesContainer}>
          {dayNames.map((day) => (
            <Text key={day} style={styles.dayName}>
              {day}
            </Text>
          ))}
        </View>

        {/* Calendar Grid */}
        <View style={styles.calendarGrid}>
          {calendarDays.map((day, index) => {
            const isCurrentMonth = day.getMonth() === currentMonth.getMonth();
            const isToday = day.toISOString().split('T')[0] === new Date().toISOString().split('T')[0];
            const isSelected = day.toISOString().split('T')[0] === selectedDate.toISOString().split('T')[0];
            const hasEventsOnDay = hasEvents(day);
            const eventColor = getDateEventColor(day);

            return (
              <TouchableOpacity
                key={index}
                style={[
                  styles.dayCell,
                  !isCurrentMonth && styles.dayCellOtherMonth,
                  isToday && styles.dayCellToday,
                  isSelected && styles.dayCellSelected,
                ]}
                onPress={() => setSelectedDate(day)}
              >
                <Text
                  style={[
                    styles.dayText,
                    !isCurrentMonth && styles.dayTextOtherMonth,
                    isToday && styles.dayTextToday,
                    isSelected && styles.dayTextSelected,
                  ]}
                >
                  {day.getDate()}
                </Text>
                {hasEventsOnDay && (
                  <View
                    style={[
                      styles.eventDot,
                      { backgroundColor: eventColor || colors.blue[500] },
                    ]}
                  />
                )}
              </TouchableOpacity>
            );
          })}
        </View>
      </View>

      {/* Events for Selected Date */}
      <View style={styles.eventsContainer}>
        <Text style={styles.eventsTitle}>
          Events for {selectedDate.toLocaleDateString('en-US', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric',
          })}
        </Text>
        
        <ScrollView
          style={styles.eventsList}
          refreshControl={
            <RefreshControl
              refreshing={isRefreshing}
              onRefresh={handleRefresh}
              colors={[colors.purple[600]]}
              tintColor={colors.purple[600]}
            />
          }
        >
          {selectedDateEvents.length === 0 ? (
            <View style={styles.noEventsContainer}>
              <Text style={styles.noEventsText}>No events for this date</Text>
            </View>
          ) : (
            selectedDateEvents.map((event) => (
              <TouchableOpacity
                key={event.id}
                style={styles.eventItem}
                onPress={() => handleEventPress(event)}
              >
                <View style={styles.eventHeader}>
                  <Text style={styles.eventTitle}>{event.title}</Text>
                  <View
                    style={[
                      styles.statusBadge,
                      { backgroundColor: getEventStatusColor(event.status) },
                    ]}
                  >
                    <Text style={styles.statusText}>
                      {getEventStatusText(event.status)}
                    </Text>
                  </View>
                </View>
                <Text style={styles.eventCourse}>{event.courseName}</Text>
                {event.description && (
                  <Text style={styles.eventDescription} numberOfLines={2}>
                    {event.description}
                  </Text>
                )}
                {event.maxPoints && (
                  <Text style={styles.eventPoints}>
                    Max Points: {event.maxPoints}
                  </Text>
                )}
                <Text style={styles.eventTime}>
                  {event.start.toLocaleTimeString('en-US', {
                    hour: 'numeric',
                    minute: '2-digit',
                    hour12: true,
                  })}
                </Text>
              </TouchableOpacity>
            ))
          )}
        </ScrollView>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.primary,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    backgroundColor: colors.background.secondary,
    borderBottomWidth: 1,
    borderBottomColor: colors.border.light,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.text.primary,
  },
  addButton: {
    backgroundColor: colors.purple[600],
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  addButtonText: {
    color: colors.background.primary,
    fontWeight: '600',
    fontSize: 14,
  },
  statsContainer: {
    flexDirection: 'row',
    backgroundColor: colors.background.secondary,
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: colors.border.light,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.text.primary,
  },
  statLabel: {
    fontSize: 12,
    color: colors.text.secondary,
    marginTop: 4,
  },
  calendarContainer: {
    backgroundColor: colors.background.primary,
    margin: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  monthHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.border.light,
  },
  monthButton: {
    padding: 8,
  },
  monthButtonText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.purple[600],
  },
  monthTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.text.primary,
  },
  dayNamesContainer: {
    flexDirection: 'row',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: colors.border.light,
  },
  dayName: {
    flex: 1,
    textAlign: 'center',
    fontSize: 14,
    fontWeight: '600',
    color: colors.text.secondary,
  },
  calendarGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: 8,
  },
  dayCell: {
    width: '14.28%',
    aspectRatio: 1,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  dayCellOtherMonth: {
    opacity: 0.3,
  },
  dayCellToday: {
    backgroundColor: colors.purple[100],
    borderRadius: 20,
  },
  dayCellSelected: {
    backgroundColor: colors.purple[600],
    borderRadius: 20,
  },
  dayText: {
    fontSize: 16,
    color: colors.text.primary,
  },
  dayTextOtherMonth: {
    color: colors.text.secondary,
  },
  dayTextToday: {
    color: colors.purple[600],
    fontWeight: 'bold',
  },
  dayTextSelected: {
    color: colors.background.primary,
    fontWeight: 'bold',
  },
  eventDot: {
    position: 'absolute',
    bottom: 4,
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  eventsContainer: {
    flex: 1,
    padding: 16,
  },
  eventsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.text.primary,
    marginBottom: 16,
  },
  eventsList: {
    flex: 1,
  },
  noEventsContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
  },
  noEventsText: {
    fontSize: 16,
    color: colors.text.secondary,
  },
  eventItem: {
    backgroundColor: colors.background.secondary,
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    borderLeftWidth: 4,
    borderLeftColor: colors.purple[600],
  },
  eventHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  eventTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.text.primary,
    flex: 1,
    marginRight: 8,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.background.primary,
  },
  eventCourse: {
    fontSize: 14,
    color: colors.text.secondary,
    marginBottom: 4,
  },
  eventDescription: {
    fontSize: 14,
    color: colors.text.primary,
    marginBottom: 8,
  },
  eventPoints: {
    fontSize: 12,
    color: colors.text.secondary,
    marginBottom: 4,
  },
  eventTime: {
    fontSize: 12,
    color: colors.purple[600],
    fontWeight: '600',
  },
});
