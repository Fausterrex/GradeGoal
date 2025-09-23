// ========================================
// GOAL MODAL COMPONENT
// ========================================
// This component handles the add/edit goal modal form

import React, { useState, useEffect } from "react";
import { FaTimes, FaFlag } from "react-icons/fa";
import { 
  validateGoalForm, 
  getInputConstraints, 
  getConversionDisplay, 
  getAvailableCoursesForModal
} from "./goalModalUtils";

const GoalModal = ({
  isOpen,
  onClose,
  onSubmit,
  editingGoal,
  courses,
  userEmail,
  existingGoals = []
}) => {
  const [formData, setFormData] = useState({
    goalTitle: '',
    goalType: 'COURSE_GRADE',
    targetValue: '',
    courseId: '',
    priority: 'MEDIUM',
    targetDate: '',
    description: '',
    semester: '',
    academicYear: ''
  });
  const [validationError, setValidationError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Reset form when modal opens/closes or editing goal changes
  useEffect(() => {
    if (isOpen) {
      if (editingGoal) {
        setFormData({
          goalTitle: editingGoal.goalTitle || '',
          goalType: editingGoal.goalType || 'COURSE_GRADE',
          targetValue: editingGoal.targetValue || '',
          courseId: editingGoal.courseId || '',
          priority: editingGoal.priority || 'MEDIUM',
          targetDate: editingGoal.targetDate || '',
          description: editingGoal.description || '',
          semester: editingGoal.semester || '',
          academicYear: editingGoal.academicYear || ''
        });
      } else {
        setFormData({
          goalTitle: '',
          goalType: 'COURSE_GRADE',
          targetValue: '',
          courseId: '',
          priority: 'MEDIUM',
          targetDate: '',
          description: '',
          semester: '',
          academicYear: new Date().getFullYear().toString()
        });
      }
      setValidationError('');
    }
  }, [isOpen, editingGoal]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    
    // If academic year changes and we have a semester selected, check if it should be reset
    if (name === 'academicYear' && formData.semester) {
      const newAcademicYear = value;
      const hasExistingGoal = existingGoals.some(goal => 
        goal.goalType === 'SEMESTER_GPA' && 
        goal.semester === formData.semester && 
        goal.academicYear === newAcademicYear &&
        goal.goalId !== editingGoal?.goalId
      );
      
      // If the selected semester already has a goal for the new academic year, reset semester
      if (hasExistingGoal) {
        setFormData(prev => ({
          ...prev,
          [name]: value,
          semester: '' // Reset semester selection
        }));
      } else {
        setFormData(prev => ({
          ...prev,
          [name]: value
        }));
      }
    } else if (name === 'goalType') {
      // If goal type changes, reset related fields
      setFormData(prev => ({
        ...prev,
        [name]: value,
        semester: '', // Reset semester for semester GPA goals
        courseId: '' // Reset course for course grade goals
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
    
    // Clear validation error when user starts typing
    if (name === 'targetValue' && validationError) {
      setValidationError('');
    }
  };

  const validateForm = () => {
    const validation = validateGoalForm(formData, courses, existingGoals, editingGoal);
    
    if (!validation.isValid) {
      setValidationError(validation.errors[0]); // Show first error
      return false;
    }
    
    setValidationError('');
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Check for disabled goal types and prevent submission
    if (!editingGoal) {
      if (formData.goalType === 'CUMMULATIVE_GPA' && hasExistingCumulativeGoal) {
        setValidationError('A cumulative GPA goal already exists');
        return;
      }
      
      if (formData.goalType === 'SEMESTER_GPA' && formData.semester) {
        const hasSpecificSemester = hasExistingSemesterGoal(formData.semester, formData.academicYear);
        if (hasSpecificSemester) {
          const semesterName = formData.semester === 'FIRST' ? '1st' : 
                             formData.semester === 'SECOND' ? '2nd' : '3rd';
          setValidationError(`A goal already exists for ${semesterName} Semester ${formData.academicYear}`);
          return;
        }
      }
    }
    
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    try {
      await onSubmit(formData);
      onClose();
    } catch (error) {
      console.error('Error submitting goal:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const inputConstraints = getInputConstraints(formData.goalType, formData.courseId, courses);

  const conversionDisplay = getConversionDisplay(
    formData.goalType, 
    formData.courseId, 
    formData.targetValue, 
    courses
  );

  const availableCourses = getAvailableCoursesForModal(
    formData.goalType, 
    courses, 
    existingGoals, 
    editingGoal?.goalId
  );

  // Check for existing goals to disable certain options
  const hasExistingCumulativeGoal = existingGoals.some(goal => 
    goal.goalType === 'CUMMULATIVE_GPA' && goal.goalId !== editingGoal?.goalId
  );
  
  const hasExistingSemesterGoal = (semester, academicYear) => {
    return existingGoals.some(goal => 
      goal.goalType === 'SEMESTER_GPA' && 
      goal.semester === semester && 
      goal.academicYear === academicYear &&
      goal.goalId !== editingGoal?.goalId
    );
  };

  // Check if all semesters (1st, 2nd, 3rd) have goals for the current academic year
  const areAllSemestersTaken = (goals) => {
    const currentYear = formData.academicYear || new Date().getFullYear().toString();
    const semesters = ['FIRST', 'SECOND', 'THIRD'];
    
    return semesters.every(semester => 
      goals.some(goal => 
        goal.goalType === 'SEMESTER_GPA' && 
        goal.semester === semester && 
        goal.academicYear === currentYear &&
        goal.goalId !== editingGoal?.goalId
      )
    );
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-800">
              {editingGoal ? 'Edit Goal' : 'Add New Goal'}
            </h3>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700 transition-colors duration-200"
            >
              <FaTimes className="w-5 h-5" />
            </button>
          </div>

          {/* Validation Error */}
          {validationError && (
            <div className="mb-4 p-3 bg-red-100 border border-red-300 rounded-md">
              <div className="flex items-center">
                <FaFlag className="text-red-600 mr-2" />
                <span className="text-red-800 text-sm font-medium">
                  {validationError}
                </span>
              </div>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Goal Title */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Goal Title *
              </label>
              <input
                type="text"
                name="goalTitle"
                value={formData.goalTitle}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                placeholder="Enter goal title"
                required
              />
            </div>

            {/* Goal Type */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Goal Type *
              </label>
              <select
                name="goalType"
                value={formData.goalType}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              >
                <option value="COURSE_GRADE">Course Grade</option>
                <option 
                  value="SEMESTER_GPA"
                  disabled={!editingGoal && areAllSemestersTaken(existingGoals)}
                >
                  Semester GPA {!editingGoal && areAllSemestersTaken(existingGoals) ? '(All semesters taken)' : ''}
                </option>
                <option 
                  value="CUMMULATIVE_GPA"
                  disabled={!editingGoal && hasExistingCumulativeGoal}
                >
                  Cumulative GPA {!editingGoal && hasExistingCumulativeGoal ? '(Already exists)' : ''}
                </option>
              </select>
              {/* Help text for disabled options */}
              {!editingGoal && (hasExistingCumulativeGoal || areAllSemestersTaken(existingGoals)) && (
                <div className="mt-2 p-2 bg-blue-50 border border-blue-200 rounded-md">
                  <p className="text-sm text-blue-700">
                    <span className="font-medium">Note:</span> Some goal types are disabled because you already have existing goals for them. 
                    You can only have one cumulative GPA goal and one goal per semester per academic year.
                  </p>
                </div>
              )}
            </div>

            {/* Semester Selection (for Semester GPA goals) */}
            {formData.goalType === 'SEMESTER_GPA' && (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Semester *
                  </label>
                  <select
                    name="semester"
                    value={formData.semester}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    required
                  >
                    <option value="">Select semester</option>
                    <option 
                      value="FIRST"
                      disabled={!editingGoal && hasExistingSemesterGoal('FIRST', formData.academicYear)}
                    >
                      1st Semester {!editingGoal && hasExistingSemesterGoal('FIRST', formData.academicYear) ? '(Already exists)' : ''}
                    </option>
                    <option 
                      value="SECOND"
                      disabled={!editingGoal && hasExistingSemesterGoal('SECOND', formData.academicYear)}
                    >
                      2nd Semester {!editingGoal && hasExistingSemesterGoal('SECOND', formData.academicYear) ? '(Already exists)' : ''}
                    </option>
                    <option 
                      value="THIRD"
                      disabled={!editingGoal && hasExistingSemesterGoal('THIRD', formData.academicYear)}
                    >
                      3rd Semester {!editingGoal && hasExistingSemesterGoal('THIRD', formData.academicYear) ? '(Already exists)' : ''}
                    </option>
                  </select>
                  {/* Help text for disabled semester options */}
                  {!editingGoal && formData.academicYear && (
                    <div className="mt-2">
                      {['FIRST', 'SECOND', 'THIRD'].map(semester => {
                        const hasExisting = hasExistingSemesterGoal(semester, formData.academicYear);
                        const semesterName = semester === 'FIRST' ? '1st' : semester === 'SECOND' ? '2nd' : '3rd';
                        return hasExisting ? (
                          <div key={semester} className="text-xs text-orange-600 mb-1">
                            • {semesterName} Semester {formData.academicYear} already has a goal
                          </div>
                        ) : (
                          <div key={semester} className="text-xs text-green-600 mb-1">
                            ✓ {semesterName} Semester {formData.academicYear} is available
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Academic Year *
                  </label>
                  <div className="relative">
                    <select
                      name="academicYear"
                      value={formData.academicYear}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent appearance-none cursor-pointer"
                      required
                    >
                      <option value="">Select academic year</option>
                      <option value="2024">2024-2025</option>
                      <option value="2025">2025-2026</option>
                      <option value="2026">2026-2027</option>
                      <option value="2027">2027-2028</option>
                    </select>
                    <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                      <span className="text-gray-400 text-lg">▼</span>
                    </div>
                  </div>
                </div>
              </>
            )}

            {/* Course Selection (for Course Grade goals) */}
            {formData.goalType === 'COURSE_GRADE' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Course *
                </label>
                <select
                  name="courseId"
                  value={formData.courseId}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  required
                >
                  <option value="">Select a course</option>
                  {availableCourses.map(course => (
                    <option key={course.courseId} value={course.courseId}>
                      {course.courseName} ({course.gradingScale})
                    </option>
                  ))}
                </select>
                {availableCourses.length === 0 && (
                  <p className="text-sm text-yellow-600 mt-1">
                    All courses already have goals assigned
                  </p>
                )}
              </div>
            )}

            {/* Target Value */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Target Value *
                {formData.courseId && (
                  <span className="text-gray-500 text-xs ml-1">
                    ({courses.find(c => c.courseId === parseInt(formData.courseId))?.gradingScale || 'percentage'})
                  </span>
                )}
              </label>
              <div className="flex items-center space-x-2">
                <input
                  type="number"
                  name="targetValue"
                  value={formData.targetValue}
                  onChange={handleInputChange}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="Enter target value"
                  step={inputConstraints.step}
                  required
                />
                {conversionDisplay && (
                  <span className="text-sm text-gray-600 whitespace-nowrap">
                    {conversionDisplay}
                  </span>
                )}
              </div>
            </div>

            {/* Priority */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Priority
              </label>
              <select
                name="priority"
                value={formData.priority}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              >
                <option value="LOW">Low</option>
                <option value="MEDIUM">Medium</option>
                <option value="HIGH">High</option>
              </select>
            </div>

            {/* Target Date */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Target Date
              </label>
              <input
                type="date"
                name="targetDate"
                value={formData.targetDate}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Description
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                placeholder="Enter goal description (optional)"
              />
            </div>

            {/* Action Buttons */}
            <div className="flex items-center justify-end space-x-3 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md transition-colors duration-200"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-md transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? 'Saving...' : (editingGoal ? 'Update Goal' : 'Create Goal')}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default GoalModal;
