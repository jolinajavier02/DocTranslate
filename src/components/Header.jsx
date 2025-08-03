import React from 'react'
import { Languages, FileText } from 'lucide-react'

const Header = () => {
  return (
    <header className="bg-white shadow-sm border-b border-gray-200">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="flex items-center justify-center w-10 h-10 bg-primary-600 rounded-lg">
              <Languages className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">DocTranslate</h1>
              <p className="text-sm text-gray-600">Professional Document Translation</p>
            </div>
          </div>
          
          <div className="hidden md:flex items-center space-x-6">
            <div className="flex items-center space-x-2 text-gray-600">
              <FileText className="w-5 h-5" />
              <span className="text-sm font-medium">Supports PDF, DOCX, JPG, PNG</span>
            </div>
            <div className="flex items-center space-x-2 text-gray-600">
              <Languages className="w-5 h-5" />
              <span className="text-sm font-medium">50+ Languages</span>
            </div>
          </div>
        </div>
      </div>
    </header>
  )
}

export default Header