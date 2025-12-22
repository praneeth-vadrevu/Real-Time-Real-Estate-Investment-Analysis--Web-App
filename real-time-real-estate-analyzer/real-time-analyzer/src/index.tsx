import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';

/**
 * Application entry point.
 * Initializes React application and renders root App component.
 */
const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);

// Render application with React StrictMode for development checks
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

// Report web vitals for performance monitoring
reportWebVitals();
