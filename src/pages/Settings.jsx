// Settings page component for managing presets and application settings
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Icon } from '@iconify/react';
import { getPresets, savePreset, deletePreset, exportPresets, importPresets, clearHistory } from '@/utils/storage';

export default function Settings() {
  // State for managing presets and UI
  const [presets, setPresets] = useState([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [editingPreset, setEditingPreset] = useState(null);
  const [presetToDelete, setPresetToDelete] = useState(null);
  const [showClearHistoryModal, setShowClearHistoryModal] = useState(false);
  const [showClearAllModal, setShowClearAllModal] = useState(false);

  // Form states for editing and creating presets
  const [editingName, setEditingName] = useState('');
  const [editingRules, setEditingRules] = useState([]);
  const [newPresetName, setNewPresetName] = useState('');
  const [newPresetRules, setNewPresetRules] = useState([
    { priority: 1, find: '', replace: '' }
  ]);

  // Helper function to safely display find/replace patterns
  const formatPatternForDisplay = (pattern) => {
    if (pattern instanceof RegExp) {
      return pattern.toString();
    }
    if (typeof pattern === 'string') {
      return pattern;
    }
    return String(pattern || '');
  };

  // Load presets when component mounts
  useEffect(() => {
    loadPresets();
  }, []);

  // Function to load presets from storage
  const loadPresets = () => {
    try {
      const allPresets = getPresets();
      setPresets(allPresets);
    } catch (error) {
      console.error('Error loading presets:', error);
    }
  };

  // Function to add new rule to new preset
  const addNewRule = () => {
    setNewPresetRules([...newPresetRules, { 
      priority: newPresetRules.length + 1, 
      find: '', 
      replace: '' 
    }]);
  };

  // Function to remove rule from new preset
  const removeNewRule = (index) => {
    if (newPresetRules.length > 1) {
      const updatedRules = newPresetRules.filter((_, i) => i !== index);
      const reorderedRules = updatedRules.map((rule, i) => ({
        ...rule,
        priority: i + 1
      }));
      setNewPresetRules(reorderedRules);
    }
  };

  // Function to create new preset
  const createPreset = async () => {
    try {
      if (!newPresetName.trim()) {
        alert('Please enter a preset name');
        return;
      }
      
      if (newPresetRules.some(rule => !rule.find.trim())) {
        alert('Please fill in all find patterns');
        return;
      }
      
      const newPreset = {
        name: newPresetName,
        rules: newPresetRules
      };
      
      await savePreset(newPreset);
      loadPresets();
      
      setNewPresetName('');
      setNewPresetRules([{ priority: 1, find: '', replace: '' }]);
      setShowAddModal(false);
    } catch (error) {
      console.error('Failed to create preset:', error);
      alert('Failed to create preset: ' + error.message);
    }
  };

  // Function to start editing a preset
  const startEditing = (preset) => {
    setEditingPreset(preset.id);
    setEditingName(preset.name);
    // Convert any RegExp patterns to strings for editing
    const editableRules = preset.rules.map(rule => ({
      ...rule,
      find: formatPatternForDisplay(rule.find),
      replace: formatPatternForDisplay(rule.replace)
    }));
    setEditingRules(editableRules);
  };

  // Function to cancel editing
  const cancelEditing = () => {
    setEditingPreset(null);
    setEditingName('');
    setEditingRules([]);
  };

  // Function to save edited preset
  const saveEditedPreset = async () => {
    try {
      const updatedPreset = {
        id: editingPreset,
        name: editingName,
        rules: editingRules
      };
      
      await savePreset(updatedPreset);
      loadPresets();
      cancelEditing();
    } catch (error) {
      console.error('Failed to save preset:', error);
      alert('Failed to save preset: ' + error.message);
    }
  };

  // Function to add rule to editing preset
  const addEditingRule = () => {
    setEditingRules([...editingRules, { 
      priority: editingRules.length + 1, 
      find: '', 
      replace: '' 
    }]);
  };

  // Function to remove rule from editing preset
  const removeEditingRule = (index) => {
    if (editingRules.length > 1) {
      const updatedRules = editingRules.filter((_, i) => i !== index);
      const reorderedRules = updatedRules.map((rule, i) => ({
        ...rule,
        priority: i + 1
      }));
      setEditingRules(reorderedRules);
    }
  };

  // Function to delete a preset
  const confirmDeletePreset = async () => {
    try {
      await deletePreset(presetToDelete.id);
      loadPresets();
      setShowDeleteModal(false);
      setPresetToDelete(null);
    } catch (error) {
      console.error('Failed to delete preset:', error);
      alert('Failed to delete preset: ' + error.message);
    }
  };

  // Function to handle export
  const handleExport = () => {
    try {
      const jsonData = exportPresets();
      const blob = new Blob([jsonData], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'txt-sanitizer-presets.json';
      a.click();
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Export failed:', error);
      alert('Export failed: ' + error.message);
    }
  };

  // Function to handle import
  const handleImport = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const result = importPresets(e.target.result);
          if (result.success) {
            loadPresets();
            alert(result.message);
          } else {
            alert(result.message);
          }
        } catch (error) {
          console.error('Import failed:', error);
          alert('Import failed: ' + error.message);
        }
      };
      reader.readAsText(file);
    }
  };

  // Function to clear history
  const confirmClearHistory = async () => {
    try {
      await clearHistory();
      setShowClearHistoryModal(false);
      alert('History cleared successfully');
    } catch (error) {
      console.error('Failed to clear history:', error);
      alert('Failed to clear history: ' + error.message);
    }
  };

  // Function to clear all data
  const confirmClearAllData = () => {
    try {
      const deviceId = localStorage.getItem('txt_sanitizer_device_id');
      if (deviceId) {
        localStorage.removeItem(`txt_sanitizer_presets_${deviceId}`);
        localStorage.removeItem(`txt_sanitizer_history_${deviceId}`);
      }
      localStorage.removeItem('txt_sanitizer_device_id');
      
      loadPresets();
      setShowClearAllModal(false);
      alert('All data cleared successfully');
    } catch (error) {
      console.error('Failed to clear all data:', error);
      alert('Failed to clear all data: ' + error.message);
    }
  };

  return (
    <div className="w-full px-4 sm:px-6 lg:px-8 py-4">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Settings</h1>

      {/* Preset Management Section */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Preset Management</span>
            <Button 
              onClick={() => setShowAddModal(true)}
              className="bg-brand-blue hover:bg-blue-700 text-white"
            >
              <Icon icon="mdi:plus" className="w-4 h-4 mr-2" />
              Add New Preset
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4">
            {presets.map((preset) => (
              <Card key={preset.id} className="border-2">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      {editingPreset === preset.id ? (
                        <input
                          type="text"
                          value={editingName}
                          onChange={(e) => setEditingName(e.target.value)}
                          maxLength={20}
                          className="text-lg font-semibold border border-gray-300 rounded px-2 py-1 focus:ring-2 focus:ring-brand-blue"
                        />
                      ) : (
                        <h3 className="font-semibold text-lg">{preset.name}</h3>
                      )}
                      {preset.isDefault && (
                        <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded">
                          Default
                        </span>
                      )}
                    </div>
                    {editingPreset !== preset.id && (
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => startEditing(preset)}
                        >
                          <Icon icon="mdi:pencil" className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setPresetToDelete(preset);
                            setShowDeleteModal(true);
                          }}
                          className="text-red-600 border-red-300 hover:bg-red-50"
                        >
                          <Icon icon="mdi:delete" className="w-4 h-4" />
                        </Button>
                      </div>
                    )}
                    {editingPreset === preset.id && (
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={cancelEditing}
                          className="text-gray-600 border-gray-300 hover:bg-gray-50"
                        >
                          <Icon icon="mdi:close" className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={saveEditedPreset}
                          className="text-green-600 border-green-300 hover:bg-green-50"
                        >
                          <Icon icon="mdi:check" className="w-4 h-4" />
                        </Button>
                      </div>
                    )}
                  </div>
                  
                  {editingPreset === preset.id ? (
                    <div className="space-y-4">
                      <div>
                        <div className="flex items-center justify-between mb-3">
                          <label className="block text-sm font-medium">Rules</label>
                          <Button 
                            onClick={addEditingRule}
                            size="sm"
                            variant="outline"
                            className="text-brand-blue border-brand-blue hover:bg-blue-50"
                          >
                            <Icon icon="mdi:plus" className="w-4 h-4 mr-1" />
                            Add Rule
                          </Button>
                        </div>
                        
                        <div className="space-y-3">
                          {editingRules.map((rule, index) => (
                            <div key={index} className="flex items-center gap-3 p-3 border rounded-lg">
                              <input
                                type="text"
                                value={rule.find}
                                onChange={(e) => {
                                  const updatedRules = [...editingRules];
                                  updatedRules[index].find = e.target.value;
                                  setEditingRules(updatedRules);
                                }}
                                className="flex-1 border border-gray-300 rounded px-3 py-2 focus:ring-1 focus:ring-brand-blue"
                                placeholder="Find text..."
                              />
                              
                              <Icon icon="mdi:arrow-right" className="w-5 h-5 text-gray-400" />
                              
                              <input
                                type="text"
                                value={rule.replace}
                                onChange={(e) => {
                                  const updatedRules = [...editingRules];
                                  updatedRules[index].replace = e.target.value;
                                  setEditingRules(updatedRules);
                                }}
                                className="flex-1 border border-gray-300 rounded px-3 py-2 focus:ring-1 focus:ring-brand-blue"
                                placeholder="Replace with..."
                              />
                              
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => removeEditingRule(index)}
                                disabled={editingRules.length === 1}
                                className="text-red-600 border-red-300 hover:bg-red-50"
                              >
                                <Icon icon="mdi:delete" className="w-4 h-4" />
                              </Button>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <p className="text-sm text-gray-600">{preset.rules.length} rules</p>
                      {preset.rules.map((rule, index) => (
                        <div key={index} className="flex items-center gap-3 p-2 bg-gray-50 rounded">
                          <span className="text-xs font-mono bg-white px-2 py-1 rounded">
                            {rule.priority}
                          </span>
                          <span className="flex-1 font-mono text-sm">
                            "{formatPatternForDisplay(rule.find)}" → "{formatPatternForDisplay(rule.replace)}"
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Import/Export Section */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Import/Export Presets</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4">
            <Button 
              onClick={handleExport}
              variant="outline"
              className="text-brand-blue border-brand-blue hover:bg-blue-50"
            >
              <Icon icon="mdi:upload" className="w-4 h-4 mr-2" />
              Export Presets
            </Button>
            <div>
              <input
                type="file"
                id="import-file"
                accept=".json"
                onChange={handleImport}
                className="hidden"
              />
              <Button 
                onClick={() => document.getElementById('import-file').click()}
                variant="outline"
                className="text-brand-blue border-brand-blue hover:bg-blue-50"
              >
                <Icon icon="mdi:download" className="w-4 h-4 mr-2" />
                Import Presets
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Storage Management Section */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Storage Management</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 bg-gray-50 rounded">
              <h4 className="font-semibold mb-2">Storage Usage</h4>
              <p className="text-sm text-gray-600">
                Presets: {presets.length} items
              </p>
              <p className="text-sm text-gray-600">
                History: Managed automatically
              </p>
            </div>
            <div className="space-y-3">
              <Button 
                onClick={() => setShowClearHistoryModal(true)}
                variant="outline" 
                className="w-full text-orange-600 border-orange-300 hover:bg-orange-50"
              >
                <Icon icon="mdi:history" className="w-4 h-4 mr-2" />
                Clear History
              </Button>
              <Button 
                onClick={() => setShowClearAllModal(true)}
                variant="outline" 
                className="w-full text-red-600 border-red-300 hover:bg-red-50"
              >
                <Icon icon="mdi:delete-sweep" className="w-4 h-4 mr-2" />
                Clear All Data
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Add Preset Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold">Add New Preset</h2>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => setShowAddModal(false)}
              >
                <Icon icon="mdi:close" className="w-4 h-4" />
              </Button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Preset Name</label>
                <input
                  type="text"
                  value={newPresetName}
                  onChange={(e) => setNewPresetName(e.target.value)}
                  maxLength={20}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-brand-blue focus:border-brand-blue"
                  placeholder="Enter preset name..."
                />
                <p className="text-xs text-gray-500 mt-1">{newPresetName.length}/20 characters</p>
              </div>
              
              <div>
                <div className="flex items-center justify-between mb-3">
                  <label className="block text-sm font-medium">Sanitization Rules</label>
                  <Button 
                    onClick={addNewRule}
                    size="sm"
                    variant="outline"
                    className="text-brand-blue border-brand-blue hover:bg-blue-50"
                  >
                    <Icon icon="mdi:plus" className="w-4 h-4 mr-1" />
                    Add Rule
                  </Button>
                </div>
                
                <div className="space-y-3">
                  {newPresetRules.map((rule, index) => (
                    <div key={index} className="flex items-center gap-3 p-3 border rounded-lg">
                      <input
                        type="text"
                        value={rule.find}
                        onChange={(e) => {
                          const updatedRules = [...newPresetRules];
                          updatedRules[index].find = e.target.value;
                          setNewPresetRules(updatedRules);
                        }}
                        className="flex-1 border border-gray-300 rounded px-3 py-2 focus:ring-1 focus:ring-brand-blue"
                        placeholder="Find text..."
                      />
                      
                      <Icon icon="mdi:arrow-right" className="w-5 h-5 text-gray-400" />
                      
                      <input
                        type="text"
                        value={rule.replace}
                        onChange={(e) => {
                          const updatedRules = [...newPresetRules];
                          updatedRules[index].replace = e.target.value;
                          setNewPresetRules(updatedRules);
                        }}
                        className="flex-1 border border-gray-300 rounded px-3 py-2 focus:ring-1 focus:ring-brand-blue"
                        placeholder="Replace with..."
                      />
                      
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => removeNewRule(index)}
                        disabled={newPresetRules.length === 1}
                        className="text-red-600 border-red-300 hover:bg-red-50"
                      >
                        <Icon icon="mdi:delete" className="w-4 h-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
              
              <div className="flex justify-end gap-3 pt-4">
                <Button 
                  variant="outline" 
                  onClick={() => setShowAddModal(false)}
                >
                  Cancel
                </Button>
                <Button 
                  onClick={createPreset}
                  className="bg-brand-blue hover:bg-blue-700 text-white"
                >
                  Create Preset
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && presetToDelete && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <div className="flex items-center gap-3 mb-4">
              <Icon icon="mdi:alert-circle" className="w-6 h-6 text-red-600" />
              <h2 className="text-lg font-bold">Delete Preset</h2>
            </div>
            
            <p className="text-gray-600 mb-6">
              Are you sure you want to delete the preset "{presetToDelete.name}"? 
              This action cannot be undone.
            </p>
            
            <div className="flex justify-end gap-3">
              <Button 
                variant="outline" 
                onClick={() => {
                  setShowDeleteModal(false);
                  setPresetToDelete(null);
                }}
              >
                Cancel
              </Button>
              <Button 
                onClick={confirmDeletePreset}
                className="bg-red-600 hover:bg-red-700 text-white"
              >
                Delete
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Clear History Confirmation Modal */}
      {showClearHistoryModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <div className="flex items-center gap-3 mb-4">
              <Icon icon="mdi:alert-circle" className="w-6 h-6 text-orange-600" />
              <h2 className="text-lg font-bold">Clear History</h2>
            </div>
            
            <p className="text-gray-600 mb-6">
              Are you sure you want to clear all sanitization history? 
              This action cannot be undone.
            </p>
            
            <div className="flex justify-end gap-3">
              <Button 
                variant="outline" 
                onClick={() => setShowClearHistoryModal(false)}
              >
                Cancel
              </Button>
              <Button 
                onClick={confirmClearHistory}
                className="bg-orange-600 hover:bg-orange-700 text-white"
              >
                Clear History
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Clear All Data Confirmation Modal */}
      {showClearAllModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <div className="flex items-center gap-3 mb-4">
              <Icon icon="mdi:alert-circle" className="w-6 h-6 text-red-600" />
              <h2 className="text-lg font-bold">Clear All Data</h2>
            </div>
            
            <p className="text-gray-600 mb-6">
              <strong>Warning:</strong> This will permanently delete all your custom presets, 
              history, and settings. Only default presets will remain. 
              This action cannot be undone.
            </p>
            
            <div className="flex justify-end gap-3">
              <Button 
                variant="outline" 
                onClick={() => setShowClearAllModal(false)}
              >
                Cancel
              </Button>
              <Button 
                onClick={confirmClearAllData}
                className="bg-red-600 hover:bg-red-700 text-white"
              >
                Clear All Data
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
