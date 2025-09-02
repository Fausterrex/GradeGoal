/**
 * Tailwind CSS Configuration for GradeGoal Application
 * 
 * This file configures Tailwind CSS, a utility-first CSS framework.
 * It defines the content paths, custom theme extensions, and plugin configuration.
 * 
 * Key Features:
 * - Content scanning for utility class generation
 * - Custom color palette for brand consistency
 * - Responsive design support
 * - Component-based styling approach
 */

/** @type {import('tailwindcss').Config} */
export default {
  // Define which files to scan for CSS class usage
  content: [
    "./index.html",           // Main HTML file
    "./src/**/*.{js,ts,jsx,tsx}", // All source files in src directory
  ],
  
  // Theme customization and extensions
  theme: {
    extend: {
      // Custom color palette for consistent branding
      colors: {
        primary: '#3B389f',           // Main brand color
        'primary-dark': '#2d2a7a',    // Darker variant for contrast
        'primary-light': '#5e5caa',   // Lighter variant for highlights
      }
    },
  },
  
  // Tailwind CSS plugins (none currently configured)
  plugins: [],
}
