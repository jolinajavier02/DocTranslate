import { createWorker } from 'tesseract.js'
import * as pdfjsLib from 'pdfjs-dist'
import * as mammoth from 'mammoth'

// Configure PDF.js worker
pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`

/**
 * Extract text from various file types
 * @param {File} file - The file to extract text from
 * @returns {Promise<string>} - Extracted text
 */
export const extractTextFromFile = async (file) => {
  if (!file) {
    throw new Error('No file provided')
  }

  validateFile(file)

  const fileName = file.name.toLowerCase()
  
  try {
    if (file.type === 'application/pdf' || fileName.endsWith('.pdf')) {
      return await extractTextFromPDF(file)
    } else if (
      file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
      fileName.endsWith('.docx')
    ) {
      return await extractTextFromDOCX(file)
    } else if (file.type.startsWith('image/')) {
      return await extractTextFromImage(file)
    } else {
      throw new Error('Unsupported file type. Please upload PDF, DOCX, JPG, or PNG files.')
    }
  } catch (error) {
    throw new Error(`Failed to extract text: ${error.message}`)
  }
}

/**
 * Extract text from PDF files
 * @param {File} file - PDF file
 * @returns {Promise<string>} - Extracted text
 */
const extractTextFromPDF = async (file) => {
  const arrayBuffer = await file.arrayBuffer()
  const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise
  let fullText = ''

  for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
    const page = await pdf.getPage(pageNum)
    const textContent = await page.getTextContent()
    
    const pageText = textContent.items
      .map(item => item.str)
      .join(' ')
      .trim()
    
    if (pageText) {
      fullText += pageText + '\n\n'
    }
  }

  if (!fullText.trim()) {
    throw new Error('No text found in PDF. The document might be image-based or corrupted.')
  }

  return fullText.trim()
}

/**
 * Extract text from DOCX files
 * @param {File} file - DOCX file
 * @returns {Promise<string>} - Extracted text
 */
const extractTextFromDOCX = async (file) => {
  try {
    const arrayBuffer = await file.arrayBuffer()
    const result = await mammoth.extractRawText({ arrayBuffer })
    
    if (!result.value.trim()) {
      throw new Error('No text found in DOCX file.')
    }
    
    return result.value.trim()
  } catch (error) {
    console.error('DOCX extraction error:', error)
    throw new Error(`Failed to extract text from DOCX: ${error.message}`)
  }
}

/**
 * Extract text from image files using OCR
 * @param {File} file - Image file
 * @returns {Promise<string>} - Extracted text
 */
const extractTextFromImage = async (file) => {
  const worker = await createWorker('eng', 1, {
    logger: m => {
      if (m.status === 'recognizing text') {
        console.log(`OCR Progress: ${Math.round(m.progress * 100)}%`)
      }
    }
  })

  try {
    const { data: { text } } = await worker.recognize(file)
    
    if (!text.trim()) {
      throw new Error('No text found in image. Please ensure the image contains readable text.')
    }
    
    return text.trim()
  } finally {
    await worker.terminate()
  }
}

/**
 * Validate file before processing
 * @param {File} file - File to validate
 * @returns {boolean} - Whether file is valid
 */
export const validateFile = (file) => {
  const maxSize = 10 * 1024 * 1024 // 10MB
  const allowedTypes = [
    'application/pdf',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'image/jpeg',
    'image/jpg',
    'image/png'
  ]

  if (file.size > maxSize) {
    throw new Error('File size must be less than 10MB')
  }

  const isValidType = allowedTypes.includes(file.type) || 
    file.name.toLowerCase().endsWith('.pdf') ||
    file.name.toLowerCase().endsWith('.docx')

  if (!isValidType) {
    throw new Error('Please upload PDF, DOCX, JPG, or PNG files only')
  }

  return true
}

/**
 * Get file type information
 * @param {File} file - File to analyze
 * @returns {Object} - File type information
 */
export const getFileInfo = (file) => {
  const fileName = file.name.toLowerCase()
  let type = 'unknown'
  let icon = 'file'
  let color = 'gray'

  if (file.type === 'application/pdf' || fileName.endsWith('.pdf')) {
    type = 'PDF Document'
    icon = 'file-text'
    color = 'red'
  } else if (
    file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
    fileName.endsWith('.docx')
  ) {
    type = 'Word Document'
    icon = 'file-text'
    color = 'blue'
  } else if (file.type.startsWith('image/')) {
    type = 'Image File'
    icon = 'image'
    color = 'green'
  }

  return {
    type,
    icon,
    color,
    size: (file.size / 1024 / 1024).toFixed(2) + ' MB',
    name: file.name
  }
}