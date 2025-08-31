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

  // Save grades to database
  const saveGrades = async (updatedGrades) => {
    setGrades(updatedGrades);
    if (onGradeUpdate) onGradeUpdate(updatedGrades);
  };

  // Add or update a grade (first step - without score)
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!newGrade.categoryId || !newGrade.name || newGrade.maxScore === '') {
      alert('Please fill in all required fields');
      return;
    }

    try {
      const gradeData = {
        name: newGrade.name,
        maxScore: newGrade.maxScore,
        score: null, // No score yet
        date: newGrade.date,
        assessmentType: newGrade.assessmentType,
        isExtraCredit: newGrade.isExtraCredit,
        extraCreditPoints: newGrade.extraCreditPoints,
        categoryId: newGrade.categoryId // Send categoryId directly instead of nested object
      };

      if (editingGrade) {
        // Update existing grade
        await updateGrade(editingGrade.id, gradeData);
      } else {
        // Create new grade
        const createdGrade = await createGrade(gradeData);
        
        // Add the new grade to local state instead of reloading
        const newGradeWithId = {
          id: createdGrade.id,
          categoryId: newGrade.categoryId,
          name: newGrade.name,
          maxScore: newGrade.maxScore,
          score: null,
          date: newGrade.date,
          assessmentType: newGrade.assessmentType,
          isExtraCredit: newGrade.isExtraCredit,
          extraCreditPoints: newGrade.extraCreditPoints,
          createdAt: createdGrade.createdAt,
          updatedAt: createdGrade.updatedAt
        };
        
        setGrades(prevGrades => {
          const updatedGrades = { ...prevGrades };
          if (!updatedGrades[newGrade.categoryId]) {
            updatedGrades[newGrade.categoryId] = [];
          }
          
          // Check if grade with this ID already exists to prevent duplicates
          const existingGradeIndex = updatedGrades[newGrade.categoryId].findIndex(g => g.id === createdGrade.id);
          if (existingGradeIndex === -1) {
            updatedGrades[newGrade.categoryId].push(newGradeWithId);
          }
          
          return updatedGrades;
        });
        
        // Call onGradeUpdate after state update to avoid setState violation
        if (onGradeUpdate) {
          // Get the updated grades structure for the callback
          const updatedGrades = { ...grades };
          if (!updatedGrades[newGrade.categoryId]) {
            updatedGrades[newGrade.categoryId] = [];
          }
          
          // Check if grade with this ID already exists to prevent duplicates
          const existingGradeIndex = updatedGrades[newGrade.categoryId].findIndex(g => g.id === createdGrade.id);
          if (existingGradeIndex === -1) {
            updatedGrades[newGrade.categoryId].push(newGradeWithId);
          }
          
          // Call the callback with the updated structure
          onGradeUpdate(updatedGrades);
        }
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
    const categoryGrades = grades[categoryId] || [];
    if (categoryGrades.length === 0) return null;
    
    const result = GradeService.calculateCourseGrade(course, grades);
    if (result.success) {
      const category = result.categoryAverages.find(cat => cat.categoryId === categoryId);
      return category ? category.average : null;
    }
    return null;
  };

  // Calculate course overall grade
  const getCourseGrade = () => {
    const result = GradeService.calculateCourseImpact(course, grades);
    return result.success ? result.courseGrade : 0;
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

  return (
    <div className="w-full max-w-4xl mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-4">
          {onBack && (
            <button
              onClick={onBack}
              className="flex items-center gap-2 text-[#3B389f] hover:text-[#2d2a7a] transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Back to Courses
            </button>
          )}
          <div>
            <h2 className="text-2xl font-bold text-gray-800">{course.name}</h2>
            <p className="text-gray-600">
              Overall Grade: 
              <span className={`ml-2 font-semibold ${getGradeColor(courseGrade)}`}>
                {course.gradingScale === 'percentage' ? `${courseGrade.toFixed(1)}%` :
                 course.gradingScale === 'gpa' ? convertPercentageToScale(courseGrade, 'gpa', course.maxPoints, course.gpaScale) :
                 convertPercentageToScale(courseGrade, 'points', course.maxPoints)}
              </span>
            </p>
            <p className="text-sm text-gray-600 mt-1">
              Term System: {course.termSystem || '3-term'} | GPA Scale: {course.gpaScale || '4.0'}
            </p>
          </div>
        </div>
        <button
          onClick={() => setShowAddGrade(true)}
          className="bg-[#3B389f] text-white px-4 py-2 rounded-lg hover:bg-[#2d2a7a] transition-colors"
        >
          Add Assessment
        </button>
      </div>

      {/* Categories and Grades */}
      <div className="grid gap-6">
        {course.categories.map(category => {
          const categoryGrades = grades[category.id] || [];
          const categoryAverage = getCategoryAverage(category.id);
          
          return (
            <div key={category.id} className="bg-white p-6 rounded-lg shadow border">
              <div className="flex justify-between items-center mb-4">
                <div>
                  <h3 className="text-lg font-semibold text-gray-800">{category.name}</h3>
                  <p className="text-sm text-gray-600">Weight: {category.weight}%</p>
                  {categoryAverage !== null && (
                    <p className="text-sm text-gray-600">
                      Average: 
                                           <span className={`ml-2 font-semibold ${getGradeColor(categoryAverage)}`}>
                       {course.gradingScale === 'percentage' ? `${categoryAverage.toFixed(1)}%` :
                        course.gradingScale === 'gpa' ? convertPercentageToScale(categoryAverage, 'gpa', course.maxPoints, course.gpaScale) :
                        convertPercentageToScale(categoryAverage, 'points', course.maxPoints)}
                     </span>
                    </p>
                  )}
                </div>
                <button
                  onClick={() => {
                    setNewGrade(prev => ({ ...prev, categoryId: category.id }));
                    setShowAddGrade(true);
                  }}
                  className="text-[#3B389f] hover:text-[#2d2a7a] text-sm"
                >
                  + Add Assessment
                </button>
              </div>

              {/* Grades List */}
              {categoryGrades.length > 0 ? (
                <div className="space-y-2">
                  {categoryGrades.map(grade => {
                    const hasScore = grade.score !== null && grade.score !== undefined;
                    const percentage = hasScore ? (grade.score / grade.maxScore) * 100 : null;
                    
                    return (
                      <div 
                        key={grade.id} 
                        className={`flex items-center justify-between p-3 rounded-lg transition-colors ${
                          hasScore ? 'bg-gray-50' : 'bg-blue-50 border-2 border-dashed border-blue-300 cursor-pointer'
                        }`}
                        onClick={() => !hasScore && handleAssessmentClick(grade)}
                      >
                        <div className="flex-1">
                          <div className="flex items-center gap-3">
                            <span className="font-medium text-gray-800">{grade.name}</span>
                            {grade.assessmentType && (
                              <span className="bg-purple-100 text-purple-800 text-xs px-2 py-1 rounded">
                                {grade.assessmentType}
                              </span>
                            )}
                            {grade.isExtraCredit && (
                              <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded">
                                Extra Credit
                              </span>
                            )}
                            {!hasScore && (
                              <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded">
                                Pending
                              </span>
                            )}
                          </div>
                          <div className="text-sm text-gray-600 mt-1">
                            {hasScore ? (
                              <span className={`font-semibold ${getGradeColor(percentage)}`}>
                                {grade.score}/{grade.maxScore} ({percentage.toFixed(1)}%)
                                {grade.isExtraCredit && grade.extraCreditPoints > 0 && (
                                  <span className="ml-2 text-green-600 font-medium">
                                    +{grade.extraCreditPoints} EC
                                  </span>
                                )}
                                {grade.isExtraCredit && grade.extraCreditPoints > 0 && (
                                  <div className="text-xs text-green-600 mt-1">
                                    Adjusted: {grade.score + grade.extraCreditPoints}/{grade.maxScore} ({(percentage + (grade.extraCreditPoints / grade.maxScore) * 100).toFixed(1)}%)
                                  </div>
                                )}
                              </span>
                            ) : (
                              <span className="text-blue-600 font-medium">
                                Max Score: {grade.maxScore} • Click to add your score
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
                        <div className="flex gap-2">
                          {hasScore && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleEditScore(grade);
                              }}
                              className="text-green-600 hover:text-green-800 text-sm"
                            >
                              Edit Score
                            </button>
                          )}
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              editGrade(grade, category.id);
                            }}
                            className="text-blue-600 hover:text-blue-800 text-sm"
                          >
                            Edit
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              deleteGrade(grade.id, category.id);
                            }}
                            className="text-red-600 hover:text-red-800 text-sm"
                          >
                            Delete
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <p className="text-gray-500 text-center py-4">No assessments added yet</p>
              )}
            </div>
          );
        })}
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
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#3B389f]"
                    required
                  >
                    <option value="">Select Category</option>
                    {course.categories.map(cat => (
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
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#3B389f]"
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
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#3B389f]"
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
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#3B389f]"
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
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#3B389f]"
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
                     className="mr-2 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
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
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#3B389f]"
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
                  className="px-4 py-2 bg-[#3B389f] text-white rounded-md hover:bg-[#2d2a7a]"
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
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#3B389f]"
                  step="0.01"
                  min="0"
                  max={selectedGrade.maxScore}
                  required
                  autoFocus
                />
                <p className="text-xs text-gray-500 mt-1">
                  Enter the score you received (max: {selectedGrade.maxScore})
                </p>
              </div>

              <div className="mb-4">
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="scoreExtraCredit"
                    checked={selectedGrade.isExtraCredit}
                    onChange={(e) => setSelectedGrade({
                      ...selectedGrade, 
                      isExtraCredit: e.target.checked
                    })}
                    className="mr-2 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label htmlFor="scoreExtraCredit" className="text-sm text-gray-700">
                    Extra Credit
                  </label>
                </div>
                <p className="text-xs text-gray-500 -mt-1 mb-2">
                  Check this if this assessment provides extra credit points
                </p>
              </div>

              {selectedGrade.isExtraCredit && (
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Extra Credit Points
                  </label>
                  <input
                    type="number"
                    value={selectedGrade.extraCreditPoints || 0}
                    onChange={(e) => setSelectedGrade({
                      ...selectedGrade, 
                      extraCreditPoints: parseFloat(e.target.value) || 0
                    })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#3B389f]"
                    step="0.01"
                    min="0"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Enter the number of points to add to the total score
                  </p>
                </div>
              )}

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
                  className="px-4 py-2 bg-[#3B389f] text-white rounded-md hover:bg-[#2d2a7a]"
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
              Maximum Score: {selectedGrade.maxScore}<br/>
              Current Score: {selectedGrade.score}
            </p>
            
            <form onSubmit={handleEditScoreSubmit}>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  New Score
                </label>
                <input
                  type="number"
                  name="editScore"
                  defaultValue={selectedGrade.score}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#3B389f]"
                  step="0.01"
                  min="0"
                  max={selectedGrade.maxScore}
                  required
                  autoFocus
                />
                <p className="text-xs text-gray-500 mt-1">
                  Enter the new score (max: {selectedGrade.maxScore})
                </p>
              </div>

              <div className="mb-4">
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="editExtraCredit"
                    checked={selectedGrade.isExtraCredit || false}
                    onChange={(e) => setSelectedGrade({
                      ...selectedGrade, 
                      isExtraCredit: e.target.checked
                    })}
                    className="mr-2 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label htmlFor="editExtraCredit" className="text-sm text-gray-700">
                    Extra Credit
                  </label>
                </div>
                <p className="text-xs text-gray-500 -mt-1 mb-2">
                  Check this if this assessment provides extra credit points
                </p>
              </div>

              {selectedGrade.isExtraCredit && (
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Extra Credit Points
                  </label>
                  <input
                    type="number"
                    value={selectedGrade.extraCreditPoints || 0}
                    onChange={(e) => setSelectedGrade({
                      ...selectedGrade, 
                      extraCreditPoints: parseFloat(e.target.value) || 0
                    })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#3B389f]"
                    step="0.01"
                    min="0"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Enter the number of points to add to the total score
                  </p>
                </div>
              )}

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
    </div>
  );
}

export default GradeEntry;
