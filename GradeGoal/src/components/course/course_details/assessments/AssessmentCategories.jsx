// ========================================
// ASSESSMENT CATEGORIES COMPONENT
// ========================================
// Section that displays all assessment categories

import React, { useState, useEffect } from "react";
import AssessmentCategory from "./AssessmentCategory";

function AssessmentCategories({
  categories,
  grades,
  colorScheme,
  getCategoryAverage,
  onAddAssessment,
  onAssessmentClick,
  onEditScore,
  onEditAssessment,
  onDeleteAssessment
}) {
  const [categoryAverages, setCategoryAverages] = useState({});

  // Calculate category averages asynchronously
  useEffect(() => {
    const loadCategoryAverages = async () => {
      if (!categories || categories.length === 0) return;
      
      const averages = {};
      for (const category of categories) {
        try {
          const average = await getCategoryAverage(category.id);
          averages[category.id] = average;
        } catch (error) {
          console.error('Error calculating category average:', error);
          averages[category.id] = null;
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
          />
        );
      })}
    </div>
  );
}

export default AssessmentCategories;
