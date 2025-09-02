import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { 
  convertGradeToPercentage, 
  convertPercentageToScale, 
  getGradeColor
} from '../utils/gradeCalculations';
import GradeService from '../services/gradeService';
import { 
  getGradesByCourseId, 
  createGrade, 
  updateGrade, 
  deleteGrade as deleteGradeApi 
} from '../backend/api';
import AddCourse from './AddCourse';
import { getCourseColorScheme } from '../utils/courseColors';

/**
 * GradeEntry Component
 * 
 * Displays and manages grades and assessments for a selected course.
 * Handles grade entry, editing, deletion, and course editing functionality.
 * Features a modern dashboard-like interface with performance indicators.
 * 
 * @param {Object} course - The course object to display grades for
 * @param {Function} onGradeUpdate - Callback when grades are updated
 * @param {Function} onBack - Callback to navigate back to previous page
 */
function GradeEntry({ course, onGradeUpdate, onBack }) {
  const { currentUser } = useAuth();
  
  // State for managing grades and UI
  const [grades, setGrades] = useState({});
  const [showAddGrade, setShowAddGrade] = useState(false);
  const [showScoreInput, setShowScoreInput] = useState(false);
  const [showEditScore, setShowEditScore] = useState(false);
  const [selectedGrade, setSelectedGrade] = useState(null);
  const [newGrade, setNewGrade] = useState({
    categoryId: '',
    name: '',
    maxScore: '', // Maximum possible score for this assessment
    date: new Date().toISOString().split('T')[0],
    assessmentType: '',
    isExtraCredit: false,
    extraCreditPoints: 0,
    note: '' // Additional notes for the assessment
  });
  const [editingGrade, setEditingGrade] = useState(null);
  const [showEditCourse, setShowEditCourse] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  /**
   * Load grades from database when component mounts or course changes
   */
  useEffect(() => {
    if (course && currentUser) {
      loadGrades();
    }
  }, [course, currentUser]);

  /**
   * Auto-populate assessment name when assessment type changes
   * Only populates if name is empty to avoid overwriting user input
   */
  useEffect(() => {
    if (newGrade.assessmentType && !newGrade.name) {
      const typeName = newGrade.assessmentType.charAt(0).toUpperCase() + newGrade.assessmentType.slice(1);
      setNewGrade(prev => ({ ...prev, name: typeName }));
    }
  }, [newGrade.assessmentType]);

  /**
   * Load grades from database and transform them to the expected format
   * Handles cases where grades might be orphaned or missing category relationships
   */
  const loadGrades = async () => {
    try {
      const gradesData = await getGradesByCourseId(course.id);
      
      // Transform grades data to match the expected format
      const transformedGrades = {};
      
      // Get the first available category as default for orphaned grades
      const firstCategoryId = course.categories && course.categories.length > 0 ? course.categories[0].id : null;
      
      gradesData.forEach(grade => {
        // Try multiple ways to get the categoryId
        let categoryId = null;
        
        // First, try to get from the category relationship
        if (grade.category && grade.category.id) {
          categoryId = grade.category.id;
        }
        // Second, try to get from the transient categoryId field
        else if (grade.categoryId) {
          categoryId = grade.categoryId;
        }
        // Third, check if we can infer from the database structure
        else if (grade.category_id) {
          categoryId = grade.category_id;
        }
        
        // Only assign to default category if this is truly an orphaned existing grade
        if (!categoryId && firstCategoryId) {
          categoryId = firstCategoryId;
        }
        
        // Safely handle cases where categoryId might be null or undefined
        if (!categoryId) {
          return; // Skip this grade if categoryId is missing and no default category
        }
        
        if (!transformedGrades[categoryId]) {
          transformedGrades[categoryId] = [];
        }
        transformedGrades[categoryId].push({
          id: grade.id,
          categoryId: categoryId,
          name: grade.name,
          maxScore: grade.maxScore,
          score: grade.score,
          date: grade.date,
          assessmentType: grade.assessmentType,
          isExtraCredit: grade.isExtraCredit,
          extraCreditPoints: grade.extraCreditPoints,
          note: grade.note,
          createdAt: grade.createdAt,
          updatedAt: grade.updatedAt
        });
      });
      setGrades(transformedGrades);
    } catch (error) {
      console.error('Failed to load grades:', error);
    }
  };

  /**
   * Save a new grade/assessment to the database
   * @param {Event} e - Form submission event
   */
  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const gradeData = {
        name: newGrade.name,
        maxScore: parseFloat(newGrade.maxScore),
        score: null, // Initially no score
        date: newGrade.date,
        assessmentType: newGrade.assessmentType,
        isExtraCredit: newGrade.isExtraCredit,
        extraCreditPoints: parseFloat(newGrade.extraCreditPoints) || 0,
        note: newGrade.note,
        categoryId: newGrade.categoryId
      };
      
      // Debug: Log what we're sending
      console.log('Creating grade with data:', gradeData);
      console.log('Note field value:', newGrade.note);
      console.log('Note field type:', typeof newGrade.note);

      const savedGrade = await createGrade(gradeData);
      
      // Debug: Log what we got back
      console.log('API response:', savedGrade);
      console.log('Saved grade note:', savedGrade.note);
      
      // Create the updated grades structure
          const updatedGrades = { ...grades };
          if (!updatedGrades[newGrade.categoryId]) {
            updatedGrades[newGrade.categoryId] = [];
          }
      updatedGrades[newGrade.categoryId].push({
        id: savedGrade.id,
        categoryId: newGrade.categoryId,
        name: savedGrade.name,
        maxScore: savedGrade.maxScore,
        score: savedGrade.score,
        date: savedGrade.date,
        assessmentType: savedGrade.assessmentType,
        isExtraCredit: savedGrade.isExtraCredit,
        extraCreditPoints: savedGrade.extraCreditPoints,
        note: savedGrade.note,
        createdAt: savedGrade.createdAt,
        updatedAt: savedGrade.updatedAt
      });
      
      // Update local state
      setGrades(updatedGrades);
      
      // Call onGradeUpdate with the same updated grades
      if (onGradeUpdate) {
          onGradeUpdate(updatedGrades);
      }
      
      // Show success message
      setSuccessMessage('Assessment added successfully!');
      
      // Clear success message after 3 seconds
      setTimeout(() => {
        setSuccessMessage('');
      }, 3000);
      
      // Reset form
      setNewGrade({
        categoryId: '',
        name: '',
        maxScore: '',
        date: new Date().toISOString().split('T')[0],
        assessmentType: '',
        isExtraCredit: false,
        extraCreditPoints: 0,
        note: ''
      });
      setShowAddGrade(false);
      setEditingGrade(null);
    } catch (error) {
      console.error('Failed to save grade:', error);
      alert('Failed to save grade. Please try again.');
    }
  };

  /**
   * Handle clicking on an assessment card to add score
   * Only allows adding scores to assessments without existing scores
   * @param {Object} grade - The grade object that was clicked
   */
  const handleAssessmentClick = (grade) => {
    if (grade.score === null || grade.score === undefined) {
      setSelectedGrade(grade);
      setShowScoreInput(true);
    }
  };

  /**
   * Add score to an existing assessment
   * @param {Event} e - Form submission event
   */
  const handleScoreSubmit = async (e) => {
    e.preventDefault();
    const score = parseFloat(e.target.score.value);
    
    if (isNaN(score) || score < 0) {
      alert('Please enter a valid score');
      return;
    }

    if (score > selectedGrade.maxScore) {
      alert('Score cannot exceed maximum score');
      return;
    }

    try {
      // Update the grade with the score and extra credit data
      const gradeData = {
        name: selectedGrade.name,
        maxScore: selectedGrade.maxScore,
        score: score,
        date: selectedGrade.date,
        assessmentType: selectedGrade.assessmentType,
        isExtraCredit: selectedGrade.isExtraCredit || false,
        extraCreditPoints: selectedGrade.extraCreditPoints || 0,
        note: selectedGrade.note || '',
        categoryId: selectedGrade.categoryId // Use categoryId directly instead of nested object
      };

      await updateGrade(selectedGrade.id, gradeData);

      // Update local state instead of reloading
      setGrades(prevGrades => {
        const updatedGrades = { ...prevGrades };
        const categoryId = selectedGrade.categoryId;
        
        if (updatedGrades[categoryId]) {
          const gradeIndex = updatedGrades[categoryId].findIndex(g => g.id === selectedGrade.id);
          if (gradeIndex !== -1) {
            updatedGrades[categoryId][gradeIndex] = {
              ...updatedGrades[categoryId][gradeIndex],
              score: score,
              updatedAt: new Date().toISOString()
            };
          }
        }
        
        return updatedGrades;
      });
      
      // Call onGradeUpdate if provided
      if (onGradeUpdate) {
        const updatedGrades = { ...grades };
        const categoryId = selectedGrade.categoryId;
        
        if (updatedGrades[categoryId]) {
          const gradeIndex = updatedGrades[categoryId].findIndex(g => g.id === selectedGrade.id);
          if (gradeIndex !== -1) {
            updatedGrades[categoryId][gradeIndex] = {
              ...updatedGrades[categoryId][gradeIndex],
              score: score,
              updatedAt: new Date().toISOString()
            };
          }
        }
        
        onGradeUpdate(updatedGrades);
      }
      
      // Show success message
      setSuccessMessage('Score added successfully!');
      
      // Clear success message after 3 seconds
      setTimeout(() => {
        setSuccessMessage('');
      }, 3000);
      
      setShowScoreInput(false);
      setSelectedGrade(null);
    } catch (error) {
      console.error('Failed to update score:', error);
      alert('Failed to update score. Please try again.');
    }
  };

  /**
   * Opens the edit score modal for an existing assessment
   * @param {Object} grade - The grade object to edit
   */
  const handleEditScore = (grade) => {
    setSelectedGrade(grade);
    setShowEditScore(true);
  };

  /**
   * Updates the score for an existing assessment
   * @param {Event} e - Form submission event
   */
  const handleEditScoreSubmit = async (e) => {
    e.preventDefault();
    const score = parseFloat(e.target.editScore.value);
    
    if (isNaN(score) || score < 0) {
      alert('Please enter a valid score');
      return;
    }

    if (score > selectedGrade.maxScore) {
      alert('Score cannot exceed maximum score');
      return;
    }

    try {
      // Update the grade with the new score and extra credit data
      const gradeData = {
        name: selectedGrade.name,
        maxScore: selectedGrade.maxScore,
        score: score,
        date: selectedGrade.date,
        assessmentType: selectedGrade.assessmentType,
        isExtraCredit: selectedGrade.isExtraCredit || false,
        extraCreditPoints: selectedGrade.extraCreditPoints || 0,
        note: selectedGrade.note || '',
        categoryId: selectedGrade.categoryId
      };

      await updateGrade(selectedGrade.id, gradeData);

      // Update local state instead of reloading
      setGrades(prevGrades => {
        const updatedGrades = { ...prevGrades };
        const categoryId = selectedGrade.categoryId;
        
        if (updatedGrades[categoryId]) {
          const gradeIndex = updatedGrades[categoryId].findIndex(g => g.id === selectedGrade.id);
          if (gradeIndex !== -1) {
            updatedGrades[categoryId][gradeIndex] = {
              ...updatedGrades[categoryId][gradeIndex],
              score: score,
              updatedAt: new Date().toISOString()
            };
          }
        }
        
        return updatedGrades;
      });
      
      // Call onGradeUpdate if provided
      if (onGradeUpdate) {
        const updatedGrades = { ...grades };
        const categoryId = selectedGrade.categoryId;
        
        if (updatedGrades[categoryId]) {
          const gradeIndex = updatedGrades[categoryId].findIndex(g => g.id === selectedGrade.id);
          if (gradeIndex !== -1) {
            updatedGrades[categoryId][gradeIndex] = {
              ...updatedGrades[categoryId][gradeIndex],
              score: score,
              updatedAt: new Date().toISOString()
            };
          }
        }
        
        onGradeUpdate(updatedGrades);
      }
      
      // Show success message
      setSuccessMessage('Score updated successfully!');
      
      // Clear success message after 3 seconds
      setTimeout(() => {
        setSuccessMessage('');
      }, 3000);
      
      setShowEditScore(false);
      setSelectedGrade(null);
    } catch (error) {
      console.error('Failed to update score:', error);
      alert('Failed to update score. Please try again.');
    }
  };

  /**
   * Opens the edit assessment modal for an existing grade
   * @param {Object} grade - The grade object to edit
   * @param {number} categoryId - The ID of the category containing the grade
   */
  const editGrade = (grade, categoryId) => {
    setNewGrade({
      categoryId,
      name: grade.name,
      maxScore: grade.maxScore,
      date: grade.date,
      assessmentType: grade.assessmentType,
      isExtraCredit: grade.isExtraCredit,
      extraCreditPoints: grade.extraCreditPoints,
      note: grade.note || ''
    });
    setEditingGrade(grade);
    setShowAddGrade(true);
  };

  /**
   * Deletes an assessment/grade after user confirmation
   * @param {number} gradeId - The ID of the grade to delete
   * @param {number} categoryId - The ID of the category containing the grade
   */
  const deleteGrade = async (gradeId, categoryId) => {
    if (window.confirm('Are you sure you want to delete this assessment?')) {
      try {
        await deleteGradeApi(gradeId);
        
        // Update local state instead of reloading
        setGrades(prevGrades => {
          const updatedGrades = { ...prevGrades };
          if (updatedGrades[categoryId]) {
            updatedGrades[categoryId] = updatedGrades[categoryId].filter(g => g.id !== gradeId);
          }
          return updatedGrades;
        });
        
        // Show success message
        setSuccessMessage('Assessment deleted successfully!');
        
        // Clear success message after 3 seconds
        setTimeout(() => {
          setSuccessMessage('');
        }, 3000);
        
        // Call onGradeUpdate if provided
        if (onGradeUpdate) {
          const updatedGrades = { ...grades };
          if (updatedGrades[categoryId]) {
            updatedGrades[categoryId] = updatedGrades[categoryId].filter(g => g.id !== gradeId);
          }
          onGradeUpdate(updatedGrades);
        }
      } catch (error) {
        console.error('Failed to delete grade:', error);
        alert('Failed to delete assessment. Please try again.');
      }
    }
  };

  /**
   * Calculates the average grade for a specific category
   * @param {number} categoryId - The ID of the category to calculate average for
   * @returns {number|null} The average grade or null if calculation fails
   */
  const getCategoryAverage = (categoryId) => {
    // Check if course has categories before calculating
    if (!course.categories || course.categories.length === 0) {
      return null;
    }
    
    const categoryGrades = grades[categoryId] || [];
    if (categoryGrades.length === 0) return null;
    
    try {
    const result = GradeService.calculateCourseGrade(course, grades);
    if (result.success) {
      const category = result.categoryAverages.find(cat => cat.categoryId === categoryId);
      return category ? category.average : null;
    }
    return null;
    } catch (error) {
      console.error('Error calculating category average:', error);
      return null;
    }
  };

  /**
   * Calculates the overall course grade using GradeService
   * @returns {number} The calculated course grade or 0 if calculation fails
   */
  const getCourseGrade = () => {
    // Check if course has categories before calculating grade
    if (!course.categories || course.categories.length === 0) {
      return 0;
    }
    
    try {
    const result = GradeService.calculateCourseImpact(course, grades);
    return result.success ? result.courseGrade : 0;
    } catch (error) {
      console.error('Error calculating course grade:', error);
      return 0;
    }
  };

  /**
   * Calculates the total number of assessments across all categories
   * @returns {number} Total count of assessments
   */
  const getTotalAssessments = () => {
    return Object.values(grades).reduce((total, categoryGrades) => {
      return total + categoryGrades.length;
    }, 0);
  };

  /**
   * Calculates the progress percentage based on categories with completed assessments
   * @returns {number} Progress percentage (0-100)
   */
  const getProgressPercentage = () => {
    if (!course.categories || course.categories.length === 0) return 0;
    
    // Calculate progress based on categories with actual scores
    const completedCategories = course.categories.filter(category => {
      const categoryGrades = grades[category.id] || [];
      return categoryGrades.some(grade => 
        grade.score !== undefined && 
        grade.score !== null && 
        grade.score !== '' && 
        !isNaN(parseFloat(grade.score))
      );
    }).length;
    
    return Math.round((completedCategories / course.categories.length) * 100);
  };

  /**
   * Converts target grade to GPA format for display
   * Handles percentage, GPA, and other grade formats
   * @returns {string} The target grade in GPA format or original value
   */
  const getTargetGradeDisplay = () => {
    if (!course.targetGrade) return 'Not Set';
    
    const targetGrade = course.targetGrade.toString().trim();
    
    // If it's already in GPA format (e.g., "3.5", "4.0"), return as is
    if (/^\d+\.\d+$/.test(targetGrade) && parseFloat(targetGrade) <= 5.0) {
      return targetGrade;
    }
    
    // If it's a percentage (e.g., "90%", "85"), convert to GPA
    if (targetGrade.includes('%') || parseFloat(targetGrade) > 5.0) {
      const percentage = parseFloat(targetGrade.replace('%', ''));
      if (!isNaN(percentage)) {
        // Convert percentage to GPA (90% = 3.6, 85% = 3.4, etc.)
        if (percentage >= 97) return '4.0';
        if (percentage >= 93) return '3.7';
        if (percentage >= 90) return '3.3';
        if (percentage >= 87) return '3.0';
        if (percentage >= 83) return '2.7';
        if (percentage >= 80) return '2.3';
        if (percentage >= 77) return '2.0';
        if (percentage >= 73) return '1.7';
        if (percentage >= 70) return '1.3';
        if (percentage >= 67) return '1.0';
        if (percentage >= 65) return '0.7';
        return '0.0';
      }
    }
    
    // If we can't convert it, return the original value
    return targetGrade;
  };



  /**
   * Handles course updates from the edit course modal
   * @param {Array} updatedCourses - Array of updated courses
   */
  const handleCourseUpdated = (updatedCourses) => {
    // Find the updated course
    const updatedCourse = updatedCourses.find(c => c.id === course.id);
    if (updatedCourse) {
      // Also notify parent component if callback exists
      if (onGradeUpdate) {
        onGradeUpdate(updatedCourse);
      }
    }
    setShowEditCourse(false);
  };

  /**
   * Cancels the current grade edit/add operation and resets the form
   */
  const cancelGradeEdit = () => {
    setNewGrade({
      categoryId: '',
      name: '',
      maxScore: '',
      date: new Date().toISOString().split('T')[0],
      assessmentType: '',
      isExtraCredit: false,
      extraCreditPoints: 0,
      note: ''
    });
    setShowAddGrade(false);
    setEditingGrade(null);
  };

  if (!course) return <div>No course selected</div>;

  const courseGrade = getCourseGrade();
  const totalAssessments = getTotalAssessments();
  const progressPercentage = getProgressPercentage();
  const colorScheme = getCourseColorScheme(course.name, course.colorIndex || 0);

  return (
    <div className={`w-full h-full ${colorScheme.light} flex flex-col overflow-y-auto`}>
      {/* Header Section - Fixed */}
      <div className={`bg-gradient-to-br ${colorScheme.gradient} text-white shadow-2xl ${course.isArchived ? 'border-l-4 border-yellow-400' : ''} flex-shrink-0`}>
        <div className="w-full px-8 py-8">
          {/* Top Row - Navigation and Actions */}
          <div className="flex justify-between items-center mb-8">
            <button
              onClick={onBack}
              className="flex items-center gap-3 bg-white/10 backdrop-blur-sm text-white px-6 py-3 rounded-full hover:bg-white/20 transition-all duration-300 border border-white/20"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              <span className="font-medium">Back to Courses</span>
            </button>
            
            <button 
              onClick={() => setShowEditCourse(true)}
              className={`flex items-center gap-3 ${course.isArchived ? 'bg-gray-400 cursor-not-allowed' : 'bg-white/10 backdrop-blur-sm hover:bg-white/20'} text-white px-6 py-3 rounded-full transition-all duration-300 border border-white/20 ${course.isArchived ? 'hover:bg-gray-400' : ''}`}
              disabled={course.isArchived}
              title={course.isArchived ? 'Archived courses cannot be edited' : 'Edit course settings'}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
              <span className="font-medium">{course.isArchived ? 'View' : 'Edit'}</span>
            </button>
          </div>
          
          {/* Course Info - Centered */}
          <div className="text-center mb-10">
            <div className="inline-flex items-center gap-3 mb-4">
              <span className="text-lg text-white/70 font-medium">{course.courseCode || course.name.substring(0, 8).toUpperCase()}</span>
              <span className={`px-4 py-2 rounded-full text-sm font-semibold ${
                course.isArchived 
                  ? 'bg-yellow-500/20 text-yellow-200 border border-yellow-400/30' 
                  : 'bg-green-500/20 text-green-200 border border-green-400/30'
              }`}>
                {course.isArchived ? 'Archived Course' : 'Active Course'}
              </span>
            </div>
            <h1 className="text-5xl font-bold text-white mb-2">{course.name}</h1>
            {course.isArchived && (
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-yellow-500/20 border border-yellow-400/30 rounded-full">
                <svg className="w-4 h-4 text-yellow-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
                <span className="text-sm text-yellow-200 font-medium">Course Archived</span>
              </div>
            )}
          </div>

          {/* Performance Indicators - Modern Cards */}
          <div className={`max-w-5xl mx-auto grid grid-cols-2 lg:grid-cols-4 gap-6 ${course.isArchived ? 'opacity-75' : ''}`}>
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20 hover:bg-white/20 transition-all duration-300">
              <div className="text-center">
                <p className="text-4xl font-bold text-white mb-2">
                {course.gradingScale === 'percentage' ? `${courseGrade.toFixed(1)}%` :
                 course.gradingScale === 'gpa' ? convertPercentageToScale(courseGrade, 'gpa', course.maxPoints, course.gpaScale) :
                 convertPercentageToScale(courseGrade, 'points', course.maxPoints)}
            </p>
                <p className="text-sm text-white/80 font-medium uppercase tracking-wider">Current Grade</p>
          </div>
        </div>
            
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20 hover:bg-white/20 transition-all duration-300">
              <div className="text-center">
                <p className="text-4xl font-bold text-white mb-2">{getTargetGradeDisplay()}</p>
                <p className="text-sm text-white/80 font-medium uppercase tracking-wider">Target Grade</p>
              </div>
      </div>

            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20 hover:bg-white/20 transition-all duration-300">
              <div className="text-center">
                <p className="text-4xl font-bold text-white mb-2">{progressPercentage}%</p>
                <p className="text-sm text-white/80 font-medium uppercase tracking-wider">Progress</p>
              </div>
            </div>
            
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20 hover:bg-white/20 transition-all duration-300">
              <div className="text-center">
                <p className="text-4xl font-bold text-white mb-2">{totalAssessments}</p>
                <p className="text-sm text-white/80 font-medium uppercase tracking-wider">Assessments</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Success Message */}
      {successMessage && (
        <div className="max-w-xl mx-auto px-6 py-4">
          <div className="w-full p-4 bg-green-100 border border-green-400 text-green-700 rounded-lg shadow-sm">
            <div className="flex items-center gap-2">
              <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              {successMessage}
            </div>
          </div>
        </div>
      )}

      {/* Main Content - Assessment Categories Grid */}
      <div className={`w-full px-8 py-12 ${course.isArchived ? 'opacity-90' : ''} flex-1`}>
        {course.isArchived && (
          <div className="max-w-[1000px] mx-auto mb-8 p-6 bg-yellow-50 border border-yellow-200 rounded-2xl shadow-lg">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center">
                <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                </svg>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-yellow-800">Course Archived</h3>
                <p className="text-yellow-700">This course is archived and may not be actively updated.</p>
              </div>
            </div>
          </div>
        )}
        
        <div className="max-w-[1600px] mx-auto">
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
          {course.categories && course.categories.length > 0 ? course.categories.map(category => {
          const categoryGrades = grades[category.id] || [];
          const categoryAverage = getCategoryAverage(category.id);
          
          return (
              <div key={category.id} className="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100 hover:shadow-2xl transition-all duration-300">
                {/* Category Header */}
                <div className={`bg-gradient-to-r ${colorScheme.gradient} px-6 py-5 flex justify-between items-center`}>
                  <div className="flex items-center gap-3">
                    <h3 className="text-xl font-bold text-white">{category.name}</h3>
                    <span className="text-white/80 text-sm font-medium">Weight: {category.weight}%</span>
                </div>
                <button
                  onClick={() => {
                    setNewGrade(prev => ({ ...prev, categoryId: category.id }));
                    setShowAddGrade(true);
                  }}
                    className="bg-white/20 backdrop-blur-sm text-white px-5 py-2.5 rounded-xl hover:bg-white hover:text-gray-800 transition-all duration-300 font-medium border border-white/30"
                >
                  + Add Assessment
                </button>
              </div>

                {/* Category Content */}
                <div className="p-6">
                  {/* Category Summary */}
                  <div className="flex justify-between items-center mb-6 p-4 bg-gray-50 rounded-xl">
                    {categoryAverage !== null ? (
                      <div className="text-right">
                        <span className="text-sm text-gray-600">Average: </span>
                        <span className={`ml-2 text-lg font-bold ${getGradeColor(categoryAverage)}`}>
                          {course.gradingScale === 'percentage' ? `${categoryAverage.toFixed(1)}%` :
                           course.gradingScale === 'gpa' ? convertPercentageToScale(categoryAverage, 'gpa', course.maxPoints, course.gpaScale) :
                           convertPercentageToScale(categoryAverage, 'points', course.maxPoints)}
                        </span>
                      </div>
                    ) : (
                      <span className="text-sm text-gray-500">No assessments yet</span>
                    )}
                  </div>

                  {/* Assessment List */}
                  <div className="space-y-3">
              {categoryGrades.length > 0 ? (
                      categoryGrades.map(grade => {
                    const hasScore = grade.score !== null && grade.score !== undefined;
                    const percentage = hasScore ? (grade.score / grade.maxScore) * 100 : null;
                    
                    return (
                      <div 
                        key={grade.id} 
                            className={`p-5 rounded-2xl border transition-all duration-300 hover:shadow-lg ${
                              hasScore 
                                ? 'bg-gradient-to-r from-green-50 to-emerald-50 border-green-200 shadow-sm' 
                                : 'bg-gradient-to-r from-gray-50 to-slate-50 border-gray-200 shadow-sm hover:shadow-md'
                        }`}
                        onClick={() => !hasScore && handleAssessmentClick(grade)}
                      >
                            <div className="flex items-center gap-4">
                              {/* Left Icon */}
                              <div className={`w-14 h-14 ${hasScore ? 'bg-green-500' : 'bg-blue-500'} rounded-2xl flex items-center justify-center shadow-lg flex-shrink-0`}>
                                <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                </svg>
                              </div>
                              
                              {/* Center Content */}
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-3 mb-2">
                                  <h4 className="text-lg font-bold text-gray-900 truncate">{grade.name}</h4>
                                  <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                                    hasScore 
                                      ? 'bg-green-100 text-green-800 border border-green-200' 
                                      : 'bg-yellow-100 text-yellow-800 border border-yellow-200'
                                  }`}>
                                    {hasScore ? 'COMPLETED' : 'PENDING'}
                              </span>
                          </div>
                                <div className="flex items-center gap-4 mb-3">
                                  <div className="text-sm text-gray-600">
                            {hasScore ? (
                                      <span className={`font-bold text-lg ${getGradeColor(percentage)}`}>
                                {grade.score}/{grade.maxScore} ({percentage.toFixed(1)}%)
                                {grade.isExtraCredit && grade.extraCreditPoints > 0 && (
                                  <span className="ml-2 text-green-600 font-medium">
                                            +{grade.extraCreditPoints}
                                  </span>
                                )}
                              </span>
                            ) : (
                                      <span className="font-medium">
                                        Max Score: <span className="text-gray-800">{grade.maxScore}</span>
                                {grade.isExtraCredit && grade.extraCreditPoints > 0 && (
                                  <span className="ml-2 text-green-600 font-medium">
                                            +{grade.extraCreditPoints}
                                  </span>
                                )}
                              </span>
                            )}
                          </div>
                                  
                                  <div className="flex items-center gap-2 text-gray-500">
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                    </svg>
                                    <span className="text-sm font-medium">{grade.date}</span>
                        </div>
                                </div>
                                
                                {/* Note Display */}
                                {grade.note && grade.note.trim() !== '' && (
                                  <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded-xl">
                                    <div className="flex items-center gap-2 mb-1">
                                      <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                      </svg>
                                      <span className="text-sm text-blue-800 font-semibold">Note</span>
                                    </div>
                                    <p className="text-sm text-blue-700 leading-relaxed">{grade.note}</p>
                                  </div>
                                )}
                              </div>
                              
                            </div>
                            
                            {/* Bottom Right Action Buttons */}
                            <div className="flex gap-2 mt-4 justify-end">
                              {!hasScore ? (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                    handleAssessmentClick(grade);
                                  }}
                                  className="bg-green-600 text-white px-5 py-2.5 rounded-xl hover:bg-green-700 transition-all duration-200 font-semibold text-sm shadow-lg hover:shadow-xl"
                                >
                                  Add Score
                                </button>
                              ) : (
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setSelectedGrade(grade);
                                    setShowEditScore(true);
                                  }}
                                  className="bg-blue-600 text-white px-5 py-2.5 rounded-xl hover:bg-blue-700 transition-all duration-200 font-semibold text-sm shadow-lg hover:shadow-xl"
                            >
                              Edit Score
                            </button>
                          )}
                              
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                                  setEditingGrade(grade);
                                  setNewGrade({
                                    ...grade,
                                    categoryId: grade.categoryId,
                                    date: grade.date,
                                    note: grade.note || ''
                                  });
                                  setShowAddGrade(true);
                                }}
                                className="bg-gray-600 text-white px-5 py-2.5 rounded-xl hover:bg-gray-700 transition-all duration-200 font-semibold text-sm shadow-lg hover:shadow-xl"
                          >
                            Edit
                          </button>
                              
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                                  if (window.confirm('Are you sure you want to delete this assessment?')) {
                                    handleDeleteGrade(grade.id);
                                  }
                            }}
                                className="bg-red-600 text-white px-5 py-2.5 rounded-xl hover:bg-red-700 transition-all duration-200 font-semibold text-sm shadow-lg hover:shadow-xl"
                          >
                            Delete
                          </button>
                        </div>
                      </div>
                    );
                      })
                    ) : (
                      <div className="text-center py-12 text-gray-500">
                        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                          <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                          </svg>
                        </div>
                        <h3 className="text-lg font-semibold text-gray-700 mb-2">No Assessments Yet</h3>
                        <p className="text-gray-500 mb-1">This category is empty.</p>
                        <p className="text-sm text-gray-400">Click the button above to add your first assessment!</p>
                      </div>
                    )}
                  </div>
                </div>
            </div>
          );
          }) : (
            <div className="col-span-2 text-center py-12">
              <div className="text-gray-500">
                <svg className="w-16 h-16 mx-auto mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
                <h3 className="text-lg font-medium text-gray-900 mb-2">No Categories Found</h3>
                <p className="text-gray-500">This course doesn't have any assessment categories yet.</p>
              </div>
            </div>
          )}
        </div>
      </div>
      </div>

      {/* Add/Edit Assessment Modal */}
      {showAddGrade && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white/95 backdrop-blur-md rounded-lg shadow-xl w-full max-w-lg overflow-hidden border border-white/20">
            {/* Course Color Header */}
            <div className={`${colorScheme.primary} px-6 py-4`}>
              <h3 className="text-xl font-bold text-white text-center">
              {editingGrade ? 'Edit Assessment' : 'Add New Assessment'}
            </h3>
            </div>
            
            {/* White Form Body */}
            <div className="p-6">
            <form onSubmit={handleSubmit}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Category
                  </label>
                  <select
                    value={newGrade.categoryId}
                    onChange={(e) => setNewGrade({...newGrade, categoryId: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-600"
                    required
                  >
                    <option value="">Select Category</option>
                      {course.categories && course.categories.map(cat => (
                      <option key={cat.id} value={cat.id}>{cat.name}</option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Assessment Type
                  </label>
                  <select
                    value={newGrade.assessmentType}
                    onChange={(e) => setNewGrade({...newGrade, assessmentType: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-600"
                    required
                  >
                    <option value="">Select Type</option>
                    <option value="assignment">Assignment</option>
                    <option value="quiz">Quiz</option>
                    <option value="exam">Exam</option>
                    <option value="project">Project</option>
                    <option value="participation">Participation</option>
                    <option value="other">Other</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Assessment Name
                  </label>
                  <input
                    type="text"
                    value={newGrade.name}
                    onChange={(e) => setNewGrade({...newGrade, name: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-600"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Maximum Score
                  </label>
                  <input
                    type="number"
                    value={newGrade.maxScore}
                    onChange={(e) => setNewGrade({...newGrade, maxScore: parseFloat(e.target.value) || ''})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-600"
                    step="0.01"
                    min="0.01"
                    required
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Enter the maximum possible score for this assessment
                  </p>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Date
                  </label>
                                        <div>
                  <input
                    type="date"
                    value={newGrade.date}
                    onChange={(e) => setNewGrade({...newGrade, date: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-600"
                    required
                  />
                    </div>
                  <p className="text-xs text-gray-500 mt-1">
                    When this assessment should be taken
                  </p>
                </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Note
                    </label>
                    <textarea
                      value={newGrade.note}
                      onChange={(e) => setNewGrade({...newGrade, note: e.target.value})}
                      placeholder="Add any additional notes about this assessment..."
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-600"
                      rows="3"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Optional notes or instructions for this assessment
                    </p>
                  </div>

                                 <div className="flex items-center">
                   <input
                     type="checkbox"
                     id="isExtraCredit"
                     checked={newGrade.isExtraCredit}
                     onChange={(e) => setNewGrade({...newGrade, isExtraCredit: e.target.checked})}
                      className="mr-2 h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
                   />
                   <label htmlFor="isExtraCredit" className="text-sm text-gray-700">
                     Extra Credit
                   </label>
                 </div>
                 <p className="text-xs text-gray-500 -mt-2 mb-2">
                   Check this if this assessment provides extra credit points
                 </p>

                {newGrade.isExtraCredit && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Extra Credit Points
                    </label>
                    <input
                      type="number"
                      value={newGrade.extraCreditPoints}
                      onChange={(e) => setNewGrade({...newGrade, extraCreditPoints: parseFloat(e.target.value) || 0})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-600"
                      step="0.01"
                      min="0"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Enter the number of points to add to the total score
                    </p>
                  </div>
                )}
              </div>

              <div className="flex justify-end gap-2 mt-6">
                <button
                  type="button"
                    onClick={cancelGradeEdit}
                    className="px-4 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50 bg-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                    className={`px-4 py-2 ${colorScheme.primary} text-white rounded-md hover:opacity-90 transition-all duration-200`}
                >
                  {editingGrade ? 'Update Assessment' : 'Add Assessment'}
                </button>
              </div>
            </form>
            </div>
          </div>
        </div>
      )}

      {/* Score Input Modal */}
      {showScoreInput && selectedGrade && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-xl font-bold mb-4">Add Your Score</h3>
            <p className="text-gray-600 mb-4">
              <strong>{selectedGrade.name}</strong><br/>
              Maximum Score: {selectedGrade.maxScore}
            </p>
            
            <form onSubmit={handleScoreSubmit}>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Score Obtained
                </label>
                <input
                  type="number"
                  name="score"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-600"
                  step="0.01"
                  min="0"
                  max={selectedGrade.maxScore}
                  required
                />
              </div>

              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setShowScoreInput(false);
                    setSelectedGrade(null);
                  }}
                  className="px-4 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
                >
                  Save Score
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Score Modal */}
      {showEditScore && selectedGrade && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-xl font-bold mb-4">Edit Score</h3>
            <p className="text-gray-600 mb-4">
              <strong>{selectedGrade.name}</strong><br/>
              Maximum Score: {selectedGrade.maxScore}
            </p>
            
            <form onSubmit={handleEditScoreSubmit}>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Score Obtained
                </label>
                <input
                  type="number"
                  name="editScore"
                  defaultValue={selectedGrade.score}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-600"
                  step="0.01"
                  min="0"
                  max={selectedGrade.maxScore}
                  required
                />
              </div>

              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setShowEditScore(false);
                    setSelectedGrade(null);
                  }}
                  className="px-4 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
                >
                  Update Score
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Course Modal */}
      <AddCourse
        isOpen={showEditCourse}
        onClose={() => setShowEditCourse(false)}
        onCourseCreated={handleCourseUpdated}
        editingCourse={course}
        existingCourses={[course]} // Pass current course so data merging works properly
      />
    </div>
  );
}

export default GradeEntry;
