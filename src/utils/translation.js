/**
 * Translation utilities for document translation
 * Supports Google Translate API and DeepL API integration
 */

// Mock translation for development/demo purposes
const mockTranslations = {
  en: {
    'Hola mundo': 'Hello world',
    'Bonjour le monde': 'Hello world',
    'Hallo Welt': 'Hello world',
    'Ciao mondo': 'Hello world',
    'Olá mundo': 'Hello world',
    'Привет мир': 'Hello world',
    'こんにちは世界': 'Hello world',
    '안녕하세요 세계': 'Hello world',
    '你好世界': 'Hello world',
    'مرحبا بالعالم': 'Hello world',
    'नमस्ते दुनिया': 'Hello world'
  },
  es: {
    'Hello world': 'Hola mundo',
    'Bonjour le monde': 'Hola mundo',
    'Hallo Welt': 'Hola mundo',
    'Ciao mondo': 'Hola mundo',
    'Olá mundo': 'Hola mundo',
    'Привет мир': 'Hola mundo',
    'こんにちは世界': 'Hola mundo',
    '안녕하세요 세계': 'Hola mundo',
    '你好世界': 'Hola mundo',
    'مرحبا بالعالم': 'Hola mundo',
    'नमस्ते दुनिया': 'Hola mundo'
  },
  fr: {
    'Hello world': 'Bonjour le monde',
    'Hola mundo': 'Bonjour le monde',
    'Hallo Welt': 'Bonjour le monde',
    'Ciao mondo': 'Bonjour le monde',
    'Olá mundo': 'Bonjour le monde',
    'Привет мир': 'Bonjour le monde',
    'こんにちは世界': 'Bonjour le monde',
    '안녕하세요 세계': 'Bonjour le monde',
    '你好世界': 'Bonjour le monde',
    'مرحبا بالعالم': 'Bonjour le monde',
    'नमस्ते दुनिया': 'Bonjour le monde'
  }
}

/**
 * LibreTranslate API integration
 * @param {string} text - Text to translate
 * @param {string} targetLanguage - Target language code
 * @param {string} sourceLanguage - Source language code
 * @returns {Promise<string>} - Translated text
 */
const translateWithLibreTranslate = async (text, targetLanguage, sourceLanguage = 'auto') => {
  const url = 'https://libretranslate.com/translate'
  
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      q: text,
      source: sourceLanguage,
      target: targetLanguage,
      format: 'text'
    })
  })

  if (!response.ok) {
    throw new Error(`LibreTranslate API error: ${response.status} ${response.statusText}`)
  }

  const data = await response.json()
  
  if (!data.translatedText) {
    throw new Error('Invalid response from LibreTranslate API')
  }

  return data.translatedText
}

/**
 * Main translation function
 * @param {string} text - Text to translate
 * @param {string} targetLanguage - Target language code
 * @param {string} sourceLanguage - Source language code (optional, auto-detect if not provided)
 * @returns {Promise<string>} - Translated text
 */
export const translateText = async (text, targetLanguage, sourceLanguage = 'auto') => {
  if (!text || !text.trim()) {
    throw new Error('No text provided for translation')
  }

  if (!targetLanguage) {
    throw new Error('Target language not specified')
  }

  try {
    // Try LibreTranslate first (free, no API key required)
    try {
      return await translateWithLibreTranslate(text, targetLanguage, sourceLanguage)
    } catch (libreError) {
      console.warn('LibreTranslate failed, trying fallback options:', libreError.message)
      
      // Check if API keys are available for fallback
      const googleApiKey = import.meta.env.VITE_GOOGLE_TRANSLATE_API_KEY
      const deepLApiKey = import.meta.env.VITE_DEEPL_API_KEY

      if (googleApiKey) {
        return await translateWithGoogle(text, targetLanguage, sourceLanguage)
      } else if (deepLApiKey) {
        return await translateWithDeepL(text, targetLanguage, sourceLanguage)
      } else {
        // Final fallback to mock translation for demo
        console.warn('No API keys found. Using mock translation for demo purposes.')
        return await mockTranslate(text, targetLanguage)
      }
    }
  } catch (error) {
    console.error('Translation error:', error)
    throw new Error(`Translation failed: ${error.message}`)
  }
}

/**
 * Google Translate API integration
 * @param {string} text - Text to translate
 * @param {string} targetLanguage - Target language code
 * @param {string} sourceLanguage - Source language code
 * @returns {Promise<string>} - Translated text
 */
const translateWithGoogle = async (text, targetLanguage, sourceLanguage = 'auto') => {
  const apiKey = import.meta.env.VITE_GOOGLE_TRANSLATE_API_KEY
  const url = `https://translation.googleapis.com/language/translate/v2?key=${apiKey}`

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      q: text,
      target: targetLanguage,
      source: sourceLanguage === 'auto' ? undefined : sourceLanguage,
      format: 'text'
    })
  })

  if (!response.ok) {
    const errorData = await response.json()
    throw new Error(errorData.error?.message || 'Google Translate API error')
  }

  const data = await response.json()
  return data.data.translations[0].translatedText
}

/**
 * DeepL API integration
 * @param {string} text - Text to translate
 * @param {string} targetLanguage - Target language code
 * @param {string} sourceLanguage - Source language code
 * @returns {Promise<string>} - Translated text
 */
const translateWithDeepL = async (text, targetLanguage, sourceLanguage = 'auto') => {
  const apiKey = import.meta.env.VITE_DEEPL_API_KEY
  const url = 'https://api-free.deepl.com/v2/translate'

  // DeepL language code mapping
  const deepLLanguageCodes = {
    'en': 'EN',
    'es': 'ES',
    'fr': 'FR',
    'de': 'DE',
    'it': 'IT',
    'pt': 'PT',
    'ru': 'RU',
    'ja': 'JA',
    'zh': 'ZH',
    'ko': 'KO'
  }

  const targetLang = deepLLanguageCodes[targetLanguage] || targetLanguage.toUpperCase()
  const sourceLang = sourceLanguage === 'auto' ? undefined : (deepLLanguageCodes[sourceLanguage] || sourceLanguage.toUpperCase())

  const formData = new FormData()
  formData.append('auth_key', apiKey)
  formData.append('text', text)
  formData.append('target_lang', targetLang)
  if (sourceLang) {
    formData.append('source_lang', sourceLang)
  }

  const response = await fetch(url, {
    method: 'POST',
    body: formData
  })

  if (!response.ok) {
    const errorData = await response.json()
    throw new Error(errorData.message || 'DeepL API error')
  }

  const data = await response.json()
  return data.translations[0].text
}

/**
 * Mock translation for demo purposes
 * @param {string} text - Text to translate
 * @param {string} targetLanguage - Target language code
 * @returns {Promise<string>} - Mock translated text
 */
const mockTranslate = async (text, targetLanguage) => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 2000))

  // Check for exact matches in mock translations
  const translations = mockTranslations[targetLanguage]
  if (translations && translations[text]) {
    return translations[text]
  }

  // Generate mock translation based on target language
  const mockPrefixes = {
    en: '[EN] ',
    es: '[ES] ',
    fr: '[FR] ',
    de: '[DE] ',
    it: '[IT] ',
    pt: '[PT] ',
    ru: '[RU] ',
    ja: '[JA] ',
    ko: '[KO] ',
    zh: '[ZH] ',
    ar: '[AR] ',
    hi: '[HI] ',
    tl: '[TL] '
  }

  const prefix = mockPrefixes[targetLanguage] || `[${targetLanguage.toUpperCase()}] `
  
  // For demo purposes, return the original text with a language prefix
  // In a real implementation, this would be actual translated text
  return `${prefix}${text}`
}

/**
 * Detect language of text (mock implementation)
 * @param {string} text - Text to analyze
 * @returns {Promise<string>} - Detected language code
 */
export const detectLanguage = async (text) => {
  // Mock language detection
  await new Promise(resolve => setTimeout(resolve, 500))
  
  // Simple heuristic for demo purposes
  if (/[\u4e00-\u9fff]/.test(text)) return 'zh'
  if (/[\u3040-\u309f\u30a0-\u30ff]/.test(text)) return 'ja'
  if (/[\u0600-\u06ff]/.test(text)) return 'ar'
  if (/[\u0400-\u04ff]/.test(text)) return 'ru'
  if (/[àáâãäåæçèéêëìíîïðñòóôõöøùúûüýþÿ]/.test(text)) return 'fr'
  if (/[äöüß]/.test(text)) return 'de'
  if (/[ñáéíóúü]/.test(text)) return 'es'
  
  return 'en' // Default to English
}

/**
 * Get supported languages
 * @returns {Array} - Array of supported language objects
 */
export const getSupportedLanguages = () => {
  return [
    { code: 'en', name: 'English', nativeName: 'English' },
    { code: 'es', name: 'Spanish', nativeName: 'Español' },
    { code: 'fr', name: 'French', nativeName: 'Français' },
    { code: 'de', name: 'German', nativeName: 'Deutsch' },
    { code: 'it', name: 'Italian', nativeName: 'Italiano' },
    { code: 'pt', name: 'Portuguese', nativeName: 'Português' },
    { code: 'ru', name: 'Russian', nativeName: 'Русский' },
    { code: 'ja', name: 'Japanese', nativeName: '日本語' },
    { code: 'ko', name: 'Korean', nativeName: '한국어' },
    { code: 'zh', name: 'Chinese', nativeName: '中文' },
    { code: 'ar', name: 'Arabic', nativeName: 'العربية' },
    { code: 'hi', name: 'Hindi', nativeName: 'हिन्दी' },
    { code: 'tl', name: 'Filipino', nativeName: 'Filipino' }
  ]
}

/**
 * Validate translation input
 * @param {string} text - Text to validate
 * @param {string} targetLanguage - Target language to validate
 * @returns {boolean} - Whether input is valid
 */
export const validateTranslationInput = (text, targetLanguage) => {
  if (!text || typeof text !== 'string' || !text.trim()) {
    throw new Error('Text is required for translation')
  }

  if (text.length > 10000) {
    throw new Error('Text is too long. Maximum 10,000 characters allowed.')
  }

  if (!targetLanguage) {
    throw new Error('Target language is required')
  }

  const supportedLanguages = getSupportedLanguages().map(lang => lang.code)
  if (!supportedLanguages.includes(targetLanguage)) {
    throw new Error(`Unsupported target language: ${targetLanguage}`)
  }

  return true
}