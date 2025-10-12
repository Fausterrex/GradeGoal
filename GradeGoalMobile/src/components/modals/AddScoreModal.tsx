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

interface AddScoreModalProps {
  visible: boolean;
  onClose: () => void;
  assessment?: any;
  onScoreAdded: () => void;
}

export const AddScoreModal: React.FC<AddScoreModalProps> = ({
  visible,
  onClose,
  assessment,
  onScoreAdded,
}) => {
  const [formData, setFormData] = useState({
    score: '',
    maxScore: assessment?.maxScore?.toString() || '100',
    date: new Date().toISOString().split('T')[0], // YYYY-MM-DD format
    notes: '',
  });
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (visible && assessment) {
      setFormData(prev => ({
        ...prev,
        maxScore: assessment.maxScore?.toString() || '100',
      }));
    }
  }, [visible, assessment]);

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
    if (!assessment?.id) {
      Alert.alert('Error', 'Assessment information is missing');
      return;
    }

    setIsLoading(true);
    try {
      const gradeData = {
        assessmentId: assessment.id,
        score: parseFloat(formData.score),
        maxScore: parseFloat(formData.maxScore),
        date: formData.date,
        notes: formData.notes.trim(),
      };

      await GradeService.createGrade(gradeData);
      
      Alert.alert('Success', 'Score added successfully!');
      onScoreAdded();
      onClose();
      
      // Reset form
      setFormData({
        score: '',
        maxScore: assessment?.maxScore?.toString() || '100',
        date: new Date().toISOString().split('T')[0],
        notes: '',
      });
    } catch (error: any) {
      console.error('Error adding score:', error);
      Alert.alert(
        'Error',
        error.response?.data?.message || 'Failed to add score. Please try again.'
      );
    } finally {
      setIsLoading(false);
    }
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
          <Text style={styles.title}>Add Score</Text>
          <TouchableOpacity
            onPress={handleSubmit}
            style={[styles.saveButton, isLoading && styles.saveButtonDisabled]}
            disabled={isLoading}
          >
            <Text style={styles.saveButtonText}>
              {isLoading ? 'Adding...' : 'Add'}
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.content}>
          {/* Assessment Info */}
          {assessment && (
            <View style={styles.assessmentInfo}>
              <Text style={styles.assessmentName}>{assessment.name}</Text>
              {assessment.description && (
                <Text style={styles.assessmentDescription}>{assessment.description}</Text>
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
  assessmentInfo: {
    backgroundColor: colors.background.secondary,
    padding: 12,
    borderRadius: 8,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: colors.border.light,
  },
  assessmentName: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text.primary,
    marginBottom: 4,
  },
  assessmentDescription: {
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
});
