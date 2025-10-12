/**
 * Custom GPA scale conversion utility
 * Based on the system's defined GPA scale
 */

export interface GPAScale {
  minPercentage: number;
  maxPercentage: number;
  gpa: number;
  letterGrade: string;
}

export const GPA_SCALE: GPAScale[] = [
  { minPercentage: 95.5, maxPercentage: 100, gpa: 4.00, letterGrade: 'A+' },
  { minPercentage: 89.5, maxPercentage: 95.4, gpa: 3.50, letterGrade: 'A' },
  { minPercentage: 83.5, maxPercentage: 89.4, gpa: 3.00, letterGrade: 'B+' },
  { minPercentage: 77.5, maxPercentage: 83.4, gpa: 2.50, letterGrade: 'B' },
  { minPercentage: 71.5, maxPercentage: 77.4, gpa: 2.00, letterGrade: 'C+' },
  { minPercentage: 65.5, maxPercentage: 71.4, gpa: 1.50, letterGrade: 'C' },
  { minPercentage: 59.5, maxPercentage: 65.4, gpa: 1.00, letterGrade: 'D' },
  { minPercentage: 0, maxPercentage: 59.4, gpa: 0.00, letterGrade: 'R' },
];

/**
 * Convert percentage to GPA using the custom scale
 * @param percentage - The percentage score (0-100)
 * @returns The corresponding GPA value
 */
export function percentageToGPA(percentage: number): number {
  if (percentage < 0 || percentage > 100) {
    console.warn(`Invalid percentage: ${percentage}. Must be between 0-100.`);
    return 0.00;
  }

  const scale = GPA_SCALE.find(
    s => percentage >= s.minPercentage && percentage <= s.maxPercentage
  );
  
  return scale ? scale.gpa : 0.00;
}

/**
 * Convert percentage to letter grade using the custom scale
 * @param percentage - The percentage score (0-100)
 * @returns The corresponding letter grade
 */
export function percentageToLetterGrade(percentage: number): string {
  if (percentage < 0 || percentage > 100) {
    console.warn(`Invalid percentage: ${percentage}. Must be between 0-100.`);
    return 'R';
  }

  const scale = GPA_SCALE.find(
    s => percentage >= s.minPercentage && percentage <= s.maxPercentage
  );
  
  return scale ? scale.letterGrade : 'R';
}

/**
 * Convert GPA to percentage range using the custom scale
 * @param gpa - The GPA value
 * @returns The percentage range as a string (e.g., "77.5-83.4%")
 */
export function gpaToPercentageRange(gpa: number): string {
  const scale = GPA_SCALE.find(s => s.gpa === gpa);
  
  if (!scale) {
    return '0-59.4%';
  }
  
  return `${scale.minPercentage}-${scale.maxPercentage}%`;
}

/**
 * Get the full GPA scale information
 * @returns Array of GPA scale information
 */
export function getGPAScale(): GPAScale[] {
  return GPA_SCALE;
}

/**
 * Check if a GPA value is valid according to the custom scale
 * @param gpa - The GPA value to check
 * @returns True if the GPA is valid, false otherwise
 */
export function isValidGPA(gpa: number): boolean {
  return GPA_SCALE.some(scale => scale.gpa === gpa);
}
