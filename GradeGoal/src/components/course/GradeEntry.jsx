import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import {
  convertGradeToPercentage,
  convertPercentageToScale,
  convertPercentageToGPA,
  getGradeColor,
  calculateCategoryAverage
} from '../../utils/gradeCalculations';
import GradeService from '../../services/gradeService';
import { calculateCourseProgress } from '../../utils/progressCalculations';
import {
  getGradesByCourseId,
  createGrade,
  updateGrade,
  deleteGrade as deleteGradeApi,
  getAssessmentCategoriesByCourseId
} from '../../backend/api';
import AddCourse from './AddCourse';
import GradeSuccessFeedback from './GradeSuccessFeedback';
import { getCourseColorScheme } from '../../utils/courseColors';

function GradeEntry({ course, onGradeUpdate, onBack }) {
  const { currentUser } = useAuth();

  const [grades, setGrades] = useState({});
  const [categories, setCategories] = useState([]);
  const [showAddGrade, setShowAddGrade] = useState(false);
  const [showScoreInput, setShowScoreInput] = useState(false);
  const [showEditScore, setShowEditScore] = useState(false);
  const [selectedGrade, setSelectedGrade] = useState(null);
  const [newGrade, setNewGrade] = useState({
    categoryId: '',
    name: '',
    maxScore: '',
    date: new Date().toISOString().split('T')[0],
    assessmentType: '',
    isExtraCredit: false,
    extraCreditPoints: null,
    note: ''
  });
  const [editingGrade, setEditingGrade] = useState(null);
  const [showEditCourse, setShowEditCourse] = useState(false);
  const [editingCourse, setEditingCourse] = useState(null);
  const [successMessage, setSuccessMessage] = useState('');
  const [showSuccessFeedback, setShowSuccessFeedback] = useState(false);
  const [lastSavedGrade, setLastSavedGrade] = useState(null);

  useEffect(() => {
    if (course && currentUser) {
      loadCategories();
    }
  }, [course, currentUser]);

  useEffect(() => {
    if (course && currentUser) {
      loadGrades();
    }
  }, [course, currentUser]);

  useEffect(() => {
    if (newGrade.assessmentType && !newGrade.name) {
      const typeName = newGrade.assessmentType.charAt(0).toUpperCase() + newGrade.assessmentType.slice(1) + ' ';
      setNewGrade(prev => ({ ...prev, name: typeName }));
    }
  }, [newGrade.assessmentType]);

  const getStatusColor = (status) => {
    switch (status?.toUpperCase()) {
      case 'COMPLETED':
        return 'bg-green-100 text-green-800 border border-green-200';
      case 'UPCOMING':
        return 'bg-blue-100 text-blue-800 border border-blue-200';
      case 'OVERDUE':
        return 'bg-red-100 text-red-800 border border-red-200';
      case 'CANCELLED':
        return 'bg-gray-100 text-gray-800 border border-gray-200';
      default:
        return 'bg-yellow-100 text-yellow-800 border border-yellow-200';
    }
  };

  const determineAssessmentStatus = (grade) => {
    const hasScore = grade.score !== null && grade.score !== undefined && grade.score !== '' && grade.score !== 0 && !isNaN(parseFloat(grade.score));

    if (hasScore) {
      return 'COMPLETED';
    }

    if (!grade.date) {
      return 'UPCOMING';
    }

    const today = new Date();
    const dueDate = new Date(grade.date);

    today.setHours(0, 0, 0, 0);
    dueDate.setHours(0, 0, 0, 0);

    if (dueDate < today) {
      return 'OVERDUE';
    } else {
      return 'UPCOMING';
    }
  };

  const loadGrades = async () => {
    try {
      const gradesData = await getGradesByCourseId(course.id);

      const transformedGrades = {};

      const firstCategoryId = categories && categories.length > 0 ? categories[0].id : null;

      gradesData.forEach(grade => {

        let categoryId = null;

        if (grade.assessment && grade.assessment.categoryId) {
          categoryId = grade.assessment.categoryId;
        }

        else if (grade.category && grade.category.id) {
          categoryId = grade.category.id;
        }

        else if (grade.categoryId) {
          categoryId = grade.categoryId;
        }

        else if (grade.category_id) {
          categoryId = grade.category_id;
        }

        if (!categoryId && firstCategoryId) {
          categoryId = firstCategoryId;
        }

        if (!categoryId) {
          return;
        }

        if (!transformedGrades[categoryId]) {
          transformedGrades[categoryId] = [];
        }

        transformedGrades[categoryId].push({
          id: grade.gradeId || grade.id,
          categoryId: categoryId,
          name: grade.assessment?.assessmentName || grade.name,
          maxScore: grade.assessment?.maxPoints || grade.maxScore,
          score: grade.pointsEarned,
          date: grade.assessment?.dueDate || grade.date,
          assessmentType: grade.assessmentType,
          isExtraCredit: grade.isExtraCredit,
          extraCreditPoints: grade.extraCreditPoints,
          note: grade.notes || grade.note,
          createdAt: grade.createdAt,
          updatedAt: grade.updatedAt
        });
      });
      setGrades(transformedGrades);
    } catch (error) {

    }
  };

  const loadCategories = async () => {
    try {
      const categoriesData = await getAssessmentCategoriesByCourseId(course.id);

      const transformedCategories = categoriesData.map(category => ({
        id: category.categoryId || category.id,
        name: category.categoryName || category.name,
        weight: category.weightPercentage || category.weight,
        weightPercentage: category.weightPercentage || category.weight
      }));

      setCategories(transformedCategories);
    } catch (error) {

      if (course.categories && course.categories.length > 0) {
        setCategories(course.categories);
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const gradeData = {
        name: newGrade.name,
        maxScore: parseFloat(newGrade.maxScore),
        score: null,
        date: newGrade.date,
        assessmentType: newGrade.assessmentType,
        isExtraCredit: newGrade.isExtraCredit,
        extraCreditPoints: newGrade.extraCreditPoints ? parseFloat(newGrade.extraCreditPoints) : null,
        note: newGrade.note,
        categoryId: newGrade.categoryId
      };

      let savedGrade;
      if (editingGrade) {

        savedGrade = await updateGrade(editingGrade.id, gradeData);
      } else {

        savedGrade = await createGrade(gradeData);
      }

      const updatedGrades = { ...grades };

      if (editingGrade) {

        const oldCategoryId = editingGrade.categoryId;
        const newCategoryId = newGrade.categoryId;

        if (oldCategoryId !== newCategoryId && updatedGrades[oldCategoryId]) {
          updatedGrades[oldCategoryId] = updatedGrades[oldCategoryId].filter(
            grade => grade.id !== editingGrade.id
          );
        }

        if (!updatedGrades[newCategoryId]) {
          updatedGrades[newCategoryId] = [];
        }

        const existingIndex = updatedGrades[newCategoryId].findIndex(
          grade => grade.id === editingGrade.id
        );

        const updatedGradeData = {
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
        };

        if (existingIndex >= 0) {
          updatedGrades[newCategoryId][existingIndex] = updatedGradeData;
        } else {
          updatedGrades[newCategoryId].push(updatedGradeData);
        }

        setSuccessMessage('Assessment updated successfully!');
      } else {

        if (!updatedGrades[newGrade.categoryId]) {
          updatedGrades[newGrade.categoryId] = [];
        }
        const newGradeData = {
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
        };
        updatedGrades[newGrade.categoryId].push(newGradeData);

        setSuccessMessage('Assessment added successfully!');
      }

      setGrades(updatedGrades);

      if (onGradeUpdate) {
        onGradeUpdate(updatedGrades);
      }

      setTimeout(() => {
        setSuccessMessage('');
      }, 3000);

      setNewGrade({
        categoryId: '',
        name: '',
        maxScore: '',
        date: new Date().toISOString().split('T')[0],
        assessmentType: '',
        isExtraCredit: false,
        extraCreditPoints: null,
        note: ''
      });
      setShowAddGrade(false);
      setEditingGrade(null);
    } catch (error) {
      alert('Failed to save grade. Please try again.');
    }
  };

  const handleAssessmentClick = (grade) => {
    const hasScore = grade.score !== null && grade.score !== undefined && grade.score !== '' && grade.score !== 0 && !isNaN(parseFloat(grade.score));
    if (!hasScore) {
      setSelectedGrade(grade);
      setShowScoreInput(true);
    }
  };

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

      const gradeData = {
        name: selectedGrade.name,
        maxScore: selectedGrade.maxScore,
        score: score,
        date: selectedGrade.date,
        assessmentType: selectedGrade.assessmentType,
        isExtraCredit: selectedGrade.isExtraCredit || false,
        extraCreditPoints: selectedGrade.extraCreditPoints || null,
        note: selectedGrade.note || '',
        categoryId: selectedGrade.categoryId
      };

      await updateGrade(selectedGrade.id, gradeData);

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

      setLastSavedGrade({
        id: selectedGrade.id,
        categoryId: selectedGrade.categoryId,
        name: selectedGrade.name,
        maxScore: selectedGrade.maxScore,
        score: score,
        date: selectedGrade.date,
        assessmentType: selectedGrade.assessmentType,
        isExtraCredit: selectedGrade.isExtraCredit,
        extraCreditPoints: selectedGrade.extraCreditPoints,
        note: selectedGrade.note
      });
      setShowSuccessFeedback(true);

      setShowScoreInput(false);
      setSelectedGrade(null);
    } catch (error) {
      alert('Failed to update score. Please try again.');
    }
  };

  const handleEditScore = (grade) => {
    setSelectedGrade(grade);
    setShowEditScore(true);
  };

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

      const gradeData = {
        name: selectedGrade.name,
        maxScore: selectedGrade.maxScore,
        score: score,
        date: selectedGrade.date,
        assessmentType: selectedGrade.assessmentType,
        isExtraCredit: selectedGrade.isExtraCredit || false,
        extraCreditPoints: selectedGrade.extraCreditPoints || null,
        note: selectedGrade.note || '',
        categoryId: selectedGrade.categoryId
      };

      await updateGrade(selectedGrade.id, gradeData);

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


      setLastSavedGrade({
        id: selectedGrade.id,
        categoryId: selectedGrade.categoryId,
        name: selectedGrade.name,
        maxScore: selectedGrade.maxScore,
        score: score,
        date: selectedGrade.date,
        assessmentType: selectedGrade.assessmentType,
        isExtraCredit: selectedGrade.isExtraCredit,
        extraCreditPoints: selectedGrade.extraCreditPoints,
        note: selectedGrade.note
      });
      setShowSuccessFeedback(true);

      setShowEditScore(false);
      setSelectedGrade(null);
    } catch (error) {
      alert('Failed to update score. Please try again.');
    }
  };

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

  const deleteGrade = async (gradeId, categoryId) => {
    if (window.confirm('Are you sure you want to delete this assessment?')) {
      try {
        await deleteGradeApi(gradeId);

        setGrades(prevGrades => {
          const updatedGrades = { ...prevGrades };
          if (updatedGrades[categoryId]) {
            updatedGrades[categoryId] = updatedGrades[categoryId].filter(g => g.id !== gradeId);
          }
          return updatedGrades;
        });

        setSuccessMessage('Assessment deleted successfully!');

        setTimeout(() => {
          setSuccessMessage('');
        }, 3000);

        if (onGradeUpdate) {
          const updatedGrades = { ...grades };
          if (updatedGrades[categoryId]) {
            updatedGrades[categoryId] = updatedGrades[categoryId].filter(g => g.id !== gradeId);
          }
          onGradeUpdate(updatedGrades);
        }
      } catch (error) {
        alert('Failed to delete assessment. Please try again.');
      }
    }
  };

  const getCategoryAverage = (categoryId) => {

    if (!categories || categories.length === 0) {
      return null;
    }

    const categoryGrades = grades[categoryId] || [];
    if (categoryGrades.length === 0) return null;

    try {

      const average = calculateCategoryAverage(
        categoryGrades,
        course.gradingScale || 'percentage',
        course.maxPoints || 100,
        'exclude'
      );

      return average;
    } catch (error) {
      return null;
    }
  };

  const getCourseGrade = () => {

    if (!categories || categories.length === 0) {
      return 0;
    }

    try {
      // Check if there are any grades at all
      const hasAnyGrades = Object.values(grades).some(categoryGrades => 
        Array.isArray(categoryGrades) && categoryGrades.length > 0
      );

      if (!hasAnyGrades) {
        return 0; // No grades at all, return 0
      }

      const courseWithCategories = { ...course, categories };
      const result = GradeService.calculateCourseGrade(courseWithCategories, grades);

      if (result.success) {
        return result.courseGrade;
      } else {
        return 0;
      }
    } catch (error) {
      return 0;
    }
  };

  const getTotalAssessments = () => {
    return Object.values(grades).reduce((total, categoryGrades) => {
      return total + categoryGrades.length;
    }, 0);
  };

  const getProgressPercentage = () => {

    return calculateCourseProgress(categories, grades);
  };

  const getTargetGradeDisplay = () => {
    if (!course.targetGrade) return 'Not Set';

    const targetGrade = course.targetGrade.toString().trim();

    if (/^\d+\.\d+$/.test(targetGrade) && parseFloat(targetGrade) <= 5.0) {
      return targetGrade;
    }

    if (targetGrade.includes('%') || parseFloat(targetGrade) > 5.0) {
      const percentage = parseFloat(targetGrade.replace('%', ''));
      if (!isNaN(percentage)) {

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

    return targetGrade;
  };

  const handleCourseUpdated = (updatedCourses) => {

    const updatedCourse = updatedCourses.find(c => c.courseId === course.courseId);
    if (updatedCourse) {

      if (onGradeUpdate) {
        onGradeUpdate(updatedCourse);
      }
    }
    setShowEditCourse(false);
    setEditingCourse(null);
  };

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
      {}
      <div className={`bg-gradient-to-br ${colorScheme.gradient} text-white shadow-2xl ${course.isActive === false ? 'border-l-4 border-yellow-400' : ''} flex-shrink-0`}>
        <div className="w-full px-8 py-8">
          {}
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
              onClick={(e) => {
                e.stopPropagation();
                // Ensure colorIndex is included when editing
                const courseWithColorIndex = {
                  ...course,
                  colorIndex: course.colorIndex !== undefined ? course.colorIndex : 0
                };
                setEditingCourse(courseWithColorIndex);
                setShowEditCourse(true);
              }}
              className={`flex items-center gap-3 ${course.isActive === false ? 'bg-gray-400 cursor-not-allowed' : 'bg-white/10 backdrop-blur-sm hover:bg-white/20'} text-white px-6 py-3 rounded-full transition-all duration-300 border border-white/20 ${course.isActive === false ? 'hover:bg-gray-400' : ''}`}
              disabled={course.isActive === false}
              title={course.isActive === false ? 'Archived courses cannot be edited' : 'Edit course settings'}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
              <span className="font-medium">{course.isActive === false ? 'View' : 'Edit'}</span>
            </button>
          </div>

          {}
          <div className="text-center mb-10">
            <div className="inline-flex items-center gap-3 mb-4">
              <span className="text-lg text-white/70 font-medium">{course.courseCode || course.name.substring(0, 8).toUpperCase()}</span>
              <span className={`px-4 py-2 rounded-full text-sm font-semibold ${course.isActive === false
                  ? 'bg-yellow-500/20 text-yellow-200 border border-yellow-400/30'
                  : 'bg-green-500/20 text-green-200 border border-green-400/30'
                }`}>
                {course.isActive === false ? 'Archived Course' : 'Active Course'}
              </span>
            </div>
            <h1 className="text-5xl font-bold text-white mb-2">{course.name}</h1>
            {course.isActive === false && (
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-yellow-500/20 border border-yellow-400/30 rounded-full">
                <svg className="w-4 h-4 text-yellow-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
                <span className="text-sm text-yellow-200 font-medium">Course Archived</span>
              </div>
            )}
          </div>

          {}
          <div className={`max-w-5xl mx-auto grid grid-cols-2 lg:grid-cols-4 gap-6 ${course.isActive === false ? 'opacity-75' : ''}`}>
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20 hover:bg-white/20 transition-all duration-300">
              <div className="text-center">
                <p className="text-4xl font-bold text-white mb-2">
                  {courseGrade === 0 ? '0.00' : convertPercentageToGPA(courseGrade, course.gpaScale || '4.0').toFixed(2)}
                </p>
                <p className="text-sm text-white/80 font-medium uppercase tracking-wider">Current GPA</p>
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

      {}
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

      {}
      <div className={`w-full px-8 py-12 ${course.isActive === false ? 'opacity-90' : ''} flex-1`}>
        {course.isActive === false && (
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
            {categories && categories.length > 0 ? categories.map(category => {
              const categoryGrades = grades[category.id] || [];
              const categoryAverage = getCategoryAverage(category.id);

              return (
                <div key={category.id} className="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100 hover:shadow-2xl transition-all duration-300">
                  {}
                  <div className={`bg-gradient-to-r ${colorScheme.gradient} px-4 sm:px-6 py-4 sm:py-5 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 sm:gap-0`}>
                    <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3">
                      <h3 className="text-lg sm:text-xl font-bold text-white">{category.name}</h3>
                      <span className="text-white/80 text-sm font-medium">Weight: {category.weight}%</span>
                    </div>
                    <button
                      onClick={() => {
                        setNewGrade(prev => ({ ...prev, categoryId: category.id }));
                        setShowAddGrade(true);
                      }}
                      className="bg-white/20 backdrop-blur-sm text-white px-4 sm:px-5 py-2 sm:py-2.5 rounded-xl hover:bg-white hover:text-gray-800 transition-all duration-300 font-medium border border-white/30 text-sm sm:text-base self-start sm:self-auto"
                    >
                      + Add Assessment
                    </button>
                  </div>

                  {}
                  <div className="p-4 sm:p-6">
                    {}
                    <div className="flex justify-between items-center mb-4 sm:mb-6 p-3 sm:p-4 bg-gray-50 rounded-xl">
                      {categoryAverage !== null ? (
                        <div className="text-right">
                          <span className="text-sm text-gray-600">Average: </span>
                          <span className={`ml-2 text-lg font-bold ${getGradeColor(categoryAverage)}`}>
                            {convertPercentageToGPA(categoryAverage, course.gpaScale || '4.0').toFixed(2)}
                          </span>
                        </div>
                      ) : (
                        <div className="text-right">
                          <span className="text-sm text-gray-600">Average: </span>
                          <span className="ml-2 text-lg font-bold text-gray-400">--</span>
                        </div>
                      )}
                    </div>

                    {}
                    <div className="space-y-3">
                      {categoryGrades.length > 0 ? (
                        categoryGrades.map(grade => {

                          const hasScore = grade.score !== null && grade.score !== undefined && grade.score !== '' && grade.score !== 0 && !isNaN(parseFloat(grade.score));
                          const percentage = hasScore ? (() => {
                            let adjustedScore = grade.score;
                            if (grade.isExtraCredit && grade.extraCreditPoints && grade.extraCreditPoints > 0) {
                              adjustedScore += grade.extraCreditPoints;
                            }
                            return (adjustedScore / grade.maxScore) * 100;
                          })() : null;

                          return (
                            <div
                              key={grade.id}
                              className={`p-4 sm:p-5 rounded-2xl border transition-all duration-300 hover:shadow-lg relative ${hasScore
                                  ? 'bg-gradient-to-r from-green-50 to-emerald-50 border-green-200 shadow-sm'
                                  : 'bg-gradient-to-r from-gray-50 to-slate-50 border-gray-200 shadow-sm hover:shadow-md'
                                }`}
                              onClick={() => !hasScore && handleAssessmentClick(grade)}
                            >
                              {/* Action Buttons - Mobile Responsive */}
                              <div className="absolute top-2 right-2 sm:top-3 sm:right-3 flex flex-col sm:flex-row gap-1 sm:gap-2">
                                {!hasScore ? (
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleAssessmentClick(grade);
                                    }}
                                    className="bg-green-600 text-white px-2 sm:px-3 py-1 sm:py-1.5 rounded-lg hover:bg-green-700 transition-all duration-200 font-semibold text-xs shadow-lg hover:shadow-xl"
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
                                    className="bg-blue-600 text-white px-2 sm:px-3 py-1 sm:py-1.5 rounded-lg hover:bg-blue-700 transition-all duration-200 font-semibold text-xs shadow-lg hover:shadow-xl"
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
                                      note: grade.note || '',
                                      isExtraCredit: grade.isExtraCredit || false,
                                      extraCreditPoints: grade.extraCreditPoints || null
                                    });
                                    setShowAddGrade(true);
                                  }}
                                  className="bg-gray-600 text-white px-2 sm:px-3 py-1 sm:py-1.5 rounded-lg hover:bg-gray-700 transition-all duration-200 font-semibold text-xs shadow-lg hover:shadow-xl"
                                >
                                  Edit
                                </button>

                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    deleteGrade(grade.id, grade.categoryId);
                                  }}
                                  className="bg-red-600 text-white px-2 sm:px-3 py-1 sm:py-1.5 rounded-lg hover:bg-red-700 transition-all duration-200 font-semibold text-xs shadow-lg hover:shadow-xl"
                                >
                                  Delete
                                </button>
                              </div>

                              <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4 pr-16 sm:pr-32">
                                {}
                                <div className={`w-14 h-14 ${hasScore ? 'bg-green-500' : 'bg-blue-500'} rounded-2xl flex items-center justify-center shadow-lg flex-shrink-0`}>
                                  <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                  </svg>
                                </div>

                                {}
                                <div className="flex-1 min-w-0">
                                  <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 mb-2">
                                    <h4 className="text-base sm:text-lg font-bold text-gray-900 truncate">{grade.name}</h4>
                                    <span className={`px-2 sm:px-3 py-1 rounded-full text-xs font-bold self-start ${getStatusColor(determineAssessmentStatus(grade))}`}>
                                      {determineAssessmentStatus(grade)}
                                    </span>
                                  </div>
                                  <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 mb-3">
                                    <div className="text-sm text-gray-600">
                                      {hasScore ? (
                                        <span className={`font-bold text-base sm:text-lg ${getGradeColor(percentage)}`}>
                                          {(() => {
                                            let adjustedScore = grade.score;
                                            if (grade.isExtraCredit && grade.extraCreditPoints && grade.extraCreditPoints > 0) {
                                              adjustedScore += grade.extraCreditPoints;
                                            }
                                            return adjustedScore;
                                          })()}/{grade.maxScore} ({percentage.toFixed(1)}% | {convertPercentageToGPA(percentage, course.gpaScale || '4.0').toFixed(2)} GPA)
                                          {grade.isExtraCredit && grade.extraCreditPoints && grade.extraCreditPoints > 0 && (
                                            <span className="ml-2 text-green-600 font-medium">
                                              (+{grade.extraCreditPoints})
                                            </span>
                                          )}
                                        </span>
                                      ) : (
                                        <span className="font-medium">
                                          Max Score: <span className="text-gray-800">{grade.maxScore}</span>
                                          {grade.isExtraCredit && grade.extraCreditPoints && grade.extraCreditPoints > 0 && (
                                            <span className="ml-2 text-green-600 font-medium">
                                              +{grade.extraCreditPoints}
                                            </span>
                                          )}
                                        </span>
                                      )}
                                    </div>

                                    <div className="flex items-center gap-2 text-gray-500">
                                      <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                      </svg>
                                      <span className="text-sm font-medium">Due: {grade.date}</span>
                                    </div>
                                  </div>

                                  {}
                                  {grade.note && grade.note.trim() !== '' && (
                                    <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded-xl">
                                      <div className="flex items-center gap-2 mb-1">
                                        <svg className="w-4 h-4 text-blue-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                        </svg>
                                        <span className="text-sm text-blue-800 font-semibold">Note</span>
                                      </div>
                                      <p className="text-sm text-blue-700 leading-relaxed break-words">{grade.note}</p>
                                    </div>
                                  )}
                                </div>

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

      {}
      {showAddGrade && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white/95 backdrop-blur-md rounded-lg shadow-xl w-full max-w-lg overflow-hidden border border-white/20">
            {}
            <div className={`${colorScheme.primary} px-6 py-4`}>
              <h3 className="text-xl font-bold text-white text-center">
                {editingGrade ? 'Edit Assessment' : 'Add New Assessment'}
              </h3>
            </div>

            {}
            <div className="p-6">
              <form onSubmit={handleSubmit}>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Category
                    </label>
                    <select
                      value={newGrade.categoryId}
                      onChange={(e) => setNewGrade({ ...newGrade, categoryId: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-600"
                      required
                    >
                      <option value="">Select Category</option>
                      {categories && categories.map(cat => (
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
                      onChange={(e) => setNewGrade({ ...newGrade, assessmentType: e.target.value })}
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
                      onChange={(e) => setNewGrade({ ...newGrade, name: e.target.value })}
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
                      onChange={(e) => setNewGrade({ ...newGrade, maxScore: parseFloat(e.target.value) || '' })}
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
                        onChange={(e) => setNewGrade({ ...newGrade, date: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-600"
                        required
                      />
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      When this assessment is due
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Note
                    </label>
                    <textarea
                      value={newGrade.note}
                      onChange={(e) => setNewGrade({ ...newGrade, note: e.target.value })}
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
                      onChange={(e) => setNewGrade({ ...newGrade, isExtraCredit: e.target.checked })}
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
                        value={newGrade.extraCreditPoints || ''}
                        onChange={(e) => setNewGrade({ ...newGrade, extraCreditPoints: e.target.value ? parseFloat(e.target.value) : null })}
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

      {}
      {showScoreInput && selectedGrade && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white/95 backdrop-blur-md rounded-lg shadow-xl w-full max-w-md overflow-hidden border border-white/20">
            {}
            <div className={`${colorScheme.primary} px-6 py-4`}>
              <h3 className="text-xl font-bold text-white text-center">Add Your Score</h3>
            </div>
            <div className="p-6">
            <p className="text-gray-600 mb-4">
              <strong>{selectedGrade.name}</strong><br />
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
        </div>
      )}

      {}
      {showEditScore && selectedGrade && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white/95 backdrop-blur-md rounded-lg shadow-xl w-full max-w-md overflow-hidden border border-white/20">
            {}
            <div className={`${colorScheme.primary} px-6 py-4`}>
              <h3 className="text-xl font-bold text-white text-center">Edit Score</h3>
            </div>
            <div className="p-6">
            <p className="text-gray-600 mb-4">
              <strong>{selectedGrade.name}</strong><br />
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
        </div>
      )}

      {}
      <AddCourse
        isOpen={showEditCourse}
        onClose={() => {
          setShowEditCourse(false);
          setEditingCourse(null);
        }}
        onCourseCreated={handleCourseUpdated}
        editingCourse={editingCourse}
        existingCourses={[course]}
        courseColorScheme={colorScheme}
      />

      {}
      {showSuccessFeedback && lastSavedGrade && (
        <GradeSuccessFeedback
          gradeData={lastSavedGrade}
          course={course}
          grades={grades}
          categories={categories}
          onEnterAnother={() => {
            setShowSuccessFeedback(false);
            setShowAddGrade(true);
          }}
          onReturnToCourse={() => {
            setShowSuccessFeedback(false);
            onBack();
          }}
          onClose={() => {
            setShowSuccessFeedback(false);
          }}
        />
      )}
    </div>
  );
}

export default GradeEntry;

