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
  onScoreUpdated: () => void;
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
  });
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (visible && grade) {
      setFormData({
        score: grade.score?.toString() || '',
        maxScore: grade.maxScore?.toString() || '100',
        date: grade.date ? grade.date.split('T')[0] : new Date().toISOString().split('T')[0],
        notes: grade.notes || '',
      });
    }
  }, [visible, grade]);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));
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
      };

      await GradeService.updateGrade(grade.id, gradeData);
      
      Alert.alert('Success', 'Score updated successfully!');
      onScoreUpdated();
      onClose();
    } catch (error: any) {
      console.error('Error updating score:', error);
      Alert.alert(
        'Error',
        error.response?.data?.message || 'Failed to update score. Please try again.'
      );
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
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <KeyboardAvoidingView 
        style={styles.container}
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
              {isLoading ? 'Updating...' : 'Update'}
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.content}>
          {/* Grade Info */}
          {grade && (
            <View style={styles.gradeInfo}>
              <Text style={styles.gradeLabel}>
                {grade.assessmentName || grade.assessment?.name || 'Score'}
              </Text>
              {grade.assessment?.description && (
                <Text style={styles.gradeDescription}>{grade.assessment.description}</Text>
              )}
            </View>
          )}

          {/* Score Input */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Score *</Text>
            <TextInput
              style={styles.input}
              value={formData.score}
              onChangeText={(value) => handleInputChange('score', value)}
              placeholder="Enter score"
              keyboardType="numeric"
              placeholderTextColor={colors.gray[400]}
            />
          </View>

          {/* Max Score Input */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Max Score *</Text>
            <TextInput
              style={styles.input}
              value={formData.maxScore}
              onChangeText={(value) => handleInputChange('maxScore', value)}
              placeholder="Enter max score"
              keyboardType="numeric"
              placeholderTextColor={colors.gray[400]}
            />
          </View>

          {/* Date Input */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Date *</Text>
            <TextInput
              style={styles.input}
              value={formData.date}
              onChangeText={(value) => handleInputChange('date', value)}
              placeholder="YYYY-MM-DD"
              placeholderTextColor={colors.gray[400]}
            />
          </View>

          {/* Notes Input */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Notes (Optional)</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              value={formData.notes}
              onChangeText={(value) => handleInputChange('notes', value)}
              placeholder="Add any notes about this score..."
              placeholderTextColor={colors.gray[400]}
              multiline
              numberOfLines={3}
              textAlignVertical="top"
            />
          </View>

          {/* Delete Button */}
          <TouchableOpacity
            style={styles.deleteButton}
            onPress={handleDelete}
            disabled={isLoading}
          >
            <Text style={styles.deleteButtonText}>Delete Score</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.primary,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.border.light,
    backgroundColor: colors.background.secondary,
  },
  closeButton: {
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  closeButtonText: {
    fontSize: 16,
    color: colors.text.secondary,
    fontWeight: '500',
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text.primary,
  },
  saveButton: {
    backgroundColor: colors.primary,
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
    flex: 1,
    padding: 16,
  },
  gradeInfo: {
    backgroundColor: colors.background.secondary,
    padding: 12,
    borderRadius: 8,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: colors.border.light,
  },
  gradeLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text.primary,
    marginBottom: 4,
  },
  gradeDescription: {
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

