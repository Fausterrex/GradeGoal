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

function GradeEntry({ course, onGradeUpdate, onBack }) {
  const { currentUser } = useAuth();
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
    extraCreditPoints: 0
  });
  const [editingGrade, setEditingGrade] = useState(null);
  const [showEditCourse, setShowEditCourse] = useState(false);

  // Load grades from database
  useEffect(() => {
    if (course && currentUser) {
      loadGrades();
    }
  }, [course, currentUser]);

  // Load grades from database
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
        // This handles the case where the backend might not load the relationship properly
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
          createdAt: grade.createdAt,
          updatedAt: grade.updatedAt
        });
      });
      setGrades(transformedGrades);
    } catch (error) {
      console.error('Failed to load grades:', error);
    }
  };

  // Save new grade
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
        categoryId: newGrade.categoryId
      };

      const savedGrade = await createGrade(gradeData);
      
      // Update local state
      setGrades(prevGrades => {
        const updatedGrades = { ...prevGrades };
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
          createdAt: savedGrade.createdAt,
          updatedAt: savedGrade.updatedAt
        });
        return updatedGrades;
      });
      
      // Call onGradeUpdate if provided
      if (onGradeUpdate) {
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
          createdAt: savedGrade.createdAt,
          updatedAt: savedGrade.updatedAt
        });
        onGradeUpdate(updatedGrades);
      }
      
      // Reset form
      setNewGrade({
        categoryId: '',
        name: '',
        maxScore: '',
        date: new Date().toISOString().split('T')[0],
        assessmentType: '',
        isExtraCredit: false,
        extraCreditPoints: 0
      });
      setShowAddGrade(false);
      setEditingGrade(null);
    } catch (error) {
      console.error('Failed to save grade:', error);
      alert('Failed to save grade. Please try again.');
    }
  };

  // Handle clicking on an assessment card to add score
  const handleAssessmentClick = (grade) => {
    if (grade.score === null || grade.score === undefined) {
      setSelectedGrade(grade);
      setShowScoreInput(true);
    }
  };

  // Add score to an existing assessment
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
      
      setShowScoreInput(false);
      setSelectedGrade(null);
    } catch (error) {
      console.error('Failed to update score:', error);
      alert('Failed to update score. Please try again.');
    }
  };

  // Edit score for an existing assessment
  const handleEditScore = (grade) => {
    setSelectedGrade(grade);
    setShowEditScore(true);
  };

  // Update score for an existing assessment
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
      
      setShowEditScore(false);
      setSelectedGrade(null);
    } catch (error) {
      console.error('Failed to update score:', error);
      alert('Failed to update score. Please try again.');
    }
  };

  // Edit a grade
  const editGrade = (grade, categoryId) => {
    setNewGrade({
      categoryId,
      name: grade.name,
      maxScore: grade.maxScore,
      date: grade.date,
      assessmentType: grade.assessmentType,
      isExtraCredit: grade.isExtraCredit,
      extraCreditPoints: grade.extraCreditPoints
    });
    setEditingGrade(grade);
    setShowAddGrade(true);
  };

  // Delete a grade
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

  // Calculate category average
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

  // Calculate course overall grade
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

  // Calculate total assessments count
  const getTotalAssessments = () => {
    return Object.values(grades).reduce((total, categoryGrades) => {
      return total + categoryGrades.length;
    }, 0);
  };

  // Calculate progress percentage
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

  // Convert target grade to GPA format
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

  // Edit course functions
  const handleEditCourse = () => {
    setShowEditCourse(true);
  };

  const handleCourseUpdated = (updatedCourses) => {
    // Find the updated course
    const updatedCourse = updatedCourses.find(c => c.id === course.id);
    if (updatedCourse && onGradeUpdate) {
      onGradeUpdate(updatedCourse);
    }
    setShowEditCourse(false);
  };

  // Cancel edit/add
  const cancelEdit = () => {
    setNewGrade({
      categoryId: '',
      name: '',
      maxScore: '',
      date: new Date().toISOString().split('T')[0],
      assessmentType: '',
      isExtraCredit: false,
      extraCreditPoints: 0
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
    <div className={`w-full h-full ${colorScheme.light}`}>
      {/* Header Section */}
      <div className={`bg-gradient-to-r ${colorScheme.gradient} text-white shadow-lg`}>
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex justify-between items-start">
            {/* Left Side - Course Info */}
            <div className="flex items-start gap-4">
              <div className="flex items-center gap-4">
                {/* Course Icon */}
                <div className={`w-16 h-16 ${colorScheme.secondary} rounded-full flex items-center justify-center shadow-lg`}>
                  <span className="text-2xl font-bold text-white">
                    {course.name.charAt(0).toUpperCase()}
                  </span>
                </div>
                <div>
                  <p className="text-sm text-white/80 mb-1">{course.code || course.name.substring(0, 8).toUpperCase()}</p>
                  <div className="flex items-center gap-3">
                    <h1 className="text-3xl font-bold text-white">{course.name}</h1>
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 bg-white rounded-full"></div>
                      <span className="text-sm text-white font-medium">Active Course</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Side - Edit Button */}
            <button 
              onClick={handleEditCourse}
              className={`flex items-center gap-2 ${colorScheme.secondary} text-white px-4 py-2 rounded-lg hover:bg-white hover:text-gray-800 transition-all duration-300 shadow-lg`}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
              Edit
            </button>
          </div>

          {/* Performance Indicators Bar */}
          <div className="flex items-center gap-8 mt-8 pb-4">
            <div className="text-center bg-white/20 backdrop-blur-sm rounded-lg p-4 flex-1">
              <p className="text-3xl font-bold text-white">
                {course.gradingScale === 'percentage' ? `${courseGrade.toFixed(1)}%` :
                 course.gradingScale === 'gpa' ? convertPercentageToScale(courseGrade, 'gpa', course.maxPoints, course.gpaScale) :
                 convertPercentageToScale(courseGrade, 'points', course.maxPoints)}
              </p>
              <p className="text-xs text-white/80 uppercase tracking-wide">Current Grade</p>
            </div>
            
            <div className="text-center bg-white/20 backdrop-blur-sm rounded-lg p-4 flex-1">
              <p className="text-3xl font-bold text-white">
                {getTargetGradeDisplay()}
              </p>
              <p className="text-xs text-white/80 uppercase tracking-wide">Target Grade</p>
            </div>
            
            <div className="text-center bg-white/20 backdrop-blur-sm rounded-lg p-4 flex-1">
              <p className="text-3xl font-bold text-white">{progressPercentage}%</p>
              <p className="text-xs text-white/80 uppercase tracking-wide">Progress</p>
            </div>
            
            <div className="text-center bg-white/20 backdrop-blur-sm rounded-lg p-4 flex-1">
              <p className="text-3xl font-bold text-white">{totalAssessments}</p>
              <p className="text-xs text-white/80 uppercase tracking-wide">Assessment</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content - Assessment Categories Grid */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {course.categories && course.categories.length > 0 ? course.categories.map(category => {
            const categoryGrades = grades[category.id] || [];
            const categoryAverage = getCategoryAverage(category.id);
            
            return (
              <div key={category.id} className="bg-white rounded-xl shadow-xl overflow-hidden border border-gray-100 hover:shadow-2xl transition-all duration-300">
                {/* Category Header */}
                <div className={`bg-gradient-to-r ${colorScheme.gradient} px-6 py-4 flex justify-between items-center`}>
                  <h3 className="text-lg font-semibold text-white">{category.name}</h3>
                  <button
                    onClick={() => {
                      setNewGrade(prev => ({ ...prev, categoryId: category.id }));
                      setShowAddGrade(true);
                    }}
                    className="bg-white/20 backdrop-blur-sm text-white px-4 py-2 rounded-lg hover:bg-white hover:text-gray-800 transition-all duration-300 font-medium"
                  >
                    + Add Assessment
                  </button>
                </div>

                {/* Category Content */}
                <div className="p-6">
                  {/* Category Summary */}
                  <div className="flex justify-between items-center mb-4">
                    <span className="text-sm text-gray-600">Weight: {category.weight}%</span>
                    {categoryAverage !== null && (
                      <span className="text-sm text-gray-600">
                        Average: 
                        <span className={`ml-2 font-semibold ${getGradeColor(categoryAverage)}`}>
                          {course.gradingScale === 'percentage' ? `${categoryAverage.toFixed(1)}%` :
                           course.gradingScale === 'gpa' ? convertPercentageToScale(categoryAverage, 'gpa', course.maxPoints, course.gpaScale) :
                           convertPercentageToScale(categoryAverage, 'points', course.maxPoints)}
                        </span>
                      </span>
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
                            className={`p-4 rounded-xl border transition-all duration-300 hover:shadow-md ${
                              hasScore ? `${colorScheme.light} border-${colorScheme.primary.split('-')[1]}-200` : 'bg-gray-50 border-dashed border-gray-300 cursor-pointer hover:bg-gray-100'
                            }`}
                            onClick={() => !hasScore && handleAssessmentClick(grade)}
                          >
                            <div className="flex justify-between items-start">
                              <div className="flex-1">
                                <h4 className="font-semibold text-gray-900">{grade.name}</h4>
                                <div className="flex items-center gap-2 mt-2">
                                  {grade.assessmentType && (
                                    <span className={`${colorScheme.secondary} ${colorScheme.accent} text-xs px-3 py-1 rounded-full font-medium`}>
                                      {grade.assessmentType}
                                    </span>
                                  )}
                                  {grade.isExtraCredit && (
                                    <span className="bg-emerald-100 text-emerald-800 text-xs px-3 py-1 rounded-full font-medium">
                                      Extra Credit
                                    </span>
                                  )}
                                  {!hasScore && (
                                    <span className="bg-blue-100 text-blue-800 text-xs px-3 py-1 rounded-full font-medium">
                                      Pending
                                    </span>
                                  )}
                                </div>
                                <div className="text-sm text-gray-600 mt-2">
                                  {hasScore ? (
                                    <span className={`font-semibold ${getGradeColor(percentage)}`}>
                                      {grade.score}/{grade.maxScore} ({percentage.toFixed(1)}%)
                                      {grade.isExtraCredit && grade.extraCreditPoints > 0 && (
                                        <span className="ml-2 text-green-600 font-medium">
                                          +{grade.extraCreditPoints} EC
                                        </span>
                                      )}
                                    </span>
                                  ) : (
                                    <span className="text-blue-600 font-medium">
                                      Max Score: {grade.maxScore} • Click to add score
                                      {grade.isExtraCredit && grade.extraCreditPoints > 0 && (
                                        <span className="ml-2 text-green-600 font-medium">
                                          +{grade.extraCreditPoints} EC
                                        </span>
                                      )}
                                    </span>
                                  )}
                                  <span className="ml-2">• {grade.date}</span>
                                </div>
                              </div>
                              
                              <div className="flex gap-2 ml-4">
                                {hasScore && (
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleEditScore(grade);
                                    }}
                                    className={`${colorScheme.accent} hover:opacity-80 text-sm font-medium px-3 py-1 rounded-lg transition-all duration-200`}
                                  >
                                    Edit Score
                                  </button>
                                )}
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    editGrade(grade, category.id);
                                  }}
                                  className="text-blue-600 hover:text-blue-800 text-sm font-medium px-3 py-1 rounded-lg transition-all duration-200"
                                >
                                  Edit
                                </button>
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    deleteGrade(grade.id, category.id);
                                  }}
                                  className="text-red-600 hover:text-red-800 text-sm font-medium px-3 py-1 rounded-lg transition-all duration-200"
                                >
                                  Delete
                                </button>
                              </div>
                            </div>
                          </div>
                        );
                      })
                    ) : (
                      // Empty state - show input fields like in the image
                      <div className="space-y-3">
                        {[1, 2, 3].map((index) => (
                          <div key={index} className={`h-12 ${colorScheme.light} rounded-xl border-2 border-dashed ${colorScheme.primary} opacity-30`}></div>
                        ))}
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

      {/* Add/Edit Assessment Modal */}
      {showAddGrade && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-xl font-bold mb-4">
              {editingGrade ? 'Edit Assessment' : 'Add New Assessment'}
            </h3>
            
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
                  <input
                    type="date"
                    value={newGrade.date}
                    onChange={(e) => setNewGrade({...newGrade, date: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-600"
                    required
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    When this assessment should be taken
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
                  onClick={cancelEdit}
                  className="px-4 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
                >
                  {editingGrade ? 'Update Assessment' : 'Add Assessment'}
                </button>
              </div>
            </form>
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
        existingCourses={[]}
      />
    </div>
  );
}

export default GradeEntry;
