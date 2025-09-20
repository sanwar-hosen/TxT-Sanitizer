// Home page component
// This is the main landing page of the TxT Sanitizer application
// Features input/output textareas with mode selection and sanitize functionality

import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Icon } from '@iconify/react';
import { getPresets } from '@/utils/storage';

function Home() {
  // State for managing input and output text
  const [inputText, setInputText] = useState('');
  const [outputText, setOutputText] = useState('');
  const [selectedMode, setSelectedMode] = useState('Standard');
  const [availableModes, setAvailableModes] = useState([]);
  const [showMoreDropdown, setShowMoreDropdown] = useState(false);

  // Load modes from localStorage on component mount
  useEffect(() => {
    try {
      const presets = getPresets();
      // Filter out default presets and get custom ones
      const customModes = presets
        .filter(preset => !preset.isDefault)
        .map(preset => ({
          id: preset.id,
          name: preset.name
        }));
      
      setAvailableModes(customModes);
    } catch (error) {
      console.error('Error loading modes from storage:', error);
      setAvailableModes([]);
    }
  }, []);

  // Prepare modes for display
  const visibleModes = ['Standard']; // Always show Standard first
  const firstTwoCustomModes = availableModes.slice(0, 2);
  const remainingModes = availableModes.slice(2);

  // Add first two custom modes to visible modes
  firstTwoCustomModes.forEach(mode => {
    visibleModes.push(mode.name);
  });

  // Only show "More" if there are remaining modes
  const hasMoreModes = remainingModes.length > 0;

  // Calculate character counts
  const inputCharCount = inputText.length;
  const outputCharCount = outputText.length;

  // Handle paste text from clipboard
  const handlePasteText = async () => {
    try {
      const text = await navigator.clipboard.readText();
      setInputText(text); // Replace existing text with clipboard content
    } catch (error) {
      console.error('Failed to read clipboard:', error);
    }
  };

  // Handle copy output text to clipboard
  const handleCopyText = async () => {
    try {
      await navigator.clipboard.writeText(outputText);
      // Could add a toast notification here later
    } catch (error) {
      console.error('Failed to copy to clipboard:', error);
    }
  };

  // Handle sanitize button click (static for now)
  const handleSanitize = () => {
    // This will be implemented later with actual sanitization logic
    // For now, just copy input to output as placeholder
    setOutputText(inputText);
    console.log('Sanitizing text with mode:', selectedMode);
  };

  // Handle mode selection from dropdown
  const handleModeSelect = (modeName) => {
    setSelectedMode(modeName);
    setShowMoreDropdown(false);
  };

  return (
    <div className="w-full max-w-7xl mx-auto p-4">
      <Card className="w-full">
        <CardContent className="p-6">
          {/* Mode Selection Tabs */}
          <div className="flex items-center mb-6 border-b relative">
            <span className="text-sm font-medium text-gray-600 mr-4">Modes:</span>
            
            {/* Visible Mode Tabs */}
            {visibleModes.map((mode) => (
              <button
                key={mode}
                onClick={() => setSelectedMode(mode)}
                className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
                  selectedMode === mode
                    ? 'text-brand-blue border-brand-blue'
                    : 'text-gray-500 border-transparent hover:text-gray-700'
                }`}
              >
                {mode}
              </button>
            ))}
            
            {/* More Dropdown */}
            {hasMoreModes && (
              <div className="relative">
                <button
                  onClick={() => setShowMoreDropdown(!showMoreDropdown)}
                  className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors flex items-center ${
                    remainingModes.some(mode => mode.name === selectedMode)
                      ? 'text-brand-blue border-brand-blue'
                      : 'text-gray-500 border-transparent hover:text-gray-700'
                  }`}
                >
                  More
                  <Icon 
                    icon={showMoreDropdown ? "mdi:chevron-up" : "mdi:chevron-down"} 
                    className="w-4 h-4 ml-1" 
                  />
                </button>
                
                {/* Dropdown Menu */}
                {showMoreDropdown && (
                  <div className="absolute top-full left-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-10 min-w-[120px]">
                    {remainingModes.map((mode) => (
                      <button
                        key={mode.id}
                        onClick={() => handleModeSelect(mode.name)}
                        className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-50 first:rounded-t-lg last:rounded-b-lg transition-colors ${
                          selectedMode === mode.name
                            ? 'text-brand-blue bg-blue-50'
                            : 'text-gray-700'
                        }`}
                      >
                        {mode.name}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Main Textarea Area */}
          <div className="relative">
            <div className="grid grid-cols-2 gap-0 border rounded-lg overflow-hidden">
              {/* Input Textarea */}
              <div className="relative">
                <Textarea
                  placeholder="To rewrite text, enter or paste it here and press 'Sanitize.'"
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  className="min-h-[400px] resize-none border-0 rounded-none focus:ring-0 focus:border-0"
                />
                
                {/* Paste Text Button - Bottom Left */}
                <Button 
                  onClick={handlePasteText}
                  variant="outline" 
                  size="icon"
                  className="absolute bottom-4 left-4 text-brand-blue border-brand-blue hover:bg-blue-50"
                >
                  <Icon icon="mdi:clipboard-outline" className="w-4 h-4" />
                </Button>

                {/* Sanitize Button - Bottom Right of Left Textarea */}
                <Button 
                  onClick={handleSanitize}
                  className="absolute bottom-4 right-4 bg-brand-blue hover:bg-blue-700 text-white px-6 py-2 text-sm font-medium"
                >
                  Sanitize
                </Button>
              </div>

              {/* Dividing Line */}
              <div className="relative border-l">
                <Textarea
                  placeholder="Sanitized text will appear here..."
                  value={outputText}
                  readOnly
                  className="min-h-[400px] resize-none border-0 rounded-none bg-gray-50 cursor-default focus:ring-0 focus:border-0"
                />
              </div>
            </div>

            {/* Bottom Control Bar */}
            <div className="flex items-center justify-between mt-4 px-2">
              {/* Left Side - Attachment Icon + Input Character Count */}
              <div className="flex items-center gap-4 text-sm text-gray-500">
                <Icon icon="mdi:attachment" className="w-5 h-5" />
                <span>{inputCharCount} Char</span>
              </div>

              {/* Right Side - Output Character Count + Copy Button */}
              <div className="flex items-center gap-4 text-sm text-gray-500">
                <span>{outputCharCount} Char</span>
                {outputText && (
                  <Button 
                    onClick={handleCopyText}
                    variant="outline" 
                    className="text-brand-blue border-brand-blue hover:bg-blue-50"
                    size="sm"
                  >
                    <Icon icon="mdi:content-copy" className="w-4 h-4 mr-2" />
                    Copy Text
                  </Button>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default Home;