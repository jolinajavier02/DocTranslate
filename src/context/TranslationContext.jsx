import React, { createContext, useContext, useReducer } from 'react'

const TranslationContext = createContext()

const initialState = {
  originalFile: null,
  originalText: '',
  translatedText: '',
  selectedLanguage: 'en',
  documentType: 'others',
  isLoading: false,
  error: null,
  translationHistory: []
}

const translationReducer = (state, action) => {
  switch (action.type) {
    case 'SET_FILE':
      return { ...state, originalFile: action.payload, error: null }
    case 'SET_ORIGINAL_TEXT':
      return { ...state, originalText: action.payload }
    case 'SET_TRANSLATED_TEXT':
      return { ...state, translatedText: action.payload }
    case 'SET_LANGUAGE':
      return { ...state, selectedLanguage: action.payload }
    case 'SET_DOCUMENT_TYPE':
      return { ...state, documentType: action.payload }
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload }
    case 'SET_ERROR':
      return { ...state, error: action.payload, isLoading: false }
    case 'ADD_TO_HISTORY':
      return {
        ...state,
        translationHistory: [
          ...state.translationHistory,
          {
            id: Date.now(),
            originalText: state.originalText,
            translatedText: state.translatedText,
            language: state.selectedLanguage,
            documentType: state.documentType,
            timestamp: new Date().toISOString()
          }
        ]
      }
    case 'CLEAR_TRANSLATION':
      return {
        ...state,
        originalFile: null,
        originalText: '',
        translatedText: '',
        error: null
      }
    default:
      return state
  }
}

export const TranslationProvider = ({ children }) => {
  const [state, dispatch] = useReducer(translationReducer, initialState)

  const setFile = (file) => dispatch({ type: 'SET_FILE', payload: file })
  const setOriginalText = (text) => dispatch({ type: 'SET_ORIGINAL_TEXT', payload: text })
  const setTranslatedText = (text) => dispatch({ type: 'SET_TRANSLATED_TEXT', payload: text })
  const setLanguage = (language) => dispatch({ type: 'SET_LANGUAGE', payload: language })
  const setDocumentType = (type) => dispatch({ type: 'SET_DOCUMENT_TYPE', payload: type })
  const setLoading = (loading) => dispatch({ type: 'SET_LOADING', payload: loading })
  const setError = (error) => dispatch({ type: 'SET_ERROR', payload: error })
  const addToHistory = () => dispatch({ type: 'ADD_TO_HISTORY' })
  const clearTranslation = () => dispatch({ type: 'CLEAR_TRANSLATION' })

  const value = {
    ...state,
    setFile,
    setOriginalText,
    setTranslatedText,
    setLanguage,
    setDocumentType,
    setLoading,
    setError,
    addToHistory,
    clearTranslation
  }

  return (
    <TranslationContext.Provider value={value}>
      {children}
    </TranslationContext.Provider>
  )
}

export const useTranslation = () => {
  const context = useContext(TranslationContext)
  if (!context) {
    throw new Error('useTranslation must be used within a TranslationProvider')
  }
  return context
}