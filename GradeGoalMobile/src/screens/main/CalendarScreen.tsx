import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  StatusBar,
  Alert,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuth } from '../../context/AuthContext';
import { colors } from '../../styles/colors';
import { Calendar } from '../../components/calendar/Calendar';
import { CustomEventModal } from '../../components/modals/CustomEventModal';
import { CalendarEvent } from '../../services/calendarService';

export const CalendarScreen: React.FC = () => {
  const { currentUser } = useAuth();
  const insets = useSafeAreaInsets();
  const [showCustomEventModal, setShowCustomEventModal] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleAddEvent = () => {
    if (!currentUser?.userId) {
      Alert.alert('Error', 'Please log in to add events');
      return;
    }
    setShowCustomEventModal(true);
  };

  const handleEventPress = (event: CalendarEvent) => {
    // Show event details
    const eventType = event.type === 'custom' ? 'Custom Event' : 'Assessment';
    const status = event.status === 'OVERDUE' ? 'Overdue' :
                   event.status === 'COMPLETED' ? 'Completed' :
                   event.status === 'CUSTOM' ? 'Custom Event' : 'Upcoming';
    
    Alert.alert(
      event.title,
      `Type: ${eventType}\nCourse: ${event.courseName}\nStatus: ${status}\nTime: ${event.start.toLocaleTimeString()}\n${event.description ? `Description: ${event.description}` : ''}`,
      [{ text: 'OK' }]
    );
  };

  const handleEventAdded = (newEvent: CalendarEvent) => {
    // The Calendar component will handle refreshing the data
    setShowCustomEventModal(false);
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    // The Calendar component will handle the refresh
    setTimeout(() => setIsRefreshing(false), 1000);
  };

  if (!currentUser?.userId) {
    return (
      <View style={styles.container}>
        <StatusBar barStyle="dark-content" backgroundColor={colors.background.primary} translucent={false} />
        <View style={[styles.safeArea, { paddingTop: Math.max(insets.top - 20, 0) }]}>
          <View style={styles.noUserContainer}>
            <View style={styles.noUserContent}>
              <Text style={styles.noUserTitle}>Welcome to Calendar</Text>
              <Text style={styles.noUserSubtitle}>
                Please log in to view your academic calendar and manage your events.
              </Text>
            </View>
          </View>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.background.primary} translucent={false} />
      <View style={[styles.safeArea, { paddingTop: Math.max(insets.top - 20, 0) }]}>
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          refreshControl={
            <RefreshControl
              refreshing={isRefreshing}
              onRefresh={handleRefresh}
              colors={[colors.purple[600]]}
              tintColor={colors.purple[600]}
            />
          }
        >
          <Calendar
            onEventPress={handleEventPress}
            onAddEvent={handleAddEvent}
            onRefresh={handleRefresh}
          />
        </ScrollView>
      </View>

      {/* Custom Event Modal */}
      <CustomEventModal
        isVisible={showCustomEventModal}
        onClose={() => setShowCustomEventModal(false)}
        onEventAdded={handleEventAdded}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.primary,
  },
  safeArea: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
  noUserContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  noUserContent: {
    alignItems: 'center',
    maxWidth: 300,
  },
  noUserTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.text.primary,
    marginBottom: 12,
    textAlign: 'center',
  },
  noUserSubtitle: {
    fontSize: 16,
    color: colors.text.secondary,
    textAlign: 'center',
    lineHeight: 24,
  },
});
