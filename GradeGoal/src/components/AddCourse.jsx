import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { GRADING_SCALES } from '../utils/gradeCalculations';
import { 
  createCourse, 
  updateCourse, 
  addCategoryToCourse
} from '../backend/api';
import { getAllColors } from '../utils/courseColors';

/**
 * AddCourse Component
 * 
 * A modal component for adding new courses or editing existing ones.
 * Handles course creation, editing, category management, and form validation.
 * 
 * @param {boolean} isOpen - Controls whether the modal is visible
 * @param {Function} onClose - Callback to close the modal
 * @param {Function} onCourseCreated - Callback when a course is successfully created/updated
 * @param {Object} editingCourse - Course object to edit (null for new course)
 * @param {Array} existingCourses - Array of existing courses for validation
 */
function AddCourse({ 
  isOpen, 
  onClose, 
  onCourseCreated, 
  editingCourse = null, 
  existingCourses = [] 
}) {
  const { currentUser } = useAuth();
  
  // State for managing the course form data
  const [newCourse, setNewCourse] = useState({
    name: '',
    courseCode: '',
    units: 3, // Course units (e.g., 3 units)
    creditHours: 3, // Credit hours for GPA calculations
    semester: '',
    targetGrade: '',
    gradingScale: GRADING_SCALES.PERCENTAGE,
    maxPoints: 100,
    handleMissing: 'exclude',
    termSystem: '3-term', // '2-term' or '3-term'
    gpaScale: '4.0', // '4.0', '5.0', 'inverted-4.0', 'inverted-5.0'
    colorIndex: 0, // Default to first color
    categories: []
  });

  /**
   * Initialize form with editing course data if provided
   * Resets form when switching between add/edit modes
   */
  useEffect(() => {
    if (editingCourse) {
      // Populate form with existing course data for editing
      setNewCourse({
        name: editingCourse.name || '',
        courseCode: editingCourse.courseCode || '',
        units: editingCourse.units || 3,
        creditHours: editingCourse.creditHours || 3,
        semester: editingCourse.semester || '',
        targetGrade: editingCourse.targetGrade || '',
        gradingScale: editingCourse.gradingScale || GRADING_SCALES.PERCENTAGE,
        maxPoints: editingCourse.maxPoints || 100,
        handleMissing: editingCourse.handleMissing || 'exclude',
        termSystem: editingCourse.termSystem || '3-term',
        gpaScale: editingCourse.gpaScale || '4.0',
        colorIndex: editingCourse.colorIndex !== undefined ? editingCourse.colorIndex : 0,
        categories: editingCourse.categories || []
      });
    } else {
      // Reset form for new course creation
      setNewCourse({
        name: '',
        courseCode: '',
        units: 3,
        creditHours: 3,
        semester: '',
        targetGrade: '',
        gradingScale: GRADING_SCALES.PERCENTAGE,
        maxPoints: 100,
        handleMissing: 'exclude',
        termSystem: '3-term',
        gpaScale: '4.0',
        colorIndex: 0,
        categories: []
      });
    }
  }, [editingCourse, isOpen]);

  /**
   * Adds a new empty category to the course
   */
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

  /**
   * Adds predefined category templates based on the selected term system
   * 3-term: Assignments (30%), Quizzes (30%), Exam (40%)
   * 2-term: Exam (40%), Laboratory Activity (60%)
   */
  const addPredefinedCategories = () => {
    let predefinedCategories;
    
    if (newCourse.termSystem === '3-term') {
      predefinedCategories = [
        { id: Date.now(), name: 'Assignments', weight: 30, gradingScale: newCourse.gradingScale, grades: [] },
        { id: Date.now() + 1, name: 'Quizzes', weight: 30, gradingScale: newCourse.gradingScale, grades: [] },
        { id: Date.now() + 2, name: 'Exam', weight: 40, gradingScale: newCourse.gradingScale, grades: [] }
      ];
    } else {
      predefinedCategories = [
        { id: Date.now(), name: 'Exam', weight: 40, gradingScale: newCourse.gradingScale, grades: [] },
        { id: Date.now() + 1, name: 'Laboratory Activity', weight: 60, gradingScale: newCourse.gradingScale, grades: [] }
      ];
    }
    
    setNewCourse({
      ...newCourse,
      categories: predefinedCategories
    });
  };

  /**
   * Updates a specific field in a category at the given index
   * @param {number} index - Index of the category to update
   * @param {string} field - Field name to update
   * @param {any} value - New value for the field
   */
  const updateCategory = (index, field, value) => {
    const updatedCategories = [...newCourse.categories];
    updatedCategories[index] = { ...updatedCategories[index], [field]: value };
    setNewCourse({ ...newCourse, categories: updatedCategories });
  };

  /**
   * Removes a category at the specified index
   * @param {number} index - Index of the category to remove
   */
  const removeCategory = (index) => {
    const updatedCategories = newCourse.categories.filter((_, i) => i !== index);
    setNewCourse({ ...newCourse, categories: updatedCategories });
  };

  /**
   * Validates the course form data
   * @returns {string|null} Error message if validation fails, null if successful
   */
  const validateCourse = () => {
    if (!newCourse.name.trim()) return 'Course name is required';
    if (newCourse.categories.length === 0) return 'At least one category is required';
    
    const totalWeight = newCourse.categories.reduce((sum, cat) => sum + (parseFloat(cat.weight) || 0), 0);
    if (Math.abs(totalWeight - 100) > 0.01) {
      return `Total weight must equal 100% (current: ${totalWeight.toFixed(1)}%)`;
    }
    
    return null;
  };

  /**
   * Handles form submission for creating or updating a course
   * @param {Event} e - Form submission event
   */
  const handleSubmit = async (e) => {
    e.preventDefault();
    const error = validateCourse();
    if (error) {
      alert(error);
      return;
    }

    try {
      // Prepare course data for API call
      const courseData = {
        uid: currentUser.uid,
        name: newCourse.name,
        courseCode: newCourse.courseCode,
        units: newCourse.units,
        creditHours: newCourse.creditHours,
        gradingScale: newCourse.gradingScale,
        maxPoints: newCourse.maxPoints,
        gpaScale: newCourse.gpaScale,
        termSystem: newCourse.termSystem,
        targetGrade: newCourse.targetGrade,
        colorIndex: newCourse.colorIndex
      };

      let createdCourse;
      if (editingCourse) {
        // Update existing course
        const updateData = {
          ...courseData,
          id: editingCourse.id
        };
        createdCourse = await updateCourse(editingCourse.id, updateData);
        
        // Debug: Log what the API returned
        console.log('API Response for updated course:', createdCourse);
        console.log('Existing course data:', editingCourse);
      } else {
        // Create new course
        createdCourse = await createCourse(courseData);
        
        // Create predefined categories for the new course
        if (newCourse.categories.length > 0) {
          try {
            const createdCategories = [];
            for (const category of newCourse.categories) {
              // Only send essential category data, avoid circular references
              const categoryData = {
                name: category.name || '',
                weight: parseFloat(category.weight) || 0
              };
              
              const createdCategory = await addCategoryToCourse(createdCourse.id, categoryData);
              createdCategories.push(createdCategory);
            }
            
            // Add the created categories to the course object
            createdCourse.categories = createdCategories;
          } catch (categoryError) {
            console.error('Failed to create some categories:', categoryError);
            // Continue with course creation even if categories fail
            createdCourse.categories = [];
          }
        } else {
          createdCourse.categories = [];
        }
      }

      // Update parent component with new courses
      let updatedCourses;
      if (editingCourse) {
        // Merge the updated course data with existing course data to preserve categories, grades, etc.
        updatedCourses = existingCourses.map(course => {
          if (course.id === editingCourse.id) {
            // Merge updated data with existing data to preserve all necessary fields
            return {
              ...course,                    // Keep existing data (categories, grades, etc.)
              ...createdCourse,            // Override with updated fields (units, creditHours, etc.)
              categories: course.categories || [], // Ensure categories are preserved
              updatedAt: new Date().toISOString(), // Update timestamp
              // Preserve any other fields that might be needed for display
              semester: course.semester || newCourse.semester,
              handleMissing: course.handleMissing || newCourse.handleMissing
            };
          }
          return course;
        });
        
        // Debug: Log the merged course data
        const mergedCourse = updatedCourses.find(c => c.id === editingCourse.id);
        console.log('Final merged course data:', mergedCourse);
      } else {
        // Add the new course to the array
        updatedCourses = [...existingCourses, createdCourse];
      }
      
      // Call the callback with updated courses
      if (onCourseCreated) {
        onCourseCreated(updatedCourses);
      }
      
      // Reset form and close modal
      setNewCourse({
        name: '',
        courseCode: '',
        units: 3,
        creditHours: 3,
        semester: '',
        targetGrade: '',
        gradingScale: GRADING_SCALES.PERCENTAGE,
        maxPoints: 100,
        handleMissing: 'exclude',
        termSystem: '3-term',
        gpaScale: '4.0',
        colorIndex: 0,
        categories: []
      });
      onClose();
    } catch (error) {
      console.error('Failed to save course:', error);
      alert('Failed to save course. Please try again.');
    }
  };

  /**
   * Closes the modal and resets the form
   */
  const cancelEdit = () => {
    onClose();
  };

  // Don't render if modal is not open
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        {/* Modal Header */}
        <div className="bg-gradient-to-r from-[#8168C5] to-[#3E325F] p-6 pb-4 rounded-t-2xl">
          <h3 className="text-2xl font-bold text-white text-center">
            {editingCourse ? 'Edit Course' : 'Add New Course'}
          </h3>
        </div>
        
        {/* Course Form */}
        <form onSubmit={handleSubmit} className="p-6 pt-4">
          {/* Form Fields Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            {/* Course Name Field */}
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
            
            {/* Course Code Field */}
            <div>
              <label className="block text-sm font-semibold text-[#3E325F] mb-2">
                Course Code
              </label>
              <input
                type="text"
                value={newCourse.courseCode}
                onChange={(e) => setNewCourse({...newCourse, courseCode: e.target.value})}
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#8168C5] focus:border-[#8168C5] transition-all duration-200"
                placeholder="e.g., CTSYSINL"
                required
              />
            </div>
            
            {/* Units Field */}
            <div>
              <label className="block text-sm font-semibold text-[#3E325F] mb-2">
                Units
              </label>
              <input
                type="number"
                value={newCourse.units}
                onChange={(e) => setNewCourse({...newCourse, units: parseInt(e.target.value) || 3})}
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#8168C5] focus:border-[#8168C5] transition-all duration-200"
                min="1"
                max="6"
                placeholder="e.g., 3"
              />
              <p className="text-xs text-gray-500 mt-1">Course load or academic units</p>
            </div>
            
            {/* Credit Hours Field */}
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
                placeholder="e.g., 3"
              />
              <p className="text-xs text-gray-500 mt-1">Used for GPA calculations and academic credit</p>
            </div>
            
            {/* Semester Field */}
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
            
            {/* Target Grade Field */}
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
            
            {/* Max Points Field */}
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
                placeholder="e.g., 100"
              />
              <p className="text-xs text-gray-500 mt-1">Maximum points for points-based grading</p>
            </div>
            
            {/* Grading Scale Field */}
            <div>
              <label className="block text-sm font-semibold text-[#3E325F] mb-2">
                Grading Scale
              </label>
              <select
                value={newCourse.gradingScale}
                onChange={(e) => setNewCourse({...newCourse, gradingScale: e.target.value})}
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#8168C5] focus:border-[#8168C5] transition-all duration-200 appearance-none cursor-pointer"
                style={{backgroundImage: 'url("data:image/svg+xml,%3csvg xmlns=\'http://www.w3.org/2000/svg\' fill=\'none\' viewBox=\'0 0 20 20\'%3e%3cpath stroke=\'%236b7280\' stroke-width=\'1.5\' d=\'m6 8 4 4 4-4\'/%3e%3csvg%3e")', backgroundPosition: 'right 12px center', backgroundRepeat: 'no-repeat', backgroundSize: '16px'}}
              >
                <option value={GRADING_SCALES.PERCENTAGE}>Percentage</option>
                <option value={GRADING_SCALES.POINTS}>Points</option>
              </select>
            </div>

            {/* Category System Field */}
            <div>
              <label className="block text-sm font-semibold text-[#3E325F] mb-2">
                Category System
              </label>
              <select
                value={newCourse.termSystem}
                onChange={(e) => setNewCourse({...newCourse, termSystem: e.target.value})}
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#8168C5] focus:border-[#8168C5] transition-all duration-200 appearance-none cursor-pointer"
                style={{backgroundImage: 'url("data:image/svg+xml,%3csvg xmlns=\'http://www.w3.org/2000/svg\' fill=\'none\' viewBox=\'0 0 20 20\'%3e%3cpath stroke=\'%236b7280\' stroke-width=\'1.5\' d=\'m6 8 4 4 4-4\'/%3e%3csvg%3e")', backgroundPosition: 'right 12px center', backgroundRepeat: 'no-repeat', backgroundSize: '16px'}}
              >
                <option value="3-term">3 Categories (Assignments, Quizzes, Exam)</option>
                <option value="2-term">2 Categories (Exam, Laboratory Activity)</option>
              </select>
            </div>

            {/* GPA Scale Field */}
            <div>
              <label className="block text-sm font-semibold text-[#3E325F] mb-2">
                GPA Scale
              </label>
              <select
                value={newCourse.gpaScale}
                onChange={(e) => setNewCourse({...newCourse, gpaScale: e.target.value})}
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#8168C5] focus:border-[#8168C5] transition-all duration-200 appearance-none cursor-pointer"
                style={{backgroundImage: 'url("data:image/svg+xml,%3csvg xmlns=\'http://www.w3.org/2000/svg\' fill=\'none\' viewBox=\'0 0 20 20\'%3e%3cpath stroke=\'%236b7280\' stroke-width=\'1.5\' d=\'m6 8 4 4 4-4\'/%3e%3csvg%3e")', backgroundPosition: 'right 12px center', backgroundRepeat: 'no-repeat', backgroundSize: '16px'}}
              >
                <option value="4.0">Standard 4.0 (1.0 = F, 4.0 = A)</option>
                <option value="5.0">Standard 5.0 (1.0 = F, 5.0 = A)</option>
                <option value="inverted-4.0">Inverted 4.0 (4.0 = F, 1.0 = A)</option>
                <option value="inverted-5.0">Inverted 5.0 (5.0 = F, 1.0 = A)</option>
              </select>
            </div>
            
            {/* Handle Missing Grades Field */}
            <div>
              <label className="block text-sm font-semibold text-[#3E325F] mb-2">
                Handle Missing Grades
              </label>
              <select
                value={newCourse.handleMissing}
                onChange={(e) => setNewCourse({...newCourse, handleMissing: e.target.value})}
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#8168C5] focus:border-[#8168C5] transition-all duration-200 appearance-none cursor-pointer"
                style={{backgroundImage: 'url("data:image/svg+xml,%3csvg xmlns=\'http://www.w3.org/2000/svg\' fill=\'none\' viewBox=\'0 0 20 20\'%3e%3cpath stroke=\'%236b7280\' stroke-width=\'1.5\' d=\'m6 8 4 4 4-4\'/%3e%3csvg%3e")', backgroundPosition: 'right 12px center', backgroundRepeat: 'no-repeat', backgroundSize: '16px'}}
              >
                <option value="exclude">Exclude from calculation</option>
                <option value="zero">Treat as zero</option>
              </select>
              <p className="text-xs text-gray-500 mt-1">How to handle missing or incomplete grades</p>
            </div>

            {/* Course Color Field */}
            <div>
              <label className="block text-sm font-semibold text-[#3E325F] mb-2">
                Course Color
              </label>
              <div className="grid grid-cols-5 gap-2">
                {getAllColors().map((colorOption) => (
                  <button
                    key={colorOption.index}
                    type="button"
                    onClick={() => setNewCourse({...newCourse, colorIndex: colorOption.index})}
                    className={`w-full h-12 rounded-lg border-2 transition-all duration-200 flex items-center justify-center ${
                      newCourse.colorIndex === colorOption.index
                        ? `${colorOption.primary} border-white shadow-lg`
                        : `${colorOption.secondary} border-gray-200 hover:border-gray-300`
                    }`}
                    title={colorOption.name}
                  >
                    {newCourse.colorIndex === colorOption.index && (
                      <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    )}
                  </button>
                ))}
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Selected: {getAllColors()[newCourse.colorIndex]?.name || 'Green'}
              </p>
            </div>
          </div>

          {/* Categories Section */}
          <div className="mb-8">
            <div className="flex justify-between items-center mb-4">
              <label className="block text-lg font-semibold text-[#3E325F]">
                Categories
              </label>
              <div className="flex gap-3">
                {/* Use Template Button */}
                <button
                  type="button"
                  onClick={addPredefinedCategories}
                  className="px-4 py-2 text-green-600 hover:text-green-700 text-sm font-medium border border-green-300 hover:border-green-400 rounded-lg hover:bg-green-50 transition-all duration-200"
                >
                  Use {newCourse.termSystem === '3-term' ? '3-Category' : '2-Category'} Template
                </button>
                
                {/* Add Category Button */}
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
            
            {/* Category List */}
            {newCourse.categories.map((category, index) => (
              <div key={category.id} className="flex gap-3 mb-3">
                {/* Category Name Input */}
                <input
                  type="text"
                  placeholder="Category name"
                  value={category.name}
                  onChange={(e) => updateCategory(index, 'name', e.target.value)}
                  className="flex-1 px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#8168C5] focus:border-[#8168C5] transition-all duration-200"
                  required
                />
                
                {/* Category Weight Input */}
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
                
                {/* Remove Category Button */}
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
            {/* Cancel Button */}
            <button
              type="button"
              onClick={cancelEdit}
              className="px-6 py-3 text-[#3E325F] border border-gray-300 rounded-xl hover:bg-gray-50 hover:border-gray-400 transition-all duration-200 font-medium"
            >
              Cancel
            </button>
            
            {/* Submit Button */}
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
  );
}

export default AddCourse;
