
// Grading scale constants
export const GRADING_SCALES = {
  PERCENTAGE: 'percentage',
  GPA: 'gpa',
  POINTS: 'points'
};

// GPA scale configurations with support for inverted scales
export const GPA_SCALES = {
  '4.0': { max: 4.0, min: 1.0, inverted: false },
  '5.0': { max: 5.0, min: 1.0, inverted: false },
  'inverted-4.0': { max: 4.0, min: 1.0, inverted: true },
  'inverted-5.0': { max: 5.0, min: 1.0, inverted: true }
};

export function convertPercentageToGPA(percentage, gpaScale = '4.0') {
  const scale = GPA_SCALES[gpaScale];
  if (!scale) return 0;

  let gpa;
  if (scale.inverted) {
    // Inverted scale: 4.0 = F (0%), 1.0 = A (100%)
    gpa = scale.max - ((percentage / 100) * (scale.max - scale.min));
  } else {
    // Standard scale: 1.0 = F (0%), 4.0/5.0 = A (100%)
    gpa = scale.min + ((percentage / 100) * (scale.max - scale.min));
  }

  return Math.round(gpa * 100) / 100; // Round to 2 decimal places
}

export function convertGPAToPercentage(gpa, gpaScale = '4.0') {
  const scale = GPA_SCALES[gpaScale];
  if (!scale) return 0;

  let percentage;
  if (scale.inverted) {
    // Inverted scale: 4.0 = F (0%), 1.0 = A (100%)
    percentage = ((scale.max - gpa) / (scale.max - scale.min)) * 100;
  } else {
    // Standard scale: 1.0 = F (0%), 4.0/5.0 = A (100%)
    percentage = ((gpa - scale.min) / (scale.max - scale.min)) * 100;
  }

  return Math.round(percentage * 100) / 100; // Round to 2 decimal places
}

export function convertGradeToPercentage(grade, scale, maxPoints = 100) {
  if (!grade || grade.score === null || grade.score === undefined || grade.score === '') {
    return 0;
  }

  let adjustedScore = grade.score;

  // Add extra credit points if this is an extra credit assessment
  if (grade.isExtraCredit && grade.extraCreditPoints) {
    adjustedScore += grade.extraCreditPoints;
  }

  if (scale === GRADING_SCALES.PERCENTAGE) {
    return Math.min(adjustedScore, 100); // Cap at 100%
  } else if (scale === GRADING_SCALES.GPA) {
    // Convert GPA to percentage (assuming 4.0 = 100%, 0.0 = 0%)
    return (adjustedScore / 4.0) * 100;
  } else if (scale === GRADING_SCALES.POINTS) {
    return (adjustedScore / maxPoints) * 100;
  }

  return 0;
}

export function convertPercentageToScale(percentage, scale, maxPoints = 100, gpaScale = '4.0') {
  if (scale === GRADING_SCALES.PERCENTAGE) {
    return Math.round(percentage);
  } else if (scale === GRADING_SCALES.GPA) {
    return convertPercentageToGPA(percentage, gpaScale);
  } else if (scale === GRADING_SCALES.POINTS) {
    return Math.round((percentage / 100) * maxPoints);
  }
  return percentage;
}

export function calculateCategoryAverage(grades, scale, maxPoints = 100, handleMissing = 'exclude') {
  if (!grades || grades.length === 0) return 0;

  let validGrades = grades.filter(grade => {
    if (handleMissing === 'exclude') {
      return grade.score !== null && grade.score !== undefined && grade.score !== '' &&
             grade.maxScore !== null && grade.maxScore !== undefined && grade.maxScore !== '';
    } else {
      return true; // treat missing as 0
    }
  });

  if (validGrades.length === 0) return 0;

  const totalPercentage = validGrades.reduce((sum, grade) => {
    let adjustedScore = grade.score || 0;

    // Add extra credit points if this is an extra credit assessment
    if (grade.isExtraCredit && grade.extraCreditPoints) {
      adjustedScore += grade.extraCreditPoints;
    }

    // Calculate percentage with adjusted score
    const percentage = (adjustedScore / grade.maxScore) * 100;
    return sum + percentage;
  }, 0);

  return totalPercentage / validGrades.length;
}

export function calculateCourseGrade(categories, gradingScale, maxPoints = 100, handleMissing = 'exclude') {
  if (!categories || categories.length === 0) return 0;

  let totalWeightedGrade = 0;
  let totalWeight = 0;

  categories.forEach(category => {
    // Handle both property naming conventions: weight/weightPercentage
    const categoryWeight = category.weight || category.weightPercentage || 0;

    if (categoryWeight > 0 && category.grades) {
      const categoryAverage = calculateCategoryAverage(
        category.grades,
        category.gradingScale || gradingScale,
        maxPoints,
        handleMissing
      );

      totalWeightedGrade += (categoryAverage * categoryWeight);
      totalWeight += categoryWeight;
    }
  });

  if (totalWeight === 0) return 0;

  return totalWeightedGrade / totalWeight;
}


export function getGradeColor(percentage) {
  if (percentage >= 90) return 'text-green-600';
  if (percentage >= 80) return 'text-blue-600';
  if (percentage >= 70) return 'text-yellow-600';
  if (percentage >= 60) return 'text-orange-600';
  return 'text-red-600';
}

