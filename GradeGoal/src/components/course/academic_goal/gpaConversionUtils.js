// ========================================
// GPA CONVERSION UTILITIES
// ========================================
// Reusable functions for converting between percentage and GPA formats

/**
 * Convert percentage (0-100) to GPA (0-4.0)
 * Uses standard 4.0 scale conversion
 */
export const percentageToGPA = (percentage, gpaScale = 4.0) => {
  if (percentage === null || percentage === undefined || isNaN(percentage)) {
    return 0;
  }
  
  const percent = parseFloat(percentage);
  
  // Custom GPA scale conversion based on provided table
  if (percent >= 95.5) return '4.00';
  if (percent >= 89.5) return '3.50';
  if (percent >= 83.5) return '3.00';
  if (percent >= 77.5) return '2.50';
  if (percent >= 71.5) return '2.00';
  if (percent >= 65.5) return '1.50';
  if (percent >= 59.5) return '1.00';
  
  return 'R'; // Below 59.5 = R (Remedial/Fail)
};

/**
 * Convert GPA (0-4.0) to percentage (0-100)
 * Uses standard GPA to percentage conversion
 */
export const gpaToPercentage = (gpa, gpaScale = 4.0) => {
  if (gpa === null || gpa === undefined || isNaN(gpa)) {
    return 0;
  }
  
  const gpaValue = parseFloat(gpa);
  const normalizedGPA = (gpaValue / gpaScale) * 4.0; // Normalize to 4.0 scale
  
  // Custom GPA to percentage conversion (matching database CalculateGPA function)
  if (normalizedGPA >= 4.0) return 95.5;
  if (normalizedGPA >= 3.5) return 89.5;
  if (normalizedGPA >= 3.0) return 83.5;
  if (normalizedGPA >= 2.5) return 77.5;
  if (normalizedGPA >= 2.0) return 71.5;
  if (normalizedGPA >= 1.5) return 65.5;
  if (normalizedGPA >= 1.0) return 59.5;
  
  return 0; // Below 1.0 = 0% (R grade)
};

/**
 * Detect if a value is in GPA format (0-4.0 or 0-5.0) or percentage format (0-100)
 */
export const detectValueFormat = (value, gpaScale = 4.0) => {
  const numValue = parseFloat(value);
  if (isNaN(numValue)) return 'invalid';
  
  const maxGPA = gpaScale === 5.0 ? 5.0 : 4.0;
  
  if (numValue <= maxGPA) {
    return 'gpa';
  } else if (numValue <= 100) {
    return 'percentage';
  } else {
    return 'invalid';
  }
};

/**
 * Convert any value to GPA format
 * Automatically detects format and converts if needed
 */
export const convertToGPA = (value, gpaScale = 4.0) => {
  const format = detectValueFormat(value, gpaScale);
  
  switch (format) {
    case 'gpa':
      return parseFloat(value);
    case 'percentage':
      return percentageToGPA(value, gpaScale);
    default:
      return 0;
  }
};

/**
 * Convert any value to percentage format
 * Automatically detects format and converts if needed
 */
export const convertToPercentage = (value, gpaScale = 4.0) => {
  const format = detectValueFormat(value, gpaScale);
  
  switch (format) {
    case 'percentage':
      return parseFloat(value);
    case 'gpa':
      return gpaToPercentage(value, gpaScale);
    default:
      return 0;
  }
};

/**
 * Get display text for conversion preview
 * Shows what the entered value converts to
 */
export const getConversionPreview = (value, inputFormat, gpaScale = 4.0) => {
  if (!value || isNaN(parseFloat(value))) return '';
  
  const numValue = parseFloat(value);
  
  if (inputFormat === 'percentage') {
    const gpa = percentageToGPA(numValue, gpaScale);
    return `(${gpa.toFixed(2)} GPA)`;
  } else if (inputFormat === 'gpa') {
    const percentage = gpaToPercentage(numValue, gpaScale);
    return `(${percentage.toFixed(1)}%)`;
  }
  
  return '';
};

/**
 * Calculate achievement probability based on current progress and time remaining
 */
export const calculateAchievementProbability = (currentGPA, targetGPA, courseProgress = 0, targetDate = null) => {
  if (!targetGPA || targetGPA <= 0) return 0;
  
  // If goal is already achieved, return 100% probability
  if (currentGPA >= targetGPA) return 100;
  
  // Base probability from current progress toward target
  const gpaProgress = (currentGPA / targetGPA) * 100;
  
  // Course completion factor - but don't penalize too heavily for incomplete courses
  const completionFactor = Math.max(0.3, Math.min(courseProgress / 100, 1)); // Minimum 30% factor
  
  // Time factor - if target date is set and approaching, adjust probability
  let timeFactor = 1;
  if (targetDate) {
    const today = new Date();
    const target = new Date(targetDate);
    const daysRemaining = Math.max(0, (target - today) / (1000 * 60 * 60 * 24));
    
    if (daysRemaining < 30) {
      timeFactor = 0.9; // Less harsh penalty for approaching deadlines
    } else if (daysRemaining < 60) {
      timeFactor = 0.95;
    }
  }
  
  // Calculate final probability with more optimistic baseline
  let probability = gpaProgress * completionFactor * timeFactor;
  
  // Boost probability significantly if already making good progress
  if (gpaProgress > 90) {
    probability = Math.min(probability * 1.2, 100); // 20% boost for excellent progress
  } else if (gpaProgress > 80) {
    probability = Math.min(probability * 1.15, 100); // 15% boost for very good progress
  } else if (gpaProgress > 70) {
    probability = Math.min(probability * 1.1, 100); // 10% boost for good progress
  }
  
  // Ensure minimum realistic probability for reasonable progress
  if (gpaProgress > 50) {
    probability = Math.max(probability, gpaProgress * 0.8); // At least 80% of progress ratio
  }
  
  return Math.round(Math.max(0, Math.min(100, probability)));
};
