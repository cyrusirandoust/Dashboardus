/**
 * Application Entry Point
 * 
 * Initializes the React application and renders the root component.
 */

import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import AuthProvider from './auth/AuthProvider';
import './index.css';

// Get root element
const rootElement = document.getElementById('root');

if (!rootElement) {
  throw new Error('Root element not found. Make sure index.html has a div with id="root"');
}

// Create root and render app
ReactDOM.createRoot(rootElement).render(
  <React.StrictMode>
    <AuthProvider>
      <App />
    </AuthProvider>
  </React.StrictMode>
);

// Made with Bob
