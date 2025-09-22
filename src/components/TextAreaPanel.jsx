import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Icon } from '@iconify/react';

/**
 * TextAreaPanel Component
 * 
 * Main text editing interface with input and output areas.
 * Provides overlay buttons for common actions on each textarea.
 * 
 * Features:
 * - Dual textarea layout (input/output)
 * - Input area: Clear button (top-right), Paste button (bottom-left), Sanitize button (bottom-right)
 * - Output area: Redo button and Copy button (bottom-right) when text is present
 * - Proper keyboard shortcut support (Ctrl+Enter for sanitize)
 * - Read-only output area with distinct styling
 */
function TextAreaPanel({
  inputText,
  outputText,
  onInputChange,
  onClear,
  onPaste,
  onSanitize,
  onCopy,
  onReinput
}) {
  return (
    <div className="relative w-full">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-0 border rounded-lg overflow-hidden w-full">
        {/* Input Textarea */}
        <div className="relative flex flex-col">
          <Textarea
            placeholder="To rewrite text, enter or paste it here and press 'Sanitize.'"
            value={inputText}
            onChange={(e) => onInputChange(e.target.value)}
            className="flex-1 min-h-[300px] sm:min-h-[400px] lg:min-h-[500px] xl:min-h-[600px] resize-none border-0 rounded-none focus:ring-0 focus:border-0"
          />
          
          {/* Clear Input Button - Top Right */}
          {inputText && (
            <Button 
              onClick={onClear}
              variant="outline" 
              size="icon"
              className="absolute top-4 right-4 w-6 h-6 text-gray-400 border-gray-300 hover:text-red-600 hover:border-red-300 hover:bg-red-50"
            >
              <Icon icon="mdi:close" className="w-3 h-3" />
            </Button>
          )}
          
          {/* Paste Text Button - Bottom Left */}
          <Button 
            onClick={onPaste}
            variant="outline" 
            size="icon"
            className="absolute bottom-4 left-4 text-brand-blue border-brand-blue hover:bg-blue-50"
          >
            <Icon icon="mdi:clipboard-outline" className="w-4 h-4" />
          </Button>

          {/* Sanitize Button - Bottom Right of Left Textarea */}
          <Button 
            onClick={onSanitize}
            className="absolute bottom-4 right-4 bg-brand-blue hover:bg-blue-700 text-white px-6 py-2 text-sm font-medium"
            title="Sanitize text (Ctrl+Enter)"
          >
            Sanitize
          </Button>
        </div>

        {/* Dividing Line */}
        <div className="relative flex flex-col lg:border-l border-t lg:border-t-0">
          <Textarea
            placeholder="Sanitized text will appear here..."
            value={outputText}
            readOnly
            className="flex-1 min-h-[300px] sm:min-h-[400px] lg:min-h-[500px] xl:min-h-[600px] resize-none border-0 rounded-none bg-gray-50 cursor-default focus:ring-0 focus:border-0"
          />
          
          {/* Copy and Redo Buttons - Bottom Right of Right Textarea */}
          {outputText && (
            <div className="absolute bottom-4 right-4 flex items-center gap-2">
              {/* Redo Button - Reinput output to input */}
              <Button 
                onClick={onReinput}
                variant="outline" 
                size="sm"
                className="text-brand-blue border-brand-blue hover:bg-blue-50"
                title="Reinput text - Move output back to input for further processing"
              >
                <Icon icon="streamline:ai-redo-spark" className="w-4 h-4" />
              </Button>
              
              {/* Copy Text Button */}
              <Button 
                onClick={onCopy}
                variant="outline" 
                className="text-brand-blue border-brand-blue hover:bg-blue-50"
                size="sm"
              >
                <Icon icon="mdi:content-copy" className="w-4 h-4 mr-2" />
                Copy Text
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default TextAreaPanel;