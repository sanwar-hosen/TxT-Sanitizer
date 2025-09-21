<div align="center">

# 🧹 TxT Sanitizer

### *A powerful, modern text cleaning and sanitization tool*

[![React](https://img.shields.io/badge/React-18.2.0-61DAFB?logo=react&logoColor=white)](https://reactjs.org/)
[![Vite](https://img.shields.io/badge/Vite-4.4.5-646CFF?logo=vite&logoColor=white)](https://vitejs.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.4.17-06B6D4?logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)
[![License](https://img.shields.io/badge/License-Non--Commercial-orange.svg)](LICENSE)

**Clean, format, and sanitize text content with predefined or custom rules**

[🚀 Live Site](https://txt-sanitizer.pages.dev) • [📖 Documentation](#features) • [🐛 Issues](https://github.com/sanwar-hosen/TxT-Sanitizer/issues) • [💡 Feature Requests](https://github.com/sanwar-hosen/TxT-Sanitizer/issues)

</div>

---

## ✨ Features

### 🎯 **Core Functionality**
- **Smart Text Sanitization** - Apply predefined or custom rules to clean and format text
- **Multiple Preset Modes** - Choose from various sanitization presets for different use cases
- **Real-time Processing** - Instant text transformation with live preview
- **Case-Insensitive Matching** - Rules work with any case combination (CEO, ceo, Ceo, etc.)
- **File Upload Support** - Load `.txt` and `.md` files directly (max 1MB)
- **History Management** - Track all your sanitization operations with full history

### 🖥️ **User Interface**
- **Dual-Pane Editor** - Side-by-side input and output text areas
- **Preset Tab System** - Easy switching between sanitization modes
- **Redo Functionality** - Move output back to input for multi-step processing
- **Keyboard Shortcuts** - Quick actions with `Ctrl+Enter`
- **Character Count** - Real-time character counting for both input and output
- **Clipboard Integration** - One-click paste and copy functionality

### 🔧 **Advanced Features**
- **Custom Rule Creation** - Build your own sanitization presets
- **Priority-based Processing** - Control the order of rule application
- **Import/Export Settings** - Backup and share your presets
- **Responsive Design** - Works seamlessly on desktop and mobile
- **Device Isolation** - Separate data per device using unique identifiers

---

## 🚀 Quick Start

### Prerequisites
- **Node.js** 18.0 or higher
- **npm** or **yarn**

### Installation

```bash
# Clone the repository
git clone https://github.com/sanwar-hosen/TxT-Sanitizer.git

# Navigate to project directory
cd TxT-Sanitizer

# Install dependencies
npm install

# Start development server
npm run dev
```

### Development Commands

```bash
# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Run linting
npm run lint
```

---

## 📖 Usage

### Basic Workflow

1. **Select a Preset** - Choose from available sanitization modes in the tabs
2. **Input Text** - Type or paste your text in the left textarea
3. **Sanitize** - Click "Sanitize" button or press `Ctrl+Enter`
4. **Copy Results** - Use "Copy Text" button to copy sanitized output
5. **Redo Processing** - Use "Redo" button for multi-step processing with different presets

### File Upload

1. Click the attachment icon in the bottom control bar
2. Select a `.txt` or `.md` file (max 1MB)
3. File content loads automatically into input area

### Managing Presets

- **View Presets**: Navigate to Settings page
- **Create Custom**: Add new presets with custom rules
- **Edit Rules**: Modify existing preset configurations
- **Import/Export**: Backup and share preset configurations

---

## 🛠️ Tech Stack

| Technology | Version | Purpose |
|------------|---------|---------|
| **React** | 18.2.0 | UI framework with hooks and functional components |
| **Vite** | 4.4.5 | Fast build tool and development server |
| **Tailwind CSS** | 3.4.17 | Utility-first CSS framework |
| **React Router DOM** | 7.9.1 | Client-side routing |
| **Iconify React** | 6.0.2 | Comprehensive icon library |

### Architecture

- **Component-Based** - Modular, reusable components
- **Local Storage** - Client-side data persistence
- **Clean Code Principles** - Readable, maintainable codebase
- **Responsive Design** - Mobile-first approach

---

## 🌐 Deployment

### Recommended Platforms

| Platform | Best For | Setup |
|----------|----------|-------|
| **Vercel** | Easiest deployment | Connect GitHub repo |
| **Netlify** | Advanced features | Drag & drop or Git |
| **Cloudflare Pages** | Best performance | Git integration |
| **GitHub Pages** | Simple static hosting | Enable in repo settings |

### Build Configuration

```json
{
  "buildCommand": "npm run build",
  "outputDirectory": "dist",
  "installCommand": "npm install"
}
```

### Environment Variables
No environment variables required for basic deployment.

---

## 🗂️ Project Structure

```
txt-sanitizer/
├── public/                 # Static assets
├── src/
│   ├── components/         # Reusable UI components
│   │   ├── ui/            # Base UI components
│   │   ├── ControlBar.jsx # File upload and statistics
│   │   ├── FileUpload.jsx # Drag-and-drop file handling
│   │   ├── PresetTabs.jsx # Preset selection interface
│   │   └── TextAreaPanel.jsx # Main text editing interface
│   ├── data/              # Default presets and configurations
│   ├── lib/               # Utility functions
│   ├── pages/             # Page components
│   │   ├── About.jsx      # Documentation and information
│   │   ├── History.jsx    # Sanitization history
│   │   ├── Home.jsx       # Main application interface
│   │   └── Settings.jsx   # Preset management
│   └── utils/             # Storage and helper functions
├── package.json           # Project dependencies and scripts
├── tailwind.config.js     # Tailwind CSS configuration
└── vite.config.js         # Vite build configuration
```

---

## 🧪 Development

### Code Quality Standards

- **Clean & Readable** - Priority on code clarity over shortcuts
- **Component-Based** - Separate functionality into focused components
- **Comprehensive Comments** - Detailed comments explaining purpose and structure
- **Error Handling** - Graceful degradation patterns throughout

### Contributing Guidelines

1. **Fork** the repository
2. **Create** a feature branch (`git checkout -b feature/amazing-feature`)
3. **Commit** your changes (`git commit -m 'Add amazing feature'`)
4. **Push** to the branch (`git push origin feature/amazing-feature`)
5. **Open** a Pull Request

### Development Workflow

```bash
# Create feature branch
git checkout -b feature/your-feature-name

# Make your changes
# ...

# Test your changes
npm run build
npm run preview

# Commit with descriptive message
git commit -m "feat: add your feature description"

# Push and create PR
git push origin feature/your-feature-name
```

---

## 🔮 Roadmap

### 🔵 Near Term (Planned)
- **📥 History Export/Import** - Export history to JSON files for backup and sharing
- **🎯 Multiple Preset Selection** - Apply multiple presets in sequence with custom ordering

### 🟣 Long Term (Advanced)
- **🔗 Public Sharing Links** - Generate shareable URLs for text content and presets
- **☁️ Cloud Integration** - User accounts with Google Drive sync for cross-device access

---

## 📊 Performance

- **File Size Limit** - 1MB for file uploads
- **Processing Speed** - Optimized for large text processing
- **Storage** - Efficient localStorage management with device isolation
- **Build Size** - Optimized production builds with tree shaking

---

## 🤝 About the Creator

**Created by Sano (Sanwar Hosen)**

- **GitHub**: [@sanwar-hosen](https://github.com/sanwar-hosen)
- **LinkedIn**: [Connect with Sano](https://www.linkedin.com/in/sanwar-hosen/)

### Development Philosophy
- **Clean Code** - Prioritizing readability and maintainability
- **User Experience** - Intuitive interface design
- **Performance** - Fast, responsive interactions
- **Accessibility** - Following web accessibility guidelines

---

## 📄 License

This project is licensed under a **Non-Commercial License**.

### ✅ **What You CAN Do:**
- **Personal Use** - Use for your own projects and learning
- **Educational Use** - Use in academic institutions and coursework
- **Modify & Adapt** - Create your own versions and improvements
- **Share & Distribute** - Share with others (with same license restrictions)
- **Portfolio Showcase** - Include in your portfolio and demonstrations
- **Open Source Contributions** - Contribute back to the project

### ❌ **What You CANNOT Do:**
- **Commercial Use** - Cannot sell or use in for-profit business
- **Monetization** - Cannot make money from ads, subscriptions, etc.
- **Commercial Products** - Cannot integrate into commercial software/services

For commercial licensing opportunities, please [contact the creator](https://www.linkedin.com/in/sanwar-hosen/).

**Full License**: [LICENSE](LICENSE)

---

## ⭐ Show Your Support

Give a ⭐️ if this project helped you!

---

<div align="center">

**TxT Sanitizer - Making text cleaning simple and efficient** ✨

[![GitHub stars](https://img.shields.io/github/stars/sanwar-hosen/TxT-Sanitizer?style=social)](https://github.com/sanwar-hosen/TxT-Sanitizer/stargazers)
[![GitHub forks](https://img.shields.io/github/forks/sanwar-hosen/TxT-Sanitizer?style=social)](https://github.com/sanwar-hosen/TxT-Sanitizer/network)

</div>
