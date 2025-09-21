// FileUpload component
// Handles file upload functionality for .txt and .md files
// Provides a clickable attachment icon with file validation

import { Icon } from '@iconify/react';

function FileUpload({ onFileLoad, className = "" }) {
  // Handle file upload for .txt and .md files
  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    // Check file extension
    const allowedExtensions = ['.txt', '.md'];
    const fileExtension = file.name.toLowerCase().slice(file.name.lastIndexOf('.'));
    
    if (!allowedExtensions.includes(fileExtension)) {
      alert('Please select a .txt or .md file only.');
      // Clear the file input
      event.target.value = '';
      return;
    }

    // Check file size (limit to 1MB)
    if (file.size > 1024 * 1024) {
      alert('File is too large. Please select a file smaller than 1MB.');
      event.target.value = '';
      return;
    }

    // Read the file content
    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target.result;
      
      // Call the callback function with file content and filename
      if (onFileLoad) {
        onFileLoad(content, file.name);
      }
      
      // Clear the file input for next use
      event.target.value = '';
    };
    
    reader.onerror = () => {
      console.error('Error reading file');
      alert('Error reading file. Please try again.');
      event.target.value = '';
    };
    
    reader.readAsText(file);
  };

  // Trigger file input click
  const handleAttachmentClick = () => {
    document.getElementById('file-upload-input').click();
  };

  return (
    <>
      {/* Clickable Attachment Button */}
      <button 
        onClick={handleAttachmentClick}
        className={`p-1 rounded hover:bg-gray-200 transition-colors ${className}`}
        title="Upload text file (.txt, .md)"
      >
        <Icon icon="mdi:attachment" className="w-5 h-5 hover:text-brand-blue transition-colors" />
      </button>

      {/* Hidden File Input */}
      <input
        id="file-upload-input"
        type="file"
        accept=".txt,.md"
        onChange={handleFileUpload}
        className="hidden"
      />
    </>
  );
}

export default FileUpload;