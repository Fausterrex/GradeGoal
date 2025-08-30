import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { GRADING_SCALES } from '../utils/gradeCalculations';
import { 
  getCoursesByUid, 
  createCourse, 
  updateCourse, 
  deleteCourse as deleteCourseApi,
  addCategoryToCourse
} from '../backend/api';

function CourseManager({ onCourseUpdate, onCourseSelect = () => {} }) {
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
    <div className="w-full max-w-4xl mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Course Manager</h2>
        <button
          onClick={() => setShowAddCourse(true)}
          className="bg-[#3B389f] text-white px-4 py-2 rounded-lg hover:bg-[#2d2a7a] transition-colors"
        >
          Add Course
        </button>
      </div>

      {/* Course List */}
      <div className="grid gap-4 mb-6">
        {courses.map(course => (
          <div key={course.id} className="bg-white p-4 rounded-lg shadow border">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="text-lg font-semibold text-gray-800">{course.name}</h3>
                <p className="text-sm text-gray-600">
                  Code: {course.code} | Credits: {course.creditHours} | Semester: {course.semester}
                </p>
                <p className="text-sm text-gray-600">
                  Scale: {course.gradingScale} | Max Points: {course.maxPoints} | 
                  Missing: {course.handleMissing}
                </p>
                <p className="text-sm text-gray-600">
                  Term System: {course.termSystem || '3-term'} | GPA Scale: {course.gpaScale || '4.0'}
                </p>
                {course.targetGrade && (
                  <p className="text-sm text-gray-600">
                    Target Grade: <span className="font-medium">{course.targetGrade}</span>
                  </p>
                )}
                <div className="mt-2">
                  <p className="text-sm text-gray-600">Categories:</p>
                  <div className="flex flex-wrap gap-2 mt-1">
                    {course.categories.map(cat => (
                      <span key={cat.id} className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded">
                        {cat.name} ({cat.weight}%)
                      </span>
                    ))}
                  </div>
                </div>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => onCourseSelect && onCourseSelect(course)}
                  className="bg-[#3B389f] text-white px-3 py-1 rounded text-sm hover:bg-[#2d2a7a] transition-colors"
                >
                  View Grades
                </button>
                <button
                  onClick={() => editCourse(course)}
                  className="text-blue-600 hover:text-blue-800 text-sm"
                >
                  Edit
                </button>
                <button
                  onClick={() => deleteCourse(course.id)}
                  className="text-red-600 hover:text-red-800 text-sm"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Add/Edit Course Form */}
      {showAddCourse && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <h3 className="text-xl font-bold mb-4">
              {editingCourse ? 'Edit Course' : 'Add New Course'}
            </h3>
            
            <form onSubmit={handleSubmit}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Course Name
                  </label>
                  <input
                    type="text"
                    value={newCourse.name}
                    onChange={(e) => setNewCourse({...newCourse, name: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#3B389f]"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Course Code
                  </label>
                  <input
                    type="text"
                    value={newCourse.code}
                    onChange={(e) => setNewCourse({...newCourse, code: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#3B389f]"
                    placeholder="e.g., MATH101"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Credit Hours
                  </label>
                  <input
                    type="number"
                    value={newCourse.creditHours}
                    onChange={(e) => setNewCourse({...newCourse, creditHours: parseInt(e.target.value) || 3})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#3B389f]"
                    min="1"
                    max="6"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Semester
                  </label>
                  <input
                    type="text"
                    value={newCourse.semester}
                    onChange={(e) => setNewCourse({...newCourse, semester: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#3B389f]"
                    placeholder="e.g., Fall 2024"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Target Grade
                  </label>
                  <input
                    type="text"
                    value={newCourse.targetGrade}
                    onChange={(e) => setNewCourse({...newCourse, targetGrade: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#3B389f]"
                    placeholder="e.g. 90%, 3.5"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Grading Scale
                  </label>
                  <select
                    value={newCourse.gradingScale}
                    onChange={(e) => setNewCourse({...newCourse, gradingScale: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#3B389f]"
                  >
                    <option value={GRADING_SCALES.PERCENTAGE}>Percentage</option>
                    <option value={GRADING_SCALES.GPA}>GPA (4.0 scale)</option>
                    <option value={GRADING_SCALES.POINTS}>Points</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Term System
                  </label>
                  <select
                    value={newCourse.termSystem}
                    onChange={(e) => setNewCourse({...newCourse, termSystem: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#3B389f]"
                  >
                    <option value="3-term">3 Terms (First, Mid, Final)</option>
                    <option value="2-term">2 Terms (Mid, Final)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    GPA Scale
                  </label>
                  <select
                    value={newCourse.gpaScale}
                    onChange={(e) => setNewCourse({...newCourse, gpaScale: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#3B389f]"
                  >
                    <option value="4.0">Standard 4.0 (1.0 = F, 4.0 = A)</option>
                    <option value="5.0">Standard 5.0 (1.0 = F, 5.0 = A)</option>
                    <option value="inverted-4.0">Inverted 4.0 (4.0 = F, 1.0 = A)</option>
                    <option value="inverted-5.0">Inverted 5.0 (5.0 = F, 1.0 = A)</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Max Points
                  </label>
                  <input
                    type="number"
                    value={newCourse.maxPoints}
                    onChange={(e) => setNewCourse({...newCourse, maxPoints: parseInt(e.target.value) || 100})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#3B389f]"
                    min="1"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Handle Missing Grades
                  </label>
                  <select
                    value={newCourse.handleMissing}
                    onChange={(e) => setNewCourse({...newCourse, handleMissing: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#3B389f]"
                  >
                    <option value="exclude">Exclude from calculation</option>
                    <option value="zero">Treat as zero</option>
                  </select>
                </div>
              </div>

              {/* Categories */}
              <div className="mb-4">
                <div className="flex justify-between items-center mb-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Categories
                  </label>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={addPredefinedCategories}
                      className="text-green-600 hover:text-green-800 text-sm border border-green-300 px-2 py-1 rounded"
                    >
                      Use {newCourse.termSystem === '3-term' ? '3-Term' : '2-Term'} Template
                    </button>
                    <button
                      type="button"
                      onClick={addCategory}
                      className="text-[#3B389f] hover:text-[#2d2a7a] text-sm"
                    >
                      + Add Category
                    </button>
                  </div>
                </div>
                
                {newCourse.categories.map((category, index) => (
                  <div key={category.id} className="flex gap-2 mb-2">
                    <input
                      type="text"
                      placeholder="Category name"
                      value={category.name}
                      onChange={(e) => updateCategory(index, 'name', e.target.value)}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#3B389f]"
                      required
                    />
                    <input
                      type="number"
                      placeholder="Weight %"
                      value={category.weight}
                      onChange={(e) => updateCategory(index, 'weight', parseFloat(e.target.value) || 0)}
                      className="w-24 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#3B389f]"
                      min="0"
                      max="100"
                      step="0.1"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => removeCategory(index)}
                      className="text-red-600 hover:text-red-800 px-2"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>

              <div className="flex justify-end gap-2">
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
