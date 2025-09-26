// ========================================
// ASSESSMENT CATEGORIES COMPONENT
// ========================================
// Section that displays all assessment categories

import React, { useState, useEffect } from "react";
import AssessmentCategory from "./AssessmentCategory";
import { calculateCategoryGrade } from "../../../../backend/api";

function AssessmentCategories({
  categories,
  grades,
  colorScheme,
  getCategoryAverage,
  onAddAssessment,
  onAssessmentClick,
  onEditScore,
  onEditAssessment,
  onDeleteAssessment,
  course, // Add course prop for AI analysis
  targetGrade // Add target grade for AI analysis
}) {
  const [categoryAverages, setCategoryAverages] = useState({});

  // Calculate category averages using database calculations
  useEffect(() => {
    const loadCategoryAverages = async () => {
      if (!categories || categories.length === 0) return;
      
      const averages = {};
      for (const category of categories) {
        try {
          // Use database calculation for category grade
          const result = await calculateCategoryGrade(category.id);
          if (result.success) {
            averages[category.id] = parseFloat(result.categoryGrade);
          } else {
            // Fallback to provided function if database calculation fails
            const average = await getCategoryAverage(category.id);
            averages[category.id] = average;
          }
        } catch (error) {
          // Fallback to provided function
          try {
            const average = await getCategoryAverage(category.id);
            averages[category.id] = average;
          } catch (fallbackError) {
            averages[category.id] = null;
          }
        }
      }
      setCategoryAverages(averages);
    };

    loadCategoryAverages();
  }, [categories, getCategoryAverage]);

  if (!categories || categories.length === 0) {
    return (
      <div className="col-span-2 text-center py-12">
        {/* No Categories State */}
        <div className="text-gray-500">
          <span className="text-6xl mb-4 text-gray-300">📁</span>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            No Categories Found
          </h3>
          <p className="text-gray-500">
            This course doesn't have any assessment categories yet.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
      {categories.map((category) => {
        const categoryGrades = grades[category.id] || [];
        const categoryAverage = categoryAverages[category.id] || null;

        return (
          <AssessmentCategory
            key={category.id}
            category={category}
            categoryGrades={categoryGrades}
            categoryAverage={categoryAverage}
            colorScheme={colorScheme}
            onAddAssessment={onAddAssessment}
            onAssessmentClick={onAssessmentClick}
            onEditScore={onEditScore}
            onEditAssessment={onEditAssessment}
            onDeleteAssessment={onDeleteAssessment}
            course={course}
            allGrades={grades}
            allCategories={categories}
            targetGrade={targetGrade}
          />
        );
      })}
    </div>
  );
}

export default AssessmentCategories;
