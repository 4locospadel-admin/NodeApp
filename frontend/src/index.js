/**
 * @file index.js
 * @description The main entry point for the React application. Renders the `App` component into the root DOM element.
 */

import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';

/**
 * Creates a root React element and renders the `App` component.
 *
 * - Wraps the application in `React.StrictMode` to highlight potential problems in an application.
 * - Imports global CSS from `index.css`.
 *
 * @example
 * // Usage in a React project
 * // Ensure this file is included in your `index.html` with a `root` div:
 * <div id="root"></div>
 *
 * @see App for the main application structure.
 */
const root = ReactDOM.createRoot(document.getElementById('root'));

/**
 * Renders the React application.
 * 
 * @returns {void}
 */
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);