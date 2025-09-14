// ========================================
// ASSESSMENT UTILITIES
// ========================================
// Utility functions for assessment-related operations

export const getStatusColor = (status) => {
  switch (status?.toUpperCase()) {
    case "COMPLETED":
      return "bg-green-100 text-green-800 border border-green-200";
    case "UPCOMING":
      return "bg-blue-100 text-blue-800 border border-blue-200";
    case "OVERDUE":
      return "bg-red-100 text-red-800 border border-red-200";
    case "CANCELLED":
      return "bg-gray-100 text-gray-800 border border-gray-200";
    default:
      return "bg-yellow-100 text-yellow-800 border border-yellow-200";
  }
};

export const determineAssessmentStatus = (grade) => {
  const hasScore =
    grade.score !== null &&
    grade.score !== undefined &&
    grade.score !== "" &&
    grade.score !== 0 &&
    !isNaN(parseFloat(grade.score));

  if (hasScore) {
    return "COMPLETED";
  }

  if (!grade.date) {
    return "UPCOMING";
  }

  const today = new Date();
  const dueDate = new Date(grade.date);

  today.setHours(0, 0, 0, 0);
  dueDate.setHours(0, 0, 0, 0);

  if (dueDate < today) {
    return "OVERDUE";
  } else {
    return "UPCOMING";
  }
};

export const generateAssessmentName = (categoryId, categories, grades, customName = "") => {
  if (!categoryId || !categories.length) return customName;
  
  const category = categories.find(cat => cat.id === categoryId);
  if (!category) return customName;
  
  // Get all existing assessments in this category
  const categoryGrades = Object.values(grades).flat().filter(grade => 
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
  const existingNames = categoryGrades.map(grade => grade.name);
  
  while (existingNames.includes(`${prefix} ${nextNumber}`)) {
    nextNumber++;
  }
  
  return `${prefix} ${nextNumber}`;
};
