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
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full max-h-[95vh] overflow-y-auto border border-gray-100">
        {/* Header with gradient background */}
        <div className="bg-gradient-to-r from-purple-600 to-blue-600 px-6 py-4 rounded-t-2xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                <FaFlag className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-white">
                  {editingGoal ? 'Edit Goal' : 'Create New Goal'}
                </h3>
                <p className="text-purple-100 text-sm">
                  {editingGoal ? 'Update your goal details' : 'Set a new academic target'}
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-white/80 hover:text-white hover:bg-white/20 rounded-full p-2 transition-all duration-200"
            >
              <FaTimes className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="p-6">

          {/* Validation Error */}
          {validationError && (
            <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-400 rounded-lg">
              <div className="flex items-start">
                <div className="flex-shrink-0">
                  <FaFlag className="w-5 h-5 text-red-400" />
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-red-800">
                    {validationError}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Goal Title */}
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-gray-800">
                Goal Title *
              </label>
              <input
                type="text"
                name="goalTitle"
                value={formData.goalTitle}
                onChange={handleInputChange}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 bg-gray-50 focus:bg-white"
                placeholder="Enter a descriptive goal title"
                required
              />
            </div>

            {/* Goal Type */}
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-gray-800">
                Goal Type *
              </label>
              <select
                name="goalType"
                value={formData.goalType}
                onChange={handleInputChange}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 bg-gray-50 focus:bg-white appearance-none cursor-pointer"
              >
                <option value="COURSE_GRADE">📚 Course Grade</option>
                <option 
                  value="SEMESTER_GPA"
                  disabled={!editingGoal && areAllSemestersTaken(existingGoals)}
                >
                  🎯 Semester GPA {!editingGoal && areAllSemestersTaken(existingGoals) ? '(All semesters taken)' : ''}
                </option>
                <option 
                  value="CUMMULATIVE_GPA"
                  disabled={!editingGoal && hasExistingCumulativeGoal}
                >
                  🏆 Cumulative GPA {!editingGoal && hasExistingCumulativeGoal ? '(Already exists)' : ''}
                </option>
              </select>
              {/* Help text for disabled options */}
              {!editingGoal && (hasExistingCumulativeGoal || areAllSemestersTaken(existingGoals)) && (
                <div className="mt-3 p-4 bg-blue-50 border-l-4 border-blue-400 rounded-lg">
                  <div className="flex items-start">
                    <div className="flex-shrink-0">
                      <div className="w-5 h-5 bg-blue-100 rounded-full flex items-center justify-center">
                        <span className="text-blue-600 text-xs font-bold">i</span>
                      </div>
                    </div>
                    <div className="ml-3">
                      <p className="text-sm text-blue-800">
                        <span className="font-semibold">Note:</span> Some goal types are disabled because you already have existing goals for them. 
                        You can only have one cumulative GPA goal and one goal per semester per academic year.
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Semester Selection (for Semester GPA goals) */}
            {formData.goalType === 'SEMESTER_GPA' && (
              <div className="bg-gradient-to-r from-purple-50 to-blue-50 p-4 rounded-xl border border-purple-100">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <label className="block text-sm font-semibold text-gray-800">
                      📅 Semester *
                    </label>
                    <select
                      name="semester"
                      value={formData.semester}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 bg-white"
                      required
                    >
                      <option value="">Select semester</option>
                      <option 
                        value="FIRST"
                        disabled={!editingGoal && hasExistingSemesterGoal('FIRST', formData.academicYear)}
                      >
                        🥇 1st Semester {!editingGoal && hasExistingSemesterGoal('FIRST', formData.academicYear) ? '(Already exists)' : ''}
                      </option>
                      <option 
                        value="SECOND"
                        disabled={!editingGoal && hasExistingSemesterGoal('SECOND', formData.academicYear)}
                      >
                        🥈 2nd Semester {!editingGoal && hasExistingSemesterGoal('SECOND', formData.academicYear) ? '(Already exists)' : ''}
                      </option>
                      <option 
                        value="THIRD"
                        disabled={!editingGoal && hasExistingSemesterGoal('THIRD', formData.academicYear)}
                      >
                        🥉 3rd Semester {!editingGoal && hasExistingSemesterGoal('THIRD', formData.academicYear) ? '(Already exists)' : ''}
                      </option>
                    </select>
                    {/* Help text for disabled semester options */}
                    {!editingGoal && formData.academicYear && (
                      <div className="mt-3 space-y-1">
                        {['FIRST', 'SECOND', 'THIRD'].map(semester => {
                          const hasExisting = hasExistingSemesterGoal(semester, formData.academicYear);
                          const semesterName = semester === 'FIRST' ? '1st' : semester === 'SECOND' ? '2nd' : '3rd';
                          return hasExisting ? (
                            <div key={semester} className="flex items-center text-xs text-orange-600">
                              <span className="w-2 h-2 bg-orange-400 rounded-full mr-2"></span>
                              {semesterName} Semester {formData.academicYear} already has a goal
                            </div>
                          ) : (
                            <div key={semester} className="flex items-center text-xs text-green-600">
                              <span className="w-2 h-2 bg-green-400 rounded-full mr-2"></span>
                              ✓ {semesterName} Semester {formData.academicYear} is available
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>

                  <div className="space-y-2">
                    <label className="block text-sm font-semibold text-gray-800">
                      🎓 Academic Year *
                    </label>
                    <div className="relative">
                      <select
                        name="academicYear"
                        value={formData.academicYear}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 pr-10 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 bg-white appearance-none cursor-pointer"
                        required
                      >
                        <option value="">Select academic year</option>
                        <option value="2024">📅 2024-2025</option>
                        <option value="2025">📅 2025-2026</option>
                        <option value="2026">📅 2026-2027</option>
                        <option value="2027">📅 2027-2028</option>
                      </select>
                      <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                        <span className="text-gray-400 text-lg">▼</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Course Selection (for Course Grade goals) */}
            {formData.goalType === 'COURSE_GRADE' && (
              <div className="bg-gradient-to-r from-green-50 to-blue-50 p-4 rounded-xl border border-green-100">
                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-gray-800">
                    📚 Course *
                  </label>
                  <select
                    name="courseId"
                    value={formData.courseId}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 bg-white appearance-none cursor-pointer"
                    required
                  >
                    <option value="">Select a course</option>
                    {availableCourses.map(course => (
                      <option key={course.courseId} value={course.courseId}>
                        📖 {course.courseName} ({course.gradingScale})
                      </option>
                    ))}
                  </select>
                  {availableCourses.length === 0 && (
                    <div className="mt-3 p-3 bg-yellow-50 border-l-4 border-yellow-400 rounded-lg">
                      <p className="text-sm text-yellow-800 font-medium">
                        ⚠️ All courses already have goals assigned
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Target Value */}
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-gray-800">
                🎯 Target Value *
                {formData.courseId && (
                  <span className="text-gray-500 text-xs ml-2 font-normal">
                    ({courses.find(c => c.courseId === parseInt(formData.courseId))?.gradingScale || 'percentage'})
                  </span>
                )}
              </label>
              <div className="flex items-center space-x-3">
                <input
                  type="number"
                  name="targetValue"
                  value={formData.targetValue}
                  onChange={handleInputChange}
                  className="flex-1 px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 bg-gray-50 focus:bg-white"
                  placeholder="Enter target value"
                  step={inputConstraints.step}
                  required
                />
                {conversionDisplay && (
                  <div className="px-3 py-2 bg-purple-100 text-purple-700 rounded-lg text-sm font-medium whitespace-nowrap">
                    {conversionDisplay}
                  </div>
                )}
              </div>
            </div>

            {/* Priority */}
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-gray-800">
                ⚡ Priority
              </label>
              <select
                name="priority"
                value={formData.priority}
                onChange={handleInputChange}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 bg-gray-50 focus:bg-white appearance-none cursor-pointer"
              >
                <option value="LOW">🟢 Low Priority</option>
                <option value="MEDIUM">🟡 Medium Priority</option>
                <option value="HIGH">🔴 High Priority</option>
              </select>
            </div>

            {/* Target Date */}
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-gray-800">
                📅 Target Date
              </label>
              <input
                type="date"
                name="targetDate"
                value={formData.targetDate}
                onChange={handleInputChange}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 bg-gray-50 focus:bg-white"
              />
            </div>

            {/* Description */}
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-gray-800">
                📝 Description
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                rows={3}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 bg-gray-50 focus:bg-white resize-none"
                placeholder="Enter goal description (optional)"
              />
            </div>

            {/* Action Buttons */}
            <div className="flex items-center justify-end space-x-4 pt-6 border-t border-gray-100">
              <button
                type="button"
                onClick={onClose}
                className="px-6 py-3 text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-xl transition-all duration-200 font-medium hover:shadow-md"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white rounded-xl transition-all duration-200 font-semibold disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-lg transform hover:scale-105 disabled:transform-none"
              >
                {isSubmitting ? (
                  <span className="flex items-center">
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Saving...
                  </span>
                ) : (
                  <span className="flex items-center">
                    {editingGoal ? '✏️ Update Goal' : '✨ Create Goal'}
                  </span>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default GoalModal;
