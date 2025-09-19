// Footer component
// This component provides the main footer for the application
// Appears on all pages with author credit and maintenance contact

import { Icon } from '@iconify/react';

function Footer() {
  return (
    <footer className="bg-white border-t border-gray-200 py-4">
      <div className="max-w-6xl mx-auto px-4">
        <div className="flex justify-between items-center">
          {/* Left side - Author credit */}
          <div className="flex items-center">
            <span className="text-sm text-gray-600">
              Made With 💙 By Sano
            </span>
          </div>
          
          {/* Right side - Maintenance contact */}
          <div className="flex items-center">
            <span className="text-sm text-gray-600 mr-2">
              For Maintenance
            </span>
            <a 
              href="https://t.me/TheSano" 
              target="_blank" 
              rel="noopener noreferrer"
              className="flex items-center text-gray-600 hover:text-brand-blue transition-colors duration-75"
            >
              <Icon 
                icon="ic:round-telegram" 
                className="w-5 h-5" 
              />
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default Footer;