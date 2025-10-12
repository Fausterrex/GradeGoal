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
import { AssessmentService } from '../../services/assessmentService';

interface AssessmentModalProps {
  visible: boolean;
  onClose: () => void;
  course?: any;
  assessment?: any;
  onAssessmentSaved: () => void;
}

export const AssessmentModal: React.FC<AssessmentModalProps> = ({
  visible,
  onClose,
  course,
  assessment,
  onAssessmentSaved,
}) => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    maxScore: '100',
    weight: '0',
    categoryId: '',
  });
  const [isLoading, setIsLoading] = useState(false);
  const [categories, setCategories] = useState<any[]>([]);

  useEffect(() => {
    if (visible) {
      loadCategories();
      if (assessment) {
        setFormData({
          name: assessment.name || '',
          description: assessment.description || '',
          maxScore: assessment.maxScore?.toString() || '100',
          weight: assessment.weight?.toString() || '0',
          categoryId: assessment.categoryId?.toString() || '',
        });
      } else {
        setFormData({
          name: '',
          description: '',
          maxScore: '100',
          weight: '0',
          categoryId: '',
        });
      }
    }
  }, [visible, assessment, course]);

  const loadCategories = async () => {
    if (!course?.id) return;
    
    try {
      const categoriesData = await AssessmentService.getCategoriesByCourseId(course.id);
      setCategories(categoriesData || []);
    } catch (error) {
      console.error('Error loading categories:', error);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  const validateForm = () => {
    if (!formData.name.trim()) {
      Alert.alert('Validation Error', 'Assessment name is required');
      return false;
    }

    if (!formData.categoryId) {
      Alert.alert('Validation Error', 'Please select a category');
      return false;
    }

    const maxScore = parseFloat(formData.maxScore);
    const weight = parseFloat(formData.weight);

    if (isNaN(maxScore) || isNaN(weight)) {
      Alert.alert('Validation Error', 'Please enter valid numbers for max score and weight');
      return false;
    }

    if (maxScore <= 0 || weight < 0) {
      Alert.alert('Validation Error', 'Max score must be positive and weight must be non-negative');
      return false;
    }

    return true;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;
    if (!course?.id) {
      Alert.alert('Error', 'Course information is missing');
      return;
    }

    setIsLoading(true);
    try {
      const assessmentData = {
        courseId: course.id,
        name: formData.name.trim(),
        description: formData.description.trim(),
        maxScore: parseFloat(formData.maxScore),
        weight: parseFloat(formData.weight),
        categoryId: parseInt(formData.categoryId),
      };

      if (assessment) {
        await AssessmentService.updateAssessment(assessment.id, assessmentData);
        Alert.alert('Success', 'Assessment updated successfully!');
      } else {
        await AssessmentService.createAssessment(assessmentData);
        Alert.alert('Success', 'Assessment created successfully!');
      }
      
      onAssessmentSaved();
      onClose();
    } catch (error: any) {
      console.error('Error saving assessment:', error);
      Alert.alert(
        'Error',
        error.response?.data?.message || 'Failed to save assessment. Please try again.'
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
          <Text style={styles.title}>
            {assessment ? 'Edit Assessment' : 'Add Assessment'}
          </Text>
          <TouchableOpacity
            onPress={handleSubmit}
            style={[styles.saveButton, isLoading && styles.saveButtonDisabled]}
            disabled={isLoading}
          >
            <Text style={styles.saveButtonText}>
              {isLoading ? 'Saving...' : 'Save'}
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.content}>
          {/* Course Info */}
          {course && (
            <View style={styles.courseInfo}>
              <Text style={styles.courseName}>{course.name || course.courseName}</Text>
              <Text style={styles.courseCode}>{course.courseCode}</Text>
            </View>
          )}

          {/* Assessment Name */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Assessment Name *</Text>
            <TextInput
              style={styles.input}
              value={formData.name}
              onChangeText={(value) => handleInputChange('name', value)}
              placeholder="e.g., Midterm Exam, Assignment 1"
              placeholderTextColor={colors.gray[400]}
            />
          </View>

          {/* Description */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Description (Optional)</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              value={formData.description}
              onChangeText={(value) => handleInputChange('description', value)}
              placeholder="Describe what this assessment covers..."
              placeholderTextColor={colors.gray[400]}
              multiline
              numberOfLines={3}
              textAlignVertical="top"
            />
          </View>

          {/* Max Score */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Max Score *</Text>
            <TextInput
              style={styles.input}
              value={formData.maxScore}
              onChangeText={(value) => handleInputChange('maxScore', value)}
              placeholder="100"
              keyboardType="numeric"
              placeholderTextColor={colors.gray[400]}
            />
          </View>

          {/* Weight */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Weight (Optional)</Text>
            <TextInput
              style={styles.input}
              value={formData.weight}
              onChangeText={(value) => handleInputChange('weight', value)}
              placeholder="0"
              keyboardType="numeric"
              placeholderTextColor={colors.gray[400]}
            />
            <Text style={styles.helperText}>
              Weight percentage for this assessment within its category
            </Text>
          </View>

          {/* Category Selection */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Category *</Text>
            {categories.length > 0 ? (
              <View style={styles.categoryContainer}>
                {categories.map((category) => (
                  <TouchableOpacity
                    key={category.id}
                    style={[
                      styles.categoryOption,
                      formData.categoryId === category.id.toString() && styles.categoryOptionSelected,
                    ]}
                    onPress={() => handleInputChange('categoryId', category.id.toString())}
                  >
                    <Text style={[
                      styles.categoryOptionText,
                      formData.categoryId === category.id.toString() && styles.categoryOptionTextSelected,
                    ]}>
                      {category.name || category.categoryName}
                    </Text>
                    <Text style={[
                      styles.categoryWeight,
                      formData.categoryId === category.id.toString() && styles.categoryWeightSelected,
                    ]}>
                      {category.weightPercentage || category.weight || 0}%
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            ) : (
              <Text style={styles.noCategoriesText}>
                No categories available. Please create categories first.
              </Text>
            )}
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
  courseInfo: {
    backgroundColor: colors.background.secondary,
    padding: 12,
    borderRadius: 8,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: colors.border.light,
  },
  courseName: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text.primary,
    marginBottom: 4,
  },
  courseCode: {
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
  helperText: {
    fontSize: 12,
    color: colors.text.secondary,
    marginTop: 4,
    fontStyle: 'italic',
  },
  categoryContainer: {
    gap: 8,
  },
  categoryOption: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 12,
    backgroundColor: colors.background.secondary,
    borderWidth: 1,
    borderColor: colors.border.medium,
    borderRadius: 8,
  },
  categoryOptionSelected: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  categoryOptionText: {
    fontSize: 16,
    fontWeight: '500',
    color: colors.text.primary,
  },
  categoryOptionTextSelected: {
    color: colors.text.white,
  },
  categoryWeight: {
    fontSize: 14,
    color: colors.text.secondary,
  },
  categoryWeightSelected: {
    color: colors.text.white,
  },
  noCategoriesText: {
    fontSize: 14,
    color: colors.text.secondary,
    fontStyle: 'italic',
    textAlign: 'center',
    paddingVertical: 20,
  },
});

