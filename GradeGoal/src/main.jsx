// ========================================
// APPLICATION ENTRY POINT
// ========================================
// This is the main entry point for the React application.
// It renders the App component into the DOM root element with React StrictMode enabled.

import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './components/App.jsx'
import './index.css'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
