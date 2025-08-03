# DocTranslate - Document Translation Website

A modern, interactive document translation web application built with React and TailwindCSS. Upload documents (PDF, DOCX, images), extract text using OCR, and translate them into multiple languages with a beautiful side-by-side preview.

## ✨ Features

### Core Functionality
- **📄 Multi-format Support**: PDF, DOCX, JPG, PNG files
- **🔤 OCR Text Extraction**: Powered by Tesseract.js for image-based documents
- **🌍 Multi-language Translation**: Support for 13+ languages
- **👀 Side-by-side Preview**: Synchronized scrolling between original and translated text
- **📱 Responsive Design**: Works seamlessly on desktop, tablet, and mobile
- **⬇️ Export Options**: Download as PDF, copy text, or share translations

### User Experience
- **🎯 Drag & Drop Upload**: Intuitive file upload interface
- **⚡ Real-time Processing**: Live progress indicators and status updates
- **🎨 Modern UI**: Clean, professional design with smooth animations
- **🔒 Secure Processing**: Client-side text extraction with secure API integration
- **📊 Translation History**: Keep track of your translation sessions

### Technical Features
- **🚀 Fast Performance**: Optimized with Vite build system
- **🔌 API Integration**: Google Translate API and DeepL API support
- **🎛️ Mock Mode**: Demo functionality without API keys
- **📦 Component Architecture**: Modular, reusable React components
- **🎯 Context Management**: Centralized state management

## 🚀 Quick Start

### Prerequisites
- Node.js 16+ and npm
- Modern web browser with JavaScript enabled

### Installation

1. **Clone and setup**:
   ```bash
   cd /path/to/your/project
   npm install
   ```

2. **Environment Configuration**:
   ```bash
   cp .env.example .env
   ```
   
   Edit `.env` and add your API keys:
   ```env
   VITE_GOOGLE_TRANSLATE_API_KEY=your_google_api_key
   VITE_DEEPL_API_KEY=your_deepl_api_key
   ```

3. **Start Development Server**:
   ```bash
   npm run dev
   ```

4. **Open in Browser**:
   Navigate to `http://localhost:3000`

## 🔧 API Setup

### Google Cloud Translation API

1. **Create Project**: Go to [Google Cloud Console](https://console.cloud.google.com/)
2. **Enable APIs**: Enable "Cloud Translation API"
3. **Create Credentials**: Generate an API key
4. **Add to Environment**: Set `VITE_GOOGLE_TRANSLATE_API_KEY`

### DeepL API (Alternative)

1. **Sign Up**: Visit [DeepL Pro API](https://www.deepl.com/pro-api)
2. **Get API Key**: From your account dashboard
3. **Add to Environment**: Set `VITE_DEEPL_API_KEY`

### Demo Mode
Without API keys, the app runs in demo mode with mock translations for testing.

## 📁 Project Structure

```
src/
├── components/          # React components
│   ├── Header.jsx       # App header and branding
│   ├── UploadSection.jsx # File upload interface
│   ├── PreviewSection.jsx # Translation preview
│   └── Footer.jsx       # App footer
├── context/             # State management
│   └── TranslationContext.jsx # Global translation state
├── utils/               # Utility functions
│   ├── textExtraction.js # OCR and text extraction
│   ├── translation.js   # Translation API integration
│   └── pdfGenerator.js  # PDF export functionality
├── App.jsx              # Main app component
├── main.jsx             # App entry point
└── index.css            # Global styles
```

## 🎯 Usage Guide

### 1. Upload Document
- **Drag & Drop**: Drag files directly onto the upload area
- **Click Upload**: Click to browse and select files
- **Supported Formats**: PDF, DOCX, JPG, PNG (max 10MB)

### 2. Configure Translation
- **Select Language**: Choose target language from dropdown
- **Document Type**: Automatically detected or manually selected
- **Review Settings**: Verify before processing

### 3. Process & Review
- **Text Extraction**: Automatic OCR for images, direct extraction for documents
- **Translation**: Real-time translation with progress indicators
- **Side-by-side View**: Compare original and translated text

### 4. Export & Share
- **Download PDF**: Generate formatted PDF with both versions
- **Copy Text**: Copy translated text to clipboard
- **Share**: Generate shareable links (future feature)

## 🌍 Supported Languages

| Language | Code | Native Name |
|----------|------|-------------|
| English | en | English |
| Spanish | es | Español |
| French | fr | Français |
| German | de | Deutsch |
| Italian | it | Italiano |
| Portuguese | pt | Português |
| Russian | ru | Русский |
| Japanese | ja | 日本語 |
| Korean | ko | 한국어 |
| Chinese | zh | 中文 |
| Arabic | ar | العربية |
| Hindi | hi | हिन्दी |
| Filipino | tl | Filipino |

## 🛠️ Development

### Available Scripts

```bash
# Development server
npm run dev

# Production build
npm run build

# Preview production build
npm run preview

# Lint code
npm run lint
```

### Key Dependencies

- **React 18**: Modern React with hooks
- **React Router**: Client-side routing
- **TailwindCSS**: Utility-first CSS framework
- **Tesseract.js**: OCR text extraction
- **PDF.js**: PDF text extraction
- **Mammoth.js**: DOCX text extraction
- **jsPDF**: PDF generation
- **Lucide React**: Modern icon library

### Development Tips

1. **Hot Reload**: Changes auto-refresh in development
2. **Error Boundaries**: Comprehensive error handling
3. **Performance**: Optimized with React.memo and useMemo
4. **Accessibility**: ARIA labels and keyboard navigation
5. **Mobile First**: Responsive design approach

## 🔒 Security & Privacy

- **Client-side Processing**: Text extraction happens in browser
- **Secure API Calls**: Environment variables for API keys
- **No Data Storage**: Files processed temporarily, not stored
- **HTTPS Required**: Secure transmission for API calls
- **Privacy First**: No tracking or analytics by default

## 🚀 Deployment

### Vercel (Recommended)
```bash
npm run build
# Deploy dist/ folder to Vercel
```

### Netlify
```bash
npm run build
# Deploy dist/ folder to Netlify
```

### Self-hosted
```bash
npm run build
# Serve dist/ folder with any static server
```

## 🤝 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open Pull Request

## 📝 License

MIT License - see LICENSE file for details.

## 🆘 Support

### Common Issues

**Q: Translation not working?**
A: Check API keys in `.env` file. Demo mode works without keys.

**Q: OCR accuracy low?**
A: Ensure images are high quality and text is clearly visible.

**Q: Large files failing?**
A: Check file size limit (10MB) and format support.

**Q: Mobile issues?**
A: App is responsive but large files may be slow on mobile.

### Getting Help

- Check browser console for error messages
- Verify API key configuration
- Test with smaller files first
- Use demo mode to test functionality

## 🎉 Acknowledgments

- **Tesseract.js** for OCR capabilities
- **PDF.js** for PDF processing
- **TailwindCSS** for styling system
- **Lucide** for beautiful icons
- **Vite** for fast development experience

---

**Built with ❤️ using React + TailwindCSS**