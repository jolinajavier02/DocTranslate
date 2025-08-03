import React from 'react'
import { Heart, Globe, Shield, Zap } from 'lucide-react'

const Footer = () => {
  return (
    <footer className="bg-gray-900 text-white mt-16">
      <div className="container mx-auto px-4 py-12">
        {/* Features Section */}
        <div className="grid md:grid-cols-4 gap-8 mb-8">
          <div className="text-center">
            <div className="flex items-center justify-center w-12 h-12 bg-primary-600 rounded-lg mx-auto mb-4">
              <Zap className="w-6 h-6" />
            </div>
            <h3 className="font-semibold mb-2">Lightning Fast</h3>
            <p className="text-sm text-gray-400">
              Get your documents translated in seconds with our advanced AI technology.
            </p>
          </div>
          
          <div className="text-center">
            <div className="flex items-center justify-center w-12 h-12 bg-primary-600 rounded-lg mx-auto mb-4">
              <Globe className="w-6 h-6" />
            </div>
            <h3 className="font-semibold mb-2">50+ Languages</h3>
            <p className="text-sm text-gray-400">
              Support for major world languages with high accuracy translations.
            </p>
          </div>
          
          <div className="text-center">
            <div className="flex items-center justify-center w-12 h-12 bg-primary-600 rounded-lg mx-auto mb-4">
              <Shield className="w-6 h-6" />
            </div>
            <h3 className="font-semibold mb-2">Secure & Private</h3>
            <p className="text-sm text-gray-400">
              Your documents are processed securely and deleted after translation.
            </p>
          </div>
          
          <div className="text-center">
            <div className="flex items-center justify-center w-12 h-12 bg-primary-600 rounded-lg mx-auto mb-4">
              <Heart className="w-6 h-6" />
            </div>
            <h3 className="font-semibold mb-2">Easy to Use</h3>
            <p className="text-sm text-gray-400">
              Simple drag-and-drop interface with instant preview and download.
            </p>
          </div>
        </div>
        
        {/* Divider */}
        <div className="border-t border-gray-800 pt-8">
          <div className="flex flex-col md:flex-row items-center justify-between">
            <div className="flex items-center space-x-3 mb-4 md:mb-0">
              <div className="flex items-center justify-center w-8 h-8 bg-primary-600 rounded">
                <Globe className="w-5 h-5" />
              </div>
              <div>
                <div className="font-bold text-lg">DocTranslate</div>
                <div className="text-xs text-gray-400">Professional Document Translation</div>
              </div>
            </div>
            
            <div className="flex items-center space-x-6 text-sm text-gray-400">
              <a href="#" className="hover:text-white transition-colors">Privacy Policy</a>
              <a href="#" className="hover:text-white transition-colors">Terms of Service</a>
              <a href="#" className="hover:text-white transition-colors">Support</a>
            </div>
          </div>
          
          <div className="mt-6 pt-6 border-t border-gray-800 text-center text-sm text-gray-400">
            <p>
              © 2024 DocTranslate. Made with{' '}
              <Heart className="w-4 h-4 inline text-red-500" />{' '}
              for seamless document translation.
            </p>
          </div>
        </div>
      </div>
    </footer>
  )
}

export default Footer