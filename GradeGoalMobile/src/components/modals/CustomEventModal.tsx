import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Modal,
  StyleSheet,
  ScrollView,
  Alert,
  Switch,
} from 'react-native';
import { useAuth } from '../../context/AuthContext';
import { CalendarService } from '../../services/calendarService';
import { colors } from '../../styles/colors';

interface CustomEventModalProps {
  isVisible: boolean;
  onClose: () => void;
  onEventAdded: (event: any) => void;
}

export const CustomEventModal: React.FC<CustomEventModalProps> = ({
  isVisible,
  onClose,
  onEventAdded,
}) => {
  const { currentUser } = useAuth();
  const [formData, setFormData] = useState({
    eventTitle: '',
    eventDescription: '',
    eventDate: '',
    eventTime: '',
    reminderEnabled: true,
    reminderDays: 1,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleInputChange = (field: string, value: string | boolean | number) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSubmit = async () => {
    if (!formData.eventTitle.trim()) {
      Alert.alert('Error', 'Please enter an event title');
      return;
    }

    if (!formData.eventDate) {
      Alert.alert('Error', 'Please select an event date');
      return;
    }

    if (!formData.eventTime) {
      Alert.alert('Error', 'Please select an event time');
      return;
    }

    if (!currentUser?.userId) {
      Alert.alert('Error', 'User not authenticated');
      return;
    }

    setIsSubmitting(true);

    try {
      // Combine date and time
      const eventDateTime = new Date(`${formData.eventDate}T${formData.eventTime}`);
      const eventEndDateTime = new Date(eventDateTime.getTime() + (60 * 60 * 1000)); // Add 1 hour for end time
      
      const eventData = {
        userId: currentUser.userId,
        eventTitle: formData.eventTitle,
        eventDescription: formData.eventDescription,
        eventStart: eventDateTime.toISOString(),
        eventEnd: eventEndDateTime.toISOString(),
        reminderEnabled: formData.reminderEnabled,
        reminderDays: formData.reminderDays,
        eventType: 'CUSTOM_EVENT',
        assessmentId: null,
        isNotified: false,
      };

      const newEvent = await CalendarService.createCustomEvent(eventData);
      
      // Format the event for the calendar
      const formattedEvent = {
        id: `custom-${newEvent.eventId}`,
        title: newEvent.eventTitle,
        courseName: 'Custom Event',
        start: new Date(newEvent.eventStart),
        end: new Date(newEvent.eventEnd),
        status: 'CUSTOM',
        description: newEvent.eventDescription,
        categoryName: 'Personal',
        maxPoints: null,
        type: 'custom',
        isCustomEvent: true,
      };

      onEventAdded(formattedEvent);
      
      // Reset form
      setFormData({
        eventTitle: '',
        eventDescription: '',
        eventDate: '',
        eventTime: '',
        reminderEnabled: true,
        reminderDays: 1,
      });
      
      onClose();
      Alert.alert('Success', 'Custom event created successfully!');
    } catch (error: any) {
      console.error('Error creating custom event:', error);
      Alert.alert('Error', error.message || 'Failed to create custom event');
    } finally {
      setIsSubmitting(false);
    }
  };

  const getCurrentDate = () => {
    const now = new Date();
    return now.toISOString().split('T')[0];
  };

  const getCurrentTime = () => {
    const now = new Date();
    return now.toTimeString().slice(0, 5);
  };

  return (
    <Modal
      visible={isVisible}
      animationType="slide"
      transparent
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.modalContainer}>
          <View style={styles.header}>
            <Text style={styles.title}>Add Custom Event</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Text style={styles.closeButtonText}>✕</Text>
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
            <View style={styles.formGroup}>
              <Text style={styles.label}>Event Title *</Text>
              <TextInput
                style={styles.input}
                value={formData.eventTitle}
                onChangeText={(value) => handleInputChange('eventTitle', value)}
                placeholder="Enter event title"
                placeholderTextColor={colors.text.secondary}
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.label}>Description</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                value={formData.eventDescription}
                onChangeText={(value) => handleInputChange('eventDescription', value)}
                placeholder="Enter event description (optional)"
                placeholderTextColor={colors.text.secondary}
                multiline
                numberOfLines={3}
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.label}>Date *</Text>
              <TextInput
                style={styles.input}
                value={formData.eventDate}
                onChangeText={(value) => handleInputChange('eventDate', value)}
                placeholder="YYYY-MM-DD"
                placeholderTextColor={colors.text.secondary}
                keyboardType="numeric"
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.label}>Time *</Text>
              <TextInput
                style={styles.input}
                value={formData.eventTime}
                onChangeText={(value) => handleInputChange('eventTime', value)}
                placeholder="HH:MM"
                placeholderTextColor={colors.text.secondary}
                keyboardType="numeric"
              />
            </View>

            <View style={styles.formGroup}>
              <View style={styles.switchContainer}>
                <Text style={styles.label}>Enable Reminder</Text>
                <Switch
                  value={formData.reminderEnabled}
                  onValueChange={(value) => handleInputChange('reminderEnabled', value)}
                  trackColor={{ false: colors.gray[300], true: colors.purple[300] }}
                  thumbColor={formData.reminderEnabled ? colors.purple[600] : colors.gray[500]}
                />
              </View>
            </View>

            {formData.reminderEnabled && (
              <View style={styles.formGroup}>
                <Text style={styles.label}>Reminder Days Before</Text>
                <TextInput
                  style={styles.input}
                  value={formData.reminderDays.toString()}
                  onChangeText={(value) => handleInputChange('reminderDays', parseInt(value) || 1)}
                  placeholder="1"
                  placeholderTextColor={colors.text.secondary}
                  keyboardType="numeric"
                />
              </View>
            )}
          </ScrollView>

          <View style={styles.footer}>
            <TouchableOpacity
              style={[styles.button, styles.cancelButton]}
              onPress={onClose}
            >
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.button, styles.submitButton, isSubmitting && styles.submitButtonDisabled]}
              onPress={handleSubmit}
              disabled={isSubmitting}
            >
              <Text style={styles.submitButtonText}>
                {isSubmitting ? 'Creating...' : 'Create Event'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    backgroundColor: colors.background.primary,
    borderRadius: 16,
    width: '90%',
    maxHeight: '80%',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 8,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: colors.border.primary,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.text.primary,
  },
  closeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.gray[100],
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeButtonText: {
    fontSize: 18,
    color: colors.text.secondary,
  },
  content: {
    padding: 20,
  },
  formGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text.primary,
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: colors.border.primary,
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: colors.text.primary,
    backgroundColor: colors.background.secondary,
  },
  textArea: {
    height: 80,
    textAlignVertical: 'top',
  },
  switchContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  footer: {
    flexDirection: 'row',
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: colors.border.primary,
    gap: 12,
  },
  button: {
    flex: 1,
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: colors.gray[100],
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text.secondary,
  },
  submitButton: {
    backgroundColor: colors.purple[600],
  },
  submitButtonDisabled: {
    backgroundColor: colors.gray[300],
  },
  submitButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.background.primary,
  },
});
