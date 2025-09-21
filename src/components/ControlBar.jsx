import FileUpload from '@/components/FileUpload';

/**
 * ControlBar Component
 * 
 * Bottom control bar showing file upload functionality and character counts.
 * Provides feedback to users about text length on both input and output sides.
 * 
 * Features:
 * - File upload integration for .txt and .md files
 * - Input character count display (left side)
 * - Output character count display (right side)
 * - Clean, minimal design with proper spacing
 */
function ControlBar({ inputCharCount, outputCharCount, onFileLoad }) {
  return (
    <div className="flex items-center justify-between mt-4 px-2">
      {/* Left Side - Attachment Icon + Input Character Count */}
      <div className="flex items-center gap-4 text-sm text-gray-500">
        <FileUpload onFileLoad={onFileLoad} />
        <span>{inputCharCount} Char</span>
      </div>

      {/* Right Side - Output Character Count */}
      <div className="flex items-center gap-4 text-sm text-gray-500">
        <span>{outputCharCount} Char</span>
      </div>
    </div>
  );
}

export default ControlBar;