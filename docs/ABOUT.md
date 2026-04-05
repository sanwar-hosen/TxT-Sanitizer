# TxT Sanitizer

A powerful, modern text cleaning and sanitization tool built with React, designed to help users clean, format, and sanitize various types of text content efficiently.

## 🚀 Features

### Core Functionality
- **Smart Text Sanitization**: Apply predefined or custom rules to clean and format text
- **Multiple Preset Modes**: Choose from various sanitization presets for different use cases
- **Real-time Processing**: Instant text transformation with live preview
- **File Upload Support**: Load `.txt` and `.md` files directly into the editor
- **History Management**: Track all your sanitization operations with full history

### User Interface
- **Dual-Pane Editor**: Side-by-side input and output text areas
- **Preset Tab System**: Easy switching between sanitization modes
- **Keyboard Shortcuts**: Quick actions with `Ctrl+Enter` for sanitization
- **Character Count**: Real-time character counting for both input and output
- **Clipboard Integration**: One-click paste and copy functionality

### Advanced Features
- **Custom Rules Engine**: Flexible rule-based text processing
- **Priority-Based Processing**: Rules applied in specified priority order
- **RegExp Support**: Advanced pattern matching with regular expressions
- **Character Class Handling**: Support for character sets like `[!@#$%^&*()]`
- **Escape Sequence Processing**: Handle `\n`, `\t`, `\r` and other escape characters

## 🎯 How to Use

### Basic Usage
1. **Select a Preset**: Choose from available sanitization modes in the tabs
2. **Input Text**: Type or paste your text in the left textarea
3. **Sanitize**: Click the "Sanitize" button or press `Ctrl+Enter`
4. **Copy Results**: Use the "Copy Text" button to copy sanitized output

### File Upload
1. Click the attachment icon in the bottom control bar
2. Select a `.txt` or `.md` file (max 1MB)
3. The file content will automatically load into the input area
4. Apply sanitization as needed

### History Management
1. Navigate to the **History** page to view all past operations
2. **Edit**: Click edit button to reload text into the main editor
3. **Delete**: Remove unwanted history entries
4. **Sort**: Organize history by date (newest/oldest first)

### Preset Management
- **Base Presets**: First 4 presets always visible as tabs
- **More Presets**: Access additional presets via the "More" dropdown
- **Quick Switching**: Click any preset tab for instant mode change

## 🛠️ Technical Details

### Built With
- **React 18**: Modern React with hooks and functional components
- **Vite**: Fast build tool and development server
- **Tailwind CSS**: Utility-first CSS framework
- **React Router DOM**: Client-side routing
- **Iconify React**: Comprehensive icon library

### Architecture
- **Component-Based**: Modular, reusable components
- **Local Storage**: Client-side data persistence
- **Device Isolation**: Separate data per device using unique identifiers
- **Clean Code Principles**: Readable, maintainable codebase

### Key Components
- `PresetTabs`: Preset selection interface
- `TextAreaPanel`: Main text editing interface
- `ControlBar`: File upload and statistics
- `FileUpload`: Drag-and-drop file handling
- `HistoryCard`: Individual history entry display

## 📋 Preset Rules

### Rule Structure
Each preset contains an array of rules with:
- **find**: Text pattern to search for (supports RegExp)
- **replace**: Replacement text or pattern
- **priority**: Execution order (lower numbers = higher priority)

### Supported Patterns
- **Simple Text**: Direct string replacement
- **Character Classes**: `[!@#$%^&*()]` removes specified characters
- **Escape Sequences**: `\n`, `\t`, `\r` for whitespace handling
- **Regular Expressions**: Full RegExp support for complex patterns

### Example Rules
```json
{
  "find": "[!@#$%^&*()]",
  "replace": "",
  "priority": 1
}
```

## 🔧 Development

### Setup
```bash
npm install        # Install dependencies
npm run dev        # Start development server
npm run build      # Build for production
npm run lint       # Run code quality checks
```

### Project Structure
```
src/
├── components/     # Reusable UI components
├── pages/         # Main page components
├── data/          # Static data and presets
├── lib/           # Utility functions
└── utils/         # Storage and helper functions
```

## 💡 Tips & Tricks

### Keyboard Shortcuts
- `Ctrl+Enter`: Sanitize text
- Standard clipboard shortcuts work in text areas

### Best Practices
1. **Test Rules**: Preview sanitization before applying to important text
2. **Save History**: Use history feature to track changes
3. **File Backup**: Keep original files as backup before processing
4. **Rule Priority**: Lower priority numbers execute first

### Performance
- File size limit: 1MB for uploads
- Optimized for large text processing
- Real-time character counting
- Efficient storage management

## 🤝 About the Creator

**Created by Sano (Sanwar Hosen)**
- GitHub: [@sanwar-hosen](https://github.com/sanwar-hosen)
- LinkedIn: [Connect with Sano](https://www.linkedin.com/in/sanwar-hosen/)
- Repository: [TxT-Sanitizer](https://github.com/sanwar-hosen/TxT-Sanitizer)

### Development Philosophy
- **Clean Code**: Prioritizing readability and maintainability
- **User Experience**: Intuitive interface design
- **Performance**: Fast, responsive interactions
- **Accessibility**: Following web accessibility guidelines

## 📄 License & Usage

This project is open source and available for educational and personal use. Feel free to explore the code, suggest improvements, or contribute to the project.

### Version Information
- **Current Version**: 1.0.0
- **Last Updated**: September 2025
- **Browser Support**: Modern browsers (Chrome, Firefox, Safari, Edge)

---

*TxT Sanitizer - Making text cleaning simple and efficient* ✨