import React, { useRef, useEffect, useState } from 'react'
import { ArrowLeft, Download, Share2, Copy, Mail, MessageCircle } from 'lucide-react'
import { useTranslation } from '../context/TranslationContext'
import { generatePDF } from '../utils/pdfGenerator'

const PreviewSection = ({ onBackToUpload }) => {
  const {
    originalFile,
    originalText,
    translatedText,
    selectedLanguage,
    documentType,
    clearTranslation
  } = useTranslation()

  const [showShareMenu, setShowShareMenu] = useState(false)
  const [copySuccess, setCopySuccess] = useState(false)
  const originalRef = useRef(null)
  const translatedRef = useRef(null)

  // Synchronized scrolling
  useEffect(() => {
    const originalEl = originalRef.current
    const translatedEl = translatedRef.current

    if (!originalEl || !translatedEl) return

    const syncScroll = (source, target) => {
      const scrollRatio = source.scrollTop / (source.scrollHeight - source.clientHeight)
      target.scrollTop = scrollRatio * (target.scrollHeight - target.clientHeight)
    }

    const handleOriginalScroll = () => syncScroll(originalEl, translatedEl)
    const handleTranslatedScroll = () => syncScroll(translatedEl, originalEl)

    originalEl.addEventListener('scroll', handleOriginalScroll)
    translatedEl.addEventListener('scroll', handleTranslatedScroll)

    return () => {
      originalEl.removeEventListener('scroll', handleOriginalScroll)
      translatedEl.removeEventListener('scroll', handleTranslatedScroll)
    }
  }, [originalText, translatedText])

  const handleDownloadPDF = async () => {
    try {
      await generatePDF({
        originalText,
        translatedText,
        language: selectedLanguage,
        documentType,
        fileName: originalFile?.name || 'translated-document'
      })
    } catch (error) {
      console.error('PDF generation failed:', error)
    }
  }

  const handleCopyText = async () => {
    try {
      await navigator.clipboard.writeText(translatedText)
      setCopySuccess(true)
      setTimeout(() => setCopySuccess(false), 2000)
    } catch (error) {
      console.error('Copy failed:', error)
    }
  }

  const handleShare = (platform) => {
    const text = encodeURIComponent(`Check out this translated document: ${translatedText.substring(0, 100)}...`)
    const url = encodeURIComponent(window.location.href)
    
    switch (platform) {
      case 'email':
        window.open(`mailto:?subject=Translated Document&body=${text}`)
        break
      case 'whatsapp':
        window.open(`https://wa.me/?text=${text}`)
        break
      case 'twitter':
        window.open(`https://twitter.com/intent/tweet?text=${text}&url=${url}`)
        break
      default:
        break
    }
    setShowShareMenu(false)
  }

  const handleBackToUpload = () => {
    clearTranslation()
    onBackToUpload()
  }

  const getLanguageName = (code) => {
    const languages = {
      en: 'English',
      es: 'Spanish',
      fr: 'French',
      de: 'German',
      it: 'Italian',
      pt: 'Portuguese',
      ru: 'Russian',
      ja: 'Japanese',
      ko: 'Korean',
      zh: 'Chinese',
      ar: 'Arabic',
      hi: 'Hindi',
      tl: 'Filipino'
    }
    return languages[code] || code
  }

  if (!originalText || !translatedText) {
    return (
      <div className="max-w-4xl mx-auto text-center space-y-4">
        <h2 className="text-2xl font-bold text-gray-900">No translation available</h2>
        <p className="text-gray-600">Please upload and translate a document first.</p>
        <button onClick={onBackToUpload} className="btn-primary">
          Go to Upload
        </button>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <button
            onClick={handleBackToUpload}
            className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Back to Upload</span>
          </button>
          <div className="h-6 w-px bg-gray-300" />
          <div>
            <h2 className="text-xl font-bold text-gray-900">Translation Preview</h2>
            <p className="text-sm text-gray-600">
              {originalFile?.name} • Translated to {getLanguageName(selectedLanguage)}
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center space-x-3">
          <button
            onClick={handleCopyText}
            className="btn-secondary flex items-center space-x-2"
          >
            <Copy className="w-4 h-4" />
            <span>{copySuccess ? 'Copied!' : 'Copy Text'}</span>
          </button>
          
          <div className="relative">
            <button
              onClick={() => setShowShareMenu(!showShareMenu)}
              className="btn-secondary flex items-center space-x-2"
            >
              <Share2 className="w-4 h-4" />
              <span>Share</span>
            </button>
            
            {showShareMenu && (
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-10">
                <button
                  onClick={() => handleShare('email')}
                  className="w-full px-4 py-2 text-left hover:bg-gray-50 flex items-center space-x-2"
                >
                  <Mail className="w-4 h-4" />
                  <span>Email</span>
                </button>
                <button
                  onClick={() => handleShare('whatsapp')}
                  className="w-full px-4 py-2 text-left hover:bg-gray-50 flex items-center space-x-2"
                >
                  <MessageCircle className="w-4 h-4" />
                  <span>WhatsApp</span>
                </button>
                <button
                  onClick={() => handleShare('twitter')}
                  className="w-full px-4 py-2 text-left hover:bg-gray-50 flex items-center space-x-2"
                >
                  <Share2 className="w-4 h-4" />
                  <span>Twitter</span>
                </button>
              </div>
            )}
          </div>
          
          <button
            onClick={handleDownloadPDF}
            className="btn-primary flex items-center space-x-2"
          >
            <Download className="w-4 h-4" />
            <span>Download PDF</span>
          </button>
        </div>
      </div>

      {/* Side-by-side Preview */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Original Document */}
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Original Document</h3>
            <span className="text-sm text-gray-500 bg-gray-100 px-2 py-1 rounded">
              {documentType.charAt(0).toUpperCase() + documentType.slice(1)}
            </span>
          </div>
          
          <div
            ref={originalRef}
            className="h-96 overflow-y-auto p-4 bg-gray-50 rounded-lg border border-gray-200"
          >
            {originalFile?.type?.includes('image') ? (
              <div className="space-y-4">
                <img
                  src={URL.createObjectURL(originalFile)}
                  alt="Original document"
                  className="w-full h-auto rounded border"
                />
                <div className="text-sm text-gray-700 whitespace-pre-wrap">
                  {originalText}
                </div>
              </div>
            ) : (
              <div className="text-sm text-gray-700 whitespace-pre-wrap leading-relaxed">
                {originalText}
              </div>
            )}
          </div>
        </div>

        {/* Translated Document */}
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Translated Document</h3>
            <span className="text-sm text-primary-600 bg-primary-50 px-2 py-1 rounded">
              {getLanguageName(selectedLanguage)}
            </span>
          </div>
          
          <div
            ref={translatedRef}
            className="h-96 overflow-y-auto p-4 bg-blue-50 rounded-lg border border-blue-200"
          >
            <div className="text-sm text-gray-700 whitespace-pre-wrap leading-relaxed">
              {translatedText}
            </div>
          </div>
        </div>
      </div>

      {/* Translation Info */}
      <div className="card bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
        <div className="flex items-center justify-between">
          <div>
            <h4 className="font-semibold text-gray-900">Translation Complete</h4>
            <p className="text-sm text-gray-600 mt-1">
              Your document has been successfully translated from the original language to {getLanguageName(selectedLanguage)}.
              The translation maintains the document structure and formatting.
            </p>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold text-primary-600">
              {Math.round((translatedText.length / originalText.length) * 100)}%
            </div>
            <div className="text-xs text-gray-500">Translation Ratio</div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default PreviewSection