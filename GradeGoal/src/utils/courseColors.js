
export const getCourseColorScheme = (courseName, customColorIndex = null) => {
  // Predefined color schemes with all necessary variants
  const colors = [
    {
      primary: 'bg-green-600',
      secondary: 'bg-green-100',
      accent: 'text-green-600',
      gradient: 'from-green-600 to-green-700',
      light: 'bg-green-50',
      progressGradient: 'from-green-500 to-green-600',
      gradeGradient: 'from-green-500 to-emerald-500',
      name: 'Green'
    },
    {
      primary: 'bg-blue-600',
      secondary: 'bg-blue-100',
      accent: 'text-blue-600',
      gradient: 'from-blue-600 to-blue-700',
      light: 'bg-blue-50',
      progressGradient: 'from-blue-500 to-blue-600',
      gradeGradient: 'from-blue-500 to-cyan-500',
      name: 'Blue'
    },
    {
      primary: 'bg-purple-600',
      secondary: 'bg-purple-100',
      accent: 'text-purple-600',
      gradient: 'from-purple-600 to-purple-700',
      light: 'bg-purple-50',
      progressGradient: 'from-purple-500 to-purple-600',
      gradeGradient: 'from-purple-500 to-pink-500',
      name: 'Purple'
    },
    {
      primary: 'bg-red-600',
      secondary: 'bg-red-100',
      accent: 'text-red-600',
      gradient: 'from-red-600 to-red-700',
      light: 'bg-red-50',
      progressGradient: 'from-red-500 to-red-600',
      gradeGradient: 'from-red-500 to-orange-500',
      name: 'Red'
    },
    {
      primary: 'bg-teal-600',
      secondary: 'bg-teal-100',
      accent: 'text-teal-600',
      gradient: 'from-teal-600 to-teal-700',
      light: 'bg-teal-50',
      progressGradient: 'from-teal-500 to-teal-600',
      gradeGradient: 'from-teal-500 to-cyan-500',
      name: 'Teal'
    },
    {
      primary: 'bg-indigo-600',
      secondary: 'bg-indigo-100',
      accent: 'text-indigo-600',
      gradient: 'from-indigo-600 to-indigo-700',
      light: 'bg-indigo-50',
      progressGradient: 'from-indigo-500 to-indigo-600',
      gradeGradient: 'from-indigo-500 to-purple-500',
      name: 'Indigo'
    },
    {
      primary: 'bg-pink-600',
      secondary: 'bg-pink-100',
      accent: 'text-pink-600',
      gradient: 'from-pink-600 to-pink-700',
      light: 'bg-pink-50',
      progressGradient: 'from-pink-500 to-pink-600',
      gradeGradient: 'from-pink-500 to-rose-500',
      name: 'Pink'
    },
    {
      primary: 'bg-orange-600',
      secondary: 'bg-orange-100',
      accent: 'text-orange-600',
      gradient: 'from-orange-600 to-orange-700',
      light: 'bg-orange-50',
      progressGradient: 'from-orange-500 to-orange-600',
      gradeGradient: 'from-orange-500 to-red-500',
      name: 'Orange'
    },
    {
      primary: 'bg-cyan-600',
      secondary: 'bg-cyan-100',
      accent: 'text-cyan-600',
      gradient: 'from-cyan-600 to-cyan-700',
      light: 'bg-cyan-50',
      progressGradient: 'from-cyan-500 to-cyan-600',
      gradeGradient: 'from-cyan-500 to-blue-500',
      name: 'Cyan'
    },
    {
      primary: 'bg-emerald-600',
      secondary: 'bg-emerald-100',
      accent: 'text-emerald-600',
      gradient: 'from-emerald-600 to-emerald-700',
      light: 'bg-emerald-50',
      progressGradient: 'from-emerald-500 to-emerald-600',
      gradeGradient: 'from-emerald-500 to-green-500',
      name: 'Emerald'
    }
  ];

  // If custom color index is provided and valid, use it
  if (customColorIndex !== null && customColorIndex >= 0 && customColorIndex < colors.length) {
    return colors[customColorIndex];
  }

  // Generate a consistent color based on course name hash (fallback)
  const hash = courseName.split('').reduce((a, b) => {
    a = ((a << 5) - a) + b.charCodeAt(0);
    return a & a;
  }, 0);

  return colors[Math.abs(hash) % colors.length];
};

export const getAllColors = () => {
  return [
    { index: 0, name: 'Green', primary: 'bg-green-600', secondary: 'bg-green-100' },
    { index: 1, name: 'Blue', primary: 'bg-blue-600', secondary: 'bg-blue-100' },
    { index: 2, name: 'Purple', primary: 'bg-purple-600', secondary: 'bg-purple-100' },
    { index: 3, name: 'Red', primary: 'bg-red-600', secondary: 'bg-red-100' },
    { index: 4, name: 'Teal', primary: 'bg-teal-600', secondary: 'bg-teal-100' },
    { index: 5, name: 'Indigo', primary: 'bg-indigo-600', secondary: 'bg-indigo-100' },
    { index: 6, name: 'Pink', primary: 'bg-pink-600', secondary: 'bg-pink-100' },
    { index: 7, name: 'Orange', primary: 'bg-orange-600', secondary: 'bg-orange-100' },
    { index: 8, name: 'Cyan', primary: 'bg-cyan-600', secondary: 'bg-cyan-100' },
    { index: 9, name: 'Emerald', primary: 'bg-emerald-600', secondary: 'bg-emerald-100' }
  ];
};
