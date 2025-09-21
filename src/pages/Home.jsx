// Home page component
// This is the main landing page of the TxT Sanitizer application
// Features input/output textareas with mode selection and sanitize functionality

import { useState, useEffect, useCallback } from 'react';
import { useLocation } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { getPresets, saveHistory } from '@/utils/storage';
import PresetTabs from '@/components/PresetTabs';
import TextAreaPanel from '@/components/TextAreaPanel';
import ControlBar from '@/components/ControlBar';

function Home() {
  const location = useLocation();
  
  // State for managing input and output text
  const [inputText, setInputText] = useState('');
  const [outputText, setOutputText] = useState('');
  const [selectedMode, setSelectedMode] = useState('');
  const [allPresets, setAllPresets] = useState([]);
  const [baseVisiblePresets, setBaseVisiblePresets] = useState([]); // First 4 presets (permanent)
  const [selectedFromDropdown, setSelectedFromDropdown] = useState(null); // 5th preset (temporary)
  const [showMoreDropdown, setShowMoreDropdown] = useState(false);

  // Load all presets from localStorage on component mount
  useEffect(() => {
    try {
      const presets = getPresets();
      setAllPresets(presets);
      
      // Set first 4 as base visible presets (permanent)
      const initialVisible = presets.slice(0, 4);
      setBaseVisiblePresets(initialVisible);
      
      // Set first preset as selected by default
      if (presets.length > 0) {
        setSelectedMode(presets[0].name);
      }
    } catch (error) {
      console.error('Error loading presets from storage:', error);
      setAllPresets([]);
      setBaseVisiblePresets([]);
    }
  }, []);

  // Handle navigation from History page (edit functionality)
  useEffect(() => {
    if (location.state?.editText) {
      // Set the input text from history
      setInputText(location.state.editText);
      
      // Set the preset if specified
      if (location.state.presetName) {
        setSelectedMode(location.state.presetName);
      }
      
      // Clear the navigation state to prevent re-triggering
      window.history.replaceState({}, document.title);
    }
  }, [location.state]);

  // Handle sanitize button click - now functional
  const handleSanitize = useCallback(() => {
    if (!inputText.trim()) {
      setOutputText('');
      return;
    }

    // Find the selected preset
    const activePreset = allPresets.find(preset => preset.name === selectedMode);
    if (!activePreset) {
      console.error('No active preset found');
      setOutputText(inputText); // Fallback: just copy input
      return;
    }

    // Apply all rules from the preset in priority order
    let sanitizedText = inputText;
    
    // Sort rules by priority to ensure correct order
    const sortedRules = [...activePreset.rules].sort((a, b) => a.priority - b.priority);
    
    sortedRules.forEach(rule => {
      try {
        // Check if the find pattern is a regex-like string pattern
        if (rule.find.startsWith('[') && rule.find.endsWith(']')) {
          // Handle character class patterns like [!@#$%^&*()]
          const pattern = rule.find.slice(1, -1); // Remove brackets
          const regex = new RegExp(`[${pattern.replace(/\\/g, '\\\\')}]`, 'g');
          sanitizedText = sanitizedText.replace(regex, rule.replace);
        } else if (rule.find.includes('\\n') || rule.find.includes('\\t') || rule.find.includes('\\r')) {
          // Handle escape sequences
          const processedFind = rule.find
            .replace(/\\n/g, '\n')
            .replace(/\\t/g, '\t')
            .replace(/\\r/g, '\r');
          sanitizedText = sanitizedText.replace(new RegExp(processedFind, 'g'), rule.replace);
        } else {
          // Handle simple string replacement
          sanitizedText = sanitizedText.replace(new RegExp(rule.find, 'g'), rule.replace);
        }
      } catch (error) {
        console.error('Error applying rule:', rule, error);
        // Continue with other rules even if one fails
      }
    });

    setOutputText(sanitizedText);
    
    // Save to history if text was actually changed
    console.log('Sanitization completed:', {
      inputText: inputText.substring(0, 50) + '...',
      outputText: sanitizedText.substring(0, 50) + '...',
      textChanged: sanitizedText !== inputText,
      inputTrimmed: inputText.trim(),
      selectedMode,
      activePreset: activePreset?.id
    });
    
    if (sanitizedText !== inputText && inputText.trim()) {
      try {
        saveHistory({
          inputText: inputText,
          outputText: sanitizedText,
          presetName: selectedMode,
          presetId: activePreset.id
        });
        console.log('History saved successfully');
      } catch (error) {
        console.error('Failed to save to history:', error);
      }
    } else {
      console.log('History not saved:', {
        reason: sanitizedText === inputText ? 'No changes made' : 'Input text is empty'
      });
    }
    
    console.log('Sanitized text using preset:', selectedMode);
  }, [inputText, allPresets, selectedMode]);

  // Auto-sanitize effect for history edit functionality
  useEffect(() => {
    if (location.state?.autoSanitize && inputText.trim() && selectedMode && allPresets.length > 0) {
      // Small delay to ensure all states are set
      const timeoutId = setTimeout(() => {
        handleSanitize();
      }, 200);
      
      return () => clearTimeout(timeoutId);
    }
  }, [inputText, selectedMode, allPresets, location.state?.autoSanitize, handleSanitize]);

  // Add keyboard shortcut listener for Ctrl+Enter to trigger sanitization
  useEffect(() => {
    const handleKeyDown = (event) => {
      // Check for Ctrl+Enter combination
      if (event.ctrlKey && event.key === 'Enter') {
        event.preventDefault(); // Prevent default behavior
        handleSanitize(); // Trigger sanitize function
      }
    };

    // Add event listener to document
    document.addEventListener('keydown', handleKeyDown);

    // Cleanup event listener on component unmount
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [handleSanitize]); // Only depend on handleSanitize since it already has its own dependencies

  // Combine base presets with selected dropdown preset for display
  const visiblePresets = selectedFromDropdown 
    ? [...baseVisiblePresets, selectedFromDropdown]
    : baseVisiblePresets;

  // Get remaining presets for dropdown (excluding base visible ones and selected dropdown preset)
  const dropdownPresets = allPresets.filter(preset => 
    !baseVisiblePresets.some(visible => visible.id === preset.id) &&
    (!selectedFromDropdown || selectedFromDropdown.id !== preset.id)
  );

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

  // Handle clear input text
  const handleClearInput = () => {
    setInputText('');
    setOutputText(''); // Also clear output when clearing input
  };

  // Handle file upload callback from FileUpload component
  const handleFileLoad = (content, filename) => {
    setInputText(content);
    setOutputText(''); // Clear output when new file is loaded
    console.log(`File loaded: ${filename}`);
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

  // Handle mode selection from dropdown
  const handleModeSelect = (presetName) => {
    // Find the selected preset
    const selectedPreset = allPresets.find(preset => preset.name === presetName);
    if (!selectedPreset) return;

    // Set as selected mode
    setSelectedMode(presetName);
    
    // Set as the temporary 5th preset
    setSelectedFromDropdown(selectedPreset);
    
    // Close dropdown
    setShowMoreDropdown(false);
  };

  // Handle clicking on base preset tabs (first 4)
  const handleBasePresetSelect = (presetName) => {
    setSelectedMode(presetName);
    // Clear the temporary 5th preset when selecting from base presets
    setSelectedFromDropdown(null);
  };

  // Only show "More" dropdown if there are presets not in visible list
  // This logic is now handled within the PresetTabs component

  return (
    <div className="w-full max-w-7xl mx-auto p-3">
      <Card className="w-full">
        <CardContent className="p-5">
          {/* Mode Selection Tabs */}
          <PresetTabs
            visiblePresets={visiblePresets}
            selectedMode={selectedMode}
            dropdownPresets={dropdownPresets}
            onBasePresetSelect={handleBasePresetSelect}
            onModeSelect={handleModeSelect}
            showMoreDropdown={showMoreDropdown}
            setShowMoreDropdown={setShowMoreDropdown}
          />

          {/* Main Textarea Area */}
          <TextAreaPanel
            inputText={inputText}
            outputText={outputText}
            onInputChange={setInputText}
            onClear={handleClearInput}
            onPaste={handlePasteText}
            onSanitize={handleSanitize}
            onCopy={handleCopyText}
          />

          {/* Bottom Control Bar */}
          <ControlBar
            inputCharCount={inputCharCount}
            outputCharCount={outputCharCount}
            onFileLoad={handleFileLoad}
          />
        </CardContent>
      </Card>
    </div>
  );
}

export default Home;