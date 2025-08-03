import React, { useState } from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import Header from './components/Header'
import UploadSection from './components/UploadSection'
import PreviewSection from './components/PreviewSection'
import Footer from './components/Footer'
import { TranslationProvider } from './context/TranslationContext'

function App() {
  const [currentView, setCurrentView] = useState('upload') // 'upload' or 'preview'

  return (
    <TranslationProvider>
      <Router>
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
          <Header />
          
          <main className="container mx-auto px-4 py-8">
            <Routes>
              <Route 
                path="/" 
                element={
                  currentView === 'upload' ? (
                    <UploadSection onTranslationComplete={() => setCurrentView('preview')} />
                  ) : (
                    <PreviewSection onBackToUpload={() => setCurrentView('upload')} />
                  )
                } 
              />
              <Route 
                path="/preview" 
                element={<PreviewSection onBackToUpload={() => setCurrentView('upload')} />} 
              />
            </Routes>
          </main>
          
          <Footer />
        </div>
      </Router>
    </TranslationProvider>
  )
}

export default App