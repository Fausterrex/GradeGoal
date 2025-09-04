
export const calculateCourseProgress = (categories, grades) => {
  if (!categories || categories.length === 0) return 0;

  let totalWeight = 0;
  let completedWeight = 0;

  // Calculate progress based on weighted category completion with partial progress
  categories.forEach(category => {
    const categoryGrades = grades[category.id] || [];
    // Handle both property naming conventions: weight/weightPercentage and name/categoryName
    const categoryWeight = category.weight || category.weightPercentage || 0;
    const categoryName = category.name || category.categoryName || 'Unknown';
    totalWeight += categoryWeight;

    // Calculate partial completion within this category
    if (categoryGrades.length > 0) {
      let completedAssessments = 0;
      let totalAssessments = categoryGrades.length;

      categoryGrades.forEach(grade => {
        const hasScore = grade.score !== undefined &&
                        grade.score !== null &&
                        grade.score !== '' &&
                        grade.score !== 0 &&
                        !isNaN(parseFloat(grade.score));
        if (hasScore) {
          completedAssessments++;
        }
      });

      // Calculate category completion percentage
      const categoryCompletion = completedAssessments / totalAssessments;
      const weightedContribution = categoryWeight * categoryCompletion;

      // Add weighted contribution: categoryWeight × categoryCompletion
      completedWeight += weightedContribution;
    } else {
    }
    // If no assessments in category, contribution is 0 (no change to completedWeight)
  });

  // Progress = (Completed Weight / Total Weight) × 100
  if (totalWeight > 0) {
    const progress = (completedWeight / totalWeight) * 100;
    return Math.round(progress);
  } else {
    return 0;
  }
};

export const calculateMultipleCourseProgress = (courses, allGrades) => {
  const progressMap = {};

  courses.forEach(course => {
    const courseGrades = allGrades[course.id] || {};
    progressMap[course.id] = calculateCourseProgress(course.categories, courseGrades);
  });

  return progressMap;
};

export const getProgressBreakdown = (categories, grades) => {
  return categories.map(category => {
    const categoryGrades = grades[category.id] || [];
    const categoryWeight = category.weight || 0;

    let completedAssessments = 0;
    let totalAssessments = categoryGrades.length;

    categoryGrades.forEach(grade => {
      const hasScore = grade.score !== undefined &&
                      grade.score !== null &&
                      grade.score !== '' &&
                      grade.score !== 0 &&
                      !isNaN(parseFloat(grade.score));
      if (hasScore) {
        completedAssessments++;
      }
    });

    const completion = totalAssessments > 0 ? (completedAssessments / totalAssessments) * 100 : 0;
    const contribution = categoryWeight * (completion / 100);

    return {
      category: category.name,
      weight: categoryWeight,
      completed: completedAssessments,
      total: totalAssessments,
      completion: Math.round(completion),
      contribution: Math.round(contribution)
    };
  });
};

export const isCourseFullyCompleted = (categories, grades) => {
  return categories.every(category => {
    const categoryGrades = grades[category.id] || [];
    if (categoryGrades.length === 0) return false;

    return categoryGrades.every(grade => {
      return grade.score !== undefined &&
             grade.score !== null &&
             grade.score !== '' &&
             grade.score !== 0 &&
             !isNaN(parseFloat(grade.score));
    });
  });
};

export const getNextCategoryToFocus = (categories, grades) => {
  const breakdown = getProgressBreakdown(categories, grades);
  const incompleteCategories = breakdown.filter(cat => cat.completion < 100);

  if (incompleteCategories.length === 0) return null;

  // Sort by completion rate (ascending) and then by weight (descending)
  incompleteCategories.sort((a, b) => {
    if (a.completion !== b.completion) {
      return a.completion - b.completion;
    }
    return b.weight - a.weight;
  });

  return categories.find(cat => cat.name === incompleteCategories[0].category);
};
