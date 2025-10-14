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
import { useAuth } from '../../context/AuthContext';

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
  const { currentUser } = useAuth();
  const [formData, setFormData] = useState({
    score: '',
    extraCredit: false,
    extraCreditPoints: '',
  });
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (visible) {
      setFormData({
        score: '',
        extraCredit: false,
        extraCreditPoints: '',
      });
    }
  }, [visible]);

  const handleInputChange = (field: string, value: string | boolean) => {
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
    if (isNaN(score) || score < 0) {
      Alert.alert('Validation Error', 'Please enter a valid score');
      return false;
    }

    if (score > (assessment?.maxScore || 100)) {
      Alert.alert('Validation Error', 'Score cannot be greater than maximum score');
      return false;
    }

    if (formData.extraCredit) {
      const extraPoints = parseFloat(formData.extraCreditPoints);
      if (isNaN(extraPoints) || extraPoints < 0) {
        Alert.alert('Validation Error', 'Please enter valid extra credit points');
        return false;
      }
    }

    return true;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;
    if (!assessment?.assessmentId) {
      Alert.alert('Error', 'Assessment information is missing');
      return;
    }

    setIsLoading(true);
    try {
      const pointsEarned = parseFloat(formData.score);
      const pointsPossible = assessment.maxScore || 100;
      const extraCreditPoints = formData.extraCredit ? parseFloat(formData.extraCreditPoints) || 0 : 0;
      const totalPointsEarned = pointsEarned + extraCreditPoints;
      const percentageScore = (totalPointsEarned / pointsPossible) * 100;

      const gradeData = {
        assessmentId: assessment.assessmentId,
        pointsEarned: totalPointsEarned,
        pointsPossible: pointsPossible,
        percentageScore: percentageScore,
        extraCredit: formData.extraCredit,
        extraCreditPoints: extraCreditPoints,
        date: new Date().toISOString().split('T')[0], // Current date
        notes: '', // Empty notes as per web version
      };

      await GradeService.createGrade(gradeData);
      
      Alert.alert('Success', 'Score added successfully!');
      
      
      onScoreAdded();
      onClose();
      
      // Reset form
      setFormData({
        score: '',
        extraCredit: false,
        extraCreditPoints: '',
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
            <View style={styles.modalContent}>
              {/* Modal Header */}
              <View style={styles.header}>
                <Text style={styles.title}>Add Your Score</Text>
              </View>

              <View style={styles.content}>
                {/* Assessment Info */}
                {assessment && (
                  <View style={styles.assessmentInfo}>
                    <Text style={styles.assessmentName}>{assessment.name}</Text>
                    <Text style={styles.assessmentMaxScore}>
                      Maximum Score: {assessment.maxScore}
                    </Text>
                  </View>
                )}

                {/* Score Obtained */}
                <View style={styles.inputGroup}>
                  <Text style={styles.label}>Score Obtained</Text>
                  <TextInput
                    style={styles.input}
                    value={formData.score}
                    onChangeText={(value) => handleInputChange('score', value)}
                    placeholder="Enter your score"
                    keyboardType="numeric"
                    placeholderTextColor={colors.gray[400]}
                  />
                </View>

                {/* Extra Credit Checkbox */}
                <View style={styles.checkboxContainer}>
                  <TouchableOpacity
                    style={styles.checkboxRow}
                    onPress={() => {
                      const newExtraCredit = !formData.extraCredit;
                      handleInputChange('extraCredit', newExtraCredit);
                      if (!newExtraCredit) {
                        handleInputChange('extraCreditPoints', '');
                      }
                    }}
                  >
                    <View style={[
                      styles.checkbox,
                      formData.extraCredit && styles.checkboxChecked
                    ]}>
                      {formData.extraCredit && (
                        <Text style={styles.checkmark}>✓</Text>
                      )}
                    </View>
                    <Text style={styles.checkboxLabel}>Extra Credit</Text>
                  </TouchableOpacity>
                  <Text style={styles.checkboxHelperText}>
                    Check this if this score includes extra credit points
                  </Text>
                </View>

                {/* Extra Credit Points */}
                {formData.extraCredit && (
                  <View style={styles.inputGroup}>
                    <Text style={styles.label}>Extra Credit Points</Text>
                    <TextInput
                      style={styles.input}
                      value={formData.extraCreditPoints}
                      onChangeText={(value) => handleInputChange('extraCreditPoints', value)}
                      placeholder="Enter extra credit points"
                      keyboardType="numeric"
                      placeholderTextColor={colors.gray[400]}
                    />
                    <Text style={styles.helperText}>
                      Enter the number of extra credit points to add to your score
                    </Text>
                  </View>
                )}
              </View>

              {/* Modal Footer */}
              <View style={styles.footer}>
                <TouchableOpacity
                  onPress={onClose}
                  style={styles.cancelButton}
                >
                  <Text style={styles.cancelButtonText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={handleSubmit}
                  style={[styles.submitButton, isLoading && styles.submitButtonDisabled]}
                  disabled={isLoading}
                >
                  <Text style={styles.submitButtonText}>
                    {isLoading ? 'Saving...' : 'Save Score'}
                  </Text>
                </TouchableOpacity>
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
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  container: {
    width: '100%',
    maxWidth: 400,
    maxHeight: '90%',
  },
  modalContent: {
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 8,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  header: {
    backgroundColor: colors.green[500],
    paddingHorizontal: 24,
    paddingVertical: 16,
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.text.white,
    textAlign: 'center',
  },
  content: {
    padding: 24,
  },
  assessmentInfo: {
    backgroundColor: colors.background.secondary,
    padding: 16,
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
  assessmentMaxScore: {
    fontSize: 14,
    color: colors.text.secondary,
  },
  inputGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.text.primary,
    marginBottom: 4,
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
  helperText: {
    fontSize: 12,
    color: colors.text.secondary,
    marginTop: 4,
    fontStyle: 'italic',
  },
  checkboxContainer: {
    marginBottom: 16,
  },
  checkboxRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderWidth: 2,
    borderColor: colors.border.medium,
    borderRadius: 4,
    marginRight: 12,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.background.primary,
  },
  checkboxChecked: {
    backgroundColor: colors.green[500],
    borderColor: colors.green[500],
  },
  checkmark: {
    color: colors.text.white,
    fontSize: 14,
    fontWeight: 'bold',
  },
  checkboxLabel: {
    fontSize: 16,
    color: colors.text.primary,
    fontWeight: '500',
  },
  checkboxHelperText: {
    fontSize: 12,
    color: colors.text.secondary,
    marginTop: 4,
    fontStyle: 'italic',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 8,
    padding: 24,
    paddingTop: 0,
  },
  cancelButton: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: colors.border.medium,
    borderRadius: 8,
    backgroundColor: colors.background.primary,
  },
  cancelButtonText: {
    fontSize: 16,
    color: colors.text.secondary,
    fontWeight: '500',
  },
  submitButton: {
    backgroundColor: colors.green[500],
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
  },
  submitButtonDisabled: {
    backgroundColor: colors.gray[400],
  },
  submitButtonText: {
    fontSize: 16,
    color: colors.text.white,
    fontWeight: '600',
  },
});
