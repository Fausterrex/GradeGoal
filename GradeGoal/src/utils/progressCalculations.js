
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

