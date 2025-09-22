// About page component
// This page provides comprehensive information about the TxT Sanitizer application
// Features detailed documentation, usage instructions, and technical information

function About() {
  // Content data structures for easier maintenance
  const coreFeatures = [
    "Smart Text Sanitization: Apply predefined or custom rules to clean and format text",
    "Multiple Preset Modes: Choose from various sanitization presets for different use cases",
    "Real-time Processing: Instant text transformation with live preview",
    "File Upload Support: Load .txt and .md files directly",
    "History Management: Track all your sanitization operations with full history"
  ];

  const uiFeatures = [
    "Dual-Pane Editor: Side-by-side input and output text areas",
    "Preset Tab System: Easy switching between sanitization modes", 
    "Keyboard Shortcuts: Quick actions with Ctrl+Enter",
    "Character Count: Real-time character counting for both input and output",
    "Clipboard Integration: One-click paste and copy functionality"
  ];

  const basicUsageSteps = [
    "Select a Preset: Choose from available sanitization modes in the tabs",
    "Input Text: Type or paste your text in the left textarea",
    "Sanitize: Click \"Sanitize\" button or press Ctrl+Enter",
    "Copy Results: Use \"Copy Text\" button to copy sanitized output",
    "Redo Processing: Use \"Redo\" button to move output back to input for multi-step processing with different presets"
  ];

  const fileUploadSteps = [
    "Click the attachment icon in the bottom control bar",
    "Select a .txt or .md file (max 1MB)",
    "File content loads automatically into input area"
  ];

  const historyManagement = [
    "View: Navigate to History page for all past operations",
    "Edit: Click edit button to reload text into main editor",
    "Delete: Remove unwanted history entries",
    "Sort: Organize history by date (newest/oldest first)"
  ];

  const builtWith = [
    "React 18: Modern React with hooks and functional components",
    "Vite: Fast build tool and development server",
    "Tailwind CSS: Utility-first CSS framework",
    "React Router DOM: Client-side routing",
    "Iconify React: Comprehensive icon library"
  ];

  const architecture = [
    "Component-Based: Modular, reusable components",
    "Local Storage: Client-side data persistence",
    "Device Isolation: Separate data per device using unique identifiers",
    "Clean Code Principles: Readable, maintainable codebase"
  ];

  const keyComponents = [
    "PresetTabs: Preset selection interface",
    "TextAreaPanel: Main text editing interface",
    "ControlBar: File upload and statistics",
    "FileUpload: Drag-and-drop file handling",
    "HistoryCard: Individual history entry display"
  ];

  const nearTermFeatures = [
    {
      title: "📥 History Export/Import",
      description: "Export your sanitization history to JSON files for backup, sharing, or importing on other devices.",
      details: [
        "Export entire history or selected entries",
        "Import history from other TxT Sanitizer instances", 
        "Merge or replace existing history"
      ]
    },
    {
      title: "🎯 Multiple Preset Selection", 
      description: "Apply multiple presets in sequence with custom prioritization and ordering.",
      details: [
        "Multi-select preset interface",
        "Drag-and-drop preset ordering",
        "Chain multiple sanitization rules"
      ]
    }
  ];

  const longTermFeatures = [
    {
      title: "🔗 Public Sharing Links",
      description: "Generate shareable public links for text content, presets, and settings.",
      details: [
        "Share processed text with custom URLs",
        "Export and share custom presets",
        "Collaborative text processing workflows",
        "Optional password protection"
      ]
    },
    {
      title: "☁️ Cloud Integration",
      description: "Account creation with Google Drive sync for cross-device access and backup.", 
      details: [
        "User accounts with secure authentication",
        "Google Drive automatic sync",
        "Cross-device history and settings", 
        "Cloud backup and restore"
      ]
    }
  ];

  const bestPractices = [
    "Test rules before applying to important text",
    "Use history feature to track changes",
    "Keep original files as backup before processing",
    "Lower priority numbers execute first"
  ];

  const performanceNotes = [
    "File size limit: 1MB for uploads",
    "Optimized for large text processing",
    "Real-time character counting",
    "Efficient storage management"
  ];

  const philosophyPoints = [
    "Clean Code: Prioritizing readability and maintainability",
    "User Experience: Intuitive interface design",
    "Performance: Fast, responsive interactions",
    "Accessibility: Following web accessibility guidelines"
  ];
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="w-full px-4 sm:px-6 lg:px-8 py-8">
        {/* Header Section */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            TxT Sanitizer
          </h1>
          <p className="text-xl text-gray-600 w-full max-w-4xl mx-auto">
            A powerful, modern text cleaning and sanitization tool built with React, designed to help users clean, format, and sanitize various types of text content efficiently.
          </p>
        </div>

        {/* Features Section */}
        <div className="bg-white rounded-lg shadow-md p-8 mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
            <span className="text-2xl mr-2">🚀</span>
            Features
          </h2>
          
          <div className="grid md:grid-cols-2 gap-8">
            <div>
              <h3 className="text-lg font-semibold text-gray-800 mb-3">Core Functionality</h3>
              <ul className="space-y-2 text-gray-600">
                {coreFeatures.map((feature, index) => {
                  const [title, description] = feature.split(': ');
                  return (
                    <li key={index} className="flex items-start">
                      <span className="text-brand-blue mr-2">•</span>
                      <span>
                        <strong>{title}:</strong> {description.includes('.txt') ? (
                          <>
                            Load <code className="bg-gray-100 px-1 rounded">.txt</code> and <code className="bg-gray-100 px-1 rounded">.md</code> files directly
                          </>
                        ) : description}
                      </span>
                    </li>
                  );
                })}
              </ul>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold text-gray-800 mb-3">User Interface</h3>
              <ul className="space-y-2 text-gray-600">
                {uiFeatures.map((feature, index) => {
                  const [title, description] = feature.split(': ');
                  return (
                    <li key={index} className="flex items-start">
                      <span className="text-brand-blue mr-2">•</span>
                      <span>
                        <strong>{title}:</strong> {description.includes('Ctrl+Enter') ? (
                          <>
                            Quick actions with <kbd className="bg-gray-200 px-2 py-1 rounded text-sm">Ctrl+Enter</kbd>
                          </>
                        ) : description}
                      </span>
                    </li>
                  );
                })}
              </ul>
            </div>
          </div>
        </div>

        {/* How to Use Section */}
        <div className="bg-white rounded-lg shadow-md p-8 mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
            <span className="text-2xl mr-2">🎯</span>
            How to Use
          </h2>
          
          <div className="grid md:grid-cols-2 gap-8">
            <div>
              <h3 className="text-lg font-semibold text-gray-800 mb-3">Basic Usage</h3>
              <ol className="space-y-2 text-gray-600">
                {basicUsageSteps.map((step, index) => {
                  const [title, description] = step.split(': ');
                  return (
                    <li key={index} className="flex items-start">
                      <span className="bg-brand-blue text-white rounded-full w-5 h-5 flex items-center justify-center text-sm mr-3 mt-0.5 flex-shrink-0">{index + 1}</span>
                      <span>
                        <strong>{title}:</strong> {description.includes('Ctrl+Enter') ? (
                          <>
                            Click "Sanitize" button or press <kbd className="bg-gray-200 px-1 rounded text-sm">Ctrl+Enter</kbd>
                          </>
                        ) : description}
                      </span>
                    </li>
                  );
                })}
              </ol>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold text-gray-800 mb-3">File Upload</h3>
              <ol className="space-y-2 text-gray-600 mb-6">
                {fileUploadSteps.map((step, index) => (
                  <li key={index} className="flex items-start">
                    <span className="bg-green-600 text-white rounded-full w-5 h-5 flex items-center justify-center text-sm mr-3 mt-0.5 flex-shrink-0">{index + 1}</span>
                    <span>
                      {step.includes('.txt') ? (
                        <>
                          Select a <code className="bg-gray-100 px-1 rounded">.txt</code> or <code className="bg-gray-100 px-1 rounded">.md</code> file (max 1MB)
                        </>
                      ) : step}
                    </span>
                  </li>
                ))}
              </ol>
              
              <h3 className="text-lg font-semibold text-gray-800 mb-3">History Management</h3>
              <ul className="space-y-1 text-gray-600">
                {historyManagement.map((item, index) => {
                  const [action, description] = item.split(': ');
                  return (
                    <li key={index}>
                      <strong>{action}:</strong> {description}
                    </li>
                  );
                })}
              </ul>
            </div>
          </div>
        </div>

        {/* Technical Details Section */}
        <div className="bg-white rounded-lg shadow-md p-8 mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
            <span className="text-2xl mr-2">🛠️</span>
            Technical Details
          </h2>
          
          <div className="grid md:grid-cols-3 gap-8">
            <div>
              <h3 className="text-lg font-semibold text-gray-800 mb-3">Built With</h3>
              <ul className="space-y-1 text-gray-600">
                {builtWith.map((tech, index) => {
                  const [name, description] = tech.split(': ');
                  return (
                    <li key={index}>
                      <strong>{name}:</strong> {description}
                    </li>
                  );
                })}
              </ul>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold text-gray-800 mb-3">Architecture</h3>
              <ul className="space-y-1 text-gray-600">
                {architecture.map((item, index) => {
                  const [name, description] = item.split(': ');
                  return (
                    <li key={index}>
                      <strong>{name}:</strong> {description}
                    </li>
                  );
                })}
              </ul>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold text-gray-800 mb-3">Key Components</h3>
              <ul className="space-y-1 text-gray-600">
                {keyComponents.map((component, index) => {
                  const [name, description] = component.split(': ');
                  return (
                    <li key={index}>
                      <code className="bg-gray-100 px-1 rounded">{name}</code>: {description}
                    </li>
                  );
                })}
              </ul>
            </div>
          </div>
        </div>

        {/* Future Features Section */}
        <div className="bg-white rounded-lg shadow-md p-8 mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
            <span className="text-2xl mr-2">🚧</span>
            Future Features & Roadmap
          </h2>
          
          <div className="space-y-8">
            {/* Near Term Features */}
            <div>
              <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-md text-sm mr-2">NEAR TERM</span>
                Planned Features
              </h3>
              <div className="grid md:grid-cols-2 gap-6">
                {nearTermFeatures.map((feature, index) => (
                  <div key={index} className="border-l-4 border-blue-400 pl-4">
                    <h4 className="font-semibold text-gray-800 mb-2">{feature.title}</h4>
                    <p className="text-gray-600 text-sm mb-2">
                      {feature.description}
                    </p>
                    <ul className="text-gray-500 text-xs space-y-1">
                      {feature.details.map((detail, detailIndex) => (
                        <li key={detailIndex}>• {detail}</li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </div>

            {/* Long Term Features */}
            <div>
              <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                <span className="bg-purple-100 text-purple-800 px-2 py-1 rounded-md text-sm mr-2">LONG TERM</span>
                Advanced Features
              </h3>
              <div className="grid md:grid-cols-2 gap-6">
                {longTermFeatures.map((feature, index) => (
                  <div key={index} className="border-l-4 border-purple-400 pl-4">
                    <h4 className="font-semibold text-gray-800 mb-2">{feature.title}</h4>
                    <p className="text-gray-600 text-sm mb-2">
                      {feature.description}
                    </p>
                    <ul className="text-gray-500 text-xs space-y-1">
                      {feature.details.map((detail, detailIndex) => (
                        <li key={detailIndex}>• {detail}</li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </div>

            {/* Development Status */}
            <div className="bg-gray-50 rounded-lg p-6 border-2 border-dashed border-gray-200">
              <h3 className="text-lg font-semibold text-gray-800 mb-3 flex items-center">
                <span className="text-lg mr-2">📋</span>
                Development Status
              </h3>
              <div className="grid md:grid-cols-3 gap-4">
                <div className="text-center">
                  <div className="bg-green-100 text-green-800 rounded-full px-3 py-1 text-sm font-semibold mb-1">
                    ✅ COMPLETE
                  </div>
                  <p className="text-xs text-gray-600">Core sanitization engine, preset system, history management</p>
                </div>
                <div className="text-center">
                  <div className="bg-blue-100 text-blue-800 rounded-full px-3 py-1 text-sm font-semibold mb-1">
                    🚧 PLANNING
                  </div>
                  <p className="text-xs text-gray-600">Export/import functionality, multiple preset selection</p>
                </div>
                <div className="text-center">
                  <div className="bg-purple-100 text-purple-800 rounded-full px-3 py-1 text-sm font-semibold mb-1">
                    🔮 FUTURE
                  </div>
                  <p className="text-xs text-gray-600">Cloud integration, public sharing, collaborative features</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Tips & Creator Section */}
        <div className="grid md:grid-cols-2 gap-8">
          {/* Tips Section */}
          <div className="bg-white rounded-lg shadow-md p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
              <span className="text-2xl mr-2">💡</span>
              Tips & Tricks
            </h2>
            
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-2">Keyboard Shortcuts</h3>
                <p className="text-gray-600"><kbd className="bg-gray-200 px-2 py-1 rounded text-sm">Ctrl+Enter</kbd> - Sanitize text</p>
              </div>
              
              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-2">Best Practices</h3>
                <ul className="space-y-1 text-gray-600 text-sm">
                  {bestPractices.map((practice, index) => (
                    <li key={index}>• {practice}</li>
                  ))}
                </ul>
              </div>
              
              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-2">Performance</h3>
                <ul className="space-y-1 text-gray-600 text-sm">
                  {performanceNotes.map((note, index) => (
                    <li key={index}>• {note}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>

          {/* Creator Section */}
          <div className="bg-white rounded-lg shadow-md p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
              <span className="text-2xl mr-2">🤝</span>
              About the Creator
            </h2>
            
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-2">Created by Sano (Sanwar Hosen)</h3>
                <ul className="space-y-1 text-gray-600">
                  <li>• GitHub: <a href="https://github.com/sanwar-hosen" className="text-brand-blue hover:underline" target="_blank" rel="noopener noreferrer">@sanwar-hosen</a></li>
                  <li>• LinkedIn: <a href="https://www.linkedin.com/in/sanwar-hosen/" className="text-brand-blue hover:underline" target="_blank" rel="noopener noreferrer">Connect with Sano</a></li>
                  <li>• Repository: <a href="https://github.com/sanwar-hosen/TxT-Sanitizer" className="text-brand-blue hover:underline" target="_blank" rel="noopener noreferrer">TxT-Sanitizer</a></li>
                </ul>
              </div>
              
              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-2">Development Philosophy</h3>
                <ul className="space-y-1 text-gray-600 text-sm">
                  {philosophyPoints.map((point, index) => {
                    const [title, description] = point.split(': ');
                    return (
                      <li key={index}>• <strong>{title}:</strong> {description}</li>
                    );
                  })}
                </ul>
              </div>
              
              <div className="pt-4 border-t">
                <p className="text-sm text-gray-500">
                  <strong>Version:</strong> 1.0.0 • <strong>Updated:</strong> September 2025
                </p>
                <p className="text-sm text-gray-500 mt-1">
                  Available for personal and educational use under Non-Commercial License
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-12 pt-8 border-t">
          <p className="text-gray-500 italic">
            TxT Sanitizer - Making text cleaning simple and efficient ✨
          </p>
        </div>
      </div>
    </div>
  );
}

export default About;