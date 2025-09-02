import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './components/App.jsx'
import './index.css'

/**
 * Main Entry Point
 * 
 * Initializes the React application and renders the root App component.
 * Uses React 18's createRoot API for concurrent features and StrictMode for development checks.
 */
createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
