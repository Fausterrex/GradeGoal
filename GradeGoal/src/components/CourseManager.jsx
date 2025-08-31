import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { GRADING_SCALES } from '../utils/gradeCalculations';
import GradeService from '../services/gradeService';
import { 
  getCoursesByUid, 
  createCourse, 
  updateCourse, 
  deleteCourse as deleteCourseApi,
  addCategoryToCourse
} from '../backend/api';

function CourseManager({ onCourseUpdate, onCourseSelect = () => {}, grades = {} }) {
  const { currentUser } = useAuth();
  const [courses, setCourses] = useState([]);
  const [showAddCourse, setShowAddCourse] = useState(false);
  const [newCourse, setNewCourse] = useState({
    name: '',
    code: '',
    creditHours: 3,
    semester: '',
    targetGrade: '',
    gradingScale: GRADING_SCALES.PERCENTAGE,
    maxPoints: 100,
    handleMissing: 'exclude',
    termSystem: '3-term', // '2-term' or '3-term'
    gpaScale: '4.0', // '4.0', '5.0', 'inverted-4.0', 'inverted-5.0'
    categories: []
  });
  const [editingCourse, setEditingCourse] = useState(null);

  // Load courses from database
  useEffect(() => {
    if (currentUser) {
      loadCourses();
    }
  }, [currentUser]);

  // Load courses from database
  const loadCourses = async () => {
    try {
      const coursesData = await getCoursesByUid(currentUser.uid);
      setCourses(coursesData);
      if (onCourseUpdate) onCourseUpdate(coursesData);
    } catch (error) {
      console.error('Failed to load courses:', error);
    }
  };

  // Save courses to database
  const saveCourses = (updatedCourses) => {
    setCourses(updatedCourses);
    if (onCourseUpdate) onCourseUpdate(updatedCourses);
  };

  const addCategory = () => {
    const category = {
      id: Date.now(),
      name: '',
      weight: 0,
      gradingScale: newCourse.gradingScale,
      grades: []
    };
    setNewCourse({
      ...newCourse,
      categories: [...newCourse.categories, category]
    });
  };

  // Predefined category templates based on term system
  const addPredefinedCategories = () => {
    let predefinedCategories;
    
    if (newCourse.termSystem === '3-term') {
      predefinedCategories = [
        { id: Date.now(), name: 'First Term', weight: 30, gradingScale: newCourse.gradingScale, grades: [] },
        { id: Date.now() + 1, name: 'Midterm', weight: 30, gradingScale: newCourse.gradingScale, grades: [] },
        { id: Date.now() + 2, name: 'Final Term', weight: 40, gradingScale: newCourse.gradingScale, grades: [] }
      ];
    } else {
      predefinedCategories = [
        { id: Date.now(), name: 'Midterm', weight: 40, gradingScale: newCourse.gradingScale, grades: [] },
        { id: Date.now() + 1, name: 'Final Term', weight: 60, gradingScale: newCourse.gradingScale, grades: [] }
      ];
    }
    
    setNewCourse({
      ...newCourse,
      categories: predefinedCategories
    });
  };

  const updateCategory = (index, field, value) => {
    const updatedCategories = [...newCourse.categories];
    updatedCategories[index] = { ...updatedCategories[index], [field]: value };
    setNewCourse({ ...newCourse, categories: updatedCategories });
  };

  const removeCategory = (index) => {
    const updatedCategories = newCourse.categories.filter((_, i) => i !== index);
    setNewCourse({ ...newCourse, categories: updatedCategories });
  };

  const validateCourse = () => {
    if (!newCourse.name.trim()) return 'Course name is required';
    if (newCourse.categories.length === 0) return 'At least one category is required';
    
    const totalWeight = newCourse.categories.reduce((sum, cat) => sum + (parseFloat(cat.weight) || 0), 0);
    if (Math.abs(totalWeight - 100) > 0.01) {
      return `Total weight must equal 100% (current: ${totalWeight.toFixed(1)}%)`;
    }
    
    return null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const error = validateCourse();
    if (error) {
      alert(error);
      return;
    }

    try {
      const courseData = {
        uid: currentUser.uid,
        name: newCourse.name,
        gradingScale: newCourse.gradingScale,
        maxPoints: newCourse.maxPoints,
        gpaScale: newCourse.gpaScale,
        termSystem: newCourse.termSystem
      };

      let createdCourse;
      if (editingCourse) {
        const updateData = {
          ...courseData,
          id: editingCourse.id
        };
        createdCourse = await updateCourse(editingCourse.id, updateData);
      } else {
        createdCourse = await createCourse(courseData);
        
        // Create predefined categories for the new course
        if (newCourse.categories.length > 0) {
          try {
            for (const category of newCourse.categories) {
              // Only send essential category data, avoid circular references
              const categoryData = {
                name: category.name || '',
                weight: parseFloat(category.weight) || 0
              };
              
              await addCategoryToCourse(createdCourse.id, categoryData);
            }
          } catch (categoryError) {
            console.error('Failed to create some categories:', categoryError);
            // Continue with course creation even if categories fail
          }
        }
      }

      // Reload courses from database
      await loadCourses();
      
      setNewCourse({
        name: '',
        gradingScale: GRADING_SCALES.PERCENTAGE,
        maxPoints: 100,
        handleMissing: 'exclude',
        termSystem: '3-term',
        gpaScale: '4.0',
        categories: []
      });
      setShowAddCourse(false);
      setEditingCourse(null);
    } catch (error) {
      console.error('Failed to save course:', error);
      alert('Failed to save course. Please try again.');
    }
  };

  const editCourse = (course) => {
    setNewCourse({
      name: course.name || '',
      code: course.code || '',
      creditHours: course.creditHours || 3,
      semester: course.semester || '',
      targetGrade: course.targetGrade || '',
      gradingScale: course.gradingScale || GRADING_SCALES.PERCENTAGE,
      maxPoints: course.maxPoints || 100,
      handleMissing: course.handleMissing || 'exclude',
      termSystem: course.termSystem || '3-term',
      gpaScale: course.gpaScale || '4.0',
      categories: course.categories || []
    });
    setEditingCourse(course);
    setShowAddCourse(true);
  };

  const deleteCourse = async (courseId) => {
    if (window.confirm('Are you sure you want to delete this course?')) {
      try {
        await deleteCourseApi(courseId);
        
        // Reload courses from database
        await loadCourses();
      } catch (error) {
        console.error('Failed to delete course:', error);
        alert('Failed to delete course. Please try again.');
      }
    }
  };

  const cancelEdit = () => {
    setNewCourse({
      name: '',
      code: '',
      creditHours: 3,
      semester: '',
      targetGrade: '',
      gradingScale: GRADING_SCALES.PERCENTAGE,
      maxPoints: 100,
      handleMissing: 'exclude',
      termSystem: '3-term',
      gpaScale: '4.0',
      categories: []
    });
    setShowAddCourse(false);
    setEditingCourse(null);
  };

  return (
    <div className="w-full p-6 bg-gradient-to-br from-purple-50 to-indigo-50 h-full bg-[url('./drawables/coursesBG.png')] bg-cover bg-center">
             {/* Header */}
       <div className="mb-8">
         {/* Top Row - Back Button and Add Course Button */}
         <div className="flex justify-between items-center mb-6">
           <div className="w-10 h-10 bg-[#8168C5] rounded-xl flex items-center justify-center">
             <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
             </svg>
           </div>
           <button
             onClick={() => setShowAddCourse(true)}
             className="bg-white text-[#8168C5] px-6 py-3 rounded-full hover:shadow-lg transition-all duration-200 font-medium border-2 border-[#8168C5] hover:bg-[#8168C5] hover:text-white"
           >
             + Add Course
           </button>
         </div>
         
         {/* Course List Title - Positioned below the top row */}
         <div className="text-center mb-6">
           <h2 className="text-4xl font-bold text-[#3E325F] mb-2">Course List</h2>
           <p className="text-[#8168C5] text-lg">Manage your academic courses</p>
         </div>
       </div>

             {/* Courses Section Header */}
       <div className="flex items-center gap-3 mb-6 bg-white backdrop-blur-sm rounded-xl p-4 shadow-md">
         <div className="w-8 h-8 bg-gradient-to-br from-[#8168C5] to-[#3E325F] rounded-lg flex items-center justify-center">
           <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
             <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
           </svg>
         </div>
         <h3 className="text-lg font-semibold text-[#3E325F] uppercase tracking-wide">COURSES</h3>
         <div className="ml-auto">
           <span className="text-[#8168C5] font-medium text-sm">{courses.length} course{courses.length !== 1 ? 's' : ''}</span>
         </div>
       </div>

      {/* Course Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 mb-8">
        {courses.map((course, index) => {
          // Generate different colors for course icons
          const colors = [
            'bg-green-500', 'bg-blue-500', 'bg-purple-600', 'bg-red-600', 'bg-teal-500'
          ];
          const color = colors[index % colors.length];
          
          // Generate initials from course name
          const initials = course.name
            .split(' ')
            .map(word => word.charAt(0))
            .join('')
            .substring(0, 2)
            .toUpperCase();

          // Calculate course grade and progress using GradeService and grades from database
          let courseGrade = 'Ongoing';
          let progress = 0;
          let hasGrades = false;
          let isOngoing = true;

          if (course.categories && grades) {
            try {
              // Check if any categories have actual grades with scores
              const categoriesWithScores = course.categories.filter(category => {
                const categoryGrades = grades[category.id] || [];
                return categoryGrades.some(grade => 
                  grade.score !== undefined && 
                  grade.score !== null && 
                  grade.score !== '' && 
                  !isNaN(parseFloat(grade.score))
                );
              });

              // Calculate GPA if we have any scores (even partial)
              if (categoriesWithScores.length > 0) {
                const gradeResult = GradeService.calculateCourseGrade(course, grades);
                if (gradeResult.success) {
                  hasGrades = true;
                  courseGrade = gradeResult.courseGrade;
                  isOngoing = false;
                  
                  if (course.gradingScale === 'percentage' || courseGrade > 100) {
                    courseGrade = GradeService.convertPercentageToGPA(courseGrade, course.gpaScale || '4.0');
                  }
                }
              }
              
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
              
              progress = (completedCategories / course.categories.length) * 100;
            } catch (error) {
              // Silent fallback - use default values
            }
          }

          // Fallback: If we have progress > 0, we should have grades
          if (progress > 0 && !hasGrades) {
            hasGrades = true;
            isOngoing = false;
            // Try to get a basic grade calculation
            try {
              const gradeResult = GradeService.calculateCourseGrade(course, grades);
              if (gradeResult.success) {
                courseGrade = gradeResult.courseGrade;
                if (course.gradingScale === 'percentage' || courseGrade > 100) {
                  courseGrade = GradeService.convertPercentageToGPA(courseGrade, course.gpaScale || '4.0');
                }
              }
            } catch (error) {
              // Silent fallback - use default values
            }
          }

          return (
            <div key={course.id} className="bg-white rounded-xl shadow-md border border-gray-100 overflow-hidden hover:shadow-lg transition-all duration-200 cursor-pointer group max-w-s" onClick={() => onCourseSelect && onCourseSelect(course)}>
              {/* Course Card Content */}
              <div className="p-3">
                {/* Course Header */}
                <div className="flex justify-between items-start mb-2">
                  <div className={`w-13 h-13 ${color} rounded-lg flex items-center justify-center shadow-sm`}>
                    <span className="text-white font-bold text-m">{initials}</span>
                  </div>
                  <div className="text-right">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      hasGrades 
                        ? 'bg-gradient-to-r from-[#8168C5] to-[#3E325F] text-white'
                        : 'bg-yellow-500 text-white'
                    }`}>
                      {hasGrades ? (typeof courseGrade === 'number' ? courseGrade.toFixed(1) : courseGrade) : 'Ongoing'}
                    </span>
                  </div>
                </div>

                {/* Course Info */}
                <div className="mb-2">
                  <p className="text-m font-medium text-gray-500 mb-1">{course.code || course.name.substring(0, 6).toUpperCase()}</p>
                  <h3 className="text-m font-bold text-gray-800 mb-1 leading-tight line-clamp-2">{course.name}</h3>
                </div>

                {/* Progress Bar */}
                <div className="mb-2">
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-m text-[#8168C5] font-medium">Progress:</span>
                    <span className="text-m font-bold text-[#3E325F]">
                      {isOngoing && progress === 0 ? 'Ongoing' : `${Math.round(progress)}%`}
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-3">
                    <div 
                      className={`h-3 rounded-full transition-all duration-300 ${
                        isOngoing && progress === 0 
                          ? 'bg-yellow-500' 
                          : 'bg-gradient-to-r from-[#8168C5] to-[#3E325F]'
                      }`}
                      style={{ width: `${progress}%` }}
                    ></div>
                  </div>
                </div>

                {/* Options Menu */}
                <div className="flex justify-end">
                  <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center group-hover:bg-gray-200 transition-colors">
                    <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
                    </svg>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Add/Edit Course Form */}
      {showAddCourse && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            {/* Header */}
            <div className="border-b border-gray-100 p-6 pb-4">
              <h3 className="text-2xl font-bold text-[#3E325F] text-center">
                {editingCourse ? 'Edit Course' : 'Add New Course'}
              </h3>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6 pt-4">
              {/* Form Fields Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                {/* Course Name */}
                <div>
                  <label className="block text-sm font-semibold text-[#3E325F] mb-2">
                    Course Name
                  </label>
                  <input
                    type="text"
                    value={newCourse.name}
                    onChange={(e) => setNewCourse({...newCourse, name: e.target.value})}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#8168C5] focus:border-[#8168C5] transition-all duration-200"
                    placeholder="Enter course name"
                    required
                  />
                </div>
                
                {/* Course Code */}
                <div>
                  <label className="block text-sm font-semibold text-[#3E325F] mb-2">
                    Course Code
                  </label>
                  <input
                    type="text"
                    value={newCourse.code}
                    onChange={(e) => setNewCourse({...newCourse, code: e.target.value})}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#8168C5] focus:border-[#8168C5] transition-all duration-200"
                    placeholder="e.g., CTSYSINL"
                    required
                  />
                </div>
                
                {/* Credit Hours */}
                <div>
                  <label className="block text-sm font-semibold text-[#3E325F] mb-2">
                    Credit Hours
                  </label>
                  <input
                    type="number"
                    value={newCourse.creditHours}
                    onChange={(e) => setNewCourse({...newCourse, creditHours: parseInt(e.target.value) || 3})}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#8168C5] focus:border-[#8168C5] transition-all duration-200"
                    min="1"
                    max="6"
                  />
                </div>
                
                {/* Semester */}
                <div>
                  <label className="block text-sm font-semibold text-[#3E325F] mb-2">
                    Semester
                  </label>
                  <input
                    type="text"
                    value={newCourse.semester}
                    onChange={(e) => setNewCourse({...newCourse, semester: e.target.value})}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#8168C5] focus:border-[#8168C5] transition-all duration-200"
                    placeholder="e.g., Fall 2024"
                  />
                </div>
                
                {/* Target Grade */}
                <div>
                  <label className="block text-sm font-semibold text-[#3E325F] mb-2">
                    Target Grade
                  </label>
                  <input
                    type="text"
                    value={newCourse.targetGrade}
                    onChange={(e) => setNewCourse({...newCourse, targetGrade: e.target.value})}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#8168C5] focus:border-[#8168C5] transition-all duration-200"
                    placeholder="e.g., 90%, 3.5"
                  />
                </div>
                
                {/* Grading Scale */}
                <div>
                  <label className="block text-sm font-semibold text-[#3E325F] mb-2">
                    Grading Scale
                  </label>
                  <select
                    value={newCourse.gradingScale}
                    onChange={(e) => setNewCourse({...newCourse, gradingScale: e.target.value})}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#8168C5] focus:border-[#8168C5] transition-all duration-200 appearance-none cursor-pointer"
                    style={{backgroundImage: 'url("data:image/svg+xml,%3csvg xmlns=\'http://www.w3.org/2000/svg\' fill=\'none\' viewBox=\'0 0 20 20\'%3e%3cpath stroke=\'%236b7280\' stroke-width=\'1.5\' d=\'m6 8 4 4 4-4\'/%3e%3c/svg%3e")', backgroundPosition: 'right 12px center', backgroundRepeat: 'no-repeat', backgroundSize: '16px'}}
                  >
                    <option value={GRADING_SCALES.PERCENTAGE}>Percentage</option>
                    <option value={GRADING_SCALES.GPA}>GPA (4.0 scale)</option>
                    <option value={GRADING_SCALES.POINTS}>Points</option>
                  </select>
                </div>

                {/* Term System */}
                <div>
                  <label className="block text-sm font-semibold text-[#3E325F] mb-2">
                    Term System
                  </label>
                  <select
                    value={newCourse.termSystem}
                    onChange={(e) => setNewCourse({...newCourse, termSystem: e.target.value})}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#8168C5] focus:border-[#8168C5] transition-all duration-200 appearance-none cursor-pointer"
                    style={{backgroundImage: 'url("data:image/svg+xml,%3csvg xmlns=\'http://www.w3.org/2000/svg\' fill=\'none\' viewBox=\'0 0 20 20\'%3e%3cpath stroke=\'%236b7280\' stroke-width=\'1.5\' d=\'m6 8 4 4 4-4\'/%3e%3c/svg%3e")', backgroundPosition: 'right 12px center', backgroundRepeat: 'no-repeat', backgroundSize: '16px'}}
                  >
                    <option value="3-term">3 Terms (First, Mid, Final)</option>
                    <option value="2-term">2 Terms (Mid, Final)</option>
                  </select>
                </div>

                {/* GPA Scale */}
                <div>
                  <label className="block text-sm font-semibold text-[#3E325F] mb-2">
                    GPA Scale
                  </label>
                  <select
                    value={newCourse.gpaScale}
                    onChange={(e) => setNewCourse({...newCourse, gpaScale: e.target.value})}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#8168C5] focus:border-[#8168C5] transition-all duration-200 appearance-none cursor-pointer"
                    style={{backgroundImage: 'url("data:image/svg+xml,%3csvg xmlns=\'http://www.w3.org/2000/svg\' fill=\'none\' viewBox=\'0 0 20 20\'%3e%3cpath stroke=\'%236b7280\' stroke-width=\'1.5\' d=\'m6 8 4 4 4-4\'/%3e%3c/svg%3e")', backgroundPosition: 'right 12px center', backgroundRepeat: 'no-repeat', backgroundSize: '16px'}}
                  >
                    <option value="4.0">Standard 4.0 (1.0 = F, 4.0 = A)</option>
                    <option value="5.0">Standard 5.0 (1.0 = F, 5.0 = A)</option>
                    <option value="inverted-4.0">Inverted 4.0 (4.0 = F, 1.0 = A)</option>
                    <option value="inverted-5.0">Inverted 5.0 (5.0 = F, 1.0 = A)</option>
                  </select>
                </div>
                
                {/* Max Points */}
                <div>
                  <label className="block text-sm font-semibold text-[#3E325F] mb-2">
                    Max Points
                  </label>
                  <input
                    type="number"
                    value={newCourse.maxPoints}
                    onChange={(e) => setNewCourse({...newCourse, maxPoints: parseInt(e.target.value) || 100})}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#8168C5] focus:border-[#8168C5] transition-all duration-200"
                    min="1"
                  />
                </div>
                
                {/* Handle Missing Grades */}
                <div>
                  <label className="block text-sm font-semibold text-[#3E325F] mb-2">
                    Handle Missing Grades
                  </label>
                  <select
                    value={newCourse.handleMissing}
                    onChange={(e) => setNewCourse({...newCourse, handleMissing: e.target.value})}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#8168C5] focus:border-[#8168C5] transition-all duration-200 appearance-none cursor-pointer"
                    style={{backgroundImage: 'url("data:image/svg+xml,%3csvg xmlns=\'http://www.w3.org/2000/svg\' fill=\'none\' viewBox=\'0 0 20 20\'%3e%3cpath stroke=\'%236b7280\' stroke-width=\'1.5\' d=\'m6 8 4 4 4-4\'/%3e%3c/svg%3e")', backgroundPosition: 'right 12px center', backgroundRepeat: 'no-repeat', backgroundSize: '16px'}}
                  >
                    <option value="exclude">Exclude from calculation</option>
                    <option value="zero">Treat as zero</option>
                  </select>
                </div>
              </div>

              {/* Categories Section */}
              <div className="mb-8">
                <div className="flex justify-between items-center mb-4">
                  <label className="block text-lg font-semibold text-[#3E325F]">
                    Categories
                  </label>
                  <div className="flex gap-3">
                    <button
                      type="button"
                      onClick={addPredefinedCategories}
                      className="px-4 py-2 text-green-600 hover:text-green-700 text-sm font-medium border border-green-300 hover:border-green-400 rounded-lg hover:bg-green-50 transition-all duration-200"
                    >
                      Use {newCourse.termSystem === '3-term' ? '3-Term' : '2-Term'} Template
                    </button>
                    <button
                      type="button"
                      onClick={addCategory}
                      className="px-4 py-2 text-[#8168C5] hover:text-[#3E325F] text-sm font-semibold hover:bg-[#8168C5]/10 rounded-lg transition-all duration-200 flex items-center gap-2"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                      </svg>
                      Add Category
                    </button>
                  </div>
                </div>
                
                {newCourse.categories.map((category, index) => (
                  <div key={category.id} className="flex gap-3 mb-3">
                    <input
                      type="text"
                      placeholder="Category name"
                      value={category.name}
                      onChange={(e) => updateCategory(index, 'name', e.target.value)}
                      className="flex-1 px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#8168C5] focus:border-[#8168C5] transition-all duration-200"
                      required
                    />
                    <input
                      type="number"
                      placeholder="Weight %"
                      value={category.weight}
                      onChange={(e) => updateCategory(index, 'weight', parseFloat(e.target.value) || 0)}
                      className="w-32 px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#8168C5] focus:border-[#8168C5] transition-all duration-200"
                      min="0"
                      max="100"
                      step="0.1"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => removeCategory(index)}
                      className="w-12 h-12 bg-red-50 hover:bg-red-100 text-red-600 hover:text-red-700 rounded-xl border border-red-200 hover:border-red-300 flex items-center justify-center transition-all duration-200 hover:scale-105"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                ))}
              </div>

              {/* Action Buttons */}
              <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
                <button
                  type="button"
                  onClick={cancelEdit}
                  className="px-6 py-3 text-[#3E325F] border border-gray-300 rounded-xl hover:bg-gray-50 hover:border-gray-400 transition-all duration-200 font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-8 py-3 bg-gradient-to-r from-[#8168C5] to-[#3E325F] text-white rounded-xl hover:shadow-lg hover:scale-105 transition-all duration-200 font-semibold shadow-md"
                >
                  {editingCourse ? 'Update Course' : 'Add Course'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default CourseManager;
