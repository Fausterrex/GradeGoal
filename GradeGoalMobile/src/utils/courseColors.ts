// Course color schemes for consistent styling
export interface CourseColorScheme {
  primary: string;
  secondary: string;
  accent: string;
  progressGradient: string;
  gradeGradient: string;
}

// Predefined color schemes
const colorSchemes: CourseColorScheme[] = [
  {
    primary: 'bg-gradient-to-br from-blue-500 to-blue-600',
    secondary: 'bg-blue-100',
    accent: 'text-blue-600',
    progressGradient: 'from-blue-400 to-blue-500',
    gradeGradient: 'from-blue-500 to-blue-600'
  },
  {
    primary: 'bg-gradient-to-br from-green-500 to-green-600',
    secondary: 'bg-green-100',
    accent: 'text-green-600',
    progressGradient: 'from-green-400 to-green-500',
    gradeGradient: 'from-green-500 to-green-600'
  },
  {
    primary: 'bg-gradient-to-br from-purple-500 to-purple-600',
    secondary: 'bg-purple-100',
    accent: 'text-purple-600',
    progressGradient: 'from-purple-400 to-purple-500',
    gradeGradient: 'from-purple-500 to-purple-600'
  },
  {
    primary: 'bg-gradient-to-br from-orange-500 to-orange-600',
    secondary: 'bg-orange-100',
    accent: 'text-orange-600',
    progressGradient: 'from-orange-400 to-orange-500',
    gradeGradient: 'from-orange-500 to-orange-600'
  },
  {
    primary: 'bg-gradient-to-br from-red-500 to-red-600',
    secondary: 'bg-red-100',
    accent: 'text-red-600',
    progressGradient: 'from-red-400 to-red-500',
    gradeGradient: 'from-red-500 to-red-600'
  },
  {
    primary: 'bg-gradient-to-br from-teal-500 to-teal-600',
    secondary: 'bg-teal-100',
    accent: 'text-teal-600',
    progressGradient: 'from-teal-400 to-teal-500',
    gradeGradient: 'from-teal-500 to-teal-600'
  },
  {
    primary: 'bg-gradient-to-br from-indigo-500 to-indigo-600',
    secondary: 'bg-indigo-100',
    accent: 'text-indigo-600',
    progressGradient: 'from-indigo-400 to-indigo-500',
    gradeGradient: 'from-indigo-500 to-indigo-600'
  },
  {
    primary: 'bg-gradient-to-br from-pink-500 to-pink-600',
    secondary: 'bg-pink-100',
    accent: 'text-pink-600',
    progressGradient: 'from-pink-400 to-pink-500',
    gradeGradient: 'from-pink-500 to-pink-600'
  }
];

// Get course color scheme based on course name and color index
export const getCourseColorScheme = (courseName: string, colorIndex: number = 0): CourseColorScheme => {
  // Use colorIndex if provided, otherwise generate from course name
  const index = colorIndex || (courseName.charCodeAt(0) + courseName.length) % colorSchemes.length;
  return colorSchemes[index];
};

// Convert color scheme to React Native compatible colors
export const getCourseColorSchemeRN = (courseName: string, colorIndex: number = 0) => {
  const scheme = getCourseColorScheme(courseName, colorIndex);
  
  // Map Tailwind colors to React Native colors
  const colorMap: { [key: string]: string } = {
    'blue-500': '#3B82F6',
    'blue-600': '#2563EB',
    'green-500': '#10B981',
    'green-600': '#059669',
    'purple-500': '#8B5CF6',
    'purple-600': '#7C3AED',
    'orange-500': '#F97316',
    'orange-600': '#EA580C',
    'red-500': '#EF4444',
    'red-600': '#DC2626',
    'teal-500': '#14B8A6',
    'teal-600': '#0D9488',
    'indigo-500': '#6366F1',
    'indigo-600': '#4F46E5',
    'pink-500': '#EC4899',
    'pink-600': '#DB2777'
  };

  // Extract base color from gradient classes
  const getBaseColor = (gradientClass: string) => {
    const match = gradientClass.match(/from-(\w+-\d+)/);
    return match ? colorMap[match[1]] || '#6B7280' : '#6B7280';
  };

  return {
    primary: getBaseColor(scheme.primary),
    secondary: getBaseColor(scheme.secondary),
    accent: getBaseColor(scheme.accent),
    progressGradient: scheme.progressGradient,
    gradeGradient: scheme.gradeGradient
  };
};
