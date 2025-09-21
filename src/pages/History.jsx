// History page component
// This page will display user's text sanitization history

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Icon } from '@iconify/react';
import { getHistory, deleteHistory, clearHistory } from '@/utils/storage';

// Component for individual history card
function HistoryCard({ entry, onDelete, onEdit }) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  
  // Format date to "September 21, 2025 • 3:45 PM"
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const options = { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    };
    return date.toLocaleDateString('en-US', options).replace(' at ', ' • ');
  };

  // Calculate character difference
  const inputLength = entry.inputText.length;
  const outputLength = entry.outputText.length;
  const difference = outputLength - inputLength;
  const differenceText = difference > 0 ? `+${difference}` : `${difference}`;

  // Truncate text for preview (show first ~150 characters)
  const previewText = entry.outputText.length > 150 
    ? entry.outputText.substring(0, 150) + '...'
    : entry.outputText;

  // Handle copy to clipboard
  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(entry.outputText);
    } catch (error) {
      console.error('Failed to copy to clipboard:', error);
    }
  };

  // Handle delete confirmation
  const handleDeleteConfirm = () => {
    onDelete(entry.id);
    setShowDeleteDialog(false);
  };

  return (
    <>
      <Card className="mb-4">
        <CardContent className="p-6">
          {/* Header with date, preset, and character info */}
          <div className="flex justify-between items-start mb-4">
            <div className="flex-1">
              <div className="text-sm text-gray-500 mb-1">
                {formatDate(entry.timestamp)}
              </div>
              <div className="flex items-center gap-4 text-sm text-gray-600">
                <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs">
                  {entry.presetName}
                </span>
                <span>
                  {inputLength} → {outputLength} chars ({differenceText})
                </span>
              </div>
            </div>
            
            {/* Action buttons */}
            <div className="flex items-center gap-2 ml-4">
              <Button
                variant="outline"
                size="icon"
                className="w-8 h-8"
                onClick={handleCopy}
                title="Copy sanitized text"
              >
                <Icon icon="mdi:content-copy" className="w-4 h-4" />
              </Button>
              <Button
                variant="outline"
                size="icon"
                className="w-8 h-8"
                onClick={() => onEdit(entry)}
                title="Edit (go to home with this text)"
              >
                <Icon icon="mdi:pencil" className="w-4 h-4" />
              </Button>
              <Button
                variant="outline"
                size="icon"
                className="w-8 h-8 text-red-600 hover:text-red-700 hover:border-red-300"
                onClick={() => setShowDeleteDialog(true)}
                title="Delete this entry"
              >
                <Icon icon="mdi:delete" className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* Sanitized text content */}
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="whitespace-pre-wrap text-sm text-gray-800">
              {isExpanded ? entry.outputText : previewText}
            </div>
            
            {/* Show more/less button */}
            {entry.outputText.length > 150 && (
              <Button
                variant="ghost"
                size="sm"
                className="mt-2 text-brand-blue hover:text-blue-700"
                onClick={() => setIsExpanded(!isExpanded)}
              >
                {isExpanded ? 'Show less' : 'Show more'}
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Delete Confirmation Dialog */}
      {showDeleteDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <Card className="w-full max-w-md mx-4">
            <CardContent className="p-6">
              <h3 className="text-lg font-semibold mb-2">Delete History Entry</h3>
              <p className="text-gray-600 mb-4">
                Are you sure you want to delete this sanitization from your history? This action cannot be undone.
              </p>
              <div className="flex justify-end gap-3">
                <Button
                  variant="outline"
                  onClick={() => setShowDeleteDialog(false)}
                >
                  Cancel
                </Button>
                <Button
                  variant="outline"
                  onClick={handleDeleteConfirm}
                  className="bg-red-600 text-white hover:bg-red-700 border-red-600 hover:border-red-700"
                >
                  Delete
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </>
  );
}

// Main History component
function History() {
  const [history, setHistory] = useState([]);
  const [sortOrder, setSortOrder] = useState('newest'); // 'newest' or 'oldest'
  const [showClearAllDialog, setShowClearAllDialog] = useState(false);
  const navigate = useNavigate();

  // Load history on component mount
  useEffect(() => {
    loadHistory();
  }, []);

  // Function to load history from storage
  const loadHistory = () => {
    try {
      const historyData = getHistory();
      console.log('Loading history data:', historyData);
      setHistory(historyData);
    } catch (error) {
      console.error('Error loading history:', error);
      setHistory([]);
    }
  };

  // Sort history based on selected order
  const sortedHistory = [...history].sort((a, b) => {
    const dateA = new Date(a.timestamp);
    const dateB = new Date(b.timestamp);
    return sortOrder === 'newest' ? dateB - dateA : dateA - dateB;
  });

  // Handle delete individual entry
  const handleDeleteEntry = async (entryId) => {
    try {
      await deleteHistory(entryId);
      loadHistory(); // Reload history after deletion
    } catch (error) {
      console.error('Error deleting history entry:', error);
    }
  };

  // Handle edit entry (navigate to home with original text)
  const handleEditEntry = (entry) => {
    // Navigate to home with state containing the original text
    navigate('/', { 
      state: { 
        editText: entry.inputText,
        presetName: entry.presetName,
        autoSanitize: true 
      } 
    });
  };

  // Handle clear all history
  const handleClearAll = async () => {
    try {
      await clearHistory();
      loadHistory();
      setShowClearAllDialog(false);
    } catch (error) {
      console.error('Error clearing history:', error);
    }
  };

  // Toggle sort order
  const toggleSortOrder = () => {
    setSortOrder(sortOrder === 'newest' ? 'oldest' : 'newest');
  };

  return (
    <div className="w-full max-w-7xl mx-auto p-6">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900">
          History
        </h1>
        
        {/* Controls */}
        {history.length > 0 && (
          <div className="flex items-center gap-3">
            {/* Sort toggle */}
            <Button
              variant="outline"
              onClick={toggleSortOrder}
              className="flex items-center gap-2"
            >
              <Icon 
                icon={sortOrder === 'newest' ? 'mdi:sort-calendar-descending' : 'mdi:sort-calendar-ascending'} 
                className="w-4 h-4" 
              />
              {sortOrder === 'newest' ? 'Newest First' : 'Oldest First'}
            </Button>
            
            {/* Clear all button */}
            <Button
              variant="outline"
              onClick={() => setShowClearAllDialog(true)}
              className="text-red-600 hover:text-red-700 hover:border-red-300"
            >
              <Icon icon="mdi:delete-sweep" className="w-4 h-4 mr-2" />
              Clear All
            </Button>
          </div>
        )}
      </div>

      {/* History content */}
      {sortedHistory.length === 0 ? (
        // Empty state
        <Card>
          <CardContent className="p-12 text-center">
            <Icon 
              icon="mdi:history" 
              className="w-16 h-16 text-gray-300 mx-auto mb-4" 
            />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No History Yet
            </h3>
            <p className="text-gray-600">
              Your history will appear here after you sanitize some text.
            </p>
          </CardContent>
        </Card>
      ) : (
        // History entries
        <div className="space-y-4">
          {sortedHistory.map((entry) => (
            <HistoryCard
              key={entry.id}
              entry={entry}
              onDelete={handleDeleteEntry}
              onEdit={handleEditEntry}
            />
          ))}
        </div>
      )}

      {/* Clear All Confirmation Dialog */}
      {showClearAllDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <Card className="w-full max-w-md mx-4">
            <CardContent className="p-6">
              <h3 className="text-lg font-semibold mb-2">Clear All History</h3>
              <p className="text-gray-600 mb-4">
                Are you sure you want to clear all your sanitization history? This action cannot be undone.
              </p>
              <div className="flex justify-end gap-3">
                <Button
                  variant="outline"
                  onClick={() => setShowClearAllDialog(false)}
                >
                  Cancel
                </Button>
                <Button
                  variant="outline"
                  onClick={handleClearAll}
                  className="bg-red-600 text-white hover:bg-red-700 border-red-600 hover:border-red-700"
                >
                  Clear All
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}

export default History;