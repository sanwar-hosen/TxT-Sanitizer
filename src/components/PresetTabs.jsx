import { Icon } from '@iconify/react';

/**
 * PresetTabs Component
 * 
 * Handles the display and selection of text sanitization presets.
 * Shows up to 4 base presets as tabs, with a dropdown for additional presets.
 * 
 * Features:
 * - Tab-based interface for quick preset switching
 * - Dropdown menu for additional presets beyond the first 4
 * - Visual highlighting for the currently selected preset
 * - Separate handling for base presets vs dropdown presets
 */
function PresetTabs({ 
  visiblePresets, 
  selectedMode, 
  dropdownPresets, 
  onBasePresetSelect, 
  onModeSelect, 
  showMoreDropdown, 
  setShowMoreDropdown 
}) {
  // Only show "More" dropdown if there are presets not in visible list
  const hasMorePresets = dropdownPresets.length > 0;

  return (
    <div className="flex items-center mb-4 border-b relative">
      <span className="text-sm font-medium text-gray-600 mr-4">Modes:</span>
      
      {/* Visible Preset Tabs */}
      {visiblePresets.map((preset, index) => (
        <button
          key={preset.id}
          onClick={() => {
            // If it's one of the first 4 presets, handle differently
            if (index < 4) {
              onBasePresetSelect(preset.name);
            } else {
              // If it's the 5th preset, just set as selected
              onModeSelect(preset.name);
            }
          }}
          className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
            selectedMode === preset.name
              ? 'text-brand-blue border-brand-blue'
              : 'text-gray-500 border-transparent hover:text-gray-700 hover:bg-gray-50'
          }`}
        >
          {preset.name}
        </button>
      ))}
      
      {/* More Dropdown */}
      {hasMorePresets && (
        <div className="relative">
          <button
            onClick={() => setShowMoreDropdown(!showMoreDropdown)}
            className="px-4 py-2 text-sm font-medium border-b-2 border-transparent text-gray-500 hover:text-gray-700 transition-colors flex items-center"
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
              {dropdownPresets.map((preset) => (
                <button
                  key={preset.id}
                  onClick={() => onModeSelect(preset.name)}
                  className="w-full text-left px-4 py-2 text-sm hover:bg-gray-50 first:rounded-t-lg last:rounded-b-lg transition-colors text-gray-700"
                >
                  {preset.name}
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default PresetTabs;