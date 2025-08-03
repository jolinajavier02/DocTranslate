import React, { useCallback, useState } from 'react'
import { useDropzone } from 'react-dropzone'
import { Upload, FileText, Image, File, Loader2, Languages } from 'lucide-react'
import { useTranslation } from '../context/TranslationContext'
import { extractTextFromFile } from '../utils/textExtraction'
import { translateText } from '../utils/translation'

const UploadSection = ({ onTranslationComplete }) => {
  const {
    setFile,
    setOriginalText,
    setTranslatedText,
    selectedLanguage,
    setLanguage,
    documentType,
    setDocumentType,
    isLoading,
    setLoading,
    setError,
    addToHistory
  } = useTranslation()

  const [uploadedFile, setUploadedFile] = useState(null)

  const onDrop = useCallback((acceptedFiles) => {
    const file = acceptedFiles[0]
    if (file) {
      setUploadedFile(file)
      setFile(file)
      setError(null)
    }
  }, [setFile, setError])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
      'image/*': ['.png', '.jpg', '.jpeg']
    },
    multiple: false,
    maxSize: 10 * 1024 * 1024 // 10MB
  })

  const handleTranslate = async () => {
    if (!uploadedFile) {
      setError('Please upload a file first')
      return
    }

    setLoading(true)
    setError(null)

    try {
      // Extract text from file
      const extractedText = await extractTextFromFile(uploadedFile)
      setOriginalText(extractedText)

      // Translate text
      const translated = await translateText(extractedText, selectedLanguage)
      setTranslatedText(translated)

      // Add to history
      addToHistory()

      // Navigate to preview
      onTranslationComplete()
    } catch (error) {
      setError(error.message || 'Translation failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const getFileIcon = (file) => {
    if (!file) return <File className="w-8 h-8 text-gray-400" />
    
    if (file.type.includes('pdf')) {
      return <FileText className="w-8 h-8 text-red-500" />
    } else if (file.type.includes('image')) {
      return <Image className="w-8 h-8 text-green-500" />
    } else {
      return <FileText className="w-8 h-8 text-blue-500" />
    }
  }

  const languages = [
    { code: 'en', name: 'English' },
    { code: 'es', name: 'Spanish' },
    { code: 'fr', name: 'French' },
    { code: 'de', name: 'German' },
    { code: 'it', name: 'Italian' },
    { code: 'pt', name: 'Portuguese' },
    { code: 'ru', name: 'Russian' },
    { code: 'ja', name: 'Japanese' },
    { code: 'ko', name: 'Korean' },
    { code: 'zh', name: 'Chinese' },
    { code: 'ar', name: 'Arabic' },
    { code: 'hi', name: 'Hindi' },
    { code: 'tl', name: 'Filipino' }
  ]

  const documentTypes = [
    { value: 'marriage', label: 'Marriage Certificate' },
    { value: 'visa', label: 'Visa Document' },
    { value: 'death', label: 'Death Certificate' },
    { value: 'renewal', label: 'Renewal Document' },
    { value: 'others', label: 'Others' }
  ]

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Hero Section */}
      <div className="text-center space-y-4">
        <h2 className="text-4xl font-bold text-gray-900">
          Translate Your Documents
        </h2>
        <p className="text-xl text-gray-600 max-w-2xl mx-auto">
          Upload your documents and get professional translations in seconds. 
          Supports PDF, DOCX, and image files with OCR technology.
        </p>
      </div>

      {/* Upload Area */}
      <div className="card">
        <div
          {...getRootProps()}
          className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all duration-200 ${
            isDragActive
              ? 'border-primary-500 bg-primary-50'
              : 'border-gray-300 hover:border-primary-400 hover:bg-gray-50'
          }`}
        >
          <input {...getInputProps()} />
          
          {uploadedFile ? (
            <div className="space-y-4">
              <div className="flex items-center justify-center">
                {getFileIcon(uploadedFile)}
              </div>
              <div>
                <p className="text-lg font-medium text-gray-900">{uploadedFile.name}</p>
                <p className="text-sm text-gray-500">
                  {(uploadedFile.size / 1024 / 1024).toFixed(2)} MB
                </p>
              </div>
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  setUploadedFile(null)
                  setFile(null)
                }}
                className="text-sm text-primary-600 hover:text-primary-700 font-medium"
              >
                Remove file
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center justify-center">
                <Upload className="w-12 h-12 text-gray-400" />
              </div>
              <div>
                <p className="text-lg font-medium text-gray-900">
                  {isDragActive ? 'Drop your file here' : 'Drag & drop your file here'}
                </p>
                <p className="text-sm text-gray-500 mt-2">
                  or <span className="text-primary-600 font-medium">click to browse</span>
                </p>
              </div>
              <div className="flex items-center justify-center space-x-4 text-xs text-gray-400">
                <span>PDF</span>
                <span>•</span>
                <span>DOCX</span>
                <span>•</span>
                <span>JPG</span>
                <span>•</span>
                <span>PNG</span>
                <span>•</span>
                <span>Max 10MB</span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Configuration */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Document Type */}
        <div className="card">
          <label className="block text-sm font-medium text-gray-700 mb-3">
            Document Type
          </label>
          <select
            value={documentType}
            onChange={(e) => setDocumentType(e.target.value)}
            className="input-field"
          >
            {documentTypes.map((type) => (
              <option key={type.value} value={type.value}>
                {type.label}
              </option>
            ))}
          </select>
        </div>

        {/* Target Language */}
        <div className="card">
          <label className="block text-sm font-medium text-gray-700 mb-3">
            Target Language
          </label>
          <select
            value={selectedLanguage}
            onChange={(e) => setLanguage(e.target.value)}
            className="input-field"
          >
            {languages.map((lang) => (
              <option key={lang.code} value={lang.code}>
                {lang.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Translate Button */}
      <div className="text-center">
        <button
          onClick={handleTranslate}
          disabled={!uploadedFile || isLoading}
          className="btn-primary px-8 py-3 text-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2 mx-auto"
        >
          {isLoading ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              <span>Translating...</span>
            </>
          ) : (
            <>
              <Languages className="w-5 h-5" />
              <span>Translate Document</span>
            </>
          )}
        </button>
      </div>
    </div>
  )
}

export default UploadSection