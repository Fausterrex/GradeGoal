/**
 * Vite Configuration for GradeGoal Application
 * 
 * This file configures the Vite build tool for the GradeGoal React application.
 * Vite provides fast development server startup, hot module replacement,
 * and optimized production builds.
 * 
 * Key Features:
 * - React plugin for JSX support
 * - Tailwind CSS integration
 * - Development server with API proxy
 * - Production build optimization
 */

import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

/**
 * Vite Configuration Object
 * 
 * Defines the build configuration, plugins, and development server settings.
 * Uses environment-based configuration for flexibility across development and production.
 * 
 * @type {import('vite').UserConfig}
 */
export default defineConfig({
  // Configure build plugins
  plugins: [
    react({
      // Use modern JSX transform for better performance
      jsxRuntime: 'automatic'
    }),        // Enable React JSX support and Fast Refresh
    tailwindcss()   // Enable Tailwind CSS processing
  ],
  
  // Optimize dependencies to handle JSX transform warnings
  optimizeDeps: {
    include: [
      'react',
      'react-dom',
      'react-big-calendar'
    ]
  },
  
  // Development server configuration
  server: {
    // API proxy configuration for development
    proxy: {
      '/api': {
        target: 'http://localhost:8080',  // Spring Boot backend URL
        changeOrigin: true,               // Handle CORS issues
        secure: false,                    // Allow HTTP connections in development
      }
    },
    // Enable SPA fallback for development server
    historyApiFallback: true,
    // Add headers to handle COOP policy issues for Firebase Auth
    headers: {
      'Cross-Origin-Opener-Policy': 'same-origin-allow-popups',
      'Cross-Origin-Embedder-Policy': 'unsafe-none',
      'Cross-Origin-Resource-Policy': 'cross-origin'
    }
  }
})
