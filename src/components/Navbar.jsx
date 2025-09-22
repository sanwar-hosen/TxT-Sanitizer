// Navigation component
// This component provides the main navigation for the application
// Uses React Router's Link component for client-side routing

import { Link, useLocation } from 'react-router-dom';
import { useState } from 'react';
import { Icon } from '@iconify/react';

function Navbar() {
  const location = useLocation();
  
  // State to track if logo image failed to load
  const [logoError, setLogoError] = useState(false);
  
  // Helper function to determine if a link is active
  const isActive = (path) => location.pathname === path;
  
  // Handle logo image load error - fallback to text
  const handleLogoError = () => {
    setLogoError(true);
  };
  
  return (
    <nav className="bg-white">
      <div className="w-full px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-14">
          {/* Logo/Brand */}
          <div className="flex items-end gap-x-2">
            <Link 
              to="/" 
              className="flex items-center"
            >
              {/* Show logo image if no error, otherwise show text fallback */}
              {!logoError ? (
                <img 
                  src="/TxT-Sanitizer-Logo.png"
                  alt="TxT Sanitizer Logo"
                  className="h-8 w-auto sm:h-10"
                  onError={handleLogoError}
                />
              ) : (
                <span className="text-xl font-bold text-gray-900">
                  TxT Sanitizer
                </span>
              )}
            </Link>
            {/* By Sano text - positioned at bottom */}
            <div className="text-xs text-gray-500 mb-1">
              <span>By </span>
              <a 
                href="https://www.linkedin.com/in/sanwar-hosen/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-brand-blue hover:text-blue-800 hover:underline transition-colors duration-200 font-medium"
              >
                Sano
              </a>
            </div>
          </div>
          
          {/* Navigation Links */}
          <div className="flex space-x-4">
            <Link
              to="/history"
              className={`px-3 py-2 rounded-md text-sm font-semibold leading-normal transition-all duration-75 ${
                isActive('/history') 
                  ? 'text-blue-600 bg-blue-50' 
                  : 'text-gray-900 hover:text-blue-600'
              }`}
            >
              <span 
                className={`transition-all duration-75 ${
                  isActive('/history') 
                    ? '' 
                    : 'drop-shadow-blueshadow-none hover:drop-shadow-blueshadow'
                }`}
              >
                History
              </span>
            </Link>
            <Link
              to="/settings"
              className={`p-2 rounded-full text-sm font-medium transition-all duration-75 flex items-center justify-center ${
                isActive('/settings') 
                  ? 'text-blue-600 bg-blue-50' 
                  : 'text-gray-900 hover:text-blue-600'
              }`}
              title="Settings"
              aria-label="Settings page"
            >
              <Icon 
                icon="mingcute:settings-3-line" 
                className={`w-5 h-5 sm:w-6 sm:h-6 transition-all duration-75 ${
                  isActive('/settings') 
                    ? '' 
                    : 'drop-shadow-blueshadow-none hover:drop-shadow-blueshadow'
                }`}
              />
            </Link>
            <Link
              to="/about"
              className={`p-2 rounded-full text-sm font-medium transition-all duration-75 flex items-center justify-center ${
                isActive('/about') 
                  ? 'text-blue-600 bg-blue-50' 
                  : 'text-gray-900 hover:text-blue-600'
              }`}
              title="About"
              aria-label="About page"
            >
              <Icon 
                icon="octicon:info-24" 
                className={`w-5 h-5 sm:w-6 sm:h-6 transition-all duration-75 ${
                  isActive('/about') 
                    ? '' 
                    : 'drop-shadow-blueshadow-none hover:drop-shadow-blueshadow'
                }`}
              />
            </Link>
            {/* Add more navigation links here as the app grows */}
          </div>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;