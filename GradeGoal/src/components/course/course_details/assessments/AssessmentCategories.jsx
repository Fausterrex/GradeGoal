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
  targetGrade, // Add target grade for AI analysis
  activeSemesterTerm, // Add active semester term prop
  isMidtermCompleted // Add midterm completion status
}) {
  const [categoryAverages, setCategoryAverages] = useState({});

  // Calculate category averages using database calculations
  useEffect(() => {
    const loadCategoryAverages = async () => {
      if (!categories || categories.length === 0) return;
      
      const averages = {};
      for (const category of categories) {
        try {
          // Use database calculation for category grade with active semester term
          const result = await calculateCategoryGrade(category.id, activeSemesterTerm);
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
  }, [categories, getCategoryAverage, activeSemesterTerm]);

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
        // Filter grades by semester term
        const categoryGrades = (grades[category.id] || []).filter(grade => 
          grade.semesterTerm === activeSemesterTerm
        );
        let categoryAverage = categoryAverages[category.id] || null;
        
        // Fix category average calculation - only include completed assessments
        if (categoryAverage !== null && categoryGrades.length > 0) {
          const completedGrades = categoryGrades.filter(grade => 
            grade.score !== null && grade.score !== undefined && grade.score > 0
          );
          
          if (completedGrades.length > 0) {
            // Calculate average from completed assessments only
            const completedAverage = completedGrades.reduce((sum, grade) => {
              let percentage = grade.percentage;
              if (!percentage && grade.score !== undefined && grade.maxScore !== undefined) {
                percentage = (grade.score / grade.maxScore) * 100;
              }
              return sum + (percentage || 0);
            }, 0) / completedGrades.length;
            
            // Use the corrected average if it's different from the database calculation
            if (Math.abs(completedAverage - categoryAverage) > 1) {
              console.log('🔧 [CATEGORY AVERAGE DEBUG] Correcting category average for', category.name, 'from', categoryAverage.toFixed(1) + '%', 'to', completedAverage.toFixed(1) + '%');
              categoryAverage = completedAverage;
            }
          }
        }

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
            activeSemesterTerm={activeSemesterTerm}
            isMidtermCompleted={isMidtermCompleted}
          />
        );
      })}
      </div>
    );
  }

export default AssessmentCategories;
