import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Modal,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { colors } from '../../styles/colors';
import { GradeService } from '../../services/gradeService';

interface EditScoreModalProps {
  visible: boolean;
  onClose: () => void;
  grade?: any;
  onScoreUpdated?: () => void;
}

export const EditScoreModal: React.FC<EditScoreModalProps> = ({
  visible,
  onClose,
  grade,
  onScoreUpdated,
}) => {
  const [formData, setFormData] = useState({
    score: '',
    maxScore: '',
    date: '',
    notes: '',
    extraCredit: false,
    extraCreditPoints: '',
  });
  const [isLoading, setIsLoading] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date());

  useEffect(() => {
    if (visible && grade) {
      const dateValue = grade.date ? new Date(grade.date) : new Date();
      setFormData({
        score: grade.score?.toString() || '',
        maxScore: grade.maxScore?.toString() || '100',
        date: grade.date ? grade.date.split('T')[0] : new Date().toISOString().split('T')[0],
        notes: grade.notes || '',
        extraCredit: grade.extraCredit || false,
        extraCreditPoints: grade.extraCreditPoints?.toString() || '',
      });
      setSelectedDate(dateValue);
    }
  }, [visible, grade]);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleExtraCreditToggle = () => {
    setFormData(prev => ({
      ...prev,
      extraCredit: !prev.extraCredit,
      extraCreditPoints: !prev.extraCredit ? '' : prev.extraCreditPoints,
    }));
  };

  const handleDateChange = (event: any, selectedDate?: Date) => {
    setShowDatePicker(false);
    if (selectedDate) {
      setSelectedDate(selectedDate);
      const dateString = selectedDate.toISOString().split('T')[0];
      setFormData(prev => ({
        ...prev,
        date: dateString,
      }));
    }
  };

  const validateForm = () => {
    if (!formData.score.trim()) {
      Alert.alert('Validation Error', 'Score is required');
      return false;
    }

    const score = parseFloat(formData.score);
    const maxScore = parseFloat(formData.maxScore);

    if (isNaN(score) || isNaN(maxScore)) {
      Alert.alert('Validation Error', 'Please enter valid numbers for score and max score');
      return false;
    }

    if (score < 0 || maxScore <= 0) {
      Alert.alert('Validation Error', 'Score and max score must be positive numbers');
      return false;
    }

    if (score > maxScore) {
      Alert.alert('Validation Error', 'Score cannot be greater than max score');
      return false;
    }

    return true;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;
    if (!grade?.id) {
      Alert.alert('Error', 'Grade information is missing');
      return;
    }

    setIsLoading(true);
    try {
      const gradeData = {
        score: parseFloat(formData.score),
        maxScore: parseFloat(formData.maxScore),
        date: formData.date,
        notes: formData.notes.trim(),
        extraCredit: formData.extraCredit,
        extraCreditPoints: formData.extraCredit ? parseFloat(formData.extraCreditPoints) || 0 : 0,
      };

      await GradeService.updateGrade(grade.id, gradeData);
      Alert.alert('Success', 'Score updated successfully!');
      if (onScoreUpdated && typeof onScoreUpdated === 'function') {
        onScoreUpdated();
      }
      onClose();
    } catch (error: any) {
      console.error('❌ [DEBUG] EditScoreModal - Error updating score:', error);
      console.error('❌ [DEBUG] EditScoreModal - Error details:', {
        message: error.message,
        code: error.code,
        response: error.response?.data,
        status: error.response?.status,
      });
      
      let errorMessage = 'Failed to update score. Please try again.';
      
      if (error.code === 'NETWORK_ERROR' || error.message?.includes('Network Error')) {
        errorMessage = 'Network error: Please check your internet connection and ensure the backend server is running.';
      } else if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      }
      
      Alert.alert('Error', errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = () => {
    Alert.alert(
      'Delete Score',
      'Are you sure you want to delete this score? This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Delete', 
          style: 'destructive',
          onPress: async () => {
            if (!grade?.id) return;
            
            setIsLoading(true);
            try {
              await GradeService.deleteGrade(grade.id);
              Alert.alert('Success', 'Score deleted successfully!');
              onScoreUpdated();
              onClose();
            } catch (error: any) {
              console.error('Error deleting score:', error);
              Alert.alert(
                'Error',
                error.response?.data?.message || 'Failed to delete score. Please try again.'
              );
            } finally {
              setIsLoading(false);
            }
          }
        },
      ]
    );
  };

  return (
    <Modal
      visible={visible}
      animationType="fade"
      transparent={true}
      onRequestClose={onClose}
    >
      <TouchableOpacity 
        style={styles.overlay}
        activeOpacity={1}
        onPress={onClose}
      >
        <TouchableOpacity 
          style={styles.container}
          activeOpacity={1}
          onPress={(e) => e.stopPropagation()}
        >
          <KeyboardAvoidingView 
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          >
        <View style={styles.header}>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <Text style={styles.closeButtonText}>Cancel</Text>
          </TouchableOpacity>
          <Text style={styles.title}>Edit Score</Text>
          <TouchableOpacity
            onPress={handleSubmit}
            style={[styles.saveButton, isLoading && styles.saveButtonDisabled]}
            disabled={isLoading}
          >
            <Text style={styles.saveButtonText}>
              {isLoading ? 'Updating...' : 'Update Score'}
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.content}>
          {/* Assessment Info - Like Web Version */}
          {grade && (
            <View style={styles.assessmentInfo}>
              <Text style={styles.assessmentName}>
                {grade.assessmentName || grade.assessment?.name || 'Assessment'}
              </Text>
              <Text style={styles.maxScoreText}>
                Maximum Score: {grade.maxScore || formData.maxScore}
              </Text>
            </View>
          )}

          {/* Score Obtained - Like Web Version */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Score Obtained</Text>
            <TextInput
              style={styles.input}
              value={formData.score}
              onChangeText={(value) => handleInputChange('score', value)}
              placeholder="Enter score"
              keyboardType="numeric"
              placeholderTextColor={colors.gray[400]}
            />
          </View>

          {/* Extra Credit Section - Like Web Version */}
          <View style={styles.extraCreditSection}>
            <TouchableOpacity
              style={styles.checkboxContainer}
              onPress={handleExtraCreditToggle}
            >
              <View style={[styles.checkbox, formData.extraCredit && styles.checkboxChecked]}>
                {formData.extraCredit && <Text style={styles.checkmark}>✓</Text>}
              </View>
              <Text style={styles.checkboxLabel}>Extra Credit</Text>
            </TouchableOpacity>
            
            <Text style={styles.extraCreditDescription}>
              Check this if this score includes extra credit points
            </Text>

            {formData.extraCredit && (
              <>
                <Text style={styles.label}>Extra Credit Points</Text>
                <TextInput
                  style={styles.input}
                  value={formData.extraCreditPoints}
                  onChangeText={(value) => handleInputChange('extraCreditPoints', value)}
                  placeholder="Enter extra credit points"
                  keyboardType="numeric"
                  placeholderTextColor={colors.gray[400]}
                />
                <Text style={styles.extraCreditHelpText}>
                  Enter the number of extra credit points to add to your score
                </Text>
              </>
            )}
          </View>
        </View>
          </KeyboardAvoidingView>
        </TouchableOpacity>
      </TouchableOpacity>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  container: {
    backgroundColor: colors.background.primary,
    borderRadius: 12,
    width: '100%',
    maxWidth: 400,
    maxHeight: '80%',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: colors.green[500] || '#22C55E',
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
  },
  closeButton: {
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  closeButtonText: {
    fontSize: 16,
    color: colors.text.white,
    fontWeight: '500',
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text.white,
  },
  saveButton: {
    backgroundColor: colors.green[600] || '#16A34A',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
  },
  saveButtonDisabled: {
    backgroundColor: colors.gray[400],
  },
  saveButtonText: {
    fontSize: 16,
    color: colors.text.white,
    fontWeight: '600',
  },
  content: {
    padding: 20,
  },
  assessmentInfo: {
    marginBottom: 20,
  },
  assessmentName: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text.primary,
    marginBottom: 4,
  },
  maxScoreText: {
    fontSize: 14,
    color: colors.text.secondary,
  },
  inputGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 16,
    fontWeight: '500',
    color: colors.text.primary,
    marginBottom: 8,
  },
  input: {
    backgroundColor: colors.background.secondary,
    borderWidth: 1,
    borderColor: colors.border.medium,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontSize: 16,
    color: colors.text.primary,
  },
  textArea: {
    height: 80,
    textAlignVertical: 'top',
  },
  dateInput: {
    backgroundColor: colors.background.secondary,
    borderWidth: 1,
    borderColor: colors.border.medium,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  dateText: {
    fontSize: 16,
    color: colors.text.primary,
  },
  dateIcon: {
    fontSize: 16,
  },
  datePickerContainer: {
    marginTop: 8,
    padding: 12,
    backgroundColor: colors.background.secondary,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border.light,
  },
  datePickerLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.text.primary,
    marginBottom: 8,
  },
  datePickerButton: {
    backgroundColor: colors.primary,
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 6,
    alignItems: 'center',
    marginTop: 8,
  },
  datePickerButtonText: {
    fontSize: 14,
    color: colors.text.white,
    fontWeight: '500',
  },
  extraCreditSection: {
    marginTop: 16,
  },
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderWidth: 2,
    borderColor: colors.blue[500] || '#3B82F6',
    borderRadius: 4,
    marginRight: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxChecked: {
    backgroundColor: colors.blue[500] || '#3B82F6',
  },
  checkmark: {
    color: colors.text.white,
    fontSize: 14,
    fontWeight: 'bold',
  },
  checkboxLabel: {
    fontSize: 16,
    fontWeight: '500',
    color: colors.text.primary,
  },
  extraCreditDescription: {
    fontSize: 14,
    color: colors.text.secondary,
    marginBottom: 12,
    lineHeight: 20,
  },
  extraCreditHelpText: {
    fontSize: 12,
    color: colors.text.secondary,
    marginTop: 4,
    fontStyle: 'italic',
  },
  deleteButton: {
    backgroundColor: colors.red[50],
    borderWidth: 1,
    borderColor: colors.red[200],
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 20,
  },
  deleteButtonText: {
    fontSize: 16,
    color: colors.red[600],
    fontWeight: '500',
  },
});

