// Storage utility functions for TxT Sanitizer
// Manages localStorage operations for device identification, presets, and history

import defaultPresetsData from '@/data/defaultPresets.json';

/**
 * Generate a short 5-character random ID
 * @returns {string} 5-character random ID
 */
function generateShortId() {
  const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < 5; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

/**
 * Get or create device ID for current user
 * @returns {string} Device ID
 */
export function getDeviceId() {
  const existingId = localStorage.getItem('txt_sanitizer_device_id');
  
  if (existingId) {
    return existingId;
  }
  
  // Generate new device ID using crypto.randomUUID()
  const newDeviceId = crypto.randomUUID();
  localStorage.setItem('txt_sanitizer_device_id', newDeviceId);
  return newDeviceId;
}

// ==================== PRESETS MANAGEMENT ====================

/**
 * Get all sanitization presets for current device
 * @returns {Array} Array of preset objects
 */
export function getPresets() {
  try {
    const deviceId = getDeviceId();
    const presets = localStorage.getItem(`txt_sanitizer_presets_${deviceId}`);
    return presets ? JSON.parse(presets) : getDefaultPresets();
  } catch (error) {
    console.error('Error loading presets:', error);
    return getDefaultPresets();
  }
}

/**
 * Get default sanitization presets from JSON file
 * @returns {Array} Default preset configurations
 */
function getDefaultPresets() {
  return defaultPresetsData.map(preset => ({
    ...preset,
    createdAt: new Date().toISOString()
  }));
}

/**
 * Save a preset for current device
 * @param {Object} preset - Preset object to save
 */
export function savePreset(preset) {
  try {
    const deviceId = getDeviceId();
    const presets = getPresets();
    
    // Add or update preset
    const existingIndex = presets.findIndex(p => p.id === preset.id);
    
    if (existingIndex >= 0) {
      // Update existing preset
      presets[existingIndex] = {
        ...preset,
        updatedAt: new Date().toISOString()
      };
    } else {
      // Add new preset
      const newPreset = {
        ...preset,
        id: preset.id || generateShortId(),
        createdAt: new Date().toISOString(),
        isDefault: false
      };
      presets.push(newPreset);
    }
    
    localStorage.setItem(`txt_sanitizer_presets_${deviceId}`, JSON.stringify(presets));
  } catch (error) {
    console.error('Error saving preset:', error);
    throw new Error('Failed to save preset');
  }
}

/**
 * Delete a preset for current device
 * @param {string} id - ID of preset to delete
 */
export function deletePreset(id) {
  try {
    const deviceId = getDeviceId();
    const presets = getPresets();
    const preset = presets.find(p => p.id === id);
    
    if (!preset) {
      throw new Error('Preset not found');
    }
    
    const updatedPresets = presets.filter(p => p.id !== id);
    localStorage.setItem(`txt_sanitizer_presets_${deviceId}`, JSON.stringify(updatedPresets));
  } catch (error) {
    console.error('Error deleting preset:', error);
    throw new Error('Failed to delete preset');
  }
}

// ==================== HISTORY MANAGEMENT ====================

/**
 * Get sanitization history for current device
 * @returns {Array} Array of history objects
 */
export function getHistory() {
  try {
    const deviceId = getDeviceId();
    const history = localStorage.getItem(`txt_sanitizer_history_${deviceId}`);
    const parsedHistory = history ? JSON.parse(history) : [];
    
    // Sort by timestamp (newest first)
    return parsedHistory.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
  } catch (error) {
    console.error('Error loading history:', error);
    return [];
  }
}

/**
 * Save a history entry for current device
 * @param {Object} entry - History entry object
 */
export function saveHistory(entry) {
  try {
    const deviceId = getDeviceId();
    const history = getHistory();
    
    const newEntry = {
      id: generateShortId(),
      timestamp: new Date().toISOString(),
      ...entry
    };
    
    // Add to beginning of array (newest first)
    history.unshift(newEntry);
    
    // Keep only latest 100 entries to prevent localStorage overflow
    const limitedHistory = history.slice(0, 100);
    
    localStorage.setItem(`txt_sanitizer_history_${deviceId}`, JSON.stringify(limitedHistory));
  } catch (error) {
    console.error('Error saving history entry:', error);
    throw new Error('Failed to save history entry');
  }
}

/**
 * Delete a specific history entry for current device
 * @param {string} id - ID of history entry to delete
 */
export function deleteHistory(id) {
  try {
    const deviceId = getDeviceId();
    const history = getHistory();
    const updatedHistory = history.filter(entry => entry.id !== id);
    
    localStorage.setItem(`txt_sanitizer_history_${deviceId}`, JSON.stringify(updatedHistory));
  } catch (error) {
    console.error('Error deleting history entry:', error);
    throw new Error('Failed to delete history entry');
  }
}

/**
 * Clear all history entries for current device
 */
export function clearHistory() {
  try {
    const deviceId = getDeviceId();
    localStorage.setItem(`txt_sanitizer_history_${deviceId}`, JSON.stringify([]));
  } catch (error) {
    console.error('Error clearing history:', error);
    throw new Error('Failed to clear history');
  }
}

// ==================== IMPORT/EXPORT FUNCTIONALITY ====================

/**
 * Export presets as JSON string for current device
 * @returns {string} JSON string of all custom presets
 */
export function exportPresets() {
  try {
    const allPresets = getPresets();
    // Only export custom presets (not default ones)
    const customPresets = allPresets.filter(preset => !preset.isDefault);
    
    return JSON.stringify({
      exportedAt: new Date().toISOString(),
      deviceId: getDeviceId(),
      presets: customPresets
    }, null, 2);
  } catch (error) {
    console.error('Error exporting presets:', error);
    throw new Error('Failed to export presets');
  }
}

/**
 * Import presets from JSON string for current device
 * @param {string} json - JSON string containing presets data
 * @returns {Object} Import result with success status and message
 */
export function importPresets(json) {
  try {
    const importData = JSON.parse(json);
    
    // Validate import data structure
    if (!importData.presets || !Array.isArray(importData.presets)) {
      throw new Error('Invalid preset file format');
    }
    
    const currentPresets = getPresets();
    let importedCount = 0;
    let skippedCount = 0;
    
    // Process each preset from import
    importData.presets.forEach(preset => {
      // Check if preset with same name already exists
      const existingPreset = currentPresets.find(p => p.name === preset.name);
      
      if (existingPreset) {
        skippedCount++;
      } else {
        // Add imported preset with new ID and timestamp
        const newPreset = {
          ...preset,
          id: generateShortId(),
          importedAt: new Date().toISOString(),
          isDefault: false
        };
        
        currentPresets.push(newPreset);
        importedCount++;
      }
    });
    
    // Save updated presets
    const deviceId = getDeviceId();
    localStorage.setItem(`txt_sanitizer_presets_${deviceId}`, JSON.stringify(currentPresets));
    
    return {
      success: true,
      message: `Successfully imported ${importedCount} presets. ${skippedCount} presets were skipped (already exist).`,
      importedCount,
      skippedCount
    };
    
  } catch (error) {
    console.error('Error importing presets:', error);
    return {
      success: false,
      message: 'Failed to import presets: ' + error.message
    };
  }
}