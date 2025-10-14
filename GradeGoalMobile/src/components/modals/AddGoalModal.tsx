import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { colors } from '../../styles/colors';
import { getAvailableCourses, hasExistingGoal } from '../../utils/goalUtils';

interface AddGoalModalProps {
  isVisible: boolean;
  onClose: () => void;
  onSubmit: (formData: any) => void;
  editingGoal?: any;
  courses?: any[];
  userEmail?: string;
  existingGoals?: any[];
}

export const AddGoalModal: React.FC<AddGoalModalProps> = ({
  isVisible,
  onClose,
  onSubmit,
  editingGoal,
  courses = [],
  userEmail,
  existingGoals = []
}) => {
  const [formData, setFormData] = useState({
    goalTitle: '',
    goalType: 'COURSE_GRADE',
    targetValue: '',
    targetDate: '',
    description: '',
    courseId: '',
    semester: '',
    academicYear: '',
    priority: 'MEDIUM'
  });

  const [availableCourses, setAvailableCourses] = useState<any[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Initialize form data when editing
  useEffect(() => {
    if (editingGoal) {
      setFormData({
        goalTitle: editingGoal.goalTitle || '',
        goalType: editingGoal.goalType || 'COURSE_GRADE',
        targetValue: editingGoal.targetValue?.toString() || '',
        targetDate: editingGoal.targetDate || '',
        description: editingGoal.description || '',
        courseId: editingGoal.courseId?.toString() || '',
        semester: editingGoal.semester || '',
        academicYear: editingGoal.academicYear || '',
        priority: editingGoal.priority || 'MEDIUM'
      });
    } else {
      // Reset form for new goal
      setFormData({
        goalTitle: '',
        goalType: 'COURSE_GRADE',
        targetValue: '',
        targetDate: '',
        description: '',
        courseId: '',
        semester: '',
        academicYear: '',
        priority: 'MEDIUM'
      });
    }
  }, [editingGoal, isVisible]);

  // Update available courses when goal type changes
  useEffect(() => {
    if (formData.goalType === 'COURSE_GRADE') {
      const available = getAvailableCourses(courses, existingGoals, editingGoal?.goalId);
      setAvailableCourses(available);
    } else {
      setAvailableCourses([]);
    }
  }, [formData.goalType, courses, existingGoals, editingGoal?.goalId]);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = async () => {
    // Basic validation
    if (!formData.goalTitle.trim()) {
      Alert.alert('Error', 'Please enter a goal title');
      return;
    }

    if (!formData.targetValue || parseFloat(formData.targetValue) <= 0) {
      Alert.alert('Error', 'Please enter a valid target value');
      return;
    }

    if (formData.goalType === 'COURSE_GRADE' && !formData.courseId) {
      Alert.alert('Error', 'Please select a course for course grade goals');
      return;
    }

    if (formData.goalType === 'SEMESTER_GPA' && (!formData.semester || !formData.academicYear)) {
      Alert.alert('Error', 'Please select semester and academic year for semester GPA goals');
      return;
    }

    setIsSubmitting(true);
    try {
      await onSubmit(formData);
    } catch (error) {
      console.error('Error submitting goal:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const getGoalTypeOptions = () => [
    { value: 'COURSE_GRADE', label: 'Course Grade' },
    { value: 'SEMESTER_GPA', label: 'Semester GPA' },
    { value: 'CUMMULATIVE_GPA', label: 'Cumulative GPA' }
  ];

  const getPriorityOptions = () => [
    { value: 'LOW', label: 'Low Priority' },
    { value: 'MEDIUM', label: 'Medium Priority' },
    { value: 'HIGH', label: 'High Priority' }
  ];

  const getSemesterOptions = () => [
    { value: 'FIRST', label: 'First Semester' },
    { value: 'SECOND', label: 'Second Semester' },
    { value: 'THIRD', label: 'Third Semester' },
    { value: 'SUMMER', label: 'Summer' }
  ];

  const getAcademicYearOptions = () => {
    const currentYear = new Date().getFullYear();
    return [
      { value: `${currentYear}-${currentYear + 1}`, label: `${currentYear}-${currentYear + 1}` },
      { value: `${currentYear - 1}-${currentYear}`, label: `${currentYear - 1}-${currentYear}` }
    ];
  };

  const renderSelectField = (
    label: string,
    value: string,
    options: { value: string; label: string }[],
    onValueChange: (value: string) => void,
    required: boolean = false
  ) => (
    <View style={styles.fieldContainer}>
      <Text style={styles.fieldLabel}>
        {label} {required && <Text style={styles.required}>*</Text>}
      </Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.optionsContainer}>
        {options.map((option) => (
          <TouchableOpacity
            key={option.value}
            onPress={() => onValueChange(option.value)}
            style={[
              styles.optionChip,
              value === option.value && styles.selectedOptionChip
            ]}
          >
            <Text style={[
              styles.optionChipText,
              value === option.value && styles.selectedOptionChipText
            ]}>
              {option.label}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );

  return (
    <Modal
      visible={isVisible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={onClose} style={styles.cancelButton}>
            <Text style={styles.cancelButtonText}>Cancel</Text>
          </TouchableOpacity>
          <Text style={styles.title}>
            {editingGoal ? 'Edit Goal' : 'Add New Goal'}
          </Text>
          <TouchableOpacity 
            onPress={handleSubmit} 
            style={[styles.saveButton, isSubmitting && styles.disabledButton]}
            disabled={isSubmitting}
          >
            <Text style={styles.saveButtonText}>
              {isSubmitting ? 'Saving...' : 'Save'}
            </Text>
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {/* Goal Title */}
          <View style={styles.fieldContainer}>
            <Text style={styles.fieldLabel}>
              Goal Title <Text style={styles.required}>*</Text>
            </Text>
            <TextInput
              style={styles.textInput}
              value={formData.goalTitle}
              onChangeText={(value) => handleInputChange('goalTitle', value)}
              placeholder="Enter goal title"
              placeholderTextColor={colors.text.secondary}
            />
          </View>

          {/* Goal Type */}
          {renderSelectField(
            'Goal Type',
            formData.goalType,
            getGoalTypeOptions(),
            (value) => handleInputChange('goalType', value),
            true
          )}

          {/* Target Value */}
          <View style={styles.fieldContainer}>
            <Text style={styles.fieldLabel}>
              Target Value <Text style={styles.required}>*</Text>
            </Text>
            <TextInput
              style={styles.textInput}
              value={formData.targetValue}
              onChangeText={(value) => handleInputChange('targetValue', value)}
              placeholder="Enter target value (e.g., 3.5 for GPA or 85 for percentage)"
              placeholderTextColor={colors.text.secondary}
              keyboardType="numeric"
            />
          </View>

          {/* Course Selection (for Course Grade goals) */}
          {formData.goalType === 'COURSE_GRADE' && (
            <View style={styles.fieldContainer}>
              <Text style={styles.fieldLabel}>
                Course <Text style={styles.required}>*</Text>
              </Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.optionsContainer}>
                {availableCourses.map((course) => (
                  <TouchableOpacity
                    key={course.courseId}
                    onPress={() => handleInputChange('courseId', course.courseId.toString())}
                    style={[
                      styles.optionChip,
                      formData.courseId === course.courseId.toString() && styles.selectedOptionChip
                    ]}
                  >
                    <Text style={[
                      styles.optionChipText,
                      formData.courseId === course.courseId.toString() && styles.selectedOptionChipText
                    ]}>
                      {course.courseName}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
              {availableCourses.length === 0 && (
                <Text style={styles.noOptionsText}>
                  No available courses. All courses may already have goals.
                </Text>
              )}
            </View>
          )}

          {/* Semester Selection (for Semester GPA goals) */}
          {formData.goalType === 'SEMESTER_GPA' && (
            <>
              {renderSelectField(
                'Semester',
                formData.semester,
                getSemesterOptions(),
                (value) => handleInputChange('semester', value),
                true
              )}
              {renderSelectField(
                'Academic Year',
                formData.academicYear,
                getAcademicYearOptions(),
                (value) => handleInputChange('academicYear', value),
                true
              )}
            </>
          )}

          {/* Priority */}
          {renderSelectField(
            'Priority',
            formData.priority,
            getPriorityOptions(),
            (value) => handleInputChange('priority', value)
          )}

          {/* Target Date */}
          <View style={styles.fieldContainer}>
            <Text style={styles.fieldLabel}>Target Date</Text>
            <TextInput
              style={styles.textInput}
              value={formData.targetDate}
              onChangeText={(value) => handleInputChange('targetDate', value)}
              placeholder="YYYY-MM-DD (optional)"
              placeholderTextColor={colors.text.secondary}
            />
          </View>

          {/* Description */}
          <View style={styles.fieldContainer}>
            <Text style={styles.fieldLabel}>Description</Text>
            <TextInput
              style={[styles.textInput, styles.textArea]}
              value={formData.description}
              onChangeText={(value) => handleInputChange('description', value)}
              placeholder="Enter goal description (optional)"
              placeholderTextColor={colors.text.secondary}
              multiline
              numberOfLines={3}
            />
          </View>
        </ScrollView>
      </View>
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
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.border.light,
  },
  cancelButton: {
    padding: 8,
  },
  cancelButtonText: {
    fontSize: 16,
    color: colors.text.secondary,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text.primary,
  },
  saveButton: {
    padding: 8,
  },
  saveButtonText: {
    fontSize: 16,
    color: colors.purple[600],
    fontWeight: '600',
  },
  disabledButton: {
    opacity: 0.5,
  },
  content: {
    flex: 1,
    padding: 16,
  },
  fieldContainer: {
    marginBottom: 20,
  },
  fieldLabel: {
    fontSize: 16,
    fontWeight: '500',
    color: colors.text.primary,
    marginBottom: 8,
  },
  required: {
    color: colors.red[500],
  },
  textInput: {
    borderWidth: 1,
    borderColor: colors.border.light,
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
  optionsContainer: {
    flexGrow: 0,
  },
  optionChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: colors.gray[100],
    marginRight: 8,
    borderWidth: 1,
    borderColor: colors.gray[200],
  },
  selectedOptionChip: {
    backgroundColor: colors.purple[100],
    borderColor: colors.purple[300],
  },
  optionChipText: {
    fontSize: 14,
    color: colors.text.secondary,
    fontWeight: '500',
  },
  selectedOptionChipText: {
    color: colors.purple[700],
    fontWeight: '600',
  },
  noOptionsText: {
    fontSize: 14,
    color: colors.text.secondary,
    fontStyle: 'italic',
    marginTop: 8,
  },
});
