import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Modal,
  ScrollView,
  Alert,
  Dimensions,
} from 'react-native';
import { CourseService } from '../../services/courseService';
import { colors } from '../../styles/colors';

const { width } = Dimensions.get('window');

interface AddCourseModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCourseCreated: (updatedCourses: any[]) => void;
  editingCourse?: any;
  existingCourses?: any[];
  userId?: number;
}

export const AddCourseModal: React.FC<AddCourseModalProps> = ({
  isOpen,
  onClose,
  onCourseCreated,
  editingCourse,
  existingCourses = [],
  userId
}) => {
  const [formData, setFormData] = useState({
    name: '',
    courseCode: '',
    credits: 3,
    creditHours: 3,
    yearLevel: '1st year',
    semester: 'FIRST',
    academicYear: `${new Date().getFullYear()}-${new Date().getFullYear() + 1}`,
    description: '',
    gradingScale: 'percentage',
    gpaScale: 'standard',
    maxPoints: 100,
    categorySystem: '3_categories',
    handleMissingGrades: 'exclude',
    courseColor: '#10B981',
    categories: [
      { id: 1, name: 'Assignments', weight: 30 },
      { id: 2, name: 'Quizzes', weight: 30 },
      { id: 3, name: 'Exam', weight: 40 }
    ]
  });

  const [isLoading, setIsLoading] = useState(false);
  const [gpaScaleWarning, setGpaScaleWarning] = useState<string | null>(null);

  // Generate academic years dynamically (matching web version)
  const generateAcademicYears = () => {
    const currentYear = new Date().getFullYear();
    const academicYears = [];
    
    // Add current year first, then previous years (latest to oldest)
    for (let i = 0; i <= 10; i++) {
      const year = currentYear - i;
      const isCurrentYear = i === 0;
      academicYears.push({
        value: `${year}-${year + 1}`,
        label: isCurrentYear ? `${year}-${year + 1} (Current Academic Year)` : `${year}-${year + 1}`
      });
    }
    
    return academicYears;
  };

  // Check for GPA scale inconsistency (matching web version logic)
  const checkGpaScaleConsistency = (selectedGpaScale: string) => {
    if (!existingCourses || existingCourses.length === 0) {
      setGpaScaleWarning(null);
      return;
    }

    // Find courses in the same semester and academic year
    const sameSemesterCourses = existingCourses.filter((course: any) => 
      course.semester === formData.semester && 
      course.academicYear === formData.academicYear
    );

    if (sameSemesterCourses.length === 0) {
      setGpaScaleWarning(null);
      return;
    }

    // Check if any existing course has a different GPA scale
    const differentScaleCourses = sameSemesterCourses.filter((course: any) => 
      course.gpaScale && course.gpaScale !== selectedGpaScale
    );

    if (differentScaleCourses.length > 0) {
      setGpaScaleWarning(
        `You have ${differentScaleCourses.length} other course(s) in ${formData.academicYear.split('-')[0]} ${formData.semester} semester using different GPA scales. This may cause incorrect cumulative GPA calculations in the dashboard. Recommended: Use the same GPA scale as your other courses for accurate grade calculations.`
      );
    } else {
      setGpaScaleWarning(null);
    }
  };

  // Helper function to get color name
  const getColorName = (color: string) => {
    const colorNames: { [key: string]: string } = {
      '#10B981': 'Green',
      '#3B82F6': 'Blue',
      '#8B5CF6': 'Purple',
      '#F59E0B': 'Yellow',
      '#EF4444': 'Red',
      '#06B6D4': 'Cyan',
      '#84CC16': 'Lime',
      '#F97316': 'Orange',
      '#EC4899': 'Pink',
      '#6366F1': 'Indigo',
      '#14B8A6': 'Teal',
      '#F43F5E': 'Rose'
    };
    return colorNames[color] || 'Unknown';
  };

  // Reset form when modal opens/closes or editing course changes
  useEffect(() => {
    if (isOpen) {
      if (editingCourse) {
        setFormData({
          name: editingCourse.name || '',
          courseCode: editingCourse.courseCode || '',
          credits: editingCourse.credits || editingCourse.creditHours || 3,
          creditHours: editingCourse.creditHours || editingCourse.credits || 3,
          yearLevel: editingCourse.yearLevel || '1st year',
          semester: editingCourse.semester || 'FIRST',
          academicYear: editingCourse.academicYear || `${new Date().getFullYear()}-${new Date().getFullYear() + 1}`,
          description: editingCourse.description || '',
          gradingScale: editingCourse.gradingScale || 'percentage',
          gpaScale: editingCourse.gpaScale || 'standard',
          maxPoints: editingCourse.maxPoints || 100,
          categorySystem: editingCourse.categorySystem || '3_categories',
          handleMissingGrades: editingCourse.handleMissingGrades || 'exclude',
          courseColor: editingCourse.courseColor || '#10B981',
          categories: editingCourse.categories || [
            { id: 1, name: 'Assignments', weight: 30 },
            { id: 2, name: 'Quizzes', weight: 30 },
            { id: 3, name: 'Exam', weight: 40 }
          ]
        });
      } else {
        setFormData({
          name: '',
          courseCode: '',
          credits: 3,
          creditHours: 3,
          yearLevel: '1st year',
          semester: 'FIRST',
          academicYear: `${new Date().getFullYear()}-${new Date().getFullYear() + 1}`,
          description: '',
          gradingScale: 'percentage',
          gpaScale: 'standard',
          maxPoints: 100,
          categorySystem: '3_categories',
          handleMissingGrades: 'exclude',
          courseColor: '#10B981',
          categories: [
            { id: 1, name: 'Assignments', weight: 30 },
            { id: 2, name: 'Quizzes', weight: 30 },
            { id: 3, name: 'Exam', weight: 40 }
          ]
        });
      }
    }
  }, [isOpen, editingCourse]);

  const handleInputChange = (field: string, value: string | number) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));

    // Check GPA scale consistency when GPA scale changes
    if (field === 'gpaScale') {
      checkGpaScaleConsistency(value as string);
    }
  };

  // Category management functions
  const updateCategory = (index: number, field: string, value: string | number) => {
    setFormData(prev => ({
      ...prev,
      categories: prev.categories.map((category, i) => 
        i === index ? { ...category, [field]: value } : category
      )
    }));
  };

  const addCategory = () => {
    setFormData(prev => ({
      ...prev,
      categories: [
        ...prev.categories,
        { 
          id: Date.now(), 
          name: '', 
          weight: 0 
        }
      ]
    }));
  };

  const removeCategory = (index: number) => {
    setFormData(prev => ({
      ...prev,
      categories: prev.categories.filter((_, i) => i !== index)
    }));
  };

  const useTemplate = (templateType: string) => {
    let templateCategories: Array<{ id: number; name: string; weight: number }> = [];
    
    switch (templateType) {
      case '3_categories':
        templateCategories = [
          { id: 1, name: 'Assignments', weight: 30 },
          { id: 2, name: 'Quizzes', weight: 30 },
          { id: 3, name: 'Exam', weight: 40 }
        ];
        break;
      case '4_categories':
        templateCategories = [
          { id: 1, name: 'Assignments', weight: 25 },
          { id: 2, name: 'Quizzes', weight: 25 },
          { id: 3, name: 'Midterm', weight: 25 },
          { id: 4, name: 'Final', weight: 25 }
        ];
        break;
      case '5_categories':
        templateCategories = [
          { id: 1, name: 'Assignments', weight: 20 },
          { id: 2, name: 'Quizzes', weight: 20 },
          { id: 3, name: 'Midterm', weight: 20 },
          { id: 4, name: 'Final', weight: 20 },
          { id: 5, name: 'Project', weight: 20 }
        ];
        break;
    }

    setFormData(prev => ({
      ...prev,
      categories: templateCategories
    }));
  };

  const validateForm = () => {
    if (!formData.name.trim()) {
      Alert.alert('Validation Error', 'Course name is required');
      return false;
    }
    if (!formData.courseCode.trim()) {
      Alert.alert('Validation Error', 'Course code is required');
      return false;
    }
    if (formData.credits < 1 || formData.credits > 10) {
      Alert.alert('Validation Error', 'Credits must be between 1 and 10');
      return false;
    }
    return true;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;
    if (!userId) {
      Alert.alert('Error', 'User ID is required');
      return;
    }

    setIsLoading(true);
    try {
      const courseData = {
        name: formData.name.trim(),
        courseCode: formData.courseCode.trim(),
        credits: formData.credits,
        creditHours: formData.creditHours,
        yearLevel: formData.yearLevel,
        semester: formData.semester,
        academicYear: formData.academicYear,
        description: formData.description.trim(),
        gradingScale: formData.gradingScale,
        gpaScale: formData.gpaScale,
        maxPoints: formData.maxPoints,
        categorySystem: formData.categorySystem,
        handleMissingGrades: formData.handleMissingGrades,
        courseColor: formData.courseColor,
        categories: formData.categories,
        userId: userId
      };

      let response: any;
      if (editingCourse) {
        response = await CourseService.updateCourse(editingCourse.id, courseData);
      } else {
        response = await CourseService.createCourse(courseData);
        
        // Create assessment categories for new courses
        if (response && response.id && formData.categories.length > 0) {
          try {
            const createdCategories = [];
            for (const category of formData.categories) {
              const categoryData = {
                categoryName: category.name || "",
                weightPercentage: parseFloat(category.weight.toString()) || 0,
              };

              const createdCategory = await CourseService.addCategoryToCourse(
                response.id,
                categoryData
              );
              createdCategories.push(createdCategory);
            }
            response.categories = createdCategories;
          } catch (categoryError) {
            console.error('Error creating categories:', categoryError);
            response.categories = [];
          }
        } else {
          response.categories = [];
        }
      }

      // Refresh courses list
      const updatedCourses = await CourseService.getCoursesByUserId(userId);
      onCourseCreated(updatedCourses as any[]);

      Alert.alert(
        'Success',
        editingCourse ? 'Course updated successfully!' : 'Course created successfully!'
      );
      onClose();
    } catch (error: any) {
      console.error('Error saving course:', error);
      Alert.alert(
        'Error',
        error.response?.data?.message || 'Failed to save course. Please try again.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal
      visible={isOpen}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <Text style={styles.closeButtonText}>Cancel</Text>
          </TouchableOpacity>
          <Text style={styles.title}>
            {editingCourse ? 'Edit Course' : 'Add New Course'}
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

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          <View style={styles.form}>
            {/* Course Name */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Course Name *</Text>
              <TextInput
                style={styles.input}
                value={formData.name}
                onChangeText={(value) => handleInputChange('name', value)}
                placeholder="e.g., Data Structures and Algorithms"
                placeholderTextColor={colors.gray[400]}
              />
            </View>

            {/* Course Code */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Course Code *</Text>
              <TextInput
                style={styles.input}
                value={formData.courseCode}
                onChangeText={(value) => handleInputChange('courseCode', value.toUpperCase())}
                placeholder="e.g., CS 201"
                placeholderTextColor={colors.gray[400]}
              />
            </View>

            {/* Credits */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Credits</Text>
              <TextInput
                style={styles.input}
                value={formData.credits.toString()}
                onChangeText={(value) => handleInputChange('credits', parseInt(value) || 3)}
                placeholder="3"
                keyboardType="numeric"
                placeholderTextColor={colors.gray[400]}
              />
            </View>

            {/* Year Level */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Year Level</Text>
              <View style={styles.pickerContainer}>
                {['1st year', '2nd year', '3rd year', '4th year'].map((year) => (
                  <TouchableOpacity
                    key={year}
                    style={[
                      styles.pickerOption,
                      formData.yearLevel === year && styles.pickerOptionSelected
                    ]}
                    onPress={() => handleInputChange('yearLevel', year)}
                  >
                    <Text style={[
                      styles.pickerOptionText,
                      formData.yearLevel === year && styles.pickerOptionTextSelected
                    ]}>
                      {year}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Semester */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Semester</Text>
              <View style={styles.pickerContainer}>
                {[
                  { value: 'FIRST', label: '1st Semester' },
                  { value: 'SECOND', label: '2nd Semester' },
                  { value: 'THIRD', label: '3rd Semester' },
                  { value: 'SUMMER', label: 'Summer' }
                ].map((semester) => (
                  <TouchableOpacity
                    key={semester.value}
                    style={[
                      styles.pickerOption,
                      formData.semester === semester.value && styles.pickerOptionSelected
                    ]}
                    onPress={() => handleInputChange('semester', semester.value)}
                  >
                    <Text style={[
                      styles.pickerOptionText,
                      formData.semester === semester.value && styles.pickerOptionTextSelected
                    ]}>
                      {semester.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Academic Year */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Academic Year</Text>
              <View style={styles.pickerContainer}>
                {generateAcademicYears().map((year) => (
                  <TouchableOpacity
                    key={year.value}
                    style={[
                      styles.pickerOption,
                      formData.academicYear === year.value && styles.pickerOptionSelected
                    ]}
                    onPress={() => handleInputChange('academicYear', year.value)}
                  >
                    <Text style={[
                      styles.pickerOptionText,
                      formData.academicYear === year.value && styles.pickerOptionTextSelected
                    ]}>
                      {year.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
              <Text style={styles.helperText}>Select the academic year for this course. Only past and current academic years are available.</Text>
            </View>

            {/* Grading Scale */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Grading Scale</Text>
              <View style={styles.pickerContainer}>
                {[
                  { value: 'percentage', label: 'Percentage (0-100)' },
                  { value: 'gpa', label: 'GPA (0.0-4.0)' }
                ].map((scale) => (
                  <TouchableOpacity
                    key={scale.value}
                    style={[
                      styles.pickerOption,
                      formData.gradingScale === scale.value && styles.pickerOptionSelected
                    ]}
                    onPress={() => handleInputChange('gradingScale', scale.value)}
                  >
                    <Text style={[
                      styles.pickerOptionText,
                      formData.gradingScale === scale.value && styles.pickerOptionTextSelected
                    ]}>
                      {scale.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Credit Hours */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Credit Hours</Text>
              <TextInput
                style={styles.input}
                value={formData.creditHours.toString()}
                onChangeText={(value) => handleInputChange('creditHours', parseInt(value) || 3)}
                placeholder="3"
                keyboardType="numeric"
                placeholderTextColor={colors.gray[400]}
              />
              <Text style={styles.helperText}>Used for GPA calculations</Text>
            </View>

            {/* GPA Scale */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>GPA Scale</Text>
              <View style={styles.pickerContainer}>
                {[
                  { value: 'standard', label: 'Standard 4.0 (1.0 = F, 4.0 = A)' },
                  { value: 'weighted', label: 'Weighted 5.0 (1.0 = F, 5.0 = A)' }
                ].map((scale) => (
                  <TouchableOpacity
                    key={scale.value}
                    style={[
                      styles.pickerOption,
                      formData.gpaScale === scale.value && styles.pickerOptionSelected
                    ]}
                    onPress={() => handleInputChange('gpaScale', scale.value)}
                  >
                    <Text style={[
                      styles.pickerOptionText,
                      formData.gpaScale === scale.value && styles.pickerOptionTextSelected
                    ]}>
                      {scale.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
              <Text style={styles.helperText}>Select the GPA scale for this course</Text>
              {gpaScaleWarning ? (
                <View style={styles.warningBanner}>
                  <Text style={styles.warningBannerText}>
                    ⚠️ GPA Scale Inconsistency Warning
                  </Text>
                  <Text style={styles.warningBannerMessage}>
                    {gpaScaleWarning}
                  </Text>
                </View>
              ) : (
                <View style={styles.infoBanner}>
                  <Text style={styles.infoBannerText}>
                    Consistent with other courses in {formData.academicYear.split('-')[0]} {formData.semester} semester
                  </Text>
                </View>
              )}
            </View>

            {/* Max Points */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Max Points</Text>
              <TextInput
                style={styles.input}
                value={formData.maxPoints.toString()}
                onChangeText={(value) => handleInputChange('maxPoints', parseInt(value) || 100)}
                placeholder="100"
                keyboardType="numeric"
                placeholderTextColor={colors.gray[400]}
              />
              <Text style={styles.helperText}>Maximum points for points-based grading</Text>
            </View>

            {/* Category System */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Category System</Text>
              <View style={styles.pickerContainer}>
                {[
                  { value: '3_categories', label: '3 Categories (Assignments, Quizzes, Exam)' },
                  { value: '4_categories', label: '4 Categories (Assignments, Quizzes, Midterm, Final)' },
                  { value: '5_categories', label: '5 Categories (Assignments, Quizzes, Midterm, Final, Project)' },
                  { value: 'custom', label: 'Custom Categories' }
                ].map((system) => (
                  <TouchableOpacity
                    key={system.value}
                    style={[
                      styles.pickerOption,
                      formData.categorySystem === system.value && styles.pickerOptionSelected
                    ]}
                    onPress={() => {
                      handleInputChange('categorySystem', system.value);
                      if (system.value !== 'custom') {
                        useTemplate(system.value);
                      }
                    }}
                  >
                    <Text style={[
                      styles.pickerOptionText,
                      formData.categorySystem === system.value && styles.pickerOptionTextSelected
                    ]}>
                      {system.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Categories */}
            <View style={styles.inputGroup}>
              <View style={styles.categoriesHeader}>
                <Text style={styles.label}>Categories</Text>
                <View style={styles.categoryActions}>
                  <TouchableOpacity
                    style={styles.templateButton}
                    onPress={() => useTemplate(formData.categorySystem)}
                  >
                    <Text style={styles.templateButtonText}>Use Template</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.addCategoryButton}
                    onPress={addCategory}
                  >
                    <Text style={styles.addCategoryButtonText}>+ Add Category</Text>
                  </TouchableOpacity>
                </View>
              </View>
              
              {formData.categories.map((category, index) => (
                <View key={category.id} style={styles.categoryRow}>
                  <TextInput
                    style={[styles.input, styles.categoryNameInput]}
                    value={category.name}
                    onChangeText={(value) => updateCategory(index, 'name', value)}
                    placeholder="Category name"
                    placeholderTextColor={colors.gray[400]}
                  />
                  <TextInput
                    style={[styles.input, styles.categoryWeightInput]}
                    value={category.weight.toString()}
                    onChangeText={(value) => updateCategory(index, 'weight', parseFloat(value) || 0)}
                    placeholder="Weight %"
                    keyboardType="numeric"
                    placeholderTextColor={colors.gray[400]}
                  />
                  <TouchableOpacity
                    style={styles.removeCategoryButton}
                    onPress={() => removeCategory(index)}
                  >
                    <Text style={styles.removeCategoryButtonText}>×</Text>
                  </TouchableOpacity>
                </View>
              ))}
              
              <Text style={styles.helperText}>
                Total Weight: {formData.categories.reduce((sum, cat) => sum + cat.weight, 0)}%
              </Text>
            </View>

            {/* Handle Missing Grades */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Handle Missing Grades</Text>
              <View style={styles.pickerContainer}>
                {[
                  { value: 'exclude', label: 'Exclude from calculation' },
                  { value: 'zero', label: 'Treat as zero' },
                  { value: 'average', label: 'Use category average' }
                ].map((option) => (
                  <TouchableOpacity
                    key={option.value}
                    style={[
                      styles.pickerOption,
                      formData.handleMissingGrades === option.value && styles.pickerOptionSelected
                    ]}
                    onPress={() => handleInputChange('handleMissingGrades', option.value)}
                  >
                    <Text style={[
                      styles.pickerOptionText,
                      formData.handleMissingGrades === option.value && styles.pickerOptionTextSelected
                    ]}>
                      {option.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
              <Text style={styles.helperText}>How to handle missing or incomplete grades</Text>
            </View>

            {/* Course Color */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Course Color</Text>
              <View style={styles.colorGrid}>
                {[
                  '#10B981', '#3B82F6', '#8B5CF6', '#F59E0B',
                  '#EF4444', '#06B6D4', '#84CC16', '#F97316',
                  '#EC4899', '#6366F1', '#14B8A6', '#F43F5E'
                ].map((color) => (
                  <TouchableOpacity
                    key={color}
                    style={[
                      styles.colorSwatch,
                      { backgroundColor: color },
                      formData.courseColor === color && styles.colorSwatchSelected
                    ]}
                    onPress={() => handleInputChange('courseColor', color)}
                  >
                    {formData.courseColor === color && (
                      <Text style={styles.colorCheckmark}>✓</Text>
                    )}
                  </TouchableOpacity>
                ))}
              </View>
              <Text style={styles.helperText}>
                Selected: {getColorName(formData.courseColor)}
              </Text>
            </View>

            {/* Description */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Description (Optional)</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                value={formData.description}
                onChangeText={(value) => handleInputChange('description', value)}
                placeholder="Brief description of the course..."
                placeholderTextColor={colors.gray[400]}
                multiline
                numberOfLines={3}
                textAlignVertical="top"
              />
            </View>
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
  },
  form: {
    padding: 16,
  },
  inputGroup: {
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
    borderColor: colors.border.medium,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontSize: 16,
    color: colors.text.primary,
    backgroundColor: colors.background.secondary,
  },
  textArea: {
    height: 80,
    textAlignVertical: 'top',
  },
  pickerContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  pickerOption: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: colors.border.medium,
    backgroundColor: colors.background.secondary,
  },
  pickerOptionSelected: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  pickerOptionText: {
    fontSize: 14,
    color: colors.text.primary,
    fontWeight: '500',
  },
  pickerOptionTextSelected: {
    color: colors.text.white,
  },
  helperText: {
    fontSize: 12,
    color: colors.gray[500],
    marginTop: 4,
    fontStyle: 'italic',
  },
  infoBanner: {
    backgroundColor: colors.green[50],
    padding: 8,
    borderRadius: 6,
    marginTop: 8,
    borderLeftWidth: 3,
    borderLeftColor: colors.green[400],
  },
  infoBannerText: {
    fontSize: 12,
    color: colors.green[700],
    fontWeight: '500',
  },
  colorGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 8,
  },
  colorSwatch: {
    width: 32,
    height: 32,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: 'transparent',
    justifyContent: 'center',
    alignItems: 'center',
  },
  colorSwatchSelected: {
    borderColor: colors.gray[800],
    borderWidth: 3,
  },
  colorCheckmark: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
    textShadowColor: 'rgba(0,0,0,0.5)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  warningBanner: {
    backgroundColor: colors.yellow[50],
    padding: 12,
    borderRadius: 8,
    marginTop: 8,
    borderLeftWidth: 4,
    borderLeftColor: colors.yellow[400],
  },
  warningBannerText: {
    fontSize: 14,
    color: colors.yellow[800],
    fontWeight: '600',
    marginBottom: 4,
  },
  warningBannerMessage: {
    fontSize: 12,
    color: colors.yellow[700],
    lineHeight: 16,
  },
  categoriesHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  categoryActions: {
    flexDirection: 'row',
    gap: 8,
  },
  templateButton: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: colors.green[400],
    backgroundColor: colors.background.secondary,
  },
  templateButtonText: {
    fontSize: 12,
    color: colors.green[600],
    fontWeight: '500',
  },
  addCategoryButton: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 6,
    backgroundColor: colors.primary,
  },
  addCategoryButtonText: {
    fontSize: 12,
    color: colors.text.white,
    fontWeight: '500',
  },
  categoryRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 8,
    alignItems: 'center',
  },
  categoryNameInput: {
    flex: 1,
  },
  categoryWeightInput: {
    width: 80,
  },
  removeCategoryButton: {
    width: 32,
    height: 32,
    borderRadius: 6,
    backgroundColor: colors.red[50],
    borderWidth: 1,
    borderColor: colors.red[200],
    justifyContent: 'center',
    alignItems: 'center',
  },
  removeCategoryButtonText: {
    fontSize: 18,
    color: colors.red[600],
    fontWeight: 'bold',
  },
});
