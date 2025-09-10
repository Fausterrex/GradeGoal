// ========================================
// ADD COURSE COMPONENT
// ========================================
// This component handles adding new courses and editing existing ones
// Features: Course form, validation, color selection, academic year/semester dropdowns

import React, { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import { GRADING_SCALES } from "../../utils/gradeCalculations";
import {
  createCourse,
  updateCourse,
  getCourseById,
  addCategoryToCourse,
  getAssessmentCategoriesByCourseId,
  deleteAssessmentCategory,
  updateAssessmentCategory,
} from "../../backend/api";
import { getAllColors } from "../../utils/courseColors";

function AddCourse({
  isOpen,
  onClose,
  onCourseCreated,
  editingCourse = null,
  existingCourses = [],
  courseColorScheme = null,
}) {
  const { currentUser } = useAuth();

  // ========================================
  // STATE MANAGEMENT
  // ========================================
  const [isFormLoading, setIsFormLoading] = useState(false);
  const [hasGrades, setHasGrades] = useState(false);
  const [isHistoricalData, setIsHistoricalData] = useState(false);

  // ========================================
  // COURSE FORM DATA
  // ========================================
  const [newCourse, setNewCourse] = useState({
    name: "",
    courseCode: "",
    units: 3,
    creditHours: 6,
    semester: "FIRST",
    academicYear: new Date().getFullYear().toString(),
    gradingScale: GRADING_SCALES.PERCENTAGE,
    maxPoints: 100,
    handleMissing: "exclude",
    categorySystem: "3-categories",
    gpaScale: "4.0",
    colorIndex: 0,
    categories: [],
  });

  useEffect(() => {
    if (editingCourse) {
      setIsFormLoading(true);

      const newCourseData = {
        name: editingCourse.name || "",
        courseCode: editingCourse.courseCode || "",
        units: editingCourse.units ? parseInt(editingCourse.units) : 3,
        creditHours: editingCourse.creditHours
          ? parseInt(editingCourse.creditHours)
          : 3,
        semester: editingCourse.semester || "FIRST",
        academicYear:
          editingCourse.academicYear || new Date().getFullYear().toString(),
        gradingScale: editingCourse.gradingScale || GRADING_SCALES.PERCENTAGE,
        maxPoints: editingCourse.maxPoints || 100,
        handleMissing: editingCourse.handleMissing || "exclude",
        categorySystem: editingCourse.categorySystem || "3-categories",
        gpaScale: editingCourse.gpaScale || "4.0",
        colorIndex:
          editingCourse.colorIndex !== undefined ? editingCourse.colorIndex : 0,
        categories: editingCourse.categories || [],
      };

      setNewCourse(newCourseData);

      setTimeout(() => setIsFormLoading(false), 100);
    } else {
      setNewCourse({
        name: "",
        courseCode: "",
        units: 3,
        creditHours: 3,
        semester: "FIRST",
        academicYear: new Date().getFullYear().toString(),
        gradingScale: GRADING_SCALES.PERCENTAGE,
        maxPoints: 100,
        handleMissing: "exclude",
        categorySystem: "3-categories",
        gpaScale: "4.0",
        colorIndex: 0,
        categories: [],
      });
      setIsFormLoading(false);
    }
  }, [editingCourse, isOpen]);

  useEffect(() => {
    const loadExistingCategories = async () => {
      if (editingCourse && editingCourse.id) {
        try {
          const categories = await getAssessmentCategoriesByCourseId(
            editingCourse.id
          );

          const transformedCategories = categories.map((cat) => ({
            id: cat.id || cat.categoryId,
            name: cat.name || cat.categoryName || "",
            weight: cat.weight || cat.weightPercentage || 0,
          }));

          setNewCourse((prev) => {
            const updated = {
              ...prev,
              categories: transformedCategories || [],
            };
            return updated;
          });
        } catch (error) {}
      }
    };

    const checkForExistingGrades = async () => {
      if (editingCourse && editingCourse.id) {
        try {
          // Import the getGradesByCourseId function
          const { getGradesByCourseId } = await import("../../backend/api");
          const grades = await getGradesByCourseId(editingCourse.id);

          // Check if there are any grades
          const hasAnyGrades = grades && grades.length > 0;
          setHasGrades(hasAnyGrades);
        } catch (error) {
          console.error("Error checking for grades:", error);
          setHasGrades(false);
        }
      } else {
        setHasGrades(false);
      }
    };

    const checkIfHistoricalData = () => {
      if (editingCourse && editingCourse.academicYear) {
        const currentYear = new Date().getFullYear().toString();
        const courseYear = editingCourse.academicYear;

        // Consider it historical if it's from a previous year
        const isHistorical = courseYear < currentYear;
        setIsHistoricalData(isHistorical);
      } else {
        setIsHistoricalData(false);
      }
    };

    loadExistingCategories();
    checkForExistingGrades();
    checkIfHistoricalData();
  }, [editingCourse?.id]);

  const addCategory = () => {
    const category = {
      id: Date.now(),
      name: "",
      weight: 0,
      gradingScale: newCourse.gradingScale,
      grades: [],
    };
    setNewCourse({
      ...newCourse,
      categories: [...newCourse.categories, category],
    });
  };

  const addPredefinedCategories = () => {
    let predefinedCategories;

    if (newCourse.categorySystem === "3-categories") {
      predefinedCategories = [
        {
          id: Date.now(),
          name: "Assignments",
          weight: 30,
          gradingScale: newCourse.gradingScale,
          grades: [],
        },
        {
          id: Date.now() + 1,
          name: "Quizzes",
          weight: 30,
          gradingScale: newCourse.gradingScale,
          grades: [],
        },
        {
          id: Date.now() + 2,
          name: "Exam",
          weight: 40,
          gradingScale: newCourse.gradingScale,
          grades: [],
        },
      ];
    } else {
      predefinedCategories = [
        {
          id: Date.now(),
          name: "Exam",
          weight: 40,
          gradingScale: newCourse.gradingScale,
          grades: [],
        },
        {
          id: Date.now() + 1,
          name: "Laboratory Activity",
          weight: 60,
          gradingScale: newCourse.gradingScale,
          grades: [],
        },
      ];
    }

    setNewCourse({
      ...newCourse,
      categories: predefinedCategories,
    });
  };

  const updateCategory = (index, field, value) => {
    const updatedCategories = [...newCourse.categories];
    updatedCategories[index] = { ...updatedCategories[index], [field]: value };
    setNewCourse({ ...newCourse, categories: updatedCategories });
  };

  const removeCategory = (index) => {
    const updatedCategories = newCourse.categories.filter(
      (_, i) => i !== index
    );
    setNewCourse({ ...newCourse, categories: updatedCategories });
  };

  const synchronizeCategoriesWithDatabase = async (
    courseId,
    newCategories,
    existingCategories
  ) => {
    try {
      const existingCategoryIds = existingCategories.map(
        (cat) => cat.id || cat.categoryId
      );

      const newCategoryIds = newCategories
        .filter((cat) => cat.id && typeof cat.id === "number")
        .map((cat) => cat.id);

      const categorySystemChanged =
        newCategories.length !== existingCategories.length;

      if (categorySystemChanged) {
        for (const category of existingCategories) {
          await deleteAssessmentCategory(category.id);
        }

        for (const category of newCategories) {
          const categoryData = {
            categoryName: category.name,
            weightPercentage: category.weight,
          };
          await addCategoryToCourse(courseId, categoryData);
        }
      } else if (newCategories.length < existingCategories.length) {
        const categoriesToDelete = existingCategories.slice(
          newCategories.length
        );

        for (const category of categoriesToDelete) {
          await deleteAssessmentCategory(category.id);
        }

        for (let i = 0; i < newCategories.length; i++) {
          const newCategory = newCategories[i];
          const existingCategory = existingCategories[i];

          if (
            newCategory.name !== existingCategory.categoryName ||
            newCategory.weight !== existingCategory.weightPercentage
          ) {
            const categoryData = {
              categoryName: newCategory.name,
              weightPercentage: newCategory.weight,
            };
            await updateAssessmentCategory(existingCategory.id, categoryData);
          }
        }
      } else if (newCategories.length > existingCategories.length) {
        const categoriesToAdd = newCategories.slice(existingCategories.length);

        for (const category of categoriesToAdd) {
          const categoryData = {
            categoryName: category.name,
            weightPercentage: category.weight,
          };
          await addCategoryToCourse(courseId, categoryData);
        }

        for (let i = 0; i < existingCategories.length; i++) {
          const newCategory = newCategories[i];
          const existingCategory = existingCategories[i];

          if (
            newCategory.name !== existingCategory.categoryName ||
            newCategory.weight !== existingCategory.weightPercentage
          ) {
            const categoryData = {
              categoryName: newCategory.name,
              weightPercentage: newCategory.weight,
            };
            await updateAssessmentCategory(existingCategory.id, categoryData);
          }
        }
      } else {
        for (let i = 0; i < newCategories.length; i++) {
          const newCategory = newCategories[i];
          const existingCategory = existingCategories[i];

          if (
            newCategory.name !== existingCategory.categoryName ||
            newCategory.weight !== existingCategory.weightPercentage
          ) {
            const categoryData = {
              categoryName: newCategory.name,
              weightPercentage: newCategory.weight,
            };
            await updateAssessmentCategory(existingCategory.id, categoryData);
          }
        }
      }
    } catch (error) {
      throw error;
    }
  };

  const validateCourse = () => {
    if (!newCourse.name.trim()) return "Course name is required";
    if (newCourse.categories.length === 0)
      return "At least one category is required";

    const totalWeight = newCourse.categories.reduce(
      (sum, cat) => sum + (parseFloat(cat.weight) || 0),
      0
    );
    if (Math.abs(totalWeight - 100) > 0.01) {
      return `Total weight must equal 100% (current: ${totalWeight.toFixed(
        1
      )}%)`;
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
        email: currentUser.email,
        name: newCourse.name,
        courseCode: newCourse.courseCode,
        units: newCourse.units,
        creditHours: newCourse.creditHours,
        gradingScale: newCourse.gradingScale,
        maxPoints: newCourse.maxPoints,
        gpaScale: newCourse.gpaScale,
        categorySystem: newCourse.categorySystem,
        colorIndex: newCourse.colorIndex,
        semester: newCourse.semester,
        academicYear: newCourse.academicYear,
      };

      let createdCourse;
      if (editingCourse) {
        const updateData = {
          ...courseData,
          id: editingCourse.id,
        };

        createdCourse = await updateCourse(editingCourse.id, updateData);

        try {
          const existingCategories = await getAssessmentCategoriesByCourseId(
            editingCourse.id
          );
          await synchronizeCategoriesWithDatabase(
            editingCourse.id,
            newCourse.categories,
            existingCategories
          );

          const updatedCourse = await getCourseById(editingCourse.id);
          if (updatedCourse) {
            setNewCourse((prev) => ({
              ...prev,
              categorySystem:
                updatedCourse.categorySystem ||
                (newCourse.categories.length === 2
                  ? "2-categories"
                  : "3-categories"),
            }));
          }
        } catch (categoryError) {}
      } else {
        createdCourse = await createCourse(courseData);

        if (newCourse.categories.length > 0) {
          try {
            const createdCategories = [];
            for (const category of newCourse.categories) {
              const categoryData = {
                categoryName: category.name || "",
                weightPercentage: parseFloat(category.weight) || 0,
              };

              const createdCategory = await addCategoryToCourse(
                createdCourse.id,
                categoryData
              );
              createdCategories.push(createdCategory);
            }

            createdCourse.categories = createdCategories;
          } catch (categoryError) {
            createdCourse.categories = [];
          }
        } else {
          createdCourse.categories = [];
        }
      }

      let updatedCourses;
      if (editingCourse) {
        updatedCourses = existingCourses.map((course) => {
          if (course.id === editingCourse.id) {
            return {
              ...course,
              ...createdCourse,
              categories: course.categories || [],
              updatedAt: new Date().toISOString(),

              semester: newCourse.semester || course.semester,
              handleMissing: newCourse.handleMissing || course.handleMissing,
            };
          }
          return course;
        });

        const mergedCourse = updatedCourses.find(
          (c) => c.id === editingCourse.id
        );
        const originalCourse = existingCourses.find(
          (c) => c.id === editingCourse.id
        );
      } else {
        updatedCourses = [...existingCourses, createdCourse];
      }

      if (onCourseCreated) {
        onCourseCreated(updatedCourses);
      }

      setNewCourse({
        name: "",
        courseCode: "",
        units: 3,
        creditHours: 3,
        semester: "",
        gradingScale: GRADING_SCALES.PERCENTAGE,
        maxPoints: 100,
        handleMissing: "exclude",
        categorySystem: "3-categories",
        gpaScale: "4.0",
        colorIndex: 0,
        categories: [],
      });
      onClose();
    } catch (error) {
      alert("Failed to save course. Please try again.");
    }
  };

  const cancelEdit = () => {
    onClose();
  };

  if (!isOpen) return null;

  if (isFormLoading) {
    return (
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
          <div className="flex items-center justify-center p-8">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#8168C5] mx-auto mb-4"></div>
              <p className="text-gray-600">Loading course data...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      {/* ========================================
          MODAL CONTENT WRAPPER
          ======================================== */}
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        {/* ========================================
            MODAL HEADER SECTION
            ======================================== */}
        <div
          className={`bg-gradient-to-r ${
            courseColorScheme
              ? courseColorScheme.gradient
              : "from-[#8168C5] to-[#3E325F]"
          } p-6 pb-4 rounded-t-2xl`}
        >
          <h3 className="text-2xl font-bold text-white text-center">
            {editingCourse ? "Edit Course" : "Add New Course"}
          </h3>
        </div>

        {/* ========================================
            COURSE FORM CONTAINER
            ======================================== */}
        <form onSubmit={handleSubmit} className="p-6 pt-4">
          {/* ========================================
              COURSE INPUT FIELDS GRID
              ======================================== */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            {/* ========================================
                COURSE NAME INPUT FIELD
                ======================================== */}
            <div>
              <label className="block text-sm font-semibold text-[#3E325F] mb-2">
                Course Name
              </label>
              <input
                type="text"
                value={newCourse.name}
                onChange={(e) =>
                  setNewCourse({ ...newCourse, name: e.target.value })
                }
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#8168C5] focus:border-[#8168C5] transition-all duration-200"
                placeholder="Enter course name"
                required
              />
            </div>

            {/* ========================================
                COURSE CODE INPUT FIELD
                ======================================== */}
            <div>
              <label className="block text-sm font-semibold text-[#3E325F] mb-2">
                Course Code
              </label>
              <input
                type="text"
                value={newCourse.courseCode}
                onChange={(e) =>
                  setNewCourse({ ...newCourse, courseCode: e.target.value })
                }
                disabled={isHistoricalData}
                className={`w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#8168C5] focus:border-[#8168C5] transition-all duration-200 ${
                  isHistoricalData
                    ? "bg-gray-100 text-gray-500 cursor-not-allowed"
                    : "bg-gray-50"
                }`}
                placeholder="e.g., CTSYSINL"
                required
              />
            </div>

            {/* ========================================
                UNITS INPUT FIELD
                ======================================== */}
            <div>
              <label className="block text-sm font-semibold text-[#3E325F] mb-2">
                Units
              </label>
              <input
                type="number"
                value={newCourse.units}
                onChange={(e) =>
                  setNewCourse({
                    ...newCourse,
                    units: parseInt(e.target.value) || 3,
                  })
                }
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#8168C5] focus:border-[#8168C5] transition-all duration-200"
                min="1"
                max="6"
                placeholder="e.g., 3"
              />
              <p className="text-xs text-gray-500 mt-1">
                Course load or academic units
              </p>
            </div>

            {/* ========================================
                CREDIT HOURS INPUT FIELD
                ======================================== */}
            <div>
              <label className="block text-sm font-semibold text-[#3E325F] mb-2">
                Credit Hours
              </label>
              <input
                type="number"
                value={newCourse.creditHours}
                onChange={(e) =>
                  setNewCourse({
                    ...newCourse,
                    creditHours: parseInt(e.target.value) || 3,
                  })
                }
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#8168C5] focus:border-[#8168C5] transition-all duration-200"
                min="1"
                max="6"
                placeholder="e.g., 3"
              />
              <p className="text-xs text-gray-500 mt-1">
                Used for GPA calculations
              </p>
            </div>

            {/* ========================================
                SEMESTER DROPDOWN FIELD
                ======================================== */}
            <div>
              <label className="block text-sm font-semibold text-[#3E325F] mb-2">
                Semester
              </label>
              <div className="relative">
                <select
                  value={newCourse.semester}
                  onChange={(e) => {
                    setNewCourse({ ...newCourse, semester: e.target.value });
                  }}
                  className="w-full px-4 py-3 pr-10 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#8168C5] focus:border-[#8168C5] transition-all duration-200 appearance-none cursor-pointer"
                  required
                >
                  <option value="FIRST">First Semester</option>
                  <option value="SECOND">Second Semester</option>
                  <option value="THIRD">Third Semester</option>
                </select>
                <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                  <svg
                    className="w-5 h-5 text-gray-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 9l-7 7-7-7"
                    />
                  </svg>
                </div>
              </div>
            </div>

            {/* ========================================
                ACADEMIC YEAR DROPDOWN FIELD
                ======================================== */}
            <div>
              <label className="block text-sm font-semibold text-[#3E325F] mb-2">
                Academic Year
              </label>
              <div className="relative">
                <select
                  value={newCourse.academicYear}
                  onChange={(e) => {
                    setNewCourse({
                      ...newCourse,
                      academicYear: e.target.value,
                    });
                  }}
                  className="w-full px-4 py-3 pr-10 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#8168C5] focus:border-[#8168C5] transition-all duration-200 appearance-none cursor-pointer"
                  required
                >
                  <option value="2024">2024-2025</option>
                  <option value="2025">2025-2026</option>
                  <option value="2026">2026-2027</option>
                  <option value="2027">2027-2028</option>
                </select>
                <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                  <svg
                    className="w-5 h-5 text-gray-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 9l-7 7-7-7"
                    />
                  </svg>
                </div>
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Select the academic year for this course
              </p>
            </div>

            {/* ========================================
                MAX POINTS INPUT FIELD
                ======================================== */}
            <div>
              <label className="block text-sm font-semibold text-[#3E325F] mb-2">
                Max Points
              </label>
              <input
                type="number"
                value={newCourse.maxPoints}
                onChange={(e) =>
                  setNewCourse({
                    ...newCourse,
                    maxPoints: parseInt(e.target.value) || 100,
                  })
                }
                disabled={hasGrades}
                className={`w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#8168C5] focus:border-[#8168C5] transition-all duration-200 ${
                  hasGrades
                    ? "bg-gray-100 text-gray-500 cursor-not-allowed"
                    : "bg-gray-50"
                }`}
                min="1"
                placeholder="e.g., 100"
              />
              <p className="text-xs text-gray-500 mt-1">
                Maximum points for points-based grading
              </p>
              {hasGrades && (
                <p className="text-xs text-amber-600 mt-1 font-medium">
                  ⚠️ Cannot change grading scale when grades exist
                </p>
              )}
              {isHistoricalData && (
                <p className="text-xs text-blue-600 mt-1 font-medium">
                  📚 Historical course - some fields are protected
                </p>
              )}
            </div>

            {/* ========================================
                GRADING SCALE DROPDOWN FIELD
                ======================================== */}
            <div>
              <label className="block text-sm font-semibold text-[#3E325F] mb-2">
                Grading Scale
              </label>
              <div className="relative">
                <select
                  value={newCourse.gradingScale}
                  onChange={(e) =>
                    setNewCourse({ ...newCourse, gradingScale: e.target.value })
                  }
                  disabled={hasGrades}
                  className={`w-full px-4 py-3 pr-10 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#8168C5] focus:border-[#8168C5] transition-all duration-200 appearance-none ${
                    hasGrades
                      ? "bg-gray-100 text-gray-500 cursor-not-allowed"
                      : "bg-gray-50 cursor-pointer"
                  }`}
                >
                  <option value={GRADING_SCALES.PERCENTAGE}>Percentage</option>
                  <option value={GRADING_SCALES.POINTS}>Points</option>
                </select>
                <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                  <svg
                    className="w-5 h-5 text-gray-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 9l-7 7-7-7"
                    />
                  </svg>
                </div>
              </div>
            </div>

            {/* ========================================
                CATEGORY SYSTEM DROPDOWN FIELD
                ======================================== */}
            <div>
              <label className="block text-sm font-semibold text-[#3E325F] mb-2">
                Category System
              </label>
              <div className="relative">
                <select
                  value={newCourse.categorySystem}
                  onChange={(e) =>
                    setNewCourse({
                      ...newCourse,
                      categorySystem: e.target.value,
                    })
                  }
                  className="w-full px-4 py-3 pr-10 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#8168C5] focus:border-[#8168C5] transition-all duration-200 appearance-none cursor-pointer"
                >
                  <option value="3-categories">
                    3 Categories (Assignments, Quizzes, Exam)
                  </option>
                  <option value="2-categories">
                    2 Categories (Exam, Laboratory Activity)
                  </option>
                </select>
                <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                  <svg
                    className="w-5 h-5 text-gray-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 9l-7 7-7-7"
                    />
                  </svg>
                </div>
              </div>
            </div>

            {/* ========================================
                GPA SCALE DROPDOWN FIELD
                ======================================== */}
            <div>
              <label className="block text-sm font-semibold text-[#3E325F] mb-2">
                GPA Scale
              </label>
              <div className="relative">
                <select
                  value={newCourse.gpaScale}
                  onChange={(e) =>
                    setNewCourse({ ...newCourse, gpaScale: e.target.value })
                  }
                  disabled={hasGrades}
                  className={`w-full px-4 py-3 pr-10 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#8168C5] focus:border-[#8168C5] transition-all duration-200 appearance-none ${
                    hasGrades
                      ? "bg-gray-100 text-gray-500 cursor-not-allowed"
                      : "bg-gray-50 cursor-pointer"
                  }`}
                >
                  <option value="4.0">Standard 4.0 (1.0 = F, 4.0 = A)</option>
                  <option value="5.0">Standard 5.0 (1.0 = F, 5.0 = A)</option>
                  <option value="inverted-4.0">
                    Inverted 4.0 (4.0 = F, 1.0 = A)
                  </option>
                  <option value="inverted-5.0">
                    Inverted 5.0 (5.0 = F, 1.0 = A)
                  </option>
                </select>
                <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                  <svg
                    className="w-5 h-5 text-gray-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 9l-7 7-7-7"
                    />
                  </svg>
                </div>
              </div>
            </div>

            {/* ========================================
                HANDLE MISSING GRADES DROPDOWN FIELD
                ======================================== */}
            <div>
              <label className="block text-sm font-semibold text-[#3E325F] mb-2">
                Handle Missing Grades
              </label>
              <div className="relative">
                <select
                  value={newCourse.handleMissing}
                  onChange={(e) =>
                    setNewCourse({
                      ...newCourse,
                      handleMissing: e.target.value,
                    })
                  }
                  className="w-full px-4 py-3 pr-10 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#8168C5] focus:border-[#8168C5] transition-all duration-200 appearance-none cursor-pointer"
                >
                  <option value="exclude">Exclude from calculation</option>
                  <option value="zero">Treat as zero</option>
                </select>
                <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                  <svg
                    className="w-5 h-5 text-gray-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 9l-7 7-7-7"
                    />
                  </svg>
                </div>
              </div>
              <p className="text-xs text-gray-500 mt-1">
                How to handle missing or incomplete grades
              </p>
            </div>

            {/* ========================================
                COURSE COLOR SELECTION
                ======================================== */}
            <div>
              <label className="block text-sm font-semibold text-[#3E325F] mb-2">
                Course Color
              </label>
              <div className="grid grid-cols-5 gap-2">
                {getAllColors().map((colorOption) => (
                  <button
                    key={colorOption.index}
                    type="button"
                    onClick={() =>
                      setNewCourse({
                        ...newCourse,
                        colorIndex: colorOption.index,
                      })
                    }
                    className={`w-full h-12 rounded-lg border-2 transition-all duration-200 flex items-center justify-center ${
                      newCourse.colorIndex === colorOption.index
                        ? `${colorOption.primary} border-white shadow-lg`
                        : `${colorOption.secondary} border-gray-200 hover:border-gray-300`
                    }`}
                    title={colorOption.name}
                  >
                    {newCourse.colorIndex === colorOption.index && (
                      <svg
                        className="w-6 h-6 text-white"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                    )}
                  </button>
                ))}
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Selected:{" "}
                {getAllColors()[newCourse.colorIndex]?.name || "Green"}
              </p>
            </div>

            {/* ========================================
                GOAL SETTING NOTE
                ======================================== */}
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mt-6">
              <div className="flex items-start">
                {/* ========================================
                    GOAL SETTING ICON
                    ======================================== */}
                <div className="flex-shrink-0">
                  <svg
                    className="w-5 h-5 text-blue-600 mt-0.5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                </div>
                {/* ========================================
                    GOAL SETTING CONTENT
                    ======================================== */}
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-blue-800">
                    Set Academic Goals
                  </h3>
                  <p className="text-sm text-blue-700 mt-1">
                    After creating your course, you can set specific grade
                    targets and academic goals using the Goals feature in the
                    sidebar or main navigation.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* ========================================
              CATEGORIES SECTION
              ======================================== */}
          <div className="mb-8">
            {/* ========================================
                CATEGORIES HEADER WITH BUTTONS
                ======================================== */}
            <div className="flex justify-between items-center mb-4">
              <label className="block text-lg font-semibold text-[#3E325F]">
                Categories
              </label>
              <div className="flex gap-3">
                {/* ========================================
                    PREDEFINED CATEGORIES BUTTON
                    ======================================== */}
                <button
                  type="button"
                  onClick={addPredefinedCategories}
                  className="px-4 py-2 text-green-600 hover:text-green-700 text-sm font-medium border border-green-300 hover:border-green-400 rounded-lg hover:bg-green-50 transition-all duration-200"
                >
                  Use{" "}
                  {newCourse.categorySystem === "3-categories"
                    ? "3-Category"
                    : "2-Category"}{" "}
                  Template
                </button>

                {/* ========================================
                    ADD CATEGORY BUTTON
                    ======================================== */}
                <button
                  type="button"
                  onClick={addCategory}
                  className="px-4 py-2 text-[#8168C5] hover:text-[#3E325F] text-sm font-semibold hover:bg-[#8168C5]/10 rounded-lg transition-all duration-200 flex items-center gap-2"
                >
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                    />
                  </svg>
                  Add Category
                </button>
              </div>
            </div>

            {/* ========================================
                INDIVIDUAL CATEGORY INPUTS
                ======================================== */}
            {newCourse.categories.map((category, index) => (
              <div key={category.id} className="flex gap-3 mb-3">
                {/* ========================================
                    CATEGORY NAME INPUT
                    ======================================== */}
                <input
                  type="text"
                  placeholder="Category name"
                  value={category.name}
                  onChange={(e) =>
                    updateCategory(index, "name", e.target.value)
                  }
                  className="flex-1 px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#8168C5] focus:border-[#8168C5] transition-all duration-200"
                  required
                />

                {/* ========================================
                    CATEGORY WEIGHT INPUT
                    ======================================== */}
                <input
                  type="number"
                  placeholder="Weight %"
                  value={category.weight}
                  onChange={(e) =>
                    updateCategory(
                      index,
                      "weight",
                      parseFloat(e.target.value) || 0
                    )
                  }
                  className="w-32 px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#8168C5] focus:border-[#8168C5] transition-all duration-200"
                  min="0"
                  max="100"
                  step="0.1"
                  required
                />

                {/* ========================================
                    REMOVE CATEGORY BUTTON
                    ======================================== */}
                <button
                  type="button"
                  onClick={() => removeCategory(index)}
                  className="w-12 h-12 bg-red-50 hover:bg-red-100 text-red-600 hover:text-red-700 rounded-xl border border-red-200 hover:border-red-300 flex items-center justify-center transition-all duration-200 hover:scale-105"
                >
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>
            ))}
          </div>

          {/* ========================================
              FORM ACTIONS SECTION
              ======================================== */}
          <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
            {/* ========================================
                CANCEL BUTTON
                ======================================== */}
            <button
              type="button"
              onClick={cancelEdit}
              className="px-6 py-3 text-[#3E325F] border border-gray-300 rounded-xl hover:bg-gray-50 hover:border-gray-400 transition-all duration-200 font-medium"
            >
              Cancel
            </button>

            {/* ========================================
                SUBMIT BUTTON
                ======================================== */}
            <button
              type="submit"
              className={`px-8 py-3 bg-gradient-to-r ${
                courseColorScheme
                  ? courseColorScheme.gradient
                  : "from-[#8168C5] to-[#3E325F]"
              } text-white rounded-xl hover:shadow-lg hover:scale-105 transition-all duration-200 font-semibold shadow-md`}
            >
              {editingCourse ? "Update Course" : "Add Course"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default AddCourse;
