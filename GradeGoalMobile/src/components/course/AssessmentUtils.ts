// ========================================
// ASSESSMENT UTILITIES
// ========================================
// Utility functions for assessment-related operations

export const getStatusColor = (status: string) => {
  switch (status?.toUpperCase()) {
    case 'COMPLETED':
      return {
        backgroundColor: '#DCFCE7',
        color: '#166534',
        borderColor: '#BBF7D0',
      };
    case 'UPCOMING':
      return {
        backgroundColor: '#DBEAFE',
        color: '#1E40AF',
        borderColor: '#BFDBFE',
      };
    case 'OVERDUE':
      return {
        backgroundColor: '#FEE2E2',
        color: '#DC2626',
        borderColor: '#FECACA',
      };
    case 'CANCELLED':
      return {
        backgroundColor: '#F3F4F6',
        color: '#374151',
        borderColor: '#D1D5DB',
      };
    default:
      return {
        backgroundColor: '#FEF3C7',
        color: '#D97706',
        borderColor: '#FDE68A',
      };
  }
};

export const determineAssessmentStatus = (grade: any) => {
  const hasScore =
    grade.score !== null &&
    grade.score !== undefined &&
    grade.score !== '' &&
    grade.score !== 0 &&
    !isNaN(parseFloat(grade.score));

  if (hasScore) {
    return 'COMPLETED';
  }

  if (!grade.date) {
    return 'UPCOMING';
  }

  const today = new Date();
  const dueDate = new Date(grade.date);

  today.setHours(0, 0, 0, 0);
  dueDate.setHours(0, 0, 0, 0);

  if (dueDate < today) {
    return 'OVERDUE';
  } else {
    return 'UPCOMING';
  }
};

export const generateAssessmentName = (
  categoryId: number,
  categories: any[],
  grades: Record<number, any[]>,
  customName: string = ''
) => {
  if (!categoryId || !categories.length) return customName;
  
  const category = categories.find(cat => cat.id === categoryId);
  if (!category) return customName;
  
  // Get all existing assessments in this category
  const categoryGrades = Object.values(grades).flat().filter((grade: any) => 
    grade.categoryId === categoryId
  );
  
  // Extract prefix from category name (e.g., "Quizzes" -> "Quiz")
  const categoryName = category.name.toLowerCase();
  let prefix = categoryName;
  
  // Handle common plural forms
  if (categoryName.endsWith('zes')) {
    prefix = categoryName.slice(0, -3); // "Quizzes" -> "Quiz"
  } else if (categoryName.endsWith('ies')) {
    prefix = categoryName.slice(0, -3) + 'y'; // "Categories" -> "Category"
  } else if (categoryName.endsWith('s') && !categoryName.endsWith('ss')) {
    prefix = categoryName.slice(0, -1); // "Assignments" -> "Assignment"
  }
  
  // Capitalize first letter
  prefix = prefix.charAt(0).toUpperCase() + prefix.slice(1);
  
  // If user provided a custom name, use it
  if (customName && customName.trim()) {
    return customName.trim();
  }
  
  // Find the next number for this prefix
  let nextNumber = 1;
  const existingNames = categoryGrades.map((grade: any) => grade.name);
  
  while (existingNames.includes(`${prefix} ${nextNumber}`)) {
    nextNumber++;
  }
  
  return `${prefix} ${nextNumber}`;
};

export const getGradeColor = (percentage: number) => {
  if (percentage >= 90) return '#059669';
  if (percentage >= 80) return '#2563EB';
  if (percentage >= 70) return '#D97706';
  if (percentage >= 60) return '#EA580C';
  return '#DC2626';
};

export const calculateGPAFromPercentage = (percentage: number) => {
  if (percentage >= 97) return 4.0;
  if (percentage >= 93) return 3.7;
  if (percentage >= 90) return 3.3;
  if (percentage >= 87) return 3.0;
  if (percentage >= 83) return 2.7;
  if (percentage >= 80) return 2.3;
  if (percentage >= 77) return 2.0;
  if (percentage >= 73) return 1.7;
  if (percentage >= 70) return 1.3;
  if (percentage >= 67) return 1.0;
  if (percentage >= 63) return 0.7;
  if (percentage >= 60) return 0.3;
  return 0.0;
};

